# SkillBridge - Complete Database Creation, Setup & Management Guide

This document explains **how the database is created**, **how to set it up**, and **how to manage all platform data** (Students, Industries, Government Metrics, Exams, Interviews, and Helpline Tickets).

---

## 📌 1. How the Database Works Right Now (Zero-Setup Mode)

The application includes an **Automated Persistent Storage Engine** (`db.js` + `data.json`):
- **Storage Location**: `C:\Users\MD Haji Imran\.gemini\antigravity\scratch\skillbridge-platform\data.json`
- **Security**: Passwords hashed using Node.js built-in **PBKDF2 with Cryptographic Salts** (`crypto.pbkdf2Sync`, SHA-512).
- **Auto-Sync**: Any change made in the UI (e.g. Imran Khan updating profile, taking exams, companies shortlisting candidates, submitting support tickets) is **instantly written to disk**.
- **No external server installation required** — it works out of the box with `npm start`.

---

## 🗄️ 2. How to Set Up MySQL / MariaDB (Production Mode)

If you want to use a real relational database server (like **MySQL Workbench**, **phpMyAdmin**, or **DBeaver**):

### Step 2.1: Open MySQL Console or phpMyAdmin
Run your local MySQL server (via MySQL Server, XAMPP, WAMP, or Docker).

### Step 2.2: Import the Schema
Execute the pre-built `schema.sql` included in your project folder:

#### Option A: Using the Command Line (PowerShell)
```powershell
# Navigate to the folder
cd "C:\Users\MD Haji Imran\.gemini\antigravity\scratch\skillbridge-platform"

# Import into MySQL (enter your MySQL root password when prompted)
mysql -u root -p < schema.sql
```

#### Option B: Using phpMyAdmin or MySQL Workbench
1. Open **phpMyAdmin** (`http://localhost/phpmyadmin`) or **MySQL Workbench**.
2. Click **Import** or **File -> Open SQL Script**.
3. Select `C:\Users\MD Haji Imran\.gemini\antigravity\scratch\skillbridge-platform\schema.sql`.
4. Click **Execute / Go**.
5. It will create `skillbridge_db` with all 11 relational tables and seed data automatically!

---

## 📊 3. Database Schema Overview

| Table Name | Description | Key Fields |
| :--- | :--- | :--- |
| `users` | Multi-role user credentials & auth | `id`, `email`, `password_hash`, `salt`, `role`, `status` |
| `students` | Student profiles (Imran Khan) | `full_name`, `college`, `cgpa`, `skills`, `overall_progress` |
| `industries` | Employers (TechSolutions Pvt. Ltd.) | `company_name`, `location`, `active_jobs`, `total_hired` |
| `courses` | Vocational course catalog | `title`, `category`, `duration`, `level`, `icon` |
| `student_learning_progress` | Module completion tracking | `course_title`, `progress_percentage`, `next_lesson` |
| `assessments` | Practical examinations | `title`, `date`, `duration_minutes`, `status` |
| `certificates` | Digital verifiable credentials | `title`, `issuer`, `credential_id`, `issue_date` |
| `jobs` | Corporate openings | `title`, `salary_range`, `location`, `job_type` |
| `interviews` | Candidate queue positions | `company_name`, `role`, `position_in_queue`, `tab` |
| `helpline_tickets` | User support inquiries | `category`, `title`, `description`, `status` |
| `notifications` | Live event alerts | `title`, `message`, `type`, `time_label`, `is_read` |

---

## 🛠️ 4. How to Manage Platform Data

### Method A: Through the Web UI (No Coding Needed)
- **Edit Student Profile**: Click **Student Profile -> Edit Profile** to update Imran Khan's CGPA, college, bio, or skills.
- **Shortlist Candidates**: Click **Industry Dashboard -> Shortlist** to move candidates into interview status.
- **Take Exams & Issue Certificates**: Click **Student Dashboard -> Start Exam** to complete assessments and automatically generate digital credentials.
- **Resolve Tickets**: Click **Helpline & Support -> Raise New Ticket** or update ticket status.

### Method B: Live REST API Endpoints
You can interact with or manage data programmatically using `curl` or Postman:

- **Get Profile**: `GET /api/student/profile`
- **Update Profile**: `PUT /api/student/profile`
- **Shortlist Student**: `POST /api/industry/shortlist` `{ "studentId": 1 }`
- **Submit Ticket**: `POST /api/helpline/new-ticket` `{ "category": "student", "title": "Issue", "description": "Details" }`
- **Export Live SQL**: `GET /api/db/export-sql` (Downloads ready-to-run SQL INSERT dump)
- **Inspect DB Health**: `GET /api/db/metrics`

### Method C: Connecting Node.js Directly to MySQL
To switch `server.js` from `data.json` to MySQL connection pool:
```bash
npm install mysql2
```
And add to `db.js`:
```javascript
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'YOUR_PASSWORD',
  database: 'skillbridge_db',
  waitForConnections: true,
  connectionLimit: 10
});
```

---

## 💾 5. Backing Up Your Data

1. **Instant Backup**: Copy `data.json` to a backup folder.
2. **One-Click SQL Export**: Navigate to **`http://localhost:3000/#db-manager`** and click **"Export SQL Database Dump"**.
3. **MySQL Dump Command**:
   ```powershell
   mysqldump -u root -p skillbridge_db > skillbridge_backup.sql
   ```
