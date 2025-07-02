/**
 * 测试智能问答规则功能
 * 验证前后端连接和规则执行
 */

async function testRuleFunctionality() {
  console.log('🧪 开始测试智能问答规则功能...\n');

  // 测试用例 - 基于实际数据的查询
  const testCases = [
    {
      name: '深圳工厂库存查询',
      query: '查询深圳工厂的库存',
      expectedKeywords: ['深圳工厂', '库存', '泰科电子', '三星电子']
    },
    {
      name: '电阻器库存查询',
      query: '查询电阻器的库存情况',
      expectedKeywords: ['电阻器', '0805', '10K', 'F001']
    },
    {
      name: '测试记录查询',
      query: '查询测试结果为合格的记录',
      expectedKeywords: ['测试', '合格', '电气参数']
    },
    {
      name: '生产记录查询',
      query: '查询深圳工厂的生产记录',
      expectedKeywords: ['深圳工厂', '车间A', '产线1']
    },
    {
      name: '供应商查询',
      query: '查询泰科电子供应商的物料',
      expectedKeywords: ['泰科电子', '电阻器']
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`📋 测试 ${i + 1}/${totalTests}: ${testCase.name}`);
    console.log(`   查询: "${testCase.query}"`);

    try {
      // 测试基础查询API
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testCase.query
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ API调用成功`);
        console.log(`   📄 响应长度: ${result.reply.length} 字符`);
        
        // 检查响应是否包含预期关键词
        const responseText = result.reply.toLowerCase();
        const foundKeywords = testCase.expectedKeywords.filter(keyword => 
          responseText.includes(keyword.toLowerCase())
        );
        
        if (foundKeywords.length > 0) {
          console.log(`   🎯 找到关键词: ${foundKeywords.join(', ')}`);
          passedTests++;
        } else {
          console.log(`   ⚠️ 未找到预期关键词`);
        }
        
        // 显示响应预览
        const preview = result.reply.length > 100 ? 
          result.reply.substring(0, 100) + '...' : 
          result.reply;
        console.log(`   📖 响应预览: ${preview.replace(/\n/g, ' ')}`);
        
      } else {
        console.log(`   ❌ API调用失败: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ 测试失败: ${error.message}`);
    }
    
    console.log(''); // 空行分隔
  }

  // 测试总结
  console.log('📊 测试总结:');
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   通过测试: ${passedTests}`);
  console.log(`   成功率: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！规则功能正常工作。');
  } else if (passedTests > 0) {
    console.log('⚠️ 部分测试通过，需要进一步优化规则。');
  } else {
    console.log('❌ 所有测试失败，需要检查后端服务和规则配置。');
  }

  // 测试AI增强功能
  console.log('\n🤖 测试AI增强功能...');
  try {
    const aiResponse = await fetch('http://localhost:3001/api/assistant/ai-health');
    if (aiResponse.ok) {
      const aiResult = await aiResponse.json();
      console.log('✅ AI服务状态:', aiResult.status);
      console.log('🧠 DeepSeek状态:', aiResult.deepSeek?.status);
    } else {
      console.log('❌ AI服务检查失败');
    }
  } catch (error) {
    console.log('❌ AI服务连接失败:', error.message);
  }
}

// 运行测试
testRuleFunctionality().catch(console.error);
