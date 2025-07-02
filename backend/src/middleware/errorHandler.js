/**
 * 错误处理中间件
 * 统一处理API错误响应
 */
import { logger } from '../utils/logger.js';

/**
 * 增强的错误处理中间件
 * @param {Error} err 错误对象
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 * @param {Function} next 下一个中间件
 */
export function errorHandler(err, req, res, next) {
  // 如果响应已经发送，则交给默认错误处理器
  if (res.headersSent) {
    return next(err);
  }

  // 错误分类和处理
  const errorInfo = categorizeError(err);
  const { statusCode, errorCode, message, category } = errorInfo;

  // 生成请求ID（如果不存在）
  const requestId = req.id || generateRequestId();

  // 记录错误日志（根据严重程度选择日志级别）
  const logData = {
    error: err.stack,
    method: req.method,
    path: req.path,
    query: req.query,
    params: req.params,
    requestId,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
    category,
    originalError: err.name
  };

  // 敏感信息过滤
  if (shouldLogBody(req)) {
    logData.body = sanitizeBody(req.body);
  }

  // 根据错误类型选择日志级别
  if (statusCode >= 500) {
    logger.error(`严重错误: ${statusCode} ${errorCode} - ${message}`, logData);
  } else if (statusCode >= 400) {
    logger.warn(`客户端错误: ${statusCode} ${errorCode} - ${message}`, logData);
  } else {
    logger.info(`其他错误: ${statusCode} ${errorCode} - ${message}`, logData);
  }

  // 构建错误响应
  const errorResponse = {
    success: false,
    error: {
      message: sanitizeErrorMessage(message, statusCode),
      code: errorCode,
      requestId,
      timestamp: new Date().toISOString()
    }
  };

  // 添加错误详情（根据环境和错误类型）
  if (shouldIncludeDetails(err, statusCode)) {
    errorResponse.error.details = getErrorDetails(err, statusCode);
  }

  // 在开发环境下添加调试信息
  if (process.env.NODE_ENV === 'development') {
    errorResponse.debug = {
      stack: err.stack,
      category,
      originalError: err.name
    };
  }

  // 设置安全头
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  });

  // 发送错误响应
  res.status(statusCode).json(errorResponse);
}

/**
 * 错误分类函数
 */
function categorizeError(err) {
  // 数据库错误
  if (err.name === 'SequelizeError' || err.name === 'SequelizeValidationError') {
    return {
      statusCode: 400,
      errorCode: 'DATABASE_ERROR',
      message: '数据操作失败',
      category: 'database'
    };
  }

  // 验证错误
  if (err.name === 'ValidationError' || err.code === 'VALIDATION_ERROR') {
    return {
      statusCode: 400,
      errorCode: 'VALIDATION_ERROR',
      message: err.message || '数据验证失败',
      category: 'validation'
    };
  }

  // 认证错误
  if (err.name === 'UnauthorizedError' || err.code === 'UNAUTHORIZED') {
    return {
      statusCode: 401,
      errorCode: 'UNAUTHORIZED',
      message: '认证失败',
      category: 'auth'
    };
  }

  // 权限错误
  if (err.name === 'ForbiddenError' || err.code === 'FORBIDDEN') {
    return {
      statusCode: 403,
      errorCode: 'FORBIDDEN',
      message: '权限不足',
      category: 'auth'
    };
  }

  // 资源未找到
  if (err.name === 'NotFoundError' || err.code === 'NOT_FOUND') {
    return {
      statusCode: 404,
      errorCode: 'NOT_FOUND',
      message: '资源未找到',
      category: 'client'
    };
  }

  // 限流错误
  if (err.name === 'TooManyRequestsError' || err.status === 429) {
    return {
      statusCode: 429,
      errorCode: 'TOO_MANY_REQUESTS',
      message: '请求过于频繁',
      category: 'rate_limit'
    };
  }

  // AI服务错误
  if (err.code === 'AI_SERVICE_ERROR') {
    return {
      statusCode: 503,
      errorCode: 'AI_SERVICE_ERROR',
      message: 'AI服务暂时不可用',
      category: 'external_service'
    };
  }

  // 网络超时
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    return {
      statusCode: 504,
      errorCode: 'TIMEOUT',
      message: '请求超时',
      category: 'network'
    };
  }

  // 默认服务器错误
  return {
    statusCode: err.statusCode || err.status || 500,
    errorCode: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || '服务器内部错误',
    category: 'server'
  };
}

/**
 * 生成请求ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 判断是否应该记录请求体
 */
function shouldLogBody(req) {
  // 不记录敏感路径的请求体
  const sensitiveRoutes = ['/api/auth/login', '/api/auth/register'];
  return !sensitiveRoutes.includes(req.path) && req.method !== 'GET';
}

/**
 * 清理请求体中的敏感信息
 */
function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * 清理错误消息
 */
function sanitizeErrorMessage(message, statusCode) {
  // 生产环境下隐藏敏感的服务器错误信息
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    return '服务器内部错误，请稍后重试';
  }

  return message;
}

/**
 * 判断是否应该包含错误详情
 */
function shouldIncludeDetails(err, statusCode) {
  // 开发环境总是包含详情
  if (process.env.NODE_ENV === 'development') return true;

  // 客户端错误包含详情
  if (statusCode >= 400 && statusCode < 500) return true;

  // 特定错误类型包含详情
  return ['ValidationError', 'NotFoundError'].includes(err.name);
}

/**
 * 获取错误详情
 */
function getErrorDetails(err, statusCode) {
  const details = {};

  // 验证错误详情
  if (err.name === 'ValidationError' && err.errors) {
    details.validationErrors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
  }

  // 数据库错误详情
  if (err.name === 'SequelizeError' && process.env.NODE_ENV === 'development') {
    details.sql = err.sql;
    details.parameters = err.parameters;
  }

  return Object.keys(details).length > 0 ? details : undefined;
}