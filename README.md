# 🗓️ LeaveFlow — Leave Management System (Upgraded)

A production-grade Leave Management System built with **Node.js**, **Express**, **MySQL**, and **React (Vite)**.

---

## 🏗️ Architecture

```
backend/
├── config/           # DB pool, email config
├── middleware/        # JWT auth, role guard, error handler
├── utils/            # asyncHandler, generateEmployeeId
├── repositories/     # Raw DB queries (userRepository, leaveRepository)
├── services/         # Business logic (authService, employeeService, leaveService)
├── controllers/      # Req/res handlers
├── routes/           # Route definitions only
├── schema.sql        # Full DB schema
├── seed.js           # Database seeder
└── server.js         # App entry point

frontend/
└── src/
    ├── pages/        # LoginPage, EmployeeDashboard, ManagerDashboard
    ├── components/   # Layout
    └── utils/        # AuthContext, api.js (with leaveAPI, employeeAPI, authAPI)
```

**Request Flow:** Route → Controller → Service → Repository → DB

---

## 🚀 Setup

### 1. Database
```bash
mysql -u root -p < backend/schema.sql
DB_Password root@1234
```

### 2. Backend
```bash
cd backend
cp .env.example .env        # fill in your DB credentials + JWT_SECRET
npm install
npm run seed                # creates tables + seeds users
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Credentials (after seed)

| Role     | Email                    | Password     |
|----------|--------------------------|--------------|
| Manager  | manager@company.com      | manager123   |
| Employee | employee@company.com     | employee123  |
| Employee | priya@company.com        | employee123  |
| Employee | rahul@company.com        | employee123  |

---
+----+---------------+------------------------+------------ +----------+---------------------+
| id | name          | email                  | password    | role     | created at          |
+----+---------------+------------------------+-------------+----------+---------------------+
|  1 | Sarah Manager | manager@company.com    | manager123  | manager  | 2026-04-09 15:09:26 |
|  2 | Employee      | employee@company.com   | employee123 | employee | 2026-04-09 15:09:26 |
|  3 | Employee 1    | employee1@company.com  | password123 | employee | 2026-04-09 20:32:17 |
|  4 | Employee 2    | employee2@company.com  | password123 | employee | 2026-04-09 20:32:17 |
|  5 | Employee 3    | employee3@company.com  | password123 | employee | 2026-04-09 20:32:17 |
|  6 | Employee 4    | employee4@company.com  | password123 | employee | 2026-04-09 20:32:17 |
|  7 | Employee 5    | employee5@company.com  | password123 | employee | 2026-04-09 20:32:17 |
|  8 | Employee 6    | employee6@company.com  | password123 | employee | 2026-04-09 20:32:17 |
|  9 | Employee 7    | employee7@company.com  | password123 | employee | 2026-04-09 20:32:17 |
| 10 | Employee 8    | employee8@company.com  | password123 | employee | 2026-04-09 20:32:17 |
| 11 | Employee 9    | employee9@company.com  | password123 | employee | 2026-04-09 20:32:17 |
| 12 | Employee 10   | employee10@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 13 | Employee 11   | employee11@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 14 | Employee 12   | employee12@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 15 | Employee 13   | employee13@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 16 | Employee 14   | employee14@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 17 | Employee 15   | employee15@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 18 | Employee 16   | employee16@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 19 | Employee 17   | employee17@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 20 | Employee 18   | employee18@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 21 | Employee 19   | employee19@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 22 | Employee 20   | employee20@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 23 | Employee 21   | employee21@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 24 | Employee 22   | employee22@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 25 | Employee 23   | employee23@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 26 | Employee 24   | employee24@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 27 | Employee 25   | employee25@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 28 | Employee 26   | employee26@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 29 | Employee 27   | employee27@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 30 | Employee 28   | employee28@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 31 | Employee 29   | employee29@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 32 | Employee 30   | employee30@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 33 | Employee 31   | employee31@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 34 | Employee 32   | employee32@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 35 | Employee 33   | employee33@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 36 | Employee 34   | employee34@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 37 | Employee 35   | employee35@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 38 | Employee 36   | employee36@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 39 | Employee 37   | employee37@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 40 | Employee 38   | employee38@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 41 | Employee 39   | employee39@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 42 | Employee 40   | employee40@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 43 | Employee 41   | employee41@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 44 | Employee 42   | employee42@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 45 | Employee 43   | employee43@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 46 | Employee 44   | employee44@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 47 | Employee 45   | employee45@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 48 | Employee 46   | employee46@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 49 | Employee 47   | employee47@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 50 | Employee 48   | employee48@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 51 | Employee 49   | employee49@company.com | password123 | employee | 2026-04-09 20:32:17 |
| 52 | Employee 50   | employee50@company.com | password123 | employee | 2026-04-09 20:32:17 |
+----+---------------+------------------------+-------------+----------+---------------------+

---

## 📡 API Reference

### Auth
| Method | Endpoint        | Access  | Description       |
|--------|-----------------|---------|-------------------|
| POST   | /api/login      | Public  | Login             |

### Leaves
| Method | Endpoint          | Access   | Description              |
|--------|-------------------|----------|--------------------------|
| POST   | /api/leave        | Employee | Apply for leave          |
| GET    | /api/leave/my     | Employee | View own leave requests  |
| GET    | /api/leave/all    | Manager  | View all leave requests  |
| PUT    | /api/leave/:id    | Manager  | Approve / Reject leave   |

### Employees
| Method | Endpoint             | Access  | Description              |
|--------|----------------------|---------|--------------------------|
| GET    | /api/employees       | Manager | List all employees       |
| POST   | /api/employees       | Manager | Add new employee         |
| DELETE | /api/employees/:id   | Manager | Soft-delete employee     |

---

## ✨ Key Features

- **Layered architecture**: Route → Controller → Service → Repository → DB
- **Employee ID auto-generation**: `EMP-YYYY-0001` format
- **Soft delete**: `is_active` flag — no data loss
- **bcrypt** password hashing
- **JWT** authentication with role-based access control
- **Centralized error handling** via `errorHandler` middleware
- **Manager dashboard tabs**: Leave Requests + Employee Management
- **Email notifications** on leave apply / approve / reject
