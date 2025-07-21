#!/bin/bash

# IQE智能质检系统 - 完整应用部署脚本
# 包含所有功能模块的完整部署

set -e

# 配置变量
APP_DIR="/var/www/iqe"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
LOG_DIR="/var/log/iqe"
DB_NAME="iqe_inspection"
DB_USER="root"
DB_PASSWORD="Zxylsy.99"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "🚀 开始部署IQE智能质检系统..."
echo "📅 时间: $(date)"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    print_error "请使用root用户运行此脚本"
    exit 1
fi

# 停止现有服务
print_info "停止现有服务..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
print_status "现有服务已停止"

# 备份现有应用
if [ -d "$APP_DIR" ]; then
    print_warning "备份现有应用..."
    mv "$APP_DIR" "$APP_DIR.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
    print_status "应用备份完成"
fi

# 创建应用目录结构
print_info "创建应用目录结构..."
mkdir -p "$BACKEND_DIR/src"
mkdir -p "$BACKEND_DIR/logs"
mkdir -p "$FRONTEND_DIR/dist"
mkdir -p "$LOG_DIR"
mkdir -p "$APP_DIR/uploads"
mkdir -p "$APP_DIR/backups"
print_status "目录结构创建完成"

# 创建后端package.json
print_info "创建后端配置文件..."
cat > "$BACKEND_DIR/package.json" << 'EOF'
{
  "name": "iqe-backend",
  "version": "2.0.0",
  "description": "IQE智能质检系统后端服务",
  "main": "start.js",
  "type": "module",
  "scripts": {
    "start": "node start.js",
    "dev": "nodemon start.js",
    "test": "jest"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "http-errors": "^2.0.0",
    "joi": "^17.11.0",
    "morgan": "^1.10.0",
    "multer": "^2.0.1",
    "mysql2": "^3.9.7",
    "node-fetch": "^3.3.2",
    "sequelize": "^6.37.3",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.0.2",
    "supertest": "^6.3.3"
  }
}
EOF

# 创建后端启动脚本
cat > "$BACKEND_DIR/start.js" << 'EOF'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建日志目录
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  console.log(`日志目录已创建: ${logDir}`);
}

// 启动应用
console.log('🚀 正在启动IQE智能质检系统后端服务...');
const app = spawn('node', ['src/index.js'], {
  stdio: 'inherit',
  env: { ...process.env },
});

app.on('close', code => {
  if (code !== 0) {
    console.error(`服务异常退出，退出代码: ${code}`);
  }
});

app.on('error', (err) => {
  console.error('启动子进程失败:', err);
});

const handleSignal = (signal) => {
  console.log(`收到 ${signal} 信号，正在关闭服务...`);
  app.kill(signal);
};

process.on('SIGTERM', () => handleSignal('SIGTERM'));
process.on('SIGINT', () => handleSignal('SIGINT'));
EOF

# 创建环境配置文件
cat > "$BACKEND_DIR/.env" << EOF
NODE_ENV=production
PORT=3001
APP_NAME=IQE智能质检系统

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_CHARSET=utf8mb4
DB_TIMEZONE=+08:00

# 连接池配置
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000

# 日志配置
LOG_LEVEL=info
LOG_DIR=$LOG_DIR
LOG_MAX_SIZE=10m
LOG_MAX_FILES=7

# 安全配置
JWT_SECRET=iqe_jwt_secret_key_2024
SESSION_SECRET=iqe_session_secret_key_2024

# CORS配置
CORS_ORIGIN=http://47.108.152.16
CORS_CREDENTIALS=true

# 文件上传配置
UPLOAD_MAX_SIZE=50mb
UPLOAD_DIR=$APP_DIR/uploads

# API限流配置
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=1000

# 监控配置
HEALTH_CHECK_INTERVAL=30000
METRICS_ENABLED=true
EOF

print_status "后端配置文件创建完成"

# 创建数据库初始化脚本
print_info "创建数据库初始化脚本..."
cat > "$BACKEND_DIR/init-database.sql" << 'EOF'
-- IQE智能质检系统数据库初始化脚本
CREATE DATABASE IF NOT EXISTS iqe_inspection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE iqe_inspection;

-- 库存表
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_code VARCHAR(50) NOT NULL COMMENT '批次号',
  material_code VARCHAR(50) NOT NULL COMMENT '物料编码',
  material_name VARCHAR(100) COMMENT '物料名称',
  material_type VARCHAR(50) COMMENT '物料类型',
  supplier_code VARCHAR(50) COMMENT '供应商编码',
  supplier_name VARCHAR(100) COMMENT '供应商名称',
  factory VARCHAR(50) COMMENT '工厂',
  warehouse VARCHAR(50) COMMENT '仓库',
  quantity INT NOT NULL COMMENT '数量',
  status VARCHAR(20) DEFAULT 'normal' COMMENT '状态',
  inbound_time DATETIME COMMENT '入库时间',
  expiry_time DATETIME COMMENT '到期时间',
  notes TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_batch_code (batch_code),
  INDEX idx_material_code (material_code),
  INDEX idx_factory (factory),
  INDEX idx_warehouse (warehouse),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存数据表';

-- 实验室测试表
CREATE TABLE IF NOT EXISTS lab_tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_id VARCHAR(50) NOT NULL UNIQUE COMMENT '测试编号',
  test_date DATE COMMENT '日期',
  project VARCHAR(100) COMMENT '项目',
  baseline VARCHAR(100) COMMENT '基线',
  material_type VARCHAR(50) COMMENT '物料类型',
  quantity INT COMMENT '数量',
  material_name VARCHAR(100) COMMENT '物料名称',
  supplier_name VARCHAR(100) COMMENT '供应商',
  defect_desc VARCHAR(255) COMMENT '不合格描述',
  notes TEXT COMMENT '备注',
  batch_code VARCHAR(50) COMMENT '批次号',
  material_code VARCHAR(50) COMMENT '物料编码',
  test_result VARCHAR(20) COMMENT '测试结果',
  tester VARCHAR(50) COMMENT '测试员',
  reviewer VARCHAR(50) COMMENT '审核员',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_test_id (test_id),
  INDEX idx_test_date (test_date),
  INDEX idx_project (project),
  INDEX idx_baseline (baseline),
  INDEX idx_material_type (material_type),
  INDEX idx_test_result (test_result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='实验室测试记录表';

-- 在线跟踪表
CREATE TABLE IF NOT EXISTS online_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tracking_number VARCHAR(50) NOT NULL COMMENT '跟踪编号',
  date DATE COMMENT '日期',
  project VARCHAR(100) COMMENT '项目',
  baseline VARCHAR(100) COMMENT '基线',
  material_type VARCHAR(50) COMMENT '物料类型',
  quantity INT COMMENT '数量',
  material_name VARCHAR(100) COMMENT '物料名称',
  supplier VARCHAR(100) COMMENT '供应商',
  defect_description VARCHAR(255) COMMENT '不良描述',
  notes TEXT COMMENT '备注',
  batch_code VARCHAR(50) COMMENT '批次号',
  material_code VARCHAR(50) COMMENT '物料编码',
  factory VARCHAR(50) COMMENT '工厂',
  workshop VARCHAR(50) COMMENT '车间',
  line VARCHAR(50) COMMENT '产线',
  defect_rate DECIMAL(5,4) COMMENT '不良率',
  exception_count INT COMMENT '异常数量',
  operator VARCHAR(50) COMMENT '操作员',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tracking_number (tracking_number),
  INDEX idx_date (date),
  INDEX idx_project (project),
  INDEX idx_baseline (baseline),
  INDEX idx_material_type (material_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='在线跟踪表';

-- NLP意图规则表
CREATE TABLE IF NOT EXISTS nlp_intent_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rule_name VARCHAR(100) NOT NULL COMMENT '规则名称',
  category VARCHAR(50) NOT NULL COMMENT '规则分类',
  scenario VARCHAR(50) NOT NULL COMMENT '应用场景',
  description TEXT COMMENT '规则描述',
  trigger_words JSON COMMENT '触发关键词',
  synonyms JSON COMMENT '同义词映射',
  example_query VARCHAR(255) COMMENT '示例问题',
  priority INT DEFAULT 1 COMMENT '优先级',
  sort_order INT DEFAULT 0 COMMENT '排序顺序',
  status VARCHAR(20) DEFAULT 'active' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_scenario (scenario),
  INDEX idx_status (status),
  INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='NLP意图规则表';

-- 物料分类表
CREATE TABLE IF NOT EXISTS material_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
  category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
  description TEXT COMMENT '分类描述',
  parent_id INT COMMENT '父分类ID',
  sort_order INT DEFAULT 0 COMMENT '排序顺序',
  status VARCHAR(20) DEFAULT 'active' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category_code (category_code),
  INDEX idx_parent_id (parent_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料分类表';

-- 供应商分类映射表
CREATE TABLE IF NOT EXISTS supplier_category_mapping (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_name VARCHAR(100) NOT NULL COMMENT '供应商名称',
  category_id INT NOT NULL COMMENT '分类ID',
  material_type VARCHAR(50) COMMENT '物料类型',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_supplier_name (supplier_name),
  INDEX idx_category_id (category_id),
  FOREIGN KEY (category_id) REFERENCES material_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='供应商分类映射表';

-- 插入基础测试数据
INSERT IGNORE INTO inventory (batch_code, material_code, material_name, material_type, supplier_name, factory, warehouse, quantity, status, inbound_time) VALUES
('B001', 'M001', '电池盖', '结构件类', '聚龙', '深圳工厂', 'A仓', 1000, 'normal', '2025-01-15 10:00:00'),
('B002', 'M002', 'LCD显示屏', '光学类', 'BOE', '深圳工厂', 'B仓', 500, 'normal', '2025-01-16 11:00:00'),
('B003', 'M003', '中框', '结构件类', '天马', '重庆工厂', 'A仓', 800, 'normal', '2025-01-17 09:00:00'),
('B004', 'M004', '充电器', '充电类', '华星', '南昌工厂', 'C仓', 300, 'normal', '2025-01-18 14:00:00'),
('B005', 'M005', '扬声器', '声学类', '歌尔', '宜宾工厂', 'D仓', 600, 'risk', '2025-01-19 16:00:00');

INSERT IGNORE INTO lab_tests (test_id, test_date, project, baseline, material_type, quantity, material_name, supplier_name, test_result, defect_desc) VALUES
('T001', '2025-01-15', 'X669', 'V1.0', '结构件类', 100, '电池盖', '聚龙', 'PASS', ''),
('T002', '2025-01-16', 'X669', 'V1.0', '光学类', 50, 'LCD显示屏', 'BOE', 'PASS', ''),
('T003', '2025-01-17', 'X669', 'V1.0', '结构件类', 80, '中框', '天马', 'FAIL', '尺寸偏差'),
('T004', '2025-01-18', 'X669', 'V1.0', '充电类', 30, '充电器', '华星', 'PASS', ''),
('T005', '2025-01-19', 'X669', 'V1.0', '声学类', 60, '扬声器', '歌尔', 'FAIL', '音质不达标');

INSERT IGNORE INTO online_tracking (tracking_number, date, project, baseline, material_type, quantity, material_name, supplier, factory, defect_rate) VALUES
('ON001', '2025-01-15', 'X669', 'V1.0', '结构件类', 1000, '电池盖', '聚龙', '深圳工厂', 0.0050),
('ON002', '2025-01-16', 'X669', 'V1.0', '光学类', 500, 'LCD显示屏', 'BOE', '深圳工厂', 0.0020),
('ON003', '2025-01-17', 'X669', 'V1.0', '结构件类', 800, '中框', '天马', '重庆工厂', 0.0080),
('ON004', '2025-01-18', 'X669', 'V1.0', '充电类', 300, '充电器', '华星', '南昌工厂', 0.0030),
('ON005', '2025-01-19', 'X669', 'V1.0', '声学类', 600, '扬声器', '歌尔', '宜宾工厂', 0.0120);

-- 插入基础规则数据
INSERT IGNORE INTO nlp_intent_rules (rule_name, category, scenario, description, trigger_words, example_query, priority) VALUES
('库存查询', '库存管理', '库存场景', '查询物料库存信息', '["库存", "库存查询", "物料库存", "剩余数量"]', '查询聚龙供应商的库存', 10),
('测试查询', '质量管理', '测试场景', '查询测试结果', '["测试", "测试结果", "检验", "质检"]', '查询BOE的测试结果', 9),
('上线查询', '生产管理', '上线场景', '查询上线跟踪信息', '["上线", "跟踪", "生产", "在线"]', '查询天马的上线情况', 8),
('供应商分析', '供应商管理', '分析场景', '分析供应商质量情况', '["供应商", "分析", "质量分析"]', '分析聚龙供应商质量情况', 7),
('物料分析', '物料管理', '分析场景', '分析物料质量趋势', '["物料", "趋势", "质量趋势"]', '分析电池盖质量趋势', 6);

-- 插入物料分类数据
INSERT IGNORE INTO material_categories (category_name, category_code, description) VALUES
('结构件类', 'STRUCT', '结构性物料，如外壳、中框等'),
('光学类', 'OPTICAL', '光学相关物料，如显示屏、镜头等'),
('充电类', 'CHARGING', '充电相关物料，如充电器、电池等'),
('声学类', 'ACOUSTIC', '声学相关物料，如扬声器、麦克风等'),
('包料类', 'PACKAGING', '包装相关物料');
EOF

print_status "数据库初始化脚本创建完成"

# 初始化数据库
print_info "初始化数据库..."

# 验证数据库连接
if ! mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1; then
    print_error "数据库连接失败，请检查密码配置"
    print_info "尝试使用sudo mysql设置密码..."
    sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';"
    sudo mysql -e "FLUSH PRIVILEGES;"
    print_status "数据库密码重新设置完成"
fi

# 执行数据库初始化
mysql -u "$DB_USER" -p"$DB_PASSWORD" < "$BACKEND_DIR/init-database.sql"
print_status "数据库初始化完成"

# 验证数据库表创建
print_info "验证数据库表创建..."
TABLE_COUNT=$(mysql -u "$DB_USER" -p"$DB_PASSWORD" -D "$DB_NAME" -e "SHOW TABLES;" | wc -l)
if [ "$TABLE_COUNT" -gt 1 ]; then
    print_status "数据库表创建成功，共 $((TABLE_COUNT-1)) 个表"
else
    print_error "数据库表创建失败"
    exit 1
fi

# 创建后端主应用文件
print_info "创建后端主应用文件..."
cat > "$BACKEND_DIR/src/index.js" << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import mysql from 'mysql2/promise';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 启动IQE智能质检系统后端服务...');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Zxylsy.99',
  database: process.env.DB_NAME || 'iqe_inspection',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: '+08:00'
};

// 创建数据库连接池
let pool;
try {
  pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_POOL_MAX) || 10,
    queueLimit: 0,
    acquireTimeout: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
    timeout: 60000
  });
  console.log('✅ 数据库连接池创建成功');
} catch (error) {
  console.error('❌ 数据库连接池创建失败:', error);
  process.exit(1);
}

// Swagger配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IQE智能质检系统API',
      version: '2.0.0',
      description: 'IQE智能质检系统后端API文档'
    },
    servers: [
      {
        url: `http://47.108.152.16:${PORT}`,
        description: '生产环境'
      }
    ]
  },
  apis: ['./src/index.js']
};

const specs = swaggerJsdoc(swaggerOptions);

// 中间件配置
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: [
    'http://47.108.152.16',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: process.env.UPLOAD_MAX_SIZE || '50mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.UPLOAD_MAX_SIZE || '50mb' }));

// 限流配置
const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 1000,
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// API文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: 健康检查
 *     responses:
 *       200:
 *         description: 服务正常
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'IQE Backend',
    version: '2.0.0',
    uptime: process.uptime()
  });
});

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: 系统状态检查
 *     responses:
 *       200:
 *         description: 系统状态正常
 */
app.get('/api/status', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '2.0.0'
    });
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/data/inventory:
 *   get:
 *     summary: 获取库存数据
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 限制返回数量
 *     responses:
 *       200:
 *         description: 库存数据列表
 */
app.get('/api/data/inventory', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const [rows] = await pool.execute(
      'SELECT * FROM inventory ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM inventory');

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      total: countResult[0].total,
      pagination: {
        limit,
        offset,
        hasMore: offset + rows.length < countResult[0].total
      }
    });
  } catch (error) {
    console.error('库存数据查询失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/data/lab-tests:
 *   get:
 *     summary: 获取实验室测试数据
 */
app.get('/api/data/lab-tests', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const [rows] = await pool.execute(
      'SELECT * FROM lab_tests ORDER BY test_date DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM lab_tests');

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      total: countResult[0].total,
      pagination: {
        limit,
        offset,
        hasMore: offset + rows.length < countResult[0].total
      }
    });
  } catch (error) {
    console.error('测试数据查询失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/data/online-tracking:
 *   get:
 *     summary: 获取在线跟踪数据
 */
app.get('/api/data/online-tracking', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const [rows] = await pool.execute(
      'SELECT * FROM online_tracking ORDER BY date DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM online_tracking');

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      total: countResult[0].total,
      pagination: {
        limit,
        offset,
        hasMore: offset + rows.length < countResult[0].total
      }
    });
  } catch (error) {
    console.error('在线跟踪数据查询失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
EOF

print_status "后端主应用文件创建完成"
