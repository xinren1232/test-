/**
 * 修复规则匹配问题
 * 检查和修复规则的触发词设置
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

/**
 * 检查规则的触发词设置
 */
async function checkRuleTriggerWords() {
  console.log('🔍 检查规则触发词设置...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 获取所有规则的触发词
    const [rules] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        trigger_words,
        example_query
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY intent_name
      LIMIT 10
    `);
    
    console.log(`\n📊 检查前10个规则的触发词:`);
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name}`);
      console.log(`   示例: ${rule.example_query}`);
      console.log(`   触发词: ${rule.trigger_words}`);
      
      // 检查触发词格式
      try {
        const triggerWords = JSON.parse(rule.trigger_words);
        if (Array.isArray(triggerWords)) {
          console.log(`   解析后: ${triggerWords.join(', ')}`);
        } else {
          console.log(`   ⚠️ 触发词格式异常: ${typeof triggerWords}`);
        }
      } catch (error) {
        console.log(`   ❌ 触发词JSON解析失败: ${error.message}`);
      }
      console.log('');
    });
    
    return rules;
    
  } finally {
    await connection.end();
  }
}

/**
 * 测试规则匹配逻辑
 */
async function testRuleMatching() {
  console.log('🧪 测试规则匹配逻辑...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const testQueries = [
      '查询结构件类库存',
      '查询聚龙供应商',
      '查询风险状态',
      '查询NG测试',
      '查询项目X6827'
    ];
    
    for (const query of testQueries) {
      console.log(`\n--- 测试查询: "${query}" ---`);
      
      // 方法1: 使用LIKE匹配
      const [likeResults] = await connection.execute(`
        SELECT 
          intent_name,
          trigger_words,
          example_query
        FROM nlp_intent_rules 
        WHERE status = 'active'
        AND (
          intent_name LIKE '%${query.includes('结构件') ? '结构件' : ''}%' OR
          intent_name LIKE '%${query.includes('聚龙') ? '供应商' : ''}%' OR
          intent_name LIKE '%${query.includes('风险') ? '风险' : ''}%' OR
          intent_name LIKE '%${query.includes('NG') ? 'NG' : ''}%' OR
          intent_name LIKE '%${query.includes('项目') ? '项目' : ''}%'
        )
        LIMIT 3
      `);
      
      console.log(`LIKE匹配结果: ${likeResults.length} 个规则`);
      likeResults.forEach((rule, index) => {
        console.log(`  ${index + 1}. ${rule.intent_name}`);
      });
      
      // 方法2: 使用JSON_CONTAINS匹配
      const keywords = query.split(/[查询\s]+/).filter(word => word.length > 0);
      if (keywords.length > 0) {
        const keyword = keywords[0];
        
        const [jsonResults] = await connection.execute(`
          SELECT 
            intent_name,
            trigger_words,
            example_query
          FROM nlp_intent_rules 
          WHERE status = 'active'
          AND JSON_SEARCH(trigger_words, 'one', '%${keyword}%') IS NOT NULL
          LIMIT 3
        `);
        
        console.log(`JSON匹配结果: ${jsonResults.length} 个规则`);
        jsonResults.forEach((rule, index) => {
          console.log(`  ${index + 1}. ${rule.intent_name}`);
        });
      }
    }
    
  } finally {
    await connection.end();
  }
}

/**
 * 修复触发词格式
 */
async function fixTriggerWordsFormat() {
  console.log('\n🔧 修复触发词格式...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 获取需要修复的规则
    const [rules] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND (
        trigger_words IS NULL OR 
        trigger_words = '' OR
        trigger_words = '[]' OR
        NOT JSON_VALID(trigger_words)
      )
    `);
    
    console.log(`找到 ${rules.length} 个需要修复触发词的规则`);
    
    let fixedCount = 0;
    
    for (const rule of rules) {
      try {
        // 根据规则名称生成触发词
        let triggerWords = [];
        
        if (rule.intent_name.includes('结构件')) {
          triggerWords = ['结构件', '结构件类', '电池盖', '中框', '手机卡托', '侧键', '装饰件'];
        } else if (rule.intent_name.includes('光学')) {
          triggerWords = ['光学', '光学类', 'LCD显示屏', 'OLED显示屏', '摄像头'];
        } else if (rule.intent_name.includes('充电')) {
          triggerWords = ['充电', '充电类', '电池', '充电器'];
        } else if (rule.intent_name.includes('声学')) {
          triggerWords = ['声学', '声学类', '喇叭', '听筒'];
        } else if (rule.intent_name.includes('包')) {
          triggerWords = ['包装', '包料', '保护套', '标签', '包装盒'];
        } else if (rule.intent_name.includes('供应商')) {
          triggerWords = ['供应商', '供货商', '聚龙', '欣冠', '广正', '天马', 'BOE'];
        } else if (rule.intent_name.includes('风险')) {
          triggerWords = ['风险', '风险状态', '异常', '风险物料'];
        } else if (rule.intent_name.includes('NG')) {
          triggerWords = ['NG', '不合格', '测试失败', 'NG测试'];
        } else if (rule.intent_name.includes('项目')) {
          triggerWords = ['项目', 'X6827', 'X6828', 'X6831', 'S665LN'];
        } else if (rule.intent_name.includes('库存')) {
          triggerWords = ['库存', '库存查询', '物料库存'];
        } else if (rule.intent_name.includes('测试')) {
          triggerWords = ['测试', '检测', '检验', '测试结果'];
        } else if (rule.intent_name.includes('上线')) {
          triggerWords = ['上线', '在线', '跟踪', '上线情况'];
        } else {
          // 从规则名称中提取关键词
          const words = rule.intent_name.replace(/[查询_优化]/g, '').split(/[类情况结果]/);
          triggerWords = words.filter(word => word.length > 0);
        }
        
        if (triggerWords.length > 0) {
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET trigger_words = ?, updated_at = NOW()
            WHERE id = ?
          `, [JSON.stringify(triggerWords), rule.id]);
          
          console.log(`✅ 修复规则: ${rule.intent_name}`);
          console.log(`   新触发词: ${triggerWords.join(', ')}`);
          fixedCount++;
        }
        
      } catch (error) {
        console.log(`❌ 修复规则 ${rule.intent_name} 失败: ${error.message}`);
      }
    }
    
    console.log(`\n📊 修复结果: 成功修复 ${fixedCount} 个规则`);
    
  } finally {
    await connection.end();
  }
}

/**
 * 验证修复结果
 */
async function validateFix() {
  console.log('\n🔍 验证修复结果...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 重新测试规则匹配
    const testQuery = '查询结构件类库存';
    
    const [results] = await connection.execute(`
      SELECT 
        intent_name,
        trigger_words,
        example_query
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND JSON_SEARCH(trigger_words, 'one', '%结构件%') IS NOT NULL
      LIMIT 5
    `);
    
    console.log(`测试查询 "${testQuery}" 的匹配结果:`);
    console.log(`找到 ${results.length} 个匹配规则:`);
    
    results.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name}`);
      console.log(`   示例: ${rule.example_query}`);
      
      try {
        const triggerWords = JSON.parse(rule.trigger_words);
        console.log(`   触发词: ${triggerWords.join(', ')}`);
      } catch (error) {
        console.log(`   触发词解析失败: ${rule.trigger_words}`);
      }
    });
    
    return results.length > 0;
    
  } finally {
    await connection.end();
  }
}

async function main() {
  try {
    console.log('🚀 开始修复规则匹配问题...\n');
    
    // 1. 检查当前触发词设置
    await checkRuleTriggerWords();
    
    // 2. 测试当前匹配逻辑
    await testRuleMatching();
    
    // 3. 修复触发词格式
    await fixTriggerWordsFormat();
    
    // 4. 验证修复结果
    const isFixed = await validateFix();
    
    console.log('\n✅ 规则匹配修复完成！');
    console.log(`📊 修复状态: ${isFixed ? '成功' : '需要进一步检查'}`);
    
    if (isFixed) {
      console.log('\n🎯 下一步建议:');
      console.log('1. 重新测试智能问答功能');
      console.log('2. 启动后端API服务');
      console.log('3. 在前端验证规则匹配效果');
    }
    
    return { success: isFixed };
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
    throw error;
  }
}

main().catch(console.error);
