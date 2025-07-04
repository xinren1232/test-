/**
 * 调试智能意图服务状态
 */

const debugIntentService = async () => {
  console.log('🔍 调试智能意图服务状态...\n');
  
  try {
    // 测试服务状态
    const statusResponse = await fetch('http://localhost:3001/api/assistant/debug/intent-rules', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('📋 智能意图服务状态:');
      console.log(`   规则数量: ${statusData.totalRules || '未知'}`);
      console.log(`   激活规则: ${statusData.activeRules || '未知'}`);
      console.log(`   数据库规则: ${statusData.dbRules || '未知'}`);
      console.log(`   备用规则: ${statusData.fallbackRules || '未知'}`);
      
      if (statusData.rules) {
        console.log('\n📋 规则列表:');
        statusData.rules.forEach((rule, index) => {
          console.log(`   ${index + 1}. ${rule.intent_name} (优先级: ${rule.priority}, 状态: ${rule.status})`);
        });
      }
    } else {
      console.log('❌ 无法获取服务状态');
    }
    
    // 测试具体查询的意图识别
    console.log('\n🔍 测试意图识别...');
    const testQuery = '重庆工厂的库存情况';
    
    const testResponse = await fetch('http://localhost:3001/api/assistant/debug/identify-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: testQuery })
    });
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log(`📋 查询: "${testQuery}"`);
      console.log(`   匹配意图: ${testData.matchedIntent || '无'}`);
      console.log(`   匹配分数: ${testData.score || 0}`);
      console.log(`   提取参数: ${JSON.stringify(testData.parameters || {})}`);
    } else {
      console.log('❌ 无法测试意图识别');
    }
    
  } catch (error) {
    console.log(`❌ 调试失败: ${error.message}`);
    
    // 如果API不存在，直接测试查询
    console.log('\n🔄 直接测试查询处理...');
    
    const directResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '重庆工厂的库存情况',
        scenario: 'basic',
        analysisMode: 'rule'
      })
    });
    
    if (directResponse.ok) {
      const directData = await directResponse.json();
      console.log(`📋 直接查询结果:`);
      console.log(`   响应来源: ${directData.source}`);
      console.log(`   分析模式: ${directData.analysisMode}`);
      console.log(`   匹配规则: ${directData.matchedRule || '无'}`);
      
      if (directData.intentResult) {
        console.log(`   意图处理: ${directData.intentResult.success ? '成功' : '失败'}`);
        console.log(`   匹配意图: ${directData.intentResult.intent || '无'}`);
        if (directData.intentResult.error) {
          console.log(`   错误信息: ${directData.intentResult.error}`);
        }
      }
    }
  }
};

debugIntentService();
