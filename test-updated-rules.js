/**
 * 测试更新后的智能问答规则功能
 * 基于真实业务数据验证规则匹配
 */

async function testUpdatedRules() {
  console.log('🧪 测试更新后的智能问答规则功能...\n');

  // 基于真实业务数据的测试用例
  const testCases = [
    {
      name: 'X6827项目查询',
      query: '查询X6827项目的生产情况',
      expectedKeywords: ['X6827', '项目', '生产']
    },
    {
      name: 'KI5K项目查询',
      query: '查询KI5K项目的测试记录',
      expectedKeywords: ['KI5K', '项目', '测试']
    },
    {
      name: 'I6789基线查询',
      query: '查询I6789基线的测试情况',
      expectedKeywords: ['I6789', '基线', '测试']
    },
    {
      name: '重庆工厂库存查询',
      query: '查询重庆工厂的库存情况',
      expectedKeywords: ['重庆工厂', '库存']
    },
    {
      name: '电池盖物料查询',
      query: '查询电池盖的库存和质量情况',
      expectedKeywords: ['电池盖', '库存', '质量']
    },
    {
      name: '聚龙供应商查询',
      query: '查询聚龙供应商的物料质量',
      expectedKeywords: ['聚龙', '供应商', '物料']
    },
    {
      name: 'BOE供应商查询',
      query: '查询BOE供应商的显示屏质量',
      expectedKeywords: ['BOE', '供应商', '显示屏']
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
          console.log(`   ⚠️ 未找到预期关键词: ${testCase.expectedKeywords.join(', ')}`);
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
    console.log('🎉 所有测试通过！基于真实业务数据的规则功能正常工作。');
  } else if (passedTests > 0) {
    console.log('⚠️ 部分测试通过，规则已基于真实数据优化。');
  } else {
    console.log('❌ 所有测试失败，需要检查后端服务和规则配置。');
  }

  // 测试规则数量
  console.log('\n🔍 检查数据库中的规则数量...');
  try {
    const rulesResponse = await fetch('http://localhost:3001/api/assistant/rules-count');
    if (rulesResponse.ok) {
      const rulesResult = await rulesResponse.json();
      console.log(`📊 数据库中活跃规则数量: ${rulesResult.count || '未知'}`);
    }
  } catch (error) {
    console.log('❌ 无法获取规则数量');
  }
}

// 运行测试
testUpdatedRules().catch(console.error);
