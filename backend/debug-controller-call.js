/**
 * 调试控制器调用问题
 */
import { processChartQuery, processRealQuery } from './src/services/realDataAssistantService.js';

async function debugControllerCall() {
  console.log('🔍 调试控制器调用问题\n');
  
  const query = '显示质量趋势分析';
  
  console.log(`🎯 测试查询: "${query}"`);
  
  // 1. 测试图表查询
  console.log('\n📊 步骤1: 测试图表查询函数...');
  const chartResponse = processChartQuery(query);
  
  console.log('图表查询结果:');
  console.log(`  - 返回值类型: ${typeof chartResponse}`);
  console.log(`  - 是否为null: ${chartResponse === null}`);
  console.log(`  - 是否为undefined: ${chartResponse === undefined}`);
  
  if (chartResponse) {
    console.log('✅ 图表查询返回数据');
    console.log(`📊 类型: ${chartResponse.type}`);
    console.log(`📋 图表类型: ${chartResponse.data.chartType}`);
    console.log(`📝 标题: ${chartResponse.data.chartTitle}`);
    
    // 模拟控制器逻辑
    console.log('\n📊 步骤2: 模拟控制器逻辑...');
    if (chartResponse) {
      console.log('✅ 控制器应该返回图表数据');
      console.log('📋 响应结构:', Object.keys(chartResponse));
      return;
    }
  } else {
    console.log('❌ 图表查询未返回数据');
  }
  
  // 2. 测试文本查询
  console.log('\n📝 步骤3: 测试文本查询函数...');
  try {
    const textResponse = await processRealQuery(query);
    console.log('✅ 文本查询返回数据');
    console.log(`📝 内容长度: ${textResponse.length}`);
    console.log(`📝 内容预览: ${textResponse.substring(0, 100)}...`);
  } catch (error) {
    console.log('❌ 文本查询失败:', error.message);
  }
  
  console.log('\n🎉 调试完成！');
}

debugControllerCall().catch(console.error);
