/**
 * 调试API问题
 */

async function debugAPIIssue() {
  console.log('🔍 调试API问题...\n');
  
  // 简单的HTTP请求函数，包含详细错误信息
  async function makeDetailedRequest(query) {
    try {
      const { default: fetch } = await import('node-fetch');
      
      console.log(`📤 发送请求: POST /api/assistant/query`);
      console.log(`📤 请求体: ${JSON.stringify({ query })}`);
      
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });
      
      console.log(`📥 响应状态: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      console.log(`📥 响应内容: ${responseText.substring(0, 500)}...`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return JSON.parse(responseText);
      
    } catch (error) {
      console.log(`❌ 请求错误: ${error.message}`);
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }
  
  // 测试简单查询
  console.log('1. 测试简单查询:');
  const result1 = await makeDetailedRequest('查询电池库存');
  
  console.log('\n2. 测试另一个查询:');
  const result2 = await makeDetailedRequest('查询测试结果');
  
  // 检查规则端点
  console.log('\n3. 检查规则端点:');
  try {
    const { default: fetch } = await import('node-fetch');
    
    const rulesResponse = await fetch('http://localhost:3001/api/assistant/rules');
    const rulesData = await rulesResponse.json();
    
    if (rulesData.success) {
      console.log(`✅ 规则端点正常，返回 ${rulesData.rules?.length || 0} 条规则`);
    } else {
      console.log(`❌ 规则端点异常: ${rulesData.error?.message || '未知错误'}`);
    }
    
  } catch (error) {
    console.log(`❌ 规则端点请求失败: ${error.message}`);
  }
}

// 执行调试
debugAPIIssue();
