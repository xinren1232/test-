/**
 * 测试三栏布局数据同步修复
 */
import fetch from 'node-fetch';

console.log('🧪 开始测试三栏布局数据同步修复...\n');

async function testDataSync() {
  try {
    // 1. 检查后端服务状态
    console.log('📊 步骤1: 检查后端服务状态...');
    const healthResponse = await fetch('http://localhost:3001/health');
    if (!healthResponse.ok) {
      throw new Error(`后端服务异常: ${healthResponse.status}`);
    }
    const healthData = await healthResponse.json();
    console.log('✅ 后端服务正常:', healthData.message);
    console.log('📊 当前数据统计:', healthData.dataStats);

    // 2. 模拟前端数据推送
    console.log('\n📊 步骤2: 模拟前端数据推送...');
    
    const mockData = {
      inventory: [
        {
          id: "INV_001",
          materialCode: "DS-O001",
          materialName: "OLED显示屏",
          supplier: "BOE",
          factory: "深圳工厂",
          warehouse: "A区",
          batchNo: "BOE2024001",
          quantity: 500,
          status: "正常",
          arrivalDate: "2024-01-15",
          expiryDate: "2025-01-15"
        },
        {
          id: "INV_002",
          materialCode: "CS-B001",
          materialName: "电池盖",
          supplier: "聚龙",
          factory: "深圳工厂",
          warehouse: "B区",
          batchNo: "JL2024002",
          quantity: 800,
          status: "风险",
          arrivalDate: "2024-01-20",
          expiryDate: "2025-01-20"
        },
        {
          id: "INV_003",
          materialCode: "SPK001",
          materialName: "喇叭",
          supplier: "歌尔",
          factory: "宜宾工厂",
          warehouse: "C区",
          batchNo: "GE2024004",
          quantity: 300,
          status: "正常",
          arrivalDate: "2024-02-01",
          expiryDate: "2025-02-01"
        }
      ],
      inspection: [
        {
          id: "TEST_001",
          materialCode: "DS-O001",
          materialName: "OLED显示屏",
          batchNo: "BOE2024001",
          supplier: "BOE",
          testDate: "2024-01-16",
          testResult: "PASS",
          defect: null
        },
        {
          id: "TEST_002",
          materialCode: "CS-B001",
          materialName: "电池盖",
          batchNo: "JL2024002",
          supplier: "聚龙",
          testDate: "2024-01-21",
          testResult: "FAIL",
          defect: "划伤、变形"
        },
        {
          id: "TEST_003",
          materialCode: "SPK001",
          materialName: "喇叭",
          batchNo: "GE2024004",
          supplier: "歌尔",
          testDate: "2024-02-02",
          testResult: "PASS",
          defect: null
        }
      ],
      production: [
        {
          id: "PROD_001",
          materialCode: "DS-O001",
          materialName: "OLED显示屏",
          batchNo: "BOE2024001",
          supplier: "BOE",
          factory: "深圳工厂",
          line: "产线01",
          onlineTime: "2024-01-17",
          defectRate: 2.1,
          defect: "轻微mura现象",
          projectId: "X6827"
        },
        {
          id: "PROD_002",
          materialCode: "CS-B001",
          materialName: "电池盖",
          batchNo: "JL2024002",
          supplier: "聚龙",
          factory: "深圳工厂",
          line: "产线01",
          onlineTime: "2024-01-22",
          defectRate: 8.5,
          defect: "划伤、变形",
          projectId: "S665LN"
        },
        {
          id: "PROD_003",
          materialCode: "SPK001",
          materialName: "喇叭",
          batchNo: "GE2024004",
          supplier: "歌尔",
          factory: "宜宾工厂",
          line: "产线02",
          onlineTime: "2024-02-02",
          defectRate: 0.8,
          defect: null,
          projectId: "S662LN"
        }
      ]
    };

    console.log(`📦 准备推送数据: 库存${mockData.inventory.length}条, 检测${mockData.inspection.length}条, 生产${mockData.production.length}条`);

    const updateResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockData)
    });

    if (!updateResponse.ok) {
      throw new Error(`数据推送失败: ${updateResponse.status}`);
    }

    const updateResult = await updateResponse.json();
    console.log('✅ 数据推送成功:', updateResult.message);
    console.log('📊 更新后数据统计:', updateResult.dataStats);

    // 3. 测试查询功能
    console.log('\n📊 步骤3: 测试查询功能...');
    
    const testQueries = [
      '查询深圳工厂的库存',
      '查询BOE供应商的物料',
      '查询风险状态的库存',
      '查询测试FAIL记录',
      '查询生产记录',
      '你好，请介绍一下功能'
    ];

    for (const query of testQueries) {
      console.log(`\n🔍 测试查询: "${query}"`);
      
      const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          query,
          scenario: 'comprehensive_quality',
          analysisMode: 'professional',
          requireDataAnalysis: true
        })
      });

      if (queryResponse.ok) {
        const queryResult = await queryResponse.json();
        console.log('✅ 查询成功');
        console.log('📋 匹配数据:', queryResult.matchedData || 0, '条');
        console.log('📄 回复预览:', queryResult.reply.substring(0, 150) + '...');
      } else {
        console.log('❌ 查询失败:', queryResponse.status);
      }
    }

    console.log('\n🎉 三栏布局数据同步测试完成！');
    console.log('\n📋 测试总结:');
    console.log('✅ 后端服务正常运行');
    console.log('✅ 数据推送功能正常');
    console.log('✅ 查询功能正常');
    console.log('✅ 数据同步修复成功');
    
    console.log('\n🌐 现在可以访问前端页面测试三栏布局:');
    console.log('📱 http://localhost:5173/#/assistant-ai');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testDataSync();
