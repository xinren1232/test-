/**
 * 测试前端数据推送功能
 * 模拟前端API调用来验证数据推送是否正常工作
 */
import fetch from 'node-fetch';

// 模拟前端推送的数据
const testData = {
  inventory: [
    {
      id: "INV_001",
      materialName: "OLED显示屏",
      materialCode: "DS-O001",
      materialType: "光学类",
      batchNo: "BOE2024001",
      supplier: "BOE",
      quantity: 500,
      status: "正常",
      warehouse: "中央库存",
      factory: "深圳工厂",
      inboundTime: "2024-01-15",
      expiryDate: "2024-07-15",
      notes: "高分辨率OLED屏"
    },
    {
      id: "INV_002", 
      materialName: "电池盖",
      materialCode: "CS-B001",
      materialType: "结构件类",
      batchNo: "JL2024002",
      supplier: "聚龙",
      quantity: 50,
      status: "风险",
      warehouse: "深圳库存",
      factory: "深圳工厂",
      inboundTime: "2024-01-20",
      expiryDate: "2025-01-20",
      notes: "表面有轻微划痕"
    }
  ],
  inspection: [
    {
      id: "TEST_001",
      materialName: "OLED显示屏",
      batchNo: "BOE2024001",
      supplier: "BOE",
      testDate: "2024-01-16",
      testResult: "PASS",
      defectDescription: null,
      projectId: "X6827"
    },
    {
      id: "TEST_002",
      materialName: "电池盖", 
      batchNo: "JL2024002",
      supplier: "聚龙",
      testDate: "2024-01-21",
      testResult: "FAIL",
      defectDescription: "表面划伤超标",
      projectId: "S665LN"
    }
  ],
  production: [
    {
      id: "PROD_001",
      materialName: "OLED显示屏",
      materialCode: "DS-O001",
      batchNo: "BOE2024001",
      supplier: "BOE",
      factory: "深圳工厂",
      line: "产线01",
      onlineTime: "2024-01-17",
      defectRate: 2.1,
      defect: "轻微mura现象",
      projectId: "X6827"
    }
  ]
};

async function testFrontendDataPush() {
  console.log('🧪 测试前端数据推送API...\n');
  
  const baseUrl = 'http://localhost:3002';
  
  try {
    // 1. 测试数据推送API
    console.log('📤 测试数据推送API...');
    const pushResponse = await fetch(`${baseUrl}/api/assistant/update-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (!pushResponse.ok) {
      throw new Error(`推送API返回错误: ${pushResponse.status} ${pushResponse.statusText}`);
    }
    
    const pushResult = await pushResponse.json();
    console.log('✅ 数据推送成功:', pushResult);
    
    // 2. 测试问答API
    console.log('\n🔍 测试问答API...');
    const testQueries = [
      '查询库存情况',
      '目前有哪些风险库存？',
      '查询BOE供应商的物料',
      '有哪些测试不合格的记录？'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🎯 测试查询: "${query}"`);
      
      try {
        const queryResponse = await fetch(`${baseUrl}/api/assistant/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query })
        });
        
        if (!queryResponse.ok) {
          throw new Error(`查询API返回错误: ${queryResponse.status} ${queryResponse.statusText}`);
        }
        
        const queryResult = await queryResponse.json();
        
        // 检查结果质量
        const reply = queryResult.reply || '';
        if (reply.includes('暂无数据')) {
          console.log('❌ 查询失败 - 数据未推送成功');
        } else if (reply.includes('找到') || reply.includes('OLED显示屏') || reply.includes('电池盖')) {
          console.log('✅ 查询成功 - 包含推送的数据');
        } else {
          console.log('⚠️ 查询结果异常');
        }
        
        console.log('📋 结果摘要:', reply.substring(0, 100) + '...');
        
      } catch (queryError) {
        console.log('❌ 查询失败:', queryError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    // 检查后端是否运行
    try {
      const healthResponse = await fetch(`${baseUrl}/health`);
      if (healthResponse.ok) {
        console.log('✅ 后端服务正在运行');
      } else {
        console.log('⚠️ 后端服务状态异常');
      }
    } catch (healthError) {
      console.log('❌ 无法连接到后端服务，请确保后端正在运行在端口3002');
    }
  }
  
  console.log('\n🎯 前端数据推送测试完成！');
}

// 运行测试
testFrontendDataPush().catch(console.error);
