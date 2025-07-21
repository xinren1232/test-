import mysql from 'mysql2/promise';

async function fixJsonFieldMapping() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });
  
  try {
    console.log('=== 修复JSON字段映射格式 ===\n');
    
    // 获取所有需要修复的规则
    const [rules] = await connection.execute(`
      SELECT id, intent_name, result_fields
      FROM nlp_intent_rules 
      WHERE action_type = 'SQL_QUERY' AND result_fields IS NOT NULL
      ORDER BY id
    `);
    
    console.log(`找到 ${rules.length} 条需要修复的规则\n`);
    
    for (const rule of rules) {
      console.log(`处理规则: ${rule.intent_name}`);
      
      // 将逗号分隔的字符串转换为JSON数组
      const fieldsStr = rule.result_fields;
      const fieldsArray = fieldsStr.split(',').map(field => field.trim());
      const jsonFields = JSON.stringify(fieldsArray);
      
      console.log(`  原格式: ${fieldsStr}`);
      console.log(`  新格式: ${jsonFields}`);
      
      // 更新数据库
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET result_fields = ? 
        WHERE id = ?
      `, [jsonFields, rule.id]);
      
      console.log(`  ✅ 已更新\n`);
    }
    
    // 验证修复结果
    console.log('=== 验证修复结果 ===');
    const [updatedRules] = await connection.execute(`
      SELECT id, intent_name, result_fields
      FROM nlp_intent_rules 
      WHERE action_type = 'SQL_QUERY'
      ORDER BY id
    `);
    
    let successCount = 0;
    updatedRules.forEach(rule => {
      try {
        const fields = JSON.parse(rule.result_fields);
        if (Array.isArray(fields) && fields.length > 0) {
          console.log(`✅ ${rule.intent_name}: ${fields.length} 个字段`);
          successCount++;
        } else {
          console.log(`❌ ${rule.intent_name}: 空数组`);
        }
      } catch (error) {
        console.log(`❌ ${rule.intent_name}: JSON解析失败`);
      }
    });
    
    console.log(`\n=== 修复完成 ===`);
    console.log(`总规则数: ${updatedRules.length}`);
    console.log(`修复成功: ${successCount}`);
    console.log(`修复失败: ${updatedRules.length - successCount}`);
    
  } catch (error) {
    console.error('修复过程中出错:', error);
  } finally {
    await connection.end();
  }
}

fixJsonFieldMapping().catch(console.error);
