export const createEventRegistrationsTable = async (pool) => {
  console.log('Creating EventRegistrations table...');
  await pool.request().query(`
    CREATE TABLE EventRegistrations (
      id INT IDENTITY(1,1) PRIMARY KEY,
      event_id INT NOT NULL,
      user_id INT NOT NULL,
      registration_type NVARCHAR(20) CHECK (registration_type IN ('performer', 'attendee')),
      status NVARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
      registration_time DATETIME2 DEFAULT GETDATE(),
      additional_info NVARCHAR(MAX),
      FOREIGN KEY (event_id) REFERENCES Events(id),
      FOREIGN KEY (user_id) REFERENCES Users(id),
      UNIQUE(event_id, user_id),
      registration_url NVARCHAR(1024)
    )
  `);
  console.log('✅ EventRegistrations table created');
};

export const dropEventRegistrationsTable = async (pool) => {
  await pool.request().query('DROP TABLE IF EXISTS EventRegistrations');
};