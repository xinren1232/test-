/**
 * 调试前端响应格式问题
 */
import fetch from 'node-fetch';

async function debugFrontendResponse() {
  console.log('🔍 调试前端响应格式问题...\n');
  
  try {
    // 1. 推送测试数据
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
          factory: '深圳工厂',
          notes: '正常库存'
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
          factory: '深圳工厂',
          notes: '需要重点关注'
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
    
    const query = '查询聚龙供应商的物料';
    console.log(`🎯 测试查询: "${query}"`);
    
    const backendResponse = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });
    
    if (!backendResponse.ok) {
      throw new Error(`后端查询失败: ${backendResponse.status}`);
    }
    
    const backendResult = await backendResponse.json();
    console.log('📋 后端返回的原始数据:');
    console.log('格式:', typeof backendResult.reply);
    console.log('长度:', backendResult.reply ? backendResult.reply.length : 0);
    console.log('内容预览:');
    console.log(backendResult.reply);
    
    // 3. 测试前端代理API调用
    console.log('\n📊 步骤3: 测试前端代理API调用...');
    
    try {
      const proxyResponse = await fetch('http://localhost:5173/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });
      
      if (proxyResponse.ok) {
        const proxyResult = await proxyResponse.json();
        console.log('📋 前端代理返回的数据:');
        console.log('格式:', typeof proxyResult.reply);
        console.log('长度:', proxyResult.reply ? proxyResult.reply.length : 0);
        console.log('内容预览:');
        console.log(proxyResult.reply);
        
        // 比较两个结果
        if (backendResult.reply === proxyResult.reply) {
          console.log('✅ 前端代理和后端返回相同结果');
        } else {
          console.log('❌ 前端代理和后端返回不同结果');
          console.log('差异分析:');
          console.log('后端长度:', backendResult.reply.length);
          console.log('代理长度:', proxyResult.reply.length);
        }
      } else {
        console.log('❌ 前端代理调用失败:', proxyResponse.status);
      }
    } catch (proxyError) {
      console.log('❌ 前端代理调用异常:', proxyError.message);
    }
    
    // 4. 检查前端组件是否正确处理响应
    console.log('\n📊 步骤4: 前端组件检查建议...');
    
    console.log('🔍 可能的问题原因:');
    console.log('1. 前端组件没有正确显示换行符');
    console.log('2. CSS样式影响了文本格式');
    console.log('3. 前端仍在使用模拟API');
    console.log('4. 浏览器缓存问题');
    
    console.log('\n🔧 建议的解决方案:');
    console.log('1. 检查前端组件的文本渲染方式');
    console.log('2. 确保使用 white-space: pre-wrap 样式');
    console.log('3. 清除浏览器缓存并刷新');
    console.log('4. 检查前端是否正确调用后端API');
    
    console.log('\n🎉 调试完成！');
    
  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  }
}

debugFrontendResponse().catch(console.error);
