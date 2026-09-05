const pool = require('../server/config/db');

async function seedData() {
  console.log('Seeding rich assignments, workshops, and lectures...');

  // 1. Add assignments
  const assignmentsData = [
    [
      'Machine Learning Predictive Churn Model in Python',
      'Train, evaluate, and tune a Random Forest and XGBoost model on customer telemetry data to predict 30-day retention with >85% precision.',
      '1. Clean dataset\n2. Perform exploratory feature correlation\n3. Train cross-validated classifier\n4. Export confusion matrix and feature importances report.',
      'Python, Scikit-Learn, Pandas, Data Modeling',
      'advanced',
      '2026-11-15'
    ],
    [
      'PLC Ladder Logic & Industrial Conveyor Simulation',
      'Design and simulate a 3-stage automated industrial sorter with pneumatic ejectors and optical infrared sensors.',
      '1. Implement start/stop latch circuit with E-stop priority\n2. Create timer-based part counting\n3. Simulate faults and alarms.',
      'PLC, SCADA, Ladder Logic, Industrial Automation',
      'intermediate',
      '2026-10-30'
    ],
    [
      'Cloud Infrastructure as Code with Terraform & AWS',
      'Provision a multi-AZ VPC, private subnets, RDS MySQL instance, and auto-scaled ECS cluster using modular Terraform.',
      '1. Write reusable Terraform modules\n2. Configure remote S3 state with DynamoDB locking\n3. Deploy and test end-to-end failover.',
      'AWS, Terraform, Cloud Architecture, Docker',
      'advanced',
      '2026-11-20'
    ],
    [
      'Cybersecurity Penetration Testing & Vulnerability Audit',
      'Conduct an authorized ethical security audit on a simulated staging portal to discover OWASP Top 10 vulnerabilities.',
      '1. Enumerate endpoints and headers with Nmap & Burp Suite\n2. Test for SQL injection and IDOR\n3. Submit executive remediation report.',
      'Cybersecurity, Ethical Hacking, Network Security, Linux',
      'intermediate',
      '2026-11-05'
    ],
    [
      'React Redux State Management & Real-Time Dashboard',
      'Build a reactive real-time telemetry dashboard using React 18, RTK Query, and WebSocket subscriptions.',
      '1. Setup scalable Redux store with normalized slices\n2. Integrate live chart visualizer\n3. Handle reconnect and offline fallback.',
      'React, Redux, JavaScript, TypeScript, WebSockets',
      'intermediate',
      '2026-10-25'
    ],
    [
      'AutoCAD & SolidWorks 3D Gearbox Design',
      'Model a dual-stage reduction spur gearbox assembly meeting ISO 6336 mechanical stress and fatigue limits.',
      '1. Calculate module, pitch, and gear ratios\n2. Model 3D components in SolidWorks\n3. Export engineering 2D manufacturing drawings.',
      'AutoCAD, SolidWorks, Mechanical Design, CAD/CAM',
      'intermediate',
      '2026-11-10'
    ],
    [
      'Embedded C & Sensor Interfacing Lab',
      'Program an STM32/ESP32 microcontroller over I2C/SPI to poll environmental sensors with power-saving deep sleep modes.',
      '1. Configure hardware timers and DMA\n2. Parse sensor packets without blocking\n3. Publish telemetry over MQTT.',
      'Embedded C, Microcontrollers, IoT, C++',
      'intermediate',
      '2026-11-01'
    ]
  ];

  for (const a of assignmentsData) {
    const [existing] = await pool.query('SELECT id FROM assignments WHERE title = ?', [a[0]]);
    if (!existing.length) {
      await pool.query(
        `INSERT INTO assignments (company_id, title, description, instructions, skills_required, difficulty, deadline, status)
         VALUES (1, ?, ?, ?, ?, ?, ?, 'published')`,
        a
      );
    }
  }

  // 2. Add workshops
  const workshopsData = [
    [
      'Hands-on Industrial Robotics & ABB Robot Programming Workshop',
      '3-day intensive laboratory workshop covering 6-axis articulated robot kinematics, teach pendant programming, safety interlocking, and automated welding/palletizing routines.',
      'Government Polytechnic Pune & ABB Robotics',
      'Er. Rajesh Deshmukh (Lead Robotics Specialist)',
      'Workshop & Bootcamp',
      'Robotics, PLC, Industrial Automation',
      'intermediate',
      2,
      'Pune',
      'Maharashtra'
    ],
    [
      'AI & Big Data Engineering Hands-on Bootcamp',
      'Comprehensive hands-on weekend bootcamp focused on distributed data pipelines, Apache Spark on Databricks, and deploying LLM applications with LangChain and vector databases.',
      'National Skill Development Mission',
      'Dr. Ananya Sen (Principal Data Scientist)',
      'Workshop & Bootcamp',
      'Python, Apache Spark, Machine Learning, SQL',
      'advanced',
      3,
      'Bengaluru',
      'Karnataka'
    ],
    [
      'Electric Vehicle Powertrain & Battery Management Workshop',
      'Practical workshop covering EV motor drives, regenerative braking circuits, lithium-ion cell balancing, and CAN-bus battery management system (BMS) diagnostics.',
      'Tata Motors EV Centre of Excellence',
      'Er. Vikramaditya Kulkarni',
      'Workshop & Bootcamp',
      'Electric Vehicles, BMS, Automotive CAD, Power Electronics',
      'intermediate',
      2,
      'Pune',
      'Maharashtra'
    ],
    [
      'Semiconductor VLSI Design & FPGA Prototyping Workshop',
      'Hands-on lab training on RTL design, Verilog synthesis, timing closure, and FPGA hardware emulation on Xilinx Artix-7 boards.',
      'MSBTE & CDAC Skill Consortium',
      'Prof. S. R. Joshi (VLSI Architecture)',
      'Workshop & Bootcamp',
      'Verilog, VLSI, FPGA, Digital Electronics',
      'advanced',
      2,
      'Hyderabad',
      'Telangana'
    ]
  ];

  for (const w of workshopsData) {
    const [existing] = await pool.query('SELECT id FROM courses WHERE title = ?', [w[0]]);
    if (!existing.length) {
      await pool.query(
        `INSERT INTO courses (title, description, provider, instructor, category, skills_covered, difficulty, duration_weeks, district, state, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
        w
      );
    }
  }

  // 3. Seed some sample lectures / lessons for courses
  const [courses] = await pool.query('SELECT id, title FROM courses LIMIT 6');
  for (const c of courses) {
    const [existingLessons] = await pool.query('SELECT id FROM course_lessons WHERE course_id = ?', [c.id]);
    if (!existingLessons.length) {
      await pool.query(
        `INSERT INTO course_lessons (course_id, title, lesson_order, content_type, content_url, content_text)
         VALUES 
         (?, CONCAT('Lecture 1: Core Fundamentals & Principles of ', ?), 1, 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Core curriculum overview, industrial prerequisites, and safety standards.'),
         (?, 'Lecture 2: Architecture & Lab Implementation', 2, 'link', 'https://github.com/skilltrack/curriculum-labs', 'Step-by-step hands-on laboratory exercises and architectural design patterns.'),
         (?, 'Lecture 3: Production Deployment & Capstone Brief', 3, 'document', 'https://skilltrack.org/resources/syllabus.pdf', 'Industrial case studies, compliance benchmarks, and evaluation rubrics.')`,
        [c.id, c.title, c.id, c.id]
      );
    }
  }

  console.log('Seeding complete! Successfully added assignments, workshops, and lectures.');
  process.exit();
}

seedData().catch(err => {
  console.error(err);
  process.exit(1);
});
