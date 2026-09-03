# SKILLTRACK - Unified Workforce & Career Intelligence Platform

A production-grade web application tracking students from skills training through sustained job employment, equipping institutions and employers, and providing governments with data-driven analytics to improve training programs across Maharashtra.

---

## 🌳 Platform Architecture & Module Tree

```text
SKILLTRACK
│
├── 🌐 PUBLIC
│   ├── Home               -> Hero, Workforce tracker simulation, 4 strategic capability pillars
│   ├── About              -> Mission, Accredited verification, 3-year retention model
│   ├── How It Works       -> 4-stage lifecycle (Enroll, Train, AI Match, Retain)
│   └── Contact            -> Direct dispatch form to state skilling directorate
│
├── 🔐 AUTH
│   ├── Login              -> Role-based authentication (Student, Institute, Employer, Gov, Admin)
│   ├── Register           -> Candidate & partner onboarding with district tagging
│   ├── Google Login       -> 1-click Google Single Sign-On
│   └── Forgot Password    -> Dispatch recovery instructions
│
├── 👨🎓 STUDENT
│   ├── Dashboard          -> Rohit Patil's career hub, 4 KPIs, Current Employment, Timeline
│   ├── Profile            -> Contact details, district, education, and bio management
│   ├── Skills             -> Technical skills registry with verification levels
│   ├── Training           -> Course completions registered by government institutes
│   ├── Certificates       -> Official digital credentials with instant serial verification
│   ├── Projects           -> Portfolio deliverables (Building & Selling)
│   ├── GitHub             -> Open-source repo statistics and code deliverables
│   ├── LinkedIn           -> Industry profile synchronization
│   ├── AI Skill Gap       -> Algorithmic competency overlap vs. market roles
│   ├── Learning Plan      -> 4-Week personalized learning roadmap
│   ├── Jobs               -> Live vacancies with 1-click apply
│   ├── Employment         -> Employer, designation, monthly wage, and lifecycle status
│   └── Follow-ups         -> 3-Month, 6-Month, 12-Month retention milestones
│
├── 🏢 INSTITUTE
│   ├── Dashboard          -> GBIT Pune portal, accreditation info, placement conversion
│   ├── Students           -> Directory of enrolled and graduated trainees
│   ├── Courses            -> State-approved curriculums, seat intake, and fees
│   ├── Training           -> Active classroom apprenticeships
│   ├── Assessments        -> Practical examination logging and pass-rate telemetry
│   ├── Certificates       -> Direct cryptographic credential issuance
│   └── Outcomes           -> Placement conversion, average trainee wages, retention
│
├── 🏭 EMPLOYER
│   ├── Dashboard          -> Tech Solutions portal, active openings, hiring pipeline
│   ├── Company            -> Verified corporate profile and regional office location
│   ├── Jobs               -> Career opening publication with required skill tags
│   ├── Candidates         -> Applicant evaluation ranked by AI skill compatibility score
│   └── Hiring             -> Direct hiring workflow and salary offer management
│
├── 🏛️ GOVERNMENT
│   ├── Dashboard          -> 6 State Macro KPIs (Trainees, Placed, Retention, Salary)
│   ├── District Analytics -> 36-District performance table and efficiency metrics
│   ├── Training Analytics -> Classroom counts, gender ratios, completion/dropout rates
│   ├── Institute Perf.    -> Official institute rankings and compliance audit scores
│   ├── Employment         -> State-wide placement and salary distribution telemetry
│   ├── Skill Demand       -> Real-time industry vacancy counts and YoY growth index
│   ├── Skill Gaps         -> Deficit matrix (AWS Cloud, Data Science, Cybersecurity)
│   ├── AI Insights        -> Automated policy intervention directives
│   └── Reports            -> Quarterly whitepapers & instant AI state report generator
│
└── ⚙️ ADMIN
    ├── Users              -> Master user credentials & account suspension
    ├── Institutes         -> Accreditation audit and license management
    ├── Employers          -> Enterprise partner verification
    ├── Skills             -> Statewide skills taxonomy registry
    ├── Courses            -> Master course accreditation catalog
    ├── Permissions        -> Role-Based Access Control (RBAC) matrix
    └── Audit Logs         -> Immutable security and transaction event logging
```

---

## 🚀 How to Run Live

In PowerShell or Command Prompt:

```powershell
# 1. Navigate to the project directory
cd "C:\Users\MD Haji Imran\.gemini\antigravity\scratch\skillbridge-platform"

# 2. Start the server
npm start
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**

### Direct Route Access
- **Public**: `http://localhost:3000/#public/home`
- **Student**: `http://localhost:3000/#student/dashboard`
- **Institute**: `http://localhost:3000/#institute/dashboard`
- **Employer**: `http://localhost:3000/#employer/dashboard`
- **Government**: `http://localhost:3000/#government/dashboard`
- **Admin**: `http://localhost:3000/#admin/users`
- **Auth**: `http://localhost:3000/#auth/login`
