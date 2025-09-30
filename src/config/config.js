require('dotenv').config();

module.exports = {
  development: {
    username: 'root',
    password: '',
    database: 'remittra',
    host: 'localhost',
    dialect: 'postgres',
    port: process.env.DB_PORT,
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    dialectOptions: {
      ssl: false,
    },

  },
};
