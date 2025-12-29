export const createUserSessionsTable = async (pool) => {
  console.log('Creating UserSessions table...');
  await pool.query(`
    CREATE TABLE UserSessions (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL,
      session_token VARCHAR(500) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users(id)
    )
  `);
  console.log('✅ UserSessions table created');
};

export const dropUserSessionsTable = async (pool) => {
  await pool.query('DROP TABLE IF EXISTS UserSessions CASCADE');
};
