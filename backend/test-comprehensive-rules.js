/**
 * 测试完整规则系统
 * 验证规则匹配和SQL执行
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 测试用例
const TEST_QUERIES = [
  // 基础查询测试
  { query: '查询物料库存', expectedCategory: '库存场景' },
  { query: '查询聚龙供应商的库存', expectedCategory: '库存场景' },
  { query: '查询电池的库存情况', expectedCategory: '库存场景' },
  { query: '查询正常状态的库存', expectedCategory: '库存场景' },
  
  // 测试场景测试
  { query: '查询物料测试结果', expectedCategory: '测试场景' },
  { query: '查询NG测试结果', expectedCategory: '测试场景' },
  { query: '查询聚龙供应商的测试结果', expectedCategory: '测试场景' },
  
  // 上线场景测试
  { query: '查询物料上线情况', expectedCategory: '上线场景' },
  { query: '查询不良率较高的物料', expectedCategory: '上线场景' },
  { query: '查询有异常的上线物料', expectedCategory: '上线场景' },
  
  // 物料类别测试
  { query: '查询结构件类物料', expectedCategory: '物料类别' },
  { query: '查询电池盖', expectedCategory: '物料类别' },
  { query: '查询LCD显示屏', expectedCategory: '物料类别' },
  { query: '查询电池', expectedCategory: '物料类别' },
  { query: '查询喇叭', expectedCategory: '物料类别' },
  { query: '查询包装盒', expectedCategory: '物料类别' },
  
  // 供应商测试
  { query: '查询聚龙', expectedCategory: '供应商场景' },
  { query: '查询天马', expectedCategory: '供应商场景' },
  { query: '查询BOE', expectedCategory: '供应商场景' },
  
  // 分析场景测试
  { query: '对比各供应商的质量表现', expectedCategory: '分析场景' },
  { query: '分析电池的质量趋势', expectedCategory: '分析场景' },
  
  // 风险场景测试
  { query: '识别高风险物料', expectedCategory: '风险场景' },
  
  // 批次场景测试
  { query: '查询批次123456的信息', expectedCategory: '批次场景' }
];

// 简单的规则匹配算法
function matchRule(query, rules) {
  const queryLower = query.toLowerCase();
  let bestMatch = null;
  let maxScore = 0;
  
  for (const rule of rules) {
    let score = 0;
    let triggerWords = [];
    
    try {
      if (rule.trigger_words) {
        if (Array.isArray(rule.trigger_words)) {
          triggerWords = rule.trigger_words;
        } else if (typeof rule.trigger_words === 'string') {
          if (rule.trigger_words.startsWith('[')) {
            triggerWords = JSON.parse(rule.trigger_words);
          } else {
            triggerWords = rule.trigger_words.split(',').map(w => w.trim());
          }
        } else {
          triggerWords = String(rule.trigger_words).split(',').map(w => w.trim());
        }
      }
    } catch (e) {
      triggerWords = [];
    }
    
    // 检查触发词匹配
    for (const word of triggerWords) {
      if (queryLower.includes(word.toLowerCase())) {
        score += word.length * 2;
      }
    }
    
    // 规则名称匹配
    if (rule.intent_name && queryLower.includes(rule.intent_name.toLowerCase())) {
      score += 50;
    }
    
    if (score > maxScore) {
      maxScore = score;
      bestMatch = rule;
    }
  }
  
  return maxScore > 5 ? bestMatch : null;
}

async function testComprehensiveRules() {
  let connection;
  
  try {
    console.log('🧪 开始测试完整规则系统...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 获取所有规则
    console.log('\n📋 获取所有规则...');
    const [rules] = await connection.execute(`
      SELECT id, intent_name, description, action_type, action_target, 
             trigger_words, category, priority, status
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY priority DESC
    `);
    
    console.log(`✅ 获取到 ${rules.length} 条规则`);
    
    // 2. 测试规则匹配
    console.log('\n🎯 测试规则匹配...');
    let passCount = 0;
    let failCount = 0;
    
    for (const testCase of TEST_QUERIES) {
      const matchedRule = matchRule(testCase.query, rules);
      
      if (matchedRule) {
        if (matchedRule.category === testCase.expectedCategory) {
          console.log(`✅ "${testCase.query}" → ${matchedRule.intent_name} (${matchedRule.category})`);
          passCount++;
        } else {
          console.log(`❌ "${testCase.query}" → ${matchedRule.intent_name} (${matchedRule.category}) 期望: ${testCase.expectedCategory}`);
          failCount++;
        }
      } else {
        console.log(`❌ "${testCase.query}" → 无匹配规则 期望: ${testCase.expectedCategory}`);
        failCount++;
      }
    }
    
    console.log(`\n📊 匹配测试结果: ${passCount} 通过, ${failCount} 失败`);
    
    // 3. 测试SQL执行（选择几个简单的规则）
    console.log('\n🔍 测试SQL执行...');
    const simpleRules = rules.filter(rule => 
      !rule.action_target.includes('UNION') && 
      !rule.action_target.includes('?') &&
      rule.category === '库存场景'
    ).slice(0, 3);
    
    for (const rule of simpleRules) {
      try {
        console.log(`\n测试规则: ${rule.intent_name}`);
        const [results] = await connection.execute(rule.action_target);
        console.log(`✅ SQL执行成功，返回 ${results.length} 条记录`);
        
        if (results.length > 0) {
          console.log('📋 字段:', Object.keys(results[0]).join(', '));
        }
      } catch (error) {
        console.log(`❌ SQL执行失败: ${error.message}`);
      }
    }
    
    // 4. 规则覆盖度分析
    console.log('\n📈 规则覆盖度分析...');
    const categoryStats = {};
    rules.forEach(rule => {
      categoryStats[rule.category] = (categoryStats[rule.category] || 0) + 1;
    });
    
    console.log('各场景规则数量:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 条规则`);
    });
    
    // 5. 触发词分析
    console.log('\n🔤 触发词分析...');
    const allTriggerWords = new Set();
    rules.forEach(rule => {
      try {
        let triggerWords = [];
        if (rule.trigger_words) {
          if (Array.isArray(rule.trigger_words)) {
            triggerWords = rule.trigger_words;
          } else if (typeof rule.trigger_words === 'string') {
            if (rule.trigger_words.startsWith('[')) {
              triggerWords = JSON.parse(rule.trigger_words);
            } else {
              triggerWords = rule.trigger_words.split(',').map(w => w.trim());
            }
          } else {
            triggerWords = String(rule.trigger_words).split(',').map(w => w.trim());
          }
        }
        triggerWords.forEach(word => allTriggerWords.add(word));
      } catch (e) {
        // 忽略解析错误
      }
    });
    
    console.log(`总触发词数量: ${allTriggerWords.size}`);
    console.log('触发词示例:', Array.from(allTriggerWords).slice(0, 20).join(', '));
    
    console.log('\n🎉 规则系统测试完成!');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testComprehensiveRules().catch(console.error);
