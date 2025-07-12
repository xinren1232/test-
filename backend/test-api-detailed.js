import fetch from 'node-fetch';

async function testAPIDetailed() {
  try {
    console.log('🧪 详细测试API调用...\n');
    
    const query = '供应商对比分析';
    console.log(`🔍 测试查询: "${query}"`);
    
    const requestBody = {
      query: query,
      scenario: 'auto',
      analysisMode: 'auto',
      requireDataAnalysis: false
    };
    
    console.log('📤 请求体:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    
    console.log('📋 完整响应:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n🔍 响应分析:');
    console.log(`  ✅ 成功: ${result.success}`);
    console.log(`  📍 来源: ${result.source}`);
    console.log(`  🎯 处理模式: ${result.processingMode}`);
    console.log(`  🤖 AI增强: ${result.aiEnhanced}`);
    
    if (result.data) {
      if (Array.isArray(result.data)) {
        console.log(`  📋 数据: ${result.data.length} 条记录`);
        if (result.data.length > 0) {
          console.log(`  📄 样本: ${JSON.stringify(result.data[0])}`);
        }
      } else {
        console.log(`  📋 数据: ${typeof result.data}`);
      }
    } else {
      console.log(`  📋 数据: 无`);
    }
    
    if (result.reply) {
      console.log(`  💬 回复长度: ${result.reply.length} 字符`);
      console.log(`  💬 回复预览: ${result.reply.substring(0, 100)}...`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('🔍 错误详情:', error.stack);
  }
}

testAPIDetailed();
