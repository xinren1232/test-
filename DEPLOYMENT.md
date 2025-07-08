# IQE智能检验系统部署指南

## 📋 系统概述

本文档详细介绍了IQE智能检验系统的部署流程，包括环境准备、依赖安装、配置设置和启动步骤。

## 🔧 环境要求

### 基础环境
- **Node.js**: 16.0+ (推荐18.0+)
- **npm**: 8.0+ 或 **yarn**: 1.22+
- **MySQL**: 8.0+
- **Git**: 2.30+

### 系统要求
- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **内存**: 最低4GB，推荐8GB+
- **磁盘空间**: 最低2GB可用空间
- **网络**: 稳定的互联网连接（用于AI服务）

## 📦 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-repo/iqe-inspection-system.git
cd iqe-inspection-system
```

### 2. 安装依赖
```bash
# 安装前端依赖
cd ai-inspection-dashboard
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 3. 数据库配置
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE iqe_inspection_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 环境配置
```bash
# 复制环境配置文件
cp backend/.env.example backend/.env

# 编辑配置文件
nano backend/.env
```

### 5. 启动服务
```bash
# 启动后端服务
cd backend
npm start

# 启动前端服务（新终端）
cd ai-inspection-dashboard
npm run dev
```

## ⚙️ 详细配置

### 数据库配置

#### MySQL配置文件 (backend/.env)
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=iqe_inspection_db
DB_USER=root
DB_PASSWORD=your_password
DB_DIALECT=mysql

# 服务器配置
PORT=3000
NODE_ENV=development

# AI服务配置
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com

# 日志配置
LOG_LEVEL=info
LOG_FILE=logs/app.log

# 安全配置
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:5173
```

#### 数据库初始化
```bash
# 运行数据库迁移
cd backend
npm run migrate

# 插入初始数据
npm run seed
```

### 前端配置

#### Vite配置 (ai-inspection-dashboard/vite.config.js)
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser'
  }
})
```

#### 环境变量 (ai-inspection-dashboard/.env)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=IQE智能检验系统
VITE_APP_VERSION=2.0.0
```

## 🚀 生产环境部署

### 1. 构建生产版本
```bash
# 构建前端
cd ai-inspection-dashboard
npm run build

# 构建后端（如果需要）
cd ../backend
npm run build
```

### 2. 使用PM2部署
```bash
# 安装PM2
npm install -g pm2

# 启动后端服务
cd backend
pm2 start ecosystem.config.js

# 查看服务状态
pm2 status
pm2 logs
```

#### PM2配置文件 (backend/ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'iqe-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
}
```

### 3. Nginx配置
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/ai-inspection-dashboard/dist;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐳 Docker部署

### 1. Docker Compose配置
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: iqe-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: iqe_inspection_db
      MYSQL_USER: iqeuser
      MYSQL_PASSWORD: iqepassword
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - iqe-network

  backend:
    build: ./backend
    container_name: iqe-backend
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: iqe_inspection_db
      DB_USER: iqeuser
      DB_PASSWORD: iqepassword
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - mysql
    networks:
      - iqe-network

  frontend:
    build: ./ai-inspection-dashboard
    container_name: iqe-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - iqe-network

volumes:
  mysql_data:

networks:
  iqe-network:
    driver: bridge
```

### 2. 启动Docker服务
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 🔍 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查MySQL服务状态
systemctl status mysql

# 检查端口占用
netstat -tlnp | grep 3306

# 测试数据库连接
mysql -h localhost -u root -p
```

#### 2. 前端无法访问后端API
```bash
# 检查后端服务状态
curl http://localhost:3000/health

# 检查防火墙设置
sudo ufw status

# 检查代理配置
cat ai-inspection-dashboard/vite.config.js
```

#### 3. AI服务调用失败
```bash
# 检查API密钥配置
grep DEEPSEEK_API_KEY backend/.env

# 测试API连接
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json"
```

### 日志查看
```bash
# 查看后端日志
tail -f backend/logs/app.log

# 查看PM2日志
pm2 logs iqe-backend

# 查看Docker日志
docker-compose logs backend
```

## 📊 性能优化

### 数据库优化
```sql
-- 创建索引
CREATE INDEX idx_material_code ON inventory(material_code);
CREATE INDEX idx_batch_number ON lab_tests(batch_number);
CREATE INDEX idx_timestamp ON online_tracking(timestamp);

-- 查询优化
EXPLAIN SELECT * FROM inventory WHERE material_code = 'R001';
```

### 缓存配置
```javascript
// Redis缓存配置
const redis = require('redis');
const client = redis.createClient({
  host: 'localhost',
  port: 6379,
  password: 'your-redis-password'
});
```

## 🛡️ 安全配置

### SSL证书配置
```bash
# 使用Let's Encrypt获取免费SSL证书
sudo certbot --nginx -d your-domain.com
```

### 防火墙配置
```bash
# 开放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # 后端API（仅内网）
sudo ufw enable
```

## 📈 监控和维护

### 系统监控
```bash
# 安装监控工具
npm install -g pm2-logrotate
pm2 install pm2-server-monit

# 设置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### 备份策略
```bash
#!/bin/bash
# 数据库备份脚本
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p iqe_inspection_db > backup_$DATE.sql
```

## 🔄 更新和升级

### 应用更新
```bash
# 拉取最新代码
git pull origin main

# 更新依赖
npm install

# 重启服务
pm2 restart iqe-backend
```

### 数据库迁移
```bash
# 运行数据库迁移
npm run migrate

# 回滚迁移（如果需要）
npm run migrate:undo
```

---

*本文档最后更新时间: 2025年1月*
