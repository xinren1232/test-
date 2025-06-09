/**
 * 数据库模型初始化和关联
 */
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config');

// 确定当前环境
const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

// 创建Sequelize实例
const sequelize = new Sequelize(
  config.database, 
  config.username, 
  config.password, 
  {
    host: config.host,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool
  }
);

const db = {};

// 导入当前目录中的所有模型文件
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// 设置模型之间的关联
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize; // Sequelize实例
db.Sequelize = Sequelize; // Sequelize构造函数

module.exports = db; 