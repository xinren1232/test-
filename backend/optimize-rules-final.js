/**
 * 最终优化智能问答规则
 * 每个类别只保留1个代表性规则，避免重复
 */

import mysql from 'mysql2/promise';

// 最终优化的规则 - 每个类别1个规则
const OPTIMIZED_FINAL_RULES = [
  // 项目查询规则 - 合并所有项目查询
  {
    intent_name: 'query_projects',
    description: '查询项目信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'online_tracking',
    parameters: JSON.stringify([
      {
        name: 'project',
        type: 'string',
        description: '项目ID',
        extract_pattern: '(X6827|KI5K|S665LN|X6828|X6831|S662LN|S663LN|S664LN|项目)'
      }
    ]),
    trigger_words: JSON.stringify(['项目', '项目查询', 'X6827', 'KI5K', 'S665LN', '生产', '测试']),
    synonyms: JSON.stringify({
      '项目': ['工程', '产品', 'project'],
      '查询': ['查看', '检查', '搜索']
    }),
    example_query: '查询X6827、KI5K、S665LN等项目的生产和测试情况',
    priority: 5,
    status: 'active'
  },

  // 基线查询规则 - 合并所有基线查询
  {
    intent_name: 'query_baselines',
    description: '查询基线信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'lab_tests',
    parameters: JSON.stringify([
      {
        name: 'baseline_id',
        type: 'string',
        description: '基线ID',
        extract_pattern: '(I6789|I6788|I6787|基线)'
      }
    ]),
    trigger_words: JSON.stringify(['基线', '基线查询', 'I6789', 'I6788', 'I6787', '测试']),
    synonyms: JSON.stringify({
      '基线': ['baseline', '测试基线', '质量基线'],
      '查询': ['查看', '检查', '搜索']
    }),
    example_query: '查询I6789、I6788、I6787等基线的测试情况',
    priority: 5,
    status: 'active'
  },

  // 工厂查询规则 - 合并所有工厂查询
  {
    intent_name: 'query_factories',
    description: '查询工厂信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'storage_location',
        type: 'string',
        description: '工厂位置',
        extract_pattern: '(重庆工厂|深圳工厂|南昌工厂|宜宾工厂|工厂)'
      }
    ]),
    trigger_words: JSON.stringify(['工厂', '工厂查询', '重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂', '库存']),
    synonyms: JSON.stringify({
      '工厂': ['厂区', '生产基地', 'factory'],
      '查询': ['查看', '检查', '搜索']
    }),
    example_query: '查询重庆、深圳、南昌、宜宾等工厂的库存情况',
    priority: 5,
    status: 'active'
  },

  // 物料查询规则 - 合并所有物料查询
  {
    intent_name: 'query_materials',
    description: '查询物料信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'material_name',
        type: 'string',
        description: '物料名称',
        extract_pattern: '(电池盖|LCD显示屏|OLED显示屏|摄像头模组|中框|电池|充电器|扬声器|听筒|包装盒|物料)'
      }
    ]),
    trigger_words: JSON.stringify(['物料', '物料查询', '电池盖', 'LCD显示屏', 'OLED显示屏', '摄像头模组', '库存', '质量']),
    synonyms: JSON.stringify({
      '物料': ['材料', '零件', 'material'],
      '查询': ['查看', '检查', '搜索']
    }),
    example_query: '查询电池盖、显示屏、摄像头等物料的库存和质量情况',
    priority: 5,
    status: 'active'
  },

  // 供应商查询规则 - 合并所有供应商查询
  {
    intent_name: 'query_suppliers',
    description: '查询供应商信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'supplier_name',
        type: 'string',
        description: '供应商名称',
        extract_pattern: '(聚龙|欣冠|广正|BOE|天马|华星|盛泰|天实|深奥|百俊达|奥海|歌尔|供应商)'
      }
    ]),
    trigger_words: JSON.stringify(['供应商', '供应商查询', '聚龙', 'BOE', '歌尔', '天马', '华星', '质量']),
    synonyms: JSON.stringify({
      '供应商': ['厂商', '制造商', 'supplier'],
      '查询': ['查看', '检查', '搜索']
    }),
    example_query: '查询聚龙、BOE、歌尔等供应商的物料质量',
    priority: 5,
    status: 'active'
  },

  // 质量查询规则 - 合并所有质量查询
  {
    intent_name: 'query_quality',
    description: '查询质量信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'lab_tests',
    parameters: JSON.stringify([
      {
        name: 'keyword',
        type: 'string',
        description: '质量关键词',
        extract_pattern: '(测试|质量|合格|不合格|检验)'
      }
    ]),
    trigger_words: JSON.stringify(['质量', '测试', '检验', '合格', '不合格', '质量查询']),
    synonyms: JSON.stringify({
      '质量': ['品质', '质检'],
      '测试': ['检验', '检测', '试验']
    }),
    example_query: '查询测试记录和质量情况',
    priority: 5,
    status: 'active'
  },

  // 统计查询规则 - 合并所有统计查询
  {
    intent_name: 'query_statistics',
    description: '查询统计信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'keyword',
        type: 'string',
        description: '统计关键词',
        extract_pattern: '(统计|数量|多少|几个|几家|汇总)'
      }
    ]),
    trigger_words: JSON.stringify(['统计', '数量', '多少', '几个', '几家', '汇总', '数据统计']),
    synonyms: JSON.stringify({
      '统计': ['汇总', '计算', '分析'],
      '数量': ['个数', '总数']
    }),
    example_query: '查询物料、供应商、项目等统计信息',
    priority: 5,
    status: 'active'
  }
];

async function optimizeRulesFinal() {
  console.log('🔧 开始最终优化智能问答规则...\n');

  try {
    // 连接数据库
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });

    console.log('✅ 连接到数据库成功！');

    // 清空所有现有规则
    await connection.execute('DELETE FROM nlp_intent_rules');
    console.log('🗑️ 清空所有现有规则');

    // 插入最终优化的规则
    let insertedCount = 0;
    for (const rule of OPTIMIZED_FINAL_RULES) {
      try {
        await connection.execute(
          `INSERT INTO nlp_intent_rules 
           (intent_name, description, action_type, action_target, parameters, trigger_words, synonyms, example_query, priority, status, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            rule.intent_name,
            rule.description,
            rule.action_type,
            rule.action_target,
            rule.parameters,
            rule.trigger_words,
            rule.synonyms,
            rule.example_query,
            rule.priority,
            rule.status
          ]
        );
        console.log(`✅ 插入规则: ${rule.intent_name}`);
        insertedCount++;
      } catch (error) {
        console.log(`❌ 插入规则失败 ${rule.intent_name}:`, error.message);
      }
    }

    // 验证插入结果
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = "active"');
    const totalCount = rows[0].count;

    console.log(`\n📊 最终规则优化完成:`);
    console.log(`   成功插入: ${insertedCount} 条规则`);
    console.log(`   数据库中活跃规则总数: ${totalCount} 条`);
    console.log(`   每个类别只保留1个代表性规则，避免重复`);

    await connection.end();
    console.log('\n🎉 最终规则优化完成！');

  } catch (error) {
    console.error('❌ 优化规则失败:', error);
    process.exit(1);
  }
}

// 运行优化
optimizeRulesFinal();
