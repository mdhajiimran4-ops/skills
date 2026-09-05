const pool = require('../server/config/db');

async function run() {
  console.log('Running consent and Trainee ID migration...');

  // Helper
  async function columnExists(table, column) {
    const [rows] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column]
    );
    return rows.length > 0;
  }

  // 1. Add trainee_id, consent_given, consent_date to student_profiles
  if (!(await columnExists('student_profiles', 'trainee_id'))) {
    console.log('Adding trainee_id to student_profiles...');
    await pool.query('ALTER TABLE student_profiles ADD COLUMN trainee_id VARCHAR(50) NULL UNIQUE');
  }

  if (!(await columnExists('student_profiles', 'consent_given'))) {
    console.log('Adding consent_given to student_profiles...');
    await pool.query('ALTER TABLE student_profiles ADD COLUMN consent_given BOOLEAN NOT NULL DEFAULT TRUE');
  }

  if (!(await columnExists('student_profiles', 'consent_date'))) {
    console.log('Adding consent_date to student_profiles...');
    await pool.query('ALTER TABLE student_profiles ADD COLUMN consent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  }

  // 2. Populate trainee_id for all existing students who do not have one
  const [students] = await pool.query(`
    SELECT sp.user_id, u.id AS uid
    FROM student_profiles sp
    JOIN users u ON u.id = sp.user_id
    WHERE sp.trainee_id IS NULL OR sp.trainee_id = ''
  `);

  console.log(`Found ${students.length} student profiles needing Trainee ID assignment.`);
  for (const s of students) {
    const padded = String(s.user_id).padStart(4, '0');
    const traineeId = `ST-2026-TR-${padded}`;
    await pool.query(
      'UPDATE student_profiles SET trainee_id = ?, consent_given = TRUE WHERE user_id = ?',
      [traineeId, s.user_id]
    );
    console.log(`Assigned ${traineeId} to user_id ${s.user_id}`);
  }

  console.log('Trainee ID and Consent migration completed successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
