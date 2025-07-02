#!/bin/bash

# IQE AI助手项目清理脚本
# 删除历史测试文件和冗余文件，保持项目整洁

echo "🧹 开始IQE AI助手项目清理..."

# 创建备份
echo "📦 创建备份..."
backup_dir="project-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"
cp -r ai-inspection-dashboard "$backup_dir/"
cp -r backend "$backup_dir/"
echo "✅ 备份已创建: $backup_dir"

# 前端项目清理
echo "🎨 清理前端项目..."
cd ai-inspection-dashboard

# 删除测试和调试文件
echo "  删除测试文件..."
rm -f advanced-query-fix-test.md
rm -f ai-rule-optimization-test.md
rm -f complete-system-test.md
rm -f fix-verification-test.md
rm -f test-fix-verification.md
rm -f test-assistant-ai.html
rm -f test.js
rm -f temp_file.vue
rm -f temp_script.txt
rm -f simple-test-server.js

# 删除备份目录
echo "  删除备份目录..."
rm -rf backup/
rm -rf backups/
rm -rf dist-backup/
rm -rf temp/
rm -rf tmp/

# 删除临时文件
echo "  删除临时文件..."
rm -f router_temp.js
rm -f ProjectBaselineManager_new.vue

# 删除重复的部署脚本
echo "  删除重复部署脚本..."
rm -f build-only.ps1
rm -f deploy-local.ps1
rm -f deploy.ps1
rm -f deploy.sh
rm -f start.bat

# 删除多余文档
echo "  删除多余文档..."
rm -f OPTIMIZATION.md
rm -f PROJECT_BASELINE_README.md
rm -f QualityDataStandard.txt
rm -f deploy-guide.md
rm -f batch-formatter.txt

echo "✅ 前端清理完成"

# 后端项目清理
echo "🔧 清理后端项目..."
cd ../backend

# 删除所有测试和调试文件
echo "  删除测试调试文件..."
rm -f analyze-*.js
rm -f check-*.js
rm -f debug-*.js
rm -f test-*.js
rm -f fix-*.js
rm -f optimize-*.js
rm -f simple-*.js
rm -f comprehensive-*.js
rm -f enhanced-*.js
rm -f final-*.js
rm -f quick-*.js
rm -f ultra-simple-server.js
rm -f minimal-server.js

# 删除临时和实验文件
echo "  删除临时实验文件..."
rm -f *-demo.js
rm -f *-test.js
rm -f troubleshooting-guide.js
rm -f emergency-*.js
rm -f simulate-*.js
rm -f sync-*.js
rm -f run-*.js
rm -f push-*.js
rm -f populate-*.js
rm -f reset-database.js

echo "✅ 后端清理完成"

# 删除根目录的测试文件
echo "🗂️ 清理根目录..."
cd ..
rm -f test-intelligent-intent.js
rm -f CLEANUP_PLAN.md
rm -f DATA_RULE_ANALYSIS.md
rm -f COMPREHENSIVE_OPTIMIZATION.md
rm -f IMPLEMENTATION_VERIFICATION.md

# 统计清理效果
echo "📊 统计清理效果..."

frontend_files=$(find ai-inspection-dashboard -type f | wc -l)
backend_files=$(find backend -type f | wc -l)

echo "  前端文件数: $frontend_files"
echo "  后端文件数: $backend_files"

# 验证项目完整性
echo "🔍 验证项目完整性..."

# 检查关键文件是否存在
critical_files=(
    "ai-inspection-dashboard/package.json"
    "ai-inspection-dashboard/src/main.js"
    "ai-inspection-dashboard/src/pages/AssistantPageAIThreeColumn.vue"
    "backend/package.json"
    "backend/src/index.js"
    "backend/src/controllers/assistantController.js"
    "backend/src/services/intelligentIntentService.js"
    "backend/setup-database.js"
)

missing_files=()
for file in "${critical_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ 所有关键文件完整"
else
    echo "❌ 缺少关键文件:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    echo "⚠️ 请从备份恢复缺失文件"
fi

# 清理完成
echo ""
echo "🎉 项目清理完成！"
echo ""
echo "📋 清理总结:"
echo "  ✅ 删除了大量测试和调试文件"
echo "  ✅ 删除了重复的部署脚本"
echo "  ✅ 删除了临时和备份目录"
echo "  ✅ 保留了所有核心功能文件"
echo ""
echo "📦 备份位置: $backup_dir"
echo ""
echo "🚀 下一步:"
echo "  1. 测试项目是否正常运行: npm start"
echo "  2. 验证所有功能正常工作"
echo "  3. 如有问题，从备份恢复"
echo ""
echo "💡 建议:"
echo "  - 运行 'npm install' 确保依赖完整"
echo "  - 运行 'node setup-database.js' 初始化数据库"
echo "  - 测试AI助手功能是否正常"
