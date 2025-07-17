import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 修复后的智能匹配算法
async function fixedIntelligentMatching(query, connection) {
  console.log(`🔍 修复匹配: "${query}"`);
  
  // 1. 改进关键词提取 - 分词而不是整句
  const keywords = [];
  
  // 提取中文词汇
  const chineseWords = query.match(/[\u4e00-\u9fa5]+/g) || [];
  keywords.push(...chineseWords);
  
  // 提取英文词汇
  const englishWords = query.match(/[a-zA-Z]+/g) || [];
  keywords.push(...englishWords);
  
  // 提取数字
  const numbers = query.match(/\d+/g) || [];
  keywords.push(...numbers);
  
  console.log(`   关键词: [${keywords.join(', ')}]`);
  
  // 2. 场景识别
  let targetScenario = '';
  if (keywords.some(k => ['库存', '库存信息', '库存查询', '库存情况'].includes(k))) {
    targetScenario = '库存场景';
  } else if (keywords.some(k => ['测试', '测试信息', '测试查询', '测试情况'].includes(k))) {
    targetScenario = '测试场景';
  } else if (keywords.some(k => ['上线', '上线信息', '上线查询', '上线情况'].includes(k))) {
    targetScenario = '上线场景';
  }
  
  console.log(`   识别场景: ${targetScenario || '未识别'}`);
  
  // 3. 构建更灵活的匹配条件
  const conditions = [];
  const params = [];
  
  // 为每个关键词创建匹配条件
  keywords.forEach(keyword => {
    conditions.push(`(
      intent_name LIKE ? OR 
      JSON_UNQUOTE(JSON_EXTRACT(trigger_words, '$')) LIKE ? OR
      example_query LIKE ?
    )`);
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  });
  
  if (conditions.length === 0) return [];
  
  // 4. 执行匹配查询
  let sql = `
    SELECT 
      intent_name, 
      category, 
      priority, 
      example_query,
      action_target,
      trigger_words,
      (
        CASE WHEN intent_name LIKE ? THEN 100 ELSE 0 END +
        CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(trigger_words, '$')) LIKE ? THEN 50 ELSE 0 END +
        CASE WHEN example_query LIKE ? THEN 30 ELSE 0 END
      ) as match_score
    FROM nlp_intent_rules 
    WHERE status = 'active'
    AND (${conditions.join(' OR ')})
  `;
  
  // 如果识别到场景，优先该场景
  if (targetScenario) {
    sql += ` AND category = '${targetScenario}'`;
  }
  
  sql += ` ORDER BY match_score DESC, priority DESC, sort_order ASC LIMIT 5`;
  
  // 添加计算匹配分数的参数
  const scoreParams = [`%${query}%`, `%${query}%`, `%${query}%`];
  const allParams = [...scoreParams, ...params];
  
  const [matches] = await connection.execute(sql, allParams);
  
  console.log(`   匹配结果: ${matches.length} 条`);
  matches.forEach((match, index) => {
    console.log(`     ${index + 1}. ${match.intent_name} (${match.category}, 分数:${match.match_score})`);
  });
  
  return matches;
}

async function testFixedMatching() {
  console.log('🔧 测试修复后的匹配算法...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 测试用例
    const testCases = [
      {
        name: '聚龙供应商库存查询',
        query: '查询聚龙供应商的库存',
        expectedRule: '聚龙供应商库存查询',
        expectedCategory: '库存场景'
      },
      {
        name: '聚龙库存简化查询',
        query: '聚龙库存',
        expectedRule: '聚龙供应商库存查询',
        expectedCategory: '库存场景'
      },
      {
        name: 'BOE供应商库存查询',
        query: 'BOE供应商库存',
        expectedRule: 'BOE供应商库存查询',
        expectedCategory: '库存场景'
      },
      {
        name: 'BOE上线查询',
        query: 'BOE供应商上线情况',
        expectedRule: 'BOE供应商上线查询',
        expectedCategory: '上线场景'
      },
      {
        name: '结构件类测试查询',
        query: '查询结构件类测试情况',
        expectedRule: '结构件类测试查询',
        expectedCategory: '测试场景'
      },
      {
        name: '光学类库存查询',
        query: '查询光学类库存',
        expectedRule: '光学类库存查询',
        expectedCategory: '库存场景'
      },
      {
        name: '充电类上线查询',
        query: '查询充电类上线情况',
        expectedRule: '充电类上线查询',
        expectedCategory: '上线场景'
      },
      {
        name: '基础库存查询',
        query: '物料库存情况',
        expectedRule: '库存信息查询',
        expectedCategory: '库存场景'
      },
      {
        name: '基础测试查询',
        query: '物料测试情况',
        expectedRule: '测试信息查询',
        expectedCategory: '测试场景'
      },
      {
        name: '基础上线查询',
        query: '物料上线情况',
        expectedRule: '上线信息查询',
        expectedCategory: '上线场景'
      }
    ];
    
    let passedTests = 0;
    
    for (const testCase of testCases) {
      console.log(`\n📋 测试: ${testCase.name}`);
      
      const matches = await fixedIntelligentMatching(testCase.query, connection);
      
      if (matches.length > 0) {
        const topMatch = matches[0];
        const isCorrect = topMatch.intent_name === testCase.expectedRule && 
                         topMatch.category === testCase.expectedCategory;
        
        if (isCorrect) {
          console.log(`   ✅ 匹配正确!`);
          passedTests++;
          
          // 测试SQL执行
          try {
            const [sqlResult] = await connection.execute(topMatch.action_target);
            console.log(`   📊 数据查询: 返回 ${sqlResult.length} 条记录`);
            
            // 显示字段验证
            if (sqlResult.length > 0) {
              const fields = Object.keys(sqlResult[0]);
              console.log(`   📋 返回字段: [${fields.slice(0, 5).join(', ')}...]`);
            }
            
          } catch (sqlError) {
            console.log(`   ❌ SQL执行失败: ${sqlError.message}`);
          }
          
        } else {
          console.log(`   ⚠️  匹配结果: ${topMatch.intent_name} (${topMatch.category})`);
          console.log(`   📋 期望结果: ${testCase.expectedRule} (${testCase.expectedCategory})`);
        }
      } else {
        console.log(`   ❌ 未找到匹配规则`);
      }
    }
    
    // 总结报告
    console.log('\n📊 修复后匹配测试报告:');
    console.log('==========================');
    console.log(`✅ 测试通过率: ${passedTests}/${testCases.length} (${Math.round(passedTests/testCases.length*100)}%)`);
    
    if (passedTests >= testCases.length * 0.8) {
      console.log('🎉 修复后匹配算法表现良好！');
    } else if (passedTests >= testCases.length * 0.6) {
      console.log('⚠️  修复后匹配算法有所改善，但仍需优化。');
    } else {
      console.log('❌ 修复后匹配算法仍需大幅改进。');
    }
    
    // 数据验证
    console.log('\n📊 数据验证:');
    
    const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    const [testCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    
    console.log(`   库存数据: ${inventoryCount[0].count} 条`);
    console.log(`   测试数据: ${testCount[0].count} 条`);
    console.log(`   上线数据: ${onlineCount[0].count} 条`);
    
    // 供应商验证
    const [supplierCount] = await connection.execute(`
      SELECT COUNT(DISTINCT supplier_name) as count 
      FROM inventory 
      WHERE supplier_name IS NOT NULL
    `);
    console.log(`   供应商数量: ${supplierCount[0].count} 个`);
    
    // 最终建议
    console.log('\n💡 优化建议:');
    if (passedTests < testCases.length * 0.8) {
      console.log('   1. 进一步优化触发词设计');
      console.log('   2. 增加同义词和变体');
      console.log('   3. 调整匹配算法权重');
      console.log('   4. 考虑模糊匹配策略');
    } else {
      console.log('   1. 系统已基本可用');
      console.log('   2. 可以集成到前端Q&A系统');
      console.log('   3. 建议收集用户反馈进一步优化');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testFixedMatching();
