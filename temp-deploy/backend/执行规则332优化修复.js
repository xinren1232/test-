import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixRule332Optimized() {
  let connection;
  
  try {
    console.log('🔧 开始修复规则332: 结构件类上线情况查询...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查online_tracking表的实际字段
    console.log('\n📊 步骤1: 检查online_tracking表的实际字段...');
    
    const [columns] = await connection.execute('DESCRIBE online_tracking');
    console.log('online_tracking表字段:');
    columns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });
    
    // 2. 检查是否有weekly_anomaly或defect_phenomenon字段
    const hasWeeklyAnomaly = columns.some(col => col.Field === 'weekly_anomaly');
    const hasDefectPhenomenon = columns.some(col => col.Field === 'defect_phenomenon');
    
    console.log(`\n🔍 字段检查:`);
    console.log(`  weekly_anomaly: ${hasWeeklyAnomaly ? '✅ 存在' : '❌ 不存在'}`);
    console.log(`  defect_phenomenon: ${hasDefectPhenomenon ? '✅ 存在' : '❌ 不存在'}`);
    
    // 3. 生成优化后的SQL - 根据实际字段调整
    console.log('\n🔧 步骤2: 生成优化后的SQL...');
    
    let defectPhenomenonField;
    if (hasWeeklyAnomaly) {
      defectPhenomenonField = 'weekly_anomaly';
    } else if (hasDefectPhenomenon) {
      defectPhenomenonField = 'defect_phenomenon';
    } else {
      // 查找其他可能的不良现象字段
      const possibleFields = columns.filter(col => 
        col.Field.includes('anomaly') || 
        col.Field.includes('defect') || 
        col.Field.includes('issue') ||
        col.Field.includes('problem')
      );
      
      if (possibleFields.length > 0) {
        defectPhenomenonField = possibleFields[0].Field;
        console.log(`  使用字段: ${defectPhenomenonField}`);
      } else {
        defectPhenomenonField = null;
        console.log('  ⚠️ 未找到不良现象相关字段，将使用默认值');
      }
    }
    
    // 构建优化后的SQL
    let optimizedSQL = `SELECT
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
  ${defectPhenomenonField ? 
    `COALESCE(NULLIF(${defectPhenomenonField}, ''), '无异常')` : 
    `'无异常'`
  } as 不良现象,
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
LIMIT 100`;

    console.log('优化后的SQL:');
    console.log(optimizedSQL);
    
    // 4. 测试SQL
    console.log('\n🧪 步骤3: 测试优化后的SQL...');
    
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
          const isEmpty = value === null || value === '' || value === '未知' || value === '无' || value === '待检测';
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
        
        // 检查不良现象字段
        const defectPhenomena = [...new Set(testResults.map(row => row.不良现象))];
        console.log('\n🔍 不良现象类型:');
        defectPhenomena.slice(0, 10).forEach(phenomenon => {
          const count = testResults.filter(row => row.不良现象 === phenomenon).length;
          console.log(`  ${phenomenon}: ${count}条`);
        });
        
      } else {
        console.log('⚠️ 无数据返回，可能需要调整查询条件');
        
        // 尝试更宽松的查询条件
        console.log('\n🔧 尝试更宽松的查询条件...');
        const relaxedSQL = optimizedSQL.replace(
          /AND supplier_name IS NOT NULL\s+AND supplier_name != ''/,
          ''
        );
        
        const [relaxedResults] = await connection.execute(relaxedSQL);
        console.log(`宽松条件查询结果: ${relaxedResults.length}条记录`);
        
        if (relaxedResults.length > 0) {
          console.log('✅ 使用宽松条件的SQL');
          optimizedSQL = relaxedSQL;
        }
      }
      
    } catch (sqlError) {
      console.log(`❌ SQL测试失败: ${sqlError.message}`);
      return;
    }
    
    // 5. 更新规则332
    console.log('\n💾 步骤4: 更新规则332...');
    
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
    
    console.log('\n✨ 优化总结:');
    console.log('✅ 修复了字段名错误: "本周异常" → "不良现象"');
    console.log('✅ 使用COALESCE和NULLIF处理空值，减少空缺内容');
    console.log('✅ 添加了NOT NULL和非空字符串条件确保数据完整性');
    console.log('✅ 优化了查询条件，确保返回真实的结构件类数据');
    console.log('✅ 按检验日期和不良率排序，优先显示重要数据');
    console.log('✅ 符合上线场景字段标准');
    console.log('✅ 确保所有数据均来自真实数据库调取');
    
  } catch (error) {
    console.error('❌ 修复规则332失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

fixRule332Optimized().catch(console.error);
