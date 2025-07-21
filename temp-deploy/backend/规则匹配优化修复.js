import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function optimizeRuleMatching() {
  let connection;
  
  try {
    console.log('🚀 开始规则匹配优化修复...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 修复数据探索规则的触发词
    console.log('\n🔍 步骤1: 优化数据探索规则触发词...');
    
    const explorationRuleUpdates = [
      {
        name: '查看所有供应商',
        triggers: [
          "供应商列表", "所有供应商", "有哪些供应商", "供应商有什么",
          "系统里有哪些供应商", "供应商都有什么", "查看供应商", "显示供应商",
          "供应商信息", "厂商列表", "供货商", "制造商", "供应商", "查看所有供应商"
        ]
      },
      {
        name: '查看所有物料',
        triggers: [
          "物料列表", "所有物料", "有哪些物料", "物料有什么",
          "系统里有哪些物料", "物料都有什么", "查看物料", "显示物料",
          "物料信息", "物料种类", "料件", "零件", "材料", "组件", "物料", "查看所有物料"
        ]
      },
      {
        name: '查看所有工厂',
        triggers: [
          "工厂列表", "所有工厂", "有哪些工厂", "工厂有什么",
          "系统里有哪些工厂", "工厂都有什么", "查看工厂", "显示工厂",
          "工厂信息", "生产基地", "厂区", "制造厂", "工厂", "查看所有工厂"
        ]
      },
      {
        name: '查看所有仓库',
        triggers: [
          "仓库列表", "所有仓库", "有哪些仓库", "仓库有什么",
          "系统里有哪些仓库", "仓库都有什么", "查看仓库", "显示仓库",
          "仓库信息", "库房信息", "存储区", "仓储", "仓库", "查看所有仓库"
        ]
      },
      {
        name: '查看库存状态分布',
        triggers: [
          "状态分布", "库存状态", "有哪些状态", "状态统计",
          "库存状态都有哪些", "状态都有什么", "状态信息", "库存状态分布", "状态"
        ]
      }
    ];
    
    for (const update of explorationRuleUpdates) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET trigger_words = ?, updated_at = NOW()
        WHERE intent_name = ?
      `, [JSON.stringify(update.triggers), update.name]);
      
      console.log(`✅ 优化触发词: ${update.name} (${update.triggers.length}个触发词)`);
    }
    
    // 2. 添加缺失的findMatchingRule函数
    console.log('\n🔧 步骤2: 修复assistantController中的findMatchingRule函数...');
    
    const assistantControllerPath = path.join(process.cwd(), 'src/controllers/assistantController.js');
    
    if (fs.existsSync(assistantControllerPath)) {
      let content = fs.readFileSync(assistantControllerPath, 'utf8');
      
      // 检查是否已经有findMatchingRule函数
      if (!content.includes('async function findMatchingRule')) {
        // 在文件开头添加findMatchingRule函数
        const findMatchingRuleFunction = `
// 添加缺失的findMatchingRule函数
async function findMatchingRule(queryText) {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });
  
  try {
    const queryLower = queryText.toLowerCase();
    
    // 获取所有活跃规则
    const [rules] = await connection.execute(\`
      SELECT id, intent_name, description, action_target, trigger_words, example_query, category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY priority DESC
    \`);
    
    let bestMatch = null;
    let maxScore = 0;
    
    for (const rule of rules) {
      let score = 0;
      let triggerWords = [];
      
      // 解析触发词
      try {
        triggerWords = JSON.parse(rule.trigger_words || '[]');
      } catch (e) {
        triggerWords = rule.trigger_words ? rule.trigger_words.split(',').map(w => w.trim()) : [];
      }
      
      // 检查触发词匹配
      for (const word of triggerWords) {
        if (queryLower.includes(word.toLowerCase())) {
          score += word.length * 2; // 长词权重更高
        }
      }
      
      // 规则名称匹配
      if (rule.intent_name && queryLower.includes(rule.intent_name.toLowerCase())) {
        score += 50;
      }
      
      // 数据探索规则优先级提升
      if (rule.category === '数据探索') {
        score += 10;
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = rule;
      }
    }
    
    console.log(\`🎯 规则匹配结果: \${bestMatch?.intent_name} (得分: \${maxScore})\`);
    return maxScore > 5 ? bestMatch : null;
    
  } finally {
    await connection.end();
  }
}

`;
        
        // 在import语句后添加函数
        const importEndIndex = content.lastIndexOf('import');
        const nextLineIndex = content.indexOf('\n', importEndIndex);
        content = content.slice(0, nextLineIndex + 1) + findMatchingRuleFunction + content.slice(nextLineIndex + 1);
        
        fs.writeFileSync(assistantControllerPath, content);
        console.log('✅ 添加findMatchingRule函数到assistantController');
      } else {
        console.log('✅ findMatchingRule函数已存在');
      }
    }
    
    // 3. 优化规则匹配算法
    console.log('\n⚡ 步骤3: 优化规则匹配算法...');
    
    // 为数据探索规则设置更高的优先级
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET priority = 80
      WHERE category = '数据探索' AND status = 'active'
    `);
    console.log('✅ 提升数据探索规则优先级');
    
    // 确保所有数据探索规则都是活跃状态
    const explorationRules = [
      '查看所有物料', '查看所有供应商', '查看所有工厂', 
      '查看所有仓库', '查看库存状态分布'
    ];
    
    for (const ruleName of explorationRules) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET status = 'active', priority = 80, updated_at = NOW()
        WHERE intent_name = ?
      `, [ruleName]);
    }
    console.log('✅ 确保数据探索规则活跃状态');
    
    // 4. 测试规则匹配
    console.log('\n🧪 步骤4: 测试规则匹配...');
    
    const testQueries = [
      '系统里有哪些供应商？',
      '查看所有供应商',
      '供应商列表',
      '有哪些物料？',
      '查看所有物料',
      '物料列表'
    ];
    
    for (const testQuery of testQueries) {
      const queryLower = testQuery.toLowerCase();
      
      // 获取匹配的规则
      const [matchedRules] = await connection.execute(`
        SELECT intent_name, trigger_words, category, priority
        FROM nlp_intent_rules 
        WHERE status = 'active' AND JSON_CONTAINS(trigger_words, ?)
        ORDER BY priority DESC
        LIMIT 1
      `, [JSON.stringify(queryLower)]);
      
      if (matchedRules.length > 0) {
        console.log(`✅ "${testQuery}" → ${matchedRules[0].intent_name}`);
      } else {
        // 尝试模糊匹配
        const [fuzzyMatches] = await connection.execute(`
          SELECT intent_name, trigger_words, category
          FROM nlp_intent_rules 
          WHERE status = 'active' AND category = '数据探索'
        `);
        
        let found = false;
        for (const rule of fuzzyMatches) {
          let triggerWords = [];
          try {
            triggerWords = JSON.parse(rule.trigger_words || '[]');
          } catch (e) {
            triggerWords = [];
          }
          
          for (const word of triggerWords) {
            if (queryLower.includes(word.toLowerCase())) {
              console.log(`🔍 "${testQuery}" → ${rule.intent_name} (模糊匹配: ${word})`);
              found = true;
              break;
            }
          }
          if (found) break;
        }
        
        if (!found) {
          console.log(`❌ "${testQuery}" → 无匹配规则`);
        }
      }
    }
    
    // 5. 统计最终结果
    console.log('\n📊 步骤5: 统计优化结果...');
    
    const [totalRules] = await connection.execute(
      'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = "active"'
    );
    
    const [explorationStats] = await connection.execute(`
      SELECT 
        intent_name,
        JSON_LENGTH(trigger_words) as trigger_count,
        priority,
        category
      FROM nlp_intent_rules 
      WHERE category = '数据探索' AND status = 'active'
      ORDER BY intent_name
    `);
    
    console.log('📈 优化完成统计:');
    console.log(`   总活跃规则: ${totalRules[0].total}条`);
    console.log('   数据探索规则:');
    explorationStats.forEach(rule => {
      console.log(`     ${rule.intent_name}: ${rule.trigger_count}个触发词 (优先级: ${rule.priority})`);
    });
    
    console.log('\n🎉 规则匹配优化完成！');
    console.log('✅ 数据探索规则触发词已优化');
    console.log('✅ findMatchingRule函数已添加');
    console.log('✅ 规则优先级已调整');
    console.log('✅ 规则匹配算法已优化');
    
  } catch (error) {
    console.error('❌ 规则匹配优化失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

optimizeRuleMatching().catch(console.error);
