/**
 * 修正规则字段映射，使其与前端页面显示完全一致
 */
const mysql = require('./backend/node_modules/mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixRulesToMatchFrontend() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 修正规则字段映射，使其与前端页面显示完全一致...\n');
    
    // 1. 修正库存全信息查询规则 - 基于前端数据同步表的inventory数据
    const inventorySQL = `
    SELECT 
      factory as 工厂,
      warehouse as 仓库,
      materialCode as 物料编码,
      materialName as 物料名称,
      supplier as 供应商,
      quantity as 数量,
      status as 状态,
      batchNo as 批次,
      projectId as 项目,
      baselineId as 基线,
      DATE_FORMAT(STR_TO_DATE(inboundTime, '%Y-%m-%dT%H:%i:%s.%fZ'), '%Y-%m-%d %H:%i') as 入库时间
    FROM (
      SELECT JSON_UNQUOTE(JSON_EXTRACT(data_content, '$[*]')) as json_data
      FROM frontend_data_sync 
      WHERE data_type = 'inventory'
      ORDER BY updated_at DESC 
      LIMIT 1
    ) t
    CROSS JOIN JSON_TABLE(
      t.json_data,
      '$[*]' COLUMNS (
        factory VARCHAR(100) PATH '$.factory',
        warehouse VARCHAR(100) PATH '$.warehouse',
        materialCode VARCHAR(100) PATH '$.materialCode',
        materialName VARCHAR(100) PATH '$.materialName',
        supplier VARCHAR(100) PATH '$.supplier',
        quantity INT PATH '$.quantity',
        status VARCHAR(50) PATH '$.status',
        batchNo VARCHAR(100) PATH '$.batchNo',
        projectId VARCHAR(100) PATH '$.projectId',
        baselineId VARCHAR(100) PATH '$.baselineId',
        inboundTime VARCHAR(100) PATH '$.inboundTime'
      )
    ) jt
    ORDER BY inboundTime DESC
    LIMIT 50`;
    
    await connection.execute(`
      UPDATE assistant_rules 
      SET action_target = ?, action_type = 'SQL_QUERY'
      WHERE intent_name = '库存全信息查询'
    `, [inventorySQL]);
    
    console.log('✅ 已修正库存全信息查询规则');
    
    // 2. 修正检验全信息查询规则 - 基于前端数据同步表的inspection数据
    const inspectionSQL = `
    SELECT 
      id as 测试编号,
      DATE_FORMAT(STR_TO_DATE(testDate, '%Y-%m-%dT%H:%i:%s.%fZ'), '%Y-%m-%d') as 日期,
      projectId as 项目,
      '' as 基线,
      '' as 物料编号,
      batchNo as 批次,
      materialName as 物料名称,
      supplier as 供应商,
      testResult as 测试结果,
      defectDescription as 不良现象
    FROM (
      SELECT JSON_UNQUOTE(JSON_EXTRACT(data_content, '$[*]')) as json_data
      FROM frontend_data_sync 
      WHERE data_type = 'inspection'
      ORDER BY updated_at DESC 
      LIMIT 1
    ) t
    CROSS JOIN JSON_TABLE(
      t.json_data,
      '$[*]' COLUMNS (
        id VARCHAR(100) PATH '$.id',
        materialName VARCHAR(100) PATH '$.materialName',
        batchNo VARCHAR(100) PATH '$.batchNo',
        supplier VARCHAR(100) PATH '$.supplier',
        testResult VARCHAR(50) PATH '$.testResult',
        testDate VARCHAR(100) PATH '$.testDate',
        projectId VARCHAR(100) PATH '$.projectId',
        defectDescription TEXT PATH '$.defectDescription'
      )
    ) jt
    ORDER BY testDate DESC
    LIMIT 50`;
    
    await connection.execute(`
      UPDATE assistant_rules 
      SET action_target = ?, action_type = 'SQL_QUERY'
      WHERE intent_name = '检验全信息查询'
    `, [inspectionSQL]);
    
    console.log('✅ 已修正检验全信息查询规则');
    
    // 3. 修正生产全信息查询规则 - 基于前端数据同步表的production数据
    const productionSQL = `
    SELECT 
      factory as 工厂,
      baselineId as 基线,
      projectId as 项目,
      materialCode as 物料编号,
      materialName as 物料名称,
      supplier as 供应商,
      batchNo as 批次,
      CONCAT(defectRate, '%') as 不良率,
      defect as 不良现象,
      DATE_FORMAT(STR_TO_DATE(onlineTime, '%Y-%m-%dT%H:%i:%s.%fZ'), '%Y-%m-%d') as 检验日期
    FROM (
      SELECT JSON_UNQUOTE(JSON_EXTRACT(data_content, '$[*]')) as json_data
      FROM frontend_data_sync 
      WHERE data_type = 'production'
      ORDER BY updated_at DESC 
      LIMIT 1
    ) t
    CROSS JOIN JSON_TABLE(
      t.json_data,
      '$[*]' COLUMNS (
        factory VARCHAR(100) PATH '$.factory',
        baselineId VARCHAR(100) PATH '$.baselineId',
        projectId VARCHAR(100) PATH '$.projectId',
        materialCode VARCHAR(100) PATH '$.materialCode',
        materialName VARCHAR(100) PATH '$.materialName',
        supplier VARCHAR(100) PATH '$.supplier',
        batchNo VARCHAR(100) PATH '$.batchNo',
        defectRate DECIMAL(5,2) PATH '$.defectRate',
        defect TEXT PATH '$.defect',
        onlineTime VARCHAR(100) PATH '$.onlineTime'
      )
    ) jt
    ORDER BY onlineTime DESC
    LIMIT 50`;
    
    await connection.execute(`
      UPDATE assistant_rules 
      SET action_target = ?, action_type = 'SQL_QUERY'
      WHERE intent_name = '生产全信息查询'
    `, [productionSQL]);
    
    console.log('✅ 已修正生产全信息查询规则');
    
    console.log('\n🎯 字段映射修正完成！');
    console.log('\n📋 修正后的字段对应关系:');
    console.log('库存查询: 工厂、仓库、物料编码、物料名称、供应商、数量、状态、批次、项目、基线、入库时间');
    console.log('检验查询: 测试编号、日期、项目、基线、物料编号、批次、物料名称、供应商、测试结果、不良现象');
    console.log('生产查询: 工厂、基线、项目、物料编号、物料名称、供应商、批次、不良率、不良现象、检验日期');
    
  } finally {
    await connection.end();
  }
}

fixRulesToMatchFrontend().catch(console.error);
