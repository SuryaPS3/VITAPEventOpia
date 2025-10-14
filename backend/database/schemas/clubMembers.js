export const createClubMembersTable = async (pool) => {
  console.log('Creating ClubMembers table...');
  await pool.request().query(`
    CREATE TABLE ClubMembers (
      id INT IDENTITY(1,1) PRIMARY KEY,
      club_id INT NOT NULL,
      user_id INT NOT NULL,
      position NVARCHAR(100),
      joined_date DATETIME2 DEFAULT GETDATE(),
      is_active BIT DEFAULT 1,
      added_by INT,
      FOREIGN KEY (club_id) REFERENCES Clubs(id),
      FOREIGN KEY (user_id) REFERENCES Users(id),
      FOREIGN KEY (added_by) REFERENCES Users(id),
      UNIQUE(club_id, user_id)
    )
  `);
  console.log('✅ ClubMembers table created');
};

export const dropClubMembersTable = async (pool) => {
  await pool.request().query('DROP TABLE IF EXISTS ClubMembers');
};