export const createClubMembersTable = async (pool) => {
  console.log('Creating ClubMembers table...');
  await pool.query(`
    CREATE TABLE ClubMembers (
      id SERIAL PRIMARY KEY,
      club_id INT NOT NULL,
      user_id INT NOT NULL,
      position VARCHAR(100),
      joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
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
  await pool.query('DROP TABLE IF EXISTS ClubMembers CASCADE');
};
