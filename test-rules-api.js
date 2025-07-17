/**
 * 测试规则API的简单脚本
 */

async function testRulesAPI() {
  try {
    console.log('🧪 测试规则API...');
    
    // 测试后端API
    console.log('📡 测试后端API: http://localhost:3001/api/rules');
    const backendResponse = await fetch('http://localhost:3001/api/rules');
    const backendData = await backendResponse.json();
    
    console.log('✅ 后端API响应状态:', backendResponse.status);
    console.log('📊 后端API数据格式:', {
      success: backendData.success,
      dataType: Array.isArray(backendData.data) ? 'array' : typeof backendData.data,
      count: backendData.count,
      firstRule: backendData.data?.[0]?.intent_name
    });
    
    // 测试前端代理API
    console.log('\n📡 测试前端代理API: http://localhost:5173/api/rules');
    const frontendResponse = await fetch('http://localhost:5173/api/rules');
    const frontendData = await frontendResponse.json();
    
    console.log('✅ 前端代理API响应状态:', frontendResponse.status);
    console.log('📊 前端代理API数据格式:', {
      success: frontendData.success,
      dataType: Array.isArray(frontendData.data) ? 'array' : typeof frontendData.data,
      count: frontendData.count,
      firstRule: frontendData.data?.[0]?.intent_name
    });
    
    // 比较两个响应
    const backendCount = backendData.data?.length || 0;
    const frontendCount = frontendData.data?.length || 0;
    
    if (backendCount === frontendCount) {
      console.log('✅ 后端和前端代理返回的数据数量一致:', backendCount);
    } else {
      console.log('❌ 数据数量不一致 - 后端:', backendCount, '前端:', frontendCount);
    }
    
    // 检查数据结构
    if (backendData.success && Array.isArray(backendData.data) && backendData.data.length > 0) {
      const sampleRule = backendData.data[0];
      console.log('\n📋 示例规则数据结构:');
      console.log('- ID:', sampleRule.id);
      console.log('- 名称:', sampleRule.intent_name);
      console.log('- 描述:', sampleRule.description);
      console.log('- 状态:', sampleRule.status);
      console.log('- 分类:', sampleRule.category);
      console.log('- 优先级:', sampleRule.priority);
    }
    
    console.log('\n🎉 API测试完成！');
    
  } catch (error) {
    console.error('❌ API测试失败:', error);
  }
}

// 如果在Node.js环境中运行
if (typeof window === 'undefined') {
  // Node.js环境，需要导入fetch
  const { default: fetch } = await import('node-fetch');
  global.fetch = fetch;
  testRulesAPI();
} else {
  // 浏览器环境
  testRulesAPI();
}
