export const createUserSessionsTable = async (pool) => {
  console.log('Creating UserSessions table...');
  await pool.request().query(`
    CREATE TABLE UserSessions (
      id INT IDENTITY(1,1) PRIMARY KEY,
      user_id INT NOT NULL,
      session_token NVARCHAR(500) NOT NULL UNIQUE,
      expires_at DATETIME2 NOT NULL,
      created_at DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (user_id) REFERENCES Users(id)
    )
  `);
  console.log('✅ UserSessions table created');
};

export const dropUserSessionsTable = async (pool) => {
  await pool.request().query('DROP TABLE IF EXISTS UserSessions');
};