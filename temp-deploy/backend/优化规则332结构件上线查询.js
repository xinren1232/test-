import mysql from 'mysql2/promise';

async function optimizeRule332() {
  let connection;
  
  try {
    console.log('🔧 优化规则332: 结构件类上线情况查询...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection',
      port: 3306
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查online_tracking表的实际字段和数据
    console.log('\n📊 步骤1: 检查online_tracking表的实际字段和数据...');
    
    const [columns] = await connection.execute('DESCRIBE online_tracking');
    console.log('online_tracking表字段:');
    columns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 2. 检查实际数据内容
    console.log('\n🔍 步骤2: 检查实际数据内容...');
    
    const [sampleData] = await connection.execute(`
      SELECT * FROM online_tracking 
      WHERE material_name LIKE '%框%' 
         OR material_name LIKE '%盖%' 
         OR material_name LIKE '%壳%'
         OR material_name LIKE '%支架%'
      LIMIT 5
    `);
    
    if (sampleData.length > 0) {
      console.log('结构件类数据样本:');
      sampleData.forEach((row, index) => {
        console.log(`\n样本${index + 1}:`);
        Object.entries(row).forEach(([field, value]) => {
          console.log(`  ${field}: ${value === null ? 'NULL' : value === '' ? '(空字符串)' : value}`);
        });
      });
    } else {
      console.log('❌ 未找到结构件类数据');
      return;
    }
    
    // 3. 检查字段是否存在"不良现象"相关字段
    console.log('\n🔍 步骤3: 检查不良现象相关字段...');
    
    const defectFields = columns.filter(col => 
      col.Field.includes('defect') || 
      col.Field.includes('anomaly') || 
      col.Field.includes('issue') ||
      col.Field.includes('problem') ||
      col.Field.includes('phenomenon')
    );
    
    console.log('不良现象相关字段:');
    defectFields.forEach(field => {
      console.log(`  ${field.Field} (${field.Type})`);
    });
    
    // 4. 生成优化后的SQL
    console.log('\n🔧 步骤4: 生成优化后的SQL...');
    
    // 根据实际字段生成正确的SQL
    const optimizedSQL = `SELECT
  COALESCE(factory, '未知工厂') as 工厂,
  COALESCE(baseline, baseline_id, '未知基线') as 基线,
  COALESCE(project, project_id, '未知项目') as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  COALESCE(batch_code, '未知批次') as 批次号,
  CASE 
    WHEN defect_rate IS NOT NULL THEN CONCAT(ROUND(defect_rate * 100, 2), '%')
    ELSE '0.00%'
  END as 不良率,
  COALESCE(defect_phenomenon, weekly_anomaly, '无') as 不良现象,
  DATE_FORMAT(COALESCE(inspection_date, created_at), '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
WHERE (material_name LIKE '%框%' 
   OR material_name LIKE '%盖%' 
   OR material_name LIKE '%壳%'
   OR material_name LIKE '%支架%'
   OR material_code LIKE '%CS-%'
   OR material_code LIKE '%CASE-%')
  AND material_name IS NOT NULL
  AND material_code IS NOT NULL
ORDER BY inspection_date DESC, id DESC
LIMIT 100`;
    
    console.log('优化后的SQL:');
    console.log(optimizedSQL);
    
    // 5. 测试优化后的SQL
    console.log('\n🧪 步骤5: 测试优化后的SQL...');
    
    try {
      const [testResults] = await connection.execute(optimizedSQL);
      console.log(`✅ SQL测试成功: ${testResults.length}条记录`);
      
      if (testResults.length > 0) {
        const fields = Object.keys(testResults[0]);
        console.log(`返回字段: ${fields.join(', ')}`);
        
        // 检查字段是否为中文
        const hasChineseFields = fields.every(field => /[\u4e00-\u9fa5]/.test(field));
        console.log(`中文字段检查: ${hasChineseFields ? '✅ 全部中文' : '❌ 包含非中文'}`);
        
        // 检查数据完整性
        console.log('\n📊 数据完整性检查:');
        const sample = testResults[0];
        Object.entries(sample).forEach(([field, value]) => {
          const isEmpty = value === null || value === '' || value === '未知' || value === '无';
          const status = isEmpty ? '⚠️' : '✅';
          console.log(`  ${field}: ${value} ${status}`);
        });
        
        // 统计空值情况
        console.log('\n📈 空值统计:');
        fields.forEach(field => {
          const emptyCount = testResults.filter(row => 
            row[field] === null || row[field] === '' || row[field] === '未知' || row[field] === '无'
          ).length;
          const emptyRate = (emptyCount / testResults.length * 100).toFixed(1);
          console.log(`  ${field}: ${emptyCount}/${testResults.length} (${emptyRate}%) 为空`);
        });
        
        // 显示结构件类物料分布
        const materialDistribution = {};
        testResults.forEach(row => {
          const materialName = row.物料名称;
          if (!materialDistribution[materialName]) {
            materialDistribution[materialName] = 0;
          }
          materialDistribution[materialName]++;
        });
        
        console.log('\n📊 结构件类物料分布:');
        Object.entries(materialDistribution).slice(0, 10).forEach(([name, count]) => {
          console.log(`  ${name}: ${count}条记录`);
        });
        
        // 检查不良现象字段
        const defectPhenomena = [...new Set(testResults.map(row => row.不良现象))];
        console.log('\n🔍 不良现象类型:');
        defectPhenomena.slice(0, 10).forEach(phenomenon => {
          const count = testResults.filter(row => row.不良现象 === phenomenon).length;
          console.log(`  ${phenomenon}: ${count}条`);
        });
        
      } else {
        console.log('⚠️ 无数据返回');
        return;
      }
      
    } catch (sqlError) {
      console.log(`❌ SQL测试失败: ${sqlError.message}`);
      
      // 如果字段不存在，尝试简化版本
      console.log('\n🔧 尝试简化版本...');
      
      const simplifiedSQL = `SELECT
  COALESCE(factory, '未知工厂') as 工厂,
  COALESCE(baseline, '未知基线') as 基线,
  COALESCE(project, '未知项目') as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  COALESCE(batch_code, '未知批次') as 批次号,
  CASE 
    WHEN defect_rate IS NOT NULL THEN CONCAT(ROUND(defect_rate * 100, 2), '%')
    ELSE '0.00%'
  END as 不良率,
  COALESCE(weekly_anomaly, '无') as 不良现象,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
WHERE (material_name LIKE '%框%' 
   OR material_name LIKE '%盖%' 
   OR material_name LIKE '%壳%'
   OR material_name LIKE '%支架%')
  AND material_name IS NOT NULL
  AND material_code IS NOT NULL
ORDER BY inspection_date DESC, id DESC
LIMIT 100`;
      
      try {
        const [simplifiedResults] = await connection.execute(simplifiedSQL);
        console.log(`✅ 简化版SQL测试成功: ${simplifiedResults.length}条记录`);
        optimizedSQL = simplifiedSQL;
      } catch (simplifiedError) {
        console.log(`❌ 简化版SQL也失败: ${simplifiedError.message}`);
        return;
      }
    }
    
    // 6. 更新规则332
    console.log('\n💾 步骤6: 更新规则332...');
    
    try {
      const [updateResult] = await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, updated_at = NOW()
        WHERE id = 332
      `, [optimizedSQL]);
      
      console.log(`✅ 更新结果: 影响行数 ${updateResult.affectedRows}`);
      
      // 验证更新
      const [verifyResult] = await connection.execute(
        'SELECT action_target FROM nlp_intent_rules WHERE id = 332'
      );
      
      if (verifyResult[0].action_target === optimizedSQL) {
        console.log('✅ 更新验证成功');
      } else {
        console.log('❌ 更新验证失败');
      }
      
    } catch (updateError) {
      console.log(`❌ 更新规则失败: ${updateError.message}`);
      return;
    }
    
    console.log('\n🎉 规则332优化完成！');
    
    console.log('\n优化总结:');
    console.log('✅ 修复了字段名错误: "本周异常" → "不良现象"');
    console.log('✅ 使用COALESCE处理空值，减少空缺内容');
    console.log('✅ 添加了NOT NULL条件确保数据完整性');
    console.log('✅ 优化了查询条件，确保返回真实数据');
    console.log('✅ 符合上线场景字段标准');
    
  } catch (error) {
    console.error('❌ 优化规则332失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

optimizeRule332().catch(console.error);
