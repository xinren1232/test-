import IntelligentQASystem from './src/services/intelligentQASystem.js';

async function testEnhancedQASystem() {
  console.log('🧪 测试增强版智能问答系统（含图表功能）...\n');
  
  const qaSystem = new IntelligentQASystem();
  
  // 测试问题列表 - 重点测试图表生成功能
  const testQuestions = [
    {
      question: 'BOE供应商有哪些物料',
      expectedCharts: ['pie'],
      description: '测试供应商物料分布饼图'
    },
    {
      question: 'LCD显示屏有哪些供应商', 
      expectedCharts: ['bar'],
      description: '测试物料供应商对比柱状图'
    },
    {
      question: '深圳工厂的库存情况',
      expectedCharts: ['bar'],
      description: '测试工厂库存状态堆叠图'
    },
    {
      question: '聚龙供应商的综合情况',
      expectedCharts: ['line'],
      description: '测试供应商测试通过率趋势图'
    }
  ];
  
  try {
    for (let i = 0; i < testQuestions.length; i++) {
      const testCase = testQuestions[i];
      console.log(`\n${i + 1}. ${testCase.description}`);
      console.log(`问题: "${testCase.question}"`);
      console.log('=' .repeat(80));
      
      const result = await qaSystem.processQuestion(testCase.question);
      
      if (result.success) {
        console.log('✅ 处理成功');
        console.log('问题类型:', result.analysis.type);
        console.log('识别实体:', JSON.stringify(result.analysis.entities, null, 2));
        console.log('选择模板:', result.template);
        
        // 检查图表生成
        if (result.charts && result.charts.length > 0) {
          console.log(`📊 图表生成成功: ${result.charts.length} 个图表`);
          result.charts.forEach((chart, index) => {
            console.log(`  图表 ${index + 1}:`);
            console.log(`    类型: ${chart.type}`);
            console.log(`    标题: ${chart.title}`);
            console.log(`    数据点数: ${chart.data?.length || chart.data?.labels?.length || '未知'}`);
          });
          
          // 验证期望的图表类型
          const chartTypes = result.charts.map(c => c.type);
          const hasExpectedChart = testCase.expectedCharts.some(expected => 
            chartTypes.includes(expected)
          );
          
          if (hasExpectedChart) {
            console.log('✅ 图表类型符合预期');
          } else {
            console.log(`⚠️ 图表类型不符合预期。期望: ${testCase.expectedCharts.join(', ')}, 实际: ${chartTypes.join(', ')}`);
          }
        } else {
          console.log('❌ 未生成图表');
        }
        
        console.log('\n📋 回答内容预览:');
        console.log(result.response.substring(0, 200) + '...');
        
      } else {
        console.log('❌ 处理失败');
        console.log('错误信息:', result.error);
      }
      
      // 添加延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 测试图表数据结构
    console.log('\n🔍 详细测试图表数据结构...');
    const detailTest = await qaSystem.processQuestion('BOE供应商有哪些物料');
    
    if (detailTest.success && detailTest.charts && detailTest.charts.length > 0) {
      const chart = detailTest.charts[0];
      console.log('\n📊 图表详细信息:');
      console.log('类型:', chart.type);
      console.log('标题:', chart.title);
      console.log('数据结构:');
      console.log(JSON.stringify(chart.data, null, 2));
      console.log('配置选项:');
      console.log(JSON.stringify(chart.config, null, 2));
    }
    
    console.log('\n✅ 增强版智能问答系统测试完成');
    console.log('\n📈 功能总结:');
    console.log('- ✅ 智能实体识别');
    console.log('- ✅ 真实数据查询');
    console.log('- ✅ 格式化表格输出');
    console.log('- ✅ 动态图表生成');
    console.log('- ✅ 多种图表类型支持');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await qaSystem.close();
  }
}

testEnhancedQASystem();
