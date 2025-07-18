// 检查导入的规则格式
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkImportedRulesFormat() {
  let connection;
  try {
    console.log('🔍 检查导入的规则格式...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查规则总数
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = 'active'
    `);
    console.log(`活跃规则总数: ${countResult[0].total}`);
    
    // 2. 检查前5条规则的详细信息
    console.log('\n前5条规则详细信息:');
    
    const [rules] = await connection.execute(`
      SELECT id, intent_name, trigger_words, action_target, category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY id ASC
      LIMIT 5
    `);
    
    for (const rule of rules) {
      console.log(`\n规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`分类: ${rule.category}`);
      console.log(`触发词: ${rule.trigger_words}`);
      console.log(`SQL: ${rule.action_target ? rule.action_target.substring(0, 100) + '...' : '无'}`);
      
      // 测试触发词解析
      let triggerWords = [];
      if (rule.trigger_words) {
        try {
          if (typeof rule.trigger_words === 'string') {
            triggerWords = JSON.parse(rule.trigger_words);
          } else {
            triggerWords = rule.trigger_words;
          }
          console.log(`解析后触发词: ${JSON.stringify(triggerWords)}`);
        } catch (e) {
          console.log(`触发词解析失败: ${e.message}`);
        }
      }
    }
    
    // 3. 测试规则匹配
    console.log('\n\n测试规则匹配:');
    
    const testQueries = ['库存查询', '物料库存', '供应商查询'];
    
    for (const query of testQueries) {
      console.log(`\n测试查询: "${query}"`);
      
      // 获取所有规则
      const [allRules] = await connection.execute(`
        SELECT id, intent_name, trigger_words
        FROM nlp_intent_rules 
        WHERE status = 'active'
        ORDER BY priority DESC
      `);
      
      let matchedRule = null;
      
      for (const rule of allRules) {
        let triggerWords = [];

        if (rule.trigger_words) {
          try {
            if (typeof rule.trigger_words === 'string') {
              triggerWords = JSON.parse(rule.trigger_words);
            } else {
              triggerWords = rule.trigger_words;
            }
          } catch (e) {
            triggerWords = [rule.trigger_words.toString()];
          }
        }

        if (triggerWords.some(word => query.includes(word.toString().trim()))) {
          matchedRule = rule;
          console.log(`  ✅ 匹配到规则 ${rule.id}: ${rule.intent_name}`);
          console.log(`     匹配的触发词: ${JSON.stringify(triggerWords)}`);
          break;
        }
      }
      
      if (!matchedRule) {
        console.log(`  ❌ 未找到匹配规则`);
        
        // 尝试模糊匹配
        const fuzzyMatch = allRules.find(r => 
          r.intent_name.includes('库存') || 
          r.intent_name.includes(query)
        );
        
        if (fuzzyMatch) {
          console.log(`  🔍 模糊匹配到: ${fuzzyMatch.intent_name}`);
        }
      }
    }
    
    // 4. 检查数据源映射
    console.log('\n\n检查数据源映射:');
    
    const [categoryRules] = await connection.execute(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM nlp_intent_rules 
      WHERE status = 'active'
      GROUP BY category
    `);
    
    for (const cat of categoryRules) {
      console.log(`分类: ${cat.category} (${cat.count} 条规则)`);
      
      // 确定数据源
      let dataSource = 'inventory';
      if (cat.category.includes('检验') || cat.category.includes('测试')) {
        dataSource = 'inspection';
      } else if (cat.category.includes('生产') || cat.category.includes('上线')) {
        dataSource = 'production';
      }
      console.log(`  → 数据源: ${dataSource}`);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    if (connection) await connection.end();
  }
}

checkImportedRulesFormat();
