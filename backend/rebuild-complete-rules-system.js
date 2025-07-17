import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function rebuildCompleteRulesSystem() {
  console.log('🚀 全面重构规则系统...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 清空现有规则
    console.log('1. 🧹 清空现有规则...');
    await connection.execute('DELETE FROM nlp_intent_rules');
    console.log('   ✅ 现有规则已清空');
    
    // 2. 定义标准SQL模板（基于真实字段）
    const sqlTemplates = {
      // 库存场景 - 使用真实字段
      inventory: `
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

      // 上线场景 - 使用真实字段
      online: `
SELECT 
  'N/A' as 工厂,
  'N/A' as 基线,
  'N/A' as 项目,
  'N/A' as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  'N/A' as 批次号,
  COALESCE(defect_rate, 0) as 不良率,
  COALESCE(exception_count, 0) as 本周异常,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking 
WHERE 1=1`,

      // 测试场景 - 使用真实字段
      test: `
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
WHERE 1=1`
    };
    
    // 3. 定义供应商列表（基于真实数据）
    const suppliers = [
      '聚龙', '欣冠', '广正', '帝晶', '天马', 'BOE', '华星', '盛泰', 
      '天实', '深奥', '百俊达', '奥海', '辰阳', '锂威', '风华', '维科',
      '东声', '豪声', '歌尔', '丽德宝', '裕同', '富群'
    ];
    
    // 4. 定义物料大类
    const materialCategories = {
      '结构件类': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
      '光学类': ['LCD显示屏', 'OLED显示屏', '摄像头'],
      '充电类': ['电池', '充电器'],
      '声学类': ['听筒', '喇叭'],
      '包装类': ['保护套', '标签', '包装盒']
    };
    
    // 5. 创建规则数组
    const rules = [];
    
    // 基础查询规则
    console.log('2. 📋 创建基础查询规则...');
    
    // 库存基础规则
    rules.push({
      intent_name: '物料库存信息查询',
      description: '查询物料库存基本信息',
      action_type: 'SQL_QUERY',
      action_target: sqlTemplates.inventory + ' ORDER BY inbound_time DESC LIMIT 50',
      trigger_words: ['库存', '库存信息', '物料库存', '查询库存'],
      example_query: '查询物料库存信息',
      category: '库存场景',
      priority: 10,
      sort_order: 1
    });
    
    // 测试基础规则
    rules.push({
      intent_name: '物料测试情况查询',
      description: '查询物料测试基本信息',
      action_type: 'SQL_QUERY',
      action_target: sqlTemplates.test + ' ORDER BY test_date DESC LIMIT 50',
      trigger_words: ['测试', '测试情况', '物料测试', '查询测试'],
      example_query: '查询物料测试情况',
      category: '测试场景',
      priority: 10,
      sort_order: 2
    });
    
    // 上线基础规则
    rules.push({
      intent_name: '物料上线情况查询',
      description: '查询物料上线基本信息',
      action_type: 'SQL_QUERY',
      action_target: sqlTemplates.online + ' ORDER BY online_date DESC LIMIT 50',
      trigger_words: ['上线', '上线情况', '物料上线', '查询上线'],
      example_query: '查询物料上线情况',
      category: '上线场景',
      priority: 10,
      sort_order: 3
    });
    
    // 供应商专用规则
    console.log('3. 🏢 创建供应商专用规则...');
    
    suppliers.forEach((supplier, index) => {
      // 供应商库存查询
      rules.push({
        intent_name: `${supplier}供应商库存查询`,
        description: `查询${supplier}供应商的库存信息`,
        action_type: 'SQL_QUERY',
        action_target: sqlTemplates.inventory + ` AND supplier_name LIKE '%${supplier}%' ORDER BY inbound_time DESC LIMIT 50`,
        trigger_words: [supplier, '供应商', '库存', `${supplier}库存`, `${supplier}供应商库存`],
        example_query: `查询${supplier}供应商的库存`,
        category: '库存场景',
        priority: 15,
        sort_order: 10 + index
      });
      
      // 供应商测试查询
      rules.push({
        intent_name: `${supplier}供应商测试查询`,
        description: `查询${supplier}供应商的测试信息`,
        action_type: 'SQL_QUERY',
        action_target: sqlTemplates.test + ` AND supplier_name LIKE '%${supplier}%' ORDER BY test_date DESC LIMIT 50`,
        trigger_words: [supplier, '供应商', '测试', `${supplier}测试`, `${supplier}供应商测试`],
        example_query: `查询${supplier}供应商的测试情况`,
        category: '测试场景',
        priority: 15,
        sort_order: 100 + index
      });
      
      // 供应商上线查询
      rules.push({
        intent_name: `${supplier}供应商上线查询`,
        description: `查询${supplier}供应商的上线信息`,
        action_type: 'SQL_QUERY',
        action_target: sqlTemplates.online + ` AND supplier_name LIKE '%${supplier}%' ORDER BY online_date DESC LIMIT 50`,
        trigger_words: [supplier, '供应商', '上线', `${supplier}上线`, `${supplier}供应商上线`],
        example_query: `查询${supplier}供应商的上线情况`,
        category: '上线场景',
        priority: 15,
        sort_order: 200 + index
      });
    });
    
    // 物料大类规则
    console.log('4. 📦 创建物料大类规则...');
    
    Object.entries(materialCategories).forEach(([category, materials], catIndex) => {
      const materialCondition = materials.map(m => `material_name LIKE '%${m}%'`).join(' OR ');
      
      // 大类库存查询
      rules.push({
        intent_name: `${category}库存查询`,
        description: `查询${category}物料的库存信息`,
        action_type: 'SQL_QUERY',
        action_target: sqlTemplates.inventory + ` AND (${materialCondition}) ORDER BY inbound_time DESC LIMIT 50`,
        trigger_words: [category, '库存', `${category}库存`, ...materials],
        example_query: `查询${category}库存情况`,
        category: '库存场景',
        priority: 12,
        sort_order: 300 + catIndex
      });
      
      // 大类测试查询
      rules.push({
        intent_name: `${category}测试查询`,
        description: `查询${category}物料的测试信息`,
        action_type: 'SQL_QUERY',
        action_target: sqlTemplates.test + ` AND (${materialCondition}) ORDER BY test_date DESC LIMIT 50`,
        trigger_words: [category, '测试', `${category}测试`, ...materials],
        example_query: `查询${category}测试情况`,
        category: '测试场景',
        priority: 12,
        sort_order: 400 + catIndex
      });
      
      // 大类上线查询
      rules.push({
        intent_name: `${category}上线查询`,
        description: `查询${category}物料的上线信息`,
        action_type: 'SQL_QUERY',
        action_target: sqlTemplates.online + ` AND (${materialCondition}) ORDER BY online_date DESC LIMIT 50`,
        trigger_words: [category, '上线', `${category}上线`, ...materials],
        example_query: `查询${category}上线情况`,
        category: '上线场景',
        priority: 12,
        sort_order: 500 + catIndex
      });
    });
    
    console.log(`   创建了 ${rules.length} 条规则`);
    
    // 6. 批量插入规则
    console.log('5. 💾 批量插入规则到数据库...');
    
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
    
    // 7. 验证插入结果
    console.log('6. 🧪 验证插入结果...');
    
    const [totalCount] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = "active"');
    console.log(`   总规则数: ${totalCount[0].count}`);
    
    const [categoryStats] = await connection.execute(`
      SELECT category, COUNT(*) as count 
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      GROUP BY category
    `);
    
    console.log('   分类统计:');
    categoryStats.forEach(stat => {
      console.log(`     - ${stat.category}: ${stat.count} 条`);
    });
    
    await connection.end();
    
    console.log('\n🎉 规则系统重构完成！');
    console.log('📋 重构特点:');
    console.log('   ✅ 基于真实数据字段设计');
    console.log('   ✅ 覆盖三个场景（库存、测试、上线）');
    console.log('   ✅ 支持所有供应商查询');
    console.log('   ✅ 支持物料大类查询');
    console.log('   ✅ 结果呈现使用实际页面字段');
    console.log('   ✅ 优化触发词和优先级');
    
  } catch (error) {
    console.error('❌ 重构失败:', error.message);
  }
}

// 测试规则匹配功能
async function testRulesMatching() {
  console.log('\n🧪 测试规则匹配功能...\n');

  try {
    const connection = await mysql.createConnection(dbConfig);

    const testQueries = [
      '查询聚龙供应商的库存',
      '查询结构件类测试情况',
      'BOE供应商上线情况',
      '查询光学类库存',
      '物料测试情况',
      '查询充电类上线情况'
    ];

    for (const query of testQueries) {
      console.log(`🔍 测试查询: "${query}"`);

      // 简单关键词匹配逻辑
      const keywords = query.split(/[，。！？\s]+/).filter(k => k.length > 0);

      const [matches] = await connection.execute(`
        SELECT intent_name, category, priority, example_query
        FROM nlp_intent_rules
        WHERE status = 'active'
        AND (${keywords.map(() => 'JSON_EXTRACT(trigger_words, "$") LIKE ?').join(' OR ')})
        ORDER BY priority DESC, sort_order ASC
        LIMIT 3
      `, keywords.map(k => `%${k}%`));

      if (matches.length > 0) {
        console.log('   匹配结果:');
        matches.forEach((match, index) => {
          console.log(`     ${index + 1}. ${match.intent_name} (${match.category}, 优先级:${match.priority})`);
        });
      } else {
        console.log('   ❌ 未找到匹配规则');
      }
      console.log('');
    }

    await connection.end();

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

rebuildCompleteRulesSystem().then(() => {
  testRulesMatching();
});
