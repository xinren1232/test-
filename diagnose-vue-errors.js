/**
 * 诊断Vue应用的常见错误
 */

import fs from 'fs';
import path from 'path';

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function checkVueFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 检查基本结构
    const hasTemplate = content.includes('<template>');
    const hasScript = content.includes('<script');
    const hasStyle = content.includes('<style');
    
    // 检查常见错误
    const errors = [];
    
    // 检查未闭合的标签
    const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
    if (templateMatch) {
      const templateContent = templateMatch[1];
      // 简单检查div标签是否匹配
      const openDivs = (templateContent.match(/<div[^>]*>/g) || []).length;
      const closeDivs = (templateContent.match(/<\/div>/g) || []).length;
      if (openDivs !== closeDivs) {
        errors.push('可能存在未闭合的div标签');
      }
    }
    
    // 检查导入语句
    const importLines = content.match(/import.*from.*/g) || [];
    for (const importLine of importLines) {
      if (importLine.includes('events') && importLine.includes('EventEmitter')) {
        errors.push('使用了Node.js的EventEmitter，在浏览器环境中不可用');
      }
    }
    
    // 检查语法错误
    if (content.includes('export class') && content.includes('extends EventEmitter')) {
      errors.push('类继承了EventEmitter，可能导致浏览器兼容性问题');
    }
    
    return {
      exists: true,
      hasTemplate,
      hasScript,
      hasStyle,
      errors,
      size: content.length
    };
    
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
}

function diagnoseVueApp() {
  console.log('🔍 Vue应用诊断开始...\n');
  
  const basePath = './ai-inspection-dashboard/src';
  
  // 检查关键文件
  const keyFiles = [
    'pages/AssistantPageAIClean.vue',
    'components/AIThinkingProcess.vue',
    'services/DataSyncService.js',
    'services/QueryCacheService.js',
    'services/QueryOptimizer.js'
  ];
  
  console.log('📁 检查关键文件:');
  for (const file of keyFiles) {
    const fullPath = path.join(basePath, file);
    const result = checkVueFile(fullPath);
    
    if (result.exists) {
      console.log(`✅ ${file} (${Math.round(result.size/1024)}KB)`);
      
      if (result.errors && result.errors.length > 0) {
        console.log(`   ⚠️ 发现问题:`);
        result.errors.forEach(error => {
          console.log(`      - ${error}`);
        });
      }
      
      if (file.endsWith('.vue')) {
        const structure = [];
        if (result.hasTemplate) structure.push('template');
        if (result.hasScript) structure.push('script');
        if (result.hasStyle) structure.push('style');
        console.log(`   📋 结构: ${structure.join(', ')}`);
      }
    } else {
      console.log(`❌ ${file} - 文件不存在`);
      if (result.error) {
        console.log(`   错误: ${result.error}`);
      }
    }
  }
  
  // 检查package.json
  console.log('\n📦 检查依赖配置:');
  try {
    const packagePath = './ai-inspection-dashboard/package.json';
    if (checkFileExists(packagePath)) {
      const packageContent = fs.readFileSync(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      
      console.log('✅ package.json 存在');
      
      // 检查关键依赖
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      const keyDeps = ['vue', 'element-plus', 'vue-router'];
      
      for (const dep of keyDeps) {
        if (deps[dep]) {
          console.log(`   ✅ ${dep}: ${deps[dep]}`);
        } else {
          console.log(`   ❌ ${dep}: 未安装`);
        }
      }
    } else {
      console.log('❌ package.json 不存在');
    }
  } catch (error) {
    console.log(`❌ package.json 解析错误: ${error.message}`);
  }
  
  // 检查路由配置
  console.log('\n🛣️ 检查路由配置:');
  try {
    const routerPath = './ai-inspection-dashboard/src/router/index.js';
    if (checkFileExists(routerPath)) {
      const routerContent = fs.readFileSync(routerPath, 'utf-8');
      console.log('✅ 路由文件存在');
      
      // 检查assistant-ai路由
      if (routerContent.includes('/assistant-ai')) {
        console.log('   ✅ /assistant-ai 路由已配置');
      } else {
        console.log('   ❌ /assistant-ai 路由未找到');
      }
      
      // 检查动态导入
      const dynamicImports = routerContent.match(/import\(['"`][^'"`]+['"`]\)/g) || [];
      console.log(`   📋 动态导入数量: ${dynamicImports.length}`);
      
    } else {
      console.log('❌ 路由文件不存在');
    }
  } catch (error) {
    console.log(`❌ 路由文件检查错误: ${error.message}`);
  }
  
  console.log('\n🎯 诊断建议:');
  console.log('1. 如果页面无法加载，检查浏览器控制台的具体错误信息');
  console.log('2. 确保所有导入的文件路径正确');
  console.log('3. 检查是否有语法错误或未闭合的标签');
  console.log('4. 验证所有依赖都已正确安装');
  console.log('5. 如果使用了Node.js特有的模块，需要替换为浏览器兼容的版本');
}

// 运行诊断
diagnoseVueApp();
