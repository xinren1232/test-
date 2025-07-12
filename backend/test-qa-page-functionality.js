import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 测试智能问答页面的所有规则功能
async function testQAPageFunctionality() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🧪 测试智能问答页面功能\n');
    console.log('=' .repeat(60));
    
    // 定义测试用例 - 基于更新后的规则
    const testCases = [
      // 基础查询规则测试
      {
        category: '基础查询',
        tests: [
          { name: '物料库存查询', query: '查询电池库存', rule: '物料库存查询' },
          { name: '供应商库存查询', query: '查询BOE供应商库存', rule: '供应商库存查询' },
          { name: 'NG测试结果查询', query: '查询测试失败(NG)的记录', rule: 'NG测试结果查询' },
          { name: '风险库存查询', query: '查询风险状态的库存', rule: '风险库存查询' },
          { name: '物料测试情况查询', query: '查询LCD显示屏测试情况', rule: '物料测试情况查询' },
          { name: '供应商测试情况查询', query: '查询天马供应商测试情况', rule: '供应商测试情况查询' },
          { name: '项目测试情况查询', query: '查询I6789项目测试情况', rule: '项目测试情况查询' },
          { name: '基线测试情况查询', query: '查询X6827基线测试情况', rule: '基线测试情况查询' },
          { name: '物料上线情况查询', query: '查询电池上线情况', rule: '物料上线情况查询' },
          { name: '数据范围提示', query: '系统支持查询哪些数据', rule: '数据范围提示' }
        ]
      },
      // 高级分析规则测试
      {
        category: '高级分析',
        tests: [
          { name: '批次综合信息查询', query: '查询批次的综合信息', rule: '批次综合信息查询' },
          { name: 'Top缺陷排行查询', query: '查询Top缺陷排行', rule: 'Top缺陷排行查询' },
          { name: '供应商对比分析', query: '对比聚龙和天马供应商表现', rule: '供应商对比分析' },
          { name: '物料对比分析', query: '对比电池和LCD显示屏质量表现', rule: '物料对比分析' },
          { name: '精确物料查询', query: '精确查询电池（排除电池盖）', rule: '精确物料查询' },
          { name: '智能物料匹配', query: '智能匹配显示相关物料', rule: '智能物料匹配' }
        ]
      }
    ];
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = [];
    
    // 执行测试
    for (const category of testCases) {
      console.log(`\n📋 ${category.category}测试`);
      console.log('-'.repeat(40));
      
      for (const test of category.tests) {
        totalTests++;
        console.log(`\n🔍 测试: ${test.name}`);
        console.log(`   查询: ${test.query}`);
        
        try {
          // 查找对应的规则
          const [rules] = await connection.execute(`
            SELECT action_target, action_type FROM nlp_intent_rules 
            WHERE intent_name = ? OR intent_name LIKE ?
          `, [test.rule, `%${test.rule}%`]);
          
          if (rules.length === 0) {
            console.log(`   ❌ 规则不存在: ${test.rule}`);
            failedTests.push({ test: test.name, reason: '规则不存在' });
            continue;
          }
          
          const rule = rules[0];
          
          // 检查规则类型
          if (rule.action_type === 'information_display') {
            console.log(`   ✅ 信息展示规则正常`);
            console.log(`   📝 内容长度: ${rule.action_target.length}字符`);
            passedTests++;
            continue;
          }
          
          // 执行SQL查询测试
          if (rule.action_type === 'SQL_QUERY') {
            let sql = rule.action_target;
            
            // 根据查询类型替换参数
            if (test.query.includes('电池')) {
              for (let i = 0; i < 12; i++) {
                sql = sql.replace('?', "'电池'");
              }
            } else if (test.query.includes('BOE')) {
              for (let i = 0; i < 12; i++) {
                sql = sql.replace('?', "'BOE'");
              }
            } else if (test.query.includes('LCD显示屏')) {
              for (let i = 0; i < 12; i++) {
                sql = sql.replace('?', "'LCD显示屏'");
              }
            } else if (test.query.includes('天马')) {
              for (let i = 0; i < 12; i++) {
                sql = sql.replace('?', "'天马'");
              }
            } else if (test.query.includes('I6789')) {
              for (let i = 0; i < 12; i++) {
                sql = sql.replace('?', "'I6789'");
              }
            } else if (test.query.includes('X6827')) {
              for (let i = 0; i < 12; i++) {
                sql = sql.replace('?', "'X6827'");
              }
            } else if (test.query.includes('风险')) {
              for (let i = 0; i < 12; i++) {
                sql = sql.replace('?', "'风险'");
              }
            } else {
              // 默认参数
              for (let i = 0; i < 12; i++) {
                sql = sql.replace('?', "'测试'");
              }
            }
            
            const [results] = await connection.execute(sql);
            console.log(`   ✅ 查询成功: ${results.length}条结果`);
            
            if (results.length > 0) {
              const sampleResult = results[0];
              const keys = Object.keys(sampleResult);
              if (keys.length >= 2) {
                console.log(`   📝 示例: ${sampleResult[keys[0]]} - ${sampleResult[keys[1]]}`);
              }
            }
            
            passedTests++;
          }
          
        } catch (error) {
          console.log(`   ❌ 测试失败: ${error.message.substring(0, 50)}...`);
          failedTests.push({ test: test.name, reason: error.message.substring(0, 100) });
        }
      }
    }
    
    // 测试结果汇总
    console.log('\n📊 测试结果汇总');
    console.log('=' .repeat(40));
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过测试: ${passedTests}`);
    console.log(`失败测试: ${failedTests.length}`);
    console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests.length > 0) {
      console.log('\n❌ 失败测试详情:');
      failedTests.forEach((fail, index) => {
        console.log(`  ${index + 1}. ${fail.test}: ${fail.reason}`);
      });
    }
    
    // 性能测试
    console.log('\n⚡ 性能测试');
    console.log('-'.repeat(20));
    
    const performanceTests = [
      { query: '电池', rule: '物料库存查询' },
      { query: 'BOE', rule: '供应商库存查询' },
      { query: 'LCD显示屏', rule: '物料测试情况查询' }
    ];
    
    for (const perfTest of performanceTests) {
      const startTime = Date.now();
      
      try {
        const [rules] = await connection.execute(`
          SELECT action_target FROM nlp_intent_rules WHERE intent_name = ?
        `, [perfTest.rule]);
        
        if (rules.length > 0) {
          let sql = rules[0].action_target;
          for (let i = 0; i < 12; i++) {
            sql = sql.replace('?', `'${perfTest.query}'`);
          }
          
          const [results] = await connection.execute(sql);
          const endTime = Date.now();
          
          console.log(`  "${perfTest.query}": ${results.length}条结果, ${endTime - startTime}ms`);
        }
      } catch (error) {
        console.log(`  "${perfTest.query}": 查询失败`);
      }
    }
    
    // 数据完整性检查
    console.log('\n🔍 数据完整性检查');
    console.log('-'.repeat(25));
    
    // 检查规则数量
    const [ruleCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = 'active'
    `);
    console.log(`活跃规则数量: ${ruleCount[0].count}`);
    
    // 检查数据表记录数
    const tables = ['inventory', 'lab_tests', 'online_tracking', 'batch_management'];
    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${table}表记录数: ${count[0].count}`);
      } catch (error) {
        console.log(`${table}表: 查询失败`);
      }
    }
    
    console.log('\n🎯 智能问答页面功能测试完成！');
    
    // 生成测试建议
    console.log('\n💡 优化建议:');
    if (passedTests / totalTests >= 0.9) {
      console.log('  ✅ 系统功能完善，可以投入使用');
    } else if (passedTests / totalTests >= 0.7) {
      console.log('  ⚠️  部分功能需要优化，建议修复失败项');
    } else {
      console.log('  ❌ 系统需要大幅优化，建议全面检查');
    }
    
    console.log('  📊 建议添加表格展示功能');
    console.log('  📈 建议集成图表生成工具');
    console.log('  🎨 建议优化回答呈现格式');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await connection.end();
  }
}

testQAPageFunctionality();
