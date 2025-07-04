/**
 * 最终数据同步测试
 * 验证完整的数据生成 → 推送 → 查询流程
 */

import fetch from 'node-fetch';

async function finalDataSyncTest() {
  console.log('🎯 最终数据同步测试\n');
  
  try {
    // 1. 模拟用户生成的真实数据
    console.log('📊 步骤1: 模拟用户生成的真实数据...');
    
    const userData = {
      inventory: [
        {
          id: 1,
          materialName: 'OLED显示屏',
          materialCode: 'M001',
          supplier: '聚龙',
          batchNo: 'B20241201001',
          quantity: 150,
          status: '正常',
          storageLocation: '深圳工厂',
          inboundTime: '2024-12-01T10:30:00.000Z'
        },
        {
          id: 2,
          materialName: '电池盖',
          materialCode: 'M002',
          supplier: '欣冠',
          batchNo: 'B20241201002',
          quantity: 80,
          status: '风险',
          storageLocation: '深圳工厂',
          inboundTime: '2024-12-01T11:00:00.000Z'
        },
        {
          id: 3,
          materialName: 'PCB主板',
          materialCode: 'M003',
          supplier: '广正',
          batchNo: 'B20241201003',
          quantity: 200,
          status: '正常',
          storageLocation: '重庆工厂',
          inboundTime: '2024-12-01T09:15:00.000Z'
        },
        {
          id: 4,
          materialName: '摄像头模组',
          materialCode: 'M004',
          supplier: '聚龙',
          batchNo: 'B20241201004',
          quantity: 120,
          status: '冻结',
          storageLocation: '上海工厂',
          inboundTime: '2024-12-01T08:45:00.000Z'
        }
      ],
      inspection: [
        {
          id: 1,
          materialCode: 'M001',
          materialName: 'OLED显示屏',
          batchNo: 'B20241201001',
          testResult: 'PASS',
          testDate: '2024-12-01T12:00:00.000Z',
          defectRate: 1.2
        },
        {
          id: 2,
          materialCode: 'M002',
          materialName: '电池盖',
          batchNo: 'B20241201002',
          testResult: 'FAIL',
          testDate: '2024-12-01T12:30:00.000Z',
          defectRate: 8.5
        }
      ],
      production: [
        {
          id: 1,
          materialCode: 'M001',
          materialName: 'OLED显示屏',
          batchNo: 'B20241201001',
          factory: '深圳工厂',
          defectRate: 2.1,
          productionDate: '2024-12-01T14:00:00.000Z'
        }
      ]
    };
    
    console.log(`✅ 生成数据统计:`);
    console.log(`   - 库存数据: ${userData.inventory.length} 条`);
    console.log(`   - 检验数据: ${userData.inspection.length} 条`);
    console.log(`   - 生产数据: ${userData.production.length} 条`);
    
    // 2. 推送数据到后端
    console.log('\n📊 步骤2: 推送数据到后端...');
    
    const pushResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (pushResponse.ok) {
      const pushResult = await pushResponse.json();
      console.log('✅ 数据推送成功:', pushResult.message);
    } else {
      console.log('❌ 数据推送失败:', pushResponse.status);
      return;
    }
    
    // 3. 测试各种查询场景
    console.log('\n📊 步骤3: 测试各种查询场景...');
    
    const testCases = [
      {
        name: '深圳工厂库存查询',
        query: '查询深圳工厂库存',
        expectData: ['深圳工厂', 'OLED显示屏', '电池盖', '聚龙', '欣冠']
      },
      {
        name: '风险库存查询',
        query: '有哪些风险库存？',
        expectData: ['风险', '电池盖', '欣冠']
      },
      {
        name: '聚龙供应商查询',
        query: '查询聚龙供应商的物料',
        expectData: ['聚龙', 'OLED显示屏', '摄像头模组']
      },
      {
        name: '重庆工厂查询',
        query: '查询重庆工厂的情况',
        expectData: ['重庆工厂', 'PCB主板', '广正']
      },
      {
        name: '冻结状态查询',
        query: '查询冻结状态的库存',
        expectData: ['冻结', '摄像头模组', '上海工厂']
      },
      {
        name: '测试不合格查询',
        query: '查询测试不合格的记录',
        expectData: ['FAIL', '电池盖', '不合格']
      }
    ];
    
    let successCount = 0;
    let totalCount = testCases.length;
    
    for (const testCase of testCases) {
      console.log(`\n🔍 ${testCase.name}: "${testCase.query}"`);
      
      const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: testCase.query })
      });
      
      if (queryResponse.ok) {
        const queryResult = await queryResponse.json();
        const reply = queryResult.reply || '';
        
        // 检查期望的数据是否在结果中
        const matchedData = testCase.expectData.filter(data => 
          reply.toLowerCase().includes(data.toLowerCase())
        );
        
        const matchRate = matchedData.length / testCase.expectData.length;
        
        if (matchRate >= 0.5) { // 至少匹配50%的期望数据
          console.log(`✅ 查询成功 (匹配率: ${(matchRate * 100).toFixed(0)}%)`);
          console.log(`   匹配数据: ${matchedData.join(', ')}`);
          successCount++;
        } else {
          console.log(`❌ 查询结果不符合预期 (匹配率: ${(matchRate * 100).toFixed(0)}%)`);
          console.log(`   匹配数据: ${matchedData.join(', ')}`);
          console.log(`   缺失数据: ${testCase.expectData.filter(d => !matchedData.includes(d)).join(', ')}`);
        }
        
        console.log(`   数据源: ${queryResult.source}`);
      } else {
        console.log(`❌ 查询失败: ${queryResponse.status}`);
      }
    }
    
    // 4. 总结测试结果
    console.log('\n📋 测试总结:');
    console.log(`✅ 成功查询: ${successCount}/${totalCount} (${(successCount/totalCount*100).toFixed(0)}%)`);
    
    if (successCount === totalCount) {
      console.log('🎉 所有测试通过！数据同步和查询系统工作正常');
      console.log('💡 用户现在可以：');
      console.log('   1. 在前端生成数据');
      console.log('   2. 数据会自动推送到后端');
      console.log('   3. AI查询会使用推送的真实数据');
    } else {
      console.log('⚠️ 部分测试失败，需要进一步优化');
      console.log('💡 建议：');
      console.log('   1. 检查参数提取逻辑');
      console.log('   2. 优化查询规则匹配');
      console.log('   3. 完善数据筛选条件');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

finalDataSyncTest();
