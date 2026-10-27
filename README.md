# StaffSync - Modern HR Management (MERN)

Role-based HR system for HR, Managers and Employees.

| Role | Can do |
|------|--------|
| HR | Manage employees (add/edit/delete), view all leaves and attendance, approve/reject leaves, post announcements/news, manage training |
| Manager | View own team, approve/reject team leaves, view team attendance, create/manage training programs and enrol team members |
| Employee | Apply for / cancel leave, check in/out, edit own profile, read announcements, view enrolled training |

## Tech stack
MongoDB, Express.js, React (Vite), Node.js, Bootstrap 5, JWT auth, bcrypt password hashing.

## Prerequisites
Node.js v16+, npm v8+, MongoDB running locally (or a MongoDB Atlas URI).

## Setup

### 1. Backend
```bash
cd server
npm install
# edit .env if needed (MONGO_URI, JWT_SECRET)
npm run seed     # optional: creates demo users
npm run dev      # starts API on http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev      # starts UI on http://localhost:3000
```

## Demo logins (after `npm run seed`, password `password123`)
- HR: hr@staffsync.com
- Manager: manager@staffsync.com
- Employee: employee@staffsync.com

## API overview (all except auth need `Authorization: Bearer <token>`)
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST /api/employees`, `PUT/DELETE /api/employees/:id`, `GET/PUT /api/employees/profile/me`
- `POST /api/leaves`, `GET /api/leaves/my`, `GET /api/leaves`, `PUT /api/leaves/:id/status`, `DELETE /api/leaves/:id`
- `POST /api/attendance/check-in`, `POST /api/attendance/check-out`, `GET /api/attendance/my`, `GET /api/attendance?date=YYYY-MM-DD`
- `GET/POST /api/announcements`, `PUT/DELETE /api/announcements/:id`
- `GET/POST /api/training`, `PUT/DELETE /api/training/:id`

## Folder structure
```
StaffSync/
  server/  config, models, middleware, routes, server.js, seed.js
  client/  src/{components,context,pages}, api.js, App.jsx
```
