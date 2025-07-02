/**
 * 调试图表查询问题
 */
import { processChartQuery } from './src/services/realDataAssistantService.js';

function debugChartQuery() {
  console.log('🔍 调试图表查询问题\n');
  
  const testQueries = [
    '显示质量趋势分析',
    '供应商对比分析',
    '库存状态分布图',
    '趋势分析',
    '对比分析',
    '分布图'
  ];
  
  testQueries.forEach(query => {
    console.log(`🎯 测试查询: "${query}"`);
    console.log(`查询小写: "${query.toLowerCase()}"`);
    
    // 手动检查关键词匹配
    const queryLower = query.toLowerCase();
    
    console.log('关键词检查:');
    console.log(`  - 包含"趋势": ${queryLower.includes('趋势')}`);
    console.log(`  - 包含"对比": ${queryLower.includes('对比')}`);
    console.log(`  - 包含"分布": ${queryLower.includes('分布')}`);
    console.log(`  - 包含"分析": ${queryLower.includes('分析')}`);
    
    const result = processChartQuery(query);
    
    if (result) {
      console.log('✅ 返回图表数据');
      console.log(`📊 类型: ${result.type}`);
      console.log(`📋 图表类型: ${result.data.chartType}`);
    } else {
      console.log('❌ 未返回图表数据');
    }
    console.log('-'.repeat(50));
  });
}

debugChartQuery();
