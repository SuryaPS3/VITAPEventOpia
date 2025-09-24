// Load environment variables
require('dotenv').config();

const sql = require('mssql');

// Database configuration
const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    requestTimeout: 60000, // Increased for schema creation
    connectionTimeout: 60000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

async function createEventOpiaSchema() {
  let pool;
  
  try {
    console.log('Connecting to Azure SQL Database...');
    pool = await sql.connect(dbConfig);
    console.log('Connected successfully');

    // Drop existing tables (in reverse order of dependencies)
    console.log('Dropping existing tables if they exist...');
    
    const dropTables = [
      'UserSessions',
      'EventApprovals', 
      'Circulars',
      'EventRegistrations',
      'Events',
      'ClubMembers',
      'Clubs',
      'Users'
    ];

    for (const table of dropTables) {
      try {
        await pool.request().query(`DROP TABLE IF EXISTS ${table}`);
        console.log(`Dropped table: ${table}`);
      } catch (error) {
        console.log(`Table ${table} doesn't exist or couldn't be dropped`);
      }
    }

    // Create Users table
    console.log('Creating Users table...');
    await pool.request().query(`
      CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(255) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        role NVARCHAR(50) NOT NULL CHECK (role IN ('visitor', 'admin', 'club_faculty', 'club_admin', 'club_member')),
        student_id NVARCHAR(20),
        phone NVARCHAR(20),
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
      )
    `);

    // Create Clubs table
    console.log('Creating Clubs table...');
    await pool.request().query(`
      CREATE TABLE Clubs (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(200) NOT NULL,
        description NVARCHAR(MAX),
        club_email NVARCHAR(255) NOT NULL UNIQUE,
        faculty_coordinator_id INT,
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (faculty_coordinator_id) REFERENCES Users(id)
      )
    `);

    // Create ClubMembers table
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

    // Create Events table
    console.log('Creating Events table...');
    await pool.request().query(`
      CREATE TABLE Events (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(300) NOT NULL,
        description NVARCHAR(MAX),
        club_id INT NOT NULL,
        event_date DATETIME2 NOT NULL,
        location NVARCHAR(300),
        performer_quota INT DEFAULT 0,
        attendee_quota INT DEFAULT 0,
        registration_start DATETIME2,
        registration_end DATETIME2,
        status NVARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
        created_by INT NOT NULL,
        approved_by INT,
        approval_date DATETIME2,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (club_id) REFERENCES Clubs(id),
        FOREIGN KEY (created_by) REFERENCES Users(id),
        FOREIGN KEY (approved_by) REFERENCES Users(id)
      )
    `);

    // Create EventRegistrations table
    console.log('Creating EventRegistrations table...');
    await pool.request().query(`
      CREATE TABLE EventRegistrations (
        id INT IDENTITY(1,1) PRIMARY KEY,
        event_id INT NOT NULL,
        user_id INT NOT NULL,
        registration_type NVARCHAR(20) CHECK (registration_type IN ('performer', 'attendee')),
        status NVARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
        registration_time DATETIME2 DEFAULT GETDATE(),
        additional_info NVARCHAR(MAX),
        FOREIGN KEY (event_id) REFERENCES Events(id),
        FOREIGN KEY (user_id) REFERENCES Users(id),
        UNIQUE(event_id, user_id)
      )
    `);

    // Create Circulars table
    console.log('Creating Circulars table...');
    await pool.request().query(`
      CREATE TABLE Circulars (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(300) NOT NULL,
        content NVARCHAR(MAX) NOT NULL,
        created_by INT NOT NULL,
        target_audience NVARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'clubs', 'students', 'faculty')),
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (created_by) REFERENCES Users(id)
      )
    `);

    // Create EventApprovals table
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

    // Create UserSessions table
    console.log('Creating UserSessions table...');
    await pool.request().query(`
      CREATE TABLE UserSessions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        session_token NVARCHAR(500) NOT NULL UNIQUE,
        expires_at DATETIME2 NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES Users(id)
      )
    `);

    // Create indexes
    console.log('Creating indexes...');
    await pool.request().query('CREATE INDEX IX_Users_Email ON Users(email)');
    await pool.request().query('CREATE INDEX IX_Users_Role ON Users(role)');
    await pool.request().query('CREATE INDEX IX_ClubMembers_Club ON ClubMembers(club_id)');
    await pool.request().query('CREATE INDEX IX_Events_Club ON Events(club_id)');
    await pool.request().query('CREATE INDEX IX_Events_Status ON Events(status)');
    await pool.request().query('CREATE INDEX IX_EventRegistrations_Event ON EventRegistrations(event_id)');

    // Insert sample data
    console.log('Inserting sample data...');
    
    // Insert admin user
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await pool.request()
      .input('email', sql.NVarChar, 'admin@vitap.ac.in')
      .input('password_hash', sql.NVarChar, adminPassword)
      .input('first_name', sql.NVarChar, 'System')
      .input('last_name', sql.NVarChar, 'Admin')
      .input('role', sql.NVarChar, 'admin')
      .query(`
        INSERT INTO Users (email, password_hash, first_name, last_name, role)
        VALUES (@email, @password_hash, @first_name, @last_name, @role)
      `);

    // Insert sample club
    await pool.request()
      .input('name', sql.NVarChar, 'Technical Club')
      .input('description', sql.NVarChar, 'VIT-AP Technical Activities Club')
      .input('club_email', sql.NVarChar, 'tech@vitap.ac.in')
      .query(`
        INSERT INTO Clubs (name, description, club_email)
        VALUES (@name, @description, @club_email)
      `);

    console.log('EventOpia database schema created successfully!');
    console.log('Default admin user created:');
    console.log('Email: admin@vitap.ac.in');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating schema:', error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// Run the schema creation
if (require.main === module) {
  createEventOpiaSchema().then(() => {
    console.log('Schema setup completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Schema setup failed:', error);
    process.exit(1);
  });
}

module.exports = { createEventOpiaSchema };