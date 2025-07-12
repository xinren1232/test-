/**
 * 测试前端API修复
 */

import fetch from 'node-fetch';

async function testFrontendAPIFix() {
  console.log('🧪 测试前端API修复...\n');
  
  try {
    // 1. 测试直接API调用
    console.log('📤 测试直接API调用...');
    const directResponse = await fetch('http://localhost:3001/api/rules');
    console.log(`📊 直接调用状态: ${directResponse.status}`);
    
    if (directResponse.ok) {
      const directResult = await directResponse.json();
      console.log(`✅ 直接调用成功，规则数量: ${directResult.count}`);
    } else {
      console.log('❌ 直接调用失败');
    }
    
    // 2. 测试前端代理
    console.log('\n📤 测试前端代理...');
    const proxyResponse = await fetch('http://localhost:5173/api/rules');
    console.log(`📊 代理调用状态: ${proxyResponse.status}`);
    
    if (proxyResponse.ok) {
      const proxyResult = await proxyResponse.json();
      console.log(`✅ 代理调用成功，规则数量: ${proxyResult.count}`);
    } else {
      const errorText = await proxyResponse.text();
      console.log(`❌ 代理调用失败: ${errorText}`);
    }
    
    // 3. 测试其他规则API端点
    console.log('\n📤 测试其他规则API端点...');
    
    const endpoints = [
      '/api/rules/categories',
      '/api/assistant/rules'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3001${endpoint}`);
        console.log(`📊 ${endpoint}: ${response.status} ${response.ok ? '✅' : '❌'}`);
      } catch (error) {
        console.log(`📊 ${endpoint}: ❌ ${error.message}`);
      }
    }
    
    // 4. 测试前端健康检查
    console.log('\n📤 测试前端健康检查...');
    try {
      const healthResponse = await fetch('http://localhost:5173/');
      console.log(`📊 前端健康检查: ${healthResponse.status} ${healthResponse.ok ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`📊 前端健康检查: ❌ ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testFrontendAPIFix();
