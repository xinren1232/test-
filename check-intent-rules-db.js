/**
 * 检查数据库中的智能意图规则
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Flameaway3.',
  database: 'iQE_inspection_db',
  charset: 'utf8mb4'
};

const checkDatabaseRules = async () => {
  console.log('🔍 检查数据库中的智能意图规则...');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 查询智能意图规则表
    const [rules] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        description,
        action_type,
        action_target,
        trigger_words,
        priority,
        is_active,
        created_at
      FROM intelligent_intent_rules 
      ORDER BY priority DESC, created_at DESC
    `);
    
    console.log(`\n📊 数据库中共有 ${rules.length} 条智能意图规则:`);
    console.log('='.repeat(80));
    
    if (rules.length === 0) {
      console.log('❌ 数据库中没有智能意图规则！');
      console.log('💡 这解释了为什么查询没有使用智能意图服务');
      
      // 建议插入我们的优化规则
      console.log('\n🔧 建议解决方案:');
      console.log('1. 将我们创建的5个优化规则插入到数据库中');
      console.log('2. 确保规则的 is_active = 1');
      console.log('3. 重启后端服务以加载新规则');
      
      return false;
    }
    
    // 显示规则详情
    rules.forEach((rule, index) => {
      console.log(`\n${index + 1}. ${rule.intent_name} (优先级: ${rule.priority})`);
      console.log(`   📝 描述: ${rule.description}`);
      console.log(`   🎯 动作类型: ${rule.action_type}`);
      console.log(`   🔑 触发词: ${rule.trigger_words}`);
      console.log(`   ✅ 状态: ${rule.is_active ? '激活' : '禁用'}`);
      console.log(`   📅 创建时间: ${rule.created_at}`);
    });
    
    // 检查是否有我们需要的规则类型
    const ruleTypes = rules.map(r => r.intent_name);
    const requiredRules = [
      'factory_inventory_query',
      'supplier_material_query', 
      'material_inventory_query',
      'status_inventory_query',
      'comprehensive_inventory_query'
    ];
    
    console.log('\n🎯 规则覆盖检查:');
    console.log('='.repeat(50));
    
    const missingRules = requiredRules.filter(rule => !ruleTypes.includes(rule));
    const existingRules = requiredRules.filter(rule => ruleTypes.includes(rule));
    
    if (existingRules.length > 0) {
      console.log(`✅ 已存在规则 (${existingRules.length}/${requiredRules.length}):`);
      existingRules.forEach(rule => console.log(`   - ${rule}`));
    }
    
    if (missingRules.length > 0) {
      console.log(`❌ 缺失规则 (${missingRules.length}/${requiredRules.length}):`);
      missingRules.forEach(rule => console.log(`   - ${rule}`));
      
      console.log('\n💡 需要添加缺失的规则到数据库');
      return false;
    }
    
    console.log('\n✅ 所有必需的规则都存在于数据库中');
    return true;
    
  } catch (error) {
    console.error('❌ 检查数据库规则失败:', error.message);
    return false;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
};

// 运行检查
checkDatabaseRules().then(success => {
  if (!success) {
    console.log('\n🚨 发现问题，需要修复数据库规则');
    console.log('📋 下一步: 运行规则插入脚本');
  } else {
    console.log('\n🎉 数据库规则检查通过');
  }
});
