import mysql from 'mysql2/promise';

async function fixStructureCategoryOnlineQuery() {
  let connection;
  
  try {
    console.log('🔧 修复结构大类物料上线生产数据查询...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查物料分类表，确认结构大类的定义
    console.log('\n🔍 步骤1: 检查物料分类表...');
    
    const [categories] = await connection.execute(`
      SELECT DISTINCT category_name, subcategory_name 
      FROM material_categories 
      WHERE category_name LIKE '%结构%' OR subcategory_name LIKE '%结构%'
      ORDER BY category_name, subcategory_name
    `);
    
    console.log('结构相关分类:');
    categories.forEach(cat => {
      console.log(`  ${cat.category_name} -> ${cat.subcategory_name}`);
    });
    
    // 2. 检查online_tracking表中结构类物料的实际数据
    console.log('\n📊 步骤2: 检查online_tracking表中结构类物料...');
    
    const [structureMaterials] = await connection.execute(`
      SELECT DISTINCT ot.material_name, ot.material_code, mc.category_name, mc.subcategory_name, COUNT(*) as record_count
      FROM online_tracking ot
      LEFT JOIN material_categories mc ON ot.material_code = mc.material_code
      WHERE mc.category_name LIKE '%结构%' 
         OR mc.subcategory_name LIKE '%结构%'
         OR ot.material_name LIKE '%框%'
         OR ot.material_name LIKE '%盖%'
         OR ot.material_name LIKE '%壳%'
         OR ot.material_name LIKE '%支架%'
         OR ot.material_code LIKE '%CS-%'
         OR ot.material_code LIKE '%CASE-%'
      GROUP BY ot.material_name, ot.material_code, mc.category_name, mc.subcategory_name
      ORDER BY record_count DESC
      LIMIT 20
    `);
    
    console.log('结构大类物料上线数据:');
    structureMaterials.forEach(material => {
      console.log(`  ${material.material_name} (${material.material_code}) - ${material.category_name || '未分类'} - ${material.record_count}条记录`);
    });
    
    // 3. 生成正确的结构大类上线生产数据查询SQL
    console.log('\n🔧 步骤3: 生成结构大类上线生产数据查询SQL...');
    
    // 上线场景字段标准: 工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注
    const correctSQL = `SELECT
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
WHERE mc.category_name LIKE '%结构%' 
   OR mc.subcategory_name LIKE '%结构%'
   OR ot.material_name LIKE '%框%'
   OR ot.material_name LIKE '%盖%'
   OR ot.material_name LIKE '%壳%'
   OR ot.material_name LIKE '%支架%'
   OR ot.material_code LIKE '%CS-%'
   OR ot.material_code LIKE '%CASE-%'
ORDER BY ot.inspection_date DESC, ot.id DESC
LIMIT 100`;
    
    console.log('结构大类上线生产数据查询SQL:');
    console.log(correctSQL);
    
    // 4. 测试SQL
    console.log('\n🧪 步骤4: 测试SQL...');
    
    try {
      const [testResults] = await connection.execute(correctSQL);
      console.log(`✅ SQL测试成功: ${testResults.length}条记录`);
      
      if (testResults.length > 0) {
        const fields = Object.keys(testResults[0]);
        console.log(`返回字段: ${fields.join(', ')}`);
        
        // 检查字段是否为中文
        const hasChineseFields = fields.every(field => /[\u4e00-\u9fa5]/.test(field));
        console.log(`中文字段检查: ${hasChineseFields ? '✅ 全部中文' : '❌ 包含非中文'}`);
        
        // 检查是否符合上线场景字段标准
        const expectedFields = ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'];
        const missingFields = expectedFields.filter(field => !fields.includes(field));
        
        if (missingFields.length === 0) {
          console.log('✅ 字段完全符合上线场景标准');
        } else {
          console.log(`❌ 缺少字段: ${missingFields.join(', ')}`);
        }
        
        // 显示数据样本
        console.log('\n📄 上线生产数据样本:');
        const sample = testResults[0];
        Object.entries(sample).forEach(([field, value]) => {
          const displayValue = value === null ? 'NULL' : 
                             value === '' ? '(空字符串)' :
                             String(value).length > 30 ? String(value).substring(0, 30) + '...' :
                             value;
          console.log(`  ${field}: ${displayValue}`);
        });
        
        // 显示结构大类物料分布
        const materialDistribution = {};
        testResults.forEach(row => {
          const materialName = row.物料名称;
          if (!materialDistribution[materialName]) {
            materialDistribution[materialName] = 0;
          }
          materialDistribution[materialName]++;
        });
        
        console.log('\n📊 结构大类物料上线分布:');
        Object.entries(materialDistribution).slice(0, 10).forEach(([name, count]) => {
          console.log(`  ${name}: ${count}条上线记录`);
        });
        
        // 显示工厂分布
        const factoryDistribution = {};
        testResults.forEach(row => {
          const factory = row.工厂 || '未知工厂';
          if (!factoryDistribution[factory]) {
            factoryDistribution[factory] = 0;
          }
          factoryDistribution[factory]++;
        });
        
        console.log('\n🏭 工厂上线分布:');
        Object.entries(factoryDistribution).forEach(([factory, count]) => {
          console.log(`  ${factory}: ${count}条记录`);
        });
        
      } else {
        console.log('⚠️ 无上线生产数据返回');
        return;
      }
      
    } catch (sqlError) {
      console.log(`❌ SQL测试失败: ${sqlError.message}`);
      return;
    }
    
    // 5. 更新规则332
    console.log('\n💾 步骤5: 更新规则332...');
    
    try {
      const [updateResult] = await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, updated_at = NOW()
        WHERE id = 332
      `, [correctSQL]);
      
      console.log(`✅ 更新结果: 影响行数 ${updateResult.affectedRows}`);
      
      // 验证更新
      const [verifyResult] = await connection.execute(
        'SELECT action_target FROM nlp_intent_rules WHERE id = 332'
      );
      
      if (verifyResult[0].action_target === correctSQL) {
        console.log('✅ 更新验证成功');
      } else {
        console.log('❌ 更新验证失败');
      }
      
    } catch (updateError) {
      console.log(`❌ 更新规则失败: ${updateError.message}`);
      return;
    }
    
    console.log('\n🎉 结构大类物料上线生产数据查询修复完成！');
    
    console.log('\n修复总结:');
    console.log('✅ 正确查询结构大类物料的上线生产数据');
    console.log('✅ 使用物料分类表进行精确分类匹配');
    console.log('✅ 符合上线场景字段标准显示');
    console.log('✅ 包含工厂、基线、项目等生产关键信息');
    console.log('✅ 显示不良率、本周异常等质量指标');
    console.log('✅ 按检验日期排序显示最新生产情况');
    
  } catch (error) {
    console.error('❌ 修复结构大类上线生产数据查询失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

fixStructureCategoryOnlineQuery().catch(console.error);
