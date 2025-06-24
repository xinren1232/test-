@echo off
REM IQE智能质检系统部署脚本

echo ===================================
echo IQE智能质检系统部署脚本
echo ===================================
echo.

REM 创建数据库
echo [1/5] 创建MySQL数据库...
echo 请输入MySQL root密码:
set /p MYSQL_ROOT_PASSWORD=
mysql -u root -p%MYSQL_ROOT_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS iqe_inspection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p%MYSQL_ROOT_PASSWORD% -e "CREATE USER IF NOT EXISTS 'iqe_user'@'localhost' IDENTIFIED BY 'iqe_password';"
mysql -u root -p%MYSQL_ROOT_PASSWORD% -e "GRANT ALL PRIVILEGES ON iqe_inspection.* TO 'iqe_user'@'localhost';"
mysql -u root -p%MYSQL_ROOT_PASSWORD% -e "FLUSH PRIVILEGES;"
mysql -u root -p%MYSQL_ROOT_PASSWORD% iqe_inspection < db-schema-optimized.sql
echo 数据库创建完成!
echo.

REM 安装API服务依赖
echo [2/5] 安装API服务依赖...
cd api-service
npm install
echo API服务依赖安装完成!
echo.

REM 创建API服务环境变量文件
echo [3/5] 创建API服务环境变量文件...
echo DB_HOST=localhost > .env
echo DB_USER=iqe_user >> .env
echo DB_PASS=iqe_password >> .env
echo DB_NAME=iqe_inspection >> .env
echo PORT=3000 >> .env
echo NODE_ENV=development >> .env
echo API服务环境变量文件创建完成!
echo.

REM 安装前端依赖
echo [4/5] 安装前端依赖...
cd ..
cd ai-inspection-dashboard
npm install
echo 前端依赖安装完成!
echo.

REM 创建前端环境变量文件
echo [5/5] 创建前端环境变量文件...
echo VITE_API_BASE_URL=http://localhost:3000/api > .env.local
echo 前端环境变量文件创建完成!
echo.

REM 创建Windows服务
echo 创建Windows服务...
nssm install IQE-Inspection "C:\Program Files\nodejs\node.exe" "C:\Program Files\IQE-Inspection\backend\server.js"
nssm set IQE-Inspection DisplayName "IQE动态检验系统"
nssm set IQE-Inspection Description "智能质量检验系统"
nssm set IQE-Inspection Start SERVICE_AUTO_START

echo ===================================
echo 部署完成!
echo.
echo 启动API服务:
echo cd api-service
echo npm run dev
echo.
echo 启动前端:
echo cd ai-inspection-dashboard
echo npm run dev
echo ===================================

echo 系统已安装到 C:\Program Files\IQE-Inspection
echo 服务名称: IQE-Inspection
echo 可以通过 http://localhost:3000 访问系统

pause 