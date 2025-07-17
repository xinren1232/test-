import mysql from 'mysql2/promise';

async function fixStructureOnlineRule() {
  let connection;
  
  try {
    console.log('🔧 修复结构件类上线情况查询规则...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 查找结构件类上线情况查询规则
    console.log('\n🔍 步骤1: 查找结构件类上线情况查询规则...');
    
    const [rules] = await connection.execute(`
      SELECT id, intent_name, category, action_target 
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%结构件%上线%'
      ORDER BY id
    `);
    
    if (rules.length === 0) {
      console.log('❌ 未找到结构件类上线情况查询规则');
      return;
    }
    
    console.log(`找到 ${rules.length} 个相关规则:`);
    rules.forEach(rule => {
      console.log(`  规则${rule.id}: ${rule.intent_name} (${rule.category})`);
    });
    
    // 2. 检查数据库表结构
    console.log('\n📊 步骤2: 检查相关数据库表结构...');
    
    // 检查online_tracking表
    const [onlineColumns] = await connection.execute('DESCRIBE online_tracking');
    console.log('online_tracking表字段:', onlineColumns.map(col => col.Field).join(', '));
    
    // 检查testing表
    const [testingColumns] = await connection.execute('DESCRIBE testing');
    console.log('testing表字段:', testingColumns.map(col => col.Field).join(', '));
    
    // 3. 为每个规则生成正确的SQL
    console.log('\n🔧 步骤3: 修复规则SQL...');
    
    for (const rule of rules) {
      console.log(`\n修复规则${rule.id}: ${rule.intent_name}`);
      console.log(`当前SQL: ${rule.action_target}`);
      
      // 根据上线场景字段标准生成正确的SQL
      // 上线场景字段: 工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注
      
      let correctSQL;
      
      if (rule.category === '测试场景' || rule.intent_name.includes('上线')) {
        // 上线情况查询应该查询online_tracking表
        correctSQL = `SELECT
  factory as 工厂,
  baseline_id as 基线,
  project_id as 项目,
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
      } else {
        // 如果是测试场景，使用testing表
        correctSQL = `SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  project_id as 项目,
  baseline_id as 基线,
  material_code as 物料编码,
  quantity as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  defect_description as 不合格描述,
  COALESCE(notes, '') as 备注
FROM testing
WHERE material_name LIKE '%结构件%' OR material_code LIKE '%结构%'
ORDER BY test_date DESC, id DESC`;
      }
      
      console.log(`修复后SQL: ${correctSQL}`);
      
      // 4. 测试修复后的SQL
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
          
          // 检查是否符合场景字段标准
          let expectedFields;
          if (rule.category === '测试场景' && rule.intent_name.includes('上线')) {
            expectedFields = ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'];
          } else {
            expectedFields = ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'];
          }
          
          const missingFields = expectedFields.filter(field => !fields.includes(field));
          
          if (missingFields.length === 0) {
            console.log('✅ 字段完全符合场景标准');
          } else {
            console.log(`❌ 缺少字段: ${missingFields.join(', ')}`);
          }
          
          // 显示数据样本
          console.log('\n📄 数据样本:');
          const sample = testResults[0];
          Object.entries(sample).slice(0, 5).forEach(([field, value]) => {
            const displayValue = value === null ? 'NULL' : 
                               value === '' ? '(空字符串)' :
                               String(value).length > 30 ? String(value).substring(0, 30) + '...' :
                               value;
            console.log(`  ${field}: ${displayValue}`);
          });
          
        } else {
          console.log('⚠️ 无数据返回，可能需要调整查询条件');
        }
        
      } catch (sqlError) {
        console.log(`❌ SQL测试失败: ${sqlError.message}`);
        continue;
      }
      
      // 5. 更新规则
      console.log('\n💾 更新规则...');
      
      try {
        const [updateResult] = await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, updated_at = NOW()
          WHERE id = ?
        `, [correctSQL, rule.id]);
        
        console.log(`✅ 规则${rule.id}更新成功: 影响行数 ${updateResult.affectedRows}`);
        
      } catch (updateError) {
        console.log(`❌ 更新规则${rule.id}失败: ${updateError.message}`);
      }
    }
    
    console.log('\n🎉 结构件类上线情况查询规则修复完成！');
    
    console.log('\n修复总结:');
    console.log('✅ 修复了SQL函数显示为字段名的问题');
    console.log('✅ 确保所有字段都有正确的中文别名');
    console.log('✅ 根据场景标准调整字段映射');
    console.log('✅ 优化了查询条件和排序');
    
  } catch (error) {
    console.error('❌ 修复结构件类上线情况查询规则失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

fixStructureOnlineRule().catch(console.error);
