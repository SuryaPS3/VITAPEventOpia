export const createPromotionRequestsTable = async (pool) => {
  console.log('Creating PromotionRequests table...');
  await pool.request().query(`
    CREATE TABLE PromotionRequests (
      id INT IDENTITY(1,1) PRIMARY KEY,
      user_id INT NOT NULL,
      requested_role NVARCHAR(50) NOT NULL,
      status NVARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (user_id) REFERENCES Users(id)
    )
  `);
  console.log('✅ PromotionRequests table created');
};

export const dropPromotionRequestsTable = async (pool) => {
  await pool.request().query('DROP TABLE IF EXISTS PromotionRequests');
};
