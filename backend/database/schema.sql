-- SmartTable AI Database Schema (MySQL)
-- Multi-Sided On-Demand Hyperlocal Marketplace & Aggregator Platform

-- 1. Restaurants / Dining & Cloud Kitchen Entities
CREATE TABLE IF NOT EXISTS restaurants (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tagline TEXT,
    cuisine VARCHAR(255) NOT NULL,
    price_range VARCHAR(50) DEFAULT '₹₹',
    price_level INT DEFAULT 2,
    rating DECIMAL(3,2) DEFAULT 4.50,
    reviews_count INT DEFAULT 100,
    location TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Chennai',
    distance_km DOUBLE DEFAULT 1.0,
    lat DOUBLE,
    lng DOUBLE,
    phone_number VARCHAR(50),
    hours_json TEXT,
    google_maps_url TEXT,
    image TEXT,
    crowd_level VARCHAR(50) DEFAULT 'medium',
    wait_estimate VARCHAR(50) DEFAULT '10-15 min',
    parties_in_queue INT DEFAULT 0,
    opening_hours TEXT,
    ai_walk_in_prob INT DEFAULT 50,
    sections_json TEXT,
    hourly_crowd_json TEXT,
    delivery_time_min INT DEFAULT 25,
    min_order DECIMAL(10,2) DEFAULT 150.00,
    delivery_fee_base DECIMAL(10,2) DEFAULT 29.00,
    is_accepting_orders TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Restaurant Tables Layout
CREATE TABLE IF NOT EXISTS `tables` (
    id VARCHAR(100) NOT NULL,
    restaurant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    section VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'available', -- available, occupied, reserved, cleaning
    mins_remaining INT,
    shape VARCHAR(50) DEFAULT 'rect',
    x_pos DOUBLE,
    y_pos DOUBLE,
    reservation_name VARCHAR(255),
    PRIMARY KEY (id, restaurant_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant_id (restaurant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Digital Menus & Inventory Stock Control
CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(100) PRIMARY KEY,
    restaurant_id VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    tags_json TEXT,
    is_available TINYINT(1) DEFAULT 1, -- 1: in-stock, 0: 86'd / out of stock
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant_id (restaurant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Unified Orders & Multi-Service Fulfillment (Delivery, Takeaway, Dine-In)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(100) PRIMARY KEY,
    restaurant_id VARCHAR(100) NOT NULL,
    restaurant_name VARCHAR(255) NOT NULL,
    fulfillment_type VARCHAR(50) NOT NULL DEFAULT 'delivery',
    user_id VARCHAR(100),
    booking_id VARCHAR(100),
    table_id VARCHAR(100),
    table_name VARCHAR(100),
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    party_size INT DEFAULT 1,
    reservation_date VARCHAR(50),
    reservation_time VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Confirmed',
    order_status VARCHAR(50) DEFAULT 'Pending Acceptance',
    delivery_address TEXT,
    delivery_locality VARCHAR(255),
    delivery_distance_km DOUBLE,
    delivery_eta_mins INT,
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    tip_amount DECIMAL(10,2) DEFAULT 0.00,
    surge_fee DECIMAL(10,2) DEFAULT 0.00,
    item_total DECIMAL(10,2) NOT NULL,
    grand_total DECIMAL(10,2) NOT NULL,
    delivery_otp VARCHAR(20),
    pickup_pin VARCHAR(20),
    rider_id VARCHAR(100),
    rider_name VARCHAR(255),
    rider_phone VARCHAR(50),
    rider_vehicle VARCHAR(100),
    special_requests TEXT,
    pre_ordered_items_json TEXT NOT NULL,
    qr_code TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant_id (restaurant_id),
    INDEX idx_rider_id (rider_id),
    INDEX idx_status (status),
    INDEX idx_order_status (order_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Backward compatibility alias view for reservations
CREATE TABLE IF NOT EXISTS reservations (
    id VARCHAR(100) PRIMARY KEY,
    restaurant_id VARCHAR(100) NOT NULL,
    restaurant_name VARCHAR(255) NOT NULL,
    table_id VARCHAR(100),
    table_name VARCHAR(100),
    guest_name VARCHAR(255) NOT NULL,
    user_id VARCHAR(100),
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    party_size INT NOT NULL,
    reservation_date VARCHAR(50) NOT NULL,
    reservation_time VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed',
    order_status VARCHAR(50) DEFAULT 'Received',
    special_requests TEXT,
    pre_ordered_items_json TEXT,
    qr_code TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant_id (restaurant_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Delivery Fleet Partners / Riders
CREATE TABLE IF NOT EXISTS riders (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    photo TEXT,
    vehicle VARCHAR(100) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 4.90,
    trips_completed INT DEFAULT 0,
    today_earnings DECIMAL(10,2) DEFAULT 0.00,
    today_trips INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'available',
    current_order_id VARCHAR(100),
    cluster_zone VARCHAR(100) DEFAULT 'Anna Nagar',
    lat DOUBLE,
    lng DOUBLE,
    battery_level VARCHAR(50),
    shift_start_time VARCHAR(50),
    INDEX idx_status (status),
    INDEX idx_current_order_id (current_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. User Accounts (Customer, Admin, Rider, Platform Admin)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255),
    restaurant_id VARCHAR(100),
    otp VARCHAR(6),
    otp_expires_at TIMESTAMP NULL DEFAULT NULL,
    is_verified TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Hyperlocal Marketplace Global Settings
CREATE TABLE IF NOT EXISTS marketplace_settings (
    `key` VARCHAR(100) PRIMARY KEY,
    value_json TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
