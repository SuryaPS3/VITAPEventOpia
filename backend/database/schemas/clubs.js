export const createClubsTable = async (pool) => {
  console.log('Creating Clubs table...');
  await pool.query(`
    CREATE TABLE Clubs (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      club_email VARCHAR(255) NOT NULL UNIQUE,
      faculty_coordinator_id INT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (faculty_coordinator_id) REFERENCES Users(id)
    )
  `);
  console.log('✅ Clubs table created');
};

export const dropClubsTable = async (pool) => {
  await pool.query('DROP TABLE IF EXISTS Clubs CASCADE');
};
