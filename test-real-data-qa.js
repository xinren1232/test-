/**
 * 测试真实数据问答功能
 * 验证用户的真实数据是否被正确使用
 */

import fetch from 'node-fetch';

async function testRealDataQA() {
  console.log('🎯 开始测试真实数据问答功能...\n');
  
  // 1. 首先推送用户的真实数据格式
  console.log('📊 步骤1: 推送用户真实数据格式...');
  
  const realUserData = {
    inventory: [
      {
        batchNo: '105281',
        materialName: '电容',
        materialCode: 'CS-广1083',
        supplier: '紫光集团',
        quantity: 500,
        factory: '重庆工厂',
        status: '正常',
        riskLevel: '低风险',
        inspectionDate: '2024-12-15'
      },
      {
        batchNo: '411013',
        materialName: '电芯',
        materialCode: 'CS-B-第2236',
        supplier: '广正科技',
        quantity: 200,
        factory: '深圳工厂',
        status: '风险',
        riskLevel: '高风险',
        inspectionDate: '2024-12-14'
      },
      {
        batchNo: '844175',
        materialName: '电阻器',
        materialCode: 'CS-H类0360',
        supplier: '黑龙电子',
        quantity: 1000,
        factory: '南昌工厂',
        status: '正常',
        riskLevel: '低风险',
        inspectionDate: '2024-12-13'
      }
    ],
    lab: [
      {
        batchNo: '105281',
        materialCode: 'CS-广1083',
        materialName: '电容',
        supplier: '紫光集团',
        testResult: 'PASS',
        testTime: '2024-12-15T10:30:00Z',
        inspector: '张工程师',
        testType: '电气性能测试'
      },
      {
        batchNo: '411013',
        materialCode: 'CS-B-第2236',
        materialName: '电芯',
        supplier: '广正科技',
        testResult: 'FAIL',
        testTime: '2024-12-14T14:20:00Z',
        inspector: '李工程师',
        testType: '容量测试'
      }
    ],
    production: [
      {
        batchNo: '105281',
        materialCode: 'CS-广1083',
        materialName: '电容',
        supplier: '紫光集团',
        onlineTime: '2024-12-15T16:00:00Z',
        factory: '重庆工厂',
        projectName: 'KI4K',
        defectRate: 0.2
      }
    ]
  };
  
  try {
    const syncResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(realUserData)
    });
    
    if (syncResponse.ok) {
      const syncResult = await syncResponse.json();
      console.log('✅ 真实数据推送成功:', syncResult.message);
      console.log('📊 同步统计:', syncResult.synced);
    } else {
      console.log('❌ 真实数据推送失败:', syncResponse.status);
      return;
    }
  } catch (error) {
    console.log('❌ 真实数据推送出错:', error.message);
    return;
  }
  
  // 2. 测试基于真实数据的查询
  console.log('\n📊 步骤2: 测试基于真实数据的查询...');
  
  const realDataQueries = [
    {
      name: '真实供应商查询',
      query: '查询紫光集团的物料',
      expectKeywords: ['紫光集团', '电容', 'CS-广1083']
    },
    {
      name: '真实批次查询',
      query: '查询批次105281的情况',
      expectKeywords: ['105281', '电容', '紫光集团']
    },
    {
      name: '真实工厂查询',
      query: '重庆工厂有什么物料？',
      expectKeywords: ['重庆工厂', '电容']
    },
    {
      name: '真实风险物料查询',
      query: '有哪些高风险物料？',
      expectKeywords: ['风险', '电芯', '广正科技']
    },
    {
      name: '真实物料编码查询',
      query: '查询物料CS-广1083',
      expectKeywords: ['CS-广1083', '电容', '紫光集团']
    },
    {
      name: '真实测试结果查询',
      query: '查询测试失败的记录',
      expectKeywords: ['FAIL', '电芯', '容量测试']
    }
  ];
  
  for (const testCase of realDataQueries) {
    console.log(`\n🎯 测试${testCase.name}: "${testCase.query}"`);
    
    try {
      // 测试后端API
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: testCase.query })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ 查询成功');
        console.log('📋 回复内容:', result.reply);
        
        // 检查是否包含期望的真实数据关键词
        const hasRealData = testCase.expectKeywords.some(keyword => 
          result.reply.includes(keyword)
        );
        console.log(`🔍 包含真实数据: ${hasRealData ? '✅' : '❌'}`);
        
        // 检查是否包含测试数据（不应该包含）
        const hasTestData = result.reply.includes('测试物料') || 
                           result.reply.includes('测试供应商') ||
                           result.reply.includes('MAT-');
        console.log(`🚫 包含测试数据: ${hasTestData ? '❌ 有问题' : '✅ 正常'}`);
        
      } else {
        console.log('❌ 查询失败:', response.status);
      }
      
    } catch (error) {
      console.log('❌ 查询出错:', error.message);
    }
  }
  
  console.log('\n🎉 真实数据问答测试完成！');
  console.log('💡 如果看到"包含真实数据: ✅"且"包含测试数据: ✅ 正常"，说明修复成功');
}

// 运行测试
testRealDataQA().catch(console.error);
