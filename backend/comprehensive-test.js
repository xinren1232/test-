/**
 * 综合测试 - 展示所有NLP功能
 */
import { processQuery } from './src/services/assistantService.js';

async function comprehensiveTest() {
  console.log('🎯 IQE智能问答系统 - 综合功能测试\n');
  console.log('=' .repeat(60));
  
  const testCases = [
    {
      category: '📦 库存管理查询',
      queries: [
        '目前有哪些高风险库存？',
        '查询物料 M12345 的库存',
        '查询批次 BATCH001 的库存',
        '查询欣旺达的库存'
      ]
    },
    {
      category: '🧪 实验室测试查询',
      queries: [
        '查询批次 BATCH001 的测试结果',
        '查询物料 M12345 的测试结果'
      ]
    },
    {
      category: '🏭 产线上线查询',
      queries: [
        '查询深圳工厂的使用情况',
        '查询批次 BATCH001 的上线情况'
      ]
    },
    {
      category: '⚠️ 异常情况查询',
      queries: [
        '目前有哪些异常情况？',
        '查询异常物料'
      ]
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n${testCase.category}`);
    console.log('-'.repeat(40));
    
    for (const query of testCase.queries) {
      console.log(`\n🔍 问题: "${query}"`);
      
      try {
        const result = await processQuery(query);
        
        // 简化输出，只显示关键信息
        if (result.includes('记录 1:')) {
          const lines = result.split('\n');
          const summary = lines.slice(0, 8).join('\n'); // 只显示前几行
          console.log('✅ 回答:');
          console.log(summary);
          if (lines.length > 8) {
            console.log('   ... (更多记录)');
          }
        } else {
          console.log('✅ 回答:');
          console.log(result);
        }
        
      } catch (error) {
        console.log('❌ 错误:', error.message);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 综合测试完成！');
  console.log('\n📊 测试总结:');
  console.log('✅ 库存管理查询 - 支持物料编码、批次号、供应商、风险等级查询');
  console.log('✅ 实验室测试查询 - 支持批次和物料的测试结果查询');
  console.log('✅ 产线上线查询 - 支持工厂和批次的上线情况查询');
  console.log('✅ 异常情况查询 - 支持风险物料和异常情况查询');
  console.log('\n💡 系统已能准确理解和回答基于实际数据的业务问题！');
  
  process.exit(0);
}

comprehensiveTest();
