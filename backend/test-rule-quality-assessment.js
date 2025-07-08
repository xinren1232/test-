/**
 * 规则质量评估测试 - 不仅测试功能，更要评估规则设计质量和问答效果
 */

import { intelligentIntentService } from './src/services/intelligentIntentService.js';

// 规则质量评估标准
const QUALITY_CRITERIA = {
  // 数据质量评估
  DATA_QUALITY: {
    MIN_RECORDS: 5,        // 最少返回记录数
    MAX_RECORDS: 50,       // 最多返回记录数
    REQUIRED_FIELDS: 3,    // 必需字段数量
  },
  
  // 响应质量评估
  RESPONSE_QUALITY: {
    MIN_LENGTH: 100,       // 最少字符数
    MAX_LENGTH: 5000,      // 最多字符数
    STRUCTURED_FORMAT: true, // 是否结构化格式
  },
  
  // 业务逻辑评估
  BUSINESS_LOGIC: {
    RELEVANT_DATA: true,   // 数据是否相关
    ACTIONABLE_INSIGHTS: true, // 是否提供可操作的洞察
    COMPLETE_ANSWER: true, // 答案是否完整
  }
};

// 测试用例设计 - 涵盖各种业务场景
const TEST_CASES = [
  {
    category: '库存管理',
    queries: [
      {
        query: '库存总量查询',
        expectedType: 'inventory_summary',
        businessGoal: '了解整体库存状况',
        qualityChecks: ['数据完整性', '统计准确性', '展示清晰度']
      },
      {
        query: '查询风险状态的库存',
        expectedType: 'risk_analysis',
        businessGoal: '识别风险物料，支持决策',
        qualityChecks: ['风险识别准确性', '优先级排序', '处理建议']
      },
      {
        query: '深圳工厂的库存情况',
        expectedType: 'location_specific',
        businessGoal: '特定工厂库存管理',
        qualityChecks: ['地理位置准确性', '数据筛选正确性', '本地化信息']
      }
    ]
  },
  {
    category: '质量测试',
    queries: [
      {
        query: '统计测试结果',
        expectedType: 'test_statistics',
        businessGoal: '了解产品质量状况',
        qualityChecks: ['统计维度完整性', '趋势分析', '质量评估']
      },
      {
        query: '查询FAIL的测试记录',
        expectedType: 'failure_analysis',
        businessGoal: '识别质量问题，改进流程',
        qualityChecks: ['问题识别准确性', '根因分析', '改进建议']
      }
    ]
  },
  {
    category: '供应商管理',
    queries: [
      {
        query: '供应商质量对比',
        expectedType: 'supplier_comparison',
        businessGoal: '评估供应商表现，优化供应链',
        qualityChecks: ['对比维度合理性', '评估指标完整性', '决策支持']
      },
      {
        query: 'BOE供应商的物料情况',
        expectedType: 'supplier_specific',
        businessGoal: '特定供应商管理',
        qualityChecks: ['供应商识别准确性', '物料关联正确性', '表现评估']
      }
    ]
  }
];

/**
 * 评估数据质量
 */
function assessDataQuality(results, query) {
  const assessment = {
    score: 0,
    maxScore: 100,
    details: []
  };

  // 1. 记录数量评估 (30分)
  if (results && results.length > 0) {
    if (results.length >= QUALITY_CRITERIA.DATA_QUALITY.MIN_RECORDS) {
      assessment.score += 20;
      assessment.details.push(`✅ 数据量充足: ${results.length}条记录`);
    } else {
      assessment.details.push(`⚠️ 数据量偏少: ${results.length}条记录`);
    }
    
    if (results.length <= QUALITY_CRITERIA.DATA_QUALITY.MAX_RECORDS) {
      assessment.score += 10;
      assessment.details.push(`✅ 数据量合理，未过载`);
    } else {
      assessment.details.push(`⚠️ 数据量过多，可能影响用户体验`);
    }
  } else {
    assessment.details.push(`❌ 无数据返回`);
  }

  // 2. 字段完整性评估 (30分)
  if (results && results.length > 0) {
    const firstRecord = results[0];
    const fieldCount = Object.keys(firstRecord).length;
    
    if (fieldCount >= QUALITY_CRITERIA.DATA_QUALITY.REQUIRED_FIELDS) {
      assessment.score += 30;
      assessment.details.push(`✅ 字段完整: ${fieldCount}个字段`);
    } else {
      assessment.score += 15;
      assessment.details.push(`⚠️ 字段较少: ${fieldCount}个字段`);
    }
  }

  // 3. 数据相关性评估 (40分)
  if (results && results.length > 0) {
    // 检查数据是否与查询相关
    const queryLower = query.toLowerCase();
    let relevanceScore = 0;
    
    // 检查关键词匹配
    if (queryLower.includes('风险') && results.some(r => r.状态 === '风险' || r.status === '风险')) {
      relevanceScore += 20;
      assessment.details.push(`✅ 数据与查询高度相关 - 风险状态匹配`);
    } else if (queryLower.includes('测试') && results.some(r => r.测试结果 || r.test_result)) {
      relevanceScore += 20;
      assessment.details.push(`✅ 数据与查询高度相关 - 测试数据匹配`);
    } else if (queryLower.includes('供应商') && results.some(r => r.供应商 || r.supplier_name)) {
      relevanceScore += 20;
      assessment.details.push(`✅ 数据与查询高度相关 - 供应商数据匹配`);
    } else {
      relevanceScore += 10;
      assessment.details.push(`⚠️ 数据相关性一般`);
    }
    
    // 检查数据多样性
    const uniqueValues = new Set();
    results.forEach(record => {
      Object.values(record).forEach(value => {
        if (value && typeof value === 'string') {
          uniqueValues.add(value);
        }
      });
    });
    
    if (uniqueValues.size > results.length) {
      relevanceScore += 20;
      assessment.details.push(`✅ 数据多样性良好`);
    } else {
      relevanceScore += 10;
      assessment.details.push(`⚠️ 数据多样性一般`);
    }
    
    assessment.score += relevanceScore;
  }

  return assessment;
}

/**
 * 评估响应质量
 */
function assessResponseQuality(responseData, query) {
  const assessment = {
    score: 0,
    maxScore: 100,
    details: []
  };

  // 1. 响应长度评估 (20分)
  const responseLength = responseData.length;
  if (responseLength >= QUALITY_CRITERIA.RESPONSE_QUALITY.MIN_LENGTH) {
    if (responseLength <= QUALITY_CRITERIA.RESPONSE_QUALITY.MAX_LENGTH) {
      assessment.score += 20;
      assessment.details.push(`✅ 响应长度适中: ${responseLength}字符`);
    } else {
      assessment.score += 10;
      assessment.details.push(`⚠️ 响应过长: ${responseLength}字符`);
    }
  } else {
    assessment.details.push(`❌ 响应过短: ${responseLength}字符`);
  }

  // 2. 格式结构评估 (30分)
  if (responseData.includes('**') && responseData.includes('📊')) {
    assessment.score += 15;
    assessment.details.push(`✅ 使用了结构化格式和图标`);
  }
  
  if (responseData.includes('条记录') || responseData.includes('查询结果')) {
    assessment.score += 15;
    assessment.details.push(`✅ 包含统计信息`);
  }

  // 3. 信息完整性评估 (30分)
  const infoCompleteness = [];
  if (responseData.includes('物料名称') || responseData.includes('material')) {
    infoCompleteness.push('物料信息');
  }
  if (responseData.includes('供应商') || responseData.includes('supplier')) {
    infoCompleteness.push('供应商信息');
  }
  if (responseData.includes('状态') || responseData.includes('status')) {
    infoCompleteness.push('状态信息');
  }
  if (responseData.includes('数量') || responseData.includes('quantity')) {
    infoCompleteness.push('数量信息');
  }
  
  assessment.score += Math.min(30, infoCompleteness.length * 7.5);
  assessment.details.push(`✅ 信息维度: ${infoCompleteness.join(', ')}`);

  // 4. 可读性评估 (20分)
  const lines = responseData.split('\n').filter(line => line.trim());
  if (lines.length > 1) {
    assessment.score += 10;
    assessment.details.push(`✅ 多行格式，易于阅读`);
  }
  
  if (responseData.includes('|')) {
    assessment.score += 10;
    assessment.details.push(`✅ 使用分隔符，结构清晰`);
  }

  return assessment;
}

/**
 * 评估业务价值
 */
function assessBusinessValue(result, testCase) {
  const assessment = {
    score: 0,
    maxScore: 100,
    details: []
  };

  // 1. 业务目标匹配度 (40分)
  const businessGoal = testCase.businessGoal;
  if (businessGoal.includes('决策') && result.results && result.results.length > 0) {
    assessment.score += 20;
    assessment.details.push(`✅ 提供决策支持数据`);
  }
  
  if (businessGoal.includes('管理') && result.data.includes('状态')) {
    assessment.score += 20;
    assessment.details.push(`✅ 支持管理需求`);
  }

  // 2. 可操作性评估 (30分)
  if (result.results && result.results.some(r => r.状态 === '风险' || r.status === '风险')) {
    assessment.score += 15;
    assessment.details.push(`✅ 识别出需要关注的风险项`);
  }
  
  if (result.results && result.results.length > 5) {
    assessment.score += 15;
    assessment.details.push(`✅ 提供足够的数据样本用于分析`);
  }

  // 3. 洞察深度评估 (30分)
  if (result.data.includes('共') && result.data.includes('条记录')) {
    assessment.score += 10;
    assessment.details.push(`✅ 提供统计概览`);
  }
  
  if (result.results && result.results.length > 0) {
    const uniqueSuppliers = new Set(result.results.map(r => r.供应商 || r.supplier_name));
    if (uniqueSuppliers.size > 1) {
      assessment.score += 10;
      assessment.details.push(`✅ 涵盖多个供应商，便于对比分析`);
    }
    
    const uniqueStatuses = new Set(result.results.map(r => r.状态 || r.status));
    if (uniqueStatuses.size > 1) {
      assessment.score += 10;
      assessment.details.push(`✅ 包含多种状态，便于风险识别`);
    }
  }

  return assessment;
}

/**
 * 执行规则质量评估测试
 */
const runQualityAssessment = async () => {
  console.log('🔍 开始规则质量评估测试...\n');
  
  try {
    // 初始化服务
    await intelligentIntentService.initialize();
    
    const overallResults = {
      totalTests: 0,
      passedTests: 0,
      categories: {}
    };

    for (const category of TEST_CASES) {
      console.log(`\n📋 测试类别: ${category.category}`);
      console.log('=' .repeat(50));
      
      const categoryResults = {
        tests: [],
        averageScore: 0
      };

      for (const testCase of category.queries) {
        console.log(`\n🧪 测试查询: "${testCase.query}"`);
        console.log(`🎯 业务目标: ${testCase.businessGoal}`);
        
        overallResults.totalTests++;
        
        try {
          // 执行查询
          const result = await intelligentIntentService.processQuery(testCase.query);
          
          // 评估各个维度
          const dataQuality = assessDataQuality(result.results, testCase.query);
          const responseQuality = assessResponseQuality(result.data, testCase.query);
          const businessValue = assessBusinessValue(result, testCase);
          
          const totalScore = Math.round(
            (dataQuality.score + responseQuality.score + businessValue.score) / 3
          );
          
          const testResult = {
            query: testCase.query,
            businessGoal: testCase.businessGoal,
            totalScore,
            dataQuality,
            responseQuality,
            businessValue,
            passed: totalScore >= 70
          };
          
          categoryResults.tests.push(testResult);
          
          if (testResult.passed) {
            overallResults.passedTests++;
            console.log(`✅ 测试通过 - 总分: ${totalScore}/100`);
          } else {
            console.log(`❌ 测试未通过 - 总分: ${totalScore}/100`);
          }
          
          // 详细评估报告
          console.log(`\n📊 详细评估:`);
          console.log(`  数据质量: ${dataQuality.score}/100`);
          dataQuality.details.forEach(detail => console.log(`    ${detail}`));
          
          console.log(`  响应质量: ${responseQuality.score}/100`);
          responseQuality.details.forEach(detail => console.log(`    ${detail}`));
          
          console.log(`  业务价值: ${businessValue.score}/100`);
          businessValue.details.forEach(detail => console.log(`    ${detail}`));
          
        } catch (error) {
          console.log(`❌ 查询执行失败: ${error.message}`);
          categoryResults.tests.push({
            query: testCase.query,
            error: error.message,
            passed: false,
            totalScore: 0
          });
        }
      }
      
      // 计算类别平均分
      const validTests = categoryResults.tests.filter(t => !t.error);
      if (validTests.length > 0) {
        categoryResults.averageScore = Math.round(
          validTests.reduce((sum, test) => sum + test.totalScore, 0) / validTests.length
        );
      }
      
      overallResults.categories[category.category] = categoryResults;
      
      console.log(`\n📈 ${category.category} 类别平均分: ${categoryResults.averageScore}/100`);
    }

    // 生成总体报告
    console.log('\n' + '='.repeat(60));
    console.log('📋 规则质量评估总体报告');
    console.log('='.repeat(60));
    
    const passRate = Math.round((overallResults.passedTests / overallResults.totalTests) * 100);
    console.log(`📊 测试通过率: ${overallResults.passedTests}/${overallResults.totalTests} (${passRate}%)`);
    
    Object.entries(overallResults.categories).forEach(([category, results]) => {
      console.log(`📋 ${category}: ${results.averageScore}/100`);
    });
    
    // 改进建议
    console.log('\n💡 改进建议:');
    if (passRate < 80) {
      console.log('  - 需要优化规则设计，提高数据相关性');
      console.log('  - 改进响应格式，增强可读性');
      console.log('  - 加强业务逻辑，提供更多可操作的洞察');
    } else {
      console.log('  - 规则质量良好，可考虑增加更多高级分析功能');
      console.log('  - 可以添加趋势分析和预测功能');
    }
    
    console.log('\n🎉 规则质量评估完成！');
    
  } catch (error) {
    console.error(`❌ 评估过程出错: ${error.message}`);
  }
};

runQualityAssessment().catch(console.error);
