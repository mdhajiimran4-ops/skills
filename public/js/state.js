// state.js - Central Synchronous State for SKILLTRACK (Connected Ecosystem: Students, Mentors, Companies)
window.SKT_STATE = {
  currentUser: null,

  // ================= 1. STUDENT ROLE (Rohit Patil) ================= //
  student: {
    id: 1,
    userId: 1,
    role: "student",
    digitalSkillPassportId: "SKP-MH-2024-008912",
    passportIssueDate: "15 Jan 2024",
    passportStatus: "Active Verified Credential",
    fullName: "Rohit Patil",
    email: "rohit.patil@skilltrack.org",
    phone: "+91 98234 56789",
    college: "Lords Institute of Engineering & Technology",
    course: "B.Tech Computer Science & Engineering",
    yearSemester: "4th Year / 8th Semester",
    district: "Pune",
    state: "Maharashtra",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    bio: "Passionate aspiring Full Stack Web & Cloud Architect. Building scalable distributed systems and looking for high-impact software engineering roles.",
    resumeUrl: "https://skilltrack.org/resumes/rohit-patil-cv.pdf",
    linkedinUrl: "https://linkedin.com/in/rohit-patil",
    githubUrl: "https://github.com/rohit-patil-dev",

    preferredLocation: "Pune, Maharashtra",
    preferredDistrict: "Pune",
    salaryExpectation: "₹25,000 - ₹35,000 / month",

    employmentStatus: "employed",
    unemploymentReason: "",

    currentEmployment: {
      company: "Tech Solutions Pvt. Ltd.",
      jobRole: "Junior Software Developer",
      location: "Pune, Maharashtra",
      monthlySalary: "₹28,000",
      annualLpa: "₹3.36 LPA",
      employmentType: "Full Time (Industry Placed)",
      since: "May 2025",
      employerConfirmed: true,
      verificationScore: "98% Verified"
    },

    skills: [
      { name: "JavaScript", level: "Advanced", verified: true },
      { name: "Python", level: "Intermediate", verified: true },
      { name: "Node.js", level: "Advanced", verified: true },
      { name: "Express", level: "Advanced", verified: true },
      { name: "MySQL", level: "Intermediate", verified: true },
      { name: "AWS Cloud", level: "Intermediate", verified: true },
      { name: "Docker", level: "Intermediate", verified: false },
      { name: "Linux", level: "Advanced", verified: true },
      { name: "Excel", level: "Advanced", verified: true },
      { name: "REST APIs", level: "Advanced", verified: true },
      { name: "Git", level: "Advanced", verified: true },
      { name: "HTML5", level: "Expert", verified: true }
    ],

    trainings: [
      { id: 101, title: "Full Stack Web Development", instituteName: "Government Polytechnic (GBIT), Pune", duration: "12 Weeks", completedDate: "2025-01-15", grade: "A+", status: "Completed" },
      { id: 102, title: "Python Programming & Data Structures", instituteName: "Maharashtra Skill University", duration: "8 Weeks", completedDate: "2024-08-20", grade: "A", status: "Completed" }
    ],

    certificates: [
      { id: 201, title: "Certified Full Stack Specialist", issuer: "Maharashtra State Skill Development Society (MSSDS)", issueDate: "2025-01-20", credentialId: "MS-FS-99120", status: "Verified" },
      { id: 202, title: "Python Programming Professional", issuer: "Maharashtra Skill University", issueDate: "2024-08-25", credentialId: "MSU-PY-44109", status: "Verified" }
    ],

    projects: [
      {
        id: 301,
        title: "District Healthcare Logistics Tracker",
        tech: ["Node.js", "MySQL", "Express", "REST APIs"],
        github: "https://github.com/rohit-patil-dev/health-tracker",
        demo: "https://health-tracker.maharashtra.gov",
        description: "Resource coordination portal mapping pharmaceutical inventory across 45 primary health clinics in Pune district."
      },
      {
        id: 302,
        title: "Automated Student Assessment Engine",
        tech: ["JavaScript", "Python", "Chart.js"],
        github: "https://github.com/rohit-patil-dev/assessment-engine",
        demo: "https://assessment.demo.org",
        description: "Real-time evaluation engine grading engineering assignments with code-execution analysis."
      }
    ],

    employmentTimeline: [
      { stage: "Training Completed", date: "Jan 2025", status: "completed" },
      { stage: "Placed", date: "Feb 2025", status: "completed" },
      { stage: "Joined Company", date: "May 2025", status: "completed" },
      { stage: "Still Employed (Quarterly Verified)", date: "Present", status: "active" }
    ],

    followUps: [
      {
        period: "3-Month Follow-up",
        scheduledDate: "Aug 2025",
        status: "Completed",
        studentResponse: { stillEmployed: true, company: "Tech Solutions Pvt. Ltd.", currentSalary: "₹28,000", remarks: "Confirmed onboarding and training completion." },
        employerVerified: true,
        verifiedSalary: "₹28,000",
        verifiedRole: "Junior Software Developer",
        verifiedDuration: "3 Months"
      },
      {
        period: "6-Month Follow-up",
        scheduledDate: "Nov 2025",
        status: "Completed",
        studentResponse: { stillEmployed: true, company: "Tech Solutions Pvt. Ltd.", currentSalary: "₹28,000", remarks: "Retention validated with positive milestone appraisal." },
        employerVerified: true,
        verifiedSalary: "₹28,000",
        verifiedRole: "Junior Software Developer",
        verifiedDuration: "6 Months"
      },
      {
        period: "12-Month Follow-up",
        scheduledDate: "May 2026",
        status: "Due Now",
        studentResponse: null,
        employerVerified: false,
        verifiedSalary: null,
        verifiedRole: null,
        verifiedDuration: null
      }
    ]
  },

  // ================= 2. INDUSTRY ROLE (Tech Solutions Pvt. Ltd.) ================= //
  industry: {
    id: 2,
    userId: 2,
    role: "industry",
    companyName: "Tech Solutions Pvt. Ltd.",
    logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200",
    industryType: "Information Technology & Software Development",
    companyDescription: "Leading enterprise digital engineering partner specializing in cloud transformations, full-stack microservices, and AI workforce acceleration across Maharashtra.",
    website: "https://techsolutions.co.in",
    contactEmail: "contact@techsolutions.com",
    contactPhone: "+91 20 6712 3400",
    district: "Pune",
    location: "Magarpatta Cybercity, Tower 7, Hadapsar, Pune, Maharashtra 411028",
    totalEmployees: "450+ Professionals",
    verificationStatus: "Verified Industry Partner",

    employerVerificationScore: 98,
    trustGrade: "A+ State Trusted Employer",

    stats: { activeJobs: 3, candidatesCount: 18, totalHired: 54 },

    verifiedTraineesLedger: [
      {
        id: 1,
        studentName: "Rohit Patil",
        passportId: "SKP-MH-2024-008912",
        jobRole: "Junior Software Developer",
        salaryConfirmed: "₹28,000 / month",
        employeeJoined: true,
        joinDate: "02 May 2025",
        durationMonths: "9 Months Active",
        verificationStatus: "Confirmed by HR",
        lastAuditDate: "15 Jan 2026"
      },
      {
        id: 2,
        studentName: "Pravin Deshmukh",
        passportId: "SKP-MH-2024-004128",
        jobRole: "Associate Cloud Engineer",
        salaryConfirmed: "₹32,000 / month",
        employeeJoined: true,
        joinDate: "10 Aug 2024",
        durationMonths: "18 Months Active",
        verificationStatus: "Confirmed by HR",
        lastAuditDate: "15 Jan 2026"
      }
    ],

    jobs: [
      {
        id: 1,
        title: "Junior Cloud & DevOps Associate",
        jobType: "Full Time",
        district: "Pune",
        salaryRange: "₹28,000 - ₹35,000 / month (₹4.2 LPA)",
        salaryMin: 28000,
        requiredSkills: ["AWS Cloud", "Docker", "Linux", "Node.js"],
        experience: "0-1 Year / Trainee",
        status: "Open",
        applicantsCount: 14,
        postedDate: "2026-02-10",
        description: "Deploy scalable containerized microservices to AWS ECS and configure continuous delivery pipelines."
      },
      {
        id: 2,
        title: "Associate Full Stack Developer",
        jobType: "Full Time",
        district: "Pune",
        salaryRange: "₹26,000 - ₹32,000 / month (₹3.8 LPA)",
        salaryMin: 26000,
        requiredSkills: ["JavaScript", "Node.js", "Express", "MySQL", "Git"],
        experience: "Fresh Graduate",
        status: "Open",
        applicantsCount: 28,
        postedDate: "2026-02-14",
        description: "Engineer RESTful microservices, optimize database queries, and design secure authentication systems."
      },
      {
        id: 3,
        title: "Business Data & Operations Analyst",
        jobType: "Full Time",
        district: "Pune",
        salaryRange: "₹24,000 - ₹30,000 / month (₹3.6 LPA)",
        salaryMin: 24000,
        requiredSkills: ["Excel", "SQL", "Communication"],
        experience: "Trainee / Graduate",
        status: "Open",
        applicantsCount: 36,
        postedDate: "2026-02-20",
        description: "Transform complex operational datasets into actionable executive insights using SQL and Power BI."
      }
    ]
  },

  // ================= 3. EMPLOYEE ROLE (Vikram Malhotra - Mentor) ================= //
  employee: {
    id: 3,
    userId: 3,
    role: "employee",
    name: "Vikram Malhotra",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    designation: "Senior Cloud & Platform Architect",
    department: "Infrastructure & Platform Engineering",
    organization: "Tech Solutions Pvt. Ltd.",
    email: "vikram.malhotra@techsolutions.com",
    phone: "+91 98450 12345",
    experienceYears: "7+ Years",
    professionalDetails: "Specializes in AWS microservices, Data Analytics pipelines, and technical mentorship for student apprentice engineers.",
    linkedinUrl: "https://linkedin.com/in/vikram-malhotra-cloud",
    mentees: [
      { id: 1, name: "Rohit Patil", topic: "Data Analytics & SQL Microservices", status: "Active Mentee", nextSession: "Tomorrow, 4:00 PM" },
      { id: 2, name: "Ayesha Naaz", topic: "AWS VPC Architecture", status: "Requested", nextSession: "Pending Approval" }
    ],
    endorsementsPending: [
      { studentName: "Rohit Patil", skill: "AWS Cloud & Linux", date: "2026-02-28" }
    ]
  },

  // ================= 4. GOVERNMENT ROLE (MSSDS Directorate) ================= //
  government: {
    id: 4,
    userId: 4,
    role: "government",
    name: "Dr. Rajesh Deshmukh, IAS",
    designation: "Joint Director & District Nodal Officer",
    department: "Department of Skill Development, Employment & Entrepreneurship",
    organization: "Maharashtra State Skill Development Society (MSSDS)",
    officialEmail: "officer@skilltrack.gov",
    officialPhone: "+91 22 2202 4589",
    location: "Mantralaya, Mumbai & Pune Directorate",
    assignedDistrict: "Pune & Western Maharashtra Division",
    employeeId: "MH-IAS-2018-094",

    kpis: {
      totalTrainees: "2,48,572",
      trainedThisMonth: "18,392",
      placed: "1,58,943",
      placementRate: "63.9%",
      averageSalary: "₹24,650 / month",
      salaryGrowthYoY: "+16.7%",
      retention6M: "78.4%",
      retention12M: "72.1%",
      selfEmployed: "21,567",
      employerVerificationScore: "96.4% Trust Index"
    },

    earlyWarningAlerts: [
      {
        id: "EW-101",
        riskType: "Likely to Remain Unemployed",
        targetEntity: "Batch #44: Junior Web Developers (Nashik Center)",
        severity: "Critical",
        reason: "Low practical coding submission rate (42%) and lack of verified GitHub repositories.",
        predictedOutcome: "Placement conversion projected <38% without immediate hands-on lab intervention.",
        suggestedIntervention: "Schedule Mandatory 2-Week Hackathon Lab & Pair with Industry Mentors."
      },
      {
        id: "EW-102",
        riskType: "Likely to Leave Job (High Attrition)",
        targetEntity: "Apprentice Trainees in BPO/Operations (Thane District)",
        severity: "High",
        reason: "Entry wages (₹14,500/mo) are 35% below suburban living costs; daily commute exceeds 2 hours.",
        predictedOutcome: "Predicted 3-month retention drop from 78% to 51%.",
        suggestedIntervention: "Issue Transport Subsidy Vouchers & Renegotiate Wage Baseline with Local Employers."
      },
      {
        id: "EW-103",
        riskType: "Acute Skill Mismatch",
        targetEntity: "Automotive CAD Technicians (Aurangabad Center)",
        severity: "Medium",
        reason: "Curriculum utilizes legacy AutoCAD while local EV factories require Catia & Embedded IoT.",
        predictedOutcome: "Interview clearance rate fallen to 29%.",
        suggestedIntervention: "Deploy Immediate Curriculum Patch: Transition to Catia V5 & EV Telematics."
      }
    ],

    trainingProviderPerformance: [
      {
        rank: 1,
        name: "Government Polytechnic (GBIT), Pune",
        district: "Pune",
        placementRate: "87.8%",
        retention6M: "84.5%",
        retention12M: "79.2%",
        salaryImprovement: "+₹6,800/mo",
        employerSatisfaction: "4.8 / 5.0",
        skillGapRate: "12.4% (Low)"
      },
      {
        rank: 2,
        name: "Maharashtra Skill University, Nagpur",
        district: "Nagpur",
        placementRate: "86.9%",
        retention6M: "82.1%",
        retention12M: "76.4%",
        salaryImprovement: "+₹5,500/mo",
        employerSatisfaction: "4.7 / 5.0",
        skillGapRate: "14.8% (Low)"
      },
      {
        rank: 3,
        name: "Nashik Vocational Training Institute",
        district: "Nashik",
        placementRate: "82.3%",
        retention6M: "77.8%",
        retention12M: "71.5%",
        salaryImprovement: "+₹4,200/mo",
        employerSatisfaction: "4.4 / 5.0",
        skillGapRate: "18.2% (Moderate)"
      },
      {
        rank: 4,
        name: "Aurangabad Industrial Skilling Academy",
        district: "Aurangabad",
        placementRate: "81.1%",
        retention6M: "75.4%",
        retention12M: "68.9%",
        salaryImprovement: "+₹3,900/mo",
        employerSatisfaction: "4.3 / 5.0",
        skillGapRate: "22.5% (High Deficit)"
      }
    ],

    skillDemandHeatmap: [
      {
        district: "Pune",
        availableSkills: "Java, MySQL, HTML/CSS",
        jobDemand: "AWS Cloud, Node.js, Microservices, Python",
        skillShortage: "AWS Cloud & DevOps (64% Deficit)",
        status: "Critical Shortage",
        recommendedCoursesToStart: "16-Week Advanced Cloud Architecture & Kubernetes Apprenticeship"
      },
      {
        district: "Nagpur",
        availableSkills: "Basic SQL, C++, Excel",
        jobDemand: "Data Science, Power BI, Python, ML",
        skillShortage: "Enterprise Data Analytics (53% Deficit)",
        status: "High Shortage",
        recommendedCoursesToStart: "12-Week Applied Data Analytics & Power BI Certification"
      },
      {
        district: "Nashik",
        availableSkills: "Mechanical Drafting, Basic CNC",
        jobDemand: "Industrial IoT, PLC Automation, CAD/CAM",
        skillShortage: "Smart Automation & Robotics (48% Deficit)",
        status: "High Shortage",
        recommendedCoursesToStart: "14-Week Smart Manufacturing & Industrial IoT Program"
      },
      {
        district: "Aurangabad",
        availableSkills: "Automotive Assembly, Manual QA",
        jobDemand: "EV Battery Tech, Catia, Embedded Systems",
        skillShortage: "Electric Vehicle Assembly & Battery Testing (58% Deficit)",
        status: "Critical Shortage",
        recommendedCoursesToStart: "12-Week EV Powertrain & Battery Management Systems"
      },
      {
        district: "Thane",
        availableSkills: "Basic IT Support, Excel, Tele-calling",
        jobDemand: "Cybersecurity, Cloud Infra, Full Stack",
        skillShortage: "Information Security & SOC Operations (45% Deficit)",
        status: "High Shortage",
        recommendedCoursesToStart: "10-Week Certified SOC Analyst & Network Defense"
      }
    ],

    unemploymentReasonsBreakdown: [
      { reason: "Skill Mismatch", percentage: 34, count: 18420, trend: "Requires Curriculum Update" },
      { reason: "Low Salary Offered", percentage: 24, count: 13010, trend: "Wage Floor Enforcement Needed" },
      { reason: "Location / Commute Problem", percentage: 18, count: 9750, trend: "Relocation Stipend Needed" },
      { reason: "No Suitable Jobs Locally", percentage: 12, count: 6500, trend: "District Industrial Matching" },
      { reason: "Higher Studies Pursued", percentage: 8, count: 4330, trend: "Academic Transition" },
      { reason: "Other Personal Reasons", percentage: 4, count: 2160, trend: "Counseling Support" }
    ],

    districtAnalytics: [
      { district: "Pune", enrolled: 52400, certified: 44200, placed: 38700, rate: "87.5%", topDemand: "AWS, Node.js, Python" },
      { district: "Nagpur", enrolled: 44100, certified: 37900, placed: 32100, rate: "84.7%", topDemand: "Data Science, SQL, AI" },
      { district: "Nashik", enrolled: 36800, certified: 30500, placed: 25100, rate: "82.3%", topDemand: "Manufacturing, IoT, CAD" },
      { district: "Aurangabad", enrolled: 31200, certified: 25400, placed: 20600, rate: "81.1%", topDemand: "Automotive, Electrical, QA" },
      { district: "Thane", enrolled: 28900, certified: 23600, placed: 18800, rate: "79.6%", topDemand: "Cloud, Full Stack, DevOps" }
    ],

    trainingAnalytics: { totalCoursesConducted: 1420, activeClassrooms: 890, maleFemaleRatio: "54% / 46%", completionRate: "89.2%", dropoutRate: "10.8%" },
    reports: [
      { id: "REP-2026-Q1", title: "Quarterly Workforce Intelligence & Placement Review", date: "2026-02-01", author: "MSSDS AI Policy Engine", status: "Published" },
      { id: "REP-2025-Q4", title: "Annual Technical Skilling Audit & Wage Trajectory", date: "2025-11-15", author: "MSSDS Directorate", status: "Archived" }
    ]
  },

  // ================= 5. ADMIN ROLE ================= //
  admin: {
    id: 5,
    userId: 5,
    role: "admin",
    name: "Master Administrator",
    email: "admin@skilltrack.org",
    roleLevel: "Super Administrator (Level 5 Clearance)",
    securitySettings: {
      twoFactorEnabled: true,
      auditAlerts: true,
      ipWhitelist: "10.0.0.0/8, 192.168.1.0/24",
      lastPasswordChange: "2026-01-15"
    },
    users: [
      { id: 1, email: "rohit.patil@skilltrack.org", role: "student", status: "active", name: "Rohit Patil" },
      { id: 2, email: "contact@techsolutions.com", role: "industry", status: "active", name: "Tech Solutions Pvt. Ltd." },
      { id: 3, email: "vikram.malhotra@techsolutions.com", role: "employee", status: "active", name: "Vikram Malhotra" },
      { id: 4, email: "officer@skilltrack.gov", role: "government", status: "active", name: "Dr. Rajesh Deshmukh" },
      { id: 5, email: "admin@skilltrack.org", role: "admin", status: "active", name: "Master Admin" }
    ],
    skillsTaxonomy: [
      { id: 1, name: "JavaScript", category: "Web Development", demand: "High", activeCourses: 45 },
      { id: 2, name: "Python", category: "Programming & Data", demand: "Very High", activeCourses: 52 },
      { id: 3, name: "AWS Cloud", category: "Cloud & DevOps", demand: "Critical", activeCourses: 28 },
      { id: 4, name: "Excel", category: "Data & Operations", demand: "Universal", activeCourses: 60 },
      { id: 5, name: "SQL", category: "Data Architecture", demand: "Very High", activeCourses: 40 },
      { id: 6, name: "Data Analytics", category: "Analytics & Intelligence", demand: "Critical", activeCourses: 38 },
      { id: 7, name: "Power BI", category: "Business Intelligence", demand: "High", activeCourses: 25 },
      { id: 8, name: "Communication", category: "Professional Soft Skills", demand: "Essential", activeCourses: 35 }
    ],
    permissions: [
      { role: "student", viewProfile: true, applyJobs: true, postJobs: false, approveCertificates: false, viewStateReports: false },
      { role: "industry", viewProfile: true, applyJobs: false, postJobs: true, approveCertificates: false, viewStateReports: false },
      { role: "employee", viewProfile: true, applyJobs: false, postJobs: false, approveCertificates: true, viewStateReports: false },
      { role: "government", viewProfile: true, applyJobs: false, postJobs: false, approveCertificates: false, viewStateReports: true },
      { role: "admin", viewProfile: true, applyJobs: true, postJobs: true, approveCertificates: true, viewStateReports: true }
    ],
    auditLogs: [
      { id: 101, timestamp: "2026-02-28T10:14:22Z", actor: "admin@skilltrack.org", action: "ACCREDIT_INSTITUTE", target: "GBIT, Pune", status: "Success" },
      { id: 102, timestamp: "2026-02-28T09:45:10Z", actor: "officer@skilltrack.gov", action: "GENERATE_AI_REPORT", target: "State Skill Gap Q1", status: "Success" }
    ]
  },

  // ================= 6. CONNECTED SHARED APPLICATIONS (STUDENT <-> INDUSTRY) ================= //
  applications: [
    {
      id: 1,
      jobId: 2,
      jobTitle: "Associate Full Stack Developer",
      companyId: 2,
      companyName: "Tech Solutions Pvt. Ltd.",
      companyLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200",
      studentId: 1,
      studentName: "Rohit Patil",
      studentEmail: "rohit.patil@skilltrack.org",
      studentPassportId: "SKP-MH-2024-008912",
      appliedDate: "2026-02-15",
      status: "Selected", // 'Applied' | 'Shortlisted' | 'Interview Scheduled' | 'Selected'
      matchScore: 92,
      interviewInfo: {
        round: "Technical Architecture & Coding",
        date: "2026-02-20",
        time: "03:00 PM IST",
        mode: "Google Meet",
        meetingLink: "https://meet.google.com/xyz-tech-round",
        interviewer: "Vikram Malhotra (Lead Architect)",
        feedback: "Demonstrated strong knowledge in Node.js and SQL schema design."
      }
    },
    {
      id: 2,
      jobId: 1,
      jobTitle: "Junior Cloud & DevOps Associate",
      companyId: 2,
      companyName: "Tech Solutions Pvt. Ltd.",
      companyLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200",
      studentId: 1,
      studentName: "Rohit Patil",
      studentEmail: "rohit.patil@skilltrack.org",
      studentPassportId: "SKP-MH-2024-008912",
      appliedDate: "2026-02-28",
      status: "Interview Scheduled",
      matchScore: 88,
      interviewInfo: {
        round: "Cloud Infrastructure Assessment",
        date: "Tomorrow",
        time: "11:30 AM IST",
        mode: "Google Meet (Live)",
        meetingLink: "https://meet.google.com/skt-cloud-round",
        interviewer: "Vikram Malhotra (Platform Engineering)",
        feedback: "Application shortlisted based on verified AWS Cloud & Docker credentials."
      }
    }
  ],

  // ================= 7. INTERACTIVE COURSES (LESSONS, ASSIGNMENTS, QUIZZES) ================= //
  courses: [
    {
      id: "data-analytics",
      code: "DA-101",
      title: "Data Analytics & Business Intelligence with SQL & Power BI",
      category: "Data Analytics",
      provider: "Tech Solutions Pvt. Ltd. & MSSDS",
      instructor: "Vikram Malhotra",
      instructorRole: "Senior Cloud & Data Architect",
      duration: "6 Weeks",
      level: "Beginner to Intermediate",
      requiredSkills: ["Excel", "Basic Math", "Analytical Thinking"],
      skillsTaught: ["Data Analytics", "SQL", "Power BI", "Statistics", "Data Modeling"],
      matchingJobs: ["Business Data & Operations Analyst", "Junior Data Analyst", "Operations Specialist"],
      companies: ["Tech Solutions Pvt. Ltd.", "Infosys BPM Digital"],
      enrolled: true,
      progressPercent: 65,
      overview: "Comprehensive industry apprenticeship course covering raw data extraction, relational SQL queries, data warehousing, and executive Power BI visualization.",
      lessons: [
        {
          id: 1,
          title: "Foundations of Business Analytics & Key Metrics",
          duration: "25 min",
          completed: true,
          content: "Learn how modern enterprises measure customer acquisition cost (CAC), lifetime value (LTV), and throughput. Explore data cleaning workflows in modern tabular formats."
        },
        {
          id: 2,
          title: "SQL Schema Design, Joins & Query Optimization",
          duration: "45 min",
          completed: true,
          content: "Master INNER JOIN, LEFT JOIN, window functions (ROW_NUMBER, DENSE_RANK), and query execution plans on multi-million row production databases."
        },
        {
          id: 3,
          title: "Building Executive Dashboards in Power BI",
          duration: "35 min",
          completed: false,
          content: "Connecting live SQL feeds, writing DAX measures (CALCULATE, SUMX), and delivering automated executive KPI dashboards."
        }
      ],
      assignment: {
        id: "asg-da-01",
        title: "Healthcare Supply Optimization Query & Insights",
        prompt: "Write an optimized SQL query that computes the total shortfall of essential medications across the 36 districts of Maharashtra and recommend inventory reallocations.",
        submitted: false,
        submissionText: "",
        grade: null
      },
      quiz: {
        id: "quiz-da-01",
        title: "Data Analytics & SQL Mastery Certification Quiz",
        passed: false,
        score: null,
        questions: [
          {
            q: "Which SQL clause is used to filter aggregated grouped data produced by GROUP BY?",
            options: ["WHERE", "HAVING", "ORDER BY", "FILTER"],
            correct: 1
          },
          {
            q: "In modern Data Analytics pipelines, what does ETL stand for?",
            options: ["Extract, Transform, Load", "Evaluate, Train, Learn", "Encrypt, Test, Log", "Export, Terminate, Launch"],
            correct: 0
          },
          {
            q: "Which measure of central tendency is least sensitive to extreme statistical outliers?",
            options: ["Mean (Average)", "Median", "Variance", "Range"],
            correct: 1
          }
        ]
      }
    },
    {
      id: "cloud-microservices",
      code: "CS-201",
      title: "Cloud Microservices Architecture & DevOps with AWS",
      category: "AWS Cloud",
      provider: "Tech Solutions Pvt. Ltd. & GBIT Pune",
      instructor: "Vikram Malhotra",
      instructorRole: "Senior Cloud & Platform Architect",
      duration: "8 Weeks",
      level: "Intermediate",
      requiredSkills: ["Linux", "JavaScript", "REST APIs"],
      skillsTaught: ["AWS Cloud", "Docker", "Node.js", "CI/CD", "ECS"],
      matchingJobs: ["Junior Cloud & DevOps Associate", "Backend Engineer"],
      companies: ["Tech Solutions Pvt. Ltd.", "Tata AutoComp Systems"],
      enrolled: true,
      progressPercent: 80,
      overview: "Containerization, cloud network isolation (VPC), auto-scaling groups, and zero-downtime continuous deployment on AWS.",
      lessons: [
        { id: 1, title: "Dockerizing Production Node.js Services", duration: "30 min", completed: true, content: "Multi-stage Docker builds, image size reduction, and non-root security principles." },
        { id: 2, title: "AWS ECS & Fargate Orchestration", duration: "50 min", completed: true, content: "Task definitions, target groups, Application Load Balancer configuration, and health check monitoring." }
      ],
      assignment: {
        id: "asg-cs-01",
        title: "Deploying a Resilient 2-Tier Architecture",
        prompt: "Submit the Dockerfile and task-definition JSON for a fault-tolerant Node.js API connected to RDS PostgreSQL.",
        submitted: true,
        submissionText: "https://github.com/rohit-patil-dev/ecs-fargate-starter",
        grade: "A+"
      },
      quiz: {
        id: "quiz-cs-01",
        title: "AWS Microservices Competency Quiz",
        passed: true,
        score: "100%",
        questions: [
          { q: "Which AWS service provides serverless container execution without managing EC2 instances?", options: ["AWS Fargate", "Amazon EC2", "AWS OpsWorks", "Amazon Lightsail"], correct: 0 },
          { q: "What Docker instruction sets the primary execution command?", options: ["ENTRYPOINT", "RUN", "LABEL", "EXPOSE"], correct: 0 }
        ]
      }
    },
    {
      id: "fullstack-web",
      code: "FS-301",
      title: "Modern Full Stack Web Engineering (React, Node & MySQL)",
      category: "Full Stack",
      provider: "Government Polytechnic (GBIT), Pune",
      instructor: "Pooja Kulkarni",
      instructorRole: "Lead Technical Instructor",
      duration: "12 Weeks",
      level: "Comprehensive",
      requiredSkills: ["HTML5", "CSS3", "JavaScript"],
      skillsTaught: ["React", "Express", "MySQL", "Authentication", "REST APIs"],
      matchingJobs: ["Associate Full Stack Developer", "Frontend Engineer"],
      companies: ["Tech Solutions Pvt. Ltd.", "Infosys BPM Digital"],
      enrolled: true,
      progressPercent: 100,
      overview: "End-to-end full stack web engineering from database schemas to responsive single-page web applications.",
      lessons: [
        { id: 1, title: "RESTful API Standards & JWT Auth", duration: "40 min", completed: true, content: "Stateless authentication with JSON Web Tokens, refresh token cookies, and bcrypt hashing." }
      ],
      assignment: { id: "asg-fs-01", title: "Full Stack Application Architecture", prompt: "Submit code repository.", submitted: true, submissionText: "https://github.com/rohit-patil-dev/health-tracker", grade: "A+" },
      quiz: { id: "quiz-fs-01", title: "Full Stack Verification Quiz", passed: true, score: "100%", questions: [{ q: "What does JWT stand for?", options: ["JSON Web Token", "Java Web Tool", "Joint Work Task"], correct: 0 }] }
    }
  ],

  // ================= 8. VERIFIED ENTERPRISES & COMPANIES ================= //
  companies: [
    {
      id: 1,
      name: "Tech Solutions Pvt. Ltd.",
      logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200",
      sector: "IT & Software Development",
      district: "Pune",
      website: "https://techsolutions.co.in",
      openingsCount: 3,
      verified: true,
      trustScore: "98% (Grade A+)",
      description: "Cloud microservices, Data Analytics architectures, and enterprise AI software engineering.",
      topHiringSkills: ["Data Analytics", "SQL", "AWS Cloud", "Node.js", "Excel"],
      jobs: [
        {
          id: 1,
          title: "Junior Cloud & DevOps Associate",
          jobType: "Full Time",
          district: "Pune",
          salaryRange: "₹26,000 - ₹34,000 / month",
          experience: "0-1 Year / Trainee",
          requiredSkills: ["AWS Cloud", "Docker", "Linux", "Node.js"],
          status: "Open",
          applicantsCount: 18,
          postedDate: "2026-02-10"
        },
        {
          id: 2,
          title: "Associate Full Stack Developer",
          jobType: "Full Time",
          district: "Pune",
          salaryRange: "₹24,000 - ₹30,000 / month",
          experience: "Fresh Graduate / Career Transition",
          requiredSkills: ["JavaScript", "Node.js", "Express", "MySQL", "Git"],
          status: "Open",
          applicantsCount: 24,
          postedDate: "2026-02-14"
        }
      ]
    },
    {
      id: 2,
      name: "Infosys BPM Digital",
      logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200",
      sector: "Enterprise Digital Operations",
      district: "Pune & Nagpur",
      website: "https://infosysbpm.com",
      openingsCount: 8,
      verified: true,
      trustScore: "96% (Grade A)",
      description: "Enterprise analytics, financial operations, and data visualization pipelines.",
      topHiringSkills: ["Data Analytics", "Power BI", "SQL", "Excel", "Communication"],
      jobs: [
        {
          id: 3,
          title: "Business Data & Operations Analyst",
          jobType: "Full Time",
          district: "Pune",
          salaryRange: "₹25,000 - ₹32,000 / month",
          experience: "0-2 Years",
          requiredSkills: ["Data Analytics", "Power BI", "SQL", "Excel", "Communication"],
          status: "Open",
          applicantsCount: 31,
          postedDate: "2026-02-18"
        }
      ]
    },
    {
      id: 3,
      name: "Tata AutoComp Systems",
      logo: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200",
      sector: "Automotive & Industrial IoT",
      district: "Pune & Bhosari",
      website: "https://tataautocomp.com",
      openingsCount: 5,
      verified: true,
      trustScore: "95% (Grade A)",
      description: "Smart automotive sensors, embedded IoT telematics, and precision manufacturing analytics.",
      topHiringSkills: ["Python", "Data Analytics", "IoT", "Quality Control"],
      jobs: [
        {
          id: 4,
          title: "Industrial IoT & Telematics Engineer",
          jobType: "Full Time",
          district: "Pune",
          salaryRange: "₹28,000 - ₹36,000 / month",
          experience: "0-1 Year",
          requiredSkills: ["Python", "IoT", "Linux", "Embedded C"],
          status: "Open",
          applicantsCount: 12,
          postedDate: "2026-02-22"
        }
      ]
    }
  ],

  // ================= 9. COMPANY-DEFINED CAREER PATHS ================= //
  careerPaths: [
    {
      id: "path-cloud-devops",
      companyId: 1,
      companyName: "Tech Solutions Pvt. Ltd.",
      title: "Cloud Infrastructure & DevOps Engineer",
      description: "Architecting multi-tier cloud deployments, container orchestration with Docker & Kubernetes, and automated CI/CD pipeline automation.",
      startingSalary: "₹26,000 - ₹35,000 / month",
      requiredSkills: ["AWS Cloud", "Docker", "Linux", "Node.js", "CI/CD"],
      skillsImparted: ["Microservices Architecture", "Docker Compose", "Terraform Basics", "Prometheus Monitoring"],
      recommendedCourseId: "cloud-microservices",
      openJobsCount: 2
    },
    {
      id: "path-data-analytics",
      companyId: 2,
      companyName: "Infosys BPM Digital",
      title: "Enterprise Business Intelligence & Data Analyst",
      description: "Extracting insights from enterprise relational schemas, building automated Power BI executive dashboards, and optimizing query execution plans.",
      startingSalary: "₹25,000 - ₹32,000 / month",
      requiredSkills: ["Data Analytics", "SQL", "Power BI", "Excel", "Communication"],
      skillsImparted: ["Window Functions", "DAX Measures", "ETL Pipelines", "Data Storytelling"],
      recommendedCourseId: "data-analytics",
      openJobsCount: 1
    },
    {
      id: "path-industrial-iot",
      companyId: 3,
      companyName: "Tata AutoComp Systems",
      title: "Industrial IoT & Automotive Telematics Specialist",
      description: "Developing embedded sensor telemetry pipelines, edge computing for smart manufacturing lines, and predictive maintenance algorithms.",
      startingSalary: "₹28,000 - ₹36,000 / month",
      requiredSkills: ["Python", "IoT", "Linux", "Embedded C"],
      skillsImparted: ["MQTT Protocols", "Edge Telemetry", "CAN Bus Basics", "Sensor Calibration"],
      recommendedCourseId: "industrial-iot",
      openJobsCount: 1
    }
  ],

  industryDirectoryForStudents: [
    {
      id: 1,
      name: "Tech Solutions Pvt. Ltd.",
      logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200",
      sector: "IT & Software Development",
      district: "Pune",
      website: "https://techsolutions.co.in",
      openingsCount: 3,
      verified: true,
      trustScore: "98% (Grade A+)",
      description: "Cloud microservices, Data Analytics architectures, and enterprise AI software engineering.",
      topHiringSkills: ["Data Analytics", "SQL", "AWS Cloud", "Node.js", "Excel"]
    },
    {
      id: 2,
      name: "Infosys BPM Digital",
      logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200",
      sector: "Enterprise Digital Operations",
      district: "Pune & Nagpur",
      website: "https://infosysbpm.com",
      openingsCount: 8,
      verified: true,
      trustScore: "96% (Grade A)",
      description: "Enterprise analytics, financial operations, and data visualization pipelines.",
      topHiringSkills: ["Data Analytics", "Power BI", "SQL", "Excel", "Communication"]
    },
    {
      id: 3,
      name: "Tata AutoComp Systems",
      logo: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200",
      sector: "Automotive & Industrial IoT",
      district: "Pune & Bhosari",
      website: "https://tataautocomp.com",
      openingsCount: 5,
      verified: true,
      trustScore: "95% (Grade A)",
      description: "Smart automotive sensors, embedded IoT telematics, and precision manufacturing analytics.",
      topHiringSkills: ["Python", "Data Analytics", "IoT", "Quality Control"]
    }
  ],

  employeeMentorsForStudents: [
    {
      id: 1,
      name: "Vikram Malhotra",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      designation: "Senior Cloud & Data Architect",
      company: "Tech Solutions Pvt. Ltd.",
      department: "Infrastructure & Platform Engineering",
      linkedin: "https://linkedin.com/in/vikram-malhotra-cloud",
      topics: "Data Analytics, SQL Queries, AWS Microservices, Docker",
      status: "Available for Mentorship"
    },
    {
      id: 2,
      name: "Pooja Kulkarni",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
      designation: "Lead Talent Acquisition Partner",
      company: "Tech Solutions Pvt. Ltd.",
      department: "Human Resources & Skilling",
      linkedin: "https://linkedin.com/in/pooja-kulkarni-hr",
      topics: "Resume Critique, Tech Interviews, Data Analytics Roles",
      status: "Available for Mentorship"
    },
    {
      id: 3,
      name: "Anand Deshmukh",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
      designation: "Principal IoT Solutions Engineer",
      company: "Tata AutoComp Systems",
      department: "Industrial Embedded Systems",
      linkedin: "https://linkedin.com/in/anand-deshmukh-iot",
      topics: "Industrial Telematics, Python for Data, Embedded Sensors",
      status: "Accepting Trainees"
    }
  ],

  // ================= 9. COMPANY COURSE SUBMISSIONS & PROJECT EVALUATIONS ================= //
  courseSubmissions: [
    {
      id: 1,
      courseId: "data-analytics",
      courseTitle: "Data Analytics & Business Intelligence with SQL & Power BI",
      companyId: 2,
      companyName: "Tech Solutions Pvt. Ltd.",
      studentId: 1,
      studentName: "Rohit Patil",
      studentEmail: "rohit.patil@skilltrack.org",
      studentPassportId: "SKP-MH-2024-008912",
      assignmentTitle: "Healthcare Supply Optimization Query & Insights",
      submissionDate: "2026-02-28",
      submissionText: "SELECT district_name, SUM(deficit_count) FROM health_warehouse WHERE supply_status = 'Critical' GROUP BY district_name;",
      projectFileName: "district_health_logistics_query.pdf",
      projectFileUrl: "https://skilltrack.org/projects/district_health_logistics_query.pdf",
      githubUrl: "https://github.com/rohit-patil-dev/health-tracker",
      quizScore: "100%",
      evaluationStatus: "Graded",
      marks: 95,
      grade: "Grade A+",
      evaluator: "Vikram Malhotra (Lead Architect)",
      feedback: "Exceptional indexing strategy, clean CTE structure, and fast sub-50ms execution. Top 5% performance in cohort.",
      skillEndorsed: "Data Analytics & Advanced SQL"
    }
  ],

  // ================= 10. MULTI-STUDENT & FACULTY REGISTRIES ================= //
  currentStudentId: 1,
  currentFacultyId: "FAC-101",
  students: [
    {
      id: 1,
      userId: 1,
      digitalSkillPassportId: "SKP-MH-2024-008912",
      facultyId: "FAC-101",
      facultyName: "Prof. Arvind Joshi",
      attendanceRate: "94%",
      fullName: "Rohit Patil",
      email: "rohit.patil@skilltrack.org",
      phone: "+91 98234 56789",
      college: "Lords Institute of Engineering & Technology",
      course: "B.Tech Computer Science & Engineering",
      yearSemester: "4th Year / 8th Semester",
      graduationYear: "2026",
      cgpa: "8.85 / 10.0",
      district: "Pune",
      state: "Maharashtra",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      bio: "Aspiring Cloud Microservices & Data Analytics Architect. Focused on high-throughput distributed systems.",
      resumeUrl: "https://skilltrack.org/resumes/rohit-patil-cv.pdf",
      resumeFileName: "rohit_patil_fullstack_cv.pdf",
      linkedinUrl: "https://linkedin.com/in/rohit-patil",
      githubUrl: "https://github.com/rohit-patil-dev",
      interests: ["Cloud Computing", "Data Analytics", "Microservices Architecture", "REST API Engineering"],
      preferredRoles: ["Associate Cloud Engineer", "Junior Data Analyst", "Full Stack Developer"],
      preferredLocation: "Pune, Maharashtra",
      salaryExpectation: "₹25,000 - ₹35,000 / month",
      employmentStatus: "employed",
      unemploymentReason: "",
      currentEmployment: {
        company: "Tech Solutions Pvt. Ltd.",
        jobRole: "Junior Software Developer",
        location: "Pune, Maharashtra",
        monthlySalary: "₹28,000",
        employmentType: "Full Time (Industry Placed)",
        since: "May 2025",
        verificationScore: "98% Verified"
      },
      skills: [
        { name: "JavaScript", level: "Advanced", verified: true, endorsedBy: "MSSDS State Registry" },
        { name: "Python", level: "Intermediate", verified: true, endorsedBy: "Prof. Arvind Joshi (FAC-101)" },
        { name: "Node.js", level: "Advanced", verified: true, endorsedBy: "Tech Solutions Pvt. Ltd." },
        { name: "AWS Cloud", level: "Intermediate", verified: true, endorsedBy: "Prof. Arvind Joshi (FAC-101)" },
        { name: "SQL", level: "Advanced", verified: true, endorsedBy: "Tech Solutions Pvt. Ltd." },
        { name: "Data Analytics", level: "Advanced", verified: true, endorsedBy: "Infosys BPM Digital" }
      ],
      trainings: [
        { id: 101, title: "Full Stack Web Development", instituteName: "Government Polytechnic (GBIT), Pune", duration: "12 Weeks", completedDate: "2025-01-15", grade: "A+", status: "Completed" }
      ],
      certificates: [
        { id: 201, title: "Certified Full Stack Specialist", issuer: "MSSDS State Registry", issueDate: "2025-01-20", credentialId: "MS-FS-99120", status: "Verified" },
        { id: 202, title: "Data Analytics & SQL Mastery", issuer: "Tech Solutions Academy", issueDate: "2026-02-28", credentialId: "TS-DA-48210", status: "Verified by Company HR" }
      ],
      projects: [
        {
          id: 301,
          title: "District Healthcare Logistics Tracker",
          tech: ["Node.js", "MySQL", "Express", "REST APIs"],
          github: "https://github.com/rohit-patil-dev/health-tracker",
          description: "Resource coordination portal mapping pharmaceutical inventory across 45 primary clinics in Pune.",
          deliverableSpecs: "Sub-50ms query latency, 14,000 requests/day, verified database replication.",
          verified: true
        }
      ],
      followUps: [
        { period: "3-Month Check", scheduledDate: "Aug 2025", studentResponse: "Employed & Retained", employerVerified: true, verifiedSalary: "₹25,000 / month", status: "Completed" }
      ]
    },
    {
      id: 2,
      userId: 2,
      digitalSkillPassportId: "SKP-MH-2024-009142",
      facultyId: "FAC-101",
      facultyName: "Prof. Arvind Joshi",
      attendanceRate: "91%",
      fullName: "Ayesha Naaz",
      email: "ayesha.naaz@skilltrack.org",
      phone: "+91 98234 11223",
      college: "Government Polytechnic (GBIT), Pune",
      course: "Diploma in Information Technology",
      yearSemester: "3rd Year / 6th Semester",
      graduationYear: "2026",
      cgpa: "9.12 / 10.0",
      district: "Pune",
      state: "Maharashtra",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
      bio: "Specializing in Cloud DevOps, Docker containerization, and automated CI/CD deployment pipelines.",
      resumeUrl: "https://skilltrack.org/resumes/ayesha-naaz-cv.pdf",
      resumeFileName: "ayesha_naaz_cloud_cv.pdf",
      linkedinUrl: "https://linkedin.com/in/ayesha-naaz",
      githubUrl: "https://github.com/ayesha-naaz-dev",
      interests: ["Cloud Infrastructure", "DevOps", "Docker", "Kubernetes", "Linux Administration"],
      preferredRoles: ["Cloud Support Associate", "Junior DevOps Engineer", "Systems Administrator"],
      preferredLocation: "Pune / Mumbai",
      salaryExpectation: "₹26,000 - ₹34,000 / month",
      employmentStatus: "employed",
      unemploymentReason: "",
      currentEmployment: {
        company: "Tech Solutions Pvt. Ltd.",
        jobRole: "Cloud Support Engineer",
        location: "Pune, Maharashtra",
        monthlySalary: "₹26,000",
        employmentType: "Full Time (Industry Placed)",
        since: "June 2025",
        verificationScore: "96% Verified"
      },
      skills: [
        { name: "Linux", level: "Expert", verified: true, endorsedBy: "Prof. Arvind Joshi (FAC-101)" },
        { name: "Docker", level: "Advanced", verified: true, endorsedBy: "Tech Solutions Pvt. Ltd." },
        { name: "AWS Cloud", level: "Advanced", verified: true, endorsedBy: "Prof. Arvind Joshi (FAC-101)" },
        { name: "Python", level: "Intermediate", verified: true, endorsedBy: "MSSDS State Registry" }
      ],
      trainings: [
        { id: 103, title: "Advanced Cloud Computing (AWS/DevOps)", instituteName: "GBIT, Pune", duration: "16 Weeks", completedDate: "2025-02-10", grade: "A+", status: "Completed" }
      ],
      certificates: [
        { id: 204, title: "AWS Cloud Associate Certification", issuer: "GBIT Pune Academy", issueDate: "2025-02-15", credentialId: "GBIT-AWS-8812", status: "Verified" }
      ],
      projects: [
        {
          id: 303,
          title: "Automated Kubernetes Cluster Health Probe",
          tech: ["Docker", "Kubernetes", "Python", "Linux"],
          github: "https://github.com/ayesha-naaz-dev/k8s-health-probe",
          description: "Self-healing monitoring daemon querying node resource utilization across multi-zone clusters.",
          deliverableSpecs: "Sub-20ms scrape frequency, verified webhook alert dispatcher.",
          verified: true
        }
      ],
      followUps: [
        { period: "3-Month Check", scheduledDate: "Sep 2025", studentResponse: "Employed & Retained", employerVerified: true, verifiedSalary: "₹26,000 / month", status: "Completed" }
      ]
    },
    {
      id: 3,
      userId: 3,
      digitalSkillPassportId: "SKP-MH-2024-004419",
      facultyId: "FAC-102",
      facultyName: "Prof. Sunita Sharma",
      attendanceRate: "88%",
      fullName: "Rahul Verma",
      email: "rahul.verma@skilltrack.org",
      phone: "+91 98234 44556",
      college: "Maharashtra Skill University, Nagpur",
      course: "B.Sc Data Science & Artificial Intelligence",
      yearSemester: "3rd Year / 6th Semester",
      graduationYear: "2026",
      cgpa: "8.40 / 10.0",
      district: "Nagpur",
      state: "Maharashtra",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
      bio: "Specializing in enterprise data engineering, statistical modeling, and automated ETL pipelines with Python & SQL.",
      resumeUrl: "https://skilltrack.org/resumes/rahul-verma-cv.pdf",
      resumeFileName: "rahul_verma_datascience_cv.pdf",
      linkedinUrl: "https://linkedin.com/in/rahul-verma",
      githubUrl: "https://github.com/rahul-verma-data",
      interests: ["Data Analytics", "Machine Learning", "Python", "Power BI", "SQL"],
      preferredRoles: ["Data Analyst", "Junior BI Developer", "Analytics Associate"],
      preferredLocation: "Nagpur / Pune",
      salaryExpectation: "₹24,000 - ₹30,000 / month",
      employmentStatus: "employed",
      unemploymentReason: "",
      currentEmployment: {
        company: "Infosys BPM Digital",
        jobRole: "Data Operations Associate",
        location: "Nagpur, Maharashtra",
        monthlySalary: "₹25,000",
        employmentType: "Full Time (Industry Placed)",
        since: "July 2025",
        verificationScore: "95% Verified"
      },
      skills: [
        { name: "Python", level: "Advanced", verified: true, endorsedBy: "Prof. Sunita Sharma (FAC-102)" },
        { name: "SQL", level: "Advanced", verified: true, endorsedBy: "Infosys BPM Digital" },
        { name: "Power BI", level: "Intermediate", verified: true, endorsedBy: "Prof. Sunita Sharma (FAC-102)" },
        { name: "Data Analytics", level: "Advanced", verified: true, endorsedBy: "Maharashtra Skill University" }
      ],
      trainings: [
        { id: 104, title: "Big Data & Python Analytics", instituteName: "Maharashtra Skill University", duration: "12 Weeks", completedDate: "2025-01-25", grade: "A", status: "Completed" }
      ],
      certificates: [
        { id: 205, title: "Enterprise Data Analytics Specialist", issuer: "MSU Nagpur", issueDate: "2025-02-01", credentialId: "MSU-DA-3391", status: "Verified" }
      ],
      projects: [
        {
          id: 304,
          title: "Agricultural Crop Yield Prediction Engine",
          tech: ["Python", "Pandas", "Scikit-Learn", "Streamlit"],
          github: "https://github.com/rahul-verma-data/crop-yield-ai",
          description: "Multivariate regression model projecting soybean yield across Vidarbha district soil profiles.",
          deliverableSpecs: "R2 score 0.89, clean interactive Streamlit dashboard.",
          verified: true
        }
      ],
      followUps: [
        { period: "3-Month Check", scheduledDate: "Oct 2025", studentResponse: "Employed & Retained", employerVerified: true, verifiedSalary: "₹25,000 / month", status: "Completed" }
      ]
    },
    {
      id: 4,
      userId: 4,
      digitalSkillPassportId: "SKP-MH-2024-005530",
      facultyId: "FAC-102",
      facultyName: "Prof. Sunita Sharma",
      attendanceRate: "96%",
      fullName: "Priya Jadhav",
      email: "priya.jadhav@skilltrack.org",
      phone: "+91 98234 77889",
      college: "Government Engineering College, Aurangabad",
      course: "B.Tech Electronics & Telecommunication",
      yearSemester: "4th Year / 8th Semester",
      graduationYear: "2026",
      cgpa: "9.25 / 10.0",
      district: "Aurangabad",
      state: "Maharashtra",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      bio: "Specializing in Industrial IoT, embedded sensor telematics, and smart automotive battery telemetry algorithms.",
      resumeUrl: "https://skilltrack.org/resumes/priya-jadhav-cv.pdf",
      resumeFileName: "priya_jadhav_iot_cv.pdf",
      linkedinUrl: "https://linkedin.com/in/priya-jadhav",
      githubUrl: "https://github.com/priya-jadhav-iot",
      interests: ["Industrial IoT", "Embedded Systems", "Python", "Sensors & Telematics", "Automotive Electronics"],
      preferredRoles: ["IoT Engineer", "Embedded Firmware Associate", "Hardware QA Engineer"],
      preferredLocation: "Pune / Aurangabad",
      salaryExpectation: "₹28,000 - ₹36,000 / month",
      employmentStatus: "employed",
      unemploymentReason: "",
      currentEmployment: {
        company: "Tata AutoComp Systems",
        jobRole: "IoT Test Associate",
        location: "Pune, Maharashtra",
        monthlySalary: "₹28,000",
        employmentType: "Full Time (Industry Placed)",
        since: "August 2025",
        verificationScore: "95% Verified"
      },
      skills: [
        { name: "Embedded C", level: "Advanced", verified: true, endorsedBy: "Prof. Sunita Sharma (FAC-102)" },
        { name: "Python", level: "Advanced", verified: true, endorsedBy: "Tata AutoComp Systems" },
        { name: "IoT", level: "Expert", verified: true, endorsedBy: "Tata AutoComp Systems" },
        { name: "Linux", level: "Intermediate", verified: true, endorsedBy: "MSSDS State Registry" }
      ],
      trainings: [
        { id: 105, title: "Industrial IoT & Automotive Systems", instituteName: "Tata AutoComp Academy", duration: "10 Weeks", completedDate: "2025-03-01", grade: "A+", status: "Completed" }
      ],
      certificates: [
        { id: 206, title: "Certified Industrial IoT Engineer", issuer: "Tata AutoComp Academy", issueDate: "2025-03-05", credentialId: "TAC-IOT-9921", status: "Verified" }
      ],
      projects: [
        {
          id: 305,
          title: "EV Battery Thermal Runaway Telemetry Sensor",
          tech: ["Embedded C", "Python", "MQTT", "CAN Bus"],
          github: "https://github.com/priya-jadhav-iot/ev-battery-telemetry",
          description: "High-frequency CAN-bus sensor package tracking real-time temperature anomalies in EV lithium-ion packs.",
          deliverableSpecs: "Sub-10ms emergency trip relay, verified simulation benchmarks.",
          verified: true
        }
      ],
      followUps: [
        { period: "3-Month Check", scheduledDate: "Nov 2025", studentResponse: "Employed & Retained", employerVerified: true, verifiedSalary: "₹28,000 / month", status: "Completed" }
      ]
    }
  ],

  // Faculty Members
  faculty: [
    {
      id: 1,
      facultyId: "FAC-101",
      name: "Prof. Arvind Joshi",
      email: "arvind.joshi@faculty.skilltrack.org",
      phone: "+91 98220 12345",
      department: "Computer Science & Cloud Systems",
      designation: "Associate Professor & Technical Placement Lead",
      office: "Dept. of Computer Science, Lab 402, GBIT Campus",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
      assignedStudentIds: [1, 2],
      coursesManaged: ["cloud-microservices"],
      officeHours: "Mon-Thu 2:00 PM - 5:00 PM"
    },
    {
      id: 2,
      facultyId: "FAC-102",
      name: "Prof. Sunita Sharma",
      email: "sunita.sharma@faculty.skilltrack.org",
      phone: "+91 98220 54321",
      department: "Data Science & Artificial Intelligence",
      designation: "Professor & Analytics Director",
      office: "AI Innovation Center, Room 204",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
      assignedStudentIds: [3, 4],
      coursesManaged: ["data-analytics"],
      officeHours: "Tue-Fri 10:00 AM - 1:00 PM"
    }
  ],

  // Faculty Announcements
  facultyAnnouncements: [
    {
      id: 1,
      facultyId: "FAC-101",
      facultyName: "Prof. Arvind Joshi",
      title: "Docker Capstone Architecture Deliverables Due Friday",
      content: "All assigned Cloud & Full Stack students must submit their Dockerized microservices repository and architectural report PDF before 11:59 PM Friday. Evaluation marks will be submitted to the Tech Solutions hiring review board.",
      targetGroup: "Cohort FAC-101 (Cloud & Systems)",
      priority: "Urgent",
      date: "2026-03-02"
    },
    {
      id: 2,
      facultyId: "FAC-101",
      facultyName: "Prof. Arvind Joshi",
      title: "Upcoming Google Meet Mock System Design Round",
      content: "Technical placement mock interviews are scheduled this week. Please ensure your Digital Skill Passport and verified GitHub deliverables are up to date.",
      targetGroup: "Cohort FAC-101",
      priority: "Placement",
      date: "2026-02-28"
    },
    {
      id: 3,
      facultyId: "FAC-102",
      facultyName: "Prof. Sunita Sharma",
      title: "Power BI Enterprise Dashboard Workshop",
      content: "Live hands-on session on advanced DAX measures and SQL execution plans scheduled for Thursday at 11:00 AM in the Analytics Lab.",
      targetGroup: "Cohort FAC-102 (Data Analytics)",
      priority: "Academic",
      date: "2026-03-01"
    }
  ]
};

// Persistence Loader
try {
  const saved = localStorage.getItem('skt_custom_state');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.students) && parsed.students.length >= 4) window.SKT_STATE.students = parsed.students;
      if (Array.isArray(parsed.faculty) && parsed.faculty.length >= 2) window.SKT_STATE.faculty = parsed.faculty;
      if (Array.isArray(parsed.facultyAnnouncements)) window.SKT_STATE.facultyAnnouncements = parsed.facultyAnnouncements;
      if (Array.isArray(parsed.companies) && parsed.companies.length > 0) window.SKT_STATE.companies = parsed.companies;
      if (Array.isArray(parsed.courses) && parsed.courses.length > 0) window.SKT_STATE.courses = parsed.courses;
      if (Array.isArray(parsed.jobs)) window.SKT_STATE.jobs = parsed.jobs;
      if (Array.isArray(parsed.jobApplications)) window.SKT_STATE.jobApplications = parsed.jobApplications;
      if (Array.isArray(parsed.studentSubmissions)) window.SKT_STATE.studentSubmissions = parsed.studentSubmissions;
      if (parsed.currentStudentId) window.SKT_STATE.currentStudentId = parsed.currentStudentId;
      if (parsed.currentFacultyId) window.SKT_STATE.currentFacultyId = parsed.currentFacultyId;
      if (parsed.currentCompanyId) window.SKT_STATE.currentCompanyId = parsed.currentCompanyId;
    }
  }
} catch (e) {}

window.saveLocalSktState = function() {
  try {
    localStorage.setItem('skt_custom_state', JSON.stringify(window.SKT_STATE));
  } catch (e) {}
};

// ================= MULTI-STUDENT & FACULTY CONTEXT HELPERS ================= //
window.getLoggedInStudent = function() {
  const state = window.SKT_STATE || {};
  const currentId = state.currentStudentId || 1;
  const s = (state.students || []).find(st => st.id === currentId) 
    || ((state.students && state.students[0]) ? state.students[0] : null) 
    || state.student;
  state.student = s; // maintain alias
  return s;
};

window.getLoggedInFaculty = function() {
  const state = window.SKT_STATE || {};
  const currentFid = state.currentFacultyId || "FAC-101";
  const f = (state.faculty || []).find(fac => fac.facultyId === currentFid) 
    || ((state.faculty && state.faculty[0]) ? state.faculty[0] : null)
    || { facultyId: 'FAC-101', name: 'Prof. Arvind Joshi', department: 'Computer Science & Cloud Systems', email: 'arvind.joshi@faculty.skilltrack.org', officeHours: 'Mon-Fri 2:00 PM - 5:00 PM', assignedStudentIds: [1, 2] };
  return f;
};

window.getFacultyAssignedStudents = function(facultyId) {
  const state = window.SKT_STATE || {};
  const facId = facultyId || state.currentFacultyId || "FAC-101";
  const fac = (state.faculty || []).find(f => f.facultyId === facId);
  if (!fac) {
    return (state.students || []).slice(0, 2);
  }
  const ids = fac.assignedStudentIds || [];
  const assigned = (state.students || []).filter(s => ids.includes(s.id) || s.facultyId === facId);
  return assigned.length > 0 ? assigned : (state.students || []).slice(0, 2);
};

window.postFacultyAnnouncement = function(facultyId, annData) {
  const state = window.SKT_STATE;
  const fac = (state.faculty || []).find(f => f.facultyId === facultyId);
  const newAnn = {
    id: Date.now(),
    facultyId: fac ? fac.facultyId : facultyId,
    facultyName: fac ? fac.name : "Academic Faculty",
    title: annData.title,
    content: annData.content,
    targetGroup: annData.targetGroup || `Cohort ${facultyId}`,
    priority: annData.priority || "Academic",
    date: new Date().toISOString().split('T')[0]
  };

  if (!state.facultyAnnouncements) state.facultyAnnouncements = [];
  state.facultyAnnouncements.unshift(newAnn);
  window.saveLocalSktState();

  if (window.showToast) {
    window.showToast("Announcement broadcasted to assigned student cohort!", "success");
  }
};

window.gradeFacultySubmission = function(submissionId, evalData) {
  const state = window.SKT_STATE;
  const sub = (state.courseSubmissions || []).find(s => s.id === Number(submissionId));
  if (!sub) return;

  const fac = window.getLoggedInFaculty();
  sub.evaluationStatus = "Graded";
  sub.marks = Number(evalData.marks) || 95;
  sub.grade = evalData.grade || "Grade A+";
  sub.evaluator = `${fac.name} (${fac.facultyId})`;
  sub.feedback = evalData.feedback || "Verified academic deliverable and clean specifications.";
  sub.skillEndorsed = evalData.skillEndorsed || "Academic Technical Competency";

  const student = (state.students || []).find(s => s.id === sub.studentId);
  if (student && evalData.skillEndorsed) {
    const existing = student.skills.find(sk => (typeof sk === 'string' ? sk : sk.name).toLowerCase() === evalData.skillEndorsed.toLowerCase());
    if (existing) {
      existing.verified = true;
      existing.endorsedBy = `${fac.name} (${fac.facultyId})`;
    } else {
      student.skills.push({
        name: evalData.skillEndorsed,
        level: "Advanced (Faculty Endorsed)",
        verified: true,
        endorsedBy: `${fac.name} (${fac.facultyId})`
      });
    }
  }

  window.saveLocalSktState();

  if (window.showToast) {
    window.showToast(`Graded ${sub.studentName}'s work: ${sub.grade} (${sub.marks}/100)!`, "success");
  }
};

// ================= GLOBAL CONNECTED ECOSYSTEM METHODS ================= //

// 1. Submit Job Application (Connects Student -> Company & Updates Application Tracker)
window.applyForJob = function(jobId) {
  const state = window.SKT_STATE;
  const s = state.student;
  const ind = state.industry;
  const targetJob = ind.jobs.find(j => j.id === Number(jobId));
  if (!targetJob) {
    if (window.showToast) window.showToast("Job opening not found.", "error");
    return;
  }

  // Check if already applied
  const existing = state.applications.find(a => a.jobId === Number(jobId) && a.studentId === s.id);
  if (existing) {
    if (window.showToast) window.showToast(`Already applied for "${targetJob.title}". Current Status: ${existing.status}`, "info");
    if (window.navToStudentView) window.navToStudentView('applications');
    return;
  }

  // Calculate Match Score
  const reqSkills = targetJob.requiredSkills || [];
  const stuSkills = (s.skills || []).map(sk => (typeof sk === 'string' ? sk : sk.name).toLowerCase());
  let matched = 0;
  reqSkills.forEach(r => {
    if (stuSkills.some(sk => sk.includes(r.toLowerCase()) || r.toLowerCase().includes(sk))) matched++;
  });
  const matchScore = reqSkills.length > 0 ? Math.round((matched / reqSkills.length) * 100) : 90;

  const newApp = {
    id: Date.now(),
    jobId: targetJob.id,
    jobTitle: targetJob.title,
    companyId: ind.id,
    companyName: ind.companyName,
    companyLogo: ind.logoUrl,
    studentId: s.id,
    studentName: s.fullName,
    studentEmail: s.email,
    studentPassportId: s.digitalSkillPassportId,
    appliedDate: new Date().toISOString().split('T')[0],
    status: "Applied",
    matchScore: matchScore,
    interviewInfo: null
  };

  state.applications.unshift(newApp);

  // Increment company applicants count
  targetJob.applicantsCount = (targetJob.applicantsCount || 0) + 1;

  window.saveLocalSktState();

  if (window.showToast) {
    window.showToast(`Application for "${targetJob.title}" sent to ${ind.companyName}! Track in My Applications.`, "success");
  }

  if (window.navToStudentView) {
    window.navToStudentView('applications');
  }
};

// 2. Company Updates Application Status (Shortlist, Schedule Interview, Select/Hire)
window.updateApplicationStatus = function(appId, newStatus, interviewData) {
  const state = window.SKT_STATE;
  const app = state.applications.find(a => a.id === Number(appId));
  if (!app) return;

  app.status = newStatus;
  if (interviewData) {
    app.interviewInfo = interviewData;
  }

  if (newStatus === 'Selected') {
    state.industry.stats.totalHired = (state.industry.stats.totalHired || 54) + 1;
    // Also record in verified ledger
    const existingLedger = state.industry.verifiedTraineesLedger.find(l => l.studentName === app.studentName);
    if (!existingLedger) {
      state.industry.verifiedTraineesLedger.unshift({
        id: Date.now(),
        studentName: app.studentName,
        passportId: app.studentPassportId,
        jobRole: app.jobTitle,
        salaryConfirmed: "₹28,000 / month",
        employeeJoined: true,
        joinDate: new Date().toISOString().split('T')[0],
        durationMonths: "Selected / Onboarding",
        verificationStatus: "Confirmed by HR",
        lastAuditDate: new Date().toISOString().split('T')[0]
      });
    }
  }

  window.saveLocalSktState();

  if (window.showToast) {
    window.showToast(`Application #${appId} updated to: ${newStatus.toUpperCase()}`, "success");
  }

  // If in industry portal, refresh candidate view
  if (window.navToIndustryView) {
    window.navToIndustryView('candidates');
  }
};

// 3. Complete Course Quiz & Award Verified Credential
window.submitCourseQuiz = function(courseId, selectedAnswers) {
  const state = window.SKT_STATE;
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return;

  const quiz = course.quiz;
  let correctCount = 0;
  quiz.questions.forEach((q, idx) => {
    if (Number(selectedAnswers[idx]) === q.correct) correctCount++;
  });

  const percent = Math.round((correctCount / quiz.questions.length) * 100);
  quiz.score = `${percent}%`;

  if (percent >= 66) {
    quiz.passed = true;
    course.progressPercent = 100;

    // Add skills taught to student verified skills
    course.skillsTaught.forEach(skillName => {
      if (!state.student.skills.some(sk => (typeof sk === 'string' ? sk : sk.name).toLowerCase() === skillName.toLowerCase())) {
        state.student.skills.push({ name: skillName, level: "Intermediate", verified: true });
      }
    });

    // Add new certificate to digital skill passport
    const credId = `MS-${course.code}-${Math.floor(10000 + Math.random() * 90000)}`;
    state.student.certificates.unshift({
      id: Date.now(),
      title: `Certified ${course.title}`,
      issuer: `${course.provider}`,
      issueDate: new Date().toISOString().split('T')[0],
      credentialId: credId,
      status: "Verified by MSSDS"
    });

    window.saveLocalSktState();

    if (window.showToast) {
      window.showToast(`Congratulations! Quiz Passed (${percent}%). Earned "${credId}" & verified skills updated!`, "success");
    }
  } else {
    quiz.passed = false;
    window.saveLocalSktState();
    if (window.showToast) {
      window.showToast(`Quiz Score: ${percent}%. Review mentor lessons and retry!`, "error");
    }
  }

  if (window.navToStudentView) {
    window.navToStudentView('courses');
  }
};

// 4. Submit Course Assignment
window.submitCourseAssignment = function(courseId, submissionText) {
  const state = window.SKT_STATE;
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return;

  course.assignment.submitted = true;
  course.assignment.submissionText = submissionText;
  course.assignment.grade = "A+ (Reviewed by Vikram Malhotra)";

  window.saveLocalSktState();

  if (window.showToast) {
    window.showToast("Assignment submitted! Evaluated with Grade A+ by Mentor Vikram Malhotra.", "success");
  }

  if (window.navToStudentView) {
    window.navToStudentView('courses');
  }
};

// 5. Company Creates & Publishes Course
window.createCompanyCourse = function(courseData) {
  const state = window.SKT_STATE;
  const newCourse = {
    id: courseData.id || `course-${Date.now()}`,
    code: courseData.code || `CC-${Math.floor(100 + Math.random() * 900)}`,
    title: courseData.title,
    category: courseData.category || "Technology",
    provider: state.industry.companyName,
    instructor: courseData.instructor || (state.employee ? state.employee.name : "Corporate Mentor"),
    instructorRole: "Corporate Technical Mentor",
    duration: courseData.duration || "4 Weeks",
    level: courseData.level || "Industry Apprenticeship",
    requiredSkills: courseData.requiredSkills || [],
    skillsTaught: courseData.skillsTaught || [],
    matchingJobs: courseData.matchingJobs || [],
    companies: [state.industry.companyName],
    enrolled: false,
    progressPercent: 0,
    overview: courseData.overview,
    lessons: courseData.lessons || [
      { id: 1, title: "Module 1: Corporate Technical Overview", duration: "30 min", completed: false, content: "Course introduction and fundamental workflow requirements." }
    ],
    assignment: courseData.assignment || {
      id: `asg-${Date.now()}`,
      title: `${courseData.title} Practical Deliverable`,
      prompt: "Implement the required project specifications and submit your source code repository or project PDF.",
      submitted: false,
      submissionText: "",
      grade: null
    },
    quiz: courseData.quiz || {
      id: `quiz-${Date.now()}`,
      title: `${courseData.title} Assessment Quiz`,
      passed: false,
      score: null,
      questions: courseData.questions || [
        { q: "What is the primary industry objective of this course?", options: ["Production Implementation", "Theoretical Survey", "Basic Overview", "None of the above"], correct: 0 }
      ]
    }
  };

  state.courses.unshift(newCourse);
  window.saveLocalSktState();

  if (window.showToast) {
    window.showToast(`Company course "${newCourse.title}" published to student search & academy!`, "success");
  }
};

// 6. Student Submits Project Deliverable & Uploads PDF/Work
window.submitStudentProjectWork = function(courseId, payload) {
  const state = window.SKT_STATE;
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return;

  const s = state.student;
  const newSubmission = {
    id: Date.now(),
    courseId: course.id,
    courseTitle: course.title,
    companyId: state.industry.id,
    companyName: state.industry.companyName,
    studentId: s.id,
    studentName: s.fullName,
    studentEmail: s.email,
    studentPassportId: s.digitalSkillPassportId,
    assignmentTitle: course.assignment ? course.assignment.title : "Practical Project",
    submissionDate: new Date().toISOString().split('T')[0],
    submissionText: payload.submissionText || "",
    projectFileName: payload.projectFileName || "project_deliverable.pdf",
    projectFileUrl: payload.projectFileUrl || "https://skilltrack.org/projects/deliverable.pdf",
    githubUrl: payload.githubUrl || "https://github.com/rohit-patil-dev",
    quizScore: course.quiz ? (course.quiz.score || "100%") : "100%",
    evaluationStatus: "Pending",
    marks: null,
    grade: "Pending Evaluation",
    evaluator: "Awaiting Company HR / Mentor Review",
    feedback: "Submission received. Company technical mentor has been notified.",
    skillEndorsed: null
  };

  if (!state.courseSubmissions) state.courseSubmissions = [];
  state.courseSubmissions.unshift(newSubmission);

  if (course.assignment) {
    course.assignment.submitted = true;
    course.assignment.submissionText = payload.submissionText;
    course.assignment.grade = "Submitted (Under Review)";
  }

  window.saveLocalSktState();

  if (window.showToast) {
    window.showToast(`Project work & PDF submitted to ${state.industry.companyName} for review!`, "success");
  }

  if (window.navToStudentView) {
    window.navToStudentView('courses', courseId);
  }
};

// 7. Company Evaluates Student Project & Endorses Skills
window.gradeStudentSubmission = function(submissionId, evaluationData) {
  const state = window.SKT_STATE;
  const sub = (state.courseSubmissions || []).find(s => s.id === Number(submissionId));
  if (!sub) return;

  sub.evaluationStatus = "Graded";
  sub.marks = Number(evaluationData.marks) || 95;
  sub.grade = evaluationData.grade || "Grade A+";
  sub.evaluator = evaluationData.evaluator || `${state.industry.companyName} Technical Review Board`;
  sub.feedback = evaluationData.feedback || "Project demonstrated exemplary architecture and clean code standards.";
  sub.skillEndorsed = evaluationData.skillEndorsed || "Verified Technical Proficiency";

  // Endorse skill to student profile
  if (evaluationData.skillEndorsed) {
    const existingSkill = state.student.skills.find(sk => (typeof sk === 'string' ? sk : sk.name).toLowerCase() === evaluationData.skillEndorsed.toLowerCase());
    if (existingSkill) {
      existingSkill.verified = true;
      existingSkill.endorsedBy = state.industry.companyName;
    } else {
      state.student.skills.push({
        name: evaluationData.skillEndorsed,
        level: "Advanced (Industry Endorsed)",
        verified: true,
        endorsedBy: state.industry.companyName
      });
    }
  }

  window.saveLocalSktState();

  if (window.showToast) {
    window.showToast(`Evaluation complete: ${sub.studentName} graded ${sub.grade} with ${sub.marks}/100!`, "success");
  }

  if (window.navToIndustryView) {
    window.navToIndustryView('evaluations');
  }
};

// 8. Student Enrolls in Course
window.enrollInCourse = function(courseId) {
  const state = window.SKT_STATE;
  const course = (state.courses || []).find(c => c.id === courseId);
  if (!course) return;

  course.enrolled = true;
  window.saveLocalSktState();

  if (window.showToast) {
    window.showToast(`Enrolled in "${course.title}"! Lessons unlocked.`, "success");
  }

  if (window.navToStudentView) {
    window.navToStudentView('courses', courseId);
  }
};

// 9. Company Creates Career Path
window.createCompanyCareerPath = function(careerData) {
  const state = window.SKT_STATE;
  const newPath = {
    id: `path-${Date.now()}`,
    companyId: careerData.companyId || (state.industry ? state.industry.id : 1),
    companyName: careerData.companyName || (state.industry ? state.industry.companyName : "Enterprise Partner"),
    title: careerData.title,
    description: careerData.description || "",
    startingSalary: careerData.startingSalary || "₹25,000 - ₹35,000 / month",
    requiredSkills: careerData.requiredSkills || [],
    skillsImparted: careerData.skillsImparted || [],
    recommendedCourseId: careerData.recommendedCourseId || "",
    openJobsCount: careerData.openJobsCount || 1
  };

  if (!state.careerPaths) state.careerPaths = [];
  state.careerPaths.unshift(newPath);
  window.saveLocalSktState();

  if (window.showToast) {
    window.showToast(`Career path "${newPath.title}" published!`, "success");
  }
};

// 10. Student Adds Portfolio Project
window.addStudentProject = function(projectData) {
  const state = window.SKT_STATE;
  const s = state.student;
  const newProj = {
    id: Date.now(),
    title: projectData.title,
    tech: Array.isArray(projectData.tech) ? projectData.tech : projectData.tech.split(',').map(t => t.trim()),
    github: projectData.github || "https://github.com/rohit-patil-dev",
    description: projectData.description || "",
    deliverableSpecs: projectData.deliverableSpecs || "Clean production architecture, verified tests.",
    verified: true
  };

  if (!s.projects) s.projects = [];
  s.projects.unshift(newProj);
  window.saveLocalSktState();

  if (window.showToast) {
    window.showToast(`Project "${newProj.title}" added to your verified portfolio!`, "success");
  }

  if (window.navToStudentView) {
    window.navToStudentView('projects');
  }
};

// 11. Student Updates Resume
window.updateStudentResume = function(resumeFileName, resumeUrl) {
  const state = window.SKT_STATE;
  state.student.resumeFileName = resumeFileName;
  state.student.resumeUrl = resumeUrl || `https://skilltrack.org/resumes/${resumeFileName}`;
  window.saveLocalSktState();

  if (window.showToast) {
    window.showToast(`Resume "${resumeFileName}" uploaded & saved permanently!`, "success");
  }
};

