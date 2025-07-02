/**
 * 调试前端数据推送问题
 */
import fetch from 'node-fetch';

async function debugFrontendIssue() {
  console.log('🔍 调试前端数据推送问题...\n');
  
  try {
    // 1. 测试后端健康状态
    console.log('📊 步骤1: 检查后端服务状态...');
    
    const backendHealth = await fetch('http://localhost:3002/health');
    if (backendHealth.ok) {
      console.log('✅ 后端服务正常运行');
    } else {
      console.log('❌ 后端服务异常');
      return;
    }
    
    // 2. 测试前端代理
    console.log('\n📊 步骤2: 检查前端代理状态...');
    
    const frontendHealth = await fetch('http://localhost:5173/api/health');
    if (frontendHealth.ok) {
      console.log('✅ 前端代理正常工作');
    } else {
      console.log('❌ 前端代理异常');
      return;
    }
    
    // 3. 测试直接后端API
    console.log('\n📊 步骤3: 测试直接后端API...');
    
    const testData = {
      inventory: [
        {
          id: 'INV_TEST',
          materialName: '测试物料',
          supplier: '测试供应商',
          quantity: 100,
          status: '正常',
          factory: '测试工厂'
        }
      ],
      inspection: [],
      production: []
    };
    
    const backendResponse = await fetch('http://localhost:3002/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (backendResponse.ok) {
      const result = await backendResponse.json();
      console.log('✅ 直接后端API推送成功:', result.message);
    } else {
      console.log('❌ 直接后端API推送失败:', backendResponse.status);
      const errorText = await backendResponse.text();
      console.log('错误详情:', errorText);
      return;
    }
    
    // 4. 测试前端代理API
    console.log('\n📊 步骤4: 测试前端代理API...');
    
    const frontendResponse = await fetch('http://localhost:5173/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (frontendResponse.ok) {
      const result = await frontendResponse.json();
      console.log('✅ 前端代理API推送成功:', result.message);
    } else {
      console.log('❌ 前端代理API推送失败:', frontendResponse.status);
      const errorText = await frontendResponse.text();
      console.log('错误详情:', errorText);
      
      // 检查是否是404错误
      if (frontendResponse.status === 404) {
        console.log('\n🔍 404错误分析:');
        console.log('- 可能是前端代理配置问题');
        console.log('- 可能是模拟API中间件拦截问题');
        console.log('- 可能是路由配置问题');
      }
      return;
    }
    
    // 5. 测试查询功能
    console.log('\n📊 步骤5: 测试查询功能...');
    
    const queryResponse = await fetch('http://localhost:5173/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '查询测试物料' })
    });
    
    if (queryResponse.ok) {
      const queryResult = await queryResponse.json();
      console.log('✅ 查询功能正常');
      console.log('📋 查询结果:', queryResult.reply.substring(0, 100) + '...');
      
      // 检查是否包含推送的数据
      if (queryResult.reply.includes('测试物料') || queryResult.reply.includes('测试供应商')) {
        console.log('✅ 数据同步正常 - 查询结果包含推送的数据');
      } else {
        console.log('⚠️ 数据同步可能有问题 - 查询结果不包含推送的数据');
      }
    } else {
      console.log('❌ 查询功能异常:', queryResponse.status);
    }
    
    // 6. 检查前端环境变量
    console.log('\n📊 步骤6: 检查前端配置...');
    console.log('请检查以下配置:');
    console.log('- .env.development 中的 VITE_USE_REAL_API=true');
    console.log('- vite.config.cjs 中的代理配置');
    console.log('- mockApiMiddleware.js 中的 passThrough 配置');
    
    console.log('\n🎉 调试完成！');
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error.message);
  }
}

debugFrontendIssue().catch(console.error);
