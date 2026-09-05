# SkillBridge

A student-to-employment tracking platform: students train, build a profile, get matched to jobs via an AI skill-gap engine, get hired, and their outcomes feed government analytics for improving training programs.

**Stack:** HTML/CSS/JavaScript (frontend) · Node.js + Express (backend) · MySQL (database)

Five roles, five dashboards: **Student, Industry (employer), Employee (recruiter), Government, Investor.**

---

## 1. Prerequisites

- Node.js 18+ and npm
- MySQL 8+ (or MariaDB) running locally
- (Optional, for real Google sign-in) A Google Cloud project with OAuth credentials

## 2. Install

```bash
cd skillbridge
npm install
```

## 3. Set up the database

```bash
mysql -u root -p < sql/schema.sql
```

This creates the `skillbridge` database, all tables, a starter skills list, and 3 demo training courses.

## 4. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and set at minimum:
- `DB_USER`, `DB_PASSWORD` — your MySQL login
- `JWT_SECRET`, `SESSION_SECRET` — any long random string

Leave the `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` as placeholders to start — email/password login works immediately without them. See **Google Sign-In** below to enable "Continue with Google" for real.

## 5. Seed demo accounts (recommended)

```bash
npm run seed
```

This creates one working login per role, **all using the password `Password123!`**:

| Role | Email |
|---|---|
| Student | student@demo.com |
| Industry | industry@demo.com |
| Employee | employee@demo.com |
| Government | gov@demo.com |
| Investor | investor@demo.com |

## 6. Run it

```bash
npm start
```

Open **http://localhost:3000**

For auto-restart during development: `npm run dev`

---

## Google Sign-In (optional, real setup)

The "Continue with Google" button works out of the box for the UI, but needs real credentials to actually authenticate:

1. Go to https://console.cloud.google.com/apis/credentials
2. Create an **OAuth 2.0 Client ID** (Application type: Web application)
3. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
4. Copy the Client ID and Client Secret into your `.env` file
5. Restart the server (`npm start`)

Until you do this, clicking "Continue with Google" will show a friendly message telling the user it isn't configured yet — the rest of the app is unaffected.

---

## What's included

**Student:** Google/email login & registration · LinkedIn/GitHub-style profile · skills with proficiency levels · course enrollment & progress tracking · certificates · project portfolio · AI job matching with live match % · AI skill-gap report + course recommendations per job · application tracking · employment status.

**Industry (employer):** company profile · post jobs/internships/trainings with required skills · AI-ranked candidate list per job · move candidates through application stages (shortlisted → interview → offered → hired) · issue certificates to students.

**Employee (recruiter):** same job posting & candidate review tools, scoped to their company (linked via the `employees` table), without company-profile-editing rights.

**Government:** approve/reject/ban companies and students · national overview stats · district-wise employment analysis · industry performance · training program performance · one-click AI-generated plain-language instant report.

**Investor:** read-only aggregate impact dashboard (no personal data) — total students, employment rate, partner companies, district outcomes.

**AI engine** (`server/utils/aiEngine.js`): a transparent, explainable rule-based matcher — compares a student's skill set and proficiency levels against a job's or course's required skills, computes a match %, lists missing/weak skills, recommends courses that close the gap, and writes a plain-language summary. It runs entirely offline, so the whole app works with zero API keys. To upgrade any of this to a real LLM later, feed the same inputs to the Anthropic API (or any LLM API) from the relevant route and use its text output in place of the rule-based summary functions.

---

## Project structure

```
skillbridge/
├── package.json
├── .env.example
├── sql/
│   └── schema.sql          # tables + seed skills/courses
├── server/
│   ├── server.js           # Express entry point
│   ├── config/
│   │   ├── db.js           # MySQL pool
│   │   └── passport.js     # Google OAuth strategy
│   ├── middleware/
│   │   └── auth.js         # JWT auth + role guard
│   ├── routes/
│   │   ├── auth.js         # register/login/Google
│   │   ├── student.js
│   │   ├── industry.js     # shared by industry + employee roles
│   │   ├── government.js
│   │   └── public.js       # unauthenticated + investor
│   └── utils/
│       ├── aiEngine.js     # skill-gap / matching / reports
│       └── seed.js         # demo account creator
└── public/
    ├── index.html           # landing page
    ├── register.html
    ├── login.html
    ├── auth-success.html    # Google OAuth redirect landing
    ├── student.html
    ├── industry.html
    ├── employee.html
    ├── government.html
    ├── investor.html
    ├── css/style.css
    └── js/shared.js         # fetch wrapper, session helpers
```

## Deploying it live

Any Node host works (Railway, Render, a VPS, etc.):

1. Provision a MySQL database (many hosts offer this as an add-on) and run `sql/schema.sql` against it.
2. Set the same environment variables from `.env.example` in your host's dashboard.
3. Set the build command to `npm install` and the start command to `npm start`.
4. Update the Google OAuth redirect URI to your live domain, e.g. `https://yourapp.com/api/auth/google/callback`.
5. Point your domain at the host, done.

## Notes / next steps for a production version

- Passwords are hashed with bcrypt and sessions use JWT — fine for a demo, but add HTTPS, rate limiting, and refresh tokens for production.
- File uploads (resumes, certificates, avatars) currently take a URL string — wire up real file storage (e.g. S3) when ready.
- The AI engine is intentionally rule-based and explainable; swapping in a real LLM is a drop-in change in `server/utils/aiEngine.js` and the routes that call it.
