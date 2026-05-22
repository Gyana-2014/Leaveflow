/**
 * Database Seeder — Run: node seed.js
 * Creates tables (if missing), then upserts the manager + 3 sample employees.
 */

const bcrypt = require('bcryptjs');
const db = require('./config/db');
require('dotenv').config();

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // ── Create users table ──────────────────────────────────────────────────
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(20)  DEFAULT NULL UNIQUE,
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(150) NOT NULL UNIQUE,
        password    VARCHAR(255) NOT NULL,
        role        ENUM('employee', 'manager') NOT NULL DEFAULT 'employee',
        is_active   TINYINT(1)   NOT NULL DEFAULT 1,
        created_by  INT          DEFAULT NULL,
        created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Table "users" ready');

    // ── Create leaves table ─────────────────────────────────────────────────
    await db.query(`
      CREATE TABLE IF NOT EXISTS leaves (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         INT  NOT NULL,
        type            ENUM('Annual','Sick','Casual','Maternity','Paternity','Unpaid','Other') NOT NULL,
        start_date      DATE NOT NULL,
        end_date        DATE NOT NULL,
        reason          TEXT NOT NULL,
        status          ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
        manager_comment TEXT      DEFAULT NULL,
        approved_by     INT       DEFAULT NULL,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Table "leaves" ready\n');

    // ── Alter existing tables to add new columns if upgrading ───────────────
    const alterStatements = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(20) DEFAULT NULL UNIQUE",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active   TINYINT(1)  NOT NULL DEFAULT 1",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by  INT         DEFAULT NULL",
      "ALTER TABLE leaves ADD COLUMN IF NOT EXISTS approved_by INT         DEFAULT NULL",
    ];
    for (const sql of alterStatements) {
      try { await db.query(sql); } catch (_) { /* column already exists — safe to ignore */ }
    }
    console.log('✅ Schema migration applied\n');

    // ── Seed manager ────────────────────────────────────────────────────────
    const managerHash = await bcrypt.hash('manager123', 10);
    await db.query(
      `INSERT INTO users (name, email, password, role, is_active)
       VALUES (?, ?, ?, 'manager', 1)
       ON DUPLICATE KEY UPDATE name = VALUES(name), password = VALUES(password), is_active = 1`,
      ['Sarah Manager', 'manager@company.com', managerHash]
    );
    console.log('👔 Manager  → manager@company.com  / manager123');

    // Get manager ID for created_by
    const [mgr] = await db.query("SELECT id FROM users WHERE email = 'manager@company.com'");
    const managerId = mgr[0].id;

    // ── Seed sample employees ────────────────────────────────────────────────
    const year = new Date().getFullYear();
    const employees = [
      { name: 'John Employee',  email: 'employee@company.com',  password: 'employee123', emp_id: `EMP-${year}-0001` },
      { name: 'Priya Sharma',   email: 'priya@company.com',     password: 'employee123', emp_id: `EMP-${year}-0002` },
      { name: 'Rahul Verma',    email: 'rahul@company.com',     password: 'employee123', emp_id: `EMP-${year}-0003` },
    ];

    for (const emp of employees) {
      const hash = await bcrypt.hash(emp.password, 10);
      await db.query(
        `INSERT INTO users (employee_id, name, email, password, role, is_active, created_by)
         VALUES (?, ?, ?, ?, 'employee', 1, ?)
         ON DUPLICATE KEY UPDATE
           employee_id = VALUES(employee_id),
           name        = VALUES(name),
           password    = VALUES(password),
           is_active   = 1,
           created_by  = VALUES(created_by)`,
        [emp.emp_id, emp.name, emp.email, hash, managerId]
      );
      console.log(`👤 Employee → ${emp.email} / ${emp.password}  [${emp.emp_id}]`);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Manager  → manager@company.com  / manager123');
    console.log('   Employee → employee@company.com / employee123');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err);
  } finally {
    process.exit(0);
  }
}

seed();
