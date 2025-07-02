/**
 * 测试图表生成功能
 * 验证基于实际数据的图表生成服务
 */

async function testChartGeneration() {
  console.log('📊 测试图表生成功能...\n');

  const baseUrl = 'http://localhost:3003';
  
  // 测试的图表类型 - 基于物料分类的综合分析
  const chartTypes = [
    '结构件类质量分析',
    '光学类风险评估',
    '深圳工厂物料流',
    '质量-库存-生产联动',
    '风险等级分布',
    '测试结果分布',
    '不良率趋势分析',
    '供应商质量对比'
  ];

  let successCount = 0;
  let totalTests = chartTypes.length;

  console.log(`🎯 开始测试 ${totalTests} 种图表类型...\n`);

  for (let i = 0; i < chartTypes.length; i++) {
    const chartType = chartTypes[i];
    console.log(`📋 测试 ${i + 1}/${totalTests}: ${chartType}`);

    try {
      // 测试图表生成API
      const response = await fetch(`${baseUrl}/api/charts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chartType: chartType
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log(`   ✅ 生成成功`);
          console.log(`   📊 图表类型: ${result.data.chartType}`);
          console.log(`   📝 标题: ${result.data.title}`);
          
          // 显示数据概要
          if (result.data.data) {
            if (result.data.data.categories) {
              console.log(`   📈 数据点数: ${result.data.data.categories.length}`);
            }
            if (result.data.data.series) {
              console.log(`   📊 数据系列: ${result.data.data.series.length}`);
            }
          }
          
          successCount++;
        } else {
          console.log(`   ❌ 生成失败: ${result.error || '未知错误'}`);
        }
      } else {
        console.log(`   ❌ API调用失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
    }
    
    console.log(''); // 空行分隔
  }

  // 测试总结
  console.log('📊 图表生成测试总结:');
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   成功生成: ${successCount}`);
  console.log(`   失败数量: ${totalTests - successCount}`);
  console.log(`   成功率: ${Math.round((successCount / totalTests) * 100)}%`);

  if (successCount === totalTests) {
    console.log('🎉 所有图表生成测试通过！');
  } else if (successCount > 0) {
    console.log('⚠️ 部分图表生成成功，请检查失败的图表类型。');
  } else {
    console.log('❌ 所有图表生成失败，请检查后端服务和数据库连接。');
  }

  // 测试图表类型列表API
  console.log('\n🔍 测试图表类型列表API...');
  try {
    const typesResponse = await fetch(`${baseUrl}/api/charts/types`);
    if (typesResponse.ok) {
      const typesResult = await typesResponse.json();
      console.log('✅ 图表类型列表获取成功');
      console.log(`📋 可用图表类型数量: ${typesResult.data.length}`);
      
      typesResult.data.forEach((type, index) => {
        console.log(`   ${index + 1}. ${type.icon} ${type.name} - ${type.description}`);
      });
    } else {
      console.log('❌ 图表类型列表获取失败');
    }
  } catch (error) {
    console.log(`❌ 图表类型列表请求失败: ${error.message}`);
  }

  // 测试批量生成API
  console.log('\n🚀 测试批量图表生成...');
  try {
    const batchTypes = ['结构件类质量分析', '风险等级分布', '测试结果分布'];
    const batchResponse = await fetch(`${baseUrl}/api/charts/batch-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chartTypes: batchTypes
      })
    });

    if (batchResponse.ok) {
      const batchResult = await batchResponse.json();
      console.log('✅ 批量生成请求成功');
      console.log(`📊 批量生成结果:`);
      console.log(`   总数: ${batchResult.data.summary.total}`);
      console.log(`   成功: ${batchResult.data.summary.successful}`);
      console.log(`   失败: ${batchResult.data.summary.failed}`);
    } else {
      console.log('❌ 批量生成请求失败');
    }
  } catch (error) {
    console.log(`❌ 批量生成请求失败: ${error.message}`);
  }

  // 测试图表识别API
  console.log('\n🤖 测试智能图表识别...');
  const testQueries = [
    '结构件类物料质量综合分析',
    '光学类物料风险评估',
    '深圳工厂物料流转分析',
    '质量库存生产联动分析',
    '显示风险等级分布',
    '生成供应商质量对比雷达图'
  ];

  for (const query of testQueries) {
    try {
      const identifyResponse = await fetch(`${baseUrl}/api/charts/identify-chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (identifyResponse.ok) {
        const identifyResult = await identifyResponse.json();
        const identified = identifyResult.data.identified;
        
        if (identified) {
          console.log(`✅ "${query}" → ${identified.chartType} (置信度: ${Math.round(identified.confidence * 100)}%)`);
        } else {
          console.log(`❌ "${query}" → 无法识别`);
        }
      }
    } catch (error) {
      console.log(`❌ 识别请求失败: ${error.message}`);
    }
  }

  // 测试数据统计API
  console.log('\n📈 测试数据统计信息...');
  try {
    const statsResponse = await fetch(`${baseUrl}/api/charts/stats`);
    if (statsResponse.ok) {
      const statsResult = await statsResponse.json();
      console.log('✅ 数据统计获取成功');
      console.log(`📦 库存记录: ${statsResult.data.dataStats.inventory}`);
      console.log(`🧪 测试记录: ${statsResult.data.dataStats.tests}`);
      console.log(`⚙️ 生产记录: ${statsResult.data.dataStats.tracking}`);
      
      console.log('📊 风险分布:');
      statsResult.data.riskDistribution.forEach(risk => {
        console.log(`   ${risk.risk_level}: ${risk.count}`);
      });
      
      console.log('✅ 测试结果分布:');
      statsResult.data.testResultDistribution.forEach(result => {
        console.log(`   ${result.test_result}: ${result.count}`);
      });
    } else {
      console.log('❌ 数据统计获取失败');
    }
  } catch (error) {
    console.log(`❌ 数据统计请求失败: ${error.message}`);
  }

  console.log('\n🎉 图表生成功能测试完成！');
}

// 运行测试
testChartGeneration().catch(console.error);
