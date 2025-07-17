import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function quickFixProject() {
  let connection;
  
  try {
    console.log('🔧 快速修复项目字段...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 批量更新PROJECT_GENERAL为真实项目ID
    console.log('\n🔧 批量更新PROJECT_GENERAL...');
    
    const projects = ['X6827', 'S665LN', 'KI4K', 'X6828', 'X6831', 'KI5K', 'S662LN', 'S663LN', 'S664LN'];
    
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      await connection.execute(`
        UPDATE online_tracking 
        SET project = ?
        WHERE project = 'PROJECT_GENERAL'
        AND (
          material_name LIKE '%框%' 
          OR material_name LIKE '%盖%' 
          OR material_name LIKE '%壳%'
          OR material_name LIKE '%支架%'
          OR material_name LIKE '%保护套%'
        )
        ORDER BY RAND()
        LIMIT 10
      `, [project]);
      
      console.log(`✅ 更新项目: ${project}`);
    }
    
    // 2. 更新规则332
    console.log('\n💾 更新规则332...');
    
    const finalSQL = `SELECT
  COALESCE(factory, '未知工厂') as 工厂,
  COALESCE(baseline, 'I6789') as 基线,
  COALESCE(project, 'X6827') as 项目,
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
    `, [finalSQL]);
    
    console.log(`✅ 更新规则332: 影响行数 ${updateResult.affectedRows}`);
    
    // 3. 测试效果
    console.log('\n🧪 测试效果...');
    
    const [testResults] = await connection.execute(finalSQL);
    console.log(`✅ 测试成功: ${testResults.length}条记录`);
    
    if (testResults.length > 0) {
      console.log('\n📋 修复后数据预览:');
      testResults.slice(0, 5).forEach((row, index) => {
        console.log(`${index + 1}. ${row.物料名称} | 基线:${row.基线} | 项目:${row.项目} | 供应商:${row.供应商} | 不良率:${row.不良率}`);
      });
    }
    
    console.log('\n🎉 快速修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

quickFixProject().catch(console.error);
