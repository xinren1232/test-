import fs from 'fs';

async function debugFrontendRules() {
  try {
    console.log('🔍 调试前端规则加载问题...\n');
    
    // 1. 检查文件是否存在
    const publicRulesPath = '../ai-inspection-dashboard/public/data/rules.json';
    const srcRulesPath = '../frontend/src/data/rules.json';
    
    console.log('📁 文件存在性检查:');
    console.log(`   public/data/rules.json: ${fs.existsSync(publicRulesPath) ? '✅' : '❌'}`);
    console.log(`   frontend/src/data/rules.json: ${fs.existsSync(srcRulesPath) ? '✅' : '❌'}`);
    
    // 2. 检查文件内容
    if (fs.existsSync(publicRulesPath)) {
      const publicData = JSON.parse(fs.readFileSync(publicRulesPath, 'utf8'));
      console.log(`\n📊 public 文件内容:`);
      console.log(`   总规则数: ${publicData.totalRules}`);
      console.log(`   分类数量: ${publicData.categories.length}`);
      console.log(`   文件大小: ${fs.statSync(publicRulesPath).size} 字节`);
    }
    
    if (fs.existsSync(srcRulesPath)) {
      const srcData = JSON.parse(fs.readFileSync(srcRulesPath, 'utf8'));
      console.log(`\n📊 src 文件内容:`);
      console.log(`   总规则数: ${srcData.totalRules}`);
      console.log(`   分类数量: ${srcData.categories.length}`);
      console.log(`   文件大小: ${fs.statSync(srcRulesPath).size} 字节`);
    }
    
    // 3. 测试HTTP访问
    console.log('\n🌐 测试HTTP访问:');
    try {
      const response = await fetch('http://localhost:5173/data/rules.json');
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ HTTP访问成功: ${data.totalRules} 条规则`);
      } else {
        console.log(`   ❌ HTTP访问失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ HTTP访问错误: ${error.message}`);
    }
    
    // 4. 检查前端页面代码
    const frontendPagePath = '../ai-inspection-dashboard/src/pages/AssistantPageAIThreeColumn.vue';
    if (fs.existsSync(frontendPagePath)) {
      const pageContent = fs.readFileSync(frontendPagePath, 'utf8');
      
      console.log('\n🔍 前端页面代码检查:');
      
      // 检查fetch路径
      const fetchMatch = pageContent.match(/fetch\(['"`]([^'"`]+rules\.json)["`']\)/);
      if (fetchMatch) {
        console.log(`   fetch路径: ${fetchMatch[1]}`);
      } else {
        console.log('   ❌ 未找到fetch规则文件的代码');
      }
      
      // 检查loadRulesData函数
      if (pageContent.includes('loadRulesData')) {
        console.log('   ✅ 找到loadRulesData函数');
      } else {
        console.log('   ❌ 未找到loadRulesData函数');
      }
      
      // 检查onMounted调用
      if (pageContent.includes('await loadRulesData()')) {
        console.log('   ✅ onMounted中调用了loadRulesData');
      } else {
        console.log('   ❌ onMounted中未调用loadRulesData');
      }
    }
    
    console.log('\n🎯 问题诊断:');
    console.log('1. 确保前端开发服务器正在运行 (npm run dev)');
    console.log('2. 确保规则文件在 public/data/rules.json 位置');
    console.log('3. 确保前端代码使用正确的路径 /data/rules.json');
    console.log('4. 检查浏览器控制台是否有JavaScript错误');
    console.log('5. 尝试直接访问 http://localhost:5173/data/rules.json');
    
    console.log('\n🔧 修复建议:');
    console.log('1. 刷新浏览器页面 (Ctrl+F5 强制刷新)');
    console.log('2. 检查浏览器开发者工具的Network标签');
    console.log('3. 检查Console标签是否有错误信息');
    console.log('4. 尝试访问测试页面: http://localhost:5173/test-rules-loading.html');
    
  } catch (error) {
    console.error('❌ 调试过程中出错:', error);
  }
}

debugFrontendRules();
