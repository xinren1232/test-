import mysql from 'mysql2/promise';

async function testConnection() {
  console.log('Testing MySQL connection...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99'
    });
    
    console.log('Connected to MySQL successfully!');
    
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log('MySQL version:', rows[0].version);
    
    await connection.end();
    console.log('Connection closed.');
    
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();
