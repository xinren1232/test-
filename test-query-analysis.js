/**
 * 测试查询分析功能
 * 调试查询匹配逻辑
 */

import fetch from 'node-fetch';

async function testQueryAnalysis() {
  console.log('🔍 开始测试查询分析功能...\n');
  
  const testQueries = [
    {
      name: '供应商查询1',
      query: '查询测试供应商A的物料',
      expectType: 'inventory',
      expectFilters: { supplier: '测试供应商A' }
    },
    {
      name: '供应商查询2',
      query: '测试供应商A有什么物料',
      expectType: 'inventory',
      expectFilters: { supplier: '测试供应商A' }
    },
    {
      name: '工厂查询1',
      query: '测试工厂有什么物料',
      expectType: 'inventory',
      expectFilters: { factory: '测试工厂' }
    },
    {
      name: '工厂查询2',
      query: '查询测试工厂的库存',
      expectType: 'inventory',
      expectFilters: { factory: '测试工厂' }
    },
    {
      name: '批次查询',
      query: '查询批次TEST-001',
      expectType: 'inventory',
      expectFilters: { batch: 'TEST-001' }
    },
    {
      name: '测试结果查询',
      query: '查询测试通过的记录',
      expectType: 'test',
      expectFilters: { testResult: 'PASS' }
    }
  ];
  
  for (const testCase of testQueries) {
    console.log(`\n🎯 测试${testCase.name}: "${testCase.query}"`);
    
    try {
      // 发送查询请求
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: testCase.query,
          debug: true  // 请求调试信息
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ 查询成功');
        console.log('📋 回复内容:', result.reply.substring(0, 200) + '...');
        
        // 分析查询是否找到了数据
        const foundData = !result.reply.includes('未找到符合条件');
        console.log(`🔍 找到数据: ${foundData ? '✅' : '❌'}`);
        
        if (!foundData) {
          console.log('❓ 可能的问题:');
          console.log('  - 查询条件匹配失败');
          console.log('  - 数据库中没有对应数据');
          console.log('  - 查询逻辑有误');
        }
        
      } else {
        console.log('❌ 查询失败:', response.status);
      }
      
    } catch (error) {
      console.log('❌ 查询出错:', error.message);
    }
  }
  
  // 测试直接的数据库查询
  console.log('\n📊 测试直接数据库查询:');
  
  const directQueries = [
    {
      name: '直接供应商查询',
      query: '测试供应商A',
      type: 'supplier'
    },
    {
      name: '直接工厂查询', 
      query: '测试工厂',
      type: 'factory'
    },
    {
      name: '直接批次查询',
      query: 'TEST-001',
      type: 'batch'
    }
  ];
  
  for (const testCase of directQueries) {
    console.log(`\n🎯 ${testCase.name}: "${testCase.query}"`);
    
    try {
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: testCase.query })
      });
      
      if (response.ok) {
        const result = await response.json();
        const foundData = !result.reply.includes('未找到符合条件');
        console.log(`🔍 找到数据: ${foundData ? '✅' : '❌'}`);
        
        if (foundData) {
          console.log('📋 找到的数据:', result.reply.substring(0, 150) + '...');
        }
      }
      
    } catch (error) {
      console.log('❌ 查询出错:', error.message);
    }
  }
  
  console.log('\n🎉 查询分析测试完成！');
}

// 运行测试
testQueryAnalysis().catch(console.error);
