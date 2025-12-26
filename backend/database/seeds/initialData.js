import bcrypt from 'bcryptjs';

// Utilities
const insert = async (pool, table, data) => {
  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
  const values = Object.values(data);
  const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
  await pool.query(query, values);
};

const getIdBy = async (pool, table, column, value) => {
  const res = await pool.query(`SELECT id FROM ${table} WHERE ${column} = $1 LIMIT 1`, [value]);
  return res.rows.length ? res.rows[0].id : null;
};

// Seeders
async function seedUsers(pool) {
  console.log('👤 Seeding Users...');
  const users = [
    { email: 'admin@vitap.ac.in', password: 'admin123', first_name: 'System', last_name: 'Admin', role: 'admin' },
    { email: 'head@vitap.ac.in', password: 'head123', first_name: 'Assistant', last_name: 'Director', role: 'department_head' },
    { email: 'faculty@vitap.ac.in', password: 'faculty123', first_name: 'Club', last_name: 'Faculty', role: 'club_faculty' },
    { email: 'student@vitap.ac.in', password: 'student123', first_name: 'Student', last_name: 'Member', role: 'club_member' },
  ];

  for (const user of users) {
    const password_hash = await bcrypt.hash(user.password, 10);
    await insert(pool, 'Users', { ...user, password_hash, is_active: true });
    console.log(`✅ User added or already exists: ${user.email}`);
  }
}

async function seedClubs(pool) {
  console.log('🏷️ Seeding Clubs...');
  const facultyId = await getIdBy(pool, 'Users', 'email', 'faculty@vitap.ac.in');
  if (!facultyId) {
    console.log('ℹ️ Skipping Clubs seed: faculty user not found.');
    return;
  }
  await insert(pool, 'Clubs', {
    name: 'Tech Club',
    description: 'Technology enthusiasts club',
    club_email: 'tech@vitap.ac.in',
    faculty_coordinator_id: facultyId,
    is_active: true,
  });
  console.log('✅ Club added or already exists: Tech Club');
}

async function seedClubMembers(pool) {
  console.log('👥 Seeding ClubMembers...');
  const clubId = await getIdBy(pool, 'Clubs', 'name', 'Tech Club');
  const facultyId = await getIdBy(pool, 'Users', 'email', 'faculty@vitap.ac.in');
  const studentId = await getIdBy(pool, 'Users', 'email', 'student@vitap.ac.in');

  if (!clubId || !facultyId || !studentId) {
    console.log('ℹ️ Skipping ClubMembers: missing club/user ids');
    return;
  }

  await insert(pool, 'ClubMembers', { club_id: clubId, user_id: facultyId, position: 'Coordinator', is_active: true });
  console.log('✅ ClubMember added: faculty');
  await insert(pool, 'ClubMembers', { club_id: clubId, user_id: studentId, position: 'Member', is_active: true });
  console.log('✅ ClubMember added: student');
}

async function seedEvents(pool) {
  console.log('📅 Seeding Events...');
  const clubId = await getIdBy(pool, 'Clubs', 'name', 'Tech Club');
  const createdById = await getIdBy(pool, 'Users', 'email', 'faculty@vitap.ac.in');

  if (!clubId || !createdById) {
    console.log('ℹ️ Skipping Events: missing club/user ids');
    return;
  }

  const events = [
    { title: 'Intro to Web Dev', category: 'Workshop', description: 'HTML/CSS/JS basics', venue: 'Auditorium', status: 'approved', event_date: '2025-10-20', event_time: '10:00:00', fee: 'Free', expected_attendees: 100, club_id: clubId, created_by: createdById },
    { title: 'Hackathon Night', category: 'Competition', description: 'Overnight coding challenge', venue: 'Lab 1', status: 'pending', event_date: '2025-11-05', event_time: '18:00:00', fee: 'Free', expected_attendees: 150, club_id: clubId, created_by: createdById },
  ];

  for (const event of events) {
    await insert(pool, 'Events', event);
    console.log(`✅ Event added or already exists: ${event.title}`);
  }
}

export async function seedInitialData(pool) {
  console.log('\n🌱 Seeding initial data...');
  try {
    await seedUsers(pool);
    await seedClubs(pool);
    await seedClubMembers(pool);
    await seedEvents(pool);
    // Add other seed functions here if needed
    console.log('🌱 Seeding complete.\n');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    throw err;
  }
}

export default seedInitialData;
