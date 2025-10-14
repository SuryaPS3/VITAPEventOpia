export const createClubsTable = async (pool) => {
  console.log('Creating Clubs table...');
  await pool.request().query(`
    CREATE TABLE Clubs (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(200) NOT NULL,
      description NVARCHAR(MAX),
      club_email NVARCHAR(255) NOT NULL UNIQUE,
      faculty_coordinator_id INT,
      is_active BIT DEFAULT 1,
      created_at DATETIME2 DEFAULT GETDATE(),
      updated_at DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (faculty_coordinator_id) REFERENCES Users(id)
    )
  `);
  console.log('✅ Clubs table created');
};

export const dropClubsTable = async (pool) => {
  await pool.request().query('DROP TABLE IF EXISTS Clubs');
};