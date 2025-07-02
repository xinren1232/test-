/**
 * 测试所有优化后的问答规则
 */
import fetch from 'node-fetch';

console.log('🧪 开始测试所有优化后的问答规则...\n');

async function testAllRules() {
  try {
    // 基础查询规则测试
    const basicRules = [
      '查询深圳工厂的库存',
      '查询BOE供应商的物料',
      '查询聚龙供应商的物料',
      '查询歌尔供应商的物料',
      '查询风险状态的库存',
      '查询冻结状态的库存',
      '查询OLED显示屏的库存',
      '查询电池盖的库存',
      '查询喇叭的库存',
      '查询散热片的库存',
      '查询所有库存记录',
      '查询测试FAIL记录',
      '查询测试PASS记录',
      '查询OLED显示屏测试记录',
      '查询电池盖测试记录',
      '查询BOE供应商测试记录',
      '查询聚龙供应商测试记录',
      '查询深圳工厂的生产记录',
      '查询宜宾工厂的生产记录',
      '查询不良率高于5%的生产记录',
      '查询X6827项目记录',
      '查询S662LN项目记录',
      '查询S665LN项目记录',
      '有多少种物料？',
      '总共有多少个批次？',
      '有几家供应商？',
      '有几个工厂？',
      '有几个项目？'
    ];

    console.log('📊 测试基础查询规则...');
    let successCount = 0;
    let totalCount = basicRules.length;

    for (const query of basicRules) {
      try {
        const response = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            query,
            scenario: 'comprehensive_quality',
            analysisMode: 'professional',
            requireDataAnalysis: true
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ "${query}" - 匹配数据: ${result.matchedData || 0} 条`);
          successCount++;
        } else {
          console.log(`❌ "${query}" - 查询失败: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ "${query}" - 错误: ${error.message}`);
      }
    }

    console.log(`\n📊 基础规则测试完成: ${successCount}/${totalCount} 成功\n`);

    // 高级分析规则测试
    const advancedRules = [
      '分析OLED显示屏的库存、测试、生产全链路数据',
      '分析电池盖的库存、测试、生产全链路数据',
      '分析喇叭的库存、测试、生产全链路数据',
      '分析散热片的库存、测试、生产全链路数据',
      '分析BOE供应商的库存、测试、生产全链路数据',
      '分析聚龙供应商的库存、测试、生产全链路数据',
      '分析歌尔供应商的库存、测试、生产全链路数据',
      '对比OLED显示屏和电池盖的质量表现',
      '对比BOE、聚龙、歌尔三家供应商的质量表现',
      '对比深圳工厂和宜宾工厂的生产效率',
      '对比X6827、S662LN、S665LN项目的质量表现',
      '分析当前库存的风险状况和预警信号',
      '分析测试FAIL记录的风险趋势和影响',
      '分析高不良率生产记录的风险评估',
      '评估各供应商的质量风险等级'
    ];

    console.log('📊 测试高级分析规则...');
    let advancedSuccessCount = 0;
    let advancedTotalCount = advancedRules.length;

    for (const query of advancedRules) {
      try {
        const response = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            query,
            scenario: 'comprehensive_quality',
            analysisMode: 'professional',
            requireDataAnalysis: true
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ "${query.substring(0, 30)}..." - 响应长度: ${result.reply.length} 字符`);
          advancedSuccessCount++;
        } else {
          console.log(`❌ "${query.substring(0, 30)}..." - 查询失败: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ "${query.substring(0, 30)}..." - 错误: ${error.message}`);
      }
    }

    console.log(`\n📊 高级规则测试完成: ${advancedSuccessCount}/${advancedTotalCount} 成功\n`);

    // 图表规则测试
    const chartRules = [
      '生成库存状态（正常/风险/冻结）分布饼图',
      '生成BOE、聚龙、歌尔供应商库存分布柱状图',
      '生成OLED显示屏、电池盖、喇叭、散热片分布图',
      '生成深圳工厂和宜宾工厂库存对比图',
      '生成测试PASS/FAIL结果分布饼图',
      '生成各供应商测试合格率对比柱状图',
      '生成各物料测试合格率趋势图',
      '生成各物料生产不良率对比图',
      '生成深圳工厂vs宜宾工厂效率对比图',
      '生成X6827、S662LN、S665LN项目质量对比图',
      '生成库存-测试-生产全链路质量热力图',
      '生成多维度风险预警雷达图'
    ];

    console.log('📊 测试图表规则...');
    let chartSuccessCount = 0;
    let chartTotalCount = chartRules.length;

    for (const query of chartRules) {
      try {
        const response = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            query,
            scenario: 'comprehensive_quality',
            analysisMode: 'professional',
            requireDataAnalysis: true
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ "${query.substring(0, 30)}..." - 响应长度: ${result.reply.length} 字符`);
          chartSuccessCount++;
        } else {
          console.log(`❌ "${query.substring(0, 30)}..." - 查询失败: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ "${query.substring(0, 30)}..." - 错误: ${error.message}`);
      }
    }

    console.log(`\n📊 图表规则测试完成: ${chartSuccessCount}/${chartTotalCount} 成功\n`);

    // 总结
    const totalSuccess = successCount + advancedSuccessCount + chartSuccessCount;
    const totalTests = totalCount + advancedTotalCount + chartTotalCount;
    
    console.log('🎉 所有规则测试完成！');
    console.log('\n📋 测试总结:');
    console.log(`✅ 基础查询规则: ${successCount}/${totalCount} 成功`);
    console.log(`✅ 高级分析规则: ${advancedSuccessCount}/${advancedTotalCount} 成功`);
    console.log(`✅ 图表规则: ${chartSuccessCount}/${chartTotalCount} 成功`);
    console.log(`📊 总体成功率: ${totalSuccess}/${totalTests} (${((totalSuccess/totalTests)*100).toFixed(1)}%)`);
    
    if (totalSuccess === totalTests) {
      console.log('\n🎊 所有规则测试通过！IQE智能助手功能完全正常！');
    } else {
      console.log('\n⚠️ 部分规则需要进一步优化');
    }

  } catch (error) {
    console.error('❌ 测试过程出错:', error.message);
  }
}

// 运行测试
testAllRules();
