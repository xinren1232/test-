/**
 * 调试工厂查询
 */
import { intelligentIntentService } from './src/services/intelligentIntentService.js';

async function debugFactoryQuery() {
  console.log('🔍 调试工厂查询...\n');
  
  const service = intelligentIntentService;
  const testQuery = '深圳工厂的库存情况';
  
  try {
    // 1. 检查规则匹配
    console.log('1️⃣ 检查规则匹配...');
    const rules = service.rules;
    const factoryRule = rules.find(rule => rule.intent_name === 'factory_inventory_query');
    
    if (factoryRule) {
      console.log('✅ 找到工厂库存查询规则');
      console.log('📋 规则详情:');
      console.log('  - 名称:', factoryRule.intent_name);
      console.log('  - 描述:', factoryRule.description);
      console.log('  - 动作类型:', factoryRule.action_type);
      console.log('  - 触发词:', factoryRule.trigger_words);
      console.log('  - 参数:', factoryRule.parameters);
      console.log('  - SQL模板:', factoryRule.action_target.substring(0, 200) + '...');
    } else {
      console.log('❌ 未找到工厂库存查询规则');
      return;
    }
    
    // 2. 检查参数提取
    console.log('\n2️⃣ 检查参数提取...');
    const params = service.extractParameters(testQuery, factoryRule.parameters);
    console.log('📋 提取的参数:', params);
    
    // 3. 检查SQL生成
    console.log('\n3️⃣ 检查SQL生成...');
    const sqlTemplate = factoryRule.action_target;
    console.log('📄 原始SQL模板:', sqlTemplate);
    
    // 手动替换参数
    let processedSql = sqlTemplate;
    if (params.factory) {
      processedSql = processedSql.replace(/CONCAT\('%', \?, '%'\)/g, `'%${params.factory}%'`);
    }
    console.log('📄 处理后的SQL:', processedSql);
    
    // 4. 执行完整查询
    console.log('\n4️⃣ 执行完整查询...');
    const result = await service.processQuery(testQuery);
    console.log('📊 查询结果:');
    console.log('  - 成功:', result.success);
    console.log('  - 数据源:', result.source);
    console.log('  - 结果数量:', result.results?.length || 0);
    console.log('  - 响应内容:', result.data?.substring(0, 200) + '...');
    
  } catch (error) {
    console.log('❌ 调试失败:', error.message);
    console.log('🔍 错误详情:', error);
  }
}

debugFactoryQuery().catch(console.error);
