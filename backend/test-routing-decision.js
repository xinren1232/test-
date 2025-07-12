import OptimizedQueryProcessor from './src/services/OptimizedQueryProcessor.js';

async function testRoutingDecision() {
  try {
    console.log('🧪 测试路由决策差异...\n');
    
    const processor = new OptimizedQueryProcessor();
    await processor.initialize();
    
    const query = '供应商对比分析';
    
    // 1. 直接调用时的参数（空对象）
    console.log('📋 1. 直接调用参数（空对象）:');
    const directOptions = {};
    const directDecision = processor.makeRoutingDecision(query, directOptions);
    console.log(`  🎯 路由决策: ${directDecision.strategy}`);
    console.log(`  📝 原因: ${directDecision.reason}`);
    console.log(`  🎲 置信度: ${directDecision.confidence}`);
    
    // 2. API调用时的参数
    console.log('\n📋 2. API调用参数:');
    const apiOptions = {
      scenario: 'auto',
      analysisMode: 'auto',
      requireDataAnalysis: false
    };
    const apiDecision = processor.makeRoutingDecision(query, apiOptions);
    console.log(`  🎯 路由决策: ${apiDecision.strategy}`);
    console.log(`  📝 原因: ${apiDecision.reason}`);
    console.log(`  🎲 置信度: ${apiDecision.confidence}`);
    
    // 3. 比较结果
    console.log('\n📊 决策比较:');
    if (directDecision.strategy === apiDecision.strategy) {
      console.log('✅ 路由决策一致');
    } else {
      console.log('❌ 路由决策不一致');
      console.log(`  直接调用: ${directDecision.strategy}`);
      console.log(`  API调用: ${apiDecision.strategy}`);
    }
    
    // 4. 测试其他参数组合
    console.log('\n📋 3. 测试其他参数组合:');
    const testCases = [
      { name: '空对象', options: {} },
      { name: '只有scenario', options: { scenario: 'auto' } },
      { name: '只有analysisMode', options: { analysisMode: 'auto' } },
      { name: '完整API参数', options: { scenario: 'auto', analysisMode: 'auto', requireDataAnalysis: false } },
      { name: '强制规则模式', options: { analysisMode: 'rule-based' } }
    ];
    
    for (const testCase of testCases) {
      const decision = processor.makeRoutingDecision(query, testCase.options);
      console.log(`  ${testCase.name}: ${decision.strategy} (${decision.reason})`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('🔍 错误详情:', error.stack);
  }
}

testRoutingDecision();
