import IntelligentQASystem from './src/services/intelligentQASystem.js';

async function testIntelligentQASystem() {
  console.log('🧪 测试智能问答系统...\n');
  
  const qaSystem = new IntelligentQASystem();
  
  // 测试问题列表 - 基于真实数据
  const testQuestions = [
    // 供应商相关
    'BOE供应商有哪些物料',
    '聚龙供应商的情况',
    '天马的库存状态',
    
    // 物料相关
    'LCD显示屏有哪些供应商',
    '电池盖的供应商情况',
    'OLED显示屏的库存分布',
    
    // 工厂相关
    '深圳工厂的情况',
    '重庆工厂有哪些物料',
    
    // 状态相关
    '风险状态的物料有哪些',
    '正常状态的库存情况',
    
    // 综合分析
    '供应商排行分析',
    '物料库存统计'
  ];
  
  try {
    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      console.log(`\n${i + 1}. 问题: "${question}"`);
      console.log('=' .repeat(60));
      
      const result = await qaSystem.processQuestion(question);
      
      if (result.success) {
        console.log('✅ 处理成功');
        console.log('问题类型:', result.analysis.type);
        console.log('识别实体:', JSON.stringify(result.analysis.entities, null, 2));
        console.log('选择模板:', result.template);
        console.log('意图识别:', result.analysis.intent);
        console.log('\n📋 回答内容:');
        console.log(result.response);
      } else {
        console.log('❌ 处理失败');
        console.log('错误信息:', result.error);
        console.log('回答内容:', result.response);
      }
      
      // 添加延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✅ 所有测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await qaSystem.close();
  }
}

testIntelligentQASystem();
