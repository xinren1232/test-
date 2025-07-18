// 测试数据验证API端点
import fetch from 'node-fetch';

async function testVerifyAPI() {
  console.log('🧪 测试数据验证API端点...\n');
  
  // 测试验证请求
  const testRequest = {
    expectedCounts: {
      inventory: 132,
      inspection: 0,
      production: 0
    }
  };

  try {
    console.log('📡 测试数据验证API: /api/assistant/verify-data');
    console.log('📊 发送验证请求:', testRequest);
    
    const response = await fetch('http://localhost:3001/api/assistant/verify-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRequest)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 验证API: 正常');
      console.log(`   验证结果: ${result.verified ? '通过' : '失败'}`);
      console.log(`   响应消息: ${result.message}`);
      console.log('   检查详情:');
      Object.entries(result.checks).forEach(([type, check]) => {
        console.log(`     ${type}: 期望${check.expected}, 实际${check.actual}, 匹配${check.match ? '✅' : '❌'}`);
      });
    } else {
      console.log('❌ 验证API: 失败');
      console.log(`   状态码: ${response.status}`);
      const errorText = await response.text();
      console.log(`   错误信息: ${errorText}`);
    }
  } catch (error) {
    console.log('❌ 验证API: 连接失败');
    console.log(`   错误: ${error.message}`);
  }

  console.log('\n🎉 数据验证API测试完成！');
}

testVerifyAPI().catch(console.error);
