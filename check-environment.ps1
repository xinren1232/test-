# IQE环境检查脚本
# 检查所有必要的组件是否正确安装和配置

Write-Host "🔍 IQE智能质检系统环境检查" -ForegroundColor Green
Write-Host "📅 时间: $(Get-Date)" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# 检查Node.js
Write-Host "1. 检查Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
    
    # 检查版本是否符合要求 (>= 16.0.0)
    $versionNumber = $nodeVersion -replace 'v', ''
    $majorVersion = [int]($versionNumber.Split('.')[0])
    if ($majorVersion -ge 16) {
        Write-Host "   ✅ 版本符合要求 (>= 16.0.0)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ 版本过低，建议升级到16.0.0或更高版本" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Node.js未安装" -ForegroundColor Red
    $allGood = $false
}

# 检查NPM
Write-Host "2. 检查NPM..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "   ✅ NPM: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ NPM未安装" -ForegroundColor Red
    $allGood = $false
}

# 检查MySQL服务
Write-Host "3. 检查MySQL服务..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue
if ($mysqlService) {
    Write-Host "   ✅ MySQL服务: $($mysqlService.Name)" -ForegroundColor Green
    Write-Host "   📊 服务状态: $($mysqlService.Status)" -ForegroundColor Cyan
    
    if ($mysqlService.Status -eq "Running") {
        Write-Host "   ✅ MySQL服务正在运行" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ MySQL服务未运行，尝试启动..." -ForegroundColor Yellow
        try {
            Start-Service -Name $mysqlService.Name
            Start-Sleep -Seconds 3
            $newStatus = (Get-Service -Name $mysqlService.Name).Status
            if ($newStatus -eq "Running") {
                Write-Host "   ✅ MySQL服务启动成功" -ForegroundColor Green
            } else {
                Write-Host "   ❌ MySQL服务启动失败" -ForegroundColor Red
                $allGood = $false
            }
        } catch {
            Write-Host "   ❌ 启动MySQL服务时出错: $($_.Exception.Message)" -ForegroundColor Red
            $allGood = $false
        }
    }
} else {
    Write-Host "   ❌ MySQL服务未找到" -ForegroundColor Red
    $allGood = $false
}

# 检查MySQL命令行工具
Write-Host "4. 检查MySQL命令行工具..." -ForegroundColor Yellow
if (Get-Command mysql -ErrorAction SilentlyContinue) {
    Write-Host "   ✅ MySQL命令行工具可用" -ForegroundColor Green
    
    # 测试数据库连接
    Write-Host "   🔧 测试数据库连接..." -ForegroundColor Yellow
    try {
        $testResult = mysql -u root -pZxylsy.99 -e "SELECT VERSION();" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ 数据库连接测试成功" -ForegroundColor Green
            
            # 检查数据库是否存在
            $dbCheck = mysql -u root -pZxylsy.99 -e "SHOW DATABASES LIKE 'iqe_inspection';" 2>$null
            if ($LASTEXITCODE -eq 0 -and $dbCheck) {
                Write-Host "   ✅ iqe_inspection数据库存在" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️ iqe_inspection数据库不存在，将在启动时创建" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ❌ 数据库连接失败，请检查密码" -ForegroundColor Red
            $allGood = $false
        }
    } catch {
        Write-Host "   ❌ 数据库连接测试失败: $($_.Exception.Message)" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   ❌ MySQL命令行工具不可用" -ForegroundColor Red
    $allGood = $false
}

# 检查端口占用
Write-Host "5. 检查端口占用..." -ForegroundColor Yellow
$ports = @(3001, 5173, 3306)
foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $processId = $connection.OwningProcess
        $processName = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
        Write-Host "   ⚠️ 端口 $port 被占用 (进程: $processName, PID: $processId)" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ 端口 $port 可用" -ForegroundColor Green
    }
}

# 检查项目文件
Write-Host "6. 检查项目文件..." -ForegroundColor Yellow
$requiredFiles = @(
    "backend\package.json",
    "backend\start-full-backend.js",
    "backend\src\config\db.config.js",
    "ai-inspection-dashboard\package.json"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file 存在" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file 不存在" -ForegroundColor Red
        $allGood = $false
    }
}

# 检查依赖安装
Write-Host "7. 检查项目依赖..." -ForegroundColor Yellow

# 后端依赖
if (Test-Path "backend\node_modules") {
    Write-Host "   ✅ 后端依赖已安装" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ 后端依赖未安装，需要运行 npm install" -ForegroundColor Yellow
}

# 前端依赖
if (Test-Path "ai-inspection-dashboard\node_modules") {
    Write-Host "   ✅ 前端依赖已安装" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ 前端依赖未安装，需要运行 npm install" -ForegroundColor Yellow
}

# 检查防火墙设置
Write-Host "8. 检查防火墙设置..." -ForegroundColor Yellow
try {
    $firewallRules = Get-NetFirewallRule -DisplayName "*Node*" -ErrorAction SilentlyContinue
    if ($firewallRules) {
        Write-Host "   ✅ 发现Node.js防火墙规则" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ 未发现Node.js防火墙规则，可能需要手动配置" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️ 无法检查防火墙设置" -ForegroundColor Yellow
}

# 显示总结
Write-Host ""
Write-Host "📋 环境检查总结" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

if ($allGood) {
    Write-Host "🎉 所有必要组件都已正确安装和配置!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 可以启动系统:" -ForegroundColor Green
    Write-Host "   双击 start-iqe-local.bat 启动完整系统" -ForegroundColor White
    Write-Host "   或者分别启动后端和前端服务" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 访问地址:" -ForegroundColor Cyan
    Write-Host "   后端API: http://localhost:3001" -ForegroundColor White
    Write-Host "   前端界面: http://localhost:5173" -ForegroundColor White
    Write-Host "   健康检查: http://localhost:3001/health" -ForegroundColor White
} else {
    Write-Host "❌ 发现问题，需要解决以下问题:" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 建议的解决步骤:" -ForegroundColor Yellow
    Write-Host "   1. 运行 setup-windows-local.ps1 安装缺失组件" -ForegroundColor White
    Write-Host "   2. 如果MySQL有问题，运行 install-mysql-windows.ps1" -ForegroundColor White
    Write-Host "   3. 安装项目依赖:" -ForegroundColor White
    Write-Host "      cd backend && npm install" -ForegroundColor Gray
    Write-Host "      cd ai-inspection-dashboard && npm install" -ForegroundColor Gray
    Write-Host "   4. 重新运行此检查脚本" -ForegroundColor White
}

Write-Host ""
Write-Host "📝 如需帮助，请查看项目文档或联系技术支持" -ForegroundColor Cyan
Write-Host ""

Read-Host "按回车键退出"
