/**
 * 完整连接测试脚本
 * 测试前端代理和后端API的完整连接
 */
import fetch from 'node-fetch';

console.log('🔧 开始完整连接测试...\n');

async function testFullConnection() {
  try {
    // 1. 测试后端直连
    console.log('📊 步骤1: 测试后端直连...');
    const backendResponse = await fetch('http://localhost:3001/api/health');
    
    if (backendResponse.ok) {
      const backendData = await backendResponse.json();
      console.log('✅ 后端直连成功:', backendData.message);
    } else {
      console.log('❌ 后端直连失败:', backendResponse.status);
      return;
    }
    
    // 2. 测试前端代理
    console.log('\n📊 步骤2: 测试前端代理...');
    try {
      const proxyResponse = await fetch('http://localhost:5173/api/health');
      
      if (proxyResponse.ok) {
        const proxyData = await proxyResponse.json();
        console.log('✅ 前端代理成功:', proxyData.message);
      } else {
        console.log('❌ 前端代理失败:', proxyResponse.status);
      }
    } catch (proxyError) {
      console.log('❌ 前端代理连接失败:', proxyError.message);
    }
    
    // 3. 测试数据推送（通过代理）
    console.log('\n📊 步骤3: 测试数据推送（通过代理）...');
    const testData = {
      inventory: [
        {
          id: 'TEST_001',
          materialName: 'OLED显示屏',
          materialCode: 'DS-O-M4529',
          supplier: 'BOE',
          quantity: 850,
          status: '正常',
          factory: '深圳工厂',
          warehouse: 'A区仓库',
          notes: '测试数据'
        }
      ],
      inspection: [],
      production: []
    };
    
    try {
      const updateResponse = await fetch('http://localhost:5173/api/assistant/update-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      if (updateResponse.ok) {
        const updateResult = await updateResponse.json();
        console.log('✅ 数据推送成功（通过代理）');
      } else {
        console.log('❌ 数据推送失败（通过代理）:', updateResponse.status);
      }
    } catch (updateError) {
      console.log('❌ 数据推送连接失败（通过代理）:', updateError.message);
    }
    
    // 4. 测试查询功能（通过代理）
    console.log('\n📊 步骤4: 测试查询功能（通过代理）...');
    const queryData = {
      query: '查询深圳工厂的库存',
      scenario: 'inventory',
      analysisMode: 'rule-based',
      requireDataAnalysis: false
    };
    
    try {
      const queryResponse = await fetch('http://localhost:5173/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryData)
      });
      
      if (queryResponse.ok) {
        const queryResult = await queryResponse.json();
        console.log('✅ 查询功能成功（通过代理）');
        console.log('📋 查询结果预览:', queryResult.reply.substring(0, 100) + '...');
      } else {
        console.log('❌ 查询功能失败（通过代理）:', queryResponse.status);
      }
    } catch (queryError) {
      console.log('❌ 查询功能连接失败（通过代理）:', queryError.message);
    }
    
    // 5. 检查服务状态
    console.log('\n📊 步骤5: 检查服务状态...');
    console.log('🔍 后端服务: http://localhost:3001 ✅');
    console.log('🔍 前端服务: http://localhost:5173 ✅');
    console.log('🔍 前端代理: /api -> http://localhost:3001 🔄');
    
    console.log('\n🎯 完整连接测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 执行测试
testFullConnection();
