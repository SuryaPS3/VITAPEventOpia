
import bcrypt from 'bcryptjs';

export const seedDatabase = async (pool) => {
  try {
    console.log('🌱 Seeding database...');

    // Seed Users
    console.log('  - Seeding users...');
    const users = [
      // Admins
      { email: 'admin1@vitap.ac.in', password: 'adminpass', first_name: 'Admin', last_name: 'One', role: 'admin' },
      { email: 'admin2@vitap.ac.in', password: 'adminpass', first_name: 'Admin', last_name: 'Two', role: 'admin' },
      // Club Faculty
      { email: 'faculty1@vitap.ac.in', password: 'facultypass', first_name: 'Faculty', last_name: 'One', role: 'club_faculty' },
      { email: 'faculty2@vitap.ac.in', password: 'facultypass', first_name: 'Faculty', last_name: 'Two', role: 'club_faculty' },
      { email: 'faculty3@vitap.ac.in', password: 'facultypass', first_name: 'Faculty', last_name: 'Three', role: 'club_faculty' },
      // Club Members
      { email: 'member1@vitap.ac.in', password: 'memberpass', first_name: 'Member', last_name: 'One', role: 'club_member' },
      { email: 'member2@vitap.ac.in', password: 'memberpass', first_name: 'Member', last_name: 'Two', role: 'club_member' },
      { email: 'member3@vitap.ac.in', password: 'memberpass', first_name: 'Member', last_name: 'Three', role: 'club_member' },
      { email: 'member4@vitap.ac.in', password: 'memberpass', first_name: 'Member', last_name: 'Four', role: 'club_member' },
      { email: 'member5@vitap.ac.in', password: 'memberpass', first_name: 'Member', last_name: 'Five', role: 'club_member' },
    ];

    for (const user of users) {
      const password_hash = await bcrypt.hash(user.password, 12);
      await pool.request()
        .input('email', user.email)
        .input('password_hash', password_hash)
        .input('first_name', user.first_name)
        .input('last_name', user.last_name)
        .input('role', user.role)
        .query('INSERT INTO Users (email, password_hash, first_name, last_name, role) VALUES (@email, @password_hash, @first_name, @last_name, @role)');
    }
    console.log('  ✅ Users seeded');

    // Seed Clubs
    console.log('  - Seeding clubs...');
    const clubs = [
      { name: 'Dance Club', description: 'All things dance', club_email: 'dance@vitap.ac.in', faculty_coordinator_id: 3 },
      { name: 'Music Club', description: 'All things music', club_email: 'music@vitap.ac.in', faculty_coordinator_id: 4 },
      { name: 'Literary Club', description: 'All things literary', club_email: 'literary@vitap.ac.in', faculty_coordinator_id: 5 },
    ];

    for (const club of clubs) {
      await pool.request()
        .input('name', club.name)
        .input('description', club.description)
        .input('club_email', club.club_email)
        .input('faculty_coordinator_id', club.faculty_coordinator_id)
        .query('INSERT INTO Clubs (name, description, club_email, faculty_coordinator_id) VALUES (@name, @description, @club_email, @faculty_coordinator_id)');
    }
    console.log('  ✅ Clubs seeded');

    // Seed Events
    console.log('  - Seeding events...');
    const events = [
      { title: 'Dance Workshop', description: 'Learn new moves', club_id: 1, event_date: '2025-11-15', location: 'Auditorium', created_by: 3 },
      { title: 'Battle of the Bands', description: 'Rock on!', club_id: 2, event_date: '2025-11-20', location: 'Amphitheatre', created_by: 4 },
      { title: 'Poetry Slam', description: 'Express yourself', club_id: 3, event_date: '2025-11-25', location: 'Library', created_by: 5 },
      { title: 'Salsa Night', description: 'Latin rhythms', club_id: 1, event_date: '2025-12-01', location: 'Auditorium', created_by: 3 },
      { title: 'Open Mic', description: 'Share your talent', club_id: 2, event_date: '2025-12-05', location: 'Amphitheatre', created_by: 4 },
    ];

    for (const event of events) {
      await pool.request()
        .input('title', event.title)
        .input('description', event.description)
        .input('club_id', event.club_id)
        .input('event_date', event.event_date)
        .input('location', event.location)
        .input('created_by', event.created_by)
        .query('INSERT INTO Events (title, description, club_id, event_date, location, created_by) VALUES (@title, @description, @club_id, @event_date, @location, @created_by)');
    }
    console.log('  ✅ Events seeded');

    console.log('🌳 Database seeding complete');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
};
