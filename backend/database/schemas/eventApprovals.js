export const createEventApprovalsTable = async (pool) => {
  console.log('Creating EventApprovals table...');
  await pool.request().query(`
    CREATE TABLE EventApprovals (
      id INT IDENTITY(1,1) PRIMARY KEY,
      event_id INT NOT NULL,
      approved_by INT NOT NULL,
      approval_status NVARCHAR(20) CHECK (approval_status IN ('approved', 'rejected')),
      comments NVARCHAR(MAX),
      approval_date DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (event_id) REFERENCES Events(id),
      FOREIGN KEY (approved_by) REFERENCES Users(id)
    )
  `);
  console.log('✅ EventApprovals table created');
};

export const dropEventApprovalsTable = async (pool) => {
  await pool.request().query('DROP TABLE IF EXISTS EventApprovals');
};