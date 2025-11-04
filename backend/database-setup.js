import { getPool, closePool } from './config/database.js';

// Schema fns
import { createUsersTable, dropUsersTable } from './database/schemas/users.js';
import { createClubsTable, dropClubsTable } from './database/schemas/clubs.js';
import { createClubMembersTable, dropClubMembersTable } from './database/schemas/clubMembers.js';
import { createEventsTable, dropEventsTable } from './database/schemas/events.js';
import { createEventRegistrationsTable, dropEventRegistrationsTable } from './database/schemas/eventRegistrations.js';
import { createCircularsTable, dropCircularsTable } from './database/schemas/circulars.js';
import { createEventApprovalsTable, dropEventApprovalsTable } from './database/schemas/eventApprovals.js';
import { createUserSessionsTable, dropUserSessionsTable } from './database/schemas/userSessions.js';

import { seedDatabase } from './database/seeds/initialData.js';

async function setupDatabase() {
  let pool;
  try {
    console.log('🔄 Connecting to database...');
    pool = await getPool();
    console.log('✅ Connected successfully\n');

    console.log('🗑️  Dropping existing tables...\n');
    await dropUserSessionsTable(pool);
    await dropEventApprovalsTable(pool);
    await dropCircularsTable(pool);
    await dropEventRegistrationsTable(pool);
    await dropEventsTable(pool);
    await dropClubMembersTable(pool);
    await dropClubsTable(pool);
    await dropUsersTable(pool);
    console.log('✅ All existing tables dropped\n');

    console.log('📋 Creating tables...\n');
    await createUsersTable(pool);
    await createClubsTable(pool);
    await createClubMembersTable(pool);
    await createEventsTable(pool);
    await createEventRegistrationsTable(pool);
    await createCircularsTable(pool);
    await createEventApprovalsTable(pool);
    await createUserSessionsTable(pool);

    console.log('\n📊 Creating indexes...');
    await pool.request().query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.indexes 
        WHERE name = 'IX_Users_Email' AND object_id = OBJECT_ID('dbo.Users')
      ) CREATE INDEX IX_Users_Email ON dbo.Users(email);

      IF NOT EXISTS (
        SELECT 1 FROM sys.indexes 
        WHERE name = 'IX_Users_Role' AND object_id = OBJECT_ID('dbo.Users')
      ) CREATE INDEX IX_Users_Role ON dbo.Users(role);

      IF NOT EXISTS (
        SELECT 1 FROM sys.indexes 
        WHERE name = 'IX_Events_Status' AND object_id = OBJECT_ID('dbo.Events')
      ) CREATE INDEX IX_Events_Status ON dbo.Events(status);

      IF NOT EXISTS (
        SELECT 1 FROM sys.indexes 
        WHERE name = 'IX_EventRegistrations_Event' AND object_id = OBJECT_ID('dbo.EventRegistrations')
      ) CREATE INDEX IX_EventRegistrations_Event ON dbo.EventRegistrations(event_id);
    `);
    console.log('✅ Indexes created');

    await seedDatabase(pool);

    console.log('🎉 EventOpia database setup completed successfully!\n');
    console.log('🔐 Default Login Credentials:');
    console.log('   Admin: admin@vitap.ac.in / admin123');
    console.log('   Faculty: faculty@vitap.ac.in / faculty123');
    console.log('   Student: student@vitap.ac.in / student123\n');
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('Full error:', error);
  } finally {
    await closePool();
  }
}

setupDatabase();