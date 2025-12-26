export const createEventApprovalsTable = async (pool) => {
  console.log('Creating EventApprovals table...');
  await pool.query(`
    CREATE TABLE EventApprovals (
      id SERIAL PRIMARY KEY,
      event_id INT NOT NULL,
      approved_by INT NOT NULL,
      approval_status VARCHAR(20) CHECK (approval_status IN ('approved', 'rejected')),
      comments TEXT,
      approval_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES Events(id),
      FOREIGN KEY (approved_by) REFERENCES Users(id)
    )
  `);
  console.log('✅ EventApprovals table created');
};

export const dropEventApprovalsTable = async (pool) => {
  await pool.query('DROP TABLE IF EXISTS EventApprovals CASCADE');
};
