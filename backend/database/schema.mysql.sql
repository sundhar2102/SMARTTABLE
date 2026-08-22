-- SmartTable AI – MySQL Database Schema
-- Run this to initialize the database in MySQL.

SET FOREIGN_KEY_CHECKS = 0;

-- 
-- Tables will be created if they do not exist.
-- To drop tables, use the seed script.


-- 1. Restaurants
CREATE TABLE IF NOT EXISTS `restaurants` (
    `id`               VARCHAR(255) PRIMARY KEY,
    `name`             VARCHAR(255) NOT NULL,
    `tagline`          VARCHAR(255),
    `cuisine`          VARCHAR(255) NOT NULL,
    `price_range`      VARCHAR(50) DEFAULT '₹₹',
    `price_level`      INT DEFAULT 2,
    `rating`           DECIMAL(3, 2) DEFAULT 4.50,
    `reviews_count`    INT DEFAULT 100,
    `location`         VARCHAR(255) NOT NULL,
    `city`             VARCHAR(100) DEFAULT 'Chennai',
    `distance_km`      DECIMAL(8, 2) DEFAULT 1.0,
    `lat`              DECIMAL(10, 8),
    `lng`              DECIMAL(11, 8),
    `phone_number`     VARCHAR(50),
    `hours_json`       JSON,
    `google_maps_url`  TEXT,
    `image`            TEXT,
    `crowd_level`      VARCHAR(50) DEFAULT 'medium',
    `wait_estimate`    VARCHAR(50) DEFAULT '10-15 min',
    `parties_in_queue` INT DEFAULT 0,
    `opening_hours`    VARCHAR(255),
    `ai_walk_in_prob`  INT DEFAULT 50,
    `sections_json`    JSON,
    `hourly_crowd_json` JSON,
    `delivery_time_min` INT DEFAULT 25,
    `min_order`        DECIMAL(10, 2) DEFAULT 150.00,
    `delivery_fee_base` DECIMAL(10, 2) DEFAULT 29.00,
    `is_accepting_orders` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Restaurant Tables Layout
CREATE TABLE IF NOT EXISTS `tables` (
    `id`               VARCHAR(255) NOT NULL,
    `restaurant_id`    VARCHAR(255) NOT NULL,
    `name`             VARCHAR(100) NOT NULL,
    `capacity`         INT NOT NULL,
    `section`          VARCHAR(100) NOT NULL,
    `status`           VARCHAR(50) DEFAULT 'available',
    `mins_remaining`   INT,
    `shape`            VARCHAR(50) DEFAULT 'rect',
    `x_pos`            DECIMAL(10, 2),
    `y_pos`            DECIMAL(10, 2),
    `reservation_name` VARCHAR(255),
    `occupied_at`      TIMESTAMP NULL DEFAULT NULL,
    `expected_available_at` TIMESTAMP NULL DEFAULT NULL,
    `cleaning_started_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`, `restaurant_id`),
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE,
    INDEX `idx_tables_restaurant` (`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Menu Items
CREATE TABLE IF NOT EXISTS `menu_items` (
    `id`            VARCHAR(255) PRIMARY KEY,
    `restaurant_id` VARCHAR(255) NOT NULL,
    `category`      VARCHAR(100) NOT NULL,
    `name`          VARCHAR(255) NOT NULL,
    `price`         DECIMAL(10, 2) NOT NULL,
    `description`   TEXT,
    `tags_json`     JSON,
    `is_available`  TINYINT(1) DEFAULT 1,
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE,
    INDEX `idx_menu_items_restaurant` (`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Orders (Delivery, Takeaway, Dine-In)
CREATE TABLE IF NOT EXISTS `orders` (
    `id`                   VARCHAR(255) PRIMARY KEY,
    `restaurant_id`        VARCHAR(255) NOT NULL,
    `restaurant_name`      VARCHAR(255) NOT NULL,
    `fulfillment_type`     VARCHAR(50) NOT NULL DEFAULT 'delivery',
    `user_id`              VARCHAR(255),
    `booking_id`           VARCHAR(255),
    `table_id`             VARCHAR(255),
    `table_name`           VARCHAR(100),
    `guest_name`           VARCHAR(255) NOT NULL,
    `guest_email`          VARCHAR(255) NOT NULL,
    `guest_phone`          VARCHAR(50),
    `party_size`           INT DEFAULT 1,
    `reservation_date`     DATE,
    `reservation_time`     TIME,
    `status`               VARCHAR(50) DEFAULT 'Confirmed',
    `order_status`         VARCHAR(50) DEFAULT 'Pending Acceptance',
    `delivery_address`     TEXT,
    `delivery_locality`    VARCHAR(255),
    `delivery_distance_km` DECIMAL(8, 2),
    `delivery_eta_mins`    INT,
    `delivery_fee`         DECIMAL(10, 2) DEFAULT 0.00,
    `tip_amount`           DECIMAL(10, 2) DEFAULT 0.00,
    `surge_fee`            DECIMAL(10, 2) DEFAULT 0.00,
    `item_total`           DECIMAL(10, 2) NOT NULL,
    `grand_total`          DECIMAL(10, 2) NOT NULL,
    `delivery_otp`         VARCHAR(10),
    `pickup_pin`           VARCHAR(10),
    `rider_id`             VARCHAR(255),
    `rider_name`           VARCHAR(255),
    `rider_phone`          VARCHAR(50),
    `rider_vehicle`        VARCHAR(100),
    `special_requests`     TEXT,
    `pre_ordered_items_json` JSON NOT NULL,
    `qr_code`              TEXT NOT NULL,
    `created_at`           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE,
    INDEX `idx_orders_restaurant` (`restaurant_id`),
    INDEX `idx_orders_user` (`user_id`),
    INDEX `idx_orders_email` (`guest_email`),
    INDEX `idx_orders_booking` (`booking_id`),
    INDEX `idx_orders_restaurant_table` (`restaurant_id`, `table_id`),
    INDEX `idx_orders_status` (`status`),
    INDEX `idx_orders_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Reservations
CREATE TABLE IF NOT EXISTS `reservations` (
    `id`                     VARCHAR(255) PRIMARY KEY,
    `restaurant_id`          VARCHAR(255) NOT NULL,
    `restaurant_name`        VARCHAR(255) NOT NULL,
    `table_id`               VARCHAR(255),
    `table_name`             VARCHAR(100),
    `guest_name`             VARCHAR(255) NOT NULL,
    `user_id`                VARCHAR(255),
    `guest_email`            VARCHAR(255) NOT NULL,
    `guest_phone`            VARCHAR(50),
    `party_size`             INT NOT NULL,
    `reservation_date`       DATE,
    `reservation_time`       TIME,
    `status`                 VARCHAR(50) DEFAULT 'Confirmed',
    `order_status`           VARCHAR(50) DEFAULT 'Received',
    `special_requests`       TEXT,
    `pre_ordered_items_json` JSON,
    `qr_code`                TEXT NOT NULL,
    `created_at`             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE,
    INDEX `idx_reservations_restaurant` (`restaurant_id`),
    INDEX `idx_reservations_user` (`user_id`),
    INDEX `idx_reservations_email` (`guest_email`),
    INDEX `idx_reservations_conflict` (`restaurant_id`, `reservation_date`, `status`),
    INDEX `idx_reservations_created` (`created_at`),
    INDEX `idx_reservations_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Delivery Riders
CREATE TABLE IF NOT EXISTS `riders` (
    `id`                VARCHAR(255) PRIMARY KEY,
    `name`              VARCHAR(255) NOT NULL,
    `phone`             VARCHAR(50) NOT NULL,
    `photo`             TEXT,
    `vehicle`           VARCHAR(100) NOT NULL,
    `rating`            DECIMAL(3, 2) DEFAULT 4.90,
    `trips_completed`   INT DEFAULT 0,
    `today_earnings`    DECIMAL(10, 2) DEFAULT 0.00,
    `today_trips`       INT DEFAULT 0,
    `status`            VARCHAR(50) DEFAULT 'available',
    `current_order_id`  VARCHAR(255),
    `cluster_zone`      VARCHAR(100) DEFAULT 'Anna Nagar',
    `lat`               DECIMAL(10, 8),
    `lng`               DECIMAL(11, 8),
    `battery_level`     VARCHAR(50),
    `shift_start_time`  DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Users
CREATE TABLE IF NOT EXISTS `users` (
    `id`            VARCHAR(255) PRIMARY KEY,
    `name`          VARCHAR(255) NOT NULL,
    `email`         VARCHAR(255) UNIQUE NOT NULL,
    `role`          VARCHAR(50) NOT NULL,
    `password_hash` TEXT,
    `restaurant_id` VARCHAR(255),
    `otp`           VARCHAR(10),
    `otp_expires_at` DATETIME,
    `is_verified`   TINYINT(1) DEFAULT 0,
    `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE SET NULL,
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Marketplace Settings
CREATE TABLE IF NOT EXISTS `marketplace_settings` (
    `key`        VARCHAR(255) PRIMARY KEY,
    `value_json` JSON NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
