import { getPool, closePool } from './config/database.js';

// Import schema creation functions
import { createUsersTable, dropUsersTable } from './database/schemas/users.js';
import { createClubsTable, dropClubsTable } from './database/schemas/clubs.js';
import { createClubMembersTable, dropClubMembersTable } from './database/schemas/clubMembers.js';
import { createEventsTable, dropEventsTable } from './database/schemas/events.js';
import { createEventRegistrationsTable, dropEventRegistrationsTable } from './database/schemas/eventRegistrations.js';
import { createCircularsTable, dropCircularsTable } from './database/schemas/circulars.js';
import { createEventApprovalsTable, dropEventApprovalsTable } from './database/schemas/eventApprovals.js';
import { createUserSessionsTable, dropUserSessionsTable } from './database/schemas/userSessions.js';

// Import seed data
import { seedInitialData } from './database/seeds/initialData.js';

async function setupDatabase() {
  let pool;
  
  try {
    console.log('🔄 Connecting to database...');
    pool = await getPool();
    console.log('✅ Connected successfully\n');

    // DROP TABLES (in reverse order of dependencies)
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

    // CREATE TABLES (in order of dependencies)
    console.log('📋 Creating tables...\n');
    
    await createUsersTable(pool);
    await createClubsTable(pool);
    await createClubMembersTable(pool);
    await createEventsTable(pool);
    await createEventRegistrationsTable(pool);
    await createCircularsTable(pool);
    await createEventApprovalsTable(pool);
    await createUserSessionsTable(pool);

    // CREATE INDEXES
    console.log('\n📊 Creating indexes...');
    await pool.request().query('CREATE INDEX IX_Users_Email ON Users(email)');
    await pool.request().query('CREATE INDEX IX_Users_Role ON Users(role)');
    await pool.request().query('CREATE INDEX IX_Events_Status ON Events(status)');
    await pool.request().query('CREATE INDEX IX_EventRegistrations_Event ON EventRegistrations(event_id)');
    console.log('✅ Indexes created');

    // SEED DATA
    await seedInitialData(pool);

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

// Run the setup
setupDatabase();