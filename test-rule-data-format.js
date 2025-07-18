// 测试规则数据格式
import fetch from 'node-fetch';

async function testRuleDataFormat() {
  console.log('🧪 测试规则数据格式...\n');
  
  const testQueries = [
    { query: '查询库存数据', expectedType: 'inventory' },
    { query: '检验结果统计', expectedType: 'inspection' },
    { query: '生产线状态', expectedType: 'production' },
    { query: '通用查询测试', expectedType: 'general' }
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
          }
          
          // 检查卡片数据结构
          if (result.data.cards && result.data.cards.length > 0) {
            const firstCard = result.data.cards[0];
            console.log(`   卡片结构: title=${firstCard.title}, value=${firstCard.value}, icon=${firstCard.icon}`);
          }
        }
        
        // 检查其他字段
        console.log(`   sql: ${result.sql ? '有' : '无'}`);
        console.log(`   params: ${result.params ? '有' : '无'}`);
        console.log(`   matchedRule: ${result.matchedRule || '无'}`);
        console.log(`   source: ${result.source || '无'}`);
        
        // 检查元数据
        if (result.metadata) {
          console.log(`   metadata.recordCount: ${result.metadata.recordCount}`);
          console.log(`   metadata.confidence: ${result.metadata.confidence}`);
          console.log(`   metadata.processingTime: ${result.metadata.processingTime}ms`);
        }
        
        // 验证前端期望的数据结构
        const hasTableData = result.data?.tableData && Array.isArray(result.data.tableData) && result.data.tableData.length > 0;
        const hasReply = result.reply && result.reply.trim().length > 0;
        const hasAnswer = result.data?.answer && result.data.answer.trim().length > 0;
        const isValidForFrontend = result.success !== false && (hasTableData || hasReply || hasAnswer);
        
        console.log(`   前端兼容性: ${isValidForFrontend ? '✅ 兼容' : '❌ 不兼容'}`);
        console.log(`     - 有表格数据: ${hasTableData}`);
        console.log(`     - 有回复内容: ${hasReply}`);
        console.log(`     - 有答案内容: ${hasAnswer}`);
        
      } else {
        console.log('❌ 查询失败');
        console.log(`   状态码: ${response.status}`);
      }
      
      console.log('');
    }
    
    console.log('🎉 规则数据格式测试完成！');
    
  } catch (error) {
    console.log('❌ 规则数据格式测试失败');
    console.log(`   错误: ${error.message}`);
  }
}

testRuleDataFormat().catch(console.error);
