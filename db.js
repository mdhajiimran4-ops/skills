// db.js - SKILLTRACK Complete Multi-Role Persistent Storage Engine
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, 'data.json');

function hashPassword(password, salt) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const check = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return check === hash;
}

function getInitialData() {
  const mkHash = (pwd) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(pwd, salt, 1000, 64, 'sha512').toString('hex');
    return { salt, hash };
  };

  const s1 = mkHash("password123");
  const s2 = mkHash("password123");
  const s3 = mkHash("password123");
  const s4 = mkHash("password123");

  const f1 = mkHash("password123");
  const f2 = mkHash("password123");

  const c1 = mkHash("password123");
  const c2 = mkHash("password123");
  const c3 = mkHash("password123");

  const g1 = mkHash("password123");
  const a1 = mkHash("password123");
  const e1 = mkHash("password123");

  return {
    // 🔐 1. AUTH & USERS (Students, Faculty, Industry, Government, Admin)
    users: [
      // Students (Individual Unique Accounts)
      {
        id: 1,
        studentId: "SKP-MH-2024-008912",
        email: "rohit.patil@skilltrack.org",
        salt: s1.salt,
        passwordHash: s1.hash,
        role: "student",
        name: "Rohit Patil",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
        facultyId: "FAC-101",
        status: "active",
        createdAt: "2026-01-10T08:00:00.000Z"
      },
      {
        id: 2,
        studentId: "SKP-MH-2024-009142",
        email: "ayesha.naaz@skilltrack.org",
        salt: s2.salt,
        passwordHash: s2.hash,
        role: "student",
        name: "Ayesha Naaz",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
        facultyId: "FAC-101",
        status: "active",
        createdAt: "2026-01-12T08:00:00.000Z"
      },
      {
        id: 3,
        studentId: "SKP-MH-2024-004419",
        email: "rahul.verma@skilltrack.org",
        salt: s3.salt,
        passwordHash: s3.hash,
        role: "student",
        name: "Rahul Verma",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
        facultyId: "FAC-102",
        status: "active",
        createdAt: "2026-01-14T08:00:00.000Z"
      },
      {
        id: 4,
        studentId: "SKP-MH-2024-005530",
        email: "priya.jadhav@skilltrack.org",
        salt: s4.salt,
        passwordHash: s4.hash,
        role: "student",
        name: "Priya Jadhav",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
        facultyId: "FAC-102",
        status: "active",
        createdAt: "2026-01-16T08:00:00.000Z"
      },

      // Faculty Members (Academic Mentors & Evaluators)
      {
        id: 5,
        facultyId: "FAC-101",
        email: "arvind.joshi@faculty.skilltrack.org",
        salt: f1.salt,
        passwordHash: f1.hash,
        role: "faculty",
        name: "Prof. Arvind Joshi",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
        department: "Computer Science & Cloud Systems",
        status: "active",
        createdAt: "2026-01-02T08:00:00.000Z"
      },
      {
        id: 6,
        facultyId: "FAC-102",
        email: "sunita.sharma@faculty.skilltrack.org",
        salt: f2.salt,
        passwordHash: f2.hash,
        role: "faculty",
        name: "Prof. Sunita Sharma",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
        department: "Data Science & Artificial Intelligence",
        status: "active",
        createdAt: "2026-01-03T08:00:00.000Z"
      },

      // Industry Companies
      {
        id: 7,
        email: "contact@techsolutions.com",
        salt: c1.salt,
        passwordHash: c1.hash,
        role: "industry",
        companyId: 1,
        name: "Tech Solutions Pvt. Ltd.",
        avatar: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200",
        status: "active",
        createdAt: "2026-01-15T08:00:00.000Z"
      },
      {
        id: 8,
        email: "recruitment@infosysbpm.com",
        salt: c2.salt,
        passwordHash: c2.hash,
        role: "industry",
        companyId: 2,
        name: "Infosys BPM Digital",
        avatar: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200",
        status: "active",
        createdAt: "2026-01-18T08:00:00.000Z"
      },
      {
        id: 9,
        email: "careers@tataautocomp.com",
        salt: c3.salt,
        passwordHash: c3.hash,
        role: "industry",
        companyId: 3,
        name: "Tata AutoComp Systems",
        avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200",
        status: "active",
        createdAt: "2026-01-20T08:00:00.000Z"
      },

      // Mentors, Government & Admin
      {
        id: 10,
        email: "vikram.malhotra@techsolutions.com",
        salt: e1.salt,
        passwordHash: e1.hash,
        role: "employee",
        companyId: 1,
        name: "Vikram Malhotra",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
        status: "active",
        createdAt: "2026-01-16T08:00:00.000Z"
      },
      {
        id: 11,
        email: "officer@skilltrack.gov",
        salt: g1.salt,
        passwordHash: g1.hash,
        role: "government",
        name: "Dr. Rajesh Deshmukh",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
        status: "active",
        createdAt: "2026-01-05T08:00:00.000Z"
      },
      {
        id: 12,
        email: "admin@skilltrack.org",
        salt: a1.salt,
        passwordHash: a1.hash,
        role: "admin",
        name: "Master Administrator",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
        status: "active",
        createdAt: "2026-01-01T08:00:00.000Z"
      }
    ],

    // 👨‍🏫 2. FACULTY MEMBERS (Academic Instructors with Assigned Student Cohorts)
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

    // 📢 3. FACULTY ANNOUNCEMENTS & COHORT NOTICES
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
    ],

    // 👨‍🎓 4. MULTIPLE DISTINCT STUDENTS (Each with Isolated Personal Records)
    students: [
      // Student 1: Rohit Patil (Assigned to Prof. Arvind Joshi FAC-101)
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
          { period: "3-Month Check", scheduledDate: "Aug 2025", studentResponse: "Employed & Retained", employerVerified: true, verifiedSalary: "₹25,000 / month", status: "Completed" },
          { period: "6-Month Check", scheduledDate: "Nov 2025", studentResponse: "Promoted to Junior Developer", employerVerified: true, verifiedSalary: "₹28,000 / month", status: "Completed" }
        ]
      },

      // Student 2: Ayesha Naaz (Assigned to Prof. Arvind Joshi FAC-101)
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

      // Student 3: Rahul Verma (Assigned to Prof. Sunita Sharma FAC-102)
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

      // Student 4: Priya Jadhav (Assigned to Prof. Sunita Sharma FAC-102)
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

    // 🏢 5. VERIFIED ENTERPRISES & COMPANIES
    companies: [
      {
        id: 1,
        companyName: "Tech Solutions Pvt. Ltd.",
        logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200",
        contactEmail: "contact@techsolutions.com",
        contactPhone: "+91 20 6712 3400",
        industryType: "Information Technology & Cloud Infrastructure",
        district: "Pune",
        website: "https://techsolutions.co.in",
        companyDescription: "Premier engineering partner building cloud microservices, data architectures, and AI software.",
        employerVerificationScore: 98,
        trustGrade: "A+ State Trusted Employer",
        totalHired: 54,
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
        companyName: "Infosys BPM Digital",
        logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200",
        contactEmail: "recruitment@infosysbpm.com",
        contactPhone: "+91 20 6654 1000",
        industryType: "Business Process Management & Financial Analytics",
        district: "Pune & Nagpur",
        website: "https://infosysbpm.com",
        companyDescription: "Leading enterprise operations provider delivering automated analytics and BI pipelines.",
        employerVerificationScore: 96,
        trustGrade: "A State Trusted Employer",
        totalHired: 42,
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
        companyName: "Tata AutoComp Systems",
        logoUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200",
        contactEmail: "careers@tataautocomp.com",
        contactPhone: "+91 20 6608 5000",
        industryType: "Automotive Precision Manufacturing & Industrial IoT",
        district: "Pune & Bhosari",
        website: "https://tataautocomp.com",
        companyDescription: "Automotive innovation leader manufacturing smart telematics and industrial IoT systems.",
        employerVerificationScore: 95,
        trustGrade: "A State Trusted Employer",
        totalHired: 38,
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

    // 🛣️ 6. COMPANY CAREER PATHS
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

    // 🎓 7. COMPANY COURSES, ASSIGNMENTS & QUIZZES
    courses: [
      {
        id: "data-analytics",
        companyId: 2,
        companyName: "Infosys BPM Digital",
        code: "INF-DA-101",
        title: "Data Analytics & Business Intelligence with SQL & Power BI",
        category: "Data Analytics",
        provider: "Infosys BPM Digital Academy",
        instructor: "Pooja Kulkarni",
        instructorRole: "Lead Business Intelligence Architect",
        duration: "6 Weeks",
        level: "Industry Apprenticeship",
        requiredSkills: ["Excel", "Basic Math", "Analytical Thinking"],
        skillsTaught: ["Data Analytics", "SQL", "Power BI", "Statistics", "Data Modeling"],
        overview: "Industry curriculum teaching relational SQL query optimization, data warehousing, and executive Power BI visualization.",
        enrolled: true,
        progressPercent: 65,
        lessons: [
          { id: 1, title: "Foundations of Enterprise Metrics & Data Cleaning", duration: "25 min", completed: true, content: "Master KPI definitions: CAC, LTV, churn, and gross margins. Practical tabular data normalization." },
          { id: 2, title: "Relational SQL Joins, Aggregations & Query Execution Plans", duration: "45 min", completed: true, content: "Master INNER JOIN, LEFT JOIN, window functions (ROW_NUMBER, DENSE_RANK), and CTE index optimization." },
          { id: 3, title: "Automated Executive Dashboards in Power BI with DAX", duration: "35 min", completed: false, content: "Connecting live SQL data feeds, writing DAX expressions (CALCULATE, SUMX), and delivering drill-down reports." }
        ],
        assignment: {
          id: "asg-da-01",
          title: "Healthcare Logistics Inventory Shortfall Query & Visual Report",
          prompt: "Write an optimized SQL query that aggregates drug supply deficits across Maharashtra districts and upload your architecture/query report PDF.",
          deadline: "End of Week 4",
          maxMarks: 100,
          submitted: true
        },
        quiz: {
          id: "quiz-da-01",
          title: "SQL & Analytics Certification Assessment",
          passed: true,
          score: "100%",
          questions: [
            { q: "Which SQL clause is used to filter aggregated grouped data produced by GROUP BY?", options: ["WHERE", "HAVING", "ORDER BY", "FILTER"], correct: 1 },
            { q: "In modern Data Analytics pipelines, what does ETL stand for?", options: ["Extract, Transform, Load", "Evaluate, Train, Learn", "Encrypt, Test, Log", "Export, Terminate, Launch"], correct: 0 },
            { q: "Which measure of central tendency is least sensitive to extreme statistical outliers?", options: ["Mean", "Median", "Variance", "Range"], correct: 1 }
          ]
        }
      },
      {
        id: "cloud-microservices",
        companyId: 1,
        companyName: "Tech Solutions Pvt. Ltd.",
        code: "TS-CS-201",
        title: "Cloud Microservices Architecture & DevOps with AWS",
        category: "AWS Cloud",
        provider: "Tech Solutions Engineering Academy",
        instructor: "Vikram Malhotra",
        instructorRole: "Senior Cloud & Platform Architect",
        duration: "8 Weeks",
        level: "Advanced Apprenticeship",
        requiredSkills: ["Linux", "JavaScript", "REST APIs"],
        skillsTaught: ["AWS Cloud", "Docker", "Node.js", "CI/CD", "ECS Microservices"],
        overview: "Production curriculum covering multi-container Docker composition, AWS ECS clusters, IAM security, and automated deployment pipelines.",
        enrolled: false,
        progressPercent: 0,
        lessons: [
          { id: 1, title: "Microservices Decomposition & REST API Boundaries", duration: "30 min", completed: false, content: "Transitioning monolithic backends into decoupled Node.js microservices." },
          { id: 2, title: "Multi-Stage Dockerfile Optimization & Image Hardening", duration: "40 min", completed: false, content: "Building sub-100MB Alpine containers and managing non-root security contexts." }
        ],
        assignment: {
          id: "asg-cs-01",
          title: "Dockerized Microservice Deployment with GitHub Actions CI/CD",
          prompt: "Construct a multi-stage Dockerfile for a Node.js REST service, write a Docker Compose configuration with MySQL replication, and submit your project PDF.",
          deadline: "End of Week 6",
          maxMarks: 100,
          submitted: false
        },
        quiz: {
          id: "quiz-cs-01",
          title: "Cloud Microservices Competency Assessment",
          passed: false,
          score: null,
          questions: [
            { q: "What flag runs a Docker container in detached background mode?", options: ["docker run -d", "docker start -b", "docker exec -bg", "docker run -q"], correct: 0 },
            { q: "Which AWS service provides managed container orchestration?", options: ["Amazon ECS / EKS", "Amazon S3", "Amazon Route 53", "Amazon SNS"], correct: 0 },
            { q: "In Docker networking, what is the default network driver for containers?", options: ["bridge", "host", "overlay", "none"], correct: 0 }
          ]
        }
      }
    ],

    // 📝 8. STUDENT PROJECT SUBMISSIONS & EVALUATIONS (Linked to exact student ID)
    courseSubmissions: [
      {
        id: 1,
        courseId: "data-analytics",
        courseTitle: "Data Analytics & Business Intelligence with SQL & Power BI",
        companyId: 2,
        companyName: "Infosys BPM Digital",
        studentId: 1,
        studentName: "Rohit Patil",
        studentEmail: "rohit.patil@skilltrack.org",
        studentPassportId: "SKP-MH-2024-008912",
        facultyId: "FAC-101",
        assignmentTitle: "Healthcare Logistics Inventory Shortfall Query & Visual Report",
        submissionDate: "2026-02-28",
        submissionText: "SELECT district_name, SUM(deficit_count) FROM health_warehouse WHERE supply_status = 'Critical' GROUP BY district_name HAVING SUM(deficit_count) > 1000 ORDER BY 2 DESC;",
        projectFileName: "healthcare_logistics_query_report.pdf",
        projectFileUrl: "https://skilltrack.org/deliverables/healthcare_logistics_query_report.pdf",
        githubUrl: "https://github.com/rohit-patil-dev/health-tracker",
        quizScore: "100%",
        evaluationStatus: "Graded",
        marks: 96,
        grade: "Grade A+",
        evaluator: "Prof. Arvind Joshi (FAC-101) & Pooja Kulkarni",
        feedback: "Exemplary SQL CTE structure and sub-50ms query plan. Verified data normalization.",
        skillEndorsed: "Data Analytics & Advanced SQL"
      },
      {
        id: 2,
        courseId: "cloud-microservices",
        courseTitle: "Cloud Microservices Architecture & DevOps with AWS",
        companyId: 1,
        companyName: "Tech Solutions Pvt. Ltd.",
        studentId: 2,
        studentName: "Ayesha Naaz",
        studentEmail: "ayesha.naaz@skilltrack.org",
        studentPassportId: "SKP-MH-2024-009142",
        facultyId: "FAC-101",
        assignmentTitle: "Dockerized Microservice Deployment with GitHub Actions CI/CD",
        submissionDate: "2026-03-01",
        submissionText: "FROM node:18-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build",
        projectFileName: "ayesha_docker_deployment_specs.pdf",
        projectFileUrl: "https://skilltrack.org/deliverables/ayesha_docker.pdf",
        githubUrl: "https://github.com/ayesha-naaz-dev/k8s-health-probe",
        quizScore: "100%",
        evaluationStatus: "Graded",
        marks: 98,
        grade: "Grade A+",
        evaluator: "Prof. Arvind Joshi (FAC-101)",
        feedback: "Outstanding multi-stage Alpine Dockerfile optimization. Sub-65MB container size achieved.",
        skillEndorsed: "Docker & AWS ECS Microservices"
      }
    ],

    // 📋 9. APPLICATIONS (Linked to exact student ID)
    applications: [
      {
        id: 1,
        jobId: 2,
        jobTitle: "Associate Full Stack Developer",
        companyId: 1,
        companyName: "Tech Solutions Pvt. Ltd.",
        companyLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200",
        studentId: 1,
        studentName: "Rohit Patil",
        studentEmail: "rohit.patil@skilltrack.org",
        studentPassportId: "SKP-MH-2024-008912",
        appliedDate: "2026-02-15",
        status: "Selected",
        matchScore: 92,
        interviewInfo: {
          round: "Technical Architecture & System Design",
          date: "2026-02-20",
          time: "03:00 PM IST",
          mode: "Google Meet",
          meetingLink: "https://meet.google.com/xyz-tech-round",
          interviewer: "Vikram Malhotra (Lead Architect)",
          feedback: "Demonstrated strong knowledge in Node.js, SQL schema design, and modular REST services."
        }
      },
      {
        id: 2,
        jobId: 1,
        jobTitle: "Junior Cloud & DevOps Associate",
        companyId: 1,
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
          round: "Cloud Microservices & Docker Assessment",
          date: "Tomorrow",
          time: "11:30 AM IST",
          mode: "Google Meet",
          meetingLink: "https://meet.google.com/skt-cloud-round",
          interviewer: "Vikram Malhotra (Lead Architect)",
          feedback: "Shortlisted based on verified AWS Cloud competency."
        }
      },
      {
        id: 3,
        jobId: 1,
        jobTitle: "Junior Cloud & DevOps Associate",
        companyId: 1,
        companyName: "Tech Solutions Pvt. Ltd.",
        companyLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200",
        studentId: 2,
        studentName: "Ayesha Naaz",
        studentEmail: "ayesha.naaz@skilltrack.org",
        studentPassportId: "SKP-MH-2024-009142",
        appliedDate: "2026-02-25",
        status: "Interview Scheduled",
        matchScore: 94,
        interviewInfo: {
          round: "Kubernetes & Linux Kernel Evaluation",
          date: "Friday",
          time: "02:00 PM IST",
          mode: "Google Meet",
          meetingLink: "https://meet.google.com/ayesha-k8s-round",
          interviewer: "Vikram Malhotra (Lead Architect)",
          feedback: "Top candidate in Linux administration and automated container orchestration."
        }
      }
    ],

    // 🏛️ 10. GOVERNMENT OVERSIGHT
    government: {
      id: 1,
      userId: 11,
      name: "Dr. Rajesh Deshmukh",
      officialEmail: "officer@skilltrack.gov",
      department: "Department of Skills, Employment, Entrepreneurship and Innovation",
      organization: "Maharashtra State Innovation Society (MSInS) & MSSDS",
      kpis: {
        totalTrainees: "2,48,572",
        trainedThisMonth: "18,392",
        placed: "1,58,943",
        placementRate: "87.4%",
        retention6M: "88.4%",
        retention12M: "82.1%",
        averageSalary: "₹24,650 / month",
        salaryGrowthYoY: "+38.5%"
      }
    },

    // ⚙️ 11. ADMIN AUDIT & GOVERNANCE
    admin: {
      id: 1,
      name: "Master Administrator",
      email: "admin@skilltrack.org",
      auditLogs: [
        { id: 101, timestamp: "2026-03-02T10:14:22Z", actor: "arvind.joshi@faculty.skilltrack.org", action: "EVALUATE_STUDENT_PROJECT", target: "Rohit Patil (SKP-008912)", status: "Success" }
      ]
    }
  };
}

let database;
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.students || !parsed.faculty || !parsed.companies || !parsed.courses) {
      database = getInitialData();
      saveDatabase();
    } else {
      database = parsed;
    }
  } else {
    database = getInitialData();
    saveDatabase();
  }
} catch (err) {
  database = getInitialData();
  saveDatabase();
}

// Ensure database.student points to first student for backwards compatibility
if (!database.student && database.students && database.students.length > 0) {
  database.student = database.students[0];
}

function saveDatabase() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(database, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to save database:", err);
  }
}

function getDatabaseMetrics() {
  return {
    engine: "Persistent JSON Storage Engine (Zero external dependencies)",
    dataFile: DATA_FILE,
    totalUsers: (database.users || []).length,
    totalStudents: (database.students || []).length,
    totalFaculty: (database.faculty || []).length,
    totalCompanies: (database.companies || []).length,
    totalCourses: (database.courses || []).length,
    totalSubmissions: (database.courseSubmissions || []).length,
    totalApplications: (database.applications || []).length,
    lastSync: new Date().toISOString()
  };
}

module.exports = {
  database,
  saveDatabase,
  hashPassword,
  verifyPassword,
  getDatabaseMetrics,
  getInitialData
};
