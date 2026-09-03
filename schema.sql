-- =========================================================================
-- SkillBridge Complete Relational Database Schema (MySQL / MariaDB / PostgreSQL)
-- =========================================================================

CREATE DATABASE IF NOT EXISTS skillbridge_db;
USE skillbridge_db;

-- 1. Users & Authentication Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    role ENUM('student', 'industry', 'government', 'helpline') NOT NULL,
    auth_provider VARCHAR(50) DEFAULT 'local',
    status ENUM('active', 'banned', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Students Profiles (Imran Khan)
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    location VARCHAR(150) DEFAULT 'Hyderabad, India',
    college VARCHAR(255) DEFAULT 'Lords Institute of Engineering & Technology',
    cgpa VARCHAR(10) DEFAULT '8.15',
    about_me TEXT,
    skills JSON,
    overall_progress INT DEFAULT 72,
    avatar_url TEXT,
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Industry / Employers (TechSolutions Pvt. Ltd.)
CREATE TABLE IF NOT EXISTS industries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(150) DEFAULT 'Hyderabad, Telangana',
    email VARCHAR(255) NOT NULL,
    active_jobs INT DEFAULT 12,
    total_applicants INT DEFAULT 245,
    interviews_scheduled INT DEFAULT 18,
    total_hired INT DEFAULT 7,
    status ENUM('active', 'under_review', 'blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Courses & Learning Modules
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    duration VARCHAR(50) DEFAULT '6 Weeks',
    level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    icon VARCHAR(50) DEFAULT 'fa-database',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Student Course Progress & Continue Learning
CREATE TABLE IF NOT EXISTS student_learning_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    progress_percentage INT DEFAULT 0,
    next_lesson VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 6. Exams & Assessments
CREATE TABLE IF NOT EXISTS assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date VARCHAR(50) DEFAULT '20 May 2025',
    duration_minutes INT DEFAULT 60,
    total_questions INT DEFAULT 30,
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled'
);

-- 7. Digital Certificates
CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    issue_date VARCHAR(50) NOT NULL,
    credential_id VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 8. Job Postings
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    industry_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    job_type VARCHAR(50) DEFAULT 'Full-time',
    location VARCHAR(150) DEFAULT 'Hyderabad',
    salary_range VARCHAR(100) DEFAULT '₹6.5 - ₹9.0 LPA',
    posted_date VARCHAR(50) DEFAULT '15 May 2025',
    applicants_count INT DEFAULT 12,
    status ENUM('open', 'closed') DEFAULT 'open',
    FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE
);

-- 9. Interviews & Candidate Queue
CREATE TABLE IF NOT EXISTS interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    status ENUM('Waiting', 'Scheduled', 'Completed') DEFAULT 'Waiting',
    position_in_queue INT DEFAULT 1,
    date_added VARCHAR(50) DEFAULT '18 May 2025',
    tab ENUM('upcoming', 'waiting_list', 'completed') DEFAULT 'waiting_list',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 10. Helpline & Support Tickets
CREATE TABLE IF NOT EXISTS helpline_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('student', 'industry', 'general') DEFAULT 'student',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Open', 'In Progress', 'Resolved') DEFAULT 'Open',
    time_logged VARCHAR(50) DEFAULT 'Just now',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    time_label VARCHAR(50) DEFAULT 'Just now',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- SEED INITIAL DATA (Matches the Architecture Flow)
-- =========================================================================

-- Seed Users
INSERT INTO users (id, email, password_hash, salt, role, status) VALUES
(1, 'imran1khan@gmail.com', '50e7b243407987bbdf930c713b1fc4df088bc0d9fa8ec72390a8a658d53066f1c42f37e408ec22e49c719e68a35ee7f31131754fc3ba8903c73491f09ea1bca6', 'd9818861ef171097e3c988942b03faee', 'student', 'active'),
(2, 'contact@techsolutions.com', '50e7b243407987bbdf930c713b1fc4df088bc0d9fa8ec72390a8a658d53066f1c42f37e408ec22e49c719e68a35ee7f31131754fc3ba8903c73491f09ea1bca6', '709ca4d9a247a3e75e117462bb6368da', 'industry', 'active'),
(3, 'admin@skillbridge.gov', '50e7b243407987bbdf930c713b1fc4df088bc0d9fa8ec72390a8a658d53066f1c42f37e408ec22e49c719e68a35ee7f31131754fc3ba8903c73491f09ea1bca6', '4bc3f15d2a91283c74619b0aa897e51c', 'government', 'active'),
(4, 'helpline@skillbridge.org', '50e7b243407987bbdf930c713b1fc4df088bc0d9fa8ec72390a8a658d53066f1c42f37e408ec22e49c719e68a35ee7f31131754fc3ba8903c73491f09ea1bca6', '18f4a13d2a91283c74619b0aa897e52a', 'helpline', 'active')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Seed Imran Khan Profile
INSERT INTO students (id, user_id, full_name, email, location, college, cgpa, about_me, skills, overall_progress) VALUES
(1, 1, 'Imran Khan', 'imran1khan@gmail.com', 'Hyderabad, India', 'Lords Institute of Engineering & Technology', '8.15', 'Passionate about data and analytics. Always eager to learn new things and solve real-world problems.', '["Python", "SQL", "Excel", "Power BI", "Pandas", "Numpy"]', 72)
ON DUPLICATE KEY UPDATE overall_progress=VALUES(overall_progress);

-- Seed TechSolutions Industry
INSERT INTO industries (id, user_id, company_name, location, email, active_jobs, total_applicants, interviews_scheduled, total_hired) VALUES
(1, 2, 'TechSolutions Pvt. Ltd.', 'Hyderabad, Telangana', 'contact@techsolutions.com', 12, 245, 18, 7)
ON DUPLICATE KEY UPDATE total_hired=VALUES(total_hired);

-- Seed Helpline Tickets
INSERT INTO helpline_tickets (id, category, title, description, status, time_logged) VALUES
(101, 'student', 'Student - Login issue', 'I am unable to login to my account using email credentials.', 'Open', '10m ago'),
(102, 'industry', 'Industry - Unable to Post Job', 'We are facing an issue while posting a job.', 'In Progress', '35m ago'),
(103, 'student', 'Course Certificate', 'Certificate not showing after course completion.', 'Resolved', '2h ago')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Seed Interviews Queue (Positions 3, 5, 7)
INSERT INTO interviews (id, student_id, company_name, role, status, position_in_queue, date_added, tab) VALUES
(1, 1, 'Infosys', 'Data Analyst', 'Waiting', 3, '18 May 2025', 'waiting_list'),
(2, 1, 'Wipro', 'Business Analyst', 'Waiting', 5, '17 May 2025', 'waiting_list'),
(3, 1, 'Tech Mahindra', 'Data Associate', 'Waiting', 7, '16 May 2025', 'waiting_list')
ON DUPLICATE KEY UPDATE position_in_queue=VALUES(position_in_queue);
