export const createUsersTable = async (pool) => {
  console.log('Creating Users table...');
  await pool.request().query(`
    CREATE TABLE Users (
      id INT IDENTITY(1,1) PRIMARY KEY,
      email NVARCHAR(255) NOT NULL UNIQUE,
      password_hash NVARCHAR(255) NOT NULL,
      first_name NVARCHAR(100) NOT NULL,
      last_name NVARCHAR(100) NOT NULL,
      role NVARCHAR(50) NOT NULL CHECK (role IN ('visitor', 'admin', 'club_faculty', 'club_admin', 'club_member', 'department_head')),
      student_id NVARCHAR(20),
      phone NVARCHAR(20),
      is_active BIT DEFAULT 1,
      created_at DATETIME2 DEFAULT GETDATE(),
      updated_at DATETIME2 DEFAULT GETDATE()
    )
  `);
  console.log('✅ Users table created');
};

export const dropUsersTable = async (pool) => {
  await pool.request().query('DROP TABLE IF EXISTS Users');
};