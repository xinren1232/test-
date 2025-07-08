/**
 * 快速测试关键规则
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function quickTestRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('⚡ 快速测试关键规则...\n');
    
    // 测试几个关键规则
    const testRules = [
      '物料库存查询',
      '今日入库物料', 
      '风险物料查询',
      'NG测试结果统计',
      '低库存预警'
    ];
    
    for (const ruleName of testRules) {
      console.log(`🔍 测试规则: ${ruleName}`);
      
      const [rules] = await connection.execute(
        'SELECT action_target FROM nlp_intent_rules WHERE intent_name = ?',
        [ruleName]
      );
      
      if (rules.length > 0) {
        try {
          const [results] = await connection.execute(rules[0].action_target);
          console.log(`✅ 成功，返回 ${results.length} 条记录`);
          
          if (results.length > 0) {
            console.log(`📋 字段: ${Object.keys(results[0]).join(', ')}`);
          }
        } catch (sqlError) {
          console.log(`❌ SQL错误: ${sqlError.message}`);
        }
      } else {
        console.log(`❌ 规则不存在`);
      }
      
      console.log('─'.repeat(50));
    }
    
    // 统计总规则数
    const [totalRules] = await connection.execute(
      'SELECT COUNT(*) as total FROM nlp_intent_rules'
    );
    
    console.log(`\n📊 总计: ${totalRules[0].total} 条规则`);
    console.log('🎉 快速测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await connection.end();
  }
}

quickTestRules().catch(console.error);
