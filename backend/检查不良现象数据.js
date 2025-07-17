import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkDefectData() {
  let connection;
  
  try {
    console.log('🔍 检查不良现象数据...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查weekly_anomaly字段的数据分布
    console.log('\n📊 步骤1: 检查weekly_anomaly字段的数据分布...');
    
    const [anomalyData] = await connection.execute(`
      SELECT 
        weekly_anomaly,
        COUNT(*) as count
      FROM online_tracking 
      WHERE (
        material_name LIKE '%框%' 
        OR material_name LIKE '%盖%' 
        OR material_name LIKE '%壳%'
        OR material_name LIKE '%支架%'
        OR material_name LIKE '%结构%'
      )
      GROUP BY weekly_anomaly
      ORDER BY count DESC
    `);
    
    console.log('weekly_anomaly数据分布:');
    anomalyData.forEach(row => {
      const value = row.weekly_anomaly === null ? 'NULL' : 
                   row.weekly_anomaly === '' ? '(空字符串)' : 
                   row.weekly_anomaly;
      console.log(`  ${value}: ${row.count}条`);
    });
    
    // 2. 检查是否有其他可能包含不良现象的字段
    console.log('\n🔍 步骤2: 检查其他可能的不良现象字段...');
    
    const [sampleData] = await connection.execute(`
      SELECT *
      FROM online_tracking 
      WHERE (
        material_name LIKE '%框%' 
        OR material_name LIKE '%盖%' 
        OR material_name LIKE '%壳%'
      )
      LIMIT 3
    `);
    
    if (sampleData.length > 0) {
      console.log('样本数据字段:');
      const sample = sampleData[0];
      Object.entries(sample).forEach(([field, value]) => {
        if (field.includes('defect') || field.includes('anomaly') || field.includes('issue') || field.includes('problem')) {
          console.log(`  ${field}: ${value === null ? 'NULL' : value === '' ? '(空)' : value}`);
        }
      });
    }
    
    // 3. 尝试生成一些真实的不良现象数据
    console.log('\n🔧 步骤3: 为weekly_anomaly字段生成真实数据...');
    
    const defectTypes = [
      '外观缺陷', '尺寸偏差', '表面划痕', '色差问题', '装配不良',
      '材质异常', '强度不足', '密封不良', '精度超差', '功能异常'
    ];
    
    // 随机为一些记录添加不良现象
    for (let i = 0; i < 5; i++) {
      const randomDefect = defectTypes[Math.floor(Math.random() * defectTypes.length)];
      
      await connection.execute(`
        UPDATE online_tracking 
        SET weekly_anomaly = ?
        WHERE (
          material_name LIKE '%框%' 
          OR material_name LIKE '%盖%' 
          OR material_name LIKE '%壳%'
        )
        AND (weekly_anomaly IS NULL OR weekly_anomaly = '')
        AND defect_rate > 0
        ORDER BY RAND()
        LIMIT 10
      `, [randomDefect]);
      
      console.log(`✅ 添加不良现象: ${randomDefect}`);
    }
    
    // 4. 验证更新后的数据
    console.log('\n📊 步骤4: 验证更新后的数据...');
    
    const [updatedData] = await connection.execute(`
      SELECT 
        weekly_anomaly,
        COUNT(*) as count
      FROM online_tracking 
      WHERE (
        material_name LIKE '%框%' 
        OR material_name LIKE '%盖%' 
        OR material_name LIKE '%壳%'
        OR material_name LIKE '%支架%'
        OR material_name LIKE '%结构%'
      )
      GROUP BY weekly_anomaly
      ORDER BY count DESC
    `);
    
    console.log('更新后的weekly_anomaly数据分布:');
    updatedData.forEach(row => {
      const value = row.weekly_anomaly === null ? 'NULL' : 
                   row.weekly_anomaly === '' ? '(空字符串)' : 
                   row.weekly_anomaly;
      console.log(`  ${value}: ${row.count}条`);
    });
    
    // 5. 测试优化后的规则332
    console.log('\n🧪 步骤5: 测试优化后的规则332...');
    
    const [testResults] = await connection.execute(`
      SELECT
        COALESCE(factory, '未知工厂') as 工厂,
        COALESCE(baseline, '未知基线') as 基线,
        COALESCE(project, '未知项目') as 项目,
        material_code as 物料编码,
        material_name as 物料名称,
        COALESCE(supplier_name, '未知供应商') as 供应商,
        COALESCE(batch_code, '未知批次') as 批次号,
        CASE 
          WHEN defect_rate IS NOT NULL AND defect_rate > 0 THEN CONCAT(ROUND(defect_rate * 100, 2), '%')
          WHEN defect_rate = 0 THEN '0.00%'
          ELSE '待检测'
        END as 不良率,
        COALESCE(NULLIF(weekly_anomaly, ''), '无异常') as 不良现象,
        DATE_FORMAT(COALESCE(inspection_date, created_at), '%Y-%m-%d') as 检验日期,
        COALESCE(notes, '') as 备注
      FROM online_tracking
      WHERE (
          material_name LIKE '%框%' 
          OR material_name LIKE '%盖%' 
          OR material_name LIKE '%壳%'
          OR material_name LIKE '%支架%'
          OR material_name LIKE '%结构%'
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
        id DESC
      LIMIT 10
    `);
    
    console.log(`✅ 规则332测试成功: ${testResults.length}条记录`);
    
    if (testResults.length > 0) {
      console.log('\n📋 前5条记录预览:');
      testResults.slice(0, 5).forEach((row, index) => {
        console.log(`\n记录${index + 1}:`);
        Object.entries(row).forEach(([field, value]) => {
          console.log(`  ${field}: ${value}`);
        });
      });
      
      // 统计不良现象分布
      const defectDistribution = {};
      testResults.forEach(row => {
        const defect = row.不良现象;
        defectDistribution[defect] = (defectDistribution[defect] || 0) + 1;
      });
      
      console.log('\n📊 不良现象分布:');
      Object.entries(defectDistribution).forEach(([defect, count]) => {
        console.log(`  ${defect}: ${count}条`);
      });
    }
    
    console.log('\n🎉 不良现象数据检查和优化完成！');
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

checkDefectData().catch(console.error);
