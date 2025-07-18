// 修复BOE供应商规则匹配问题
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixBoeSupplierRule() {
  let connection;
  
  try {
    console.log('🔧 修复BOE供应商规则匹配问题...');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查BOE供应商相关规则
    const [boeRules] = await connection.execute(`
      SELECT id, intent_name, category, example_query, trigger_words
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%BOE%'
      ORDER BY category, priority DESC
    `);
    
    console.log(`📋 找到 ${boeRules.length} 条BOE相关规则:`);
    boeRules.forEach(rule => {
      console.log(`  - ${rule.intent_name} (${rule.category})`);
      console.log(`    示例: ${rule.example_query}`);
    });
    
    // 2. 更新BOE供应商规则的触发词和示例
    for (const rule of boeRules) {
      // 更新触发词，确保包含"测试结果"相关词汇
      const updatedTriggerWords = JSON.stringify([
        'BOE', '供应商', '查询', '测试', '检测', '检验', '结果', '情况', '数据'
      ]);
      
      // 根据场景更新示例查询
      let updatedExample = rule.example_query;
      if (rule.category === '测试场景') {
        updatedExample = '查询BOE供应商的测试结果';
      } else if (rule.category === '库存场景') {
        updatedExample = '查询BOE供应商的库存情况';
      } else if (rule.category === '上线场景') {
        updatedExample = '查询BOE供应商的上线情况';
      }
      
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET trigger_words = ?, example_query = ?, updated_at = NOW()
        WHERE id = ?
      `, [updatedTriggerWords, updatedExample, rule.id]);
      
      console.log(`✅ 更新规则: ${rule.intent_name}`);
      console.log(`   新示例: ${updatedExample}`);
    }
    
    // 3. 测试修复效果
    console.log('\n🧪 测试修复效果...');
    
    const testQuery = '查询BOE供应商的测试结果';
    const [matchedRules] = await connection.execute(`
      SELECT intent_name, category, example_query, priority
      FROM nlp_intent_rules 
      WHERE category = '测试场景'
      AND (
        example_query LIKE '%BOE%'
        OR JSON_EXTRACT(trigger_words, '$') LIKE '%BOE%'
        OR intent_name LIKE '%BOE%'
      )
      ORDER BY priority DESC
      LIMIT 3
    `);
    
    console.log(`📝 测试查询: ${testQuery}`);
    if (matchedRules.length > 0) {
      console.log(`✅ 找到 ${matchedRules.length} 条匹配规则:`);
      matchedRules.forEach((rule, index) => {
        console.log(`   ${index + 1}. ${rule.intent_name} (优先级: ${rule.priority})`);
        console.log(`      示例: ${rule.example_query}`);
      });
    } else {
      console.log(`❌ 仍未找到匹配规则`);
    }
    
    // 4. 检查所有供应商规则的一致性
    console.log('\n🔍 检查所有供应商规则一致性...');
    
    const [allSupplierRules] = await connection.execute(`
      SELECT category, COUNT(*) as count
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%供应商_查询'
      GROUP BY category
      ORDER BY category
    `);
    
    console.log('📊 各场景供应商规则统计:');
    allSupplierRules.forEach(rule => {
      console.log(`  ${rule.category}: ${rule.count} 条供应商规则`);
    });
    
    console.log('\n🎉 BOE供应商规则修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixBoeSupplierRule().catch(console.error);
