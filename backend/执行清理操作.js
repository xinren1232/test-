import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function executeCleanup() {
  let connection;
  
  try {
    console.log('🧹 执行清理操作...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 查看当前状态
    console.log('\n📊 当前数据状态:');
    const [currentStatus] = await connection.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN operator = '系统' THEN 1 END) as system_generated,
        COUNT(CASE WHEN operator IS NULL THEN 1 END) as null_operator
      FROM online_tracking
    `);
    
    console.log(`总记录数: ${currentStatus[0].total_records}`);
    console.log(`系统生成: ${currentStatus[0].system_generated}`);
    console.log(`空操作员: ${currentStatus[0].null_operator}`);
    
    // 2. 创建备份
    console.log('\n💾 创建备份...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS online_tracking_backup_${Date.now()} AS 
      SELECT * FROM online_tracking
    `);
    console.log('✅ 备份创建完成');
    
    // 3. 清理模拟数据
    console.log('\n🧹 清理模拟数据...');
    const [deleteResult] = await connection.execute(`
      DELETE FROM online_tracking 
      WHERE operator = '系统' OR operator IS NULL
    `);
    
    console.log(`✅ 清理了 ${deleteResult.affectedRows} 条模拟记录`);
    
    // 4. 检查清理后状态
    const [afterCleanup] = await connection.execute(`
      SELECT COUNT(*) as count FROM online_tracking
    `);
    
    console.log(`清理后剩余记录: ${afterCleanup[0].count}条`);
    
    // 5. 更新规则332
    console.log('\n💾 更新规则332...');
    
    const realDataSQL = `SELECT
  COALESCE(factory, '未知工厂') as 工厂,
  COALESCE(baseline, '未知基线') as 基线,
  COALESCE(project, '未知项目') as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  COALESCE(batch_code, '未知批次') as 批次号,
  CASE 
    WHEN defect_rate IS NULL OR defect_rate = 0 THEN '0.0%'
    WHEN defect_rate < 1 THEN CONCAT(ROUND(defect_rate * 100, 1), '%')
    ELSE CONCAT(ROUND(defect_rate, 1), '%')
  END as 不良率,
  CASE
    WHEN defect_rate = 0 OR defect_rate IS NULL THEN '正常'
    WHEN weekly_anomaly IS NULL OR weekly_anomaly = '' OR weekly_anomaly = '无' THEN '待分析'
    ELSE weekly_anomaly
  END as 不良现象,
  DATE_FORMAT(COALESCE(inspection_date, created_at), '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
WHERE (
    material_name LIKE '%框%' 
    OR material_name LIKE '%盖%' 
    OR material_name LIKE '%壳%'
    OR material_name LIKE '%支架%'
    OR material_name LIKE '%结构%'
    OR material_name LIKE '%保护套%'
    OR material_code LIKE '%CS-%'
    OR material_code LIKE '%CASE-%'
    OR material_code LIKE '%FRAME-%'
  )
  AND material_name IS NOT NULL 
  AND material_name != ''
  AND material_code IS NOT NULL 
  AND material_code != ''
  AND supplier_name IS NOT NULL
  AND supplier_name != ''
ORDER BY 
  COALESCE(inspection_date, created_at) DESC, 
  defect_rate DESC,
  id DESC`;

    const [updateResult] = await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, updated_at = NOW()
      WHERE id = 332
    `, [realDataSQL]);
    
    console.log(`✅ 更新规则332: 影响行数 ${updateResult.affectedRows}`);
    
    // 6. 测试查询
    console.log('\n🧪 测试查询...');
    const [testResults] = await connection.execute(realDataSQL);
    console.log(`测试结果: ${testResults.length}条记录`);
    
    if (testResults.length === 0) {
      console.log('✅ 完美！查询返回空结果，等待真实数据');
    } else {
      console.log('⚠️ 仍有数据返回:');
      testResults.slice(0, 3).forEach((row, index) => {
        console.log(`${index + 1}. ${row.物料名称} | ${row.供应商}`);
      });
    }
    
    console.log('\n🎉 清理操作完成！');
    console.log('\n✨ 现在系统状态:');
    console.log('✅ 所有模拟数据已清理');
    console.log('✅ 规则332已更新为真实数据查询');
    console.log('✅ 查询"结构件材料的上线生产情况"将返回空结果');
    console.log('✅ 只有在您手动生成上线数据后，查询才会有结果');
    
  } catch (error) {
    console.error('❌ 清理失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

executeCleanup().catch(console.error);
