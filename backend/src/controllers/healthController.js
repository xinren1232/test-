/**
 * 健康检查控制器
 * 提供API服务健康状态信息
 */
import express from 'express';
import { version } from '../../package.json';

// 创建路由器
const router = express.Router();

// 服务启动时间
const startTime = Date.now();

/**
 * 获取服务运行时间（秒）
 * @returns {number} 运行时间（秒）
 */
function getUptime() {
  return (Date.now() - startTime) / 1000;
}

/**
 * 健康检查路由
 * GET /health 或 /api/health
 */
router.get('/', (req, res) => {
  // 构建健康信息
  const health = {
    status: 'ok',
    version,
    uptime: getUptime(),
    timestamp: new Date().toISOString()
  };
  
  // 添加额外系统信息
  if (process.env.NODE_ENV !== 'production') {
    health.env = process.env.NODE_ENV || 'development';
    health.memory = process.memoryUsage();
    health.cpu = process.cpuUsage();
  }
  
  res.json(health);
});

export default router; 
 * 健康检查控制器
 * 提供API服务健康状态信息
 */
import express from 'express';
import { version } from '../../package.json';

// 创建路由器
const router = express.Router();

// 服务启动时间
const startTime = Date.now();

/**
 * 获取服务运行时间（秒）
 * @returns {number} 运行时间（秒）
 */
function getUptime() {
  return (Date.now() - startTime) / 1000;
}

/**
 * 健康检查路由
 * GET /health 或 /api/health
 */
router.get('/', (req, res) => {
  // 构建健康信息
  const health = {
    status: 'ok',
    version,
    uptime: getUptime(),
    timestamp: new Date().toISOString()
  };
  
  // 添加额外系统信息
  if (process.env.NODE_ENV !== 'production') {
    health.env = process.env.NODE_ENV || 'development';
    health.memory = process.memoryUsage();
    health.cpu = process.cpuUsage();
  }
  
  res.json(health);
});

export default router; 
 * 健康检查控制器
 * 提供API服务健康状态信息
 */
import express from 'express';
import { version } from '../../package.json';

// 创建路由器
const router = express.Router();

// 服务启动时间
const startTime = Date.now();

/**
 * 获取服务运行时间（秒）
 * @returns {number} 运行时间（秒）
 */
function getUptime() {
  return (Date.now() - startTime) / 1000;
}

/**
 * 健康检查路由
 * GET /health 或 /api/health
 */
router.get('/', (req, res) => {
  // 构建健康信息
  const health = {
    status: 'ok',
    version,
    uptime: getUptime(),
    timestamp: new Date().toISOString()
  };
  
  // 添加额外系统信息
  if (process.env.NODE_ENV !== 'production') {
    health.env = process.env.NODE_ENV || 'development';
    health.memory = process.memoryUsage();
    health.cpu = process.cpuUsage();
  }
  
  res.json(health);
});

export default router; 
 
 
 
 * 健康检查控制器
 * 提供API服务健康状态信息
 */
import express from 'express';
import { version } from '../../package.json';

// 创建路由器
const router = express.Router();

// 服务启动时间
const startTime = Date.now();

/**
 * 获取服务运行时间（秒）
 * @returns {number} 运行时间（秒）
 */
function getUptime() {
  return (Date.now() - startTime) / 1000;
}

/**
 * 健康检查路由
 * GET /health 或 /api/health
 */
router.get('/', (req, res) => {
  // 构建健康信息
  const health = {
    status: 'ok',
    version,
    uptime: getUptime(),
    timestamp: new Date().toISOString()
  };
  
  // 添加额外系统信息
  if (process.env.NODE_ENV !== 'production') {
    health.env = process.env.NODE_ENV || 'development';
    health.memory = process.memoryUsage();
    health.cpu = process.cpuUsage();
  }
  
  res.json(health);
});

export default router; 
 * 健康检查控制器
 * 提供API服务健康状态信息
 */
import express from 'express';
import { version } from '../../package.json';

// 创建路由器
const router = express.Router();

// 服务启动时间
const startTime = Date.now();

/**
 * 获取服务运行时间（秒）
 * @returns {number} 运行时间（秒）
 */
function getUptime() {
  return (Date.now() - startTime) / 1000;
}

/**
 * 健康检查路由
 * GET /health 或 /api/health
 */
router.get('/', (req, res) => {
  // 构建健康信息
  const health = {
    status: 'ok',
    version,
    uptime: getUptime(),
    timestamp: new Date().toISOString()
  };
  
  // 添加额外系统信息
  if (process.env.NODE_ENV !== 'production') {
    health.env = process.env.NODE_ENV || 'development';
    health.memory = process.memoryUsage();
    health.cpu = process.cpuUsage();
  }
  
  res.json(health);
});

export default router; 
 * 健康检查控制器
 * 提供API服务健康状态信息
 */
import express from 'express';
import { version } from '../../package.json';

// 创建路由器
const router = express.Router();

// 服务启动时间
const startTime = Date.now();

/**
 * 获取服务运行时间（秒）
 * @returns {number} 运行时间（秒）
 */
function getUptime() {
  return (Date.now() - startTime) / 1000;
}

/**
 * 健康检查路由
 * GET /health 或 /api/health
 */
router.get('/', (req, res) => {
  // 构建健康信息
  const health = {
    status: 'ok',
    version,
    uptime: getUptime(),
    timestamp: new Date().toISOString()
  };
  
  // 添加额外系统信息
  if (process.env.NODE_ENV !== 'production') {
    health.env = process.env.NODE_ENV || 'development';
    health.memory = process.memoryUsage();
    health.cpu = process.cpuUsage();
  }
  
  res.json(health);
});

export default router; 
 
 
 
 * 健康检查控制器
 * 提供API服务健康状态信息
 */
import express from 'express';
import { version } from '../../package.json';

// 创建路由器
const router = express.Router();

// 服务启动时间
const startTime = Date.now();

/**
 * 获取服务运行时间（秒）
 * @returns {number} 运行时间（秒）
 */
function getUptime() {
  return (Date.now() - startTime) / 1000;
}

/**
 * 健康检查路由
 * GET /health 或 /api/health
 */
router.get('/', (req, res) => {
  // 构建健康信息
  const health = {
    status: 'ok',
    version,
    uptime: getUptime(),
    timestamp: new Date().toISOString()
  };
  
  // 添加额外系统信息
  if (process.env.NODE_ENV !== 'production') {
    health.env = process.env.NODE_ENV || 'development';
    health.memory = process.memoryUsage();
    health.cpu = process.cpuUsage();
  }
  
  res.json(health);
});

export default router; 
 * 健康检查控制器
 * 提供API服务健康状态信息
 */
import express from 'express';
import { version } from '../../package.json';

// 创建路由器
const router = express.Router();

// 服务启动时间
const startTime = Date.now();

/**
 * 获取服务运行时间（秒）
 * @returns {number} 运行时间（秒）
 */
function getUptime() {
  return (Date.now() - startTime) / 1000;
}

/**
 * 健康检查路由
 * GET /health 或 /api/health
 */
router.get('/', (req, res) => {
  // 构建健康信息
  const health = {
    status: 'ok',
    version,
    uptime: getUptime(),
    timestamp: new Date().toISOString()
  };
  
  // 添加额外系统信息
  if (process.env.NODE_ENV !== 'production') {
    health.env = process.env.NODE_ENV || 'development';
    health.memory = process.memoryUsage();
    health.cpu = process.cpuUsage();
  }
  
  res.json(health);
});

export default router; 
 * 健康检查控制器
 * 提供API服务健康状态信息
 */
import express from 'express';
import { version } from '../../package.json';

// 创建路由器
const router = express.Router();

// 服务启动时间
const startTime = Date.now();

/**
 * 获取服务运行时间（秒）
 * @returns {number} 运行时间（秒）
 */
function getUptime() {
  return (Date.now() - startTime) / 1000;
}

/**
 * 健康检查路由
 * GET /health 或 /api/health
 */
router.get('/', (req, res) => {
  // 构建健康信息
  const health = {
    status: 'ok',
    version,
    uptime: getUptime(),
    timestamp: new Date().toISOString()
  };
  
  // 添加额外系统信息
  if (process.env.NODE_ENV !== 'production') {
    health.env = process.env.NODE_ENV || 'development';
    health.memory = process.memoryUsage();
    health.cpu = process.cpuUsage();
  }
  
  res.json(health);
});

export default router; 
 
 
 