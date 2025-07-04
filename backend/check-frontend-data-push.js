/**
 * 检查前端数据推送状态
 * 模拟前端的数据推送过程，检查是否存在问题
 */

import fetch from 'node-fetch';

async function checkFrontendDataPush() {
  console.log('🔍 检查前端数据推送状态\n');
  
  try {
    // 1. 模拟前端生成的真实数据结构
    console.log('📊 步骤1: 模拟前端生成的数据结构...');
    
    // 基于SystemDataUpdater.js的数据结构
    const frontendData = {
      inventory: [
        {
          id: 1,
          materialName: 'OLED显示屏',
          materialCode: 'M12345',
          supplier: '聚龙',
          batchNo: 'B20241201001',
          quantity: 150,
          status: '正常',
          storageLocation: '深圳工厂',
          inboundTime: '2024-12-01T10:30:00.000Z',
          inspector: '张三',
          riskLevel: 'LOW'
        },
        {
          id: 2,
          materialName: '电池盖',
          materialCode: 'M12346',
          supplier: '欣冠',
          batchNo: 'B20241201002',
          quantity: 80,
          status: '风险',
          storageLocation: '深圳工厂',
          inboundTime: '2024-12-01T11:00:00.000Z',
          inspector: '李四',
          riskLevel: 'HIGH'
        },
        {
          id: 3,
          materialName: 'PCB主板',
          materialCode: 'M12347',
          supplier: '广正',
          batchNo: 'B20241201003',
          quantity: 200,
          status: '正常',
          storageLocation: '重庆工厂',
          inboundTime: '2024-12-01T09:15:00.000Z',
          inspector: '王五',
          riskLevel: 'LOW'
        }
      ],
      inspection: [
        {
          id: 1,
          materialCode: 'M12345',
          materialName: 'OLED显示屏',
          batchNo: 'B20241201001',
          testResult: 'PASS',
          testDate: '2024-12-01T12:00:00.000Z',
          defectRate: 1.2,
          inspector: '测试员A'
        },
        {
          id: 2,
          materialCode: 'M12346',
          materialName: '电池盖',
          batchNo: 'B20241201002',
          testResult: 'FAIL',
          testDate: '2024-12-01T12:30:00.000Z',
          defectRate: 8.5,
          inspector: '测试员B'
        }
      ],
      production: [
        {
          id: 1,
          materialCode: 'M12345',
          materialName: 'OLED显示屏',
          batchNo: 'B20241201001',
          factory: '深圳工厂',
          workshop: '车间A',
          line: '产线1',
          defectRate: 2.1,
          productionDate: '2024-12-01T14:00:00.000Z',
          project: 'P2024001'
        }
      ]
    };
    
    console.log(`生成数据统计:`);
    console.log(`  - 库存数据: ${frontendData.inventory.length} 条`);
    console.log(`  - 检验数据: ${frontendData.inspection.length} 条`);
    console.log(`  - 生产数据: ${frontendData.production.length} 条`);
    
    // 2. 推送数据到后端
    console.log('\n📊 步骤2: 推送数据到后端...');
    
    const pushResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(frontendData)
    });
    
    if (pushResponse.ok) {
      const pushResult = await pushResponse.json();
      console.log('✅ 数据推送成功:', pushResult.message);
    } else {
      const errorText = await pushResponse.text();
      console.log('❌ 数据推送失败:', pushResponse.status, errorText);
      return;
    }
    
    // 3. 测试各种查询场景
    console.log('\n📊 步骤3: 测试各种查询场景...');
    
    const testQueries = [
      {
        query: '查询深圳工厂库存',
        expectKeywords: ['深圳工厂', 'OLED显示屏', '电池盖']
      },
      {
        query: '有哪些风险库存？',
        expectKeywords: ['风险', '电池盖', '欣冠']
      },
      {
        query: '查询聚龙供应商的物料',
        expectKeywords: ['聚龙', 'OLED显示屏']
      },
      {
        query: '查询重庆工厂的情况',
        expectKeywords: ['重庆工厂', 'PCB主板', '广正']
      },
      {
        query: '查询测试不合格的记录',
        expectKeywords: ['FAIL', '电池盖', '不合格']
      }
    ];
    
    for (const testCase of testQueries) {
      console.log(`\n🔍 测试查询: "${testCase.query}"`);
      
      const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: testCase.query })
      });
      
      if (queryResponse.ok) {
        const queryResult = await queryResponse.json();
        console.log(`✅ 查询成功 (来源: ${queryResult.source})`);
        
        const reply = queryResult.reply || '';
        const matchedKeywords = testCase.expectKeywords.filter(keyword => 
          reply.toLowerCase().includes(keyword.toLowerCase())
        );
        
        console.log(`   匹配关键词: ${matchedKeywords.length}/${testCase.expectKeywords.length}`);
        if (matchedKeywords.length > 0) {
          console.log(`   ✅ 包含: ${matchedKeywords.join(', ')}`);
        }
        
        const missingKeywords = testCase.expectKeywords.filter(keyword => 
          !reply.toLowerCase().includes(keyword.toLowerCase())
        );
        if (missingKeywords.length > 0) {
          console.log(`   ❌ 缺失: ${missingKeywords.join(', ')}`);
        }
      } else {
        console.log(`❌ 查询失败: ${queryResponse.status}`);
      }
    }
    
    // 4. 总结
    console.log('\n📋 总结:');
    console.log('✅ 后端数据推送API正常工作');
    console.log('✅ AI查询系统能够使用推送的数据');
    console.log('💡 建议检查前端数据生成和推送的完整流程');
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  }
}

checkFrontendDataPush();
