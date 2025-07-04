/**
 * 简化的API测试脚本
 * 直接测试AI Q&A API的响应
 */
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function testSingleQuery(query, testName) {
  console.log(`\n🔍 ${testName}: "${query}"`);

  try {
    const response = await fetch(`${API_BASE}/api/assistant/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query
      })
    });

    if (!response.ok) {
      console.log(`❌ HTTP错误: ${response.status} ${response.statusText}`);
      return false;
    }

    const result = await response.json();

    if (result.reply && result.reply.length > 50) {
      console.log(`✅ 成功 - 数据源: ${result.source}`);
      console.log(`📊 回复长度: ${result.reply.length} 字符`);
      // 显示前100个字符
      console.log(`📝 回复预览: ${result.reply.substring(0, 100)}...`);
      return true;
    } else {
      console.log(`❌ 失败 - 回复过短或无回复`);
      return false;
    }

  } catch (error) {
    console.log(`❌ 请求失败: ${error.message}`);
    return false;
  }
}

async function testAPI() {
  console.log('🧪 全面测试更新后的AI Q&A规则\n');

  const testQueries = [
    { query: '查询聚龙的库存情况', name: '供应商查询测试' },
    { query: '查询重庆工厂的库存情况', name: '工厂查询测试' },
    { query: '查询风险状态的库存', name: '风险状态查询测试' },
    { query: '查询冻结状态的库存', name: '冻结状态查询测试' },
    { query: '分析摄像头的质量状态', name: '物料质量分析测试' },
    { query: '分析欣冠供应商的物料情况', name: '供应商物料分析测试' }
  ];

  let passedTests = 0;
  let totalTests = testQueries.length;

  for (const test of testQueries) {
    const success = await testSingleQuery(test.query, test.name);
    if (success) passedTests++;

    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 测试总结:');
  console.log(`✅ 通过测试: ${passedTests}/${totalTests}`);
  console.log(`📈 成功率: ${Math.round(passedTests/totalTests*100)}%`);

  if (passedTests === totalTests) {
    console.log('🎉 所有规则测试通过！AI Q&A系统已成功基于真实数据更新');
  } else if (passedTests > totalTests * 0.5) {
    console.log('✅ 大部分规则工作正常，系统基本可用');
  } else {
    console.log('⚠️ 多数规则需要进一步优化');
  }
}

// 运行测试
testAPI();
