/**
 * 修复端口配置脚本
 * 统一所有配置文件中的端口设置
 */
import fs from 'fs';
import path from 'path';

console.log('🔧 开始修复端口配置...\n');

// 目标端口配置
const TARGET_BACKEND_PORT = 3001;
const TARGET_FRONTEND_PORT = 5173;

// 需要修复的文件列表
const filesToFix = [
  // Vite配置文件
  {
    path: 'ai-inspection-dashboard/vite.config.js',
    replacements: [
      {
        search: /target: 'http:\/\/localhost:3002'/g,
        replace: `target: 'http://localhost:${TARGET_BACKEND_PORT}'`
      },
      {
        search: /target: 'http:\/\/localhost:3000'/g,
        replace: `target: 'http://localhost:${TARGET_BACKEND_PORT}'`
      }
    ]
  },

  // 环境变量文件
  {
    path: 'ai-inspection-dashboard/.env.development',
    replacements: [
      {
        search: /VITE_API_BASE_URL=.*$/gm,
        replace: 'VITE_API_BASE_URL=/api'
      }
    ]
  },

  // API服务配置
  {
    path: 'ai-inspection-dashboard/src/services/api/APIService.js',
    replacements: [
      {
        search: /const API_BASE_URL = .*/,
        replace: `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';`
      }
    ]
  },

  // 后端环境变量
  {
    path: 'backend/.env',
    replacements: [
      {
        search: /PORT=.*/,
        replace: `PORT=${TARGET_BACKEND_PORT}`
      }
    ]
  },

  // Vue页面中的硬编码端口
  {
    path: 'ai-inspection-dashboard/src/pages/AssistantPageNew.vue',
    replacements: [
      {
        search: /http:\/\/localhost:3002\/api\/assistant\/query/g,
        replace: '/api/assistant/query'
      }
    ]
  },

  {
    path: 'ai-inspection-dashboard/src/pages/AssistantPage.vue',
    replacements: [
      {
        search: /http:\/\/localhost:3002\/api\/assistant\/query/g,
        replace: '/api/assistant/query'
      }
    ]
  }
];

// 执行修复
for (const file of filesToFix) {
  try {
    if (fs.existsSync(file.path)) {
      console.log(`📝 修复文件: ${file.path}`);
      
      let content = fs.readFileSync(file.path, 'utf8');
      let modified = false;
      
      for (const replacement of file.replacements) {
        if (replacement.search.test(content)) {
          content = content.replace(replacement.search, replacement.replace);
          modified = true;
          console.log(`  ✅ 应用替换: ${replacement.search} -> ${replacement.replace}`);
        }
      }
      
      if (modified) {
        fs.writeFileSync(file.path, content, 'utf8');
        console.log(`  💾 文件已保存`);
      } else {
        console.log(`  ℹ️ 无需修改`);
      }
    } else {
      console.log(`  ⚠️ 文件不存在: ${file.path}`);
    }
  } catch (error) {
    console.log(`  ❌ 修复失败: ${error.message}`);
  }
  console.log('');
}

// 创建统一的环境变量文件
console.log('📝 创建统一的环境变量文件...');

// 前端环境变量
const frontendEnvContent = `# 开发环境配置
VITE_USE_REAL_API=true
VITE_API_BASE_URL=/api
VITE_BACKEND_PORT=${TARGET_BACKEND_PORT}
VITE_FRONTEND_PORT=${TARGET_FRONTEND_PORT}
`;

try {
  fs.writeFileSync('ai-inspection-dashboard/.env.development', frontendEnvContent, 'utf8');
  console.log('✅ 前端环境变量文件已更新');
} catch (error) {
  console.log('❌ 前端环境变量文件更新失败:', error.message);
}

// 后端环境变量
const backendEnvContent = `# IQE智能质检系统 - 环境变量配置

# 服务端口
PORT=${TARGET_BACKEND_PORT}

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=Zxylsy.99
DB_DATABASE=iqe_inspection

# 日志级别
LOG_LEVEL=info

# 开发环境标识
NODE_ENV=development

# API密钥 (如果需要)
API_SECRET_KEY=your-secret-key-here

# CORS配置
CORS_ORIGIN=http://localhost:${TARGET_FRONTEND_PORT}
`;

try {
  fs.writeFileSync('backend/.env', backendEnvContent, 'utf8');
  console.log('✅ 后端环境变量文件已更新');
} catch (error) {
  console.log('❌ 后端环境变量文件更新失败:', error.message);
}

console.log('\n🎯 端口配置修复完成！');
console.log(`📊 后端端口: ${TARGET_BACKEND_PORT}`);
console.log(`🌐 前端端口: ${TARGET_FRONTEND_PORT}`);
console.log('\n💡 建议操作:');
console.log('1. 重启后端服务');
console.log('2. 重启前端服务');
console.log('3. 清除浏览器缓存');
console.log('4. 重新测试问答功能');
