require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const { promisify } = require('util');

// Get database configuration
const config = require('../config/dbConfig')[process.env.NODE_ENV || 'development'];

// Create a connection to the MySQL server (not to a specific database yet)
const connection = mysql.createConnection({
  host: config.host,
  user: config.username,
  password: config.password
});

// Promisify connection.query
const query = promisify(connection.query).bind(connection);

async function initDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Create database if it doesn't exist
    await query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`);
    console.log(`Database '${config.database}' created or already exists.`);
    
    // Use the database
    await query(`USE \`${config.database}\`;`);
    
    // Read and execute the SQL initialization script
    const sqlScript = fs.readFileSync(path.join(__dirname, '../config/init-db.sql'), 'utf8');
    
    // Split the script by semicolons to execute each statement separately
    const statements = sqlScript.split(';').filter(stmt => stmt.trim() !== '');
    
    for (const statement of statements) {
      await query(statement);
    }
    
    console.log('Database schema initialized successfully!');
    console.log('You can now start your application with: npm start');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    connection.end();
  }
}

initDatabase();