-- SmartTable AI – SQLite Database Schema
-- Canonical schema for the SQLite runtime database.
-- MySQL syntax note: ENGINE=InnoDB, CHARSET, COLLATE, INDEX declarations
--   are NOT valid SQLite and must not appear here.
-- Foreign key enforcement requires: PRAGMA foreign_keys = ON

-- 1. Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
    id               TEXT PRIMARY KEY,
    name             TEXT NOT NULL,
    tagline          TEXT,
    cuisine          TEXT NOT NULL,
    price_range      TEXT DEFAULT '₹₹',
    price_level      INTEGER DEFAULT 2,
    rating           REAL DEFAULT 4.50,
    reviews_count    INTEGER DEFAULT 100,
    location         TEXT NOT NULL,
    city             TEXT DEFAULT 'Chennai',
    distance_km      REAL DEFAULT 1.0,
    lat              REAL,
    lng              REAL,
    phone_number     TEXT,
    hours_json       TEXT,
    google_maps_url  TEXT,
    image            TEXT,
    crowd_level      TEXT DEFAULT 'medium',
    wait_estimate    TEXT DEFAULT '10-15 min',
    parties_in_queue INTEGER DEFAULT 0,
    opening_hours    TEXT,
    ai_walk_in_prob  INTEGER DEFAULT 50,
    sections_json    TEXT,
    hourly_crowd_json TEXT,
    delivery_time_min INTEGER DEFAULT 25,
    min_order        REAL DEFAULT 150.00,
    delivery_fee_base REAL DEFAULT 29.00,
    is_accepting_orders INTEGER DEFAULT 1
);

-- 2. Restaurant Tables Layout
CREATE TABLE IF NOT EXISTS tables (
    id               TEXT NOT NULL,
    restaurant_id    TEXT NOT NULL,
    name             TEXT NOT NULL,
    capacity         INTEGER NOT NULL,
    section          TEXT NOT NULL,
    status           TEXT DEFAULT 'available',
    mins_remaining   INTEGER,
    shape            TEXT DEFAULT 'rect',
    x_pos            REAL,
    y_pos            REAL,
    reservation_name TEXT,
    PRIMARY KEY (id, restaurant_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- 3. Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id            TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL,
    category      TEXT NOT NULL,
    name          TEXT NOT NULL,
    price         REAL NOT NULL,
    description   TEXT,
    tags_json     TEXT,
    is_available  INTEGER DEFAULT 1,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- 4. Orders (Delivery, Takeaway, Dine-In)
CREATE TABLE IF NOT EXISTS orders (
    id                   TEXT PRIMARY KEY,
    restaurant_id        TEXT NOT NULL,
    restaurant_name      TEXT NOT NULL,
    fulfillment_type     TEXT NOT NULL DEFAULT 'delivery',
    user_id              TEXT,
    booking_id           TEXT,
    table_id             TEXT,
    table_name           TEXT,
    guest_name           TEXT NOT NULL,
    guest_email          TEXT NOT NULL,
    guest_phone          TEXT,
    party_size           INTEGER DEFAULT 1,
    reservation_date     TEXT,
    reservation_time     TEXT,
    status               TEXT DEFAULT 'Confirmed',
    order_status         TEXT DEFAULT 'Pending Acceptance',
    delivery_address     TEXT,
    delivery_locality    TEXT,
    delivery_distance_km REAL,
    delivery_eta_mins    INTEGER,
    delivery_fee         REAL DEFAULT 0.00,
    tip_amount           REAL DEFAULT 0.00,
    surge_fee            REAL DEFAULT 0.00,
    item_total           REAL NOT NULL,
    grand_total          REAL NOT NULL,
    delivery_otp         TEXT,
    pickup_pin           TEXT,
    rider_id             TEXT,
    rider_name           TEXT,
    rider_phone          TEXT,
    rider_vehicle        TEXT,
    special_requests     TEXT,
    pre_ordered_items_json TEXT NOT NULL,
    qr_code              TEXT NOT NULL,
    created_at           TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- 5. Reservations
CREATE TABLE IF NOT EXISTS reservations (
    id                     TEXT PRIMARY KEY,
    restaurant_id          TEXT NOT NULL,
    restaurant_name        TEXT NOT NULL,
    table_id               TEXT,
    table_name             TEXT,
    guest_name             TEXT NOT NULL,
    user_id                TEXT,
    guest_email            TEXT NOT NULL,
    guest_phone            TEXT,
    party_size             INTEGER NOT NULL,
    reservation_date       TEXT NOT NULL,
    reservation_time       TEXT NOT NULL,
    status                 TEXT DEFAULT 'Confirmed',
    order_status           TEXT DEFAULT 'Received',
    special_requests       TEXT,
    pre_ordered_items_json TEXT,
    qr_code                TEXT NOT NULL,
    created_at             TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- 6. Delivery Riders
CREATE TABLE IF NOT EXISTS riders (
    id                TEXT PRIMARY KEY,
    name              TEXT NOT NULL,
    phone             TEXT NOT NULL,
    photo             TEXT,
    vehicle           TEXT NOT NULL,
    rating            REAL DEFAULT 4.90,
    trips_completed   INTEGER DEFAULT 0,
    today_earnings    REAL DEFAULT 0.00,
    today_trips       INTEGER DEFAULT 0,
    status            TEXT DEFAULT 'available',
    current_order_id  TEXT,
    cluster_zone      TEXT DEFAULT 'Anna Nagar',
    lat               REAL,
    lng               REAL,
    battery_level     TEXT,
    shift_start_time  TEXT
);

-- 7. Users
CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    role          TEXT NOT NULL,
    password_hash TEXT,
    restaurant_id TEXT,
    otp           TEXT,
    otp_expires_at TEXT,
    is_verified   INTEGER DEFAULT 0,
    created_at    TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL
);

-- 8. Marketplace Settings
CREATE TABLE IF NOT EXISTS marketplace_settings (
    key        TEXT PRIMARY KEY,
    value_json TEXT NOT NULL
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tables_restaurant        ON tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant    ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant        ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_user              ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status            ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at        ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant  ON reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user        ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status      ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_users_email              ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role               ON users(role);
