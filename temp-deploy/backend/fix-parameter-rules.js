/**
 * 修复带参数的规则
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixParameterRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 修复带参数的规则...');
    
    // 修复工厂库存查询规则
    console.log('\n🔧 修复工厂库存查询规则...');
    
    const fixedFactorySQL = `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  COALESCE(material_name, '未知') as 物料类型,
  supplier_name as 供应商名称,
  supplier_name as 供应商,
  SUM(quantity) as 数量,
  status as 状态,
  DATE_FORMAT(MAX(inbound_time), '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(MAX(inbound_time), INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  '' as 备注
FROM inventory 
GROUP BY storage_location, material_name, supplier_name, status
ORDER BY 数量 DESC
LIMIT 10`;
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [fixedFactorySQL, '工厂库存查询']
    );
    
    // 修复供应商查询规则
    console.log('\n🔧 修复供应商查询规则...');
    
    const fixedSupplierSQL = `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  COALESCE(material_name, '未知') as 物料类型,
  supplier_name as 供应商名称,
  supplier_name as 供应商,
  SUM(quantity) as 数量,
  status as 状态,
  DATE_FORMAT(MAX(inbound_time), '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(MAX(inbound_time), INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  '' as 备注
FROM inventory 
GROUP BY storage_location, material_name, supplier_name, status
ORDER BY 数量 DESC
LIMIT 10`;
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [fixedSupplierSQL, '供应商查询']
    );
    
    // 测试修复后的规则
    console.log('\n🧪 测试修复后的规则...');
    
    const [factoryRule] = await connection.execute(
      'SELECT action_target FROM nlp_intent_rules WHERE intent_name = ?',
      ['工厂库存查询']
    );
    
    if (factoryRule.length > 0) {
      try {
        const [results] = await connection.execute(factoryRule[0].action_target);
        console.log('✅ 工厂库存查询规则执行成功');
        console.log(`返回字段: ${Object.keys(results[0] || {}).join(', ')}`);
        console.log(`返回记录数: ${results.length}`);
      } catch (error) {
        console.log(`❌ 工厂库存查询规则执行失败: ${error.message}`);
      }
    }
    
    const [supplierRule] = await connection.execute(
      'SELECT action_target FROM nlp_intent_rules WHERE intent_name = ?',
      ['供应商查询']
    );
    
    if (supplierRule.length > 0) {
      try {
        const [results] = await connection.execute(supplierRule[0].action_target);
        console.log('✅ 供应商查询规则执行成功');
        console.log(`返回字段: ${Object.keys(results[0] || {}).join(', ')}`);
        console.log(`返回记录数: ${results.length}`);
      } catch (error) {
        console.log(`❌ 供应商查询规则执行失败: ${error.message}`);
      }
    }
    
    console.log('\n🎉 参数规则修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await connection.end();
  }
}

fixParameterRules().catch(console.error);
