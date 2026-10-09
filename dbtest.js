const mysql = require('mysql2/promise');

const dbConfig = {
  host: '127.0.0.1',
  user: 'inmo_hrms',  
  password: 'inmo@2020',    
  database: 'inmo_hrms',
  port: 3307                 
};

async function main() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Optional: show all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables in database:', tables);

    await connection.end();
  } catch (err) {
    console.error('Database error:', err.message);
  }
}

main();
