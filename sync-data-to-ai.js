/**
 * 手动同步前端数据到AI助手后端
 */
import fetch from 'node-fetch';

async function syncDataToAI() {
  console.log('🔄 开始同步前端数据到AI助手后端...\n');
  
  try {
    // 1. 检查后端健康状态
    console.log('📊 步骤1: 检查后端健康状态...');
    const healthResponse = await fetch('http://localhost:3001/health');
    if (!healthResponse.ok) {
      throw new Error(`后端服务异常: ${healthResponse.status}`);
    }
    console.log('✅ 后端服务正常');

    // 2. 生成模拟数据
    console.log('\n📊 步骤2: 生成模拟数据...');
    const mockData = {
      inventory: [
        {
          id: "INV_001",
          factory: "深圳工厂",
          warehouse: "A区仓库",
          materialCode: "CS-S-M4529",
          materialName: "OLED显示屏",
          supplier: "聚龙",
          batchCode: "T14127",
          quantity: 850,
          status: "正常",
          inspectionDate: "2025-09-14",
          shelfLife: "2026-09-14",
          notes: "质量稳定"
        },
        {
          id: "INV_002",
          factory: "宜宾工厂",
          warehouse: "B区仓库",
          materialCode: "CS-S-M4125",
          materialName: "中框",
          supplier: "聚龙",
          batchCode: "S49216",
          quantity: 1200,
          status: "风险",
          inspectionDate: "2025-05-18",
          shelfLife: "2026-05-18",
          notes: "需要重点监控"
        },
        {
          id: "INV_003",
          factory: "深圳工厂",
          warehouse: "C区仓库",
          materialCode: "CS-S-M3891",
          materialName: "电池盖",
          supplier: "BOE",
          batchCode: "B78432",
          quantity: 500,
          status: "冻结",
          inspectionDate: "2025-03-22",
          shelfLife: "2026-03-22",
          notes: "质量问题待处理"
        }
      ],
      inspection: [
        {
          id: "TEST_001",
          testDate: "2025-09-14",
          baselineId: "BL001",
          projectId: "X6827",
          materialCode: "CS-S-M4529",
          materialName: "OLED显示屏",
          supplier: "聚龙",
          batchNo: "T14127",
          testResult: "PASS",
          defectPhenomena: null
        },
        {
          id: "TEST_002",
          testDate: "2025-05-18",
          baselineId: "BL002",
          projectId: "S662LN",
          materialCode: "CS-S-M4125",
          materialName: "中框",
          supplier: "聚龙",
          batchNo: "S49216",
          testResult: "FAIL",
          defectPhenomena: "尺寸偏差"
        },
        {
          id: "TEST_003",
          testDate: "2025-03-22",
          baselineId: "BL003",
          projectId: "P9841",
          materialCode: "CS-S-M3891",
          materialName: "电池盖",
          supplier: "BOE",
          batchNo: "B78432",
          testResult: "FAIL",
          defectPhenomena: "表面划痕"
        }
      ],
      production: [
        {
          id: "PROD_001",
          materialName: "OLED显示屏",
          materialCode: "CS-S-M4529",
          batchNo: "T14127",
          supplier: "聚龙",
          factory: "深圳工厂",
          line: "产线01",
          onlineTime: "2025-09-14",
          defectRate: 2.1,
          defect: "轻微mura现象",
          projectId: "X6827"
        },
        {
          id: "PROD_002",
          materialName: "中框",
          materialCode: "CS-S-M4125",
          batchNo: "S49216", 
          supplier: "聚龙",
          factory: "宜宾工厂",
          line: "产线02",
          onlineTime: "2025-05-18",
          defectRate: 0.8,
          defect: null,
          projectId: "S662LN"
        },
        {
          id: "PROD_003",
          materialName: "电池盖",
          materialCode: "CS-S-M3891",
          batchNo: "B78432",
          supplier: "BOE",
          factory: "深圳工厂",
          line: "产线03",
          onlineTime: "2025-03-22",
          defectRate: 5.2,
          defect: "表面质量问题",
          projectId: "P9841"
        }
      ]
    };

    console.log(`✅ 生成模拟数据: 库存${mockData.inventory.length}条, 检验${mockData.inspection.length}条, 生产${mockData.production.length}条`);

    // 3. 推送数据到后端
    console.log('\n📊 步骤3: 推送数据到AI助手后端...');
    const response = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`推送失败: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ 数据推送成功:', result);

    // 4. 测试查询功能
    console.log('\n📊 步骤4: 测试查询功能...');
    const testQueries = [
      '查询深圳工厂的库存',
      '有哪些风险库存？',
      '查询测试不合格的记录',
      '查询OLED显示屏的情况'
    ];

    for (const query of testQueries) {
      console.log(`\n🎯 测试查询: "${query}"`);
      
      const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (queryResponse.ok) {
        const queryResult = await queryResponse.json();
        console.log('✅ 查询成功');
        console.log('📋 匹配规则:', queryResult.matchedRule || '无');
        console.log('🤖 AI增强:', queryResult.aiEnhanced ? '是' : '否');
        console.log('📄 回复预览:', queryResult.reply.substring(0, 100) + '...');
      } else {
        console.log('❌ 查询失败:', queryResponse.status);
      }
    }

    console.log('\n🎉 数据同步和测试完成！');

  } catch (error) {
    console.error('❌ 同步过程出错:', error.message);
  }
}

// 运行同步
syncDataToAI();
