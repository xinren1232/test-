/**
 * 直接测试图表查询函数
 */
import { processChartQuery } from './src/services/realDataAssistantService.js';

function testChartQueryDirect() {
  console.log('🎯 直接测试图表查询函数\n');
  
  const testQueries = [
    '显示质量趋势分析',
    '供应商对比分析',
    '库存状态分布图',
    '显示趋势图',
    '对比分析',
    '分布情况',
    '查询库存'  // 这个不应该返回图表
  ];
  
  testQueries.forEach(query => {
    console.log(`🔍 测试查询: "${query}"`);
    const result = processChartQuery(query);
    
    if (result) {
      console.log('✅ 返回图表数据');
      console.log(`📊 类型: ${result.type}`);
      console.log(`📋 图表类型: ${result.data.chartType}`);
      console.log(`📝 标题: ${result.data.chartTitle}`);
    } else {
      console.log('❌ 未返回图表数据');
    }
    console.log('');
  });
}

testChartQueryDirect();
