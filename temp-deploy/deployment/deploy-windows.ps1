# IQE智能质检系统 - Windows PowerShell部署脚本

param(
    [string]$ServerIP = "47.108.152.16",
    [string]$Username = "root",
    [string]$Password = "Zxylsy.99"
)

Write-Host "🚀 IQE智能质检系统 - Windows部署脚本" -ForegroundColor Green
Write-Host "📅 时间: $(Get-Date)" -ForegroundColor Cyan
Write-Host "🖥️  目标服务器: $ServerIP" -ForegroundColor Cyan
Write-Host ""

# 检查必要工具
Write-Host "🔍 检查本地环境..." -ForegroundColor Yellow

if (!(Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 需要安装OpenSSH客户端" -ForegroundColor Red
    Write-Host "请在Windows功能中启用OpenSSH客户端，或安装Git for Windows" -ForegroundColor Red
    exit 1
}

if (!(Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 需要安装SCP工具" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 本地环境检查通过" -ForegroundColor Green

# 检查项目目录
if (!(Test-Path "backend") -or !(Test-Path "ai-inspection-dashboard")) {
    Write-Host "❌ 请在项目根目录运行此脚本" -ForegroundColor Red
    Write-Host "当前目录: $(Get-Location)" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 项目目录检查通过" -ForegroundColor Green

# 创建部署包
Write-Host "📦 创建部署包..." -ForegroundColor Yellow
$TempDir = "temp-deploy-$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

# 复制文件
Copy-Item -Path "backend" -Destination "$TempDir\" -Recurse -Force
Copy-Item -Path "ai-inspection-dashboard" -Destination "$TempDir\" -Recurse -Force
Copy-Item -Path "deployment" -Destination "$TempDir\" -Recurse -Force

# 清理不需要的文件
if (Test-Path "$TempDir\backend\node_modules") {
    Remove-Item "$TempDir\backend\node_modules" -Recurse -Force
}
if (Test-Path "$TempDir\ai-inspection-dashboard\node_modules") {
    Remove-Item "$TempDir\ai-inspection-dashboard\node_modules" -Recurse -Force
}

Write-Host "✅ 部署包创建完成: $TempDir" -ForegroundColor Green

# 创建SSH密钥文件（临时）
$SecurePassword = ConvertTo-SecureString $Password -AsPlainText -Force
$Credential = New-Object System.Management.Automation.PSCredential($Username, $SecurePassword)

Write-Host "📤 上传代码到服务器..." -ForegroundColor Yellow

# 使用pscp上传文件（如果可用）
try {
    # 尝试使用scp上传
    $env:SSHPASS = $Password
    & scp -r -o StrictHostKeyChecking=no "$TempDir" "${Username}@${ServerIP}:/tmp/iqe-app" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 代码上传完成" -ForegroundColor Green
    } else {
        throw "SCP上传失败"
    }
} catch {
    Write-Host "⚠️  自动上传失败，请手动上传代码" -ForegroundColor Yellow
    Write-Host "请执行以下命令手动上传：" -ForegroundColor Cyan
    Write-Host "scp -r $TempDir root@47.108.152.16:/tmp/iqe-app" -ForegroundColor White
    Write-Host ""
    Read-Host "上传完成后按回车继续"
}

Write-Host "🔧 在服务器上执行部署..." -ForegroundColor Yellow

# 生成服务器执行脚本
$ServerScript = @"
#!/bin/bash
set -e

echo "🚀 开始在服务器上部署..."

# 检查上传的文件
if [ ! -d "/tmp/iqe-app" ]; then
    echo "❌ 未找到上传的代码文件"
    exit 1
fi

cd /tmp/iqe-app/deployment

# 执行环境安装
echo "🔧 安装服务器环境..."
chmod +x *.sh
./server-setup.sh

echo "🚀 部署应用..."
./deploy-app.sh

echo "🌐 配置Nginx..."
cp nginx-iqe.conf /etc/nginx/sites-available/iqe
ln -sf /etc/nginx/sites-available/iqe /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo "✅ 部署完成!"
echo "🌐 访问地址: http://47.108.152.16"
"@

# 将脚本保存到临时文件
$ServerScript | Out-File -FilePath "$TempDir\server-deploy.sh" -Encoding UTF8

Write-Host "📝 生成的服务器部署脚本已保存到: $TempDir\server-deploy.sh" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 请手动执行以下步骤完成部署：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 上传代码到服务器：" -ForegroundColor Cyan
Write-Host "   scp -r $TempDir root@47.108.152.16:/tmp/iqe-app" -ForegroundColor White
Write-Host ""
Write-Host "2. 连接到服务器：" -ForegroundColor Cyan
Write-Host "   ssh root@47.108.152.16" -ForegroundColor White
Write-Host ""
Write-Host "3. 在服务器上执行部署：" -ForegroundColor Cyan
Write-Host "   cd /tmp/iqe-app/deployment" -ForegroundColor White
Write-Host "   chmod +x *.sh" -ForegroundColor White
Write-Host "   ./server-setup.sh" -ForegroundColor White
Write-Host "   ./deploy-app.sh" -ForegroundColor White
Write-Host "   cp nginx-iqe.conf /etc/nginx/sites-available/iqe" -ForegroundColor White
Write-Host "   ln -sf /etc/nginx/sites-available/iqe /etc/nginx/sites-enabled/" -ForegroundColor White
Write-Host "   rm -f /etc/nginx/sites-enabled/default" -ForegroundColor White
Write-Host "   nginx -t && systemctl restart nginx" -ForegroundColor White
Write-Host ""
Write-Host "4. 访问应用：" -ForegroundColor Cyan
Write-Host "   http://47.108.152.16" -ForegroundColor White
Write-Host ""

# 清理临时文件
Write-Host "🧹 清理临时文件..." -ForegroundColor Yellow
# Remove-Item $TempDir -Recurse -Force

Write-Host "📋 部署包保留在: $TempDir" -ForegroundColor Cyan
Write-Host "🎉 部署脚本准备完成!" -ForegroundColor Green
