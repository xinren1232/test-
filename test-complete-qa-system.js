/**
 * 完整的问答系统测试
 * 测试数据同步和问答查询的完整流程
 */

import fetch from 'node-fetch';

async function testCompleteQASystem() {
  console.log('🎯 开始完整的问答系统测试...\n');
  
  // 1. 推送完整的测试数据
  console.log('📊 步骤1: 推送完整的测试数据...');
  
  const completeTestData = {
    inventory: [
      {
        batchNo: 'BATCH001',
        materialName: '电容器',
        materialCode: 'CAP001',
        supplier: '泰科电子',
        quantity: 1000,
        factory: '深圳工厂',
        status: '正常',
        riskLevel: '低风险'
      },
      {
        batchNo: 'BATCH002', 
        materialName: 'OLED显示屏',
        materialCode: 'OLED001',
        supplier: '三星电子',
        quantity: 500,
        factory: '上海工厂',
        status: '待检',
        riskLevel: '高风险'
      }
    ],
    lab: [
      {
        batchNo: 'BATCH001',
        materialCode: 'CAP001',
        materialName: '电容器',
        supplier: '泰科电子',
        testResult: 'PASS',
        testTime: new Date().toISOString(),
        inspector: '张工程师',
        inspection_type: '电气性能测试'
      },
      {
        batchNo: 'BATCH002',
        materialCode: 'OLED001', 
        materialName: 'OLED显示屏',
        supplier: '三星电子',
        testResult: 'FAIL',
        testTime: new Date().toISOString(),
        inspector: '李工程师',
        inspection_type: '显示质量测试'
      }
    ],
    production: [
      {
        batchNo: 'BATCH001',
        materialCode: 'CAP001',
        materialName: '电容器',
        supplier: '泰科电子',
        onlineTime: new Date().toISOString(),
        factory: '深圳工厂',
        projectName: 'PROJECT_A',
        defectRate: 0.5
      }
    ]
  };
  
  try {
    const syncResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(completeTestData)
    });
    
    if (syncResponse.ok) {
      const syncResult = await syncResponse.json();
      console.log('✅ 数据推送成功:', syncResult.message);
      console.log('📊 同步统计:', syncResult.synced);
    } else {
      console.log('❌ 数据推送失败:', syncResponse.status);
      return;
    }
  } catch (error) {
    console.log('❌ 数据推送出错:', error.message);
    return;
  }
  
  // 2. 测试各种类型的查询
  console.log('\n📊 步骤2: 测试各种类型的查询...');
  
  const testQueries = [
    {
      name: '库存查询',
      query: '查询所有库存状态',
      expectKeywords: ['电容器', 'OLED', '库存']
    },
    {
      name: '供应商查询',
      query: '查询泰科电子的物料',
      expectKeywords: ['泰科电子', '电容器']
    },
    {
      name: '测试结果查询',
      query: '查询测试记录',
      expectKeywords: ['测试', 'PASS', 'FAIL']
    },
    {
      name: '风险物料查询',
      query: '有哪些高风险物料？',
      expectKeywords: ['OLED', '高风险']
    },
    {
      name: '工厂查询',
      query: '深圳工厂有什么物料？',
      expectKeywords: ['深圳', '电容器']
    }
  ];
  
  for (const testCase of testQueries) {
    console.log(`\n🎯 测试${testCase.name}: "${testCase.query}"`);
    
    try {
      // 测试直接后端调用
      const backendResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: testCase.query })
      });
      
      if (backendResponse.ok) {
        const backendResult = await backendResponse.json();
        console.log('✅ 后端查询成功');
        console.log('📋 回复预览:', backendResult.reply.substring(0, 150) + '...');
        
        // 检查是否包含期望的关键词
        const hasExpectedContent = testCase.expectKeywords.some(keyword => 
          backendResult.reply.includes(keyword)
        );
        console.log(`🔍 包含期望内容: ${hasExpectedContent ? '✅' : '❌'}`);
        
      } else {
        console.log('❌ 后端查询失败:', backendResponse.status);
      }
      
      // 测试前端代理调用
      const proxyResponse = await fetch('http://localhost:5173/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: testCase.query })
      });
      
      if (proxyResponse.ok) {
        const proxyResult = await proxyResponse.json();
        console.log('✅ 前端代理成功');
        
        // 检查前端和后端结果是否一致
        const isConsistent = proxyResult.reply === backendResult.reply;
        console.log(`🔄 前后端一致性: ${isConsistent ? '✅' : '❌'}`);
        
      } else {
        console.log('❌ 前端代理失败:', proxyResponse.status);
      }
      
    } catch (error) {
      console.log('❌ 查询出错:', error.message);
    }
  }
  
  console.log('\n🎉 完整问答系统测试完成！');
  console.log('💡 现在可以在前端界面中正常使用智能问答功能了');
}

// 运行测试
testCompleteQASystem().catch(console.error);
