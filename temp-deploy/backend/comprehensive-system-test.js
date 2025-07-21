/**
 * 综合系统测试 - 验证智能问答系统的完整流程
 */

async function testCompleteSystem() {
  console.log('🧪 开始综合系统测试...\n');
  
  // 1. 测试数据库连接和数据
  console.log('📊 步骤1: 检查数据库数据...');
  try {
    const { execSync } = await import('child_process');
    const dbResult = execSync('node check-database.js', { encoding: 'utf8' });
    console.log('✅ 数据库检查完成');
  } catch (error) {
    console.log('❌ 数据库检查失败:', error.message);
  }
  
  // 2. 测试后端智能问答API
  console.log('\n🤖 步骤2: 测试后端智能问答API...');
  const testQueries = [
    '查询电池库存',
    '查询BOE供应商库存', 
    '查询测试失败(NG)的记录',
    '查询风险状态的库存'
  ];
  
  for (const query of testQueries) {
    try {
      const response = await fetch('http://localhost:3001/api/intelligent-qa/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ "${query}"`);
        console.log(`   模板: ${result.data?.template || '未知'}`);
        console.log(`   意图: ${result.data?.analysis?.intent || '未知'}`);
        console.log(`   实体: ${JSON.stringify(result.data?.analysis?.entities || {})}`);
        
        // 检查是否有实际数据
        if (result.data?.data && result.data.data.length > 0) {
          console.log(`   ✅ 返回数据: ${result.data.data.length} 条`);
        } else if (result.data?.inventory || result.data?.testing) {
          console.log(`   ✅ 返回统计数据`);
        } else {
          console.log(`   ⚠️ 无具体数据返回`);
        }
      } else {
        console.log(`❌ "${query}" - HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ "${query}" - ${error.message}`);
    }
  }
  
  // 3. 测试数据同步
  console.log('\n🔄 步骤3: 测试数据同步...');
  try {
    const { execSync } = await import('child_process');
    execSync('node sync-frontend-data.js', { encoding: 'utf8' });
    console.log('✅ 数据同步脚本执行完成');
  } catch (error) {
    console.log('❌ 数据同步失败:', error.message);
  }
  
  // 4. 检查前端数据文件
  console.log('\n📁 步骤4: 检查前端数据文件...');
  try {
    const fs = await import('fs');
    const syncScriptPath = '../ai-inspection-dashboard/public/sync-data-auto.js';
    
    if (fs.existsSync(syncScriptPath)) {
      const stats = fs.statSync(syncScriptPath);
      console.log(`✅ 同步脚本存在: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   修改时间: ${stats.mtime.toLocaleString()}`);
    } else {
      console.log('❌ 同步脚本不存在');
    }
  } catch (error) {
    console.log('❌ 检查文件失败:', error.message);
  }
  
  // 5. 测试前端API端点
  console.log('\n🌐 步骤5: 测试前端API端点...');
  try {
    const response = await fetch('http://localhost:5173/sync-data-auto.js');
    if (response.ok) {
      console.log('✅ 前端同步脚本可访问');
    } else {
      console.log(`❌ 前端同步脚本不可访问: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ 前端服务器连接失败:', error.message);
  }
  
  // 6. 生成诊断报告
  console.log('\n📋 步骤6: 生成诊断报告...');
  
  const diagnosticReport = {
    timestamp: new Date().toISOString(),
    backend_api: '需要手动测试',
    database_connection: '需要检查日志',
    data_sync: '已执行',
    frontend_script: '已生成',
    recommendations: [
      '1. 在浏览器中访问 http://localhost:5173/assistant',
      '2. 打开浏览器控制台',
      '3. 运行: const script = document.createElement("script"); script.src = "/sync-data-auto.js"; document.head.appendChild(script);',
      '4. 等待数据同步完成后测试查询',
      '5. 如果前端引擎失败，系统会自动降级到后端API'
    ]
  };
  
  console.log('\n📊 诊断报告:');
  console.log(JSON.stringify(diagnosticReport, null, 2));
  
  console.log('\n🎯 下一步操作建议:');
  console.log('1. 打开浏览器访问 http://localhost:5173/assistant');
  console.log('2. 在控制台运行数据同步脚本');
  console.log('3. 测试查询: "查询电池库存"');
  console.log('4. 检查是否返回真实数据而不是模板回复');
  
  console.log('\n🏁 综合测试完成');
}

// 运行测试
testCompleteSystem().catch(console.error);
