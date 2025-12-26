export const createEventsTable = async (pool) => {
  console.log('Creating Events table...');
  await pool.query(`
    CREATE TABLE Events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(300) NOT NULL,
      description TEXT,
      category VARCHAR(100) DEFAULT 'General',
      club_id INT NOT NULL,
      event_date DATE NOT NULL,
      event_time VARCHAR(20),
      venue VARCHAR(300),
      fee VARCHAR(50) DEFAULT 'Free',
      expected_attendees INT DEFAULT 0,
      registration_start TIMESTAMP,
      registration_end TIMESTAMP,
      registration_form_url VARCHAR(1024),
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
      created_by INT NOT NULL,
      approved_by INT,
      approval_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES Clubs(id),
      FOREIGN KEY (created_by) REFERENCES Users(id),
      FOREIGN KEY (approved_by) REFERENCES Users(id)
    )
  `);
  console.log('✅ Events table created');
};

export const dropEventsTable = async (pool) => {
  await pool.query('DROP TABLE IF EXISTS Events CASCADE');
};
