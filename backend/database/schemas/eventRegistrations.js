export const createEventRegistrationsTable = async (pool) => {
  console.log('Creating EventRegistrations table...');
  await pool.query(`
    CREATE TABLE EventRegistrations (
      id SERIAL PRIMARY KEY,
      event_id INT NOT NULL,
      user_id INT NOT NULL,
      registration_type VARCHAR(20) CHECK (registration_type IN ('performer', 'attendee')),
      status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
      registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      additional_info TEXT,
      FOREIGN KEY (event_id) REFERENCES Events(id),
      FOREIGN KEY (user_id) REFERENCES Users(id),
      UNIQUE(event_id, user_id),
      registration_url VARCHAR(1024)
    )
  `);
  console.log('✅ EventRegistrations table created');
};

export const dropEventRegistrationsTable = async (pool) => {
  await pool.query('DROP TABLE IF EXISTS EventRegistrations CASCADE');
};
