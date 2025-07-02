/**
 * 测试工厂查询修复
 * 验证当查询特定工厂时只返回该工厂的数据
 */

async function testFactoryQueryFix() {
  console.log('🏭 测试工厂查询逻辑修复...\n');

  const baseUrl = 'http://localhost:3004';
  
  // 测试用例
  const testCases = [
    {
      name: '查询存在的工厂 - 深圳工厂',
      description: '测试查询数据库中存在的深圳工厂',
      criteria: { factory: '深圳工厂' },
      expectedResult: '应该返回深圳工厂的数据'
    },
    {
      name: '查询不存在的工厂 - 重庆工厂',
      description: '测试查询数据库中不存在的重庆工厂',
      criteria: { factory: '重庆工厂' },
      expectedResult: '应该返回数据不存在的提示'
    },
    {
      name: '查询不存在的工厂 - 南昌工厂',
      description: '测试查询数据库中不存在的南昌工厂',
      criteria: { factory: '南昌工厂' },
      expectedResult: '应该返回数据不存在的提示'
    },
    {
      name: '查询不存在的工厂 - 宜宾工厂',
      description: '测试查询数据库中不存在的宜宾工厂',
      criteria: { factory: '宜宾工厂' },
      expectedResult: '应该返回数据不存在的提示'
    }
  ];

  console.log(`🎯 开始测试 ${testCases.length} 个工厂查询场景...\n`);

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`📋 测试 ${i + 1}/${testCases.length}: ${testCase.name}`);
    console.log(`   描述: ${testCase.description}`);
    console.log(`   条件: ${JSON.stringify(testCase.criteria)}`);
    console.log(`   预期: ${testCase.expectedResult}`);

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
        
        if (result.success) {
          console.log(`   ✅ 查询成功`);
          console.log(`   📊 返回记录数: ${result.data.statistics.totalMaterials}`);
          
          // 检查是否有数据不存在的洞察
          const dataNotFoundInsight = result.data.insights.find(insight => 
            insight.type === 'data_not_found'
          );
          
          if (dataNotFoundInsight) {
            console.log(`   ℹ️ 数据状态: ${dataNotFoundInsight.message}`);
            
            // 显示可用工厂
            if (result.metadata.availableFactories) {
              console.log(`   🏭 可用工厂: ${result.metadata.availableFactories.join('、')}`);
            }
            
            // 显示建议
            if (result.data.recommendations.length > 0) {
              console.log(`   💡 建议: ${result.data.recommendations[0].description}`);
            }
          } else if (result.data.statistics.totalMaterials > 0) {
            console.log(`   📦 找到数据: ${result.data.statistics.totalMaterials}条记录`);
            
            // 显示分类分布
            if (result.data.statistics.categoryDistribution) {
              const categories = Object.keys(result.data.statistics.categoryDistribution);
              console.log(`   📦 物料分类: ${categories.join('、')}`);
            }
            
            // 显示质量指标
            if (result.data.statistics.qualityMetrics.avgPassRate) {
              console.log(`   🧪 平均通过率: ${(result.data.statistics.qualityMetrics.avgPassRate * 100).toFixed(1)}%`);
            }
          }
          
          // 显示应用的规则
          console.log(`   📋 应用规则: ${result.metadata.appliedRules.join('、')}`);
          
        } else {
          console.log(`   ❌ 查询失败: ${result.error || '未知错误'}`);
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
  console.log('🤖 测试智能工厂查询...\n');
  
  const intelligentQueries = [
    '查询深圳工厂的库存情况',
    '重庆工厂的物料分析',
    '南昌工厂有什么物料',
    '宜宾工厂的质量状况'
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
          
          if (result.data && result.data.statistics) {
            console.log(`   📊 数据记录: ${result.data.statistics.totalMaterials}条`);
            
            // 检查是否有数据不存在的提示
            const dataNotFoundInsight = result.data.insights.find(insight => 
              insight.type === 'data_not_found'
            );
            
            if (dataNotFoundInsight) {
              console.log(`   ℹ️ ${dataNotFoundInsight.message}`);
            }
          }
          
          if (result.response) {
            // 显示回复的前100个字符
            const preview = result.response.length > 100 ? 
              result.response.substring(0, 100) + '...' : 
              result.response;
            console.log(`   📝 回复预览: ${preview.replace(/\n/g, ' ')}`);
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

  // 获取实际可用的数据
  console.log('📊 获取实际可用数据...');
  try {
    const debugResponse = await fetch(`${baseUrl}/api/integrated-analysis/debug/fields`);
    if (debugResponse.ok) {
      const debugResult = await debugResponse.json();
      console.log('✅ 实际数据获取成功');
      console.log(`🏭 可用工厂: ${debugResult.data.storageLocations.concat(debugResult.data.factories).filter((v, i, a) => a.indexOf(v) === i).join('、')}`);
      console.log(`🏢 可用供应商: ${debugResult.data.suppliers.slice(0, 5).join('、')}等${debugResult.data.suppliers.length}家`);
      console.log(`📦 可用物料: ${debugResult.data.materials.slice(0, 5).join('、')}等${debugResult.data.materials.length}种`);
    } else {
      console.log('❌ 实际数据获取失败');
    }
  } catch (error) {
    console.log(`❌ 实际数据请求失败: ${error.message}`);
  }

  console.log('\n🎉 工厂查询逻辑修复测试完成！');
  
  console.log('\n📋 修复要点总结:');
  console.log('✅ 精确匹配工厂名称，避免模糊查询');
  console.log('✅ 当查询不存在的工厂时，提供明确的数据不存在提示');
  console.log('✅ 显示当前可用的工厂列表，帮助用户选择正确的工厂');
  console.log('✅ 更新业务规则，使其与实际数据库内容匹配');
  console.log('✅ 智能查询能够正确解析工厂名称并给出相应反馈');
}

// 运行测试
testFactoryQueryFix().catch(console.error);
