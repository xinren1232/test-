/**
 * 测试API脚本
 */

async function testAPI() {
  console.log('🧪 测试API开始...');
  
  // 等待服务器启动
  console.log('⏳ 等待服务器启动...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    console.log('📡 发送请求到智能问答API...');
    const response = await fetch('http://localhost:3001/api/intelligent-qa/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: '查询电池库存'
      })
    });
    
    console.log(`📊 响应状态: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 查询成功');
      console.log('📊 完整响应:', JSON.stringify(result, null, 2));
      
      // 检查响应内容
      if (result.success && result.data) {
        console.log('\n🔍 响应分析:');
        console.log(`   模板: ${result.data.template}`);
        console.log(`   意图: ${result.data.analysis?.intent}`);
        console.log(`   实体: ${JSON.stringify(result.data.analysis?.entities)}`);
        console.log(`   回复内容: ${result.data.response || result.data.answer}`);
        
        if (result.data.data) {
          console.log(`   数据条数: ${Array.isArray(result.data.data) ? result.data.data.length : '非数组'}`);
        }
      }
    } else {
      const errorText = await response.text();
      console.log('❌ 查询失败:', response.status, response.statusText);
      console.log('错误内容:', errorText);
    }
  } catch (error) {
    console.log('❌ 请求异常:', error.message);
  }
}

testAPI();
