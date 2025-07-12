import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixMaterialExactMatch() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔧 开始修复物料精确匹配问题...\n');
    
    // 1. 检查当前数据库中的物料数据
    console.log('📋 1. 检查当前物料数据:');
    const [materials] = await connection.execute(`
      SELECT DISTINCT material_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY material_name 
      ORDER BY material_name
    `);

    console.log('数据库中的所有物料:');
    materials.forEach(m => {
      console.log(`  ${m.material_name}: ${m.count}条记录`);
    });

    // 2. 特别检查电池相关物料
    console.log('\n🔋 2. 电池相关物料详情:');
    const [batteryMaterials] = await connection.execute(`
      SELECT material_name, supplier_name, COUNT(*) as count
      FROM inventory 
      WHERE material_name LIKE '%电池%'
      GROUP BY material_name, supplier_name
      ORDER BY material_name, supplier_name
    `);

    if (batteryMaterials.length > 0) {
      batteryMaterials.forEach(m => {
        console.log(`  ${m.material_name} (${m.supplier_name}): ${m.count}条`);
      });
    } else {
      console.log('  未找到电池相关物料');
    }

    // 3. 修复物料库存查询规则 - 使用精确匹配逻辑
    console.log('\n🔧 3. 修复物料库存查询规则:');
    
    const improvedSQL = `
      SELECT 
        storage_location as 工厂,
        storage_location as 仓库,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
        notes as 备注
      FROM inventory 
      WHERE 
        (
          -- 精确匹配优先
          material_name = ?
          -- 开头匹配（但要排除明显不相关的）
          OR (
            material_name LIKE CONCAT(?, '%')
            AND NOT (
              (? = '电池' AND material_name LIKE '%电池盖%')
              OR (? = '电池' AND material_name LIKE '%电池壳%')
              OR (? = '电池' AND material_name LIKE '%电池座%')
              OR (? = '显示' AND material_name LIKE '%显示器%')
              OR (? = '充电' AND material_name LIKE '%充电线%')
            )
          )
        )
      ORDER BY 
        -- 排序优先级：精确匹配 > 开头匹配
        CASE 
          WHEN material_name = ? THEN 1
          WHEN material_name LIKE CONCAT(?, '%') THEN 2
          ELSE 3
        END,
        inbound_time DESC 
      LIMIT 10
    `;

    // 更新物料库存查询规则
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = ?,
        updated_at = NOW()
      WHERE intent_name = '物料库存查询'
    `, [improvedSQL]);

    console.log('✅ 物料库存查询规则已更新');

    // 4. 检查并修复充电类物料查询规则
    console.log('\n🔧 4. 修复充电类物料查询规则:');
    
    const chargeSQL = `
      SELECT 
        '库存' as 数据来源,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 日期,
        notes as 备注
      FROM inventory 
      WHERE material_name = '电池' OR material_name = '充电器'
      UNION ALL
      SELECT 
        '测试' as 数据来源,
        material_name as 物料名称,
        supplier_name as 供应商,
        CONCAT(test_result, '次') as 数量,
        test_result as 状态,
        DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
        defect_description as 备注
      FROM test_tracking 
      WHERE material_name = '电池' OR material_name = '充电器'
      ORDER BY 日期 DESC
      LIMIT 10
    `;

    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = ?,
        updated_at = NOW()
      WHERE intent_name = '充电类物料查询'
    `, [chargeSQL]);

    console.log('✅ 充电类物料查询规则已更新');

    // 5. 测试修复后的查询
    console.log('\n🧪 5. 测试修复后的查询:');
    
    // 测试电池查询（应该只返回电池，不包含电池盖）
    console.log('\n测试"电池"查询:');
    const testQuery = improvedSQL.replace(/\?/g, "'电池'");
    
    try {
      const [testResults] = await connection.execute(testQuery);
      console.log(`返回 ${testResults.length} 条结果:`);
      testResults.forEach(item => {
        console.log(`  ${item.物料名称} | ${item.供应商} | ${item.数量}`);
      });
    } catch (error) {
      console.log('测试查询失败:', error.message);
    }

    // 6. 验证规则更新
    console.log('\n📝 6. 验证规则更新:');
    const [updatedRules] = await connection.execute(`
      SELECT intent_name, updated_at
      FROM nlp_intent_rules 
      WHERE intent_name IN ('物料库存查询', '充电类物料查询')
      ORDER BY intent_name
    `);

    updatedRules.forEach(rule => {
      console.log(`  ${rule.intent_name}: 更新时间 ${rule.updated_at}`);
    });

    console.log('\n✅ 物料精确匹配修复完成！');
    console.log('\n📋 修复内容总结:');
    console.log('  1. 更新了物料库存查询规则，使用精确匹配逻辑');
    console.log('  2. 修复了充电类物料查询，避免电池和电池盖混淆');
    console.log('  3. 添加了排除逻辑，确保查询"电池"时不会返回"电池盖"');
    console.log('  4. 优化了排序逻辑，精确匹配优先显示');

  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行修复
fixMaterialExactMatch();
