import initializeDatabase from './src/models/index.js';

async function fixFactoryRulePriority() {
  console.log('🔧 修复工厂查询规则优先级和SQL模板...\n');
  
  try {
    const db = await initializeDatabase();
    const NlpIntentRule = db.NlpIntentRule;
    
    // 1. 更新工厂库存查询规则
    console.log('📝 更新工厂库存查询规则...');
    const factoryRule = await NlpIntentRule.findOne({
      where: { intent_name: '工厂库存查询' }
    });
    
    if (factoryRule) {
      await factoryRule.update({
        priority: 25, // 提高优先级，超过供应商库存查询的20
        trigger_words: JSON.stringify(['工厂', '库存', '查询']),
        action_target: `
      SELECT
        material_name as 物料名称,
        supplier_name as 供应商,
        batch_code as 批次号,
        quantity as 库存数量,
        storage_location as 存储位置,
        status as 状态,
        risk_level as 风险等级,
        inbound_time as 入库时间
      FROM inventory
      WHERE storage_location LIKE CONCAT('%', ?, '%')
      ORDER BY inbound_time DESC
      LIMIT 20
    `
      });
      console.log('✅ 工厂库存查询规则已更新');
      console.log(`   - 优先级: ${factoryRule.priority} -> 25`);
      console.log(`   - 触发词: ${factoryRule.trigger_words}`);
    } else {
      console.log('❌ 未找到工厂库存查询规则');
    }
    
    // 2. 检查供应商库存查询规则
    console.log('\n📝 检查供应商库存查询规则...');
    const supplierRule = await NlpIntentRule.findOne({
      where: { intent_name: '供应商库存查询' }
    });
    
    if (supplierRule) {
      console.log(`✅ 供应商库存查询规则优先级: ${supplierRule.priority}`);
      console.log(`   - 触发词: ${supplierRule.trigger_words}`);
    }
    
    // 3. 验证更新结果
    console.log('\n🔍 验证更新结果...');
    const updatedFactoryRule = await NlpIntentRule.findOne({
      where: { intent_name: '工厂库存查询' }
    });
    
    if (updatedFactoryRule) {
      console.log(`✅ 验证成功:`);
      console.log(`   - 规则名称: ${updatedFactoryRule.intent_name}`);
      console.log(`   - 优先级: ${updatedFactoryRule.priority}`);
      console.log(`   - 状态: ${updatedFactoryRule.status}`);
      console.log(`   - 触发词: ${updatedFactoryRule.trigger_words}`);
    }
    
    console.log('\n🎉 规则修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

fixFactoryRulePriority();
