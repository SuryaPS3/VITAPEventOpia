export const createCircularsTable = async (pool) => {
  console.log('Creating Circulars table...');
  await pool.query(`
    CREATE TABLE Circulars (
      id SERIAL PRIMARY KEY,
      title VARCHAR(300) NOT NULL,
      content TEXT NOT NULL,
      created_by INT NOT NULL,
      target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'clubs', 'students', 'faculty')),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES Users(id)
    )
  `);
  console.log('✅ Circulars table created');
};

export const dropCircularsTable = async (pool) => {
  await pool.query('DROP TABLE IF EXISTS Circulars CASCADE');
};
