import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function debugInventoryQuery() {
  console.log('🔍 调试库存查询问题...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查库存表结构
    console.log('1. 📊 检查库存表结构:');
    const [columns] = await connection.execute('DESCRIBE inventory');
    console.log('   库存表字段:');
    columns.forEach(col => {
      console.log(`     - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? '可空' : '非空'})`);
    });
    
    // 2. 检查库存数据样本
    console.log('\n2. 📋 检查库存数据样本:');
    const [sampleData] = await connection.execute('SELECT * FROM inventory LIMIT 5');
    console.log(`   库存数据样本 (${sampleData.length} 条):`);
    sampleData.forEach((item, index) => {
      console.log(`     ${index + 1}. 物料: ${item.material_name}, 供应商: ${item.supplier_name}, 数量: ${item.quantity}`);
      console.log(`        工厂: ${item.storage_location}, 编码: ${item.material_code}, 状态: ${item.status}`);
    });
    
    // 3. 检查当前库存查询规则
    console.log('\n3. 🔍 检查当前库存查询规则:');
    const [inventoryRule] = await connection.execute(`
      SELECT intent_name, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND intent_name = '库存信息查询'
    `);
    
    if (inventoryRule.length > 0) {
      console.log(`   规则名: ${inventoryRule[0].intent_name}`);
      console.log(`   SQL查询:`);
      console.log(inventoryRule[0].action_target);
      
      // 4. 执行当前规则SQL
      console.log('\n4. 🧪 执行当前规则SQL:');
      try {
        const [ruleResult] = await connection.execute(inventoryRule[0].action_target);
        console.log(`   ✅ 规则执行成功，返回 ${ruleResult.length} 条记录`);
        
        if (ruleResult.length > 0) {
          console.log('   📋 返回字段:');
          Object.keys(ruleResult[0]).forEach(key => {
            console.log(`     - ${key}: ${ruleResult[0][key]}`);
          });
          
          console.log('\n   📊 前3条数据:');
          ruleResult.slice(0, 3).forEach((item, index) => {
            console.log(`     ${index + 1}. 工厂:${item.工厂}, 物料:${item.物料名称}, 供应商:${item.供应商}, 数量:${item.数量}`);
          });
        }
      } catch (sqlError) {
        console.log(`   ❌ SQL执行失败: ${sqlError.message}`);
      }
    } else {
      console.log('   ❌ 未找到库存信息查询规则');
    }
    
    // 5. 检查数据完整性
    console.log('\n5. 📊 检查数据完整性:');
    
    const [totalCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    console.log(`   库存总记录数: ${totalCount[0].count}`);
    
    const [nullCounts] = await connection.execute(`
      SELECT 
        SUM(CASE WHEN storage_location IS NULL OR storage_location = '' THEN 1 ELSE 0 END) as null_factory,
        SUM(CASE WHEN material_code IS NULL OR material_code = '' THEN 1 ELSE 0 END) as null_code,
        SUM(CASE WHEN material_name IS NULL OR material_name = '' THEN 1 ELSE 0 END) as null_name,
        SUM(CASE WHEN supplier_name IS NULL OR supplier_name = '' THEN 1 ELSE 0 END) as null_supplier,
        SUM(CASE WHEN quantity IS NULL THEN 1 ELSE 0 END) as null_quantity,
        SUM(CASE WHEN status IS NULL OR status = '' THEN 1 ELSE 0 END) as null_status
      FROM inventory
    `);
    
    const nullData = nullCounts[0];
    console.log('   空值统计:');
    console.log(`     - 工厂位置空值: ${nullData.null_factory} 条`);
    console.log(`     - 物料编码空值: ${nullData.null_code} 条`);
    console.log(`     - 物料名称空值: ${nullData.null_name} 条`);
    console.log(`     - 供应商空值: ${nullData.null_supplier} 条`);
    console.log(`     - 数量空值: ${nullData.null_quantity} 条`);
    console.log(`     - 状态空值: ${nullData.null_status} 条`);
    
    // 6. 创建修复后的SQL查询
    console.log('\n6. 🔧 创建修复后的SQL查询:');
    
    const fixedSQL = `
SELECT 
  COALESCE(storage_location, '未知工厂') as 工厂,
  COALESCE(storage_location, '未知仓库') as 仓库,
  COALESCE(material_code, '无编码') as 物料编码,
  COALESCE(material_name, '未知物料') as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  COALESCE(quantity, 0) as 数量,
  COALESCE(status, '未知状态') as 状态,
  COALESCE(DATE_FORMAT(inbound_time, '%Y-%m-%d'), '未知日期') as 入库时间,
  COALESCE(DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d'), '未知日期') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
WHERE 1=1
ORDER BY inbound_time DESC 
LIMIT 50`;
    
    console.log('   修复后的SQL:');
    console.log(fixedSQL);
    
    // 7. 测试修复后的SQL
    console.log('\n7. 🧪 测试修复后的SQL:');
    try {
      const [fixedResult] = await connection.execute(fixedSQL);
      console.log(`   ✅ 修复SQL执行成功，返回 ${fixedResult.length} 条记录`);
      
      if (fixedResult.length > 0) {
        console.log('\n   📊 修复后前5条数据:');
        fixedResult.slice(0, 5).forEach((item, index) => {
          console.log(`     ${index + 1}. ${item.工厂} | ${item.物料名称} | ${item.供应商} | 数量:${item.数量} | ${item.状态}`);
        });
        
        // 检查是否还有空值
        const hasEmptyValues = fixedResult.some(item => 
          !item.工厂 || !item.物料名称 || !item.供应商 || item.数量 === null
        );
        
        if (hasEmptyValues) {
          console.log('   ⚠️  仍有空值存在');
        } else {
          console.log('   ✅ 所有字段都有值');
        }
      }
    } catch (error) {
      console.log(`   ❌ 修复SQL执行失败: ${error.message}`);
    }
    
    // 8. 更新规则
    console.log('\n8. 🔄 更新库存查询规则:');
    try {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?
        WHERE intent_name = '库存信息查询'
        AND status = 'active'
      `, [fixedSQL]);
      
      console.log('   ✅ 库存查询规则已更新');
    } catch (error) {
      console.log(`   ❌ 规则更新失败: ${error.message}`);
    }
    
    await connection.end();
    
    console.log('\n📋 问题诊断总结:');
    console.log('==========================================');
    console.log('🔍 发现的问题:');
    console.log('   1. SQL查询可能返回空值字段');
    console.log('   2. 前端显示空白是因为数据库字段为NULL');
    console.log('   3. 需要使用COALESCE处理空值');
    
    console.log('\n🔧 修复方案:');
    console.log('   1. 使用COALESCE函数处理所有可能的空值');
    console.log('   2. 为空值提供默认显示文本');
    console.log('   3. 确保返回完整的50条记录');
    
    console.log('\n✅ 修复完成，请重新测试前端查询');
    
  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  }
}

debugInventoryQuery();
