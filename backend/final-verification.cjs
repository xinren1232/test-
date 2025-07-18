// 最终验证所有规则
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function finalVerification() {
  let connection;
  try {
    console.log('🎯 最终验证所有规则...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 获取所有活跃规则
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, category, trigger_words, priority
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY category, priority DESC, id
    `);
    
    console.log(`📊 总共 ${allRules.length} 条活跃规则\n`);
    
    // 2. 按类别统计和测试
    const categoryStats = {};
    let totalSuccess = 0;
    let totalEmpty = 0;
    let totalFailed = 0;
    
    for (const rule of allRules) {
      const category = rule.category || '未分类';
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, success: 0, empty: 0, failed: 0, rules: [] };
      }
      categoryStats[category].total++;
      categoryStats[category].rules.push(rule);
      
      try {
        const [sqlResult] = await connection.execute(`
          SELECT action_target FROM nlp_intent_rules WHERE id = ?
        `, [rule.id]);
        
        if (sqlResult.length === 0) {
          categoryStats[category].failed++;
          totalFailed++;
          continue;
        }
        
        const [results] = await connection.execute(sqlResult[0].action_target);
        
        if (results.length > 0) {
          categoryStats[category].success++;
          totalSuccess++;
        } else {
          categoryStats[category].empty++;
          totalEmpty++;
        }
        
      } catch (error) {
        categoryStats[category].failed++;
        totalFailed++;
      }
    }
    
    // 3. 显示按类别的统计结果
    console.log('📊 按类别统计结果:');
    console.log('='.repeat(80));
    
    for (const [category, stats] of Object.entries(categoryStats)) {
      const successRate = (stats.success / stats.total * 100).toFixed(1);
      console.log(`\n📁 ${category} (${stats.total} 条规则):`);
      console.log(`  ✅ 成功: ${stats.success} 条 (${successRate}%)`);
      console.log(`  ⚠️  空数据: ${stats.empty} 条`);
      console.log(`  ❌ 失败: ${stats.failed} 条`);
      
      // 显示该类别的前3条成功规则
      const successRules = stats.rules.filter((rule, index) => {
        try {
          // 这里简化处理，实际应该重新查询
          return index < 3;
        } catch {
          return false;
        }
      });
      
      if (successRules.length > 0) {
        console.log(`  示例规则:`);
        for (const rule of successRules.slice(0, 3)) {
          console.log(`    - 规则 ${rule.id}: ${rule.intent_name}`);
        }
      }
    }
    
    // 4. 总体统计
    console.log('\n' + '='.repeat(80));
    console.log('🎯 总体统计结果:');
    console.log('='.repeat(80));
    
    const totalRules = allRules.length;
    const successRate = (totalSuccess / totalRules * 100).toFixed(1);
    const emptyRate = (totalEmpty / totalRules * 100).toFixed(1);
    const failedRate = (totalFailed / totalRules * 100).toFixed(1);
    
    console.log(`✅ 成功执行并返回数据: ${totalSuccess} 条规则 (${successRate}%)`);
    console.log(`⚠️  执行成功但返回空数据: ${totalEmpty} 条规则 (${emptyRate}%)`);
    console.log(`❌ 执行失败: ${totalFailed} 条规则 (${failedRate}%)`);
    console.log(`📊 总计: ${totalRules} 条规则`);
    
    // 5. 测试常用查询
    console.log('\n🧪 测试常用查询匹配:');
    console.log('-'.repeat(50));
    
    const testQueries = [
      '全测试', '库存查询', '聚龙供应商', '测试结果', 
      '上线情况', '物料查询', '供应商分析', '风险识别'
    ];
    
    for (const query of testQueries) {
      try {
        const [matchedRules] = await connection.execute(`
          SELECT id, intent_name, action_target
          FROM nlp_intent_rules 
          WHERE status = 'active' 
          AND (
            JSON_CONTAINS(trigger_words, ?) 
            OR intent_name LIKE ?
            OR JSON_EXTRACT(trigger_words, '$[*]') LIKE ?
          )
          ORDER BY priority DESC
          LIMIT 1
        `, [JSON.stringify(query), `%${query}%`, `%${query}%`]);
        
        if (matchedRules.length > 0) {
          const rule = matchedRules[0];
          try {
            const [results] = await connection.execute(rule.action_target);
            console.log(`✅ "${query}": 匹配规则 ${rule.id} (${rule.intent_name}) - ${results.length} 条数据`);
          } catch (error) {
            console.log(`❌ "${query}": 匹配规则 ${rule.id} 但执行失败`);
          }
        } else {
          console.log(`⚠️  "${query}": 未找到匹配规则`);
        }
      } catch (error) {
        console.log(`❌ "${query}": 查询失败 - ${error.message.substring(0, 30)}...`);
      }
    }
    
    // 6. 性能评估
    console.log('\n📈 性能评估:');
    console.log('-'.repeat(50));
    
    if (successRate >= 80) {
      console.log(`🎉 优秀！${successRate}% 的规则能正常返回数据`);
    } else if (successRate >= 60) {
      console.log(`👍 良好！${successRate}% 的规则能正常返回数据`);
    } else {
      console.log(`⚠️  需要改进！只有 ${successRate}% 的规则能正常返回数据`);
    }
    
    if (totalEmpty > 0) {
      console.log(`📊 还有 ${totalEmpty} 条规则返回空数据，可能需要调整查询条件`);
    }
    
    if (totalFailed === 0) {
      console.log(`✅ 所有规则都能正常执行，没有SQL错误！`);
    }
    
    // 7. 建议
    console.log('\n💡 建议:');
    console.log('-'.repeat(50));
    
    if (totalSuccess >= 100) {
      console.log(`✅ 系统已经可以正常使用！大部分查询都能返回数据`);
      console.log(`✅ 用户可以尝试各种查询，如"全测试"、"库存查询"、"聚龙供应商"等`);
    }
    
    if (totalEmpty > 0) {
      console.log(`📊 建议为返回空数据的规则添加更多测试数据`);
      console.log(`📊 或者调整查询条件使其更宽松`);
    }
    
    console.log(`🔄 建议定期检查和更新规则，确保数据的时效性`);
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

finalVerification();
