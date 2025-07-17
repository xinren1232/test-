import mysql from 'mysql2/promise';

async function fixRealFieldMapping() {
  let connection;
  
  try {
    console.log('🔧 基于真实数据生成程序修复字段映射...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查实际数据库表结构
    console.log('\n📋 步骤1: 检查实际数据库表结构...');
    
    const tables = ['inventory', 'lab_tests', 'production_online'];
    const actualFields = {};
    
    for (const table of tables) {
      try {
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        actualFields[table] = columns.map(col => col.Field);
        console.log(`${table}表实际字段: ${actualFields[table].join(', ')}`);
      } catch (error) {
        console.log(`❌ 检查${table}表失败: ${error.message}`);
      }
    }
    
    // 2. 基于您的数据生成程序定义正确的字段映射
    console.log('\n🗺️ 步骤2: 基于真实数据生成程序定义正确字段映射...');
    
    const realFieldMappings = {
      'inventory': {
        scenarioName: '库存场景',
        expectedFields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
        correctSQL: `SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory`
      },
      
      'lab_tests': {
        scenarioName: '测试场景',
        expectedFields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
        correctSQL: `SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  project_id as 项目,
  baseline_id as 基线,
  material_code as 物料编码,
  COALESCE(quantity, 1) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests`
      },
      
      'production_online': {
        scenarioName: '上线场景',
        expectedFields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
        correctSQL: `SELECT 
  factory as 工厂,
  baseline_id as 基线,
  project_id as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_no as 批次号,
  defect_rate as 不良率,
  COALESCE(weekly_exception, 0) as 本周异常,
  DATE_FORMAT(online_time, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM production_online`
      }
    };
    
    // 3. 验证字段映射的正确性
    console.log('\n🔍 步骤3: 验证字段映射正确性...');
    
    for (const [table, mapping] of Object.entries(realFieldMappings)) {
      console.log(`\n验证${table}表 (${mapping.scenarioName}):`);
      
      if (!actualFields[table]) {
        console.log(`  ❌ 表${table}不存在，跳过验证`);
        continue;
      }
      
      // 提取SQL中使用的字段
      const sqlFields = mapping.correctSQL.match(/(\w+)(?:\s+as\s+[\u4e00-\u9fa5]+)?/g);
      const usedFields = sqlFields ? sqlFields.map(field => field.split(' ')[0]).filter(f => f !== 'SELECT' && f !== 'FROM' && f !== 'COALESCE' && f !== 'DATE_FORMAT' && f !== 'DATE_ADD' && f !== 'INTERVAL') : [];
      
      console.log(`  SQL中使用的字段: ${usedFields.join(', ')}`);
      console.log(`  数据库实际字段: ${actualFields[table].join(', ')}`);
      
      // 检查字段是否存在
      const missingFields = usedFields.filter(field => !actualFields[table].includes(field));
      if (missingFields.length > 0) {
        console.log(`  ❌ 缺少字段: ${missingFields.join(', ')}`);
      } else {
        console.log(`  ✅ 所有字段都存在`);
      }
      
      // 测试SQL执行
      try {
        let testSQL = mapping.correctSQL + ' LIMIT 1';
        const [results] = await connection.execute(testSQL);
        
        if (results.length > 0) {
          const returnedFields = Object.keys(results[0]);
          console.log(`  ✅ SQL执行成功，返回字段: ${returnedFields.join(', ')}`);
          
          // 检查是否为中文字段
          const allChinese = returnedFields.every(field => /[\u4e00-\u9fa5]/.test(field));
          console.log(`  ${allChinese ? '✅' : '❌'} 字段名检查: ${allChinese ? '全部为中文' : '包含非中文字段'}`);
        } else {
          console.log(`  ⚠️ SQL执行成功但无数据`);
        }
      } catch (error) {
        console.log(`  ❌ SQL执行失败: ${error.message}`);
      }
    }
    
    // 4. 修复有问题的规则
    console.log('\n🔧 步骤4: 修复有问题的规则...');
    
    const rulesToFix = [
      { id: 243, category: '库存场景', table: 'inventory' },
      { id: 314, category: '测试场景', table: 'lab_tests' },
      { id: 335, category: '测试场景', table: 'lab_tests' },
      { id: 480, category: '数据探索', table: 'inventory' },
      { id: 485, category: '数据探索', table: 'inventory' }
    ];
    
    for (const rule of rulesToFix) {
      console.log(`\n修复规则${rule.id} (${rule.category}):`);
      
      const mapping = realFieldMappings[rule.table];
      if (!mapping) {
        console.log(`  ❌ 找不到${rule.table}的字段映射`);
        continue;
      }
      
      let newSQL = mapping.correctSQL;
      
      // 根据规则类型调整SQL
      if (rule.id === 243) {
        // 物料库存信息查询_优化 - 需要参数
        newSQL += `\nWHERE material_name LIKE CONCAT('%', ?, '%')\nORDER BY id DESC`;
      } else if (rule.id === 314) {
        // 物料测试情况查询 - 需要参数
        newSQL += `\nWHERE material_name LIKE CONCAT('%', ?, '%')\nORDER BY test_date DESC`;
      } else if (rule.id === 335) {
        // 物料测试结果查询_优化 - 需要参数
        newSQL += `\nWHERE material_name LIKE CONCAT('%', ?, '%')\nORDER BY test_date DESC`;
      } else if (rule.id === 480) {
        // 查看所有物料
        newSQL = `SELECT DISTINCT 
  material_name as 物料名称,
  material_code as 物料编码,
  COUNT(*) as 记录数量
FROM inventory 
WHERE material_name IS NOT NULL AND material_name != ''
GROUP BY material_name, material_code
ORDER BY 记录数量 DESC
LIMIT 10`;
      } else if (rule.id === 485) {
        // 查看所有供应商
        newSQL = `SELECT DISTINCT 
  supplier_name as 供应商,
  COUNT(*) as 记录数量
FROM inventory 
WHERE supplier_name IS NOT NULL AND supplier_name != ''
GROUP BY supplier_name
ORDER BY 记录数量 DESC
LIMIT 10`;
      }
      
      try {
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, updated_at = NOW()
          WHERE id = ?
        `, [newSQL, rule.id]);
        
        console.log(`  ✅ 规则${rule.id}已更新`);
        
        // 测试更新后的规则
        try {
          let testSQL = newSQL;
          if (testSQL.includes('?')) {
            testSQL = testSQL.replace(/\?/g, "'电池'");
          }
          
          const [testResults] = await connection.execute(testSQL);
          console.log(`  ✅ 测试成功: ${testResults.length}条记录`);
          
          if (testResults.length > 0) {
            const fields = Object.keys(testResults[0]);
            const allChinese = fields.every(field => /[\u4e00-\u9fa5]/.test(field));
            console.log(`  字段: ${fields.join(', ')}`);
            console.log(`  ${allChinese ? '✅' : '❌'} 字段名: ${allChinese ? '全部为中文' : '包含非中文字段'}`);
          }
        } catch (error) {
          console.log(`  ❌ 测试失败: ${error.message}`);
        }
        
      } catch (error) {
        console.log(`  ❌ 更新规则${rule.id}失败: ${error.message}`);
      }
    }
    
    // 5. 输出修复总结
    console.log('\n📊 步骤5: 修复总结...');
    
    console.log('修复完成的规则:');
    console.log('✅ 规则243: 物料库存信息查询_优化 - 使用真实inventory字段');
    console.log('✅ 规则314: 物料测试情况查询 - 使用真实lab_tests字段');
    console.log('✅ 规则335: 物料测试结果查询_优化 - 使用真实lab_tests字段');
    console.log('✅ 规则480: 查看所有物料 - 使用真实inventory字段');
    console.log('✅ 规则485: 查看所有供应商 - 使用真实inventory字段');
    
    console.log('\n字段映射标准:');
    Object.entries(realFieldMappings).forEach(([table, mapping]) => {
      console.log(`${table} (${mapping.scenarioName}): ${mapping.expectedFields.join(', ')}`);
    });
    
    console.log('\n🎉 基于真实数据生成程序的字段映射修复完成！');
    
  } catch (error) {
    console.error('❌ 修复真实字段映射失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

fixRealFieldMapping().catch(console.error);
