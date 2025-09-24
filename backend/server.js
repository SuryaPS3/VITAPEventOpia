// Load environment variables first
require('dotenv').config();

// Import necessary packages
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Initialize the Express app
const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
  credentials: true
}));

// Parse JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Azure SQL Database configuration
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
    requestTimeout: 30000,
    connectionTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Add JWT_SECRET to environment variables if not present
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not set in environment variables. Using default secret.');
  process.env.JWT_SECRET = 'eventopia-dev-secret-change-in-production';
}

// Debug configuration (remove in production)
console.log('Database Configuration:');
console.log('Server:', process.env.DB_SERVER);
console.log('Database:', process.env.DB_DATABASE);
console.log('User:', process.env.DB_USER);
console.log('Password length:', process.env.DB_PASSWORD?.length);

// Check if database configuration exists
if (!process.env.DB_SERVER || !process.env.DB_DATABASE || !process.env.DB_USER || !process.env.DB_PASSWORD) {
  console.error('Database configuration missing in environment variables');
  console.log('Please check your .env file and ensure all DB_* variables are set');
  process.exit(1);
}

// Global connection pool
let pool;

// Initialize database connection
async function initializeDatabase() {
  try {
    console.log('Connecting to Azure SQL Database...');
    pool = await sql.connect(dbConfig);
    console.log('Connected to Azure SQL Database successfully');

    // Make pool available to routes
    app.set('dbPool', pool);

    // Check if EventOpia tables exist, if not, create them
    await initializeEventOpiaSchema();

    // Clean expired sessions on startup
    try {
      const { cleanExpiredSessions } = require('./middleware/auth');
      await cleanExpiredSessions(pool);
    } catch (error) {
      console.log('Note: Session cleanup skipped (middleware not found)');
    }
    
    console.log('Database initialization completed');
    
  } catch (error) {
    console.error('Database connection error:', error.message);
    
    // Provide specific troubleshooting based on error type
    if (error.message.includes('Login failed')) {
      console.error('Authentication failed. Try these solutions:');
      console.error('1. Verify username and password are correct');
      console.error('2. Try username format: SuryaPS3@suryafreesqldb');
      console.error('3. Reset password in Azure portal if needed');
    } else if (error.message.includes('Cannot open server')) {
      console.error('Network connection failed. Check:');
      console.error('1. Firewall rules in Azure portal');
      console.error('2. Server name is correct');
      console.error('3. Internet connection is working');
    }
    
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Initialize EventOpia schema (create tables if they don't exist)
async function initializeEventOpiaSchema() {
  try {
    const request = pool.request();
    
    // Check if Users table exists
    const tablesResult = await request.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('Users', 'Clubs', 'Events')
    `);

    if (tablesResult.recordset[0].count === 0) {
      console.log('EventOpia tables not found. Creating schema...');
      console.log('Run "node database-setup.js" to create the full EventOpia database schema');
      
      // Create a basic Items table for now (keeping your existing functionality)
      await createItemsTable();
    } else {
      console.log('EventOpia database schema detected');
    }
    
  } catch (error) {
    console.error('Error checking database schema:', error);
    // Fallback to creating Items table
    await createItemsTable();
  }
}

// Create Items table if it doesn't exist (keeping your existing functionality)
async function createItemsTable() {
  try {
    const request = pool.request();
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Items' AND xtype='U')
      CREATE TABLE Items (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        value FLOAT NOT NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE()
      )
    `);
    console.log('Items table ready');
  } catch (error) {
    console.error('Error creating table:', error.message);
    throw error;
  }
}

// Import routes (with error handling if they don't exist yet)
let authRoutes;
try {
  authRoutes = require('./routes/auth');
} catch (error) {
  console.log('Note: Authentication routes not found. Create routes/auth.js to enable authentication.');
}

// API Routes
if (authRoutes) {
  app.use('/api/auth', authRoutes);
}

// Original Items API (keeping your existing functionality)
// Create new item
app.post('/api/items', async (req, res) => {
  try {
    const { name, value } = req.body;
    
    // Validation
    if (!name || value === undefined || value === null) {
      return res.status(400).json({ 
        message: 'Name and value are required.' 
      });
    }

    if (typeof value !== 'number') {
      return res.status(400).json({ 
        message: 'Value must be a number.' 
      });
    }

    // Insert into database
    const request = pool.request();
    request.input('name', sql.NVarChar, name);
    request.input('value', sql.Float, value);
    
    const result = await request.query(`
      INSERT INTO Items (name, value, createdAt, updatedAt) 
      OUTPUT INSERTED.* 
      VALUES (@name, @value, GETDATE(), GETDATE())
    `);
    
    const savedItem = result.recordset[0];
    console.log(`New item saved: ${savedItem.name} (${savedItem.value})`);
    
    res.status(201).json(savedItem);
    
  } catch (error) {
    console.error('Error saving item:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Get all items
app.get('/api/items', async (req, res) => {
  try {
    const request = pool.request();
    const result = await request.query('SELECT * FROM Items ORDER BY createdAt DESC');
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Get single item by ID
app.get('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = pool.request();
    request.input('id', sql.Int, id);
    
    const result = await request.query('SELECT * FROM Items WHERE id = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Update item
app.put('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, value } = req.body;
    
    // Validation
    if (!name || value === undefined || value === null) {
      return res.status(400).json({ 
        message: 'Name and value are required.' 
      });
    }

    const request = pool.request();
    request.input('id', sql.Int, id);
    request.input('name', sql.NVarChar, name);
    request.input('value', sql.Float, value);
    
    const result = await request.query(`
      UPDATE Items 
      SET name = @name, value = @value, updatedAt = GETDATE() 
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Delete item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = pool.request();
    request.input('id', sql.Int, id);
    
    const result = await request.query('DELETE FROM Items WHERE id = @id');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const request = pool.request();
    await request.query('SELECT 1 as test');
    
    res.json({ 
      status: 'OK', 
      message: 'EventOpia server and database are running', 
      timestamp: new Date().toISOString(),
      database: 'Connected to Azure SQL Database',
      server: process.env.DB_SERVER,
      database_name: process.env.DB_DATABASE,
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed', 
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Database info endpoint (for development)
app.get('/api/info', async (req, res) => {
  try {
    const request = pool.request();
    const result = await request.query(`
      SELECT 
        DB_NAME() as DatabaseName,
        SUSER_NAME() as CurrentUser,
        COUNT(*) as TableCount
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    
    const tablesResult = await request.query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    res.json({
      database: result.recordset[0],
      tables: tablesResult.recordset.map(t => t.TABLE_NAME),
      eventopia_ready: tablesResult.recordset.some(t => t.TABLE_NAME === 'Users')
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error getting database info',
      error: error.message 
    });
  }
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'EventOpia API v1.0.0',
    project: 'VIT-AP Event Management System',
    documentation: {
      system: {
        health: 'GET /api/health',
        info: 'GET /api/info'
      },
      items: {
        create: 'POST /api/items',
        getAll: 'GET /api/items',
        getById: 'GET /api/items/:id',
        update: 'PUT /api/items/:id',
        delete: 'DELETE /api/items/:id'
      },
      authentication: authRoutes ? {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile'
      } : 'Authentication endpoints not available - create routes/auth.js'
    },
    userRoles: ['visitor', 'admin', 'club_faculty', 'club_admin', 'club_member'],
    setupInstructions: [
      '1. Run "node database-setup.js" to create EventOpia schema',
      '2. Create middleware/auth.js for authentication',
      '3. Create routes/auth.js for authentication routes',
      '4. Create controllers/authController.js for authentication logic'
    ]
  });
});

// Handle 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    availableEndpoints: [
      'GET /api',
      'GET /api/health',
      'GET /api/info',
      'GET /api/items',
      'POST /api/items'
    ].concat(authRoutes ? ['POST /api/auth/login', 'POST /api/auth/register'] : [])
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.stack : 'INTERNAL_ERROR'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  if (pool) {
    await pool.close();
    console.log('Database connection closed');
  }
  process.exit(0);
});

// Start the server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(port, () => {
      console.log(`EventOpia server listening at http://localhost:${port}`);
      console.log(`API documentation: http://localhost:${port}/api`);
      console.log(`Health check: http://localhost:${port}/api/health`);
      console.log(`Database info: http://localhost:${port}/api/info`);
      console.log(`Items API: http://localhost:${port}/api/items`);
      if (authRoutes) {
        console.log(`Authentication: http://localhost:${port}/api/auth/*`);
      }
      console.log('Ready to accept requests!');
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();