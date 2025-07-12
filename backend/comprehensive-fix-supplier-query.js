import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

async function comprehensiveFixSupplierQuery() {
  console.log('🔧 全面修复供应商查询问题...\n');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 修复供应商库存查询规则 - 移除硬编码聚龙优先
    console.log('1. 修复供应商库存查询规则...');
    const correctSupplierSQL = `
SELECT 
  storage_location as 工厂,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
WHERE supplier_name LIKE CONCAT('%', COALESCE(?, ''), '%')
ORDER BY inbound_time DESC 
LIMIT 15`.trim();
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = ?,
        updated_at = NOW()
      WHERE intent_name = '供应商库存查询'
    `, [correctSupplierSQL]);
    
    console.log('   ✅ 供应商库存查询规则已修复');
    
    // 2. 检查并修复其他可能的硬编码问题
    console.log('\n2. 检查其他规则的硬编码问题...');
    
    const [allRules] = await connection.execute(`
      SELECT intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE action_target LIKE '%聚龙%' 
         OR action_target LIKE '%BOE%'
         OR action_target LIKE '%歌尔%'
    `);
    
    console.log(`   发现 ${allRules.length} 个规则包含硬编码供应商名称:`);
    allRules.forEach(rule => {
      console.log(`   - ${rule.intent_name}`);
    });
    
    // 3. 修复所有硬编码问题
    for (const rule of allRules) {
      if (rule.intent_name !== '供应商库存查询') {
        let fixedSQL = rule.action_target;
        
        // 移除硬编码的供应商排序
        fixedSQL = fixedSQL.replace(
          /ORDER BY\s+CASE WHEN supplier_name LIKE '%聚龙%' THEN 1 ELSE 2 END,?\s*/gi,
          'ORDER BY '
        );
        
        // 确保有正确的参数占位符
        if (!fixedSQL.includes('WHERE') && !fixedSQL.includes('?')) {
          // 如果没有WHERE条件，添加一个
          fixedSQL = fixedSQL.replace(
            /FROM\s+(\w+)\s+/gi,
            'FROM $1 WHERE 1=1 '
          );
        }
        
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, updated_at = NOW()
          WHERE intent_name = ?
        `, [fixedSQL, rule.intent_name]);
        
        console.log(`   ✅ 已修复: ${rule.intent_name}`);
      }
    }
    
    // 4. 验证修复结果
    console.log('\n3. 验证修复结果...');
    
    // 测试BOE查询
    const [boeTest] = await connection.execute(correctSupplierSQL, ['BOE']);
    console.log(`   BOE查询测试: ${boeTest.length} 条记录`);
    if (boeTest.length > 0) {
      console.log(`   - 第一条: ${boeTest[0].物料名称} | ${boeTest[0].供应商} | ${boeTest[0].数量}`);
    }
    
    // 测试聚龙查询
    const [julongTest] = await connection.execute(correctSupplierSQL, ['聚龙']);
    console.log(`   聚龙查询测试: ${julongTest.length} 条记录`);
    if (julongTest.length > 0) {
      console.log(`   - 第一条: ${julongTest[0].物料名称} | ${julongTest[0].供应商} | ${julongTest[0].数量}`);
    }
    
    // 5. 检查数据库中的供应商分布
    console.log('\n4. 检查数据库中的供应商分布...');
    const [supplierStats] = await connection.execute(`
      SELECT supplier_name, COUNT(*) as count
      FROM inventory 
      GROUP BY supplier_name
      ORDER BY count DESC
      LIMIT 10
    `);
    
    console.log('   供应商数据分布:');
    supplierStats.forEach(stat => {
      console.log(`   - ${stat.supplier_name}: ${stat.count} 条记录`);
    });
    
    console.log('\n✅ 供应商查询问题修复完成!');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

comprehensiveFixSupplierQuery();
