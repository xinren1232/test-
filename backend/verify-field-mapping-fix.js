import mysql from 'mysql2/promise';

async function verifyFieldMappingFix() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });
  
  try {
    console.log('=== 验证字段映射修复结果 ===\n');
    
    // 获取所有规则的字段映射
    const [rules] = await connection.execute(`
      SELECT id, intent_name, result_fields, action_type
      FROM nlp_intent_rules 
      WHERE action_type = 'SQL_QUERY'
      ORDER BY id
    `);
    
    console.log(`找到 ${rules.length} 条SQL查询规则\n`);
    
    let fixedCount = 0;
    let needFixCount = 0;
    
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. 规则: ${rule.intent_name}`);
      
      if (!rule.result_fields) {
        console.log(`   ❌ 字段映射: 未定义`);
        needFixCount++;
      } else {
        try {
          // 尝试解析JSON
          const fields = JSON.parse(rule.result_fields);
          if (Array.isArray(fields) && fields.length > 0) {
            console.log(`   ✅ 字段映射: ${fields.length} 个字段 - ${fields.slice(0, 3).join(', ')}${fields.length > 3 ? '...' : ''}`);
            fixedCount++;
          } else {
            console.log(`   ❌ 字段映射: 空数组`);
            needFixCount++;
          }
        } catch (error) {
          const fieldStr = typeof rule.result_fields === 'string' ? rule.result_fields : String(rule.result_fields);
          console.log(`   ❌ 字段映射: JSON格式错误 - ${fieldStr.substring(0, 50)}...`);
          needFixCount++;
        }
      }
    });
    
    console.log(`\n=== 统计结果 ===`);
    console.log(`总规则数: ${rules.length}`);
    console.log(`已修复: ${fixedCount}`);
    console.log(`需修复: ${needFixCount}`);
    
    if (needFixCount > 0) {
      console.log('\n=== 需要修复的规则 ===');
      rules.forEach(rule => {
        if (!rule.result_fields) {
          console.log(`- ${rule.intent_name}: 未定义字段映射`);
        } else {
          try {
            const fields = JSON.parse(rule.result_fields);
            if (!Array.isArray(fields) || fields.length === 0) {
              console.log(`- ${rule.intent_name}: 空字段映射`);
            }
          } catch (error) {
            console.log(`- ${rule.intent_name}: JSON格式错误`);
          }
        }
      });
    }
    
    // 测试一个具体的规则
    console.log('\n=== 测试具体规则 ===');
    const [testRule] = await connection.execute(`
      SELECT intent_name, action_target, result_fields
      FROM nlp_intent_rules 
      WHERE intent_name = 'supplier_inventory_query'
      LIMIT 1
    `);
    
    if (testRule.length > 0) {
      const rule = testRule[0];
      console.log(`规则名称: ${rule.intent_name}`);
      console.log(`SQL查询: ${rule.action_target.substring(0, 200)}...`);
      console.log(`字段映射: ${rule.result_fields}`);
      
      if (rule.result_fields) {
        try {
          const fields = JSON.parse(rule.result_fields);
          console.log(`解析后字段: ${fields.join(', ')}`);
        } catch (error) {
          console.log(`字段解析错误: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('验证过程中出错:', error);
  } finally {
    await connection.end();
  }
}

verifyFieldMappingFix().catch(console.error);
