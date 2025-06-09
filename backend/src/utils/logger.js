/**
 * 日志工具
 * 基于winston的日志系统
 */
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 控制台格式（更易于阅读）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let metaStr = '';
    
    if (meta.requestId) {
      metaStr += `[${meta.requestId}] `;
    }
    
    if (meta.error) {
      metaStr += `\n${meta.error}`;
    }
    
    return `${timestamp} ${level}: ${metaStr}${message}`;
  })
);

// 创建日志目录
const logDir = path.join(__dirname, '../../logs');

// 创建日志实例
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'iqe-assistant-api' },
  transports: [
    // 控制台日志
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // 文件日志 - 所有级别
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 文件日志 - 仅错误
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理异常
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理的Promise拒绝
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
}); 
 * 日志工具
 * 基于winston的日志系统
 */
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 控制台格式（更易于阅读）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let metaStr = '';
    
    if (meta.requestId) {
      metaStr += `[${meta.requestId}] `;
    }
    
    if (meta.error) {
      metaStr += `\n${meta.error}`;
    }
    
    return `${timestamp} ${level}: ${metaStr}${message}`;
  })
);

// 创建日志目录
const logDir = path.join(__dirname, '../../logs');

// 创建日志实例
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'iqe-assistant-api' },
  transports: [
    // 控制台日志
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // 文件日志 - 所有级别
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 文件日志 - 仅错误
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理异常
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理的Promise拒绝
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
}); 
 * 日志工具
 * 基于winston的日志系统
 */
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 控制台格式（更易于阅读）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let metaStr = '';
    
    if (meta.requestId) {
      metaStr += `[${meta.requestId}] `;
    }
    
    if (meta.error) {
      metaStr += `\n${meta.error}`;
    }
    
    return `${timestamp} ${level}: ${metaStr}${message}`;
  })
);

// 创建日志目录
const logDir = path.join(__dirname, '../../logs');

// 创建日志实例
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'iqe-assistant-api' },
  transports: [
    // 控制台日志
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // 文件日志 - 所有级别
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 文件日志 - 仅错误
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理异常
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理的Promise拒绝
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
}); 
 
 
 
 * 日志工具
 * 基于winston的日志系统
 */
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 控制台格式（更易于阅读）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let metaStr = '';
    
    if (meta.requestId) {
      metaStr += `[${meta.requestId}] `;
    }
    
    if (meta.error) {
      metaStr += `\n${meta.error}`;
    }
    
    return `${timestamp} ${level}: ${metaStr}${message}`;
  })
);

// 创建日志目录
const logDir = path.join(__dirname, '../../logs');

// 创建日志实例
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'iqe-assistant-api' },
  transports: [
    // 控制台日志
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // 文件日志 - 所有级别
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 文件日志 - 仅错误
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理异常
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理的Promise拒绝
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
}); 
 * 日志工具
 * 基于winston的日志系统
 */
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 控制台格式（更易于阅读）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let metaStr = '';
    
    if (meta.requestId) {
      metaStr += `[${meta.requestId}] `;
    }
    
    if (meta.error) {
      metaStr += `\n${meta.error}`;
    }
    
    return `${timestamp} ${level}: ${metaStr}${message}`;
  })
);

// 创建日志目录
const logDir = path.join(__dirname, '../../logs');

// 创建日志实例
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'iqe-assistant-api' },
  transports: [
    // 控制台日志
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // 文件日志 - 所有级别
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 文件日志 - 仅错误
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理异常
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理的Promise拒绝
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
}); 
 * 日志工具
 * 基于winston的日志系统
 */
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 控制台格式（更易于阅读）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let metaStr = '';
    
    if (meta.requestId) {
      metaStr += `[${meta.requestId}] `;
    }
    
    if (meta.error) {
      metaStr += `\n${meta.error}`;
    }
    
    return `${timestamp} ${level}: ${metaStr}${message}`;
  })
);

// 创建日志目录
const logDir = path.join(__dirname, '../../logs');

// 创建日志实例
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'iqe-assistant-api' },
  transports: [
    // 控制台日志
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // 文件日志 - 所有级别
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 文件日志 - 仅错误
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理异常
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理的Promise拒绝
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
}); 
 
 
 
 * 日志工具
 * 基于winston的日志系统
 */
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 控制台格式（更易于阅读）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let metaStr = '';
    
    if (meta.requestId) {
      metaStr += `[${meta.requestId}] `;
    }
    
    if (meta.error) {
      metaStr += `\n${meta.error}`;
    }
    
    return `${timestamp} ${level}: ${metaStr}${message}`;
  })
);

// 创建日志目录
const logDir = path.join(__dirname, '../../logs');

// 创建日志实例
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'iqe-assistant-api' },
  transports: [
    // 控制台日志
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // 文件日志 - 所有级别
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 文件日志 - 仅错误
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理异常
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理的Promise拒绝
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
}); 
 * 日志工具
 * 基于winston的日志系统
 */
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 控制台格式（更易于阅读）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let metaStr = '';
    
    if (meta.requestId) {
      metaStr += `[${meta.requestId}] `;
    }
    
    if (meta.error) {
      metaStr += `\n${meta.error}`;
    }
    
    return `${timestamp} ${level}: ${metaStr}${message}`;
  })
);

// 创建日志目录
const logDir = path.join(__dirname, '../../logs');

// 创建日志实例
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'iqe-assistant-api' },
  transports: [
    // 控制台日志
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // 文件日志 - 所有级别
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 文件日志 - 仅错误
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理异常
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理的Promise拒绝
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
}); 
 * 日志工具
 * 基于winston的日志系统
 */
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 控制台格式（更易于阅读）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let metaStr = '';
    
    if (meta.requestId) {
      metaStr += `[${meta.requestId}] `;
    }
    
    if (meta.error) {
      metaStr += `\n${meta.error}`;
    }
    
    return `${timestamp} ${level}: ${metaStr}${message}`;
  })
);

// 创建日志目录
const logDir = path.join(__dirname, '../../logs');

// 创建日志实例
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'iqe-assistant-api' },
  transports: [
    // 控制台日志
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // 文件日志 - 所有级别
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 文件日志 - 仅错误
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理异常
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 捕获未处理的Promise拒绝
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
}); 
 
 
 