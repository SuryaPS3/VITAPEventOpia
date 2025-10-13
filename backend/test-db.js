import { getPool, closePool } from './config/database.js';

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    const pool = await getPool();
    console.log('✅ Connected to Azure SQL Database');
    
    const result = await pool.request().query('SELECT DB_NAME() as DatabaseName, SUSER_NAME() as CurrentUser');
    console.log('📊 Database:', result.recordset[0].DatabaseName);
    console.log('👤 User:', result.recordset[0].CurrentUser);
    
    await closePool();
    console.log('✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();