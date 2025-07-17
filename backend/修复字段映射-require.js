const mysql = require('mysql2/promise');

async function fixFieldMapping() {
  let connection;
  
  try {
    console.log('🔧 开始修复字段映射...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查inventory表结构
    console.log('\n📋 检查inventory表结构...');
    const [inventoryColumns] = await connection.execute('DESCRIBE inventory');
    const inventoryFields = inventoryColumns.map(col => col.Field);
    console.log('inventory表字段:', inventoryFields.join(', '));
    
    // 2. 检查数据样本
    console.log('\n📊 检查数据样本...');
    const [inventorySample] = await connection.execute('SELECT * FROM inventory LIMIT 1');
    if (inventorySample.length > 0) {
      console.log('数据样本字段:', Object.keys(inventorySample[0]).join(', '));
      console.log('数据样本:', inventorySample[0]);
    }
    
    // 3. 修复规则243 (物料库存信息查询_优化)
    console.log('\n🔧 修复规则243...');
    
    const rule243SQL = `SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(updated_at, '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE material_name LIKE CONCAT('%', ?, '%')
ORDER BY id DESC`;
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, updated_at = NOW()
      WHERE id = 243
    `, [rule243SQL]);
    
    console.log('✅ 规则243已更新');
    
    // 4. 修复规则485 (查看所有供应商)
    console.log('\n🔧 修复规则485...');
    
    const rule485SQL = `SELECT DISTINCT 
  supplier_name as 供应商,
  COUNT(*) as 记录数量
FROM inventory 
WHERE supplier_name IS NOT NULL AND supplier_name != ''
GROUP BY supplier_name
ORDER BY 记录数量 DESC`;
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, updated_at = NOW()
      WHERE id = 485
    `, [rule485SQL]);
    
    console.log('✅ 规则485已更新');
    
    // 5. 测试修复后的规则
    console.log('\n🧪 测试修复后的规则...');
    
    // 测试规则243
    console.log('\n测试规则243:');
    try {
      const testSQL243 = rule243SQL.replace('?', "'电池'");
      const [results243] = await connection.execute(testSQL243);
      console.log(`✅ 规则243测试成功: ${results243.length}条记录`);
      if (results243.length > 0) {
        console.log('字段:', Object.keys(results243[0]).join(', '));
        console.log('样本:', results243[0]);
      }
    } catch (error) {
      console.log(`❌ 规则243测试失败: ${error.message}`);
    }
    
    // 测试规则485
    console.log('\n测试规则485:');
    try {
      const [results485] = await connection.execute(rule485SQL);
      console.log(`✅ 规则485测试成功: ${results485.length}条记录`);
      if (results485.length > 0) {
        console.log('字段:', Object.keys(results485[0]).join(', '));
        console.log('样本:', results485.slice(0, 3));
      }
    } catch (error) {
      console.log(`❌ 规则485测试失败: ${error.message}`);
    }
    
    // 6. 批量修复其他库存相关规则
    console.log('\n🔧 批量修复其他库存规则...');
    
    const otherInventoryRules = [
      { name: '供应商库存查询_优化', where: 'WHERE supplier_name LIKE CONCAT(\'%\', ?, \'%\')' },
      { name: '库存状态查询', where: 'WHERE status LIKE CONCAT(\'%\', ?, \'%\')' }
    ];
    
    const baseInventorySQL = `SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(updated_at, '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory`;
    
    for (const rule of otherInventoryRules) {
      const fullSQL = `${baseInventorySQL}\n${rule.where}\nORDER BY id DESC`;
      
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, updated_at = NOW()
        WHERE intent_name = ?
      `, [fullSQL, rule.name]);
      
      console.log(`✅ 更新规则: ${rule.name}`);
    }
    
    // 7. 修复其他数据探索规则
    console.log('\n🔧 修复其他数据探索规则...');
    
    const explorationRules = [
      {
        name: '查看所有物料',
        sql: `SELECT DISTINCT 
  material_name as 物料名称,
  material_code as 物料编码,
  COUNT(*) as 记录数量
FROM inventory 
WHERE material_name IS NOT NULL AND material_name != ''
GROUP BY material_name, material_code
ORDER BY 记录数量 DESC`
      },
      {
        name: '查看库存状态分布',
        sql: `SELECT 
  status as 状态, 
  COUNT(*) as 数量,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM inventory), 2) as 占比
FROM inventory 
WHERE status IS NOT NULL AND status != ''
GROUP BY status 
ORDER BY 数量 DESC`
      }
    ];
    
    for (const rule of explorationRules) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, updated_at = NOW()
        WHERE intent_name = ?
      `, [rule.sql, rule.name]);
      
      console.log(`✅ 更新规则: ${rule.name}`);
    }
    
    console.log('\n🎉 字段映射修复完成！');
    console.log('✅ 所有库存相关规则已修复');
    console.log('✅ 数据探索规则已修复');
    console.log('✅ 规则现在应该返回正确的中文字段名');
    
  } catch (error) {
    console.error('❌ 字段映射修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

fixFieldMapping().catch(console.error);
