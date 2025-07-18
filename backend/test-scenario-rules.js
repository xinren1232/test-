// 测试三个场景的规则系统
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 测试查询示例
const testQueries = [
  // 库存场景测试
  {
    query: '查询电池的库存情况',
    expectedScenario: '库存场景',
    description: '库存场景 - 物料查询'
  },
  {
    query: '查询聚龙供应商的库存',
    expectedScenario: '库存场景', 
    description: '库存场景 - 供应商查询'
  },
  {
    query: '查询正常状态的库存',
    expectedScenario: '库存场景',
    description: '库存场景 - 状态查询'
  },
  {
    query: '查询结构件类的库存情况',
    expectedScenario: '库存场景',
    description: '库存场景 - 物料类别查询'
  },
  
  // 测试场景测试
  {
    query: '查询BOE供应商的测试结果',
    expectedScenario: '测试场景',
    description: '测试场景 - 供应商测试查询'
  },
  {
    query: '查询NG测试结果',
    expectedScenario: '测试场景',
    description: '测试场景 - 测试结果查询'
  },
  {
    query: '查询电池的测试情况',
    expectedScenario: '测试场景',
    description: '测试场景 - 物料测试查询'
  },
  {
    query: '查询光学类的测试情况',
    expectedScenario: '测试场景',
    description: '测试场景 - 类别测试查询'
  },
  
  // 上线场景测试
  {
    query: '查询电池的上线情况',
    expectedScenario: '上线场景',
    description: '上线场景 - 物料上线查询'
  },
  {
    query: '查询聚龙供应商的上线数据',
    expectedScenario: '上线场景',
    description: '上线场景 - 供应商上线查询'
  },
  {
    query: '查询不良率超过5%的记录',
    expectedScenario: '上线场景',
    description: '上线场景 - 不良率查询'
  },
  {
    query: '查询重庆工厂的上线记录',
    expectedScenario: '上线场景',
    description: '上线场景 - 工厂上线查询'
  }
];

async function testScenarioRules() {
  let connection;
  
  try {
    console.log('🧪 开始测试三个场景的规则系统...');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查规则总数
    const [ruleCount] = await connection.execute(`
      SELECT category, COUNT(*) as count 
      FROM nlp_intent_rules 
      WHERE category IN ('库存场景', '测试场景', '上线场景')
      GROUP BY category
      ORDER BY category
    `);
    
    console.log('\n📊 规则统计:');
    ruleCount.forEach(rule => {
      console.log(`  ${rule.category}: ${rule.count} 条规则`);
    });
    
    // 2. 测试规则匹配
    console.log('\n🔍 测试规则匹配效果:');
    
    let successCount = 0;
    let totalCount = testQueries.length;
    
    for (const test of testQueries) {
      console.log(`\n📝 测试: ${test.query}`);
      console.log(`   期望场景: ${test.expectedScenario}`);
      
      // 查找匹配的规则
      const [matchedRules] = await connection.execute(`
        SELECT intent_name, category, example_query, priority
        FROM nlp_intent_rules 
        WHERE category = ? 
        AND (
          example_query LIKE ? 
          OR JSON_EXTRACT(trigger_words, '$') LIKE ?
          OR intent_name LIKE ?
        )
        ORDER BY priority DESC
        LIMIT 3
      `, [
        test.expectedScenario,
        `%${test.query.replace('查询', '').trim()}%`,
        `%${test.query.replace('查询', '').trim()}%`,
        `%${test.query.replace('查询', '').trim()}%`
      ]);
      
      if (matchedRules.length > 0) {
        console.log(`   ✅ 找到 ${matchedRules.length} 条匹配规则:`);
        matchedRules.forEach((rule, index) => {
          console.log(`      ${index + 1}. ${rule.intent_name} (优先级: ${rule.priority})`);
          console.log(`         示例: ${rule.example_query}`);
        });
        successCount++;
      } else {
        console.log(`   ❌ 未找到匹配规则`);
      }
    }
    
    // 3. 显示测试结果
    console.log(`\n📈 测试结果统计:`);
    console.log(`   总测试数: ${totalCount}`);
    console.log(`   成功匹配: ${successCount}`);
    console.log(`   成功率: ${(successCount / totalCount * 100).toFixed(1)}%`);
    
    // 4. 检查每个场景的代表性规则
    console.log('\n🎯 各场景代表性规则:');
    
    for (const scenario of ['库存场景', '测试场景', '上线场景']) {
      console.log(`\n📋 ${scenario}:`);
      
      const [sampleRules] = await connection.execute(`
        SELECT intent_name, example_query, priority
        FROM nlp_intent_rules 
        WHERE category = ?
        ORDER BY priority DESC, sort_order ASC
        LIMIT 5
      `, [scenario]);
      
      sampleRules.forEach((rule, index) => {
        console.log(`   ${index + 1}. ${rule.intent_name}`);
        console.log(`      示例: ${rule.example_query}`);
        console.log(`      优先级: ${rule.priority}`);
      });
    }
    
    console.log('\n🎉 场景规则测试完成！');
    
    if (successCount === totalCount) {
      console.log('✅ 所有测试查询都能正确匹配到对应场景的规则');
    } else {
      console.log(`⚠️  有 ${totalCount - successCount} 个查询未能正确匹配，可能需要进一步优化规则`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testScenarioRules().catch(console.error);
