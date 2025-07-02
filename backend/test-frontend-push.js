/**
 * 测试前端数据推送功能
 */
import fetch from 'node-fetch';

async function testFrontendPush() {
  console.log('🧪 测试前端数据推送功能...\n');
  
  try {
    // 1. 测试通过前端代理推送数据
    console.log('📤 测试通过前端代理推送数据...');
    const testData = {
      inventory: [
        {
          id: 'INV_001',
          materialName: 'OLED显示屏',
          materialCode: 'CS-O-001',
          supplier: 'BOE',
          quantity: 500,
          status: '正常',
          factory: '深圳工厂'
        }
      ],
      inspection: [
        {
          id: 'TEST_001',
          materialName: 'OLED显示屏',
          batchNo: 'BOE001',
          testResult: 'PASS'
        }
      ],
      production: [
        {
          id: 'PROD_001',
          materialName: 'OLED显示屏',
          factory: '深圳工厂',
          defectRate: 1.2
        }
      ]
    };
    
    const frontendResponse = await fetch('http://localhost:5173/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (frontendResponse.ok) {
      const frontendResult = await frontendResponse.json();
      console.log('✅ 前端代理推送成功:', frontendResult.message);
    } else {
      console.log('❌ 前端代理推送失败:', frontendResponse.status, frontendResponse.statusText);
      const errorText = await frontendResponse.text();
      console.log('错误详情:', errorText);
    }
    
    // 2. 测试直接推送到后端
    console.log('\n📤 测试直接推送到后端...');
    const backendResponse = await fetch('http://localhost:3002/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (backendResponse.ok) {
      const backendResult = await backendResponse.json();
      console.log('✅ 直接后端推送成功:', backendResult.message);
    } else {
      console.log('❌ 直接后端推送失败:', backendResponse.status, backendResponse.statusText);
    }
    
    // 3. 测试查询功能
    console.log('\n🔍 测试查询功能...');
    const queryResponse = await fetch('http://localhost:5173/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '查询OLED显示屏的库存' })
    });
    
    if (queryResponse.ok) {
      const queryResult = await queryResponse.json();
      console.log('✅ 查询成功');
      console.log('📋 查询结果:', queryResult.reply.substring(0, 100) + '...');
    } else {
      console.log('❌ 查询失败:', queryResponse.status);
    }
    
    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testFrontendPush().catch(console.error);
