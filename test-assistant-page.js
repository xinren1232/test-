/**
 * 测试AI助手页面是否正常加载
 */

import fetch from 'node-fetch';

async function testAssistantPage() {
  try {
    console.log('🔍 测试AI助手页面加载...');
    
    // 测试主页面
    const response = await fetch('http://localhost:5173/');
    
    if (response.ok) {
      console.log('✅ 前端服务正常运行');
      
      // 检查页面内容
      const html = await response.text();
      
      if (html.includes('IQE')) {
        console.log('✅ 页面内容正常');
      } else {
        console.log('⚠️ 页面内容可能有问题');
      }
      
      // 测试路由
      console.log('\n📋 可用路由测试:');
      const routes = [
        '/assistant-ai',
        '/ai-scenario-management',
        '/assistant-ai-simple'
      ];
      
      for (const route of routes) {
        try {
          const routeResponse = await fetch(`http://localhost:5173${route}`);
          console.log(`${routeResponse.ok ? '✅' : '❌'} ${route}: ${routeResponse.status}`);
        } catch (error) {
          console.log(`❌ ${route}: 连接失败`);
        }
      }
      
    } else {
      console.log('❌ 前端服务响应异常:', response.status);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 解决建议:');
      console.log('1. 确保前端服务正在运行: npm run dev');
      console.log('2. 检查端口5173是否被占用');
      console.log('3. 重启开发服务器');
    }
  }
}

// 运行测试
testAssistantPage();
