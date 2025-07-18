/**
 * 修正规则字段映射，使其符合实际业务场景
 */
const mysql = require('./backend/node_modules/mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixFieldMapping() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 修正规则字段映射，使其符合业务场景...\n');
    
    // 1. 修正库存全信息查询规则
    const inventorySQL = `
    SELECT
      SUBSTRING_INDEX(storage_location, '-', 1) as 工厂,
      SUBSTRING_INDEX(storage_location, '-', -1) as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      material_type as 物料类型,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 入库时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    ORDER BY inbound_time DESC
    LIMIT 50`;
    
    await connection.execute(`
      UPDATE assistant_rules 
      SET action_target = ? 
      WHERE intent_name = '库存全信息查询'
    `, [inventorySQL]);
    
    console.log('✅ 已修正库存全信息查询规则字段映射');
    
    // 2. 修正检验全信息查询规则
    const inspectionSQL = `
    SELECT
      test_id as 测试编号,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
      material_code as 物料编码,
      material_name as 物料名称,
      material_type as 物料类型,
      supplier_name as 供应商,
      test_item as 测试项目,
      test_result as 测试结果,
      conclusion as 结论,
      COALESCE(defect_desc, '') as 缺陷描述,
      tester as 测试员
    FROM lab_tests lt
    LEFT JOIN inventory i ON lt.material_code = i.material_code
    ORDER BY test_date DESC
    LIMIT 50`;
    
    await connection.execute(`
      UPDATE assistant_rules 
      SET action_target = ? 
      WHERE intent_name = '检验全信息查询'
    `, [inspectionSQL]);
    
    console.log('✅ 已修正检验全信息查询规则字段映射');
    
    // 3. 修正生产全信息查询规则
    const productionSQL = `
    SELECT
      factory as 工厂,
      workshop as 车间,
      \`line\` as 产线,
      project as 项目,
      material_code as 物料编码,
      material_name as 物料名称,
      material_type as 物料类型,
      supplier_name as 供应商,
      CONCAT(ROUND(defect_rate * 100, 2), '%') as 缺陷率,
      exception_count as 异常次数,
      DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
      operator as 操作员
    FROM online_tracking ot
    LEFT JOIN inventory i ON ot.material_code = i.material_code
    ORDER BY online_date DESC
    LIMIT 50`;
    
    await connection.execute(`
      UPDATE assistant_rules 
      SET action_target = ? 
      WHERE intent_name = '生产全信息查询'
    `, [productionSQL]);
    
    console.log('✅ 已修正生产全信息查询规则字段映射');
    
    // 4. 修正基础查询规则，使其与前端数据同步表一致
    const basicInventorySQL = `
    SELECT
      SUBSTRING_INDEX(storage_location, '-', 1) as 工厂,
      SUBSTRING_INDEX(storage_location, '-', -1) as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      material_type as 物料类型,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 入库时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    ORDER BY inbound_time DESC
    LIMIT 20`;
    
    await connection.execute(`
      UPDATE assistant_rules 
      SET action_target = ?, action_type = 'SQL_QUERY'
      WHERE intent_name = '库存基础查询'
    `, [basicInventorySQL]);
    
    console.log('✅ 已修正库存基础查询规则字段映射');
    
    console.log('\n🎯 字段映射修正完成！');
    console.log('\n📋 修正后的字段对应关系:');
    console.log('库存查询: 工厂、仓库、物料编码、物料名称、物料类型、供应商、数量、状态、入库时间、备注');
    console.log('检验查询: 测试编号、日期、物料编码、物料名称、物料类型、供应商、测试项目、测试结果、结论、缺陷描述、测试员');
    console.log('生产查询: 工厂、车间、产线、项目、物料编码、物料名称、物料类型、供应商、缺陷率、异常次数、上线日期、操作员');
    
  } finally {
    await connection.end();
  }
}

fixFieldMapping().catch(console.error);
