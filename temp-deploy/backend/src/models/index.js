import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { URL } from 'url';
import dbConfig from '../config/db.config.js';
import logger from '../utils/logger.js';

const db = {};
let isInitialized = false;
let sequelize;

// Use the imported config directly
const config = dbConfig;

async function initializeDatabase() {
  if (isInitialized) {
    return db;
  }

  // 1. Create database if it doesn't exist
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();
    logger.info(`Database '${config.database}' checked/created.`, { service: 'assistant-api' });
  } catch (error) {
    logger.error('Could not create database.', { error, service: 'assistant-api' });
    throw error;
  }

  // 2. Now, create the Sequelize instance to connect to the DB
  sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: config.pool,
    logging: false, // or logger.info for debugging
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  // 3. Load all models from this directory
  const __filename = new URL(import.meta.url).pathname;
  const __dirname = path.dirname(__filename);

  // On Windows, pathname starts with a slash, e.g., /D:/...
  // We need to remove the leading slash.
  const correctedDirname = process.platform === 'win32' ? __dirname.substring(1) : __dirname;
  
  const decodedPath = decodeURIComponent(correctedDirname);

  const modelFiles = (await fs.readdir(decodedPath)).filter(file =>
    file.indexOf('.') !== 0 && file !== 'index.js' && file.slice(-9) === '.model.js'
  );

  for (const file of modelFiles) {
    const modelPath = path.join(decodedPath, file);
    const modelUrl = new URL(`file://${modelPath}`).href; // Ensure correct file URL format
    const modelModule = await import(modelUrl);
    const model = modelModule.default(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  }

  // 4. Set up associations between models
  Object.keys(db).forEach(modelName => {
    if (db[modelName] && db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
  
  // 5. Sync all models with the database, creating tables if they don't exist
  // 使用 alter: false 避免修改现有表结构
  await sequelize.sync({ alter: false, force: false });
  logger.info('All models were synchronized with the database.', { service: 'assistant-api' });

  isInitialized = true;
  return db;
}

export default initializeDatabase;