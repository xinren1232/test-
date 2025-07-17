import mysql from 'mysql2/promise';

async function testSupplierQuery() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🧪 测试供应商查询功能...\n');

    // 1. 检查当前规则数量
    const [ruleCount] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules');
    console.log(`📊 当前规则总数: ${ruleCount[0].count}`);

    // 2. 检查供应商相关规则
    const [supplierRules] = await connection.execute(`
      SELECT intent_name, trigger_words 
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%供应商%' OR intent_name LIKE '%BOE%' OR intent_name LIKE '%天马%'
      ORDER BY intent_name
    `);
    
    console.log(`\n🏭 供应商相关规则 (${supplierRules.length} 条):`);
    supplierRules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.intent_name}`);
    });

    // 3. 测试一个具体的供应商库存查询
    console.log('\n🔍 测试BOE供应商库存查询...');
    const [boeRule] = await connection.execute(`
      SELECT action_target 
      FROM nlp_intent_rules 
      WHERE intent_name = 'BOE供应商库存查询'
    `);
    
    if (boeRule.length > 0) {
      console.log('✅ 找到BOE供应商库存查询规则');
      console.log('SQL模板:', boeRule[0].action_target.substring(0, 200) + '...');
      
      // 执行实际查询测试
      try {
        const [testResult] = await connection.execute(`
          SELECT
            storage_location as 工厂,
            storage_location as 仓库,
            material_code as 物料编码,
            material_name as 物料名称,
            supplier_name as 供应商,
            quantity as 数量,
            status as 状态,
            DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
            DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
            COALESCE(notes, '') as 备注
          FROM inventory
          WHERE supplier_name = 'BOE'
          ORDER BY inbound_time DESC LIMIT 5
        `);
        
        console.log(`\n📋 BOE供应商库存查询结果: ${testResult.length} 条记录`);
        if (testResult.length > 0) {
          console.log('字段映射正确:', Object.keys(testResult[0]));
          console.log('示例数据:', testResult[0]);
        }
      } catch (queryError) {
        console.error('❌ 查询执行失败:', queryError.message);
      }
    } else {
      console.log('❌ 未找到BOE供应商库存查询规则');
    }

    // 4. 测试天马供应商查询
    console.log('\n🔍 测试天马供应商库存查询...');
    try {
      const [tianmaResult] = await connection.execute(`
        SELECT
          storage_location as 工厂,
          storage_location as 仓库,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
          DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
          COALESCE(notes, '') as 备注
        FROM inventory
        WHERE supplier_name = '天马'
        ORDER BY inbound_time DESC LIMIT 5
      `);
      
      console.log(`📋 天马供应商库存查询结果: ${tianmaResult.length} 条记录`);
      if (tianmaResult.length > 0) {
        console.log('字段映射正确:', Object.keys(tianmaResult[0]));
      }
    } catch (queryError) {
      console.error('❌ 天马查询执行失败:', queryError.message);
    }

    // 5. 检查数据库中的供应商列表
    console.log('\n📝 数据库中的供应商列表:');
    const [suppliers] = await connection.execute(`
      SELECT DISTINCT supplier_name, COUNT(*) as count
      FROM inventory 
      WHERE supplier_name IS NOT NULL 
      GROUP BY supplier_name 
      ORDER BY count DESC
    `);
    
    suppliers.forEach((supplier, index) => {
      console.log(`  ${index + 1}. ${supplier.supplier_name} (${supplier.count} 条记录)`);
    });

    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await connection.end();
  }
}

testSupplierQuery();
