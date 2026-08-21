/**
 * SmartTable AI – Database Access Layer (MySQL)
 *
 * This is the ONLY file that touches the MySQL database directly.
 * Controllers, services and tests must import only:
 *   { queryAll, queryGet, queryRun, initDb, getDbStatus }
 *
 * Configuration is read from src/config/database.js
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { DB_CONFIG } from '../src/config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, 'schema.mysql.sql');

// ─── Internal State ──────────────────────────────────────────────────────────

/** @type {mysql.Pool|null} */
let pool = null;
let _isInitialized = false;
let _initPromise = null;

// ─── Connection Status (for health check) ────────────────────────────────────

const _status = {
  connected: false,
  type: DB_CONFIG.type,
  error: null
};

export const getDbStatus = () => ({
  connected: _status.connected,
  type: _status.type,
  error: _status.connected ? null : (_status.error || 'Database not initialized')
});

// ─── Initialization ───────────────────────────────────────────────────────────

export const initDb = (force = false) => {
  if (_isInitialized && !force) return Promise.resolve();
  if (_initPromise && !force) return _initPromise;

  _initPromise = _performInit();
  return _initPromise;
};

const _performInit = async () => {
  try {
    // Connect without database first to ensure it exists
    const setupConnection = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password
    });

    await setupConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
    await setupConnection.end();

    // Now create the pool with the database selected
    pool = mysql.createPool({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      database: DB_CONFIG.database,
      connectionLimit: DB_CONFIG.connectionLimit,
      multipleStatements: true // Required for running schema and transactions
    });

    // Test connection
    const connection = await pool.getConnection();
    
    // Apply schema
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);
    
    connection.release();

    _status.connected = true;
    _status.error = null;
    _isInitialized = true;
    console.log(`✅ Connected to MySQL database: ${DB_CONFIG.database} on ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  } catch (err) {
    _status.connected = false;
    _status.error = err.message;
    console.error('❌ Failed to initialize MySQL database:', err.message);
    throw err;
  }
};

/**
 * Returns the raw connection pool.
 */
export const getDb = async () => {
  await initDb();
  return pool;
};

// ─── Query Helpers ────────────────────────────────────────────────────────────

/**
 * Execute a SELECT query and return ALL matching rows.
 * @param {string} sql - Parameterized SQL with ? placeholders
 * @param {Array}  params - Bound parameters
 * @returns {Promise<Array>}
 */
export const queryAll = async (sql, params = []) => {
  await initDb();
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (err) {
    console.error('DB queryAll error:', err.message, '\n  SQL:', sql);
    throw err;
  }
};

/**
 * Execute a SELECT query and return the FIRST matching row (or undefined).
 * @param {string} sql
 * @param {Array}  params
 * @returns {Promise<object|undefined>}
 */
export const queryGet = async (sql, params = []) => {
  await initDb();
  try {
    const [rows] = await pool.query(sql, params);
    return rows.length > 0 ? rows[0] : undefined;
  } catch (err) {
    console.error('DB queryGet error:', err.message, '\n  SQL:', sql);
    throw err;
  }
};

/**
 * Execute an INSERT / UPDATE / DELETE statement.
 * @param {string} sql
 * @param {Array}  params
 * @returns {Promise<{ insertId: number, affectedRows: number, lastID: number, changes: number }>}
 */
export const queryRun = async (sql, params = []) => {
  await initDb();
  
  // Silently skip SQLite-only commands (e.g. PRAGMA)
  const upperSql = sql.trim().toUpperCase();
  if (upperSql.startsWith('PRAGMA ')) {
    return { insertId: 0, affectedRows: 0, lastID: 0, changes: 0 };
  }

  try {
    const [result] = await pool.query(sql, params);
    
    // Some result objects (like from SET) don't have insertId/affectedRows
    const insertId = result?.insertId || 0;
    const affectedRows = result?.affectedRows || 0;
    
    return {
      insertId: insertId,
      affectedRows: affectedRows,
      // Provide aliases for backwards compatibility with sqlite3's API
      lastID: insertId,
      changes: affectedRows
    };
  } catch (err) {
    console.error('DB queryRun error:', err.message, '\n  SQL:', sql);
    throw err;
  }
};

/**
 * Run multiple statements as a single atomic transaction.
 * @param {Array<{ sql: string, params: Array }>} operations
 * @returns {Promise<void>}
 */
export const queryTransaction = async (operations) => {
  await initDb();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    for (const op of operations) {
      await connection.query(op.sql, op.params || []);
    }
    
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

// Start initialization on module import
initDb().catch(err => {
  console.error('❌ Database initialization failed at startup:', err.message);
  // Don't kill the process, allow retry on next request
});
