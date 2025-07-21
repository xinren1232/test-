# IQE智能质检系统 - Windows本地环境安装脚本
# 适用于Windows 10/11系统

param(
    [switch]$SkipMySQL = $false,
    [switch]$SkipNodeJS = $false,
    [switch]$Force = $false
)

Write-Host "🚀 IQE智能质检系统 - Windows本地环境安装" -ForegroundColor Green
Write-Host "📅 时间: $(Get-Date)" -ForegroundColor Cyan
Write-Host ""

# 检查管理员权限
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ 需要管理员权限运行此脚本" -ForegroundColor Red
    Write-Host "请右键点击PowerShell，选择'以管理员身份运行'" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

Write-Host "✅ 管理员权限检查通过" -ForegroundColor Green

# 检查Chocolatey包管理器
Write-Host "🔍 检查Chocolatey包管理器..." -ForegroundColor Yellow
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "📦 安装Chocolatey包管理器..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    # 刷新环境变量
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "✅ Chocolatey安装成功" -ForegroundColor Green
    } else {
        Write-Host "❌ Chocolatey安装失败" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Chocolatey已安装" -ForegroundColor Green
}

# 安装Node.js
if (!$SkipNodeJS) {
    Write-Host "🔍 检查Node.js..." -ForegroundColor Yellow
    if (!(Get-Command node -ErrorAction SilentlyContinue) -or $Force) {
        Write-Host "📦 安装Node.js..." -ForegroundColor Yellow
        choco install nodejs -y
        
        # 刷新环境变量
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        if (Get-Command node -ErrorAction SilentlyContinue) {
            $nodeVersion = node --version
            Write-Host "✅ Node.js安装成功: $nodeVersion" -ForegroundColor Green
        } else {
            Write-Host "❌ Node.js安装失败" -ForegroundColor Red
            exit 1
        }
    } else {
        $nodeVersion = node --version
        Write-Host "✅ Node.js已安装: $nodeVersion" -ForegroundColor Green
    }
}

# 安装MySQL
if (!$SkipMySQL) {
    Write-Host "🔍 检查MySQL..." -ForegroundColor Yellow
    
    # 检查MySQL服务是否存在
    $mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue
    
    if (!$mysqlService -or $Force) {
        Write-Host "📦 安装MySQL..." -ForegroundColor Yellow
        
        # 使用Chocolatey安装MySQL
        choco install mysql -y
        
        # 等待安装完成
        Start-Sleep -Seconds 10
        
        # 检查MySQL服务
        $mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue
        
        if ($mysqlService) {
            Write-Host "✅ MySQL安装成功" -ForegroundColor Green
            
            # 启动MySQL服务
            Write-Host "🔧 启动MySQL服务..." -ForegroundColor Yellow
            Start-Service -Name $mysqlService.Name
            
            # 等待服务启动
            Start-Sleep -Seconds 5
            
            # 检查服务状态
            $serviceStatus = (Get-Service -Name $mysqlService.Name).Status
            if ($serviceStatus -eq "Running") {
                Write-Host "✅ MySQL服务启动成功" -ForegroundColor Green
            } else {
                Write-Host "⚠️ MySQL服务启动失败，状态: $serviceStatus" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ MySQL安装失败" -ForegroundColor Red
            Write-Host "请手动安装MySQL或使用MySQL Installer" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ MySQL已安装" -ForegroundColor Green
        
        # 检查服务状态
        $serviceStatus = $mysqlService.Status
        if ($serviceStatus -ne "Running") {
            Write-Host "🔧 启动MySQL服务..." -ForegroundColor Yellow
            Start-Service -Name $mysqlService.Name
            Start-Sleep -Seconds 3
            $serviceStatus = (Get-Service -Name $mysqlService.Name).Status
        }
        
        Write-Host "📊 MySQL服务状态: $serviceStatus" -ForegroundColor Cyan
    }
}

# 安装PM2
Write-Host "🔍 检查PM2..." -ForegroundColor Yellow
if (!(Get-Command pm2 -ErrorAction SilentlyContinue) -or $Force) {
    Write-Host "📦 安装PM2..." -ForegroundColor Yellow
    npm install -g pm2
    
    if (Get-Command pm2 -ErrorAction SilentlyContinue) {
        $pm2Version = pm2 --version
        Write-Host "✅ PM2安装成功: $pm2Version" -ForegroundColor Green
    } else {
        Write-Host "❌ PM2安装失败" -ForegroundColor Red
    }
} else {
    $pm2Version = pm2 --version
    Write-Host "✅ PM2已安装: $pm2Version" -ForegroundColor Green
}

# 创建数据库
Write-Host "🔧 配置数据库..." -ForegroundColor Yellow
try {
    # 检查MySQL命令行工具
    if (Get-Command mysql -ErrorAction SilentlyContinue) {
        Write-Host "📝 创建数据库..." -ForegroundColor Yellow
        
        # 创建数据库的SQL命令
        $createDbSql = @"
CREATE DATABASE IF NOT EXISTS iqe_inspection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE iqe_inspection;
SHOW TABLES;
"@
        
        # 将SQL保存到临时文件
        $tempSqlFile = "$env:TEMP\create_iqe_db.sql"
        $createDbSql | Out-File -FilePath $tempSqlFile -Encoding UTF8
        
        # 执行SQL（使用默认root用户，密码为Zxylsy.99）
        Write-Host "🔑 使用密码连接MySQL..." -ForegroundColor Yellow
        mysql -u root -pZxylsy.99 -e "CREATE DATABASE IF NOT EXISTS iqe_inspection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 数据库创建成功" -ForegroundColor Green
        } else {
            Write-Host "⚠️ 数据库创建可能失败，请手动检查" -ForegroundColor Yellow
        }
        
        # 清理临时文件
        Remove-Item $tempSqlFile -ErrorAction SilentlyContinue
    } else {
        Write-Host "⚠️ 未找到mysql命令行工具，请手动创建数据库" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ 数据库配置过程中出现错误: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 安装项目依赖
Write-Host "📦 安装项目依赖..." -ForegroundColor Yellow

# 后端依赖
if (Test-Path "backend\package.json") {
    Write-Host "🔧 安装后端依赖..." -ForegroundColor Yellow
    Set-Location "backend"
    npm install
    Set-Location ".."
    Write-Host "✅ 后端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "⚠️ 未找到backend\package.json" -ForegroundColor Yellow
}

# 前端依赖
if (Test-Path "ai-inspection-dashboard\package.json") {
    Write-Host "🔧 安装前端依赖..." -ForegroundColor Yellow
    Set-Location "ai-inspection-dashboard"
    npm install
    Set-Location ".."
    Write-Host "✅ 前端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "⚠️ 未找到ai-inspection-dashboard\package.json" -ForegroundColor Yellow
}

# 创建启动脚本
Write-Host "📝 创建启动脚本..." -ForegroundColor Yellow

# 创建后端启动脚本
$backendStartScript = @"
@echo off
echo 🚀 启动IQE后端服务...
cd /d "%~dp0backend"
echo 📍 当前目录: %CD%
echo 🔧 启动完整后端服务器...
node start-full-backend.js
pause
"@

$backendStartScript | Out-File -FilePath "start-backend-local.bat" -Encoding ASCII

# 创建前端启动脚本
$frontendStartScript = @"
@echo off
echo 🚀 启动IQE前端服务...
cd /d "%~dp0ai-inspection-dashboard"
echo 📍 当前目录: %CD%
echo 🔧 启动前端开发服务器...
npm run dev
pause
"@

$frontendStartScript | Out-File -FilePath "start-frontend-local.bat" -Encoding ASCII

# 创建完整启动脚本
$fullStartScript = @"
@echo off
echo 🚀 启动完整IQE系统...
echo.
echo 📊 启动后端服务...
start "IQE Backend" cmd /k "cd /d "%~dp0" && start-backend-local.bat"
echo.
echo ⏳ 等待后端服务启动...
timeout /t 5 /nobreak > nul
echo.
echo 🎨 启动前端服务...
start "IQE Frontend" cmd /k "cd /d "%~dp0" && start-frontend-local.bat"
echo.
echo ✅ 系统启动完成!
echo 🔗 后端地址: http://localhost:3001
echo 🔗 前端地址: http://localhost:5173
echo.
pause
"@

$fullStartScript | Out-File -FilePath "start-iqe-local.bat" -Encoding ASCII

Write-Host "✅ 启动脚本创建完成" -ForegroundColor Green

# 显示安装结果
Write-Host ""
Write-Host "🎉 IQE智能质检系统本地环境安装完成!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 安装摘要:" -ForegroundColor Cyan
Write-Host "  ✅ Node.js: $(if (Get-Command node -ErrorAction SilentlyContinue) { node --version } else { '未安装' })" -ForegroundColor White
Write-Host "  ✅ NPM: $(if (Get-Command npm -ErrorAction SilentlyContinue) { npm --version } else { '未安装' })" -ForegroundColor White
Write-Host "  ✅ PM2: $(if (Get-Command pm2 -ErrorAction SilentlyContinue) { pm2 --version } else { '未安装' })" -ForegroundColor White
Write-Host "  ✅ MySQL: $(if (Get-Service -Name 'MySQL*' -ErrorAction SilentlyContinue) { '已安装' } else { '未安装' })" -ForegroundColor White
Write-Host ""
Write-Host "🚀 启动方式:" -ForegroundColor Cyan
Write-Host "  1. 完整启动: 双击 start-iqe-local.bat" -ForegroundColor White
Write-Host "  2. 仅后端: 双击 start-backend-local.bat" -ForegroundColor White
Write-Host "  3. 仅前端: 双击 start-frontend-local.bat" -ForegroundColor White
Write-Host ""
Write-Host "🔗 访问地址:" -ForegroundColor Cyan
Write-Host "  后端API: http://localhost:3001" -ForegroundColor White
Write-Host "  前端界面: http://localhost:5173" -ForegroundColor White
Write-Host "  健康检查: http://localhost:3001/health" -ForegroundColor White
Write-Host ""
Write-Host "📝 注意事项:" -ForegroundColor Yellow
Write-Host "  - 确保MySQL服务正在运行" -ForegroundColor White
Write-Host "  - 数据库密码: Zxylsy.99" -ForegroundColor White
Write-Host "  - 如有问题，请检查防火墙设置" -ForegroundColor White
Write-Host ""

Read-Host "按回车键退出"
