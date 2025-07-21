import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixRemainingIssues() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 修复剩余的SQL优化问题...\n');
    
    const remainingRules = [
      '物料测试情况查询',
      '本月测试汇总', 
      '物料测试Top不良'
    ];
    
    for (const ruleName of remainingRules) {
      try {
        // 获取当前SQL
        const [currentRule] = await connection.execute(
          'SELECT action_target FROM nlp_intent_rules WHERE intent_name = ? AND status = "active"',
          [ruleName]
        );
        
        if (currentRule.length > 0) {
          let updatedSQL = currentRule[0].action_target;
          
          // 修复备注字段空值处理
          if (updatedSQL.includes('conclusion') && !updatedSQL.includes('COALESCE(conclusion')) {
            updatedSQL = updatedSQL.replace(/conclusion as 备注/g, 'COALESCE(conclusion, \'\') as 备注');
            updatedSQL = updatedSQL.replace(/conclusion$/gm, 'COALESCE(conclusion, \'\') as 备注');
            updatedSQL = updatedSQL.replace(/conclusion,/g, 'COALESCE(conclusion, \'\') as 备注,');
            updatedSQL = updatedSQL.replace(/conclusion\s*$/gm, 'COALESCE(conclusion, \'\') as 备注');
          }
          
          if (updatedSQL.includes('notes') && !updatedSQL.includes('COALESCE(notes')) {
            updatedSQL = updatedSQL.replace(/notes as 备注/g, 'COALESCE(notes, \'\') as 备注');
            updatedSQL = updatedSQL.replace(/notes$/gm, 'COALESCE(notes, \'\') as 备注');
            updatedSQL = updatedSQL.replace(/notes,/g, 'COALESCE(notes, \'\') as 备注,');
            updatedSQL = updatedSQL.replace(/notes\s*$/gm, 'COALESCE(notes, \'\') as 备注');
          }
          
          // 更新数据库
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET action_target = ?, updated_at = NOW()
            WHERE intent_name = ? AND status = 'active'
          `, [updatedSQL, ruleName]);
          
          console.log(`✅ 修复规则: ${ruleName}`);
          
          // 测试修复后的SQL
          let testSQL = updatedSQL;
          testSQL = testSQL.replace(/\?/g, "'测试值'");
          testSQL = testSQL.replace(/COALESCE\('测试值', ''\)/g, "COALESCE('测试值', '')");
          
          const [results] = await connection.execute(testSQL);
          console.log(`   测试成功，返回 ${results.length} 条记录`);
        }
      } catch (error) {
        console.log(`❌ 修复失败: ${ruleName} - ${error.message}`);
      }
    }
    
    console.log('\n✅ 剩余问题修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程失败:', error);
  } finally {
    await connection.end();
  }
}

fixRemainingIssues().catch(console.error);
