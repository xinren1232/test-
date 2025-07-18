// 测试真实数据查询功能
import fetch from 'node-fetch';

async function testRealDataQuery() {
  console.log('🧪 测试真实数据查询功能...\n');
  
  const testQueries = [
    { query: '查询库存数据', expectedType: 'inventory' },
    { query: '物料库存查询', expectedType: 'inventory' },
    { query: '检验结果查询', expectedType: 'inspection' },
    { query: '测试结果统计', expectedType: 'inspection' },
    { query: '在线跟踪查询', expectedType: 'production' },
    { query: '生产数据查询', expectedType: 'production' }
  ];

  try {
    for (let i = 0; i < testQueries.length; i++) {
      const testQuery = testQueries[i];
      console.log(`📋 测试查询 ${i + 1}: "${testQuery.query}" (${testQuery.expectedType})`);
      
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: testQuery.query,
          context: { type: testQuery.expectedType }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // 检查数据格式
        console.log('✅ 查询成功');
        console.log(`   success: ${result.success}`);
        console.log(`   query: ${result.query}`);
        console.log(`   reply: ${result.reply ? '有' : '无'}`);
        console.log(`   matchedRule: ${result.matchedRule || '无'}`);
        console.log(`   source: ${result.source || '无'}`);
        console.log(`   sql: ${result.sql ? '有SQL' : '无SQL'}`);
        
        // 检查 data 结构
        if (result.data) {
          console.log(`   data.tableData: ${result.data.tableData ? result.data.tableData.length + ' 条' : '无'}`);
          console.log(`   data.cards: ${result.data.cards ? result.data.cards.length + ' 个' : '无'}`);
          console.log(`   data.answer: ${result.data.answer ? '有' : '无'}`);
          console.log(`   data.summary: ${result.data.summary ? '有' : '无'}`);
          
          // 检查表格数据结构
          if (result.data.tableData && result.data.tableData.length > 0) {
            const firstRow = result.data.tableData[0];
            const columns = Object.keys(firstRow);
            console.log(`   表格列数: ${columns.length}`);
            console.log(`   表格列名: ${columns.join(', ')}`);
            
            // 显示第一行数据样本
            console.log('   数据样本:');
            Object.entries(firstRow).forEach(([key, value]) => {
              const displayValue = value === null ? 'NULL' : 
                                 typeof value === 'string' && value.length > 30 ? value.substring(0, 30) + '...' : 
                                 value;
              console.log(`     ${key}: ${displayValue}`);
            });
          }
          
          // 检查卡片数据结构
          if (result.data.cards && result.data.cards.length > 0) {
            console.log('   统计卡片:');
            result.data.cards.forEach(card => {
              console.log(`     ${card.icon} ${card.title}: ${card.value}`);
            });
          }
        }
        
        // 检查其他字段
        console.log(`   sql: ${result.sql ? result.sql.substring(0, 100) + '...' : '无'}`);
        console.log(`   params: ${result.params ? JSON.stringify(result.params) : '无'}`);
        
        // 检查元数据
        if (result.metadata) {
          console.log(`   metadata.recordCount: ${result.metadata.recordCount}`);
          console.log(`   metadata.confidence: ${result.metadata.confidence}`);
          console.log(`   metadata.processingTime: ${result.metadata.processingTime}ms`);
          console.log(`   metadata.dataSource: ${result.metadata.dataSource}`);
        }
        
        // 验证是否为真实数据
        const isRealData = result.source === 'iqe_inspection_database' && 
                          result.metadata?.dataSource === 'mysql' &&
                          result.matchedRule !== 'mock_rule_001';
        
        console.log(`   真实数据验证: ${isRealData ? '✅ 是真实数据' : '❌ 仍是模拟数据'}`);
        
      } else {
        console.log('❌ 查询失败');
        console.log(`   状态码: ${response.status}`);
        const errorText = await response.text();
        console.log(`   错误信息: ${errorText}`);
      }
      
      console.log('');
    }
    
    console.log('🎉 真实数据查询测试完成！');
    
  } catch (error) {
    console.log('❌ 真实数据查询测试失败');
    console.log(`   错误: ${error.message}`);
  }
}

testRealDataQuery().catch(console.error);
