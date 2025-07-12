import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function testIntentPriority() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🧪 测试意图优先级修复...\n');
    
    const testQuery = "查询电池的在线跟踪";
    console.log(`测试查询: "${testQuery}"\n`);
    
    // 获取相关规则
    const [rules] = await connection.execute(`
      SELECT intent_name, trigger_words, priority
      FROM nlp_intent_rules 
      WHERE intent_name IN ('在线跟踪查询', '物料库存信息查询')
      ORDER BY priority ASC
    `);
    
    console.log('相关规则信息:');
    rules.forEach(rule => {
      console.log(`规则: ${rule.intent_name}, 优先级: ${rule.priority}`);
      console.log(`触发词: ${rule.trigger_words}`);
      console.log('---');
    });
    
    // 模拟新的优先级计算逻辑
    console.log('\n🔧 模拟新的优先级计算逻辑:');
    
    const matchResults = [];
    
    for (const rule of rules) {
      // 解析触发词（支持JSON字符串和逗号分隔字符串）
      let triggerWords = rule.trigger_words;
      if (typeof triggerWords === 'string') {
        if (triggerWords.startsWith('[')) {
          try {
            triggerWords = JSON.parse(triggerWords);
          } catch (e) {
            triggerWords = triggerWords.split(',').map(w => w.trim());
          }
        } else {
          triggerWords = triggerWords.split(',').map(w => w.trim());
        }
      } else {
        triggerWords = [];
      }

      let score = 0;
      const matchedWords = [];
      
      // 检查触发词匹配
      for (const word of triggerWords) {
        if (testQuery.includes(word)) {
          score += 2; // 每个触发词匹配得2分
          matchedWords.push(word);
        }
      }
      
      // 检查规则名称匹配
      if (testQuery.includes('在线') && rule.intent_name.includes('在线')) {
        score += 1;
        matchedWords.push('规则名称:在线');
      }
      
      if (testQuery.includes('跟踪') && rule.intent_name.includes('跟踪')) {
        score += 1;
        matchedWords.push('规则名称:跟踪');
      }
      
      if (testQuery.includes('库存') && rule.intent_name.includes('库存')) {
        score += 1;
        matchedWords.push('规则名称:库存');
      }
      
      // 新的优先级加权 (数字越小优先级越高，所以使用倒数)
      const priorityWeight = rule.priority ? (100 / rule.priority) : 1;
      const finalScore = score * priorityWeight;
      
      console.log(`规则: ${rule.intent_name}`);
      console.log(`  基础分数: ${score}`);
      console.log(`  优先级: ${rule.priority}`);
      console.log(`  优先级权重: ${priorityWeight.toFixed(2)}`);
      console.log(`  最终分数: ${finalScore.toFixed(2)}`);
      console.log(`  匹配词: ${matchedWords.join(', ')}`);
      console.log('');
      
      if (score > 0) {
        matchResults.push({
          intent_name: rule.intent_name,
          priority: rule.priority,
          baseScore: score,
          priorityWeight: priorityWeight,
          finalScore: finalScore,
          matchedWords: matchedWords
        });
      }
    }
    
    // 按最终分数排序
    matchResults.sort((a, b) => b.finalScore - a.finalScore);
    
    console.log('🏆 最终排序结果:');
    matchResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.intent_name} (最终分数: ${result.finalScore.toFixed(2)})`);
    });
    
    if (matchResults.length > 0) {
      const winner = matchResults[0];
      console.log(`\n✅ 获胜规则: ${winner.intent_name}`);
      
      if (winner.intent_name === '在线跟踪查询') {
        console.log('🎉 修复成功！"在线跟踪查询"现在有最高优先级');
      } else {
        console.log('❌ 修复失败！仍然是其他规则获胜');
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await connection.end();
  }
}

testIntentPriority();
