/**
 * 推送测试数据到问答助手
 * 解决前端数据同步问题
 */
import fetch from 'node-fetch';

async function pushTestData() {
  console.log('🚀 推送测试数据到问答助手...\n');
  
  try {
    // 生成标准的测试数据
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
          inboundTime: '2025-06-15',
          expiryDate: '2026-06-15',
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
          inboundTime: '2025-06-10',
          expiryDate: '2026-06-10',
          notes: '需要重点关注'
        },
        {
          id: 'INV_003',
          materialName: '中框',
          materialCode: 'CS-S-Z001',
          materialType: '结构件类',
          batchNo: 'JL2024002',
          supplier: '聚龙',
          quantity: 500,
          status: '冻结',
          warehouse: '重庆库存',
          factory: '重庆工厂',
          inboundTime: '2025-06-05',
          expiryDate: '2026-06-05',
          notes: '待质量确认'
        },
        {
          id: 'INV_004',
          materialName: '摄像头模组',
          materialCode: 'CS-O-C001',
          materialType: '光学类',
          batchNo: 'ST2024001',
          supplier: '盛泰',
          quantity: 600,
          status: '正常',
          warehouse: '宜宾库存',
          factory: '宜宾工厂',
          inboundTime: '2025-06-12',
          expiryDate: '2026-06-12',
          notes: '正常库存'
        },
        {
          id: 'INV_005',
          materialName: '扬声器',
          materialCode: 'CS-A-S001',
          materialType: '声学类',
          batchNo: 'DS2024001',
          supplier: '东声',
          quantity: 900,
          status: '风险',
          warehouse: '南昌库存',
          factory: '南昌工厂',
          inboundTime: '2025-06-08',
          expiryDate: '2026-06-08',
          notes: '需要重点关注'
        }
      ],
      inspection: [
        {
          id: 'TEST_001',
          materialName: '电池盖',
          batchNo: 'JL2024001',
          supplier: '聚龙',
          testDate: '2025-06-16',
          testResult: 'PASS',
          defectDescription: null,
          projectId: 'PRJ001'
        },
        {
          id: 'TEST_002',
          materialName: 'OLED显示屏',
          batchNo: 'BOE2024001',
          supplier: 'BOE',
          testDate: '2025-06-11',
          testResult: 'FAIL',
          defectDescription: '显示异常',
          projectId: 'PRJ002'
        },
        {
          id: 'TEST_003',
          materialName: '中框',
          batchNo: 'JL2024002',
          supplier: '聚龙',
          testDate: '2025-06-06',
          testResult: 'FAIL',
          defectDescription: '尺寸偏差',
          projectId: 'PRJ003'
        },
        {
          id: 'TEST_004',
          materialName: '摄像头模组',
          batchNo: 'ST2024001',
          supplier: '盛泰',
          testDate: '2025-06-13',
          testResult: 'PASS',
          defectDescription: null,
          projectId: 'PRJ004'
        }
      ],
      production: [
        {
          id: 'PROD_001',
          materialName: '电池盖',
          materialCode: 'CS-S-B001',
          batchNo: 'JL2024001',
          supplier: '聚龙',
          factory: '深圳工厂',
          line: '产线01',
          onlineTime: '2025-06-17',
          defectRate: 1.2,
          defect: null,
          projectId: 'PRJ001'
        },
        {
          id: 'PROD_002',
          materialName: 'OLED显示屏',
          materialCode: 'CS-O-O001',
          batchNo: 'BOE2024001',
          supplier: 'BOE',
          factory: '深圳工厂',
          line: '产线02',
          onlineTime: '2025-06-12',
          defectRate: 3.5,
          defect: '显示缺陷',
          projectId: 'PRJ002'
        },
        {
          id: 'PROD_003',
          materialName: '中框',
          materialCode: 'CS-S-Z001',
          batchNo: 'JL2024002',
          supplier: '聚龙',
          factory: '重庆工厂',
          line: '产线03',
          onlineTime: '2025-06-07',
          defectRate: 2.8,
          defect: '轻微缺陷',
          projectId: 'PRJ003'
        }
      ]
    };
    
    console.log(`📊 准备推送数据: 库存${testData.inventory.length}条, 检验${testData.inspection.length}条, 生产${testData.production.length}条`);
    
    // 推送到后端
    const response = await fetch('http://localhost:3002/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      throw new Error(`推送失败: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ 数据推送成功:', result.message);
    
    // 测试查询
    console.log('\n🔍 测试问答功能...');
    
    const testQueries = [
      '查询聚龙供应商的物料',
      '查询深圳工厂的库存情况',
      '目前有哪些风险库存？',
      '查询冻结状态的物料',
      '查询电池盖',
      '查询OLED显示屏',
      '有哪些测试不合格的记录？',
      '工厂数据汇总'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🎯 测试: "${query}"`);
      
      try {
        const queryResponse = await fetch('http://localhost:3002/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query })
        });
        
        if (queryResponse.ok) {
          const queryResult = await queryResponse.json();
          const reply = queryResult.reply || '';
          
          if (reply.includes('找到')) {
            const lines = reply.split('\n');
            const summaryLine = lines.find(line => line.includes('找到') && line.includes('条')) || lines[0];
            console.log('✅ 成功:', summaryLine);
          } else {
            console.log('⚠️ 结果:', reply.substring(0, 50) + '...');
          }
        } else {
          console.log('❌ 查询失败:', queryResponse.status);
        }
      } catch (error) {
        console.log('❌ 错误:', error.message);
      }
    }
    
    console.log('\n🎉 测试数据推送完成！');
    console.log('\n📋 现在你可以在前端问答助手页面测试以下查询:');
    testQueries.forEach((query, index) => {
      console.log(`${index + 1}. "${query}"`);
    });
    
    console.log('\n💡 提示: 如果前端仍显示无内容，请确保:');
    console.log('1. 前端服务已重启');
    console.log('2. 浏览器已刷新');
    console.log('3. 检查浏览器控制台是否有错误');
    
  } catch (error) {
    console.error('❌ 推送失败:', error.message);
  }
}

pushTestData().catch(console.error);
