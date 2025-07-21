#!/bin/bash

# IQE智能质检系统 - 阿里云服务器环境安装脚本
# 适用于 Ubuntu 22.04

set -e

echo "🚀 开始安装IQE系统环境..."
echo "📅 时间: $(date)"
echo "🖥️  系统: $(lsb_release -d | cut -f2)"

# 更新系统包
echo "📦 更新系统包..."
apt update && apt upgrade -y

# 安装基础工具
echo "🔧 安装基础工具..."
apt install -y curl wget git vim unzip software-properties-common

# 安装Node.js 18.x
echo "📦 安装Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# 验证Node.js安装
echo "✅ Node.js版本: $(node --version)"
echo "✅ NPM版本: $(npm --version)"

# 安装PM2进程管理器
echo "📦 安装PM2..."
npm install -g pm2

# 安装MySQL
echo "🗄️  安装MySQL..."
apt install -y mysql-server

# 启动MySQL服务
systemctl start mysql
systemctl enable mysql

# 配置MySQL安全设置
echo "🔒 配置MySQL安全设置..."
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Zxylsy.99';"
mysql -e "DELETE FROM mysql.user WHERE User='';"
mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
mysql -e "DROP DATABASE IF EXISTS test;"
mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
mysql -e "FLUSH PRIVILEGES;"

# 创建IQE数据库
echo "🗄️  创建IQE数据库..."
mysql -u root -pZxylsy.99 -e "CREATE DATABASE IF NOT EXISTS iqe_inspection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -pZxylsy.99 -e "GRANT ALL PRIVILEGES ON iqe_inspection.* TO 'root'@'localhost';"
mysql -u root -pZxylsy.99 -e "FLUSH PRIVILEGES;"

# 安装Nginx
echo "🌐 安装Nginx..."
apt install -y nginx

# 启动Nginx服务
systemctl start nginx
systemctl enable nginx

# 配置防火墙
echo "🔥 配置防火墙..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 3001
ufw --force enable

# 创建应用目录
echo "📁 创建应用目录..."
mkdir -p /var/www/iqe
mkdir -p /var/log/iqe
mkdir -p /etc/iqe

# 设置目录权限
chown -R www-data:www-data /var/www/iqe
chown -R www-data:www-data /var/log/iqe

# 创建系统用户
echo "👤 创建应用用户..."
useradd -r -s /bin/false iqe || true

# 安装构建工具
echo "🔨 安装构建工具..."
apt install -y build-essential

echo "✅ 环境安装完成!"
echo ""
echo "📋 安装摘要:"
echo "  - Node.js: $(node --version)"
echo "  - NPM: $(npm --version)"
echo "  - MySQL: $(mysql --version | head -1)"
echo "  - Nginx: $(nginx -v 2>&1)"
echo "  - PM2: $(pm2 --version)"
echo ""
echo "🔗 服务状态:"
echo "  - MySQL: $(systemctl is-active mysql)"
echo "  - Nginx: $(systemctl is-active nginx)"
echo ""
echo "📁 目录结构:"
echo "  - 应用目录: /var/www/iqe"
echo "  - 日志目录: /var/log/iqe"
echo "  - 配置目录: /etc/iqe"
echo ""
echo "🎉 服务器环境准备完成，可以开始部署应用!"
