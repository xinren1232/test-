/**
 * 测试数据同步脚本
 */

const testData = {
  inventory: [
    {
      id: "test-1",
      materialName: "电池盖",
      materialCode: "CS-B-聚6883",
      batchNo: "B001",
      supplier: "聚龙",
      quantity: 100,
      status: "正常",
      warehouse: "重庆库存",
      factory: "重庆工厂",
      projectId: "I6789",
      baselineId: "X6827",
      inboundTime: "2025-07-15T10:00:00.000Z",
      lastUpdateTime: "2025-07-15T10:00:00.000Z"
    }
  ],
  inspection: [
    {
      id: "test-lab-1",
      testId: "T001",
      testDate: "2025-07-15T10:00:00.000Z",
      projectId: "I6789",
      baselineId: "X6827",
      materialCode: "CS-B-聚6883",
      quantity: 10,
      materialName: "电池盖",
      supplier: "聚龙",
      testResult: "PASS",
      defectDesc: "",
      notes: "测试数据"
    }
  ],
  production: [
    {
      id: "test-prod-1",
      factory: "重庆工厂",
      baseline: "X6827",
      project: "I6789",
      materialCode: "CS-B-聚6883",
      materialName: "电池盖",
      supplier: "聚龙",
      batchNo: "B001",
      defectRate: 2.5,
      weeklyAnomaly: "无",
      inspectionDate: "2025-07-15T10:00:00.000Z",
      notes: "测试数据"
    }
  ]
};

async function syncTestData() {
  try {
    const response = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('同步结果:', result);
    
    if (result.success) {
      console.log('✅ 数据同步成功');
      
      // 测试规则
      console.log('\n🔍 测试聚龙供应商库存查询规则...');
      const testResponse = await fetch('http://localhost:3001/api/rules/test/411', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: "查询聚龙供应商的库存" })
      });
      
      const testResult = await testResponse.json();
      console.log('规则测试结果:', testResult);
      
      // 测试智能查询
      console.log('\n🤖 测试智能查询...');
      const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: "查询聚龙供应商的库存" })
      });
      
      const queryResult = await queryResponse.json();
      console.log('智能查询结果:', queryResult);
      
    } else {
      console.log('❌ 数据同步失败:', result.error);
    }
    
  } catch (error) {
    console.error('❌ 执行失败:', error);
  }
}

// 运行测试
syncTestData();
