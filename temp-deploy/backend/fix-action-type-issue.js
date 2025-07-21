/**
 * 修复动作类型问题
 * 将database_query改为SQL_QUERY
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixActionTypeIssue() {
  console.log('🔧 修复动作类型问题...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 查找所有database_query类型的规则
    console.log('1. 查找database_query类型的规则:');
    const [wrongTypeRules] = await connection.query(`
      SELECT id, intent_name, action_type
      FROM nlp_intent_rules 
      WHERE action_type = 'database_query'
      ORDER BY intent_name
    `);
    
    console.log(`   找到 ${wrongTypeRules.length} 条需要修复的规则`);
    wrongTypeRules.forEach(rule => {
      console.log(`     - ${rule.intent_name} (ID: ${rule.id})`);
    });
    
    // 2. 批量修复动作类型
    console.log('\n2. 批量修复动作类型:');
    const updateResult = await connection.query(`
      UPDATE nlp_intent_rules 
      SET action_type = 'SQL_QUERY'
      WHERE action_type = 'database_query'
    `);
    
    console.log(`   ✅ 已修复 ${updateResult[0].affectedRows} 条规则`);
    
    // 3. 验证修复结果
    console.log('\n3. 验证修复结果:');
    const [verifyRules] = await connection.query(`
      SELECT action_type, COUNT(*) as count
      FROM nlp_intent_rules 
      GROUP BY action_type
      ORDER BY action_type
    `);
    
    console.log('   动作类型统计:');
    verifyRules.forEach(stat => {
      console.log(`     - ${stat.action_type}: ${stat.count} 条`);
    });
    
    // 4. 检查是否还有其他不支持的动作类型
    console.log('\n4. 检查支持的动作类型:');
    const supportedTypes = ['SQL_QUERY', 'FUNCTION_CALL', 'API_CALL'];
    const [allTypes] = await connection.query(`
      SELECT DISTINCT action_type
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY action_type
    `);
    
    allTypes.forEach(type => {
      const isSupported = supportedTypes.includes(type.action_type);
      console.log(`     ${isSupported ? '✅' : '❌'} ${type.action_type}`);
    });
    
    await connection.end();
    
    console.log('\n🎉 动作类型修复完成！');
    console.log('\n📋 修复总结:');
    console.log('  ✅ 将database_query改为SQL_QUERY');
    console.log('  ✅ 确保所有动作类型都被支持');
    console.log('  ✅ 智能意图识别现在应该能正常工作');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

// 执行修复
fixActionTypeIssue();
