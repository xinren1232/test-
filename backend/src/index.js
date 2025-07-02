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
import swaggerUi from 'swagger-ui-express';

// 导入中间件
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// 导入路由
import { setupRoutes } from './routes.js';

// 导入工具
import { logger } from './utils/logger.js';
import initializeDatabase from './models/index.js';
import { loadIntentRules } from './services/assistantService.js';

// 加载环境变量
dotenv.config();

// 创建应用实例
const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 开始启动IQE统一助手API服务...');
// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 基本中间件
console.log('📦 配置基本中间件...');
app.use(cors());
app.use(helmet()); // 安全头
app.use(express.json({ limit: '50mb' })); // JSON解析 - 增加大小限制支持大规模数据
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // URL编码解析 - 增加大小限制
app.use(morgan('dev')); // HTTP请求日志
app.use(requestLogger); // 自定义请求日志

// 增强的限流设置 - 分层限流策略
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: {
    status: 429,
    error: message,
    retryAfter: `${windowMs / 60000}分钟`
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // 基于IP和用户标识的复合键
    return `${req.ip}-${req.headers['user-agent']?.slice(0, 50) || 'unknown'}`
  },
  skip: (req) => {
    // 开发环境跳过限流，或跳过健康检查
    return process.env.NODE_ENV === 'development' ||
           req.path === '/health' ||
           req.headers['x-internal-request']
  }
});

// 不同端点的差异化限流
const generalLimiter = createRateLimiter(15 * 60 * 1000, 1000, '请求过于频繁，请稍后再试');
const aiLimiter = createRateLimiter(5 * 60 * 1000, 100, 'AI请求过于频繁，请稍后再试');
const dataLimiter = createRateLimiter(1 * 60 * 1000, 200, '数据查询请求过于频繁，请稍后再试');

// 对API路由应用差异化限流
app.use('/api/', generalLimiter);
app.use('/api/assistant/', aiLimiter);
app.use('/api/data/', dataLimiter);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 设置API路由
console.log('🛣️ 设置API路由...');
setupRoutes(app);

// 错误处理中间件
app.use(errorHandler);

// Initialize Database
// -----------------------------------------------------------------------------
try {
  const db = await initializeDatabase();
  logger.info('Database connection has been established successfully.');

  // Load NLP rules after database is ready
  await loadIntentRules();

  // 3. 启动Express服务器
  app.listen(PORT, () => {
    logger.info(`IQE统一助手API服务已启动，端口: ${PORT}`);
  logger.info(`API文档: http://localhost:${PORT}/api-docs`);
  });
} catch (error) {
  logger.error('服务启动失败:', error);
  process.exit(1);
}

export default app;
 