// 详细检查所有规则
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkAllRulesDetailed() {
  let connection;
  try {
    console.log('🔍 详细检查所有规则...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 获取所有活跃规则
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, action_target, trigger_words, category, priority
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY id ASC
    `);
    
    console.log(`📊 总共 ${allRules.length} 条活跃规则\n`);
    
    let successCount = 0;
    let errorCount = 0;
    let emptyCount = 0;
    const errorRules = [];
    const emptyRules = [];
    
    // 2. 逐个测试每条规则
    for (let i = 0; i < allRules.length; i++) {
      const rule = allRules[i];
      const progress = `[${i + 1}/${allRules.length}]`;
      
      console.log(`${progress} 测试规则 ${rule.id}: ${rule.intent_name}`);
      
      try {
        if (!rule.action_target || rule.action_target.trim() === '') {
          console.log(`  ❌ SQL为空`);
          errorRules.push({...rule, error: 'SQL为空'});
          errorCount++;
          continue;
        }
        
        if (rule.action_target === 'inspection_data' || rule.action_target.includes('inspection_data')) {
          console.log(`  ❌ SQL内容错误: inspection_data`);
          errorRules.push({...rule, error: 'SQL内容错误'});
          errorCount++;
          continue;
        }
        
        const [results] = await connection.execute(rule.action_target);
        
        if (results.length === 0) {
          console.log(`  ⚠️  执行成功但返回0条数据`);
          emptyRules.push(rule);
          emptyCount++;
        } else {
          console.log(`  ✅ 执行成功: ${results.length} 条数据`);
          successCount++;
        }
        
      } catch (error) {
        console.log(`  ❌ 执行失败: ${error.message.substring(0, 80)}...`);
        errorRules.push({...rule, error: error.message});
        errorCount++;
      }
      
      // 每10条规则显示一次进度
      if ((i + 1) % 10 === 0) {
        console.log(`\n--- 进度 ${i + 1}/${allRules.length} ---`);
        console.log(`成功: ${successCount}, 空数据: ${emptyCount}, 失败: ${errorCount}\n`);
      }
    }
    
    // 3. 总结报告
    console.log('\n' + '='.repeat(60));
    console.log('📊 最终统计报告');
    console.log('='.repeat(60));
    console.log(`✅ 成功执行: ${successCount} 条规则 (${(successCount/allRules.length*100).toFixed(1)}%)`);
    console.log(`⚠️  返回空数据: ${emptyCount} 条规则 (${(emptyCount/allRules.length*100).toFixed(1)}%)`);
    console.log(`❌ 执行失败: ${errorCount} 条规则 (${(errorCount/allRules.length*100).toFixed(1)}%)`);
    console.log(`📊 总计: ${allRules.length} 条规则`);
    
    // 4. 详细列出有问题的规则
    if (errorRules.length > 0) {
      console.log('\n❌ 执行失败的规则详情:');
      console.log('-'.repeat(40));
      
      // 按错误类型分组
      const errorTypes = {};
      for (const rule of errorRules) {
        let errorType = '其他错误';
        if (rule.error.includes('inspection_data')) {
          errorType = 'SQL内容错误';
        } else if (rule.error.includes('syntax')) {
          errorType = 'SQL语法错误';
        } else if (rule.error.includes('Table') || rule.error.includes('table')) {
          errorType = '表不存在';
        } else if (rule.error.includes('Column') || rule.error.includes('column')) {
          errorType = '字段不存在';
        }
        
        if (!errorTypes[errorType]) {
          errorTypes[errorType] = [];
        }
        errorTypes[errorType].push(rule);
      }
      
      for (const [errorType, rules] of Object.entries(errorTypes)) {
        console.log(`\n${errorType} (${rules.length} 条):`);
        for (const rule of rules.slice(0, 5)) { // 只显示前5条
          console.log(`  规则 ${rule.id}: ${rule.intent_name}`);
          console.log(`    错误: ${rule.error.substring(0, 100)}...`);
        }
        if (rules.length > 5) {
          console.log(`  ... 还有 ${rules.length - 5} 条类似错误`);
        }
      }
    }
    
    if (emptyRules.length > 0) {
      console.log('\n⚠️  返回空数据的规则 (前10条):');
      console.log('-'.repeat(40));
      for (const rule of emptyRules.slice(0, 10)) {
        console.log(`规则 ${rule.id}: ${rule.intent_name} (${rule.category})`);
      }
      if (emptyRules.length > 10) {
        console.log(`... 还有 ${emptyRules.length - 10} 条`);
      }
    }
    
    // 5. 修复建议
    console.log('\n💡 修复建议:');
    console.log('-'.repeat(40));
    
    if (errorCount > 0) {
      console.log(`🔧 需要修复 ${errorCount} 条错误规则`);
      console.log(`   建议批量修复SQL内容错误和语法错误`);
    }
    
    if (emptyCount > 0) {
      console.log(`📊 ${emptyCount} 条规则返回空数据`);
      console.log(`   建议检查查询条件和数据库内容`);
    }
    
    if (successCount === allRules.length) {
      console.log(`🎉 所有规则都正常工作！`);
    } else {
      console.log(`⚠️  需要修复 ${errorCount + emptyCount} 条规则`);
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAllRulesDetailed();
