# 项目清理计划

## 🗑️ 可以删除的历史测试文件

### 前端项目清理 (ai-inspection-dashboard/)

#### 📁 测试和调试文件 (可删除)
```
- advanced-query-fix-test.md
- ai-rule-optimization-test.md
- complete-system-test.md
- fix-verification-test.md
- test-fix-verification.md
- test-assistant-ai.html
- test.js
- temp_file.vue
- temp_script.txt
- simple-test-server.js
```

#### 📁 备份和临时文件 (可删除)
```
- backup/ (整个目录)
- backups/ (整个目录)
- dist-backup/ (整个目录)
- temp/ (整个目录)
- tmp/ (整个目录)
- router_temp.js
- ProjectBaselineManager_new.vue
```

#### 📁 部署脚本 (保留主要的，删除重复的)
```
保留: deploy.js, start.ps1
删除: 
- build-only.ps1
- deploy-local.ps1
- deploy.ps1
- deploy.sh
- start.bat
```

#### 📁 文档文件 (整理后保留核心的)
```
保留: README.md, DEPLOYMENT.md
删除:
- OPTIMIZATION.md
- PROJECT_BASELINE_README.md
- QualityDataStandard.txt
- deploy-guide.md
- batch-formatter.txt
```

### 后端项目清理 (backend/)

#### 📁 大量测试和调试文件 (可删除)
```
- analyze-*.js (所有分析脚本)
- check-*.js (所有检查脚本)
- debug-*.js (所有调试脚本)
- test-*.js (所有测试脚本)
- fix-*.js (所有修复脚本)
- optimize-*.js (所有优化脚本)
- simple-*.js (所有简单测试脚本)
- comprehensive-*.js
- enhanced-*.js
- final-*.js
- quick-*.js
- ultra-simple-server.js
- minimal-server.js
```

#### 📁 临时和实验文件 (可删除)
```
- *-demo.js
- *-test.js
- troubleshooting-guide.js
- emergency-*.js
- simulate-*.js
- sync-*.js
- run-*.js
- push-*.js
- populate-*.js
- reset-database.js
```

#### 📁 保留的核心文件
```
保留:
- src/ (核心源码目录)
- setup-database.js (数据库初始化)
- package.json, package-lock.json
- start.js (启动脚本)
- README.md
```

## 🧹 清理执行脚本

### 前端清理脚本
```bash
#!/bin/bash
cd ai-inspection-dashboard

# 删除测试文件
rm -f advanced-query-fix-test.md ai-rule-optimization-test.md complete-system-test.md
rm -f fix-verification-test.md test-fix-verification.md test-assistant-ai.html
rm -f test.js temp_file.vue temp_script.txt simple-test-server.js

# 删除备份目录
rm -rf backup/ backups/ dist-backup/ temp/ tmp/

# 删除临时文件
rm -f router_temp.js ProjectBaselineManager_new.vue

# 删除重复的部署脚本
rm -f build-only.ps1 deploy-local.ps1 deploy.ps1 deploy.sh start.bat

# 删除多余文档
rm -f OPTIMIZATION.md PROJECT_BASELINE_README.md QualityDataStandard.txt
rm -f deploy-guide.md batch-formatter.txt

echo "前端清理完成"
```

### 后端清理脚本
```bash
#!/bin/bash
cd backend

# 删除所有测试和调试文件
rm -f analyze-*.js check-*.js debug-*.js test-*.js fix-*.js optimize-*.js
rm -f simple-*.js comprehensive-*.js enhanced-*.js final-*.js quick-*.js
rm -f ultra-simple-server.js minimal-server.js

# 删除临时和实验文件
rm -f *-demo.js *-test.js troubleshooting-guide.js
rm -f emergency-*.js simulate-*.js sync-*.js run-*.js push-*.js
rm -f populate-*.js reset-database.js

echo "后端清理完成"
```

## 📊 清理效果预估

### 前端项目
- **清理前**: ~200+ 文件
- **清理后**: ~150 文件
- **减少**: ~25% 文件数量

### 后端项目  
- **清理前**: ~100+ 根目录文件
- **清理后**: ~20 核心文件
- **减少**: ~80% 根目录文件

## ⚠️ 清理注意事项

1. **备份重要文件**: 清理前先备份整个项目
2. **保留核心功能**: 确保不删除正在使用的文件
3. **分步执行**: 先删除明显的测试文件，再删除可疑文件
4. **测试验证**: 清理后运行项目确保功能正常

## 🎯 清理优先级

### 高优先级 (立即可删除)
- 明确标记为test/debug的文件
- 备份目录和临时目录
- 重复的部署脚本

### 中优先级 (谨慎删除)
- 分析和优化脚本
- 多余的文档文件

### 低优先级 (保留观察)
- 可能还在使用的工具脚本
- 配置文件的备份版本

## ✅ 清理完成检查清单

- [ ] 项目仍能正常启动
- [ ] 核心功能正常工作
- [ ] 没有引用错误
- [ ] 文档结构清晰
- [ ] 部署脚本有效
