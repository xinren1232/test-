/**
 * 测试AI增强系统
 * 验证AI思维链分析的完整流程
 */

import AIEnhancedService from './backend/src/services/AIEnhancedService.js';
import DeepSeekService from './backend/src/services/DeepSeekService.js';
import AIDataQueryAgent from './backend/src/services/AIDataQueryAgent.js';

// 测试用例
const testQueries = [
  // 基础查询（应该使用规则处理）
  {
    query: "查询深圳工厂的库存",
    expectedType: "rule_based",
    description: "基础查询测试"
  },
  
  // 复杂分析查询（应该使用AI增强）
  {
    query: "分析深圳工厂OLED显示屏的整体质量状况，包括库存风险、生产质量和测试表现",
    expectedType: "ai_enhanced", 
    description: "复杂质量分析测试"
  },
  
  {
    query: "评估BOE供应商的质量表现，并与其他供应商进行对比分析",
    expectedType: "ai_enhanced",
    description: "供应商对比分析测试"
  },
  
  {
    query: "为什么最近的生产不良率有所上升？请分析原因并提供改进建议",
    expectedType: "ai_enhanced",
    description: "原因分析和建议测试"
  }
];

// 测试AI增强服务
async function testAIEnhancedService() {
  console.log('🧪 开始测试AI增强系统');
  console.log('=' .repeat(60));
  
  const aiService = new AIEnhancedService();
  
  // 1. 健康检查
  console.log('🔍 1. 健康检查');
  try {
    const health = await aiService.healthCheck();
    console.log('✅ 健康状态:', health.status);
    console.log('   DeepSeek:', health.deepSeek?.status || 'unknown');
    console.log('   查询代理:', health.queryAgent?.status || 'unknown');
    console.log('   可用工具数:', health.queryAgent?.toolsCount || 0);
  } catch (error) {
    console.log('❌ 健康检查失败:', error.message);
    return;
  }
  
  console.log();
  
  // 2. 测试查询处理
  console.log('🔍 2. 查询处理测试');
  
  for (let i = 0; i < testQueries.length; i++) {
    const testCase = testQueries[i];
    console.log(`\n--- 测试 ${i + 1}: ${testCase.description} ---`);
    console.log(`查询: "${testCase.query}"`);
    
    try {
      const startTime = Date.now();
      const result = await aiService.processComplexQuery(testCase.query);
      const endTime = Date.now();
      
      console.log(`✅ 处理成功 (${endTime - startTime}ms)`);
      console.log(`   类型: ${result.type}`);
      console.log(`   流式: ${result.isStreaming ? '是' : '否'}`);
      
      if (result.type === 'ai_enhanced') {
        console.log(`   分析计划: ${result.analysis?.problemType || '未知'}`);
        console.log(`   查询步骤: ${result.analysis?.queryPlan?.steps?.length || 0}个`);
        console.log(`   查询结果: ${Object.keys(result.queryResults || {}).length}个`);
        
        // 如果是流式响应，读取一部分内容
        if (result.isStreaming && result.content) {
          console.log('   AI分析预览:');
          try {
            const reader = result.content.getReader();
            let previewContent = '';
            let readCount = 0;
            
            while (readCount < 5) { // 只读取前5个chunk
              const { done, value } = await reader.read();
              if (done) break;
              
              previewContent += value;
              readCount++;
            }
            
            console.log(`     "${previewContent.substring(0, 100)}..."`);
          } catch (streamError) {
            console.log('     流式内容读取失败:', streamError.message);
          }
        }
      } else {
        console.log(`   内容长度: ${result.content?.length || 0}字符`);
      }
      
      // 验证预期类型
      if (result.type === testCase.expectedType) {
        console.log('✅ 类型匹配预期');
      } else {
        console.log(`⚠️ 类型不匹配 (预期: ${testCase.expectedType}, 实际: ${result.type})`);
      }
      
    } catch (error) {
      console.log('❌ 处理失败:', error.message);
    }
  }
}

// 测试DeepSeek服务
async function testDeepSeekService() {
  console.log('\n🔍 3. DeepSeek服务测试');
  
  const deepSeekService = new DeepSeekService();
  
  // 简单查询测试
  try {
    console.log('测试简单查询...');
    const response = await deepSeekService.simpleQuery('你好，请简单介绍一下你的功能。');
    console.log('✅ 简单查询成功');
    console.log(`   响应长度: ${response.length}字符`);
    console.log(`   响应预览: "${response.substring(0, 100)}..."`);
  } catch (error) {
    console.log('❌ 简单查询失败:', error.message);
  }
  
  // 查询分析测试
  try {
    console.log('\n测试查询分析...');
    const analysis = await deepSeekService.analyzeQuery('分析深圳工厂的质量状况');
    console.log('✅ 查询分析成功');
    console.log(`   问题类型: ${analysis.problemType || '未知'}`);
    console.log(`   查询步骤: ${analysis.queryPlan?.steps?.length || 0}个`);
  } catch (error) {
    console.log('❌ 查询分析失败:', error.message);
  }
}

// 测试数据查询代理
async function testDataQueryAgent() {
  console.log('\n🔍 4. 数据查询代理测试');
  
  const queryAgent = new AIDataQueryAgent();
  
  // 获取可用工具
  const tools = queryAgent.getAvailableTools();
  console.log(`✅ 可用工具: ${tools.length}个`);
  
  // 测试几个基础查询
  const testTools = [
    { name: 'getOverallSummary', params: {} },
    { name: 'queryRiskInventory', params: {} },
    { name: 'queryInventoryByFactory', params: { factory: '深圳工厂' } }
  ];
  
  for (const test of testTools) {
    try {
      console.log(`\n测试工具: ${test.name}`);
      const result = await queryAgent.executeQuery(test.name, test.params);
      
      if (result.success) {
        console.log('✅ 查询成功');
        console.log(`   查询语句: "${result.queryText}"`);
        console.log(`   数据类型: ${result.structuredData?.type || '未知'}`);
        console.log(`   条目数量: ${result.structuredData?.items?.length || 0}`);
      } else {
        console.log('❌ 查询失败:', result.error);
      }
    } catch (error) {
      console.log('❌ 工具执行失败:', error.message);
    }
  }
}

// 运行所有测试
async function runAllTests() {
  try {
    await testAIEnhancedService();
    await testDeepSeekService();
    await testDataQueryAgent();
    
    console.log('\n🎉 测试完成');
    console.log('=' .repeat(60));
    console.log('💡 如果所有测试都通过，说明AI增强系统已经准备就绪！');
    console.log('📝 接下来可以：');
    console.log('   1. 启动后端服务');
    console.log('   2. 在前端添加AI增强查询按钮');
    console.log('   3. 测试完整的用户体验');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { testAIEnhancedService, testDeepSeekService, testDataQueryAgent };
