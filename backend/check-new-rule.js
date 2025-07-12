import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkNewRule() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查新创建的风险状态物料查询规则...\n');
    
    // 检查风险状态物料查询规则
    const [riskRule] = await connection.execute(`
      SELECT intent_name, priority, trigger_words, action_target, status
      FROM nlp_intent_rules 
      WHERE intent_name = '风险状态物料查询'
    `);
    
    if (riskRule.length > 0) {
      const rule = riskRule[0];
      console.log('✅ 找到风险状态物料查询规则:');
      console.log(`- 规则名称: ${rule.intent_name}`);
      console.log(`- 优先级: ${rule.priority}`);
      console.log(`- 状态: ${rule.status}`);
      console.log(`- 触发词: ${rule.trigger_words}`);
      console.log(`- SQL: ${rule.action_target.substring(0, 200)}...`);
      
      // 测试SQL
      console.log('\n🧪 测试SQL查询...');
      try {
        const [testResult] = await connection.execute(rule.action_target);
        console.log(`✅ SQL执行成功，返回 ${testResult.length} 条记录`);
        
        if (testResult.length > 0) {
          console.log('返回字段:', Object.keys(testResult[0]).join(', '));
          console.log('第一条记录:', testResult[0]);
        }
      } catch (sqlError) {
        console.log('❌ SQL执行失败:', sqlError.message);
      }
      
    } else {
      console.log('❌ 未找到风险状态物料查询规则');
    }
    
    // 检查所有风险相关规则的优先级
    console.log('\n=== 所有风险相关规则优先级 ===');
    const [allRiskRules] = await connection.execute(`
      SELECT intent_name, priority, trigger_words
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%风险%' OR trigger_words LIKE '%风险%'
      ORDER BY priority DESC
    `);
    
    allRiskRules.forEach(rule => {
      console.log(`- ${rule.intent_name} (优先级: ${rule.priority})`);
      try {
        const triggers = JSON.parse(rule.trigger_words || '[]');
        console.log(`  触发词: ${triggers.join(', ')}`);
      } catch (e) {
        console.log(`  触发词: ${rule.trigger_words}`);
      }
    });
    
    // 修复触发词JSON格式问题
    console.log('\n🔧 修复触发词JSON格式...');
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET trigger_words = ?
      WHERE intent_name = '风险状态物料查询'
    `, [JSON.stringify(["风险状态的物料", "查询风险状态", "风险状态物料", "风险物料查询", "风险状态查询"])]);
    
    console.log('✅ 触发词已修复');
    
    // 确保优先级最高
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET priority = 25
      WHERE intent_name = '风险状态物料查询'
    `);
    
    console.log('✅ 优先级已设置为最高(25)');
    
    console.log('\n✅ 规则修复完成！');
    
  } catch (error) {
    console.error('❌ 检查过程中出错:', error);
  } finally {
    await connection.end();
  }
}

checkNewRule();
