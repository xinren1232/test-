/**
 * 调试数据同步问题
 * 检查前端生成的数据是否正确推送到后端，以及AI查询是否使用了这些数据
 */

import fetch from 'node-fetch';

async function debugDataSyncIssue() {
  console.log('🔍 调试数据同步问题\n');
  
  try {
    // 1. 检查后端健康状态
    console.log('📊 步骤1: 检查后端健康状态...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ 后端服务正常运行');
      console.log(`   - 运行时间: ${healthData.uptime}秒`);
      console.log(`   - 内存使用: ${(healthData.memory.rss / 1024 / 1024).toFixed(2)}MB`);
    } else {
      console.log('❌ 后端服务异常');
      return;
    }
    
    // 2. 模拟前端数据推送
    console.log('\n📊 步骤2: 模拟前端数据推送...');
    const testData = {
      inventory: [
        {
          id: 1,
          materialName: '测试OLED显示屏',
          materialCode: 'M001',
          supplier: '聚龙',
          batchNo: 'B20241201001',
          quantity: 100,
          status: '正常',
          storageLocation: '深圳工厂',
          inboundTime: '2024-12-01'
        },
        {
          id: 2,
          materialName: '测试电池盖',
          materialCode: 'M002',
          supplier: '欣冠',
          batchNo: 'B20241201002',
          quantity: 50,
          status: '风险',
          storageLocation: '深圳工厂',
          inboundTime: '2024-12-01'
        }
      ],
      inspection: [
        {
          id: 1,
          materialCode: 'M001',
          batchNo: 'B20241201001',
          testResult: 'PASS',
          testDate: '2024-12-01'
        }
      ],
      production: [
        {
          id: 1,
          materialCode: 'M001',
          batchNo: 'B20241201001',
          factory: '深圳工厂',
          defectRate: 2.5,
          productionDate: '2024-12-01'
        }
      ]
    };
    
    const pushResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (pushResponse.ok) {
      const pushResult = await pushResponse.json();
      console.log('✅ 数据推送成功:', pushResult.message);
    } else {
      console.log('❌ 数据推送失败:', pushResponse.status);
      return;
    }
    
    // 3. 测试AI查询是否使用推送的数据
    console.log('\n📊 步骤3: 测试AI查询...');
    const testQueries = [
      '查询深圳工厂库存',
      '有哪些风险库存？',
      '查询聚龙供应商的物料',
      '查询OLED显示屏'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 测试查询: "${query}"`);
      
      const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });
      
      if (queryResponse.ok) {
        const queryResult = await queryResponse.json();
        console.log(`✅ 查询成功 (来源: ${queryResult.source})`);
        
        // 检查返回结果是否包含我们推送的测试数据
        const reply = queryResult.reply || '';
        const containsTestData = reply.includes('测试OLED显示屏') || 
                                reply.includes('测试电池盖') || 
                                reply.includes('聚龙') ||
                                reply.includes('深圳工厂');
        
        if (containsTestData) {
          console.log('✅ 查询结果包含推送的测试数据');
        } else {
          console.log('❌ 查询结果未包含推送的测试数据');
          console.log('   返回内容预览:', reply.substring(0, 200) + '...');
        }
      } else {
        console.log(`❌ 查询失败: ${queryResponse.status}`);
      }
    }
    
    // 4. 总结问题
    console.log('\n📋 问题分析:');
    console.log('✅ 数据推送API正常工作');
    console.log('❓ 需要检查AI查询是否优先使用内存数据');
    console.log('❓ 需要检查数据字段映射是否正确');
    console.log('❓ 需要检查查询规则是否匹配实际数据结构');
    
  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error);
  }
}

debugDataSyncIssue();
