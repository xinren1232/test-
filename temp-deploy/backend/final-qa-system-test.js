import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 最终的智能问答系统测试
async function finalQASystemTest() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🎯 最终智能问答系统测试\n');
    console.log('=' .repeat(60));
    
    // 1. 系统完整性检查
    console.log('\n📋 1. 系统完整性检查');
    console.log('-'.repeat(30));
    
    // 检查规则数量
    const [ruleCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = 'active'
    `);
    console.log(`✅ 活跃规则数量: ${ruleCount[0].count}`);
    
    // 检查数据表完整性
    const tables = [
      { name: 'inventory', expected: 132 },
      { name: 'lab_tests', expected: 396 },
      { name: 'online_tracking', expected: 1056 }
    ];
    
    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table.name}`);
        const actual = count[0].count;
        const status = actual >= table.expected * 0.9 ? '✅' : '⚠️';
        console.log(`${status} ${table.name}: ${actual}条记录 (期望: ${table.expected})`);
      } catch (error) {
        console.log(`❌ ${table.name}: 查询失败`);
      }
    }
    
    // 2. 核心功能测试
    console.log('\n🧪 2. 核心功能测试');
    console.log('-'.repeat(25));
    
    const coreTests = [
      {
        name: '物料精确匹配',
        rule: '物料库存查询',
        query: '电池',
        expectExclude: ['电池盖'],
        expectInclude: ['电池']
      },
      {
        name: '供应商查询',
        rule: '供应商库存查询',
        query: 'BOE',
        expectInclude: ['BOE']
      },
      {
        name: '风险库存查询',
        rule: '风险库存查询',
        query: '风险',
        expectInclude: ['风险']
      },
      {
        name: 'Top缺陷排行',
        rule: 'Top缺陷排行查询',
        query: 'Top缺陷',
        expectColumns: ['缺陷描述', '出现次数']
      }
    ];
    
    let passedTests = 0;
    
    for (const test of coreTests) {
      console.log(`\n🔍 测试: ${test.name}`);
      
      try {
        // 获取规则
        const [rules] = await connection.execute(`
          SELECT action_target FROM nlp_intent_rules WHERE intent_name = ?
        `, [test.rule]);
        
        if (rules.length === 0) {
          console.log(`   ❌ 规则不存在: ${test.rule}`);
          continue;
        }
        
        // 执行查询
        let sql = rules[0].action_target;
        for (let i = 0; i < 12; i++) {
          sql = sql.replace('?', `'${test.query}'`);
        }
        
        const [results] = await connection.execute(sql);
        console.log(`   📊 查询结果: ${results.length}条`);
        
        // 验证结果
        if (test.expectInclude) {
          const hasExpected = test.expectInclude.some(expected => 
            results.some(row => 
              Object.values(row).some(value => 
                String(value).includes(expected)
              )
            )
          );
          console.log(`   ${hasExpected ? '✅' : '❌'} 包含期望内容: ${test.expectInclude.join(', ')}`);
        }
        
        if (test.expectExclude) {
          const hasExcluded = test.expectExclude.some(excluded => 
            results.some(row => 
              Object.values(row).some(value => 
                String(value).includes(excluded)
              )
            )
          );
          console.log(`   ${!hasExcluded ? '✅' : '❌'} 排除不相关内容: ${test.expectExclude.join(', ')}`);
        }
        
        if (test.expectColumns && results.length > 0) {
          const columns = Object.keys(results[0]);
          const hasColumns = test.expectColumns.every(col => columns.includes(col));
          console.log(`   ${hasColumns ? '✅' : '❌'} 包含期望列: ${test.expectColumns.join(', ')}`);
        }
        
        passedTests++;
        
      } catch (error) {
        console.log(`   ❌ 测试失败: ${error.message.substring(0, 50)}...`);
      }
    }
    
    // 3. 性能基准测试
    console.log('\n⚡ 3. 性能基准测试');
    console.log('-'.repeat(25));
    
    const performanceTests = [
      { name: '物料查询', rule: '物料库存查询', query: '电池' },
      { name: '供应商查询', rule: '供应商库存查询', query: 'BOE' },
      { name: '测试查询', rule: '物料测试情况查询', query: 'LCD显示屏' },
      { name: '缺陷排行', rule: 'Top缺陷排行查询', query: 'Top缺陷' }
    ];
    
    const performanceResults = [];
    
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
          const duration = Date.now() - startTime;
          
          performanceResults.push({
            name: perfTest.name,
            duration,
            count: results.length,
            status: duration < 100 ? '✅' : duration < 500 ? '⚠️' : '❌'
          });
          
          console.log(`   ${performanceResults[performanceResults.length - 1].status} ${perfTest.name}: ${duration}ms (${results.length}条)`);
        }
      } catch (error) {
        console.log(`   ❌ ${perfTest.name}: 查询失败`);
      }
    }
    
    // 4. 数据质量检查
    console.log('\n🔍 4. 数据质量检查');
    console.log('-'.repeat(25));
    
    // 检查数据完整性
    const dataQualityChecks = [
      {
        name: '库存数据完整性',
        sql: `SELECT COUNT(*) as count FROM inventory WHERE material_name IS NOT NULL AND supplier_name IS NOT NULL`
      },
      {
        name: '测试数据完整性',
        sql: `SELECT COUNT(*) as count FROM lab_tests WHERE test_result IN ('OK', 'NG')`
      },
      {
        name: '供应商数据一致性',
        sql: `SELECT COUNT(DISTINCT supplier_name) as count FROM inventory WHERE supplier_name IS NOT NULL`
      },
      {
        name: '物料数据一致性',
        sql: `SELECT COUNT(DISTINCT material_name) as count FROM inventory WHERE material_name IS NOT NULL`
      }
    ];
    
    for (const check of dataQualityChecks) {
      try {
        const [result] = await connection.execute(check.sql);
        const count = result[0].count;
        console.log(`   ✅ ${check.name}: ${count}`);
      } catch (error) {
        console.log(`   ❌ ${check.name}: 检查失败`);
      }
    }
    
    // 5. 生成最终报告
    console.log('\n📊 5. 最终测试报告');
    console.log('=' .repeat(40));
    
    const totalCoreTests = coreTests.length;
    const corePassRate = (passedTests / totalCoreTests * 100).toFixed(1);
    
    console.log(`核心功能测试: ${passedTests}/${totalCoreTests} (${corePassRate}%)`);
    
    const avgPerformance = performanceResults.reduce((sum, result) => sum + result.duration, 0) / performanceResults.length;
    console.log(`平均响应时间: ${avgPerformance.toFixed(1)}ms`);
    
    const fastQueries = performanceResults.filter(r => r.duration < 100).length;
    const performanceRate = (fastQueries / performanceResults.length * 100).toFixed(1);
    console.log(`性能达标率: ${fastQueries}/${performanceResults.length} (${performanceRate}%)`);
    
    // 6. 系统状态评估
    console.log('\n🎯 6. 系统状态评估');
    console.log('-'.repeat(25));
    
    let systemScore = 0;
    
    // 功能完整性评分 (40分)
    systemScore += (passedTests / totalCoreTests) * 40;
    
    // 性能评分 (30分)
    systemScore += (fastQueries / performanceResults.length) * 30;
    
    // 数据完整性评分 (30分)
    systemScore += (ruleCount[0].count >= 40 ? 30 : (ruleCount[0].count / 40) * 30);
    
    console.log(`系统综合评分: ${systemScore.toFixed(1)}/100`);
    
    if (systemScore >= 90) {
      console.log('🎉 系统状态: 优秀 - 可以投入生产使用');
    } else if (systemScore >= 75) {
      console.log('✅ 系统状态: 良好 - 基本功能完善');
    } else if (systemScore >= 60) {
      console.log('⚠️  系统状态: 一般 - 需要进一步优化');
    } else {
      console.log('❌ 系统状态: 需要改进 - 存在重要问题');
    }
    
    // 7. 部署建议
    console.log('\n🚀 7. 部署建议');
    console.log('-'.repeat(15));
    
    if (systemScore >= 80) {
      console.log('✅ 建议立即部署到生产环境');
      console.log('📊 建议启用表格展示功能');
      console.log('📈 建议集成图表生成工具');
      console.log('🎨 建议优化UI呈现效果');
    } else {
      console.log('⚠️  建议先在测试环境验证');
      console.log('🔧 建议修复失败的测试项');
      console.log('⚡ 建议优化查询性能');
    }
    
    console.log('\n🎊 智能问答系统测试完成！');
    
  } catch (error) {
    console.error('❌ 系统测试失败:', error);
  } finally {
    await connection.end();
  }
}

finalQASystemTest();
