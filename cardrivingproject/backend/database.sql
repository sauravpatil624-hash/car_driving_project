-- ============================================================
-- DrivePro MySQL Setup Script
-- Run this in phpMyAdmin (SQL tab) or MySQL CLI
-- ============================================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS drivepro_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE drivepro_db;

-- 2. Users tablexxxxxx
CREATE TABLE IF NOT EXISTS users (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  password   VARCHAR(255) NOT NULL,   -- stores bcrypt hash (always 60 chars)
  mobile     VARCHAR(15)  DEFAULT NULL,
  role       ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Seed an admin account
--    Password: saurav123 | bcrypt hash (cost=12) generated via PHP password_hash()
--
--    ⚠️  FRESH INSTALL — inserts admin if no row with this email exists:
INSERT IGNORE INTO users (name, email, password, mobile, role)
VALUES (
  'Saurav',
  'saurav123@gmail.com',
  '$2y$12$YourBcryptHashHere',   -- run update_admin.php to set the real hash
  '9999999999',
  'admin'
);

-- ⚠️  EXISTING DATABASE — update old admin credentials:
-- UPDATE users
--   SET name     = 'Saurav',
--       email    = 'saurav123@gmail.com',
--       password = '$2y$12$YourBcryptHashHere',
--       role     = 'admin'
-- WHERE role = 'admin'
-- LIMIT 1;
--
-- 👉 Easiest way: just visit http://localhost/cardrivingproject/backend/update_admin.php
--    (it auto-generates the correct hash and runs the UPDATE/INSERT for you)

-- 4. Applications table (stores student training applications)
CREATE TABLE IF NOT EXISTS applications (
  id             VARCHAR(20)   NOT NULL,
  user_id        INT           NOT NULL,
  user_name      VARCHAR(100)  NOT NULL,
  user_email     VARCHAR(150)  NOT NULL,
  full_name      VARCHAR(100)  NOT NULL,
  gender         ENUM('Male','Female','Other') NOT NULL,
  age            TINYINT       NOT NULL,
  package        ENUM('Basic','Standard','Premium') NOT NULL,
  total_amount   INT           NOT NULL,
  amount_paid    INT           NOT NULL DEFAULT 0,
  payment_status ENUM('Pending','Partial','Completed') NOT NULL DEFAULT 'Pending',
  status         ENUM('Pending','Approved','Cancelled') NOT NULL DEFAULT 'Pending',
  training_time  VARCHAR(50)   DEFAULT NULL,
  start_date     DATE          DEFAULT NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
  id         INT          NOT NULL AUTO_INCREMENT,
  full_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  mobile     VARCHAR(15)  NOT NULL,
  message    TEXT         NOT NULL,
  type       ENUM('enquiry','contact') NOT NULL DEFAULT 'enquiry',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
