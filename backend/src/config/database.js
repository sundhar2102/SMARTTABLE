/**
 * SmartTable AI – Centralized Database Configuration
 *
 * Single source of truth for database selection and path.
 * All database access goes through backend/database/db.js which reads this config.
 *
 * Environment variables:
 *   DB_PATH   – Absolute or relative path to the SQLite database file.
 *               Defaults to ./database/smarttable.db (relative to the backend directory).
 *   NODE_ENV  – 'development' | 'test' | 'production'
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export const DB_CONFIG = {
  type: 'MySQL',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smarttable',
  connectionLimit: 10
};
