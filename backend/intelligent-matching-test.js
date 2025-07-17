import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 智能匹配算法
async function intelligentMatching(query, connection) {
  console.log(`🔍 智能匹配: "${query}"`);
  
  // 1. 提取关键词
  const keywords = query.toLowerCase().match(/[\u4e00-\u9fa5a-zA-Z0-9]+/g) || [];
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
  
  // 3. 构建匹配条件
  const conditions = [];
  const params = [];
  
  // 如果识别到场景，优先匹配该场景
  if (targetScenario) {
    conditions.push('category = ?');
    params.push(targetScenario);
  }
  
  // 添加关键词匹配条件
  keywords.forEach(keyword => {
    conditions.push('(intent_name LIKE ? OR JSON_UNQUOTE(JSON_EXTRACT(trigger_words, "$")) LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`);
  });
  
  if (conditions.length === 0) return [];
  
  // 4. 执行匹配查询
  const sql = `
    SELECT 
      intent_name, 
      category, 
      priority, 
      example_query,
      action_target,
      trigger_words,
      (
        CASE WHEN intent_name LIKE ? THEN 100 ELSE 0 END +
        CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(trigger_words, "$")) LIKE ? THEN 50 ELSE 0 END +
        CASE WHEN category = ? THEN 30 ELSE 0 END
      ) as match_score
    FROM nlp_intent_rules 
    WHERE status = 'active'
    AND (${conditions.join(' AND ')})
    ORDER BY match_score DESC, priority DESC, sort_order ASC
    LIMIT 5
  `;
  
  // 添加计算匹配分数的参数
  const scoreParams = [`%${query}%`, `%${query}%`, targetScenario || ''];
  const allParams = [...scoreParams, ...params];
  
  const [matches] = await connection.execute(sql, allParams);
  
  console.log(`   匹配结果: ${matches.length} 条`);
  matches.forEach((match, index) => {
    console.log(`     ${index + 1}. ${match.intent_name} (${match.category}, 分数:${match.match_score})`);
  });
  
  return matches;
}

async function testIntelligentMatching() {
  console.log('🧠 测试智能匹配算法...\n');
  
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
      }
    ];
    
    let passedTests = 0;
    
    for (const testCase of testCases) {
      console.log(`\n📋 测试: ${testCase.name}`);
      
      const matches = await intelligentMatching(testCase.query, connection);
      
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
            
            // 显示前3条数据的字段
            if (sqlResult.length > 0) {
              const fields = Object.keys(sqlResult[0]);
              console.log(`   📋 返回字段: [${fields.join(', ')}]`);
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
    console.log('\n📊 智能匹配测试报告:');
    console.log('========================');
    console.log(`✅ 测试通过率: ${passedTests}/${testCases.length} (${Math.round(passedTests/testCases.length*100)}%)`);
    
    if (passedTests >= testCases.length * 0.8) {
      console.log('🎉 智能匹配算法表现良好！');
    } else {
      console.log('⚠️  智能匹配算法需要进一步优化。');
    }
    
    // 验证场景分布
    console.log('\n📋 验证场景分布:');
    const [scenarioStats] = await connection.execute(`
      SELECT category, COUNT(*) as count 
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      GROUP BY category
    `);
    
    scenarioStats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat.count} 条规则`);
    });
    
    // 验证字段统一性
    console.log('\n🔧 验证字段统一性:');
    
    const scenarios = ['库存场景', '测试场景', '上线场景'];
    const expectedFields = {
      '库存场景': ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
      '测试场景': ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
      '上线场景': ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注']
    };
    
    for (const scenario of scenarios) {
      const [sampleRule] = await connection.execute(`
        SELECT action_target
        FROM nlp_intent_rules 
        WHERE status = 'active'
        AND category = ?
        LIMIT 1
      `, [scenario]);
      
      if (sampleRule.length > 0) {
        const sql = sampleRule[0].action_target;
        const fields = expectedFields[scenario];
        const missingFields = fields.filter(field => !sql.includes(field));
        
        if (missingFields.length === 0) {
          console.log(`   ✅ ${scenario}: 字段完整`);
        } else {
          console.log(`   ⚠️  ${scenario}: 缺少字段 [${missingFields.join(', ')}]`);
        }
      }
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testIntelligentMatching();
