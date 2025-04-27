const mysql = require('mysql');
const config = require('./dbConfig')[process.env.NODE_ENV || 'development'];

// Create a connection pool
const pool = mysql.createPool({
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database,
  connectionLimit: config.pool?.max || 10
});

// Promisify pool query to use async/await
pool.query = (function() {
  const originalQuery = pool.query;
  return function() {
    return new Promise((resolve, reject) => {
      originalQuery.apply(pool, [...arguments, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }]);
    });
  };
})();

const dbConnect = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Base de données MySQL connectée avec succès');
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error.message);
    process.exit(1);
  }
};

module.exports = { dbConnect, pool };