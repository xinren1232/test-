import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function optimizeRulesByScenarios() {
  console.log('🎯 按场景优化规则系统...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 清空现有规则
    console.log('1. 🧹 清空现有规则...');
    await connection.execute('DELETE FROM nlp_intent_rules');
    console.log('   ✅ 现有规则已清空');
    
    // 2. 定义三个场景的标准SQL模板（基于真实数据库表）
    const scenarioTemplates = {
      // 库存场景 - 统一字段呈现
      inventory: {
        baseSQL: `
SELECT 
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
FROM inventory 
WHERE 1=1`,
        fields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注']
      },
      
      // 测试场景 - 统一字段呈现
      test: {
        baseSQL: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '') as 项目,
  COALESCE(baseline_id, '') as 基线,
  material_code as 物料编码,
  1 as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests 
WHERE 1=1`,
        fields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注']
      },
      
      // 上线场景 - 统一字段呈现
      online: {
        baseSQL: `
SELECT 
  'N/A' as 工厂,
  'N/A' as 基线,
  'N/A' as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  'N/A' as 批次号,
  COALESCE(defect_rate, 0) as 不良率,
  COALESCE(exception_count, 0) as 本周异常,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking 
WHERE 1=1`,
        fields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注']
      }
    };
    
    // 3. 获取真实数据中的供应商和物料
    console.log('2. 📊 获取真实数据...');
    
    const [suppliers] = await connection.execute(`
      SELECT DISTINCT supplier_name 
      FROM inventory 
      WHERE supplier_name IS NOT NULL 
      ORDER BY supplier_name
    `);
    
    const [materials] = await connection.execute(`
      SELECT DISTINCT material_name 
      FROM inventory 
      WHERE material_name IS NOT NULL 
      ORDER BY material_name
    `);
    
    console.log(`   真实供应商: ${suppliers.length} 个`);
    console.log(`   真实物料: ${materials.length} 种`);
    
    // 4. 定义物料大类映射（基于真实数据）
    const materialCategories = {
      '结构件类': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
      '光学类': ['LCD显示屏', 'OLED显示屏', '摄像头'],
      '充电类': ['电池', '充电器'],
      '声学类': ['听筒', '喇叭'],
      '包装类': ['保护套', '标签', '包装盒']
    };
    
    // 5. 创建优化后的规则
    const rules = [];
    let sortOrder = 1;
    
    // 基础场景规则
    console.log('3. 📋 创建基础场景规则...');
    
    // 库存基础规则
    rules.push({
      intent_name: '库存信息查询',
      description: '查询库存基本信息',
      action_type: 'SQL_QUERY',
      action_target: scenarioTemplates.inventory.baseSQL + ' ORDER BY inbound_time DESC LIMIT 50',
      trigger_words: ['库存', '库存信息', '物料库存', '查询库存', '库存查询', '库存情况'],
      example_query: '查询库存信息',
      category: '库存场景',
      priority: 10,
      sort_order: sortOrder++
    });
    
    // 测试基础规则
    rules.push({
      intent_name: '测试信息查询',
      description: '查询测试基本信息',
      action_type: 'SQL_QUERY',
      action_target: scenarioTemplates.test.baseSQL + ' ORDER BY test_date DESC LIMIT 50',
      trigger_words: ['测试', '测试信息', '物料测试', '查询测试', '测试查询', '测试情况'],
      example_query: '查询测试信息',
      category: '测试场景',
      priority: 10,
      sort_order: sortOrder++
    });
    
    // 上线基础规则
    rules.push({
      intent_name: '上线信息查询',
      description: '查询上线基本信息',
      action_type: 'SQL_QUERY',
      action_target: scenarioTemplates.online.baseSQL + ' ORDER BY online_date DESC LIMIT 50',
      trigger_words: ['上线', '上线信息', '物料上线', '查询上线', '上线查询', '上线情况'],
      example_query: '查询上线信息',
      category: '上线场景',
      priority: 10,
      sort_order: sortOrder++
    });
    
    // 供应商专用规则
    console.log('4. 🏢 创建供应商专用规则...');
    
    suppliers.forEach(supplier => {
      const supplierName = supplier.supplier_name;
      
      // 供应商库存查询 - 归类到库存场景
      rules.push({
        intent_name: `${supplierName}供应商库存查询`,
        description: `查询${supplierName}供应商的库存信息`,
        action_type: 'SQL_QUERY',
        action_target: scenarioTemplates.inventory.baseSQL + ` AND supplier_name = '${supplierName}' ORDER BY inbound_time DESC LIMIT 50`,
        trigger_words: [supplierName, '供应商', '库存', `${supplierName}库存`, `${supplierName}供应商库存`, '库存查询'],
        example_query: `查询${supplierName}供应商的库存`,
        category: '库存场景',
        priority: 15,
        sort_order: sortOrder++
      });
      
      // 供应商测试查询 - 归类到测试场景
      rules.push({
        intent_name: `${supplierName}供应商测试查询`,
        description: `查询${supplierName}供应商的测试信息`,
        action_type: 'SQL_QUERY',
        action_target: scenarioTemplates.test.baseSQL + ` AND supplier_name = '${supplierName}' ORDER BY test_date DESC LIMIT 50`,
        trigger_words: [supplierName, '供应商', '测试', `${supplierName}测试`, `${supplierName}供应商测试`, '测试查询'],
        example_query: `查询${supplierName}供应商的测试情况`,
        category: '测试场景',
        priority: 15,
        sort_order: sortOrder++
      });
      
      // 供应商上线查询 - 归类到上线场景
      rules.push({
        intent_name: `${supplierName}供应商上线查询`,
        description: `查询${supplierName}供应商的上线信息`,
        action_type: 'SQL_QUERY',
        action_target: scenarioTemplates.online.baseSQL + ` AND supplier_name = '${supplierName}' ORDER BY online_date DESC LIMIT 50`,
        trigger_words: [supplierName, '供应商', '上线', `${supplierName}上线`, `${supplierName}供应商上线`, '上线查询'],
        example_query: `查询${supplierName}供应商的上线情况`,
        category: '上线场景',
        priority: 15,
        sort_order: sortOrder++
      });
    });
    
    // 物料大类规则
    console.log('5. 📦 创建物料大类规则...');
    
    Object.entries(materialCategories).forEach(([category, materialList]) => {
      const materialCondition = materialList.map(m => `material_name LIKE '%${m}%'`).join(' OR ');
      
      // 大类库存查询 - 归类到库存场景
      rules.push({
        intent_name: `${category}库存查询`,
        description: `查询${category}物料的库存信息`,
        action_type: 'SQL_QUERY',
        action_target: scenarioTemplates.inventory.baseSQL + ` AND (${materialCondition}) ORDER BY inbound_time DESC LIMIT 50`,
        trigger_words: [category, '库存', `${category}库存`, '库存查询', ...materialList],
        example_query: `查询${category}库存情况`,
        category: '库存场景',
        priority: 12,
        sort_order: sortOrder++
      });
      
      // 大类测试查询 - 归类到测试场景
      rules.push({
        intent_name: `${category}测试查询`,
        description: `查询${category}物料的测试信息`,
        action_type: 'SQL_QUERY',
        action_target: scenarioTemplates.test.baseSQL + ` AND (${materialCondition}) ORDER BY test_date DESC LIMIT 50`,
        trigger_words: [category, '测试', `${category}测试`, '测试查询', ...materialList],
        example_query: `查询${category}测试情况`,
        category: '测试场景',
        priority: 12,
        sort_order: sortOrder++
      });
      
      // 大类上线查询 - 归类到上线场景
      rules.push({
        intent_name: `${category}上线查询`,
        description: `查询${category}物料的上线信息`,
        action_type: 'SQL_QUERY',
        action_target: scenarioTemplates.online.baseSQL + ` AND (${materialCondition}) ORDER BY online_date DESC LIMIT 50`,
        trigger_words: [category, '上线', `${category}上线`, '上线查询', ...materialList],
        example_query: `查询${category}上线情况`,
        category: '上线场景',
        priority: 12,
        sort_order: sortOrder++
      });
    });
    
    console.log(`   创建了 ${rules.length} 条优化规则`);
    
    // 6. 批量插入规则
    console.log('6. 💾 批量插入优化规则...');
    
    for (const rule of rules) {
      await connection.execute(`
        INSERT INTO nlp_intent_rules (
          intent_name, description, action_type, action_target, 
          trigger_words, example_query, category, priority, sort_order,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
      `, [
        rule.intent_name,
        rule.description,
        rule.action_type,
        rule.action_target,
        JSON.stringify(rule.trigger_words),
        rule.example_query,
        rule.category,
        rule.priority,
        rule.sort_order
      ]);
    }
    
    console.log(`   ✅ 成功插入 ${rules.length} 条规则`);
    
    // 7. 验证优化结果
    console.log('7. 🧪 验证优化结果...');
    
    const [totalCount] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = "active"');
    console.log(`   总规则数: ${totalCount[0].count}`);
    
    const [categoryStats] = await connection.execute(`
      SELECT category, COUNT(*) as count 
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      GROUP BY category
    `);
    
    console.log('   场景分布:');
    categoryStats.forEach(stat => {
      console.log(`     - ${stat.category}: ${stat.count} 条`);
    });
    
    await connection.end();
    
    console.log('\n🎉 场景优化完成！');
    console.log('📋 优化特点:');
    console.log('   ✅ 严格按三个场景归类');
    console.log('   ✅ 统一场景字段呈现');
    console.log('   ✅ 基于真实数据设计');
    console.log('   ✅ 调用真实数据库数据');
    console.log('   ✅ 优化匹配触发词');
    
  } catch (error) {
    console.error('❌ 优化失败:', error.message);
  }
}

optimizeRulesByScenarios();
