import IntelligentQASystem from './src/services/intelligentQASystem.js';

async function testExtendedQueries() {
  console.log('🧪 测试扩展查询功能...\n');
  
  const qaSystem = new IntelligentQASystem();
  
  // 扩展查询测试用例
  const testQueries = [
    {
      question: '质量分析报告',
      expectedType: 'quality_query',
      description: '测试质量分析查询'
    },
    {
      question: '最近的测试趋势',
      expectedType: 'time_query', 
      description: '测试时间范围查询'
    },
    {
      question: '供应商对比分析',
      expectedType: 'comparison_query',
      description: '测试对比分析查询'
    },
    {
      question: 'BOE和天马的对比',
      expectedType: 'comparison_query',
      description: '测试具体供应商对比'
    },
    {
      question: '缺陷统计分析',
      expectedType: 'quality_query',
      description: '测试缺陷分析'
    },
    {
      question: '本周的库存情况',
      expectedType: 'time_query',
      description: '测试时间限定查询'
    }
  ];
  
  try {
    for (let i = 0; i < testQueries.length; i++) {
      const testCase = testQueries[i];
      console.log(`\n${i + 1}. ${testCase.description}`);
      console.log(`问题: "${testCase.question}"`);
      console.log('=' .repeat(70));
      
      const result = await qaSystem.processQuestion(testCase.question);
      
      if (result.success) {
        console.log('✅ 处理成功');
        console.log('识别类型:', result.analysis.type);
        console.log('期望类型:', testCase.expectedType);
        
        // 验证类型识别
        if (result.analysis.type === testCase.expectedType) {
          console.log('✅ 类型识别正确');
        } else {
          console.log('⚠️ 类型识别不符合预期');
        }
        
        console.log('选择模板:', result.template);
        console.log('识别实体:', JSON.stringify(result.analysis.entities, null, 2));
        console.log('置信度:', result.analysis.confidence);
        
        // 检查图表生成
        if (result.charts && result.charts.length > 0) {
          console.log(`📊 生成图表: ${result.charts.length} 个`);
        }
        
        console.log('\n📋 回答预览:');
        console.log(result.response.substring(0, 300) + '...');
        
      } else {
        console.log('❌ 处理失败');
        console.log('错误信息:', result.error);
      }
      
      // 添加延迟
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // 测试复杂查询
    console.log('\n🔍 测试复杂查询...');
    const complexQueries = [
      '聚龙供应商的质量情况和BOE对比',
      '深圳工厂最近一周的风险物料统计',
      'LCD显示屏的供应商质量排行'
    ];
    
    for (const query of complexQueries) {
      console.log(`\n复杂查询: "${query}"`);
      const result = await qaSystem.processQuestion(query);
      
      if (result.success) {
        console.log('✅ 复杂查询处理成功');
        console.log('类型:', result.analysis.type);
        console.log('模板:', result.template);
        console.log('实体:', Object.keys(result.analysis.entities).join(', '));
      } else {
        console.log('❌ 复杂查询处理失败');
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✅ 扩展查询功能测试完成');
    console.log('\n📊 支持的查询类型总结:');
    console.log('- 供应商查询: 物料清单、综合情况');
    console.log('- 物料查询: 供应商分布、库存情况');
    console.log('- 工厂查询: 库存概览、状态分布');
    console.log('- 状态查询: 风险分析、异常统计');
    console.log('- 质量查询: 测试分析、缺陷统计');
    console.log('- 时间查询: 趋势分析、最近情况');
    console.log('- 对比查询: 供应商对比、工厂对比');
    console.log('- 综合分析: 排行统计、全面分析');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await qaSystem.close();
  }
}

testExtendedQueries();
