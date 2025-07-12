import ChartGenerationService from './src/services/chartGenerationService.js';

async function testChartIntegration() {
  console.log('🧪 测试图表集成功能...\n');
  
  const chartService = new ChartGenerationService();
  
  try {
    // 测试1: 供应商物料分布饼图
    console.log('1. 测试供应商物料分布饼图...');
    const pieChart = await chartService.generateSupplierMaterialsPieChart('BOE');
    console.log('✅ 饼图生成成功');
    console.log('类型:', pieChart.type);
    console.log('标题:', pieChart.title);
    console.log('数据点数:', pieChart.data.length);
    
    // 测试2: 物料供应商对比柱状图
    console.log('\n2. 测试物料供应商对比柱状图...');
    const barChart = await chartService.generateMaterialSuppliersBarChart('LCD显示屏');
    console.log('✅ 柱状图生成成功');
    console.log('类型:', barChart.type);
    console.log('标题:', barChart.title);
    console.log('供应商数:', barChart.data.labels.length);
    
    // 测试3: 工厂库存分布图
    console.log('\n3. 测试工厂库存分布图...');
    const stackedChart = await chartService.generateFactoryInventoryStackedChart('深圳工厂');
    console.log('✅ 堆叠图生成成功');
    console.log('类型:', stackedChart.type);
    console.log('标题:', stackedChart.title);
    console.log('物料数:', stackedChart.data.labels.length);
    
    // 测试4: 测试通过率趋势图
    console.log('\n4. 测试通过率趋势图...');
    const trendChart = await chartService.generateTestPassRateTrendChart('BOE');
    console.log('✅ 趋势图生成成功');
    console.log('类型:', trendChart.type);
    console.log('标题:', trendChart.title);
    console.log('数据点数:', trendChart.data.labels.length);
    
    console.log('\n✅ 所有图表测试通过');
    console.log('\n📊 支持的图表类型:');
    console.log('- 饼图 (pie): 供应商物料分布');
    console.log('- 柱状图 (bar): 物料供应商对比、工厂库存分布');
    console.log('- 趋势图 (line): 测试通过率趋势');
    
  } catch (error) {
    console.error('❌ 图表测试失败:', error);
  }
}

testChartIntegration();
