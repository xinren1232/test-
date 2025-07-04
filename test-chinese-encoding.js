/**
 * 测试中文字符编码问题
 */

const testChineseEncoding = async () => {
  console.log('🧪 测试中文字符编码...');
  
  const testQuery = '查询深圳工厂库存';
  console.log('📝 原始查询:', testQuery);
  console.log('📝 查询长度:', testQuery.length);
  console.log('📝 查询字符编码:', [...testQuery].map(c => c.charCodeAt(0)));
  
  try {
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        query: testQuery,
        scenario: 'basic',
        analysisMode: 'rule',
        requireDataAnalysis: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ 请求成功');
    console.log('📋 返回内容:', result.reply.substring(0, 200));
    
    // 检查是否包含问号
    if (result.reply.includes('????????')) {
      console.log('❌ 检测到字符编码问题：后端接收到问号');
    } else {
      console.log('✅ 字符编码正常');
    }
    
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
};

// 运行测试
testChineseEncoding();
