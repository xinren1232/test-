# MySQL Windows 安装脚本
# 专门用于在Windows上安装和配置MySQL

param(
    [string]$MySQLVersion = "8.0.35",
    [string]$RootPassword = "Zxylsy.99",
    [switch]$Force = $false
)

Write-Host "🗄️ MySQL Windows 安装脚本" -ForegroundColor Green
Write-Host "📅 时间: $(Get-Date)" -ForegroundColor Cyan
Write-Host ""

# 检查管理员权限
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ 需要管理员权限运行此脚本" -ForegroundColor Red
    Write-Host "请右键点击PowerShell，选择'以管理员身份运行'" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

# 检查现有MySQL安装
Write-Host "🔍 检查现有MySQL安装..." -ForegroundColor Yellow
$existingMySQL = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue

if ($existingMySQL -and !$Force) {
    Write-Host "✅ 发现现有MySQL服务: $($existingMySQL.Name)" -ForegroundColor Green
    Write-Host "📊 服务状态: $($existingMySQL.Status)" -ForegroundColor Cyan
    
    if ($existingMySQL.Status -ne "Running") {
        Write-Host "🔧 启动MySQL服务..." -ForegroundColor Yellow
        try {
            Start-Service -Name $existingMySQL.Name
            Start-Sleep -Seconds 3
            $serviceStatus = (Get-Service -Name $existingMySQL.Name).Status
            Write-Host "✅ MySQL服务已启动: $serviceStatus" -ForegroundColor Green
        } catch {
            Write-Host "❌ 启动MySQL服务失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # 测试数据库连接
    Write-Host "🔧 测试数据库连接..." -ForegroundColor Yellow
    if (Get-Command mysql -ErrorAction SilentlyContinue) {
        try {
            mysql -u root -p$RootPassword -e "SELECT VERSION();" 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ 数据库连接测试成功" -ForegroundColor Green
                Write-Host "🎉 MySQL已准备就绪!" -ForegroundColor Green
                Read-Host "按回车键退出"
                exit 0
            }
        } catch {
            Write-Host "⚠️ 数据库连接测试失败，可能需要重新配置密码" -ForegroundColor Yellow
        }
    }
}

# 下载并安装MySQL
Write-Host "📦 开始安装MySQL..." -ForegroundColor Yellow

# 方法1: 使用Chocolatey安装
Write-Host "🍫 尝试使用Chocolatey安装MySQL..." -ForegroundColor Yellow
if (Get-Command choco -ErrorAction SilentlyContinue) {
    try {
        choco install mysql -y --params="'/Port:3306 /ServiceName:MySQL /RootPassword:$RootPassword'"
        
        # 等待安装完成
        Start-Sleep -Seconds 15
        
        # 检查安装结果
        $mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue
        if ($mysqlService) {
            Write-Host "✅ MySQL通过Chocolatey安装成功" -ForegroundColor Green
        } else {
            throw "Chocolatey安装失败"
        }
    } catch {
        Write-Host "⚠️ Chocolatey安装失败: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "🔄 尝试其他安装方法..." -ForegroundColor Yellow
    }
}

# 方法2: 下载MySQL Installer
if (!(Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue)) {
    Write-Host "📥 下载MySQL Installer..." -ForegroundColor Yellow
    
    $installerUrl = "https://dev.mysql.com/get/Downloads/MySQLInstaller/mysql-installer-community-8.0.35.0.msi"
    $installerPath = "$env:TEMP\mysql-installer.msi"
    
    try {
        # 下载安装程序
        Write-Host "⬇️ 正在下载MySQL安装程序..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing
        
        if (Test-Path $installerPath) {
            Write-Host "✅ MySQL安装程序下载完成" -ForegroundColor Green
            
            # 静默安装MySQL
            Write-Host "🔧 开始安装MySQL..." -ForegroundColor Yellow
            $installArgs = "/i `"$installerPath`" /quiet /norestart ADDLOCAL=ALL"
            Start-Process -FilePath "msiexec.exe" -ArgumentList $installArgs -Wait
            
            # 等待安装完成
            Start-Sleep -Seconds 20
            
            # 检查安装结果
            $mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue
            if ($mysqlService) {
                Write-Host "✅ MySQL安装成功" -ForegroundColor Green
            } else {
                Write-Host "❌ MySQL安装失败" -ForegroundColor Red
            }
            
            # 清理安装文件
            Remove-Item $installerPath -ErrorAction SilentlyContinue
        }
    } catch {
        Write-Host "❌ 下载或安装MySQL失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 配置MySQL服务
$mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue
if ($mysqlService) {
    Write-Host "🔧 配置MySQL服务..." -ForegroundColor Yellow
    
    # 启动服务
    if ($mysqlService.Status -ne "Running") {
        try {
            Start-Service -Name $mysqlService.Name
            Start-Sleep -Seconds 5
            Write-Host "✅ MySQL服务已启动" -ForegroundColor Green
        } catch {
            Write-Host "❌ 启动MySQL服务失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # 设置服务为自动启动
    try {
        Set-Service -Name $mysqlService.Name -StartupType Automatic
        Write-Host "✅ MySQL服务已设置为自动启动" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ 设置自动启动失败: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# 配置MySQL root密码和创建数据库
Write-Host "🔑 配置MySQL数据库..." -ForegroundColor Yellow

# 查找MySQL安装路径
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin",
    "C:\ProgramData\chocolatey\lib\mysql\tools\bin",
    "C:\tools\mysql\current\bin"
)

$mysqlBinPath = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path "$path\mysql.exe") {
        $mysqlBinPath = $path
        break
    }
}

if ($mysqlBinPath) {
    Write-Host "✅ 找到MySQL安装路径: $mysqlBinPath" -ForegroundColor Green
    
    # 添加到PATH环境变量
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    if ($currentPath -notlike "*$mysqlBinPath*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$mysqlBinPath", "Machine")
        $env:Path += ";$mysqlBinPath"
        Write-Host "✅ MySQL已添加到PATH环境变量" -ForegroundColor Green
    }
    
    # 创建数据库
    try {
        Write-Host "📝 创建IQE数据库..." -ForegroundColor Yellow
        
        # 尝试连接并创建数据库
        $createDbCommand = "CREATE DATABASE IF NOT EXISTS iqe_inspection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        
        # 使用mysql命令行工具
        & "$mysqlBinPath\mysql.exe" -u root -p$RootPassword -e $createDbCommand 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 数据库创建成功" -ForegroundColor Green
        } else {
            Write-Host "⚠️ 数据库创建可能失败，请手动检查" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️ 数据库配置过程中出现错误: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ 未找到MySQL安装路径，请手动配置" -ForegroundColor Yellow
}

# 显示安装结果
Write-Host ""
Write-Host "🎉 MySQL安装配置完成!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 配置信息:" -ForegroundColor Cyan
Write-Host "  🗄️ 数据库: iqe_inspection" -ForegroundColor White
Write-Host "  👤 用户名: root" -ForegroundColor White
Write-Host "  🔑 密码: $RootPassword" -ForegroundColor White
Write-Host "  🔌 端口: 3306" -ForegroundColor White
Write-Host "  🏠 主机: localhost" -ForegroundColor White
Write-Host ""

# 最终检查
$finalService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue
if ($finalService) {
    Write-Host "✅ MySQL服务状态: $($finalService.Status)" -ForegroundColor Green
    
    if (Get-Command mysql -ErrorAction SilentlyContinue) {
        Write-Host "✅ MySQL命令行工具可用" -ForegroundColor Green
    } else {
        Write-Host "⚠️ MySQL命令行工具不在PATH中，可能需要重启命令行" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ MySQL服务未找到，安装可能失败" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 手动安装建议:" -ForegroundColor Yellow
    Write-Host "  1. 访问 https://dev.mysql.com/downloads/installer/" -ForegroundColor White
    Write-Host "  2. 下载 MySQL Installer for Windows" -ForegroundColor White
    Write-Host "  3. 选择 'Developer Default' 安装类型" -ForegroundColor White
    Write-Host "  4. 设置root密码为: $RootPassword" -ForegroundColor White
}

Write-Host ""
Read-Host "按回车键退出"
