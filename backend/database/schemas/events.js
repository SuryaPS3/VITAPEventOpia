export const createEventsTable = async (pool) => {
  console.log('Creating Events table...');
  await pool.request().query(`
    CREATE TABLE Events (
      id INT IDENTITY(1,1) PRIMARY KEY,
      title NVARCHAR(300) NOT NULL,
      description NVARCHAR(MAX),
      category NVARCHAR(100) DEFAULT 'General',
      club_id INT NOT NULL,
      event_date DATE NOT NULL,
      event_time NVARCHAR(20),
      venue NVARCHAR(300),
      fee NVARCHAR(50) DEFAULT 'Free',
      expected_attendees INT DEFAULT 0,
      registration_start DATETIME2,
      registration_end DATETIME2,
      status NVARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
      created_by INT NOT NULL,
      approved_by INT,
      approval_date DATETIME2,
      created_at DATETIME2 DEFAULT GETDATE(),
      updated_at DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (club_id) REFERENCES Clubs(id),
      FOREIGN KEY (created_by) REFERENCES Users(id),
      FOREIGN KEY (approved_by) REFERENCES Users(id)
    )
  `);
  console.log('✅ Events table created');
};

export const dropEventsTable = async (pool) => {
  await pool.request().query('DROP TABLE IF EXISTS Events');
};