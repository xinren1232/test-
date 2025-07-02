/**
 * 调试数据推送问题
 */
import fetch from 'node-fetch';

async function debugDataPushIssue() {
  console.log('🔍 调试数据推送问题...\n');
  
  try {
    // 1. 检查后端API是否正常
    console.log('📊 步骤1: 检查后端API健康状态...');
    
    const healthResponse = await fetch('http://localhost:3002/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ 后端服务正常:', healthData.status);
    } else {
      console.log('❌ 后端服务异常:', healthResponse.status);
      return;
    }
    
    // 2. 测试数据推送API
    console.log('\n📊 步骤2: 测试数据推送API...');
    
    const testData = {
      inventory: [
        {
          id: 'TEST_001',
          materialName: '测试物料',
          materialCode: 'TEST-001',
          supplier: '测试供应商',
          quantity: 100,
          status: '正常',
          factory: '测试工厂'
        }
      ],
      inspection: [],
      production: []
    };
    
    console.log('🔄 推送测试数据...');
    const pushResponse = await fetch('http://localhost:3002/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📋 推送响应状态:', pushResponse.status);
    console.log('📋 推送响应头:', Object.fromEntries(pushResponse.headers.entries()));
    
    if (pushResponse.ok) {
      const pushResult = await pushResponse.json();
      console.log('✅ 数据推送成功:', pushResult);
    } else {
      const errorText = await pushResponse.text();
      console.log('❌ 数据推送失败:', errorText);
    }
    
    // 3. 测试前端代理
    console.log('\n📊 步骤3: 测试前端代理...');
    
    try {
      const proxyResponse = await fetch('http://localhost:5173/api/assistant/update-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      console.log('📋 代理响应状态:', proxyResponse.status);
      
      if (proxyResponse.ok) {
        const proxyResult = await proxyResponse.json();
        console.log('✅ 前端代理推送成功:', proxyResult);
      } else {
        const proxyErrorText = await proxyResponse.text();
        console.log('❌ 前端代理推送失败:', proxyErrorText);
      }
    } catch (proxyError) {
      console.log('❌ 前端代理连接失败:', proxyError.message);
    }
    
    // 4. 检查前端服务状态
    console.log('\n📊 步骤4: 检查前端服务状态...');
    
    try {
      const frontendResponse = await fetch('http://localhost:5173/');
      if (frontendResponse.ok) {
        console.log('✅ 前端服务正常运行');
      } else {
        console.log('❌ 前端服务异常:', frontendResponse.status);
      }
    } catch (frontendError) {
      console.log('❌ 前端服务连接失败:', frontendError.message);
    }
    
    // 5. 分析可能的问题
    console.log('\n📊 步骤5: 问题分析...');
    
    console.log('🔍 可能的问题原因:');
    console.log('1. 前端数据推送逻辑有问题');
    console.log('2. 前端代理配置问题');
    console.log('3. 数据格式不匹配');
    console.log('4. 网络连接问题');
    console.log('5. 前端localStorage数据为空');
    
    console.log('\n🔧 建议的解决方案:');
    console.log('1. 检查前端控制台错误信息');
    console.log('2. 确认前端localStorage中有数据');
    console.log('3. 检查前端SystemDataUpdater的pushDataToAssistant方法');
    console.log('4. 验证前端代理配置是否正确');
    console.log('5. 检查浏览器网络面板的请求详情');
    
    console.log('\n🎯 下一步操作:');
    console.log('1. 在浏览器中打开开发者工具');
    console.log('2. 查看控制台和网络面板');
    console.log('3. 尝试手动触发数据推送');
    console.log('4. 检查具体的错误信息');
    
    console.log('\n🎉 调试完成！');
    
  } catch (error) {
    console.error('❌ 调试过程中出错:', error.message);
  }
}

debugDataPushIssue().catch(console.error);
