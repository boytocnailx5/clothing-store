const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mssql',
    logging: false, // set to console.log to see the raw SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      options: {
        encrypt: true, // For Azure or modern SQL Server versions
        trustServerCertificate: true // Useful for local dev with self-signed certs
      }
    }
  }
);

module.exports = sequelize;
