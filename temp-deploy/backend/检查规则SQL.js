import mysql from 'mysql2/promise';

async function checkRuleSQL() {
  let connection;
  
  try {
    console.log('🔍 检查规则SQL语句...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 检查规则480和485的SQL
    const ruleIds = [480, 485];
    
    for (const ruleId of ruleIds) {
      console.log(`\n🔍 检查规则${ruleId}:`);
      
      const [rule] = await connection.execute(
        'SELECT id, intent_name, category, action_target FROM nlp_intent_rules WHERE id = ?',
        [ruleId]
      );
      
      if (rule.length > 0) {
        const ruleData = rule[0];
        console.log(`   名称: ${ruleData.intent_name}`);
        console.log(`   分类: ${ruleData.category}`);
        console.log(`   SQL: ${ruleData.action_target}`);
        
        // 检查SQL是否包含LIMIT
        const hasLimit = ruleData.action_target.toLowerCase().includes('limit');
        console.log(`   ${hasLimit ? '❌' : '✅'} 包含LIMIT: ${hasLimit}`);
        
        if (hasLimit) {
          const limitMatch = ruleData.action_target.match(/limit\s+(\d+)/i);
          if (limitMatch) {
            console.log(`   LIMIT值: ${limitMatch[1]}`);
          }
        }
        
        // 直接执行SQL看真实结果
        try {
          const [results] = await connection.execute(ruleData.action_target);
          console.log(`   📊 直接执行结果: ${results.length}条记录`);
        } catch (error) {
          console.log(`   ❌ 直接执行失败: ${error.message}`);
        }
      } else {
        console.log(`   ❌ 规则${ruleId}不存在`);
      }
    }
    
    // 检查数据库中真实的供应商和物料数量
    console.log('\n📊 数据库真实数据量:');
    
    const [supplierCount] = await connection.execute(`
      SELECT COUNT(DISTINCT supplier_name) as count 
      FROM inventory 
      WHERE supplier_name IS NOT NULL AND supplier_name != ''
    `);
    console.log(`   不重复供应商: ${supplierCount[0].count}个`);
    
    const [materialCount] = await connection.execute(`
      SELECT COUNT(DISTINCT material_name) as count 
      FROM inventory 
      WHERE material_name IS NOT NULL AND material_name != ''
    `);
    console.log(`   不重复物料: ${materialCount[0].count}个`);
    
    // 如果规则SQL包含LIMIT，修复它们
    console.log('\n🔧 修复包含LIMIT的规则...');
    
    for (const ruleId of ruleIds) {
      const [rule] = await connection.execute(
        'SELECT action_target FROM nlp_intent_rules WHERE id = ?',
        [ruleId]
      );
      
      if (rule.length > 0) {
        let sql = rule[0].action_target;
        
        if (sql.toLowerCase().includes('limit')) {
          // 移除LIMIT限制
          const newSQL = sql.replace(/\s+LIMIT\s+\d+/gi, '');
          
          await connection.execute(
            'UPDATE nlp_intent_rules SET action_target = ? WHERE id = ?',
            [newSQL, ruleId]
          );
          
          console.log(`   ✅ 规则${ruleId}已移除LIMIT限制`);
          
          // 测试修复后的SQL
          try {
            const [results] = await connection.execute(newSQL);
            console.log(`   📊 修复后结果: ${results.length}条记录`);
          } catch (error) {
            console.log(`   ❌ 修复后执行失败: ${error.message}`);
          }
        } else {
          console.log(`   ✅ 规则${ruleId}无需修复`);
        }
      }
    }
    
    console.log('\n🎉 规则SQL检查完成！');
    
  } catch (error) {
    console.error('❌ 检查规则SQL失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

checkRuleSQL().catch(console.error);
