import mysql from 'mysql2/promise';

async function checkRuleFieldMapping() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });
  
  try {
    console.log('=== 检查规则字段映射问题 ===\n');
    
    // 获取所有规则
    const [rules] = await connection.execute(`
      SELECT id, rule_name, sql_template, result_fields, scenario_type 
      FROM nlp_intent_rules 
      ORDER BY id
    `);
    
    console.log(`总共有 ${rules.length} 条规则\n`);
    
    // 分析字段映射问题
    let noFieldsCount = 0;
    let emptyFieldsCount = 0;
    let validFieldsCount = 0;
    
    console.log('=== 字段映射详细分析 ===');
    
    rules.forEach((rule, index) => {
      console.log(`\n${index + 1}. 规则ID: ${rule.id}`);
      console.log(`   规则名称: ${rule.rule_name}`);
      console.log(`   场景类型: ${rule.scenario_type || '未定义'}`);
      
      if (!rule.result_fields) {
        console.log(`   ❌ 结果字段: 未定义`);
        noFieldsCount++;
      } else if (rule.result_fields.trim() === '' || rule.result_fields === '[]') {
        console.log(`   ❌ 结果字段: 空值`);
        emptyFieldsCount++;
      } else {
        console.log(`   ✅ 结果字段: ${rule.result_fields}`);
        validFieldsCount++;
      }
      
      // 显示SQL模板的前100个字符
      console.log(`   SQL模板: ${rule.sql_template.substring(0, 100)}...`);
    });
    
    console.log('\n=== 统计结果 ===');
    console.log(`未定义字段的规则: ${noFieldsCount} 条`);
    console.log(`空字段的规则: ${emptyFieldsCount} 条`);
    console.log(`有效字段的规则: ${validFieldsCount} 条`);
    console.log(`需要修复的规则: ${noFieldsCount + emptyFieldsCount} 条`);
    
    // 按场景类型分组分析
    console.log('\n=== 按场景类型分析 ===');
    const scenarioGroups = {};
    rules.forEach(rule => {
      const scenario = rule.scenario_type || '未分类';
      if (!scenarioGroups[scenario]) {
        scenarioGroups[scenario] = [];
      }
      scenarioGroups[scenario].push(rule);
    });
    
    Object.keys(scenarioGroups).forEach(scenario => {
      const rulesInScenario = scenarioGroups[scenario];
      const needFix = rulesInScenario.filter(r => !r.result_fields || r.result_fields.trim() === '' || r.result_fields === '[]');
      console.log(`${scenario}: 总计 ${rulesInScenario.length} 条，需修复 ${needFix.length} 条`);
    });
    
  } catch (error) {
    console.error('检查过程中出错:', error);
  } finally {
    await connection.end();
  }
}

checkRuleFieldMapping().catch(console.error);
