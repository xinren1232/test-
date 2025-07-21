#!/bin/bash

# MySQL密码修复脚本
# 专门用于修复MySQL root密码配置问题

set -e

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

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "🔧 MySQL密码修复工具"
echo "📅 时间: $(date)"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    print_error "请使用root用户运行此脚本"
    exit 1
fi

# 检查MySQL服务状态
print_info "检查MySQL服务状态..."
if ! systemctl is-active --quiet mysql; then
    print_warning "MySQL服务未运行，正在启动..."
    systemctl start mysql
    sleep 3
fi
print_status "MySQL服务正在运行"

# 方法1: 尝试使用sudo mysql（Ubuntu 22.04默认方式）
print_info "方法1: 使用sudo mysql设置密码..."
if sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD'; FLUSH PRIVILEGES;" 2>/dev/null; then
    print_status "方法1成功：使用sudo mysql设置密码"
else
    print_warning "方法1失败，尝试方法2..."
    
    # 方法2: 尝试直接连接MySQL
    print_info "方法2: 直接连接MySQL设置密码..."
    if mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD'; FLUSH PRIVILEGES;" 2>/dev/null; then
        print_status "方法2成功：直接连接MySQL设置密码"
    else
        print_warning "方法2失败，尝试方法3..."
        
        # 方法3: 使用mysqladmin
        print_info "方法3: 使用mysqladmin设置密码..."
        if mysqladmin -u root password "$DB_PASSWORD" 2>/dev/null; then
            print_status "方法3成功：使用mysqladmin设置密码"
        else
            print_warning "方法3失败，尝试方法4..."
            
            # 方法4: 安全模式重置密码
            print_info "方法4: 使用安全模式重置密码..."
            
            # 停止MySQL服务
            systemctl stop mysql
            
            # 创建临时初始化文件
            cat > /tmp/mysql-init.sql << EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';
FLUSH PRIVILEGES;
EOF
            
            # 以安全模式启动MySQL
            mysqld_safe --init-file=/tmp/mysql-init.sql --user=mysql &
            MYSQLD_PID=$!
            
            # 等待MySQL启动
            sleep 10
            
            # 停止安全模式MySQL
            kill $MYSQLD_PID 2>/dev/null || true
            sleep 5
            
            # 删除临时文件
            rm -f /tmp/mysql-init.sql
            
            # 正常启动MySQL
            systemctl start mysql
            sleep 3
            
            print_status "方法4完成：安全模式重置密码"
        fi
    fi
fi

# 验证密码设置
print_info "验证密码设置..."
if mysql -u root -p"$DB_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1; then
    print_status "密码验证成功！"
    
    # 显示MySQL版本信息
    MYSQL_VERSION=$(mysql -u root -p"$DB_PASSWORD" -e "SELECT VERSION();" 2>/dev/null | tail -1)
    echo "MySQL版本: $MYSQL_VERSION"
    
    # 创建IQE数据库
    print_info "创建IQE数据库..."
    mysql -u root -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS iqe_inspection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    mysql -u root -p"$DB_PASSWORD" -e "GRANT ALL PRIVILEGES ON iqe_inspection.* TO 'root'@'localhost';"
    mysql -u root -p"$DB_PASSWORD" -e "FLUSH PRIVILEGES;"
    print_status "IQE数据库创建完成"
    
    # 显示数据库列表
    print_info "当前数据库列表:"
    mysql -u root -p"$DB_PASSWORD" -e "SHOW DATABASES;" 2>/dev/null | grep -v "Database\|information_schema\|performance_schema\|mysql\|sys"
    
else
    print_error "密码验证失败！"
    echo ""
    echo "🔧 手动修复步骤:"
    echo "1. 运行: sudo mysql"
    echo "2. 执行: ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';"
    echo "3. 执行: FLUSH PRIVILEGES;"
    echo "4. 执行: EXIT;"
    echo "5. 测试: mysql -u root -p$DB_PASSWORD -e \"SELECT 1;\""
    exit 1
fi

echo ""
print_status "MySQL密码修复完成！"
echo ""
echo "📋 配置信息:"
echo "  - 用户名: root"
echo "  - 密码: $DB_PASSWORD"
echo "  - 数据库: iqe_inspection"
echo ""
echo "🧪 测试命令:"
echo "  mysql -u root -p$DB_PASSWORD -e \"SELECT 1;\""
echo ""
echo "🔗 下一步: 运行应用部署脚本"
echo "  sudo ./deploy-app.sh"
