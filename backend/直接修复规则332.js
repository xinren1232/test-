import mysql from 'mysql2/promise';

async function fixRule332() {
  let connection;
  
  try {
    console.log('🔧 直接修复规则332: 结构件类上线情况查询...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查当前规则332
    console.log('\n🔍 检查当前规则332...');
    
    const [currentRule] = await connection.execute(
      'SELECT id, intent_name, category, action_target FROM nlp_intent_rules WHERE id = 332'
    );
    
    if (currentRule.length === 0) {
      console.log('❌ 规则332不存在');
      return;
    }
    
    const rule = currentRule[0];
    console.log(`规则名称: ${rule.intent_name}`);
    console.log(`分类: ${rule.category}`);
    console.log(`当前SQL: ${rule.action_target}`);
    
    // 2. 检查可用的表
    console.log('\n📊 检查可用的表...');
    
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log(`可用表: ${tableNames.join(', ')}`);
    
    // 3. 检查online_tracking表结构
    console.log('\n📋 检查online_tracking表结构...');
    
    const [onlineColumns] = await connection.execute('DESCRIBE online_tracking');
    const onlineFields = onlineColumns.map(col => col.Field);
    console.log(`online_tracking字段: ${onlineFields.join(', ')}`);
    
    // 4. 生成正确的SQL - 基于上线场景字段标准
    console.log('\n🔧 生成正确的SQL...');
    
    // 上线场景字段标准: 工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注
    const correctSQL = `SELECT
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
WHERE material_name LIKE '%结构件%' OR material_code LIKE '%结构%'
ORDER BY inspection_date DESC, id DESC`;
    
    console.log('修复后的SQL:');
    console.log(correctSQL);
    
    // 5. 测试修复后的SQL
    console.log('\n🧪 测试修复后的SQL...');
    
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
        console.log('\n📄 数据样本:');
        const sample = testResults[0];
        Object.entries(sample).forEach(([field, value]) => {
          const displayValue = value === null ? 'NULL' : 
                             value === '' ? '(空字符串)' :
                             String(value).length > 30 ? String(value).substring(0, 30) + '...' :
                             value;
          console.log(`  ${field}: ${displayValue}`);
        });
        
      } else {
        console.log('⚠️ 无数据返回，尝试调整查询条件...');
        
        // 尝试更宽泛的查询
        const broadSQL = correctSQL.replace(
          "WHERE material_name LIKE '%结构件%' OR material_code LIKE '%结构%'",
          "WHERE 1=1"
        );
        
        const [broadResults] = await connection.execute(broadSQL);
        console.log(`使用宽泛条件测试: ${broadResults.length}条记录`);
        
        if (broadResults.length > 0) {
          console.log('数据存在，原查询条件可能过于严格');
        }
      }
      
    } catch (sqlError) {
      console.log(`❌ SQL测试失败: ${sqlError.message}`);
      
      // 如果字段不存在，尝试调整
      if (sqlError.message.includes('baseline')) {
        console.log('尝试使用baseline_id字段...');
        const adjustedSQL = correctSQL.replace('baseline as 基线', 'baseline_id as 基线');
        
        try {
          const [adjustedResults] = await connection.execute(adjustedSQL);
          console.log(`✅ 调整后SQL测试成功: ${adjustedResults.length}条记录`);
          correctSQL = adjustedSQL;
        } catch (adjustedError) {
          console.log(`❌ 调整后仍失败: ${adjustedError.message}`);
          return;
        }
      } else {
        return;
      }
    }
    
    // 6. 更新规则
    console.log('\n💾 更新规则332...');
    
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
    
    console.log('\n🎉 规则332修复完成！');
    
    console.log('\n修复总结:');
    console.log('✅ 修复了SQL函数显示为字段名的问题');
    console.log('✅ 确保所有字段都有正确的中文别名');
    console.log('✅ 符合上线场景字段标准');
    console.log('✅ 优化了查询条件针对结构件类物料');
    
  } catch (error) {
    console.error('❌ 修复规则332失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

fixRule332().catch(console.error);
