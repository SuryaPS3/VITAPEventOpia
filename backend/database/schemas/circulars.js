export const createCircularsTable = async (pool) => {
  console.log('Creating Circulars table...');
  await pool.request().query(`
    CREATE TABLE Circulars (
      id INT IDENTITY(1,1) PRIMARY KEY,
      title NVARCHAR(300) NOT NULL,
      content NVARCHAR(MAX) NOT NULL,
      created_by INT NOT NULL,
      target_audience NVARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'clubs', 'students', 'faculty')),
      is_active BIT DEFAULT 1,
      created_at DATETIME2 DEFAULT GETDATE(),
      updated_at DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (created_by) REFERENCES Users(id)
    )
  `);
  console.log('✅ Circulars table created');
};

export const dropCircularsTable = async (pool) => {
  await pool.request().query('DROP TABLE IF EXISTS Circulars');
};