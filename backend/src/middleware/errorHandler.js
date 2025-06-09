/**
 * 全局错误处理中间件
 */
import { logger } from '../utils/logger.js';
import createError from 'http-errors';

/**
 * 将错误转换为标准格式
 * @param {Error} err 错误对象
 * @returns {Object} 标准化的错误对象
 */
function normalizeError(err) {
  // 默认为服务器内部错误
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  
  // 如果是HTTP错误，保留原始状态和消息
  if (err instanceof createError.HttpError) {
    return {
      statusCode: err.statusCode,
      code: errorCode,
      message: err.message
    };
  }
  
  // 根据状态码确定消息
  let message = err.message || '服务器内部错误';
  
  // 避免在生产环境中暴露敏感错误信息
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = '服务器内部错误';
  }
  
  return {
    statusCode,
    code: errorCode,
    message
  };
}

/**
 * 错误处理中间件
 */
export const errorHandler = (err, req, res, next) => {
  // 规范化错误
  const normalizedError = normalizeError(err);
  const { statusCode, code, message } = normalizedError;
  
  // 记录错误
  if (statusCode >= 500) {
    logger.error(`服务器错误: ${message}`, {
      error: err.stack,
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  } else {
    logger.warn(`客户端错误: ${message}`, {
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  }
  
  // 发送错误响应
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      requestId: req.id
    }
  });
}; 
 * 全局错误处理中间件
 */
import { logger } from '../utils/logger.js';
import createError from 'http-errors';

/**
 * 将错误转换为标准格式
 * @param {Error} err 错误对象
 * @returns {Object} 标准化的错误对象
 */
function normalizeError(err) {
  // 默认为服务器内部错误
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  
  // 如果是HTTP错误，保留原始状态和消息
  if (err instanceof createError.HttpError) {
    return {
      statusCode: err.statusCode,
      code: errorCode,
      message: err.message
    };
  }
  
  // 根据状态码确定消息
  let message = err.message || '服务器内部错误';
  
  // 避免在生产环境中暴露敏感错误信息
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = '服务器内部错误';
  }
  
  return {
    statusCode,
    code: errorCode,
    message
  };
}

/**
 * 错误处理中间件
 */
export const errorHandler = (err, req, res, next) => {
  // 规范化错误
  const normalizedError = normalizeError(err);
  const { statusCode, code, message } = normalizedError;
  
  // 记录错误
  if (statusCode >= 500) {
    logger.error(`服务器错误: ${message}`, {
      error: err.stack,
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  } else {
    logger.warn(`客户端错误: ${message}`, {
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  }
  
  // 发送错误响应
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      requestId: req.id
    }
  });
}; 
 * 全局错误处理中间件
 */
import { logger } from '../utils/logger.js';
import createError from 'http-errors';

/**
 * 将错误转换为标准格式
 * @param {Error} err 错误对象
 * @returns {Object} 标准化的错误对象
 */
function normalizeError(err) {
  // 默认为服务器内部错误
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  
  // 如果是HTTP错误，保留原始状态和消息
  if (err instanceof createError.HttpError) {
    return {
      statusCode: err.statusCode,
      code: errorCode,
      message: err.message
    };
  }
  
  // 根据状态码确定消息
  let message = err.message || '服务器内部错误';
  
  // 避免在生产环境中暴露敏感错误信息
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = '服务器内部错误';
  }
  
  return {
    statusCode,
    code: errorCode,
    message
  };
}

/**
 * 错误处理中间件
 */
export const errorHandler = (err, req, res, next) => {
  // 规范化错误
  const normalizedError = normalizeError(err);
  const { statusCode, code, message } = normalizedError;
  
  // 记录错误
  if (statusCode >= 500) {
    logger.error(`服务器错误: ${message}`, {
      error: err.stack,
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  } else {
    logger.warn(`客户端错误: ${message}`, {
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  }
  
  // 发送错误响应
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      requestId: req.id
    }
  });
}; 
 
 
 
 * 全局错误处理中间件
 */
import { logger } from '../utils/logger.js';
import createError from 'http-errors';

/**
 * 将错误转换为标准格式
 * @param {Error} err 错误对象
 * @returns {Object} 标准化的错误对象
 */
function normalizeError(err) {
  // 默认为服务器内部错误
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  
  // 如果是HTTP错误，保留原始状态和消息
  if (err instanceof createError.HttpError) {
    return {
      statusCode: err.statusCode,
      code: errorCode,
      message: err.message
    };
  }
  
  // 根据状态码确定消息
  let message = err.message || '服务器内部错误';
  
  // 避免在生产环境中暴露敏感错误信息
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = '服务器内部错误';
  }
  
  return {
    statusCode,
    code: errorCode,
    message
  };
}

/**
 * 错误处理中间件
 */
export const errorHandler = (err, req, res, next) => {
  // 规范化错误
  const normalizedError = normalizeError(err);
  const { statusCode, code, message } = normalizedError;
  
  // 记录错误
  if (statusCode >= 500) {
    logger.error(`服务器错误: ${message}`, {
      error: err.stack,
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  } else {
    logger.warn(`客户端错误: ${message}`, {
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  }
  
  // 发送错误响应
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      requestId: req.id
    }
  });
}; 
 * 全局错误处理中间件
 */
import { logger } from '../utils/logger.js';
import createError from 'http-errors';

/**
 * 将错误转换为标准格式
 * @param {Error} err 错误对象
 * @returns {Object} 标准化的错误对象
 */
function normalizeError(err) {
  // 默认为服务器内部错误
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  
  // 如果是HTTP错误，保留原始状态和消息
  if (err instanceof createError.HttpError) {
    return {
      statusCode: err.statusCode,
      code: errorCode,
      message: err.message
    };
  }
  
  // 根据状态码确定消息
  let message = err.message || '服务器内部错误';
  
  // 避免在生产环境中暴露敏感错误信息
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = '服务器内部错误';
  }
  
  return {
    statusCode,
    code: errorCode,
    message
  };
}

/**
 * 错误处理中间件
 */
export const errorHandler = (err, req, res, next) => {
  // 规范化错误
  const normalizedError = normalizeError(err);
  const { statusCode, code, message } = normalizedError;
  
  // 记录错误
  if (statusCode >= 500) {
    logger.error(`服务器错误: ${message}`, {
      error: err.stack,
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  } else {
    logger.warn(`客户端错误: ${message}`, {
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  }
  
  // 发送错误响应
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      requestId: req.id
    }
  });
}; 
 * 全局错误处理中间件
 */
import { logger } from '../utils/logger.js';
import createError from 'http-errors';

/**
 * 将错误转换为标准格式
 * @param {Error} err 错误对象
 * @returns {Object} 标准化的错误对象
 */
function normalizeError(err) {
  // 默认为服务器内部错误
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  
  // 如果是HTTP错误，保留原始状态和消息
  if (err instanceof createError.HttpError) {
    return {
      statusCode: err.statusCode,
      code: errorCode,
      message: err.message
    };
  }
  
  // 根据状态码确定消息
  let message = err.message || '服务器内部错误';
  
  // 避免在生产环境中暴露敏感错误信息
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = '服务器内部错误';
  }
  
  return {
    statusCode,
    code: errorCode,
    message
  };
}

/**
 * 错误处理中间件
 */
export const errorHandler = (err, req, res, next) => {
  // 规范化错误
  const normalizedError = normalizeError(err);
  const { statusCode, code, message } = normalizedError;
  
  // 记录错误
  if (statusCode >= 500) {
    logger.error(`服务器错误: ${message}`, {
      error: err.stack,
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  } else {
    logger.warn(`客户端错误: ${message}`, {
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  }
  
  // 发送错误响应
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      requestId: req.id
    }
  });
}; 
 
 
 
 * 全局错误处理中间件
 */
import { logger } from '../utils/logger.js';
import createError from 'http-errors';

/**
 * 将错误转换为标准格式
 * @param {Error} err 错误对象
 * @returns {Object} 标准化的错误对象
 */
function normalizeError(err) {
  // 默认为服务器内部错误
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  
  // 如果是HTTP错误，保留原始状态和消息
  if (err instanceof createError.HttpError) {
    return {
      statusCode: err.statusCode,
      code: errorCode,
      message: err.message
    };
  }
  
  // 根据状态码确定消息
  let message = err.message || '服务器内部错误';
  
  // 避免在生产环境中暴露敏感错误信息
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = '服务器内部错误';
  }
  
  return {
    statusCode,
    code: errorCode,
    message
  };
}

/**
 * 错误处理中间件
 */
export const errorHandler = (err, req, res, next) => {
  // 规范化错误
  const normalizedError = normalizeError(err);
  const { statusCode, code, message } = normalizedError;
  
  // 记录错误
  if (statusCode >= 500) {
    logger.error(`服务器错误: ${message}`, {
      error: err.stack,
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  } else {
    logger.warn(`客户端错误: ${message}`, {
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  }
  
  // 发送错误响应
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      requestId: req.id
    }
  });
}; 
 * 全局错误处理中间件
 */
import { logger } from '../utils/logger.js';
import createError from 'http-errors';

/**
 * 将错误转换为标准格式
 * @param {Error} err 错误对象
 * @returns {Object} 标准化的错误对象
 */
function normalizeError(err) {
  // 默认为服务器内部错误
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  
  // 如果是HTTP错误，保留原始状态和消息
  if (err instanceof createError.HttpError) {
    return {
      statusCode: err.statusCode,
      code: errorCode,
      message: err.message
    };
  }
  
  // 根据状态码确定消息
  let message = err.message || '服务器内部错误';
  
  // 避免在生产环境中暴露敏感错误信息
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = '服务器内部错误';
  }
  
  return {
    statusCode,
    code: errorCode,
    message
  };
}

/**
 * 错误处理中间件
 */
export const errorHandler = (err, req, res, next) => {
  // 规范化错误
  const normalizedError = normalizeError(err);
  const { statusCode, code, message } = normalizedError;
  
  // 记录错误
  if (statusCode >= 500) {
    logger.error(`服务器错误: ${message}`, {
      error: err.stack,
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  } else {
    logger.warn(`客户端错误: ${message}`, {
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  }
  
  // 发送错误响应
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      requestId: req.id
    }
  });
}; 
 * 全局错误处理中间件
 */
import { logger } from '../utils/logger.js';
import createError from 'http-errors';

/**
 * 将错误转换为标准格式
 * @param {Error} err 错误对象
 * @returns {Object} 标准化的错误对象
 */
function normalizeError(err) {
  // 默认为服务器内部错误
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  
  // 如果是HTTP错误，保留原始状态和消息
  if (err instanceof createError.HttpError) {
    return {
      statusCode: err.statusCode,
      code: errorCode,
      message: err.message
    };
  }
  
  // 根据状态码确定消息
  let message = err.message || '服务器内部错误';
  
  // 避免在生产环境中暴露敏感错误信息
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = '服务器内部错误';
  }
  
  return {
    statusCode,
    code: errorCode,
    message
  };
}

/**
 * 错误处理中间件
 */
export const errorHandler = (err, req, res, next) => {
  // 规范化错误
  const normalizedError = normalizeError(err);
  const { statusCode, code, message } = normalizedError;
  
  // 记录错误
  if (statusCode >= 500) {
    logger.error(`服务器错误: ${message}`, {
      error: err.stack,
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  } else {
    logger.warn(`客户端错误: ${message}`, {
      path: req.path,
      method: req.method,
      requestId: req.id
    });
  }
  
  // 发送错误响应
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      requestId: req.id
    }
  });
}; 
 
 
 