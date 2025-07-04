/**
 * 检查规则SQL模板
 */
import mysql from 'mysql2/promise';

async function checkRuleSQL() {
  console.log('🔍 检查规则SQL模板\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 查看状态查询规则的SQL
    console.log('📋 状态查询规则的SQL模板:');
    const [statusRule] = await connection.query('SELECT intent_name, action_target FROM nlp_intent_rules WHERE intent_name LIKE "%状态查询%"');
    
    if (statusRule.length > 0) {
      console.log('规则名称:', statusRule[0].intent_name);
      console.log('SQL模板:');
      console.log(statusRule[0].action_target);
    }
    
    // 查看供应商查询规则的SQL
    console.log('\n📋 供应商查询规则的SQL模板:');
    const [supplierRule] = await connection.query('SELECT intent_name, action_target FROM nlp_intent_rules WHERE intent_name LIKE "%供应商查询%"');
    
    if (supplierRule.length > 0) {
      console.log('规则名称:', supplierRule[0].intent_name);
      console.log('SQL模板:');
      console.log(supplierRule[0].action_target);
    }
    
    // 查看供应商物料查询规则的SQL
    console.log('\n📋 供应商物料查询规则的SQL模板:');
    const [supplierMaterialRule] = await connection.query('SELECT intent_name, action_target FROM nlp_intent_rules WHERE intent_name LIKE "%供应商物料查询%"');
    
    if (supplierMaterialRule.length > 0) {
      console.log('规则名称:', supplierMaterialRule[0].intent_name);
      console.log('SQL模板:');
      console.log(supplierMaterialRule[0].action_target);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
  }
}

checkRuleSQL();
