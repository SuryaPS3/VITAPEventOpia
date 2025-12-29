export const createUsersTable = async (pool) => {
  console.log('Creating Users table...');
  await pool.query(`
    CREATE TABLE Users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('visitor', 'admin', 'club_faculty', 'club_admin', 'club_member', 'department_head')),
      student_id VARCHAR(20),
      phone VARCHAR(20),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Users table created');
};

export const dropUsersTable = async (pool) => {
  await pool.query('DROP TABLE IF EXISTS Users CASCADE');
};
