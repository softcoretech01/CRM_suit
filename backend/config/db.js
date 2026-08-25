const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  logging: false, // Set to true to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

const mastersDb = new Sequelize(
  process.env.DB_NAME_MASTERS,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  dbConfig
);

const adminDb = new Sequelize(
  process.env.DB_NAME_ADMIN,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  dbConfig
);

const crmDb = new Sequelize(
  process.env.DB_NAME_CRM,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  dbConfig
);

// Function to test connections
const testConnections = async () => {
  try {
    await mastersDb.authenticate();
    console.log('Connection to Masters_crm established successfully.');
    await adminDb.authenticate();
    console.log('Connection to Admin_crm established successfully.');
    await crmDb.authenticate();
    console.log('Connection to CRM established successfully.');
  } catch (error) {
    console.error('Unable to connect to the databases:', error);
  }
};

module.exports = {
  mastersDb,
  adminDb,
  crmDb,
  testConnections
};
