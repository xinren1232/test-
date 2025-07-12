import mysql from 'mysql2/promise';

async function fixBatchSQL() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });
  
  try {
    console.log('🔧 修复库存查询SQL，添加批次字段...\n');
    
    // 更新结构件类库存查询规则
    const newSQL = `SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE (material_name = '电池盖' OR material_name = '中框' OR material_name = '手机卡托' OR material_name = '侧键' OR material_name = '装饰件')
ORDER BY material_name, inbound_time DESC`;
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name LIKE '%结构件%' AND intent_name LIKE '%库存%'
    `, [newSQL]);
    
    console.log('✅ 已更新结构件类库存查询规则');
    
    // 更新其他库存相关规则
    const inventoryRules = [
      {
        pattern: '%风险库存%',
        sql: `SELECT
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE status = '风险'
ORDER BY inbound_time DESC`
      },
      {
        pattern: '%库存状态%',
        sql: `SELECT
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
ORDER BY inbound_time DESC`
      }
    ];
    
    for (const rule of inventoryRules) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?
        WHERE intent_name LIKE ?
      `, [rule.sql, rule.pattern]);
      
      console.log(`✅ 已更新规则: ${rule.pattern}`);
    }
    
    console.log('\n🧪 测试修复后的SQL...');
    const [testResults] = await connection.execute(newSQL);
    console.log(`✅ 查询成功，返回 ${testResults.length} 条记录`);
    
    if (testResults.length > 0) {
      console.log('📊 第一条记录的字段:');
      Object.keys(testResults[0]).forEach(key => {
        console.log(`  ${key}: ${testResults[0][key]}`);
      });
      
      // 统计批次
      const batchCodes = new Set();
      testResults.forEach(item => {
        if (item.批次号) {
          batchCodes.add(item.批次号);
        }
      });
      console.log(`\n📊 批次统计: ${batchCodes.size} 个不同批次`);
    }
    
  } finally {
    await connection.end();
  }
}

fixBatchSQL().catch(console.error);
