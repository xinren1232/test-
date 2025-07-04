/**
 * 检查深圳工厂库存数据
 */
import mysql from 'mysql2/promise';

async function checkShenzhenFactory() {
  console.log('🏭 检查深圳工厂库存数据\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 1. 查询深圳工厂总库存数量
    console.log('📊 步骤1: 深圳工厂库存总数...');
    const [countResult] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM inventory 
      WHERE storage_location LIKE '%深圳%'
    `);
    console.log(`🏭 深圳工厂库存总数: ${countResult[0].count} 条`);
    
    // 2. 查询所有工厂的库存分布
    console.log('\n🏭 步骤2: 各工厂库存分布...');
    const [factoryResult] = await connection.query(`
      SELECT 
        storage_location as 工厂,
        COUNT(*) as 库存数量
      FROM inventory 
      GROUP BY storage_location 
      ORDER BY COUNT(*) DESC
    `);
    console.table(factoryResult);
    
    // 3. 查询深圳工厂库存详情（前10条）
    console.log('\n📦 步骤3: 深圳工厂库存详情（前10条）...');
    const [detailResult] = await connection.query(`
      SELECT 
        material_name as 物料名称,
        supplier_name as 供应商,
        batch_code as 批次号,
        quantity as 数量,
        status as 状态,
        storage_location as 工厂
      FROM inventory 
      WHERE storage_location LIKE '%深圳%'
      ORDER BY id
      LIMIT 10
    `);
    console.table(detailResult);
    
    // 4. 检查工厂查询规则的SQL
    console.log('\n📋 步骤4: 检查工厂查询规则...');
    const [ruleResult] = await connection.query(`
      SELECT intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%工厂%'
    `);
    
    if (ruleResult.length > 0) {
      console.log('工厂查询规则SQL:');
      console.log(ruleResult[0].action_target);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
  }
}

checkShenzhenFactory();
