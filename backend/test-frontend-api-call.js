/**
 * 测试前端API调用问题
 */
import fetch from 'node-fetch';

async function testFrontendAPICall() {
  console.log('🔍 测试前端API调用问题...\n');
  
  try {
    // 1. 先推送测试数据
    console.log('📊 步骤1: 推送测试数据...');
    
    const testData = {
      inventory: [
        {
          id: 'INV_001',
          materialName: '电池盖',
          materialCode: 'CS-S-B001',
          materialType: '结构件类',
          batchNo: 'JL2024001',
          supplier: '聚龙',
          quantity: 1200,
          status: '正常',
          warehouse: '深圳库存',
          factory: '深圳工厂'
        },
        {
          id: 'INV_002',
          materialName: 'OLED显示屏',
          materialCode: 'CS-O-O001',
          materialType: '光学类',
          batchNo: 'BOE2024001',
          supplier: 'BOE',
          quantity: 800,
          status: '风险',
          warehouse: '深圳库存',
          factory: '深圳工厂'
        }
      ],
      inspection: [
        {
          id: 'TEST_001',
          materialName: 'OLED显示屏',
          batchNo: 'BOE2024001',
          supplier: 'BOE',
          testDate: '2025-06-11',
          testResult: 'FAIL',
          defectDescription: '显示异常'
        }
      ],
      production: [
        {
          id: 'PROD_001',
          materialName: '电池盖',
          batchNo: 'JL2024001',
          supplier: '聚龙',
          factory: '深圳工厂',
          defectRate: 1.2
        }
      ]
    };
    
    // 推送到后端
    const pushResponse = await fetch('http://localhost:3002/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (!pushResponse.ok) {
      throw new Error(`数据推送失败: ${pushResponse.status}`);
    }
    
    const pushResult = await pushResponse.json();
    console.log('✅ 数据推送成功:', pushResult.message);
    
    // 2. 测试直接后端API调用
    console.log('\n📊 步骤2: 测试直接后端API调用...');
    
    const testQueries = [
      '查询聚龙供应商的物料',
      '查询深圳工厂的库存情况',
      '目前有哪些风险库存？',
      '查询电池盖',
      '查询OLED显示屏',
      '有哪些测试不合格的记录？'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🎯 测试查询: "${query}"`);
      
      // 直接调用后端API
      const backendResponse = await fetch('http://localhost:3002/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });
      
      if (backendResponse.ok) {
        const backendResult = await backendResponse.json();
        console.log('✅ 后端API成功');
        console.log('📋 返回格式:', Object.keys(backendResult));
        console.log('📋 reply字段:', backendResult.reply ? '存在' : '不存在');
        if (backendResult.reply) {
          console.log('📋 内容长度:', backendResult.reply.length);
          console.log('📋 内容预览:', backendResult.reply.substring(0, 50) + '...');
        }
      } else {
        console.log('❌ 后端API失败:', backendResponse.status);
      }
    }
    
    // 3. 测试前端代理API调用
    console.log('\n📊 步骤3: 测试前端代理API调用...');
    
    for (const query of testQueries.slice(0, 3)) { // 只测试前3个
      console.log(`\n🎯 测试前端代理查询: "${query}"`);
      
      try {
        // 通过前端代理调用
        const proxyResponse = await fetch('http://localhost:5173/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query })
        });
        
        if (proxyResponse.ok) {
          const proxyResult = await proxyResponse.json();
          console.log('✅ 前端代理成功');
          console.log('📋 返回格式:', Object.keys(proxyResult));
          console.log('📋 reply字段:', proxyResult.reply ? '存在' : '不存在');
          if (proxyResult.reply) {
            console.log('📋 内容长度:', proxyResult.reply.length);
            console.log('📋 内容预览:', proxyResult.reply.substring(0, 50) + '...');
          } else {
            console.log('📋 完整响应:', JSON.stringify(proxyResult, null, 2));
          }
        } else {
          console.log('❌ 前端代理失败:', proxyResponse.status);
          const errorText = await proxyResponse.text();
          console.log('📋 错误详情:', errorText);
        }
      } catch (error) {
        console.log('❌ 前端代理调用异常:', error.message);
      }
    }
    
    // 4. 检查前端环境变量
    console.log('\n📊 步骤4: 检查配置...');
    console.log('请确认以下配置:');
    console.log('1. .env.development 中 VITE_USE_REAL_API=true');
    console.log('2. mockApiMiddleware.js 中 assistant 相关请求已设置 passThrough');
    console.log('3. 前端服务运行在 http://localhost:5173');
    console.log('4. 后端服务运行在 http://localhost:3002');
    
    // 5. 提供解决方案
    console.log('\n🔧 步骤5: 问题解决建议...');
    console.log('如果前端仍然显示无内容，可能的原因:');
    console.log('1. 前端API客户端的响应拦截器问题');
    console.log('2. 模拟API中间件拦截了请求');
    console.log('3. 前端组件中的数据绑定问题');
    console.log('4. 前端环境变量配置问题');
    
    console.log('\n建议的调试步骤:');
    console.log('1. 在浏览器开发者工具中检查网络请求');
    console.log('2. 查看控制台是否有JavaScript错误');
    console.log('3. 确认API响应格式是否正确');
    console.log('4. 检查前端组件中的数据处理逻辑');
    
    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testFrontendAPICall().catch(console.error);
