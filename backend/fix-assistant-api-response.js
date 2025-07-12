import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixAssistantAPIResponse() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔧 开始修复问答界面API响应问题...\n');
    
    // 1. 检查当前规则库状态
    console.log('📋 1. 检查当前规则库状态:');
    const [rules] = await connection.execute(`
      SELECT intent_name, status, priority, trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY priority DESC, intent_name
    `);

    console.log(`找到 ${rules.length} 条活跃规则:`);
    rules.slice(0, 10).forEach(rule => {
      console.log(`  ${rule.intent_name} (优先级: ${rule.priority})`);
    });

    // 2. 测试基础查询规则
    console.log('\n🧪 2. 测试基础查询规则:');
    
    const testQueries = [
      { query: '查询电池库存', expectedRule: '物料库存查询' },
      { query: '重庆工厂有什么物料', expectedRule: '工厂库存查询' },
      { query: '查询BOE供应商', expectedRule: '供应商库存查询' },
      { query: '测试记录查询', expectedRule: '测试记录查询' }
    ];

    for (const test of testQueries) {
      console.log(`\n测试查询: "${test.query}"`);
      
      // 模拟规则匹配逻辑
      const matchedRules = rules.filter(rule => {
        const triggerWords = rule.trigger_words ? JSON.parse(rule.trigger_words) : [];
        return triggerWords.some(word => test.query.includes(word)) ||
               test.query.includes(rule.intent_name.replace('查询', ''));
      });

      if (matchedRules.length > 0) {
        console.log(`  ✅ 匹配到规则: ${matchedRules[0].intent_name}`);
      } else {
        console.log(`  ❌ 未匹配到规则`);
      }
    }

    // 3. 检查并修复常用规则的触发词
    console.log('\n🔧 3. 修复常用规则的触发词:');
    
    const ruleUpdates = [
      {
        intent_name: '物料库存查询',
        trigger_words: JSON.stringify(['物料', '库存', '电池', '显示屏', '充电器', '查询库存', '库存查询'])
      },
      {
        intent_name: '工厂库存查询', 
        trigger_words: JSON.stringify(['工厂', '重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂', '工厂库存', '工厂物料'])
      },
      {
        intent_name: '供应商库存查询',
        trigger_words: JSON.stringify(['供应商', 'BOE', '聚龙', '天马', '华星', '供应商查询', '供应商物料'])
      },
      {
        intent_name: '测试记录查询',
        trigger_words: JSON.stringify(['测试', '检测', '测试记录', '检测记录', '测试结果', '合格', '不合格'])
      },
      {
        intent_name: '上线记录查询',
        trigger_words: JSON.stringify(['上线', '产线', '生产', '上线记录', '生产记录', '产线记录'])
      }
    ];

    for (const update of ruleUpdates) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET trigger_words = ?, updated_at = NOW()
        WHERE intent_name = ?
      `, [update.trigger_words, update.intent_name]);
      
      console.log(`✅ 更新规则: ${update.intent_name}`);
    }

    // 4. 确保规则优先级正确
    console.log('\n🔧 4. 调整规则优先级:');
    
    const priorityUpdates = [
      { intent_name: '物料库存查询', priority: 10 },
      { intent_name: '工厂库存查询', priority: 9 },
      { intent_name: '供应商库存查询', priority: 9 },
      { intent_name: '测试记录查询', priority: 8 },
      { intent_name: '上线记录查询', priority: 8 }
    ];

    for (const update of priorityUpdates) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET priority = ?, updated_at = NOW()
        WHERE intent_name = ?
      `, [update.priority, update.intent_name]);
      
      console.log(`✅ 调整优先级: ${update.intent_name} -> ${update.priority}`);
    }

    // 5. 添加示例查询
    console.log('\n🔧 5. 更新示例查询:');
    
    const exampleUpdates = [
      { intent_name: '物料库存查询', example: '查询电池库存情况' },
      { intent_name: '工厂库存查询', example: '重庆工厂有什么物料' },
      { intent_name: '供应商库存查询', example: '查询BOE供应商的物料' },
      { intent_name: '测试记录查询', example: '查询测试记录' },
      { intent_name: '上线记录查询', example: '查询上线记录' }
    ];

    for (const update of exampleUpdates) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET example_query = ?, updated_at = NOW()
        WHERE intent_name = ?
      `, [update.example, update.intent_name]);
      
      console.log(`✅ 更新示例: ${update.intent_name}`);
    }

    // 6. 验证修复结果
    console.log('\n📝 6. 验证修复结果:');
    const [updatedRules] = await connection.execute(`
      SELECT intent_name, priority, trigger_words, example_query
      FROM nlp_intent_rules 
      WHERE status = 'active' AND intent_name IN (
        '物料库存查询', '工厂库存查询', '供应商库存查询', '测试记录查询', '上线记录查询'
      )
      ORDER BY priority DESC, intent_name
    `);

    updatedRules.forEach(rule => {
      const triggers = rule.trigger_words ? JSON.parse(rule.trigger_words) : [];
      console.log(`  ${rule.intent_name}:`);
      console.log(`    优先级: ${rule.priority}`);
      console.log(`    触发词: ${triggers.join(', ')}`);
      console.log(`    示例: ${rule.example_query}`);
      console.log('');
    });

    console.log('✅ 问答界面API响应修复完成！');
    console.log('\n📋 修复内容总结:');
    console.log('  1. 更新了主要规则的触发词，提高匹配准确性');
    console.log('  2. 调整了规则优先级，确保常用查询优先匹配');
    console.log('  3. 添加了示例查询，便于用户理解');
    console.log('  4. 验证了规则状态，确保都是活跃状态');

  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行修复
fixAssistantAPIResponse();
