/**
 * 请求日志中间件
 * 记录每个API请求的详细信息
 */
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * 请求日志中间件
 * 为每个请求生成唯一ID并记录请求信息
 */
export const requestLogger = (req, res, next) => {
  // 生成请求ID
  req.id = randomUUID();
  
  // 设置响应头包含请求ID
  res.setHeader('X-Request-ID', req.id);
  
  // 记录请求开始时间
  req.startTime = Date.now();
  
  // 记录请求信息
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // 在响应完成时记录响应信息
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      contentLength: res.getHeader('content-length')
    });
  });
  
  next();
}; 
 * 请求日志中间件
 * 记录每个API请求的详细信息
 */
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * 请求日志中间件
 * 为每个请求生成唯一ID并记录请求信息
 */
export const requestLogger = (req, res, next) => {
  // 生成请求ID
  req.id = randomUUID();
  
  // 设置响应头包含请求ID
  res.setHeader('X-Request-ID', req.id);
  
  // 记录请求开始时间
  req.startTime = Date.now();
  
  // 记录请求信息
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // 在响应完成时记录响应信息
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      contentLength: res.getHeader('content-length')
    });
  });
  
  next();
}; 
 * 请求日志中间件
 * 记录每个API请求的详细信息
 */
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * 请求日志中间件
 * 为每个请求生成唯一ID并记录请求信息
 */
export const requestLogger = (req, res, next) => {
  // 生成请求ID
  req.id = randomUUID();
  
  // 设置响应头包含请求ID
  res.setHeader('X-Request-ID', req.id);
  
  // 记录请求开始时间
  req.startTime = Date.now();
  
  // 记录请求信息
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // 在响应完成时记录响应信息
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      contentLength: res.getHeader('content-length')
    });
  });
  
  next();
}; 
 
 
 
 * 请求日志中间件
 * 记录每个API请求的详细信息
 */
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * 请求日志中间件
 * 为每个请求生成唯一ID并记录请求信息
 */
export const requestLogger = (req, res, next) => {
  // 生成请求ID
  req.id = randomUUID();
  
  // 设置响应头包含请求ID
  res.setHeader('X-Request-ID', req.id);
  
  // 记录请求开始时间
  req.startTime = Date.now();
  
  // 记录请求信息
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // 在响应完成时记录响应信息
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      contentLength: res.getHeader('content-length')
    });
  });
  
  next();
}; 
 * 请求日志中间件
 * 记录每个API请求的详细信息
 */
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * 请求日志中间件
 * 为每个请求生成唯一ID并记录请求信息
 */
export const requestLogger = (req, res, next) => {
  // 生成请求ID
  req.id = randomUUID();
  
  // 设置响应头包含请求ID
  res.setHeader('X-Request-ID', req.id);
  
  // 记录请求开始时间
  req.startTime = Date.now();
  
  // 记录请求信息
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // 在响应完成时记录响应信息
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      contentLength: res.getHeader('content-length')
    });
  });
  
  next();
}; 
 * 请求日志中间件
 * 记录每个API请求的详细信息
 */
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * 请求日志中间件
 * 为每个请求生成唯一ID并记录请求信息
 */
export const requestLogger = (req, res, next) => {
  // 生成请求ID
  req.id = randomUUID();
  
  // 设置响应头包含请求ID
  res.setHeader('X-Request-ID', req.id);
  
  // 记录请求开始时间
  req.startTime = Date.now();
  
  // 记录请求信息
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // 在响应完成时记录响应信息
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      contentLength: res.getHeader('content-length')
    });
  });
  
  next();
}; 
 
 
 
 * 请求日志中间件
 * 记录每个API请求的详细信息
 */
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * 请求日志中间件
 * 为每个请求生成唯一ID并记录请求信息
 */
export const requestLogger = (req, res, next) => {
  // 生成请求ID
  req.id = randomUUID();
  
  // 设置响应头包含请求ID
  res.setHeader('X-Request-ID', req.id);
  
  // 记录请求开始时间
  req.startTime = Date.now();
  
  // 记录请求信息
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // 在响应完成时记录响应信息
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      contentLength: res.getHeader('content-length')
    });
  });
  
  next();
}; 
 * 请求日志中间件
 * 记录每个API请求的详细信息
 */
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * 请求日志中间件
 * 为每个请求生成唯一ID并记录请求信息
 */
export const requestLogger = (req, res, next) => {
  // 生成请求ID
  req.id = randomUUID();
  
  // 设置响应头包含请求ID
  res.setHeader('X-Request-ID', req.id);
  
  // 记录请求开始时间
  req.startTime = Date.now();
  
  // 记录请求信息
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // 在响应完成时记录响应信息
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      contentLength: res.getHeader('content-length')
    });
  });
  
  next();
}; 
 * 请求日志中间件
 * 记录每个API请求的详细信息
 */
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * 请求日志中间件
 * 为每个请求生成唯一ID并记录请求信息
 */
export const requestLogger = (req, res, next) => {
  // 生成请求ID
  req.id = randomUUID();
  
  // 设置响应头包含请求ID
  res.setHeader('X-Request-ID', req.id);
  
  // 记录请求开始时间
  req.startTime = Date.now();
  
  // 记录请求信息
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // 在响应完成时记录响应信息
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      contentLength: res.getHeader('content-length')
    });
  });
  
  next();
}; 
 
 
 