/**
 * IQE智能质检系统API服务入口
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./models');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet()); // 安全头
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码请求体
app.use(morgan('dev')); // 日志记录

// 注册路由
app.use('/api/inventory', require('./routes/inventory.routes'));
app.use('/api/materials', require('./routes/material.routes'));
app.use('/api/lab-tests', require('./routes/labTest.routes'));
app.use('/api/quality', require('./routes/quality.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

// 基础健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// API信息
app.get('/', (req, res) => {
  res.status(200).json({ 
    name: 'IQE智能质检系统API服务', 
    version: '1.0.0',
    docs: '/api-docs' 
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || '服务器内部错误',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  
  // 同步数据库模型（开发环境使用，生产环境应使用迁移）
  if (process.env.NODE_ENV !== 'production') {
    db.sequelize.sync({ alter: true }).then(() => {
      console.log('数据库同步完成');
    }).catch(err => {
      console.error('数据库同步失败:', err);
    });
  }
});

module.exports = app; // 用于测试 