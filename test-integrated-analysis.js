/**
 * 测试整合分析服务
 * 验证基于多规则结合的整体数据调用功能
 */

async function testIntegratedAnalysis() {
  console.log('🔍 测试整合分析服务...\n');

  const baseUrl = 'http://localhost:3004';
  
  // 测试用例 - 多规则结合检索
  const testCases = [
    {
      name: '结构件类物料 + 聚龙供应商',
      description: '测试物料分类和供应商规则结合',
      criteria: {
        materialCategory: '结构件类',
        supplier: '聚龙'
      }
    },
    {
      name: '深圳工厂 + 高风险物料',
      description: '测试工厂和风险等级规则结合',
      criteria: {
        factory: '深圳工厂',
        riskLevel: 'high'
      }
    },
    {
      name: 'X6827项目 + 质量阈值',
      description: '测试项目和质量阈值规则结合',
      criteria: {
        project: 'X6827',
        qualityThreshold: 90
      }
    },
    {
      name: 'I6789基线 + 光学类物料',
      description: '测试基线和物料分类规则结合',
      criteria: {
        baseline: 'I6789',
        materialCategory: '光学类'
      }
    },
    {
      name: '多维度综合分析',
      description: '测试多个规则同时应用',
      criteria: {
        materialCategory: '结构件类',
        supplier: '聚龙',
        factory: '深圳工厂',
        riskLevel: 'medium',
        qualityThreshold: 85
      }
    }
  ];

  let successCount = 0;
  let totalTests = testCases.length;

  console.log(`🎯 开始测试 ${totalTests} 个多规则结合场景...\n`);

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`📋 测试 ${i + 1}/${totalTests}: ${testCase.name}`);
    console.log(`   描述: ${testCase.description}`);
    console.log(`   条件: ${JSON.stringify(testCase.criteria)}`);

    try {
      // 测试多规则结合检索API
      const response = await fetch(`${baseUrl}/api/integrated-analysis/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.criteria)
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log(`   ✅ 检索成功`);
          console.log(`   📊 总记录数: ${result.data.statistics.totalMaterials}`);
          console.log(`   📋 应用规则: ${result.metadata.appliedRules.length}个`);
          
          // 显示统计信息
          if (result.data.statistics.categoryDistribution) {
            const categories = Object.keys(result.data.statistics.categoryDistribution);
            console.log(`   📦 物料分类: ${categories.join('、')}`);
          }
          
          if (result.data.statistics.qualityMetrics.avgPassRate) {
            console.log(`   🧪 平均通过率: ${(result.data.statistics.qualityMetrics.avgPassRate * 100).toFixed(1)}%`);
          }
          
          // 显示洞察
          if (result.data.insights.length > 0) {
            console.log(`   💡 业务洞察: ${result.data.insights.length}条`);
            result.data.insights.forEach(insight => {
              console.log(`      - ${insight.message}`);
            });
          }
          
          successCount++;
        } else {
          console.log(`   ❌ 检索失败: ${result.error || '未知错误'}`);
        }
      } else {
        console.log(`   ❌ API调用失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
    }
    
    console.log(''); // 空行分隔
  }

  // 测试智能查询
  console.log('🤖 测试智能查询功能...\n');
  
  const intelligentQueries = [
    '查询结构件类物料在深圳工厂的质量情况',
    '分析聚龙供应商的高风险物料',
    '检查X6827项目的测试通过率',
    '评估光学类物料的供应商表现',
    '深圳工厂的库存风险分析'
  ];

  for (let i = 0; i < intelligentQueries.length; i++) {
    const query = intelligentQueries[i];
    console.log(`🔍 智能查询 ${i + 1}/${intelligentQueries.length}: "${query}"`);

    try {
      const response = await fetch(`${baseUrl}/api/integrated-analysis/intelligent-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          console.log(`   ✅ 解析成功`);
          
          if (result.parsedCriteria) {
            console.log(`   🎯 解析条件: ${JSON.stringify(result.parsedCriteria)}`);
          }
          
          if (result.response) {
            const preview = result.response.length > 100 ? 
              result.response.substring(0, 100) + '...' : 
              result.response;
            console.log(`   📝 回复预览: ${preview.replace(/\n/g, ' ')}`);
          }
          
          if (result.data && result.data.statistics) {
            console.log(`   📊 数据记录: ${result.data.statistics.totalMaterials}条`);
          }
        } else {
          console.log(`   ⚠️ ${result.message || '无法解析查询'}`);
        }
      } else {
        console.log(`   ❌ API调用失败: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
    }
    
    console.log('');
  }

  // 测试业务规则配置
  console.log('📋 测试业务规则配置...');
  try {
    const rulesResponse = await fetch(`${baseUrl}/api/integrated-analysis/rules`);
    if (rulesResponse.ok) {
      const rulesResult = await rulesResponse.json();
      console.log('✅ 业务规则获取成功');
      console.log(`📦 物料分类: ${Object.keys(rulesResult.data.materialCategories).length}个`);
      console.log(`🏢 供应商映射: ${Object.keys(rulesResult.data.supplierMaterialMapping).length}个`);
      console.log(`📊 项目基线: ${Object.keys(rulesResult.data.projectBaselineMapping).length}个`);
      console.log(`🏭 工厂仓库: ${Object.keys(rulesResult.data.factoryWarehouseMapping).length}个`);
    } else {
      console.log('❌ 业务规则获取失败');
    }
  } catch (error) {
    console.log(`❌ 业务规则请求失败: ${error.message}`);
  }

  // 测试综合报告生成
  console.log('\n📊 测试综合报告生成...');
  const reportTypes = ['quality_overview', 'risk_assessment', 'supplier_performance', 'factory_efficiency'];
  
  for (const reportType of reportTypes) {
    try {
      const reportResponse = await fetch(`${baseUrl}/api/integrated-analysis/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: reportType,
          criteria: { factory: '深圳工厂' }
        })
      });

      if (reportResponse.ok) {
        const reportResult = await reportResponse.json();
        console.log(`✅ ${reportResult.report.title} 生成成功`);
        console.log(`   📝 摘要: ${reportResult.report.summary}`);
        console.log(`   💡 发现: ${reportResult.report.keyFindings.length}条`);
        console.log(`   🔧 建议: ${reportResult.report.recommendations.length}条`);
      } else {
        console.log(`❌ ${reportType} 报告生成失败`);
      }
    } catch (error) {
      console.log(`❌ ${reportType} 报告请求失败: ${error.message}`);
    }
  }

  // 测试总结
  console.log('\n📊 整合分析服务测试总结:');
  console.log(`   多规则结合测试: ${successCount}/${totalTests} 成功`);
  console.log(`   成功率: ${Math.round((successCount / totalTests) * 100)}%`);

  if (successCount === totalTests) {
    console.log('🎉 所有多规则结合测试通过！整合分析服务功能正常。');
  } else if (successCount > 0) {
    console.log('⚠️ 部分测试通过，整合分析服务基本可用。');
  } else {
    console.log('❌ 所有测试失败，需要检查整合分析服务和数据库连接。');
  }

  console.log('\n🔧 整合分析服务特点:');
  console.log('✅ 基于业务逻辑的整体数据调用');
  console.log('✅ 多个规则结合检索');
  console.log('✅ 跨表数据关联分析');
  console.log('✅ 智能自然语言解析');
  console.log('✅ 业务洞察和建议生成');
  console.log('✅ 综合报告自动生成');

  console.log('\n🎉 整合分析服务测试完成！');
}

// 运行测试
testIntegratedAnalysis().catch(console.error);
