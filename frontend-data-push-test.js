/**
 * 测试前端数据推送功能
 * 模拟前端的完整数据推送流程
 */

import fetch from 'node-fetch';

async function testFrontendDataPush() {
  console.log('🔍 测试前端数据推送功能\n');
  
  try {
    // 1. 检查前端服务状态
    console.log('📊 步骤1: 检查前端服务状态...');
    try {
      const frontendResponse = await fetch('http://localhost:5173');
      if (frontendResponse.ok) {
        console.log('✅ 前端服务正常运行');
      } else {
        console.log('❌ 前端服务异常');
      }
    } catch (error) {
      console.log('❌ 前端服务无法访问:', error.message);
    }
    
    // 2. 测试通过前端代理推送数据
    console.log('\n📊 步骤2: 测试通过前端代理推送数据...');
    
    const testData = {
      inventory: [
        {
          id: 1,
          materialName: '前端测试OLED显示屏',
          materialCode: 'FE001',
          supplier: '聚龙',
          batchNo: 'FE20241201001',
          quantity: 100,
          status: '正常',
          storageLocation: '深圳工厂',
          inboundTime: '2024-12-01'
        }
      ],
      inspection: [],
      production: []
    };
    
    // 尝试通过前端代理推送
    try {
      const proxyResponse = await fetch('http://localhost:5173/api/assistant/update-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      if (proxyResponse.ok) {
        const proxyResult = await proxyResponse.json();
        console.log('✅ 前端代理推送成功:', proxyResult.message);
      } else {
        const errorText = await proxyResponse.text();
        console.log('❌ 前端代理推送失败:', proxyResponse.status);
        console.log('   错误详情:', errorText.substring(0, 200));
      }
    } catch (error) {
      console.log('❌ 前端代理推送异常:', error.message);
    }
    
    // 3. 测试直接推送到后端
    console.log('\n📊 步骤3: 测试直接推送到后端...');
    
    try {
      const directResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      if (directResponse.ok) {
        const directResult = await directResponse.json();
        console.log('✅ 直接后端推送成功:', directResult.message);
      } else {
        const errorText = await directResponse.text();
        console.log('❌ 直接后端推送失败:', directResponse.status);
        console.log('   错误详情:', errorText);
      }
    } catch (error) {
      console.log('❌ 直接后端推送异常:', error.message);
    }
    
    // 4. 测试查询推送的数据
    console.log('\n📊 步骤4: 测试查询推送的数据...');
    
    const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: '查询前端测试OLED显示屏' })
    });
    
    if (queryResponse.ok) {
      const queryResult = await queryResponse.json();
      console.log('✅ 查询成功');
      
      const reply = queryResult.reply || '';
      if (reply.includes('前端测试OLED显示屏')) {
        console.log('✅ 查询结果包含推送的测试数据');
      } else {
        console.log('❌ 查询结果未包含推送的测试数据');
        console.log('   返回内容预览:', reply.substring(0, 200) + '...');
      }
    } else {
      console.log('❌ 查询失败:', queryResponse.status);
    }
    
    // 5. 分析问题
    console.log('\n📋 问题分析:');
    console.log('1. 检查前端数据生成是否正确调用了推送函数');
    console.log('2. 检查前端代理配置是否正确');
    console.log('3. 检查数据推送的时机是否合适');
    console.log('4. 检查数据格式是否与后端期望一致');
    
    // 6. 建议解决方案
    console.log('\n💡 建议解决方案:');
    console.log('1. 在前端数据生成完成后，手动触发数据推送');
    console.log('2. 检查SystemDataUpdater.js中的pushDataToAssistant方法');
    console.log('3. 确保数据推送在数据生成成功后立即执行');
    console.log('4. 添加数据推送状态的用户反馈');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

testFrontendDataPush();
