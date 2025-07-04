/**
 * 修复参数提取配置
 */

import mysql from 'mysql2/promise';

async function fixParameterExtraction() {
  console.log('🔧 修复参数提取配置\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 1. 修复工厂查询规则的参数配置
    console.log('🔧 步骤1: 修复工厂查询规则...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        parameters = ?,
        action_target = ?
      WHERE intent_name LIKE '%工厂%' AND id = 82
    `, [
      JSON.stringify({
        "factory": {
          "type": "string",
          "description": "工厂名称",
          "extract_from": ["深圳工厂", "重庆工厂", "南昌工厂", "宜宾工厂", "深圳", "重庆", "南昌", "宜宾"],
          "mapping": {
            "深圳": "深圳工厂",
            "重庆": "重庆工厂", 
            "南昌": "南昌工厂",
            "宜宾": "宜宾工厂"
          }
        }
      }),
      'SELECT * FROM inventory WHERE storage_location LIKE CONCAT("%", ?, "%") ORDER BY inbound_time DESC'
    ]);
    console.log('✅ 工厂查询规则参数配置已更新');
    
    // 2. 修复测试查询规则的参数配置
    console.log('🔧 步骤2: 修复测试查询规则...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        parameters = ?,
        action_target = ?
      WHERE intent_name LIKE '%测试%' AND id = 81
    `, [
      JSON.stringify({
        "test_result": {
          "type": "string",
          "description": "测试结果",
          "extract_from": ["PASS", "FAIL", "OK", "NG", "合格", "不合格", "通过", "失败"],
          "mapping": {
            "OK": "PASS",
            "合格": "PASS",
            "通过": "PASS",
            "NG": "FAIL",
            "不合格": "FAIL",
            "失败": "FAIL"
          }
        }
      }),
      'SELECT * FROM lab_tests WHERE test_result LIKE CONCAT("%", ?, "%") ORDER BY test_date DESC'
    ]);
    console.log('✅ 测试查询规则参数配置已更新');
    
    // 3. 修复生产查询规则的参数配置
    console.log('🔧 步骤3: 修复生产查询规则...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        parameters = ?,
        action_target = ?
      WHERE intent_name LIKE '%生产%' AND id = 80
    `, [
      JSON.stringify({
        "factory": {
          "type": "string",
          "description": "工厂名称",
          "extract_from": ["深圳工厂", "重庆工厂", "南昌工厂", "宜宾工厂", "深圳", "重庆", "南昌", "宜宾"],
          "mapping": {
            "深圳": "深圳工厂",
            "重庆": "重庆工厂",
            "南昌": "南昌工厂", 
            "宜宾": "宜宾工厂"
          }
        }
      }),
      'SELECT * FROM online_tracking WHERE factory LIKE CONCAT("%", ?, "%") ORDER BY online_date DESC'
    ]);
    console.log('✅ 生产查询规则参数配置已更新');
    
    // 4. 验证更新结果
    console.log('\n📋 步骤4: 验证更新结果...');
    const [updatedRules] = await connection.query(`
      SELECT id, intent_name, parameters, action_target 
      FROM nlp_intent_rules 
      WHERE id IN (80, 81, 82)
      ORDER BY id
    `);
    
    console.log('更新后的规则配置:');
    for (const rule of updatedRules) {
      console.log(`\n${rule.id}. ${rule.intent_name}`);
      console.log(`   SQL: ${rule.action_target}`);
      console.log(`   参数配置: ${rule.parameters ? '已配置' : '未配置'}`);
      if (rule.parameters) {
        try {
          const params = typeof rule.parameters === 'string' ?
            JSON.parse(rule.parameters) : rule.parameters;
          console.log(`   参数详情: ${Object.keys(params).join(', ')}`);
        } catch (e) {
          console.log(`   参数详情: 解析错误 - ${rule.parameters}`);
        }
      }
    }
    
    await connection.end();
    console.log('\n✅ 参数提取配置修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

fixParameterExtraction();
