import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

/**
 * 修复触发词JSON格式问题
 */

async function fixTriggerWordsJSON() {
  try {
    console.log('🔧 修复触发词JSON格式问题...\n');
    
    // 获取所有规则
    const [rules] = await connection.execute(`
      SELECT id, intent_name, trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active'
    `);
    
    console.log(`📊 需要检查的规则数量: ${rules.length}`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const rule of rules) {
      try {
        // 尝试解析JSON
        if (rule.trigger_words) {
          JSON.parse(rule.trigger_words);
          // 如果能解析，说明格式正确
        }
      } catch (error) {
        // JSON格式错误，需要修复
        console.log(`❌ ${rule.intent_name}: JSON格式错误`);
        console.log(`   原始数据: ${rule.trigger_words.substring(0, 100)}...`);
        
        try {
          // 尝试修复JSON格式
          let fixedTriggerWords;
          
          if (rule.trigger_words.startsWith('[') && rule.trigger_words.endsWith(']')) {
            // 已经是数组格式，但可能有格式问题
            fixedTriggerWords = rule.trigger_words;
          } else {
            // 不是数组格式，转换为数组
            const words = rule.trigger_words.split(',').map(word => word.trim());
            fixedTriggerWords = JSON.stringify(words);
          }
          
          // 验证修复后的JSON
          JSON.parse(fixedTriggerWords);
          
          // 更新数据库
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET trigger_words = ?
            WHERE id = ?
          `, [fixedTriggerWords, rule.id]);
          
          fixedCount++;
          console.log(`   ✅ 已修复`);
          
        } catch (fixError) {
          // 修复失败，使用默认值
          const defaultTriggerWords = JSON.stringify([rule.intent_name]);
          
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET trigger_words = ?
            WHERE id = ?
          `, [defaultTriggerWords, rule.id]);
          
          errorCount++;
          console.log(`   ⚠️ 使用默认值修复`);
        }
      }
    }
    
    console.log(`\n📊 修复结果:`);
    console.log(`✅ 成功修复: ${fixedCount}条`);
    console.log(`⚠️ 使用默认值: ${errorCount}条`);
    console.log(`✅ 格式正确: ${rules.length - fixedCount - errorCount}条`);
    
    // 验证修复效果
    console.log('\n🔍 验证修复效果...');
    await verifyJSONFormat();
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  } finally {
    await connection.end();
  }
}

/**
 * 验证JSON格式
 */
async function verifyJSONFormat() {
  const [rules] = await connection.execute(`
    SELECT id, intent_name, trigger_words
    FROM nlp_intent_rules 
    WHERE status = 'active'
    LIMIT 10
  `);
  
  let validCount = 0;
  
  for (const rule of rules) {
    try {
      const examples = JSON.parse(rule.trigger_words);
      validCount++;
      
      if (validCount <= 5) {
        console.log(`✅ ${rule.intent_name}:`);
        console.log(`   示例: ${examples.join(', ')}`);
      }
    } catch (error) {
      console.log(`❌ ${rule.intent_name}: 仍有JSON格式错误`);
    }
  }
  
  console.log(`\n📊 验证结果: ${validCount}/${rules.length} 格式正确`);
}

// 执行修复
fixTriggerWordsJSON();
