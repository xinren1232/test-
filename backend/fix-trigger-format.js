import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixTriggerFormat() {
  console.log('🔧 修复触发词格式...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 修复所有规则的触发词格式
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active'
    `);
    
    let fixedCount = 0;
    
    for (const rule of allRules) {
      try {
        let triggerWords;
        
        if (typeof rule.trigger_words === 'string') {
          if (rule.trigger_words.startsWith('[')) {
            // 已经是JSON格式
            continue;
          } else {
            // 是逗号分隔的字符串
            triggerWords = rule.trigger_words.split(',').map(w => w.trim());
          }
        } else {
          // 已经是数组
          triggerWords = rule.trigger_words;
        }
        
        // 更新为JSON格式
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET trigger_words = ?
          WHERE id = ?
        `, [JSON.stringify(triggerWords), rule.id]);
        
        fixedCount++;
        
      } catch (error) {
        console.log(`❌ 修复失败: ${rule.intent_name}`);
      }
    }
    
    console.log(`✅ 修复了 ${fixedCount} 条规则`);
    
    // 测试BOE匹配
    console.log('\n🧪 测试BOE匹配:');
    
    const query = 'BOE供应商上线情况';
    const keywords = ['BOE', '供应商', '上线'];
    
    const conditions = keywords.map(() => '(intent_name LIKE ? OR trigger_words LIKE ?)').join(' OR ');
    const params = keywords.flatMap(k => [`%${k}%`, `%${k}%`]);
    
    const [matches] = await connection.execute(`
      SELECT intent_name, category, trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND (${conditions})
      ORDER BY priority DESC
      LIMIT 5
    `, params);
    
    if (matches.length > 0) {
      console.log('匹配结果:');
      matches.forEach((match, index) => {
        console.log(`  ${index + 1}. ${match.intent_name} (${match.category})`);
      });
    } else {
      console.log('❌ 仍然匹配失败');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixTriggerFormat();
