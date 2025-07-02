/**
 * IQE AI Prompt 测试脚本
 * 测试优化后的专业prompt效果
 */

import DeepSeekService from './backend/src/services/DeepSeekService.js';
import { IQE_AI_SCENARIOS, selectOptimalScenario } from './backend/src/config/iqe-ai-scenarios.js';

// 初始化DeepSeek服务
const deepSeekService = new DeepSeekService();

// 测试问题集
const testQuestions = [
  {
    question: "分析当前库存状态",
    expectedScenario: "material_inventory",
    description: "库存监控场景测试"
  },
  {
    question: "查看质量检测报告",
    expectedScenario: "quality_inspection", 
    description: "质量检测场景测试"
  },
  {
    question: "生产线效率如何",
    expectedScenario: "production_monitoring",
    description: "生产监控场景测试"
  },
  {
    question: "整体质量绩效评估",
    expectedScenario: "comprehensive_quality",
    description: "综合质量场景测试"
  },
  {
    question: "你好，请介绍一下你的功能",
    expectedScenario: "comprehensive_quality",
    description: "通用介绍测试"
  }
];

// 模拟数据
const mockContextData = {
  inventory: [
    { factory: "工厂A", material: "电阻", quantity: 1000, status: "正常" },
    { factory: "工厂B", material: "电容", quantity: 500, status: "风险" }
  ],
  quality: [
    { testId: "T001", result: "PASS", defectRate: 0.02 },
    { testId: "T002", result: "FAIL", defectRate: 0.15 }
  ],
  production: [
    { factory: "工厂A", efficiency: 0.85, output: 2000 },
    { factory: "工厂B", efficiency: 0.78, output: 1800 }
  ]
};

async function testIQEAIPrompt() {
  console.log('🎯 开始测试IQE AI Prompt优化效果\n');
  
  try {
    // 1. 测试DeepSeek服务健康状态
    console.log('1️⃣ 测试DeepSeek服务健康状态...');
    const healthCheck = await deepSeekService.healthCheck();
    console.log('健康检查结果:', healthCheck);
    
    if (healthCheck.status !== 'healthy') {
      console.log('❌ DeepSeek服务不可用，跳过测试');
      return;
    }
    
    console.log('✅ DeepSeek服务正常\n');
    
    // 2. 测试场景选择逻辑
    console.log('2️⃣ 测试智能场景选择...');
    for (const test of testQuestions) {
      const keywords = test.question.split(' ');
      const selectedScenario = selectOptimalScenario(test.expectedScenario, keywords);
      
      console.log(`问题: "${test.question}"`);
      console.log(`预期场景: ${test.expectedScenario}`);
      console.log(`选择场景: ${selectedScenario.id}`);
      console.log(`场景名称: ${selectedScenario.name}`);
      console.log(`匹配结果: ${selectedScenario.id === test.expectedScenario ? '✅ 正确' : '⚠️ 不匹配'}\n`);
    }
    
    // 3. 测试专业prompt效果
    console.log('3️⃣ 测试专业prompt回答效果...');
    
    for (let i = 0; i < Math.min(3, testQuestions.length); i++) {
      const test = testQuestions[i];
      console.log(`\n📋 测试 ${i + 1}: ${test.description}`);
      console.log(`问题: "${test.question}"`);
      
      try {
        const startTime = Date.now();
        
        // 使用优化后的专业prompt
        const response = await deepSeekService.answerQuestion(test.question, mockContextData);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`⏱️ 响应时间: ${duration}ms`);
        console.log(`📝 回答长度: ${response.length}字符`);
        console.log(`🎯 专业回答预览:`);
        console.log('─'.repeat(50));
        console.log(response.substring(0, 300) + (response.length > 300 ? '...' : ''));
        console.log('─'.repeat(50));
        
        // 分析回答质量
        const qualityAnalysis = analyzeResponseQuality(response, test.expectedScenario);
        console.log(`📊 质量分析:`, qualityAnalysis);
        
      } catch (error) {
        console.log(`❌ 测试失败: ${error.message}`);
      }
      
      // 避免API调用过于频繁
      if (i < testQuestions.length - 1) {
        console.log('⏳ 等待2秒避免API限制...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // 4. 测试查询分析功能
    console.log('\n4️⃣ 测试查询分析功能...');
    
    try {
      const analysisResult = await deepSeekService.analyzeQuery("分析工厂A的库存风险状况");
      console.log('🔍 查询分析结果:');
      console.log(JSON.stringify(analysisResult, null, 2));
    } catch (error) {
      console.log(`❌ 查询分析测试失败: ${error.message}`);
    }
    
    console.log('\n🎉 IQE AI Prompt测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

// 分析回答质量
function analyzeResponseQuality(response, expectedScenario) {
  const analysis = {
    hasProfessionalTerms: false,
    hasStructuredFormat: false,
    hasDataReference: false,
    hasActionableAdvice: false,
    hasQualityFocus: false,
    overallScore: 0
  };
  
  // 检查专业术语
  const professionalTerms = ['质量', '检测', '库存', '生产', '效率', '风险', '分析', '监控'];
  analysis.hasProfessionalTerms = professionalTerms.some(term => response.includes(term));
  
  // 检查结构化格式
  analysis.hasStructuredFormat = response.includes('#') || response.includes('##') || response.includes('*');
  
  // 检查数据引用
  analysis.hasDataReference = response.includes('数据') || response.includes('指标') || response.includes('%');
  
  // 检查可执行建议
  analysis.hasActionableAdvice = response.includes('建议') || response.includes('应该') || response.includes('需要');
  
  // 检查质量焦点
  analysis.hasQualityFocus = response.includes('IQE') || response.includes('质量管理') || response.includes('质量体系');
  
  // 计算总分
  const criteria = [
    analysis.hasProfessionalTerms,
    analysis.hasStructuredFormat, 
    analysis.hasDataReference,
    analysis.hasActionableAdvice,
    analysis.hasQualityFocus
  ];
  
  analysis.overallScore = criteria.filter(Boolean).length / criteria.length * 100;
  
  return analysis;
}

// 运行测试
console.log('🚀 启动IQE AI Prompt测试...\n');
testIQEAIPrompt().catch(console.error);
