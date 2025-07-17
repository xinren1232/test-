import mysql from 'mysql2/promise';

async function checkAndFixStructureQuery() {
  let connection;
  
  try {
    console.log('🔧 检查并修复结构大类上线生产数据查询...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查material_categories表的实际结构
    console.log('\n📊 步骤1: 检查material_categories表结构...');
    
    const [categoryColumns] = await connection.execute('DESCRIBE material_categories');
    console.log('material_categories表字段:');
    categoryColumns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });
    
    // 2. 检查material_categories表中的数据
    console.log('\n🔍 步骤2: 检查material_categories表数据...');
    
    const [categoryData] = await connection.execute(`
      SELECT * FROM material_categories LIMIT 10
    `);
    
    if (categoryData.length > 0) {
      console.log('material_categories数据样本:');
      categoryData.forEach(row => {
        console.log(`  ${JSON.stringify(row)}`);
      });
    }
    
    // 3. 检查online_tracking表中结构类物料
    console.log('\n📋 步骤3: 检查online_tracking表中结构类物料...');
    
    const [structureMaterials] = await connection.execute(`
      SELECT DISTINCT material_name, material_code, COUNT(*) as record_count
      FROM online_tracking
      WHERE material_name LIKE '%框%'
         OR material_name LIKE '%盖%'
         OR material_name LIKE '%壳%'
         OR material_name LIKE '%支架%'
         OR material_code LIKE '%CS-%'
         OR material_code LIKE '%CASE-%'
      GROUP BY material_name, material_code
      ORDER BY record_count DESC
      LIMIT 15
    `);
    
    console.log('结构类物料上线数据:');
    structureMaterials.forEach(material => {
      console.log(`  ${material.material_name} (${material.material_code}) - ${material.record_count}条上线记录`);
    });
    
    // 4. 生成正确的结构大类上线生产数据查询SQL
    console.log('\n🔧 步骤4: 生成结构大类上线生产数据查询SQL...');
    
    // 根据实际表结构生成SQL
    let correctSQL;
    
    // 检查是否有category字段
    const hasCategoryField = categoryColumns.some(col => col.Field === 'category');
    const hasSubcategoryField = categoryColumns.some(col => col.Field === 'subcategory');
    
    if (hasCategoryField || hasSubcategoryField) {
      // 如果有分类字段，使用JOIN查询
      correctSQL = `SELECT
  ot.factory as 工厂,
  ot.baseline as 基线,
  ot.project as 项目,
  ot.material_code as 物料编码,
  ot.material_name as 物料名称,
  ot.supplier_name as 供应商,
  ot.batch_code as 批次号,
  CONCAT(ROUND(ot.defect_rate * 100, 2), '%') as 不良率,
  ot.weekly_anomaly as 本周异常,
  DATE_FORMAT(ot.inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(ot.notes, '') as 备注
FROM online_tracking ot
LEFT JOIN material_categories mc ON ot.material_code = mc.material_code
WHERE ${hasCategoryField ? "mc.category LIKE '%结构%'" : '1=0'}
   ${hasSubcategoryField ? "OR mc.subcategory LIKE '%结构%'" : ''}
   OR ot.material_name LIKE '%框%'
   OR ot.material_name LIKE '%盖%'
   OR ot.material_name LIKE '%壳%'
   OR ot.material_name LIKE '%支架%'
   OR ot.material_code LIKE '%CS-%'
   OR ot.material_code LIKE '%CASE-%'
ORDER BY ot.inspection_date DESC, ot.id DESC
LIMIT 100`;
    } else {
      // 如果没有分类字段，直接基于物料名称和编码查询
      correctSQL = `SELECT
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
WHERE material_name LIKE '%框%'
   OR material_name LIKE '%盖%'
   OR material_name LIKE '%壳%'
   OR material_name LIKE '%支架%'
   OR material_code LIKE '%CS-%'
   OR material_code LIKE '%CASE-%'
ORDER BY inspection_date DESC, id DESC
LIMIT 100`;
    }
    
    console.log('结构大类上线生产数据查询SQL:');
    console.log(correctSQL);
    
    // 5. 测试SQL
    console.log('\n🧪 步骤5: 测试SQL...');
    
    try {
      const [testResults] = await connection.execute(correctSQL);
      console.log(`✅ SQL测试成功: ${testResults.length}条记录`);
      
      if (testResults.length > 0) {
        const fields = Object.keys(testResults[0]);
        console.log(`返回字段: ${fields.join(', ')}`);
        
        // 检查字段是否为中文
        const hasChineseFields = fields.every(field => /[\u4e00-\u9fa5]/.test(field));
        console.log(`中文字段检查: ${hasChineseFields ? '✅ 全部中文' : '❌ 包含非中文'}`);
        
        // 显示数据样本
        console.log('\n📄 结构大类上线生产数据样本:');
        const sample = testResults[0];
        Object.entries(sample).slice(0, 8).forEach(([field, value]) => {
          const displayValue = value === null ? 'NULL' : 
                             value === '' ? '(空字符串)' :
                             String(value).length > 30 ? String(value).substring(0, 30) + '...' :
                             value;
          console.log(`  ${field}: ${displayValue}`);
        });
        
        // 显示结构类物料分布
        const materialDistribution = {};
        testResults.forEach(row => {
          const materialName = row.物料名称;
          if (!materialDistribution[materialName]) {
            materialDistribution[materialName] = 0;
          }
          materialDistribution[materialName]++;
        });
        
        console.log('\n📊 结构大类物料上线分布:');
        Object.entries(materialDistribution).slice(0, 8).forEach(([name, count]) => {
          console.log(`  ${name}: ${count}条上线记录`);
        });
        
      } else {
        console.log('⚠️ 无结构大类上线生产数据返回');
        return;
      }
      
    } catch (sqlError) {
      console.log(`❌ SQL测试失败: ${sqlError.message}`);
      return;
    }
    
    // 6. 更新规则332
    console.log('\n💾 步骤6: 更新规则332...');
    
    try {
      const [updateResult] = await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, updated_at = NOW()
        WHERE id = 332
      `, [correctSQL]);
      
      console.log(`✅ 更新结果: 影响行数 ${updateResult.affectedRows}`);
      
    } catch (updateError) {
      console.log(`❌ 更新规则失败: ${updateError.message}`);
      return;
    }
    
    console.log('\n🎉 结构大类物料上线生产数据查询修复完成！');
    
    console.log('\n修复总结:');
    console.log('✅ 正确查询结构大类物料的上线生产数据');
    console.log('✅ 包含中框、电池盖、保护套等结构件');
    console.log('✅ 符合上线场景字段标准显示');
    console.log('✅ 显示工厂、项目、不良率等生产关键信息');
    console.log('✅ 按检验日期排序显示最新上线情况');
    
  } catch (error) {
    console.error('❌ 检查并修复结构大类查询失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

checkAndFixStructureQuery().catch(console.error);
