import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixRemainingDuplicates() {
  console.log('🔧 修复剩余的重复示例查询...');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 查找所有使用"查询BOE供应商库存"的规则
    console.log('🔍 查找使用重复示例查询的规则...');
    const [duplicateRules] = await connection.execute(`
      SELECT intent_name, example_query, description
      FROM nlp_intent_rules 
      WHERE example_query = '查询BOE供应商库存'
    `);
    
    console.log('使用"查询BOE供应商库存"的规则:');
    duplicateRules.forEach((rule, i) => {
      console.log(`  ${i+1}. ${rule.intent_name} - ${rule.description}`);
    });
    
    // 2. 为这些规则分配不同的示例查询
    const specificUpdates = [
      {
        intent_name: 'BOE供应商库存专查',
        new_example: '查询BOE供应商的库存状态'
      },
      {
        intent_name: '供应商库存查询_优化',
        new_example: '查询天马供应商的库存情况'
      },
      {
        intent_name: 'LCD显示屏测试专查',
        new_example: '查询OLED显示屏的测试情况'
      }
    ];
    
    // 3. 更新这些规则
    for (const update of specificUpdates) {
      const [result] = await connection.execute(
        'UPDATE nlp_intent_rules SET example_query = ? WHERE intent_name = ?',
        [update.new_example, update.intent_name]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ 更新规则 "${update.intent_name}" 的示例查询为: "${update.new_example}"`);
      } else {
        console.log(`⚠️ 规则 "${update.intent_name}" 未找到或未更新`);
      }
    }
    
    // 4. 最终验证
    console.log('\n🔍 最终验证...');
    const [finalCheck] = await connection.execute(`
      SELECT example_query, COUNT(*) as count, GROUP_CONCAT(intent_name) as rules
      FROM nlp_intent_rules 
      GROUP BY example_query 
      HAVING count > 1
    `);
    
    if (finalCheck.length === 0) {
      console.log('✅ 所有重复的示例查询已完全修复！');
    } else {
      console.log('⚠️ 仍有重复的示例查询:');
      finalCheck.forEach(dup => {
        console.log(`  "${dup.example_query}" - ${dup.count} 个规则: ${dup.rules}`);
      });
    }
    
    // 5. 显示所有规则的示例查询
    console.log('\n📋 所有规则的示例查询:');
    const [allRules] = await connection.execute(`
      SELECT intent_name, example_query 
      FROM nlp_intent_rules 
      ORDER BY intent_name
    `);
    
    allRules.forEach((rule, i) => {
      console.log(`  ${i+1}. ${rule.intent_name}: "${rule.example_query}"`);
    });
    
    await connection.end();
    console.log('\n🎉 重复示例查询修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixRemainingDuplicates();
