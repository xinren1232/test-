import mysql from 'mysql2/promise';

async function adjustRule332Query() {
  let connection;
  
  try {
    console.log('🔧 调整规则332查询条件...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查online_tracking表中的实际数据
    console.log('\n🔍 检查online_tracking表中的实际数据...');
    
    const [sampleData] = await connection.execute(`
      SELECT DISTINCT material_name, material_code 
      FROM online_tracking 
      ORDER BY material_name 
      LIMIT 20
    `);
    
    console.log('实际物料数据样本:');
    sampleData.forEach(row => {
      console.log(`  ${row.material_name} (${row.material_code})`);
    });
    
    // 2. 查找包含结构相关的物料
    console.log('\n🔍 查找包含结构相关的物料...');
    
    const [structureData] = await connection.execute(`
      SELECT DISTINCT material_name, material_code, COUNT(*) as count
      FROM online_tracking 
      WHERE material_name LIKE '%结构%' 
         OR material_name LIKE '%框%' 
         OR material_name LIKE '%壳%'
         OR material_name LIKE '%盖%'
         OR material_name LIKE '%支架%'
         OR material_code LIKE '%CS-%'
         OR material_code LIKE '%CASE-%'
      GROUP BY material_name, material_code
      ORDER BY count DESC
      LIMIT 10
    `);
    
    if (structureData.length > 0) {
      console.log('找到结构件相关物料:');
      structureData.forEach(row => {
        console.log(`  ${row.material_name} (${row.material_code}) - ${row.count}条记录`);
      });
    } else {
      console.log('未找到结构件相关物料，使用更宽泛的条件');
    }
    
    // 3. 生成调整后的SQL
    console.log('\n🔧 生成调整后的SQL...');
    
    let adjustedSQL;
    
    if (structureData.length > 0) {
      // 如果找到结构件相关物料，使用更宽泛的条件
      adjustedSQL = `SELECT
  factory as 工厂,
  baseline as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  weekly_anomaly as 本周异常,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
WHERE material_name LIKE '%结构%' 
   OR material_name LIKE '%框%' 
   OR material_name LIKE '%壳%'
   OR material_name LIKE '%盖%'
   OR material_name LIKE '%支架%'
   OR material_code LIKE '%CS-%'
   OR material_code LIKE '%CASE-%'
ORDER BY inspection_date DESC, id DESC
LIMIT 100`;
    } else {
      // 如果没有找到，使用参数化查询
      adjustedSQL = `SELECT
  factory as 工厂,
  baseline as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  weekly_anomaly as 本周异常,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
WHERE material_name LIKE CONCAT('%', COALESCE(?, '结构'), '%')
ORDER BY inspection_date DESC, id DESC
LIMIT 100`;
    }
    
    console.log('调整后的SQL:');
    console.log(adjustedSQL);
    
    // 4. 测试调整后的SQL
    console.log('\n🧪 测试调整后的SQL...');
    
    try {
      const [testResults] = await connection.execute(adjustedSQL);
      console.log(`✅ SQL测试成功: ${testResults.length}条记录`);
      
      if (testResults.length > 0) {
        const fields = Object.keys(testResults[0]);
        console.log(`返回字段: ${fields.join(', ')}`);
        
        // 检查字段是否为中文
        const hasChineseFields = fields.every(field => /[\u4e00-\u9fa5]/.test(field));
        console.log(`中文字段检查: ${hasChineseFields ? '✅ 全部中文' : '❌ 包含非中文'}`);
        
        // 显示数据样本
        console.log('\n📄 数据样本:');
        const sample = testResults[0];
        Object.entries(sample).slice(0, 5).forEach(([field, value]) => {
          console.log(`  ${field}: ${value}`);
        });
        
        // 显示物料类型分布
        const materialTypes = {};
        testResults.forEach(row => {
          const materialName = row.物料名称;
          if (!materialTypes[materialName]) {
            materialTypes[materialName] = 0;
          }
          materialTypes[materialName]++;
        });
        
        console.log('\n📊 物料类型分布:');
        Object.entries(materialTypes).slice(0, 5).forEach(([name, count]) => {
          console.log(`  ${name}: ${count}条`);
        });
        
      } else {
        console.log('⚠️ 仍然无数据返回');
        return;
      }
      
    } catch (sqlError) {
      console.log(`❌ SQL测试失败: ${sqlError.message}`);
      return;
    }
    
    // 5. 更新规则332
    console.log('\n💾 更新规则332...');
    
    try {
      const [updateResult] = await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, updated_at = NOW()
        WHERE id = 332
      `, [adjustedSQL]);
      
      console.log(`✅ 更新结果: 影响行数 ${updateResult.affectedRows}`);
      
    } catch (updateError) {
      console.log(`❌ 更新规则失败: ${updateError.message}`);
      return;
    }
    
    console.log('\n🎉 规则332查询条件调整完成！');
    
    console.log('\n调整总结:');
    console.log('✅ 扩展了结构件物料的匹配条件');
    console.log('✅ 包含更多结构件相关物料类型');
    console.log('✅ 添加了合理的数量限制');
    console.log('✅ 保持了上线场景字段标准');
    
  } catch (error) {
    console.error('❌ 调整规则332查询条件失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

adjustRule332Query().catch(console.error);
