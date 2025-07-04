/**
 * 测试更新后的AI Q&A规则
 * 验证规则是否能正确匹配和查询真实数据
 */
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function testUpdatedRules() {
  console.log('🧪 测试更新后的AI Q&A规则\n');

  const testQueries = [
    {
      name: '测试供应商查询',
      query: '查询聚龙的库存情况',
      expectedKeywords: ['聚龙', '供应商', '物料数量']
    },
    {
      name: '测试工厂查询',
      query: '查询重庆工厂的库存情况',
      expectedKeywords: ['重庆工厂', '物料名称', '批次数量']
    },
    {
      name: '测试状态查询',
      query: '查询风险状态的库存',
      expectedKeywords: ['风险', '状态', '物料名称']
    },
    {
      name: '测试物料分析',
      query: '分析摄像头的质量状态',
      expectedKeywords: ['摄像头', '质量', '状态']
    },
    {
      name: '测试冻结库存查询',
      query: '查询冻结查询',
      expectedKeywords: ['冻结', '状态', '物料名称']
    },
    {
      name: '测试供应商物料分析',
      query: '分析聚龙供应商的物料情况',
      expectedKeywords: ['聚龙', '供应商', '物料名称']
    }
  ];

  let passedTests = 0;
  let totalTests = testQueries.length;

  for (const test of testQueries) {
    console.log(`\n🔍 ${test.name}:`);
    console.log(`   查询: "${test.query}"`);
    
    try {
      const response = await fetch(`${API_BASE}/api/assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: test.query
        })
      });

      if (!response.ok) {
        console.log(`   ❌ HTTP错误: ${response.status}`);
        continue;
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`   ✅ 查询成功`);
        console.log(`   📊 返回数据: ${result.data ? result.data.length : 0} 条记录`);
        
        // 检查是否包含预期关键词
        const responseText = JSON.stringify(result).toLowerCase();
        const matchedKeywords = test.expectedKeywords.filter(keyword => 
          responseText.includes(keyword.toLowerCase())
        );
        
        if (matchedKeywords.length > 0) {
          console.log(`   🎯 匹配关键词: ${matchedKeywords.join(', ')}`);
          passedTests++;
        } else {
          console.log(`   ⚠️ 未匹配预期关键词: ${test.expectedKeywords.join(', ')}`);
        }
        
        // 显示部分结果数据
        if (result.data && result.data.length > 0) {
          console.log(`   📋 示例数据:`, result.data[0]);
        }
        
      } else {
        console.log(`   ❌ 查询失败: ${result.error || '未知错误'}`);
      }
      
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
    }
    
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 测试总结:');
  console.log(`✅ 通过测试: ${passedTests}/${totalTests}`);
  console.log(`📈 成功率: ${Math.round(passedTests/totalTests*100)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有规则测试通过！AI Q&A系统已成功更新');
  } else {
    console.log('⚠️ 部分规则需要进一步优化');
  }
}

// 运行测试
testUpdatedRules();
