/**
 * 简单的fetch测试
 */

console.log('🧪 开始简单fetch测试...');

try {
  const response = await fetch('http://localhost:3001/api/intelligent-qa/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question: 'BOE供应商有哪些物料'
    })
  });
  
  console.log(`📊 响应状态: ${response.status}`);
  
  if (response.ok) {
    const result = await response.json();
    console.log('✅ 查询成功');
    console.log('📊 响应数据:');
    console.log(JSON.stringify(result, null, 2));
  } else {
    const errorText = await response.text();
    console.log('❌ 查询失败');
    console.log('错误内容:', errorText);
  }
} catch (error) {
  console.log('❌ 请求异常:', error.message);
  console.log('错误详情:', error);
}
