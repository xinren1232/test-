#!/bin/bash

# IQE智能质检系统 - 一键部署脚本
# 包含MySQL密码配置修复

set -e

# 配置变量
DB_PASSWORD="Zxylsy.99"
APP_DIR="/var/www/iqe"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

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

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "🚀 开始一键部署IQE智能质检系统..."
echo "📅 时间: $(date)"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    print_error "请使用root用户运行此脚本"
    exit 1
fi

# 1. 修复MySQL密码配置
print_info "修复MySQL密码配置..."

# 停止MySQL服务
systemctl stop mysql 2>/dev/null || true

# 启动MySQL服务
systemctl start mysql

# 使用sudo mysql设置密码（Ubuntu 22.04默认配置）
print_info "设置MySQL root密码..."
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';" 2>/dev/null || {
    print_info "尝试其他方式设置密码..."
    # 如果上面失败，尝试直接连接
    mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';" 2>/dev/null || {
        print_info "使用mysqladmin设置密码..."
        mysqladmin -u root password "$DB_PASSWORD" 2>/dev/null || true
    }
}

# 验证密码设置
if mysql -u root -p"$DB_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1; then
    print_status "MySQL密码设置成功"
else
    print_error "MySQL密码设置失败，请手动设置"
    echo "请运行: sudo mysql"
    echo "然后执行: ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';"
    exit 1
fi

# 2. 创建数据库
print_info "创建IQE数据库..."
mysql -u root -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS iqe_inspection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
print_status "数据库创建完成"

# 3. 停止现有服务
print_info "停止现有服务..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 4. 创建应用目录
print_info "创建应用目录..."
mkdir -p "$BACKEND_DIR/src" "$FRONTEND_DIR/dist" "/var/log/iqe"

# 5. 创建后端package.json
cat > "$BACKEND_DIR/package.json" << 'EOF'
{
  "name": "iqe-backend",
  "version": "2.0.0",
  "main": "start.js",
  "type": "module",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mysql2": "^3.9.7",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "express-rate-limit": "^7.1.5"
  }
}
EOF

# 6. 创建后端启动文件
cat > "$BACKEND_DIR/start.js" << 'EOF'
import { spawn } from 'child_process';

console.log('🚀 启动IQE后端服务...');
const app = spawn('node', ['src/index.js'], {
  stdio: 'inherit',
  env: { ...process.env },
});

app.on('close', code => {
  if (code !== 0) {
    console.error(`服务异常退出: ${code}`);
  }
});

const handleSignal = (signal) => {
  console.log(`收到 ${signal} 信号，关闭服务...`);
  app.kill(signal);
};

process.on('SIGTERM', () => handleSignal('SIGTERM'));
process.on('SIGINT', () => handleSignal('SIGINT'));
EOF

# 7. 创建环境配置
cat > "$BACKEND_DIR/.env" << EOF
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=$DB_PASSWORD
DB_NAME=iqe_inspection
DB_PORT=3306
EOF

# 8. 创建后端主文件
cat > "$BACKEND_DIR/src/index.js" << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'iqe_inspection',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4'
};

let pool;
try {
  pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log('✅ 数据库连接池创建成功');
} catch (error) {
  console.error('❌ 数据库连接失败:', error);
  process.exit(1);
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: ['http://47.108.152.16', 'http://localhost:5173'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'IQE Backend v2.0'
  });
});

app.get('/api/status', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: error.message
    });
  }
});

app.get('/api/data/test', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT 1 as test_value, NOW() as current_time');
    res.json({
      success: true,
      data: rows,
      message: 'Database connection test successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ success: false, message: '内部服务器错误' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API端点未找到' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 IQE后端服务启动成功，端口: ${PORT}`);
});

const gracefulShutdown = async (signal) => {
  console.log(`收到${signal}信号，关闭服务器...`);
  server.close(async () => {
    if (pool) await pool.end();
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
EOF

print_status "后端应用文件创建完成"

# 9. 安装依赖
print_info "安装后端依赖..."
cd "$BACKEND_DIR" && npm install

# 10. 设置权限
chown -R www-data:www-data "$APP_DIR"

# 11. 启动服务
print_info "启动后端服务..."
cd "$BACKEND_DIR"
pm2 start start.js --name iqe-backend
pm2 save

print_status "IQE系统部署完成！"
echo ""
echo "🌐 测试地址:"
echo "  - 健康检查: http://47.108.152.16:3001/health"
echo "  - API状态: http://47.108.152.16:3001/api/status"
echo "  - 数据库测试: http://47.108.152.16:3001/api/data/test"
echo ""
echo "🔧 管理命令:"
echo "  - 查看状态: pm2 status"
echo "  - 查看日志: pm2 logs iqe-backend"
echo "  - 重启服务: pm2 restart iqe-backend"
