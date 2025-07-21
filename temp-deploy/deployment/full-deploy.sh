#!/bin/bash

# IQE智能质检系统 - 一键部署脚本
# 在本地运行，自动上传代码并部署到阿里云服务器

set -e

# 服务器配置
SERVER_IP="47.108.152.16"
SERVER_USER="root"
SERVER_PASSWORD="Zxylsy.99"
LOCAL_PROJECT_DIR="$(pwd)"

echo "🚀 IQE智能质检系统 - 一键部署"
echo "📅 时间: $(date)"
echo "🖥️  目标服务器: $SERVER_IP"
echo ""

# 检查本地环境
echo "🔍 检查本地环境..."
if ! command -v sshpass &> /dev/null; then
    echo "❌ 需要安装sshpass工具"
    echo "Ubuntu/Debian: sudo apt install sshpass"
    echo "macOS: brew install sshpass"
    exit 1
fi

if [ ! -d "backend" ] || [ ! -d "ai-inspection-dashboard" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    echo "当前目录: $(pwd)"
    exit 1
fi

echo "✅ 本地环境检查通过"

# 创建部署包
echo "📦 创建部署包..."
TEMP_DIR="/tmp/iqe-deploy-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$TEMP_DIR"

# 复制代码到临时目录
cp -r backend "$TEMP_DIR/"
cp -r ai-inspection-dashboard "$TEMP_DIR/"
cp -r deployment "$TEMP_DIR/"

# 清理不需要的文件
rm -rf "$TEMP_DIR/backend/node_modules" || true
rm -rf "$TEMP_DIR/ai-inspection-dashboard/node_modules" || true
rm -rf "$TEMP_DIR/backend/.git" || true
rm -rf "$TEMP_DIR/ai-inspection-dashboard/.git" || true

echo "✅ 部署包创建完成: $TEMP_DIR"

# 上传代码到服务器
echo "📤 上传代码到服务器..."
sshpass -p "$SERVER_PASSWORD" scp -r -o StrictHostKeyChecking=no "$TEMP_DIR" "$SERVER_USER@$SERVER_IP:/tmp/iqe-app"

echo "✅ 代码上传完成"

# 在服务器上执行部署
echo "🔧 在服务器上执行环境安装..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
cd /tmp/iqe-app/deployment
chmod +x *.sh
./server-setup.sh
EOF

echo "✅ 服务器环境安装完成"

echo "🚀 在服务器上部署应用..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
cd /tmp/iqe-app/deployment
./deploy-app.sh
EOF

echo "✅ 应用部署完成"

echo "🌐 配置Nginx..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
# 复制Nginx配置
cp /tmp/iqe-app/deployment/nginx-iqe.conf /etc/nginx/sites-available/iqe

# 启用站点
ln -sf /etc/nginx/sites-available/iqe /etc/nginx/sites-enabled/

# 删除默认站点
rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
nginx -t

# 重启Nginx
systemctl restart nginx

echo "✅ Nginx配置完成"
EOF

echo "✅ Nginx配置完成"

# 清理临时文件
echo "🧹 清理临时文件..."
rm -rf "$TEMP_DIR"

# 测试部署结果
echo "🧪 测试部署结果..."
sleep 10

# 测试后端API
if curl -f "http://$SERVER_IP/health" > /dev/null 2>&1; then
    echo "✅ 后端API测试通过"
else
    echo "⚠️  后端API测试失败，请检查服务状态"
fi

# 测试前端
if curl -f "http://$SERVER_IP/" > /dev/null 2>&1; then
    echo "✅ 前端页面测试通过"
else
    echo "⚠️  前端页面测试失败，请检查配置"
fi

echo ""
echo "🎉 部署完成!"
echo ""
echo "📋 部署信息:"
echo "  🌐 前端地址: http://$SERVER_IP"
echo "  🔗 API地址: http://$SERVER_IP/api"
echo "  ❤️  健康检查: http://$SERVER_IP/health"
echo ""
echo "🔧 服务器管理:"
echo "  📊 查看服务状态: ssh root@$SERVER_IP 'pm2 status'"
echo "  📝 查看日志: ssh root@$SERVER_IP 'pm2 logs iqe-backend'"
echo "  🔄 重启服务: ssh root@$SERVER_IP 'pm2 restart iqe-backend'"
echo ""
echo "📁 服务器目录:"
echo "  - 应用目录: /var/www/iqe"
echo "  - 日志目录: /var/log/iqe"
echo "  - Nginx配置: /etc/nginx/sites-available/iqe"
echo ""
echo "🎯 下一步建议:"
echo "  1. 配置域名解析（如果有域名）"
echo "  2. 配置SSL证书（推荐Let's Encrypt）"
echo "  3. 设置定期备份"
echo "  4. 配置监控告警"

# 显示服务器状态
echo ""
echo "📊 当前服务器状态:"
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
echo "  💾 内存使用: $(free -h | grep Mem | awk '{print $3"/"$2}')"
echo "  💿 磁盘使用: $(df -h / | tail -1 | awk '{print $3"/"$2" ("$5")"}')"
echo "  🔄 系统负载: $(uptime | awk -F'load average:' '{print $2}')"
echo "  🚀 PM2状态:"
pm2 jlist | jq -r '.[] | "    - \(.name): \(.pm2_env.status) (CPU: \(.monit.cpu)%, 内存: \(.monit.memory/1024/1024 | floor)MB)"' 2>/dev/null || pm2 status
EOF
