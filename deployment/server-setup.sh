#!/bin/bash

# IQE智能质检系统 - 阿里云服务器环境安装脚本
# 适用于 Ubuntu 22.04

set -e

echo "🚀 开始安装IQE智能质检系统环境..."
echo "📅 时间: $(date)"
echo "🖥️  系统: $(lsb_release -d | cut -f2)"

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

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ 请使用root用户运行此脚本${NC}"
    exit 1
fi

# 更新系统包
print_info "更新系统包..."
apt update && apt upgrade -y
print_status "系统包更新完成"

# 安装基础工具
print_info "安装基础工具..."
apt install -y curl wget git vim unzip software-properties-common build-essential
print_status "基础工具安装完成"

# 安装Node.js 18.x
print_info "安装Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# 验证Node.js安装
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_status "Node.js安装完成: $NODE_VERSION"
print_status "NPM版本: $NPM_VERSION"

# 安装PM2进程管理器
print_info "安装PM2进程管理器..."
npm install -g pm2
PM2_VERSION=$(pm2 --version)
print_status "PM2安装完成: v$PM2_VERSION"

# 安装MySQL
print_info "安装MySQL数据库..."
apt install -y mysql-server

# 启动MySQL服务
systemctl start mysql
systemctl enable mysql
print_status "MySQL服务启动完成"

# 配置MySQL安全设置
print_info "配置MySQL安全设置..."

# 首先使用sudo mysql（无密码）设置root密码
print_info "设置MySQL root密码..."
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Zxylsy.99';" 2>/dev/null || \
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Zxylsy.99';"
mysql -e "FLUSH PRIVILEGES;" 2>/dev/null || \
sudo mysql -e "FLUSH PRIVILEGES;"
print_status "MySQL root密码设置完成"

# 现在使用密码连接MySQL进行安全配置
print_info "执行MySQL安全配置..."
mysql -u root -p'Zxylsy.99' -e "DELETE FROM mysql.user WHERE User='';"
mysql -u root -p'Zxylsy.99' -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
mysql -u root -p'Zxylsy.99' -e "DROP DATABASE IF EXISTS test;"
mysql -u root -p'Zxylsy.99' -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
mysql -u root -p'Zxylsy.99' -e "FLUSH PRIVILEGES;"
print_status "MySQL安全配置完成"

# 创建IQE数据库
print_info "创建IQE数据库..."
mysql -u root -p'Zxylsy.99' -e "CREATE DATABASE IF NOT EXISTS iqe_inspection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p'Zxylsy.99' -e "GRANT ALL PRIVILEGES ON iqe_inspection.* TO 'root'@'localhost';"
mysql -u root -p'Zxylsy.99' -e "FLUSH PRIVILEGES;"
print_status "IQE数据库创建完成"

# 验证数据库连接
print_info "验证数据库连接..."
if mysql -u root -p'Zxylsy.99' -e "SELECT 1;" > /dev/null 2>&1; then
    print_status "数据库连接验证成功"
else
    echo -e "${RED}❌ 数据库连接验证失败${NC}"
    exit 1
fi

# 安装Nginx
print_info "安装Nginx Web服务器..."
apt install -y nginx

# 启动Nginx服务
systemctl start nginx
systemctl enable nginx
NGINX_VERSION=$(nginx -v 2>&1)
print_status "Nginx安装完成: $NGINX_VERSION"

# 配置防火墙
print_info "配置防火墙规则..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 3001
ufw --force enable
print_status "防火墙配置完成"

# 创建应用目录
print_info "创建应用目录结构..."
mkdir -p /var/www/iqe/{backend,frontend}
mkdir -p /var/log/iqe
mkdir -p /etc/iqe
mkdir -p /var/www/iqe/uploads
mkdir -p /var/www/iqe/backups

# 设置目录权限
chown -R www-data:www-data /var/www/iqe
chown -R www-data:www-data /var/log/iqe
chmod -R 755 /var/www/iqe
chmod -R 755 /var/log/iqe
print_status "目录权限设置完成"

# 创建系统用户
print_info "创建应用用户..."
useradd -r -s /bin/false iqe 2>/dev/null || true
print_status "应用用户创建完成"

# 验证安装
print_info "验证安装结果..."
echo ""
echo "📋 安装摘要:"
echo "  - Node.js: $NODE_VERSION"
echo "  - NPM: v$NPM_VERSION"
echo "  - MySQL: $(mysql --version | head -1)"
echo "  - Nginx: $NGINX_VERSION"
echo "  - PM2: v$PM2_VERSION"
echo ""
echo "🔗 服务状态:"
echo "  - MySQL: $(systemctl is-active mysql)"
echo "  - Nginx: $(systemctl is-active nginx)"
echo ""
echo "📁 目录结构:"
echo "  - 应用目录: /var/www/iqe"
echo "  - 后端目录: /var/www/iqe/backend"
echo "  - 前端目录: /var/www/iqe/frontend"
echo "  - 日志目录: /var/log/iqe"
echo "  - 配置目录: /etc/iqe"
echo "  - 上传目录: /var/www/iqe/uploads"
echo "  - 备份目录: /var/www/iqe/backups"
echo ""
print_status "IQE智能质检系统环境安装完成！"
echo ""
print_warning "下一步: 运行应用部署脚本"
echo "  命令: sudo ./deploy-app.sh"
