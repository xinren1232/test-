import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function testIntelligentQAAPI() {
  console.log('🧪 测试智能问答API接口...\n');
  
  try {
    // 1. 测试系统能力接口
    console.log('1. 测试系统能力接口...');
    const capabilitiesResponse = await fetch(`${API_BASE}/api/intelligent-qa/capabilities`);
    const capabilities = await capabilitiesResponse.json();
    
    if (capabilities.success) {
      console.log('✅ 系统能力获取成功');
      console.log(`- 供应商数量: ${capabilities.data.supportedEntities.suppliers.length}`);
      console.log(`- 物料数量: ${capabilities.data.supportedEntities.materials.length}`);
      console.log(`- 工厂数量: ${capabilities.data.supportedEntities.factories.length}`);
      console.log(`- 问题类型: ${capabilities.data.questionTypes.length}`);
    } else {
      console.log('❌ 系统能力获取失败:', capabilities.error);
    }
    
    // 2. 测试查询建议接口
    console.log('\n2. 测试查询建议接口...');
    const suggestionsResponse = await fetch(`${API_BASE}/api/intelligent-qa/suggestions?query=供应商`);
    const suggestions = await suggestionsResponse.json();
    
    if (suggestions.success) {
      console.log('✅ 查询建议获取成功');
      console.log('建议列表:');
      suggestions.data.suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
    } else {
      console.log('❌ 查询建议获取失败:', suggestions.error);
    }
    
    // 3. 测试智能问答接口
    console.log('\n3. 测试智能问答接口...');
    const testQuestions = [
      'BOE供应商有哪些物料',
      'LCD显示屏有哪些供应商',
      '深圳工厂的库存情况',
      '风险状态的物料'
    ];
    
    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      console.log(`\n测试问题 ${i + 1}: "${question}"`);
      
      const response = await fetch(`${API_BASE}/api/intelligent-qa/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ 问答成功');
        console.log(`问题类型: ${result.data.analysis.type}`);
        console.log(`识别实体: ${JSON.stringify(result.data.analysis.entities)}`);
        console.log(`选择模板: ${result.data.template}`);
        console.log(`数据源: ${result.data.metadata.dataSource}`);
        console.log('回答预览:', result.data.answer.substring(0, 100) + '...');
      } else {
        console.log('❌ 问答失败:', result.error);
      }
      
      // 添加延迟
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✅ API测试完成');
    
  } catch (error) {
    console.error('❌ API测试失败:', error.message);
    
    // 检查服务器是否运行
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 提示: 请确保后端服务器正在运行');
      console.log('启动命令: cd backend && npm start');
    }
  }
}

testIntelligentQAAPI();
