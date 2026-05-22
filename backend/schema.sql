-- ============================================
-- Leave Management System - Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS leave_management;
USE leave_management;

-- =====================
-- Table: users
-- =====================
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(20)  DEFAULT NULL UNIQUE,          -- e.g. EMP-2025-0001 (null for managers)
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,                      -- bcrypt hashed
  role        ENUM('employee', 'manager') NOT NULL DEFAULT 'employee',
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,            -- 0 = soft-deleted
  created_by  INT          DEFAULT NULL,                  -- manager who added this employee
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================
-- Table: leaves
-- =====================
CREATE TABLE IF NOT EXISTS leaves (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT  NOT NULL,
  type            ENUM('Annual', 'Sick', 'Casual', 'Maternity', 'Paternity', 'Unpaid', 'Other') NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  reason          TEXT NOT NULL,
  status          ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
  manager_comment TEXT         DEFAULT NULL,
  approved_by     INT          DEFAULT NULL,              -- manager who processed this leave
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);
