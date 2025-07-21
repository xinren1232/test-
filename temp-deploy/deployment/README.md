# IQE智能质检系统 - 阿里云部署指南

## 🚀 快速部署

### 前提条件
- 阿里云服务器 Ubuntu 22.04
- 本地安装 `sshpass` 工具
- 确保服务器安全组开放端口：22, 80, 443, 3001

### 一键部署
```bash
# 在项目根目录执行
chmod +x deployment/full-deploy.sh
./deployment/full-deploy.sh
```

## 📋 部署架构

```
阿里云服务器 (47.108.152.16)
├── Nginx (端口80) - 反向代理 + 静态文件服务
│   ├── 前端静态文件 (/)
│   └── API代理 (/api/*)
├── Node.js后端 (端口3001) - PM2管理
│   ├── IQE后端API
│   └── 数据库连接
└── MySQL数据库 (端口3306)
    └── iqe_inspection数据库
```

## 🔧 手动部署步骤

### 1. 服务器环境安装
```bash
# 上传脚本到服务器
scp deployment/server-setup.sh root@47.108.152.16:/tmp/

# 在服务器上执行
ssh root@47.108.152.16
chmod +x /tmp/server-setup.sh
/tmp/server-setup.sh
```

### 2. 应用代码部署
```bash
# 上传应用代码
scp -r backend ai-inspection-dashboard root@47.108.152.16:/tmp/iqe-app/

# 部署应用
scp deployment/deploy-app.sh root@47.108.152.16:/tmp/
ssh root@47.108.152.16
chmod +x /tmp/deploy-app.sh
/tmp/deploy-app.sh
```

### 3. Nginx配置
```bash
# 上传Nginx配置
scp deployment/nginx-iqe.conf root@47.108.152.16:/etc/nginx/sites-available/iqe

# 启用站点
ssh root@47.108.152.16
ln -sf /etc/nginx/sites-available/iqe /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

## 🔗 访问地址

- **前端应用**: http://47.108.152.16
- **API接口**: http://47.108.152.16/api
- **健康检查**: http://47.108.152.16/health

## 🛠️ 服务管理

### PM2 进程管理
```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs iqe-backend

# 重启服务
pm2 restart iqe-backend

# 停止服务
pm2 stop iqe-backend

# 删除服务
pm2 delete iqe-backend
```

### Nginx 管理
```bash
# 检查配置
nginx -t

# 重启Nginx
systemctl restart nginx

# 查看状态
systemctl status nginx

# 查看日志
tail -f /var/log/nginx/iqe-access.log
tail -f /var/log/nginx/iqe-error.log
```

### MySQL 管理
```bash
# 连接数据库
mysql -u root -pZxylsy.99

# 查看数据库
SHOW DATABASES;
USE iqe_inspection;
SHOW TABLES;

# 备份数据库
mysqldump -u root -pZxylsy.99 iqe_inspection > backup.sql

# 恢复数据库
mysql -u root -pZxylsy.99 iqe_inspection < backup.sql
```

## 📁 目录结构

```
/var/www/iqe/
├── backend/                 # 后端应用
│   ├── src/                # 源代码
│   ├── node_modules/       # 依赖包
│   ├── .env               # 环境配置
│   └── ecosystem.config.js # PM2配置
├── frontend/               # 前端应用
│   └── dist/              # 构建产物
└── uploads/               # 上传文件

/var/log/iqe/              # 应用日志
├── iqe-backend.log        # 综合日志
├── iqe-backend-out.log    # 输出日志
└── iqe-backend-error.log  # 错误日志

/etc/nginx/sites-available/
└── iqe                    # Nginx配置文件
```

## 🔒 安全配置

### 防火墙设置
```bash
# 查看防火墙状态
ufw status

# 开放必要端口
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 3001  # API (可选，内部访问)
```

### SSL证书配置（推荐）
```bash
# 安装Certbot
apt install certbot python3-certbot-nginx

# 获取SSL证书（需要域名）
certbot --nginx -d yourdomain.com

# 自动续期
crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 监控和维护

### 系统监控
```bash
# 查看系统资源
htop
df -h
free -h

# 查看服务状态
systemctl status nginx mysql

# 查看端口占用
netstat -tlnp | grep :80
netstat -tlnp | grep :3001
```

### 日志监控
```bash
# 实时查看应用日志
pm2 logs iqe-backend --lines 100

# 查看Nginx访问日志
tail -f /var/log/nginx/iqe-access.log

# 查看系统日志
journalctl -u nginx -f
```

## 🔄 更新部署

### 应用更新
```bash
# 重新运行部署脚本
./deployment/full-deploy.sh

# 或手动更新
pm2 stop iqe-backend
# 上传新代码
pm2 start iqe-backend
```

### 数据库迁移
```bash
# 备份现有数据
mysqldump -u root -pZxylsy.99 iqe_inspection > backup_$(date +%Y%m%d).sql

# 执行迁移脚本
cd /var/www/iqe/backend
node migration-script.js
```

## 🆘 故障排除

### 常见问题

1. **服务无法启动**
   ```bash
   pm2 logs iqe-backend
   # 检查日志中的错误信息
   ```

2. **数据库连接失败**
   ```bash
   mysql -u root -pZxylsy.99
   # 检查数据库服务状态
   systemctl status mysql
   ```

3. **Nginx 502错误**
   ```bash
   # 检查后端服务是否运行
   curl http://localhost:3001/health
   # 检查Nginx配置
   nginx -t
   ```

4. **前端页面无法访问**
   ```bash
   # 检查文件权限
   ls -la /var/www/iqe/frontend/dist/
   # 检查Nginx配置
   cat /etc/nginx/sites-enabled/iqe
   ```

### 联系支持
如遇到问题，请提供以下信息：
- 错误日志内容
- 系统状态信息
- 操作步骤描述
