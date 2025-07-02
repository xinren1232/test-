/**
 * 请求日志中间件
 * 记录所有API请求的详细信息
 */
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * 增强的请求日志中间件
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 * @param {Function} next 下一个中间件
 */
export function requestLogger(req, res, next) {
  // 生成唯一请求ID
  req.id = req.headers['x-request-id'] || randomUUID();

  // 记录请求开始时间和性能指标
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  // 跳过健康检查和静态资源的详细日志
  const shouldSkipDetailedLog = isSkippableRequest(req);

  // 构建请求日志数据
  const requestLogData = {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    query: req.query,
    params: req.params,
    ip: getClientIP(req),
    userAgent: req.headers['user-agent'],
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    requestId: req.id,
    timestamp: new Date().toISOString(),
    protocol: req.protocol,
    secure: req.secure
  };

  // 记录请求体（仅对特定请求类型）
  if (shouldLogRequestBody(req)) {
    requestLogData.body = sanitizeRequestBody(req.body);
  }

  // 记录请求开始
  if (!shouldSkipDetailedLog) {
    logger.info(`🚀 ${req.method} ${req.path} - 请求开始`, requestLogData);
  }

  // 监听响应完成事件
  res.on('finish', () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const endMemory = process.memoryUsage();

    // 计算内存使用变化
    const memoryDelta = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal
    };

    // 构建响应日志数据
    const responseLogData = {
      ...requestLogData,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      duration,
      responseSize: res.get('content-length'),
      memoryDelta,
      performance: categorizePerformance(duration),
      endTimestamp: new Date().toISOString()
    };

    // 根据状态码和性能选择日志级别和消息
    const logMessage = `${getStatusEmoji(res.statusCode)} ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 500) {
      logger.error(logMessage, responseLogData);
    } else if (res.statusCode >= 400) {
      logger.warn(logMessage, responseLogData);
    } else if (duration > 5000) {
      // 慢请求警告
      logger.warn(`🐌 ${logMessage} - 慢请求`, responseLogData);
    } else if (!shouldSkipDetailedLog) {
      logger.info(logMessage, responseLogData);
    }

    // 性能监控警告
    if (duration > 10000) {
      logger.error(`⚠️ 极慢请求: ${req.method} ${req.path} - ${duration}ms`, {
        requestId: req.id,
        duration,
        memoryDelta
      });
    }
  });

  // 监听响应错误事件
  res.on('error', (error) => {
    logger.error(`❌ 响应错误: ${req.method} ${req.path}`, {
      ...requestLogData,
      error: error.message,
      stack: error.stack
    });
  });

  // 设置响应头
  res.set('X-Request-ID', req.id);

  next();
}

/**
 * 判断是否为可跳过详细日志的请求
 */
function isSkippableRequest(req) {
  const skippablePaths = [
    '/health',
    '/favicon.ico',
    '/robots.txt',
    '/api/health'
  ];

  const skippablePatterns = [
    /^\/static\//,
    /^\/assets\//,
    /^\/public\//,
    /\.(css|js|png|jpg|jpeg|gif|ico|svg)$/
  ];

  return skippablePaths.includes(req.path) ||
         skippablePatterns.some(pattern => pattern.test(req.path));
}

/**
 * 获取客户端真实IP
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip ||
         'unknown';
}

/**
 * 判断是否应该记录请求体
 */
function shouldLogRequestBody(req) {
  // 只记录POST、PUT、PATCH请求的请求体
  const methodsToLog = ['POST', 'PUT', 'PATCH'];
  if (!methodsToLog.includes(req.method)) return false;

  // 跳过敏感路径
  const sensitiveRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/reset-password'
  ];

  return !sensitiveRoutes.includes(req.path);
}

/**
 * 清理请求体中的敏感信息
 */
function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') return body;

  const sanitized = JSON.parse(JSON.stringify(body));
  const sensitiveFields = [
    'password', 'token', 'apiKey', 'secret', 'authorization',
    'creditCard', 'ssn', 'phoneNumber', 'email'
  ];

  function sanitizeObject(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    }
  }

  sanitizeObject(sanitized);
  return sanitized;
}

/**
 * 性能分类
 */
function categorizePerformance(duration) {
  if (duration < 100) return 'excellent';
  if (duration < 500) return 'good';
  if (duration < 1000) return 'acceptable';
  if (duration < 5000) return 'slow';
  return 'very_slow';
}

/**
 * 获取状态码对应的表情符号
 */
function getStatusEmoji(statusCode) {
  if (statusCode >= 200 && statusCode < 300) return '✅';
  if (statusCode >= 300 && statusCode < 400) return '↩️';
  if (statusCode >= 400 && statusCode < 500) return '⚠️';
  if (statusCode >= 500) return '❌';
  return '❓';
}