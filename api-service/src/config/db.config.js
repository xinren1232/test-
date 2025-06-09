/**
 * 数据库配置
 */
require('dotenv').config();

module.exports = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'iqe_user',
    password: process.env.DB_PASS || 'iqe_password',
    database: process.env.DB_NAME || 'iqe_inspection',
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: console.log
  },
  production: {
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    logging: false
  }
}; 