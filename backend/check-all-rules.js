import initializeDatabase from './src/models/index.js';

async function checkAllRules() {
  console.log('🔍 逐一检查所有规则的设计逻辑和数据返回...\n');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    // 获取所有规则
    const rulesQuery = "SELECT * FROM nlp_intent_rules ORDER BY priority DESC, id ASC";
    const rules = await sequelize.query(rulesQuery, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log(`📋 共找到 ${rules.length} 个规则，开始逐一检查...\n`);
    
    let successCount = 0;
    let failCount = 0;
    let emptyCount = 0;
    
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      console.log(`\n=== 规则 ${i + 1}/${rules.length}: ${rule.intent_name} ===`);
      console.log(`示例查询: ${rule.example_query}`);
      console.log(`SQL模板: ${rule.action_target}`);
      console.log(`触发词: ${rule.trigger_words}`);
      
      try {
        // 测试SQL执行
        let testResults;
        let hasParams = false;
        
        // 检查SQL是否包含参数占位符
        if (rule.action_target.includes('?') || rule.action_target.includes('{{')) {
          console.log('⚠️  SQL包含参数，尝试不同的测试方式...');
          hasParams = true;
          
          // 尝试用示例查询中的关键词替换参数
          let testSQL = rule.action_target;
          
          // 简单的参数替换逻辑
          if (rule.example_query.includes('PASS') || rule.example_query.includes('FAIL')) {
            testSQL = testSQL.replace(/\?/g, "'PASS'");
          } else if (rule.example_query.includes('库存') || rule.example_query.includes('物料')) {
            testSQL = testSQL.replace(/\?/g, "'%'");
          } else if (rule.example_query.includes('供应商')) {
            testSQL = testSQL.replace(/\?/g, "'%'");
          } else {
            // 默认替换为通配符
            testSQL = testSQL.replace(/\?/g, "'%'");
          }
          
          console.log(`修正后SQL: ${testSQL}`);
          testResults = await sequelize.query(testSQL, {
            type: sequelize.QueryTypes.SELECT
          });
        } else {
          // 直接执行SQL
          testResults = await sequelize.query(rule.action_target, {
            type: sequelize.QueryTypes.SELECT
          });
        }
        
        console.log(`✅ SQL执行成功，返回 ${testResults.length} 条记录`);
        
        if (testResults.length > 0) {
          successCount++;
          console.log(`📊 数据示例:`, JSON.stringify(testResults[0], null, 2));
        } else {
          emptyCount++;
          console.log('⚠️  返回0条数据，需要检查设计逻辑');
          
          // 分析可能的问题
          await analyzeEmptyResult(rule, sequelize);
        }
        
      } catch (error) {
        failCount++;
        console.log(`❌ SQL执行失败: ${error.message}`);
        
        // 分析SQL语法问题
        await analyzeSQLError(rule, error, sequelize);
      }
      
      console.log('─'.repeat(80));
    }
    
    console.log(`\n📊 检查总结:`);
    console.log(`✅ 成功返回数据: ${successCount} 个规则`);
    console.log(`⚠️  返回空数据: ${emptyCount} 个规则`);
    console.log(`❌ 执行失败: ${failCount} 个规则`);
    console.log(`📋 总计: ${rules.length} 个规则`);
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

async function analyzeEmptyResult(rule, sequelize) {
  console.log('🔍 分析空结果原因...');
  
  try {
    // 检查相关表是否有数据
    if (rule.action_target.includes('inventory')) {
      const [inventoryCount] = await sequelize.query('SELECT COUNT(*) as count FROM inventory', {
        type: sequelize.QueryTypes.SELECT
      });
      console.log(`📦 inventory表记录数: ${inventoryCount.count}`);
    }
    
    if (rule.action_target.includes('lab_tests')) {
      const [labCount] = await sequelize.query('SELECT COUNT(*) as count FROM lab_tests', {
        type: sequelize.QueryTypes.SELECT
      });
      console.log(`🧪 lab_tests表记录数: ${labCount.count}`);
    }
    
    if (rule.action_target.includes('online_tracking')) {
      const [trackingCount] = await sequelize.query('SELECT COUNT(*) as count FROM online_tracking', {
        type: sequelize.QueryTypes.SELECT
      });
      console.log(`📡 online_tracking表记录数: ${trackingCount.count}`);
    }
    
    if (rule.action_target.includes('material_batches')) {
      const [batchCount] = await sequelize.query('SELECT COUNT(*) as count FROM material_batches', {
        type: sequelize.QueryTypes.SELECT
      });
      console.log(`📦 material_batches表记录数: ${batchCount.count}`);
    }
    
  } catch (error) {
    console.log(`❌ 分析失败: ${error.message}`);
  }
}

async function analyzeSQLError(rule, error, sequelize) {
  console.log('🔍 分析SQL错误...');
  
  if (error.message.includes('Unknown column')) {
    console.log('❌ 字段不存在错误，检查表结构...');
    
    // 检查表结构
    const tables = ['inventory', 'lab_tests', 'online_tracking', 'material_batches'];
    for (const table of tables) {
      if (rule.action_target.includes(table)) {
        try {
          const columns = await sequelize.query(`DESCRIBE ${table}`, {
            type: sequelize.QueryTypes.SELECT
          });
          console.log(`📋 ${table}表字段:`, columns.map(col => col.Field).join(', '));
        } catch (e) {
          console.log(`❌ 无法获取${table}表结构: ${e.message}`);
        }
      }
    }
  }
  
  if (error.message.includes('syntax error')) {
    console.log('❌ SQL语法错误，需要修正SQL模板');
  }
}

checkAllRules();
