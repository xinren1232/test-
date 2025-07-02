#!/bin/bash

# IQE智能质检系统开发环境设置脚本

echo "=== 设置IQE智能质检系统开发环境 ==="

# 更新系统包
sudo apt-get update

# 安装Node.js 18.x (LTS)
echo "安装Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证Node.js和npm安装
node --version
npm --version

# 安装pnpm全局包管理器
echo "安装pnpm..."
npm install -g pnpm
pnpm --version

# 添加pnpm到PATH
echo 'export PATH="$HOME/.local/share/pnpm:$PATH"' >> $HOME/.profile

# 进入工作目录
cd /mnt/persist/workspace

# 安装根级依赖
echo "安装根级依赖..."
pnpm install

# 安装前端依赖
echo "安装前端依赖..."
cd ai-inspection-dashboard
pnpm install
cd ..

# 安装API服务依赖
echo "安装API服务依赖..."
cd api-service
npm install
cd ..

# 安装后端服务依赖
echo "安装后端服务依赖..."
cd backend
npm install
cd ..

# 创建必要的环境变量文件
echo "创建环境变量文件..."

# API服务环境变量
cat > api-service/.env << EOF
DB_HOST=localhost
DB_USER=iqe_user
DB_PASS=iqe_password
DB_NAME=iqe_inspection
PORT=3000
NODE_ENV=development
EOF

# 后端服务环境变量
cat > backend/.env << EOF
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
OPENAI_API_KEY=sk-test-key
AI_MODEL=gpt-4o
AI_MAX_TOKENS=2000
EOF

# 前端环境变量
cat > ai-inspection-dashboard/.env.local << EOF
VITE_API_BASE_URL=http://localhost:3001/api
EOF

echo "=== 开发环境设置完成 ==="