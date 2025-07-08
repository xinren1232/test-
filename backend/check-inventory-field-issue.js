import initializeDatabase from './src/models/index.js';

async function fixInventoryFieldMapping() {
  const db = await initializeDatabase();
  const sequelize = db.sequelize;

  try {
    console.log('🔧 修复库存字段映射问题...\n');

    console.log('=== 第一步：检查inventory表字段结构 ===');
    const [columns] = await sequelize.query('DESCRIBE inventory');
    console.table(columns);

    console.log('\n=== 第二步：检查实际数据内容 ===');
    const [rawData] = await sequelize.query(`
      SELECT factory, storage_location, material_type, material_code, supplier_name
      FROM inventory
      ORDER BY inbound_time DESC
      LIMIT 5
    `);

    console.log('原始数据:');
    console.table(rawData);

    // 分析数据，确定正确的字段映射
    console.log('\n=== 第三步：分析字段映射 ===');

    // 检查storage_location字段的内容特征
    const [locationAnalysis] = await sequelize.query(`
      SELECT
        storage_location,
        COUNT(*) as count,
        GROUP_CONCAT(DISTINCT supplier_name LIMIT 3) as sample_suppliers
      FROM inventory
      WHERE storage_location IS NOT NULL
      GROUP BY storage_location
      ORDER BY count DESC
      LIMIT 10
    `);

    console.log('storage_location字段分析:');
    console.table(locationAnalysis);

    console.log('\n=== 第四步：修复库存查询规则 ===');

    // 基于分析结果，修复字段映射
    // 如果storage_location包含工厂信息，我们需要重新映射
    const fixedSQL = `SELECT
      COALESCE(storage_location, '未指定') as 工厂,
      '仓库A' as 仓库,
      COALESCE(material_type, material_code) as 物料类型,
      supplier_name as 供应商名称,
      supplier_name as 供应商,
      quantity as 数量,
      COALESCE(status, '正常') as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 入库时间,
      DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    ORDER BY inbound_time DESC`;

    // 更新库存查询规则
    await sequelize.query(`
      UPDATE nlp_intent_rules
      SET action_target = ?
      WHERE intent_name LIKE '%库存%' AND action_target LIKE '%inventory%'
    `, {
      replacements: [fixedSQL]
    });

    console.log('✅ 库存查询规则已修复');

    console.log('\n=== 第五步：测试修复后的查询 ===');
    const [testResult] = await sequelize.query(fixedSQL + ' LIMIT 3');

    console.log('修复后的前3条库存数据:');
    console.table(testResult);

    console.log('\n🎉 字段映射修复完成！');
    console.log('修复内容：');
    console.log('- 工厂字段：使用storage_location字段（包含实际工厂信息）');
    console.log('- 仓库字段：设置为默认值"仓库A"（可根据实际需求调整）');

  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await sequelize.close();
  }
}

fixInventoryFieldMapping();
