/**
 * IQE智能质检系统统一助手API服务
 * 主入口文件
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';

// 导入中间件
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// 导入路由
import { setupRoutes } from './routes.js';

// 导入工具
import { logger } from './utils/logger.js';

// 加载环境变量
dotenv.config();

// 创建应用实例
const app = express();
const PORT = process.env.PORT || 3001;

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 基本中间件
app.use(cors());
app.use(helmet()); // 安全头
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // HTTP请求日志
app.use(requestLogger); // 自定义请求日志

// 限流设置
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制请求数
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: '请求过于频繁，请稍后再试'
  }
});

// 对API路由应用限流
app.use('/api', apiLimiter);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 设置API路由
setupRoutes(app);

// 处理404错误
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `找不到路径: ${req.originalUrl}`
    }
  });
});

// 错误处理中间件
app.use(errorHandler);

// 创建HTTP服务器
const server = http.createServer(app);

// 启动服务器
server.listen(PORT, () => {
  logger.info(`API服务器已启动，监听端口: ${PORT}`);
  logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API文档: http://localhost:${PORT}/api-docs`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  // 保持进程运行，但记录错误
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  // 保持进程运行，但记录错误
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，优雅关闭中...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
}); 
 * IQE智能质检系统统一助手API服务
 * 主入口文件
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';

// 导入中间件
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// 导入路由
import { setupRoutes } from './routes.js';

// 导入工具
import { logger } from './utils/logger.js';

// 加载环境变量
dotenv.config();

// 创建应用实例
const app = express();
const PORT = process.env.PORT || 3001;

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 基本中间件
app.use(cors());
app.use(helmet()); // 安全头
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // HTTP请求日志
app.use(requestLogger); // 自定义请求日志

// 限流设置
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制请求数
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: '请求过于频繁，请稍后再试'
  }
});

// 对API路由应用限流
app.use('/api', apiLimiter);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 设置API路由
setupRoutes(app);

// 处理404错误
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `找不到路径: ${req.originalUrl}`
    }
  });
});

// 错误处理中间件
app.use(errorHandler);

// 创建HTTP服务器
const server = http.createServer(app);

// 启动服务器
server.listen(PORT, () => {
  logger.info(`API服务器已启动，监听端口: ${PORT}`);
  logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API文档: http://localhost:${PORT}/api-docs`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  // 保持进程运行，但记录错误
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  // 保持进程运行，但记录错误
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，优雅关闭中...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
}); 
 * IQE智能质检系统统一助手API服务
 * 主入口文件
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';

// 导入中间件
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// 导入路由
import { setupRoutes } from './routes.js';

// 导入工具
import { logger } from './utils/logger.js';

// 加载环境变量
dotenv.config();

// 创建应用实例
const app = express();
const PORT = process.env.PORT || 3001;

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 基本中间件
app.use(cors());
app.use(helmet()); // 安全头
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // HTTP请求日志
app.use(requestLogger); // 自定义请求日志

// 限流设置
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制请求数
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: '请求过于频繁，请稍后再试'
  }
});

// 对API路由应用限流
app.use('/api', apiLimiter);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 设置API路由
setupRoutes(app);

// 处理404错误
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `找不到路径: ${req.originalUrl}`
    }
  });
});

// 错误处理中间件
app.use(errorHandler);

// 创建HTTP服务器
const server = http.createServer(app);

// 启动服务器
server.listen(PORT, () => {
  logger.info(`API服务器已启动，监听端口: ${PORT}`);
  logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API文档: http://localhost:${PORT}/api-docs`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  // 保持进程运行，但记录错误
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  // 保持进程运行，但记录错误
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，优雅关闭中...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
}); 
 
 
 
 * IQE智能质检系统统一助手API服务
 * 主入口文件
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';

// 导入中间件
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// 导入路由
import { setupRoutes } from './routes.js';

// 导入工具
import { logger } from './utils/logger.js';

// 加载环境变量
dotenv.config();

// 创建应用实例
const app = express();
const PORT = process.env.PORT || 3001;

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 基本中间件
app.use(cors());
app.use(helmet()); // 安全头
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // HTTP请求日志
app.use(requestLogger); // 自定义请求日志

// 限流设置
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制请求数
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: '请求过于频繁，请稍后再试'
  }
});

// 对API路由应用限流
app.use('/api', apiLimiter);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 设置API路由
setupRoutes(app);

// 处理404错误
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `找不到路径: ${req.originalUrl}`
    }
  });
});

// 错误处理中间件
app.use(errorHandler);

// 创建HTTP服务器
const server = http.createServer(app);

// 启动服务器
server.listen(PORT, () => {
  logger.info(`API服务器已启动，监听端口: ${PORT}`);
  logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API文档: http://localhost:${PORT}/api-docs`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  // 保持进程运行，但记录错误
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  // 保持进程运行，但记录错误
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，优雅关闭中...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
}); 
 * IQE智能质检系统统一助手API服务
 * 主入口文件
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';

// 导入中间件
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// 导入路由
import { setupRoutes } from './routes.js';

// 导入工具
import { logger } from './utils/logger.js';

// 加载环境变量
dotenv.config();

// 创建应用实例
const app = express();
const PORT = process.env.PORT || 3001;

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 基本中间件
app.use(cors());
app.use(helmet()); // 安全头
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // HTTP请求日志
app.use(requestLogger); // 自定义请求日志

// 限流设置
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制请求数
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: '请求过于频繁，请稍后再试'
  }
});

// 对API路由应用限流
app.use('/api', apiLimiter);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 设置API路由
setupRoutes(app);

// 处理404错误
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `找不到路径: ${req.originalUrl}`
    }
  });
});

// 错误处理中间件
app.use(errorHandler);

// 创建HTTP服务器
const server = http.createServer(app);

// 启动服务器
server.listen(PORT, () => {
  logger.info(`API服务器已启动，监听端口: ${PORT}`);
  logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API文档: http://localhost:${PORT}/api-docs`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  // 保持进程运行，但记录错误
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  // 保持进程运行，但记录错误
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，优雅关闭中...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
}); 
 * IQE智能质检系统统一助手API服务
 * 主入口文件
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';

// 导入中间件
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// 导入路由
import { setupRoutes } from './routes.js';

// 导入工具
import { logger } from './utils/logger.js';

// 加载环境变量
dotenv.config();

// 创建应用实例
const app = express();
const PORT = process.env.PORT || 3001;

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 基本中间件
app.use(cors());
app.use(helmet()); // 安全头
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // HTTP请求日志
app.use(requestLogger); // 自定义请求日志

// 限流设置
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制请求数
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: '请求过于频繁，请稍后再试'
  }
});

// 对API路由应用限流
app.use('/api', apiLimiter);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 设置API路由
setupRoutes(app);

// 处理404错误
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `找不到路径: ${req.originalUrl}`
    }
  });
});

// 错误处理中间件
app.use(errorHandler);

// 创建HTTP服务器
const server = http.createServer(app);

// 启动服务器
server.listen(PORT, () => {
  logger.info(`API服务器已启动，监听端口: ${PORT}`);
  logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API文档: http://localhost:${PORT}/api-docs`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  // 保持进程运行，但记录错误
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  // 保持进程运行，但记录错误
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，优雅关闭中...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
}); 
 
 
 
 * IQE智能质检系统统一助手API服务
 * 主入口文件
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';

// 导入中间件
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// 导入路由
import { setupRoutes } from './routes.js';

// 导入工具
import { logger } from './utils/logger.js';

// 加载环境变量
dotenv.config();

// 创建应用实例
const app = express();
const PORT = process.env.PORT || 3001;

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 基本中间件
app.use(cors());
app.use(helmet()); // 安全头
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // HTTP请求日志
app.use(requestLogger); // 自定义请求日志

// 限流设置
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制请求数
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: '请求过于频繁，请稍后再试'
  }
});

// 对API路由应用限流
app.use('/api', apiLimiter);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 设置API路由
setupRoutes(app);

// 处理404错误
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `找不到路径: ${req.originalUrl}`
    }
  });
});

// 错误处理中间件
app.use(errorHandler);

// 创建HTTP服务器
const server = http.createServer(app);

// 启动服务器
server.listen(PORT, () => {
  logger.info(`API服务器已启动，监听端口: ${PORT}`);
  logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API文档: http://localhost:${PORT}/api-docs`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  // 保持进程运行，但记录错误
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  // 保持进程运行，但记录错误
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，优雅关闭中...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
}); 
 * IQE智能质检系统统一助手API服务
 * 主入口文件
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';

// 导入中间件
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// 导入路由
import { setupRoutes } from './routes.js';

// 导入工具
import { logger } from './utils/logger.js';

// 加载环境变量
dotenv.config();

// 创建应用实例
const app = express();
const PORT = process.env.PORT || 3001;

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 基本中间件
app.use(cors());
app.use(helmet()); // 安全头
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // HTTP请求日志
app.use(requestLogger); // 自定义请求日志

// 限流设置
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制请求数
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: '请求过于频繁，请稍后再试'
  }
});

// 对API路由应用限流
app.use('/api', apiLimiter);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 设置API路由
setupRoutes(app);

// 处理404错误
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `找不到路径: ${req.originalUrl}`
    }
  });
});

// 错误处理中间件
app.use(errorHandler);

// 创建HTTP服务器
const server = http.createServer(app);

// 启动服务器
server.listen(PORT, () => {
  logger.info(`API服务器已启动，监听端口: ${PORT}`);
  logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API文档: http://localhost:${PORT}/api-docs`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  // 保持进程运行，但记录错误
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  // 保持进程运行，但记录错误
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，优雅关闭中...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
}); 
 * IQE智能质检系统统一助手API服务
 * 主入口文件
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';

// 导入中间件
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// 导入路由
import { setupRoutes } from './routes.js';

// 导入工具
import { logger } from './utils/logger.js';

// 加载环境变量
dotenv.config();

// 创建应用实例
const app = express();
const PORT = process.env.PORT || 3001;

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 基本中间件
app.use(cors());
app.use(helmet()); // 安全头
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // HTTP请求日志
app.use(requestLogger); // 自定义请求日志

// 限流设置
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制请求数
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: '请求过于频繁，请稍后再试'
  }
});

// 对API路由应用限流
app.use('/api', apiLimiter);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 设置API路由
setupRoutes(app);

// 处理404错误
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `找不到路径: ${req.originalUrl}`
    }
  });
});

// 错误处理中间件
app.use(errorHandler);

// 创建HTTP服务器
const server = http.createServer(app);

// 启动服务器
server.listen(PORT, () => {
  logger.info(`API服务器已启动，监听端口: ${PORT}`);
  logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API文档: http://localhost:${PORT}/api-docs`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  // 保持进程运行，但记录错误
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  // 保持进程运行，但记录错误
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，优雅关闭中...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
}); 
 
 
 