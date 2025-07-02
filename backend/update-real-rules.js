/**
 * 基于真实业务数据更新智能问答规则
 * 使用实际的项目、基线、物料、供应商信息
 */

import mysql from 'mysql2/promise';

// 基于真实业务数据的规则
const REAL_BUSINESS_RULES = [
  // 项目查询规则 - 基于真实项目
  {
    intent_name: 'query_project_x6827',
    description: '查询X6827项目相关信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'online_tracking',
    parameters: JSON.stringify([
      {
        name: 'project',
        type: 'string',
        description: '项目ID',
        extract_pattern: '(X6827)'
      }
    ]),
    trigger_words: JSON.stringify(['X6827', 'X6827项目']),
    synonyms: JSON.stringify({
      'X6827': ['X6827项目', 'X6827工程']
    }),
    example_query: '查询X6827项目的生产情况',
    priority: 5,
    status: 'active'
  },
  {
    intent_name: 'query_project_ki5k',
    description: '查询KI5K项目相关信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'online_tracking',
    parameters: JSON.stringify([
      {
        name: 'project',
        type: 'string',
        description: '项目ID',
        extract_pattern: '(KI5K)'
      }
    ]),
    trigger_words: JSON.stringify(['KI5K', 'KI5K项目']),
    synonyms: JSON.stringify({
      'KI5K': ['KI5K项目', 'KI5K工程']
    }),
    example_query: '查询KI5K项目的测试记录',
    priority: 5,
    status: 'active'
  },

  // 基线查询规则 - 基于真实基线
  {
    intent_name: 'query_baseline_i6789',
    description: '查询I6789基线相关信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'lab_tests',
    parameters: JSON.stringify([
      {
        name: 'baseline_id',
        type: 'string',
        description: '基线ID',
        extract_pattern: '(I6789|I6789基线)'
      }
    ]),
    trigger_words: JSON.stringify(['I6789', 'I6789基线']),
    synonyms: JSON.stringify({
      'I6789': ['I6789基线', 'I6789测试基线']
    }),
    example_query: '查询I6789基线的测试情况',
    priority: 5,
    status: 'active'
  },

  // 工厂查询规则 - 基于真实工厂
  {
    intent_name: 'query_chongqing_factory',
    description: '查询重庆工厂相关信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'storage_location',
        type: 'string',
        description: '工厂位置',
        extract_pattern: '(重庆工厂|重庆)'
      }
    ]),
    trigger_words: JSON.stringify(['重庆工厂', '重庆', '重庆厂区']),
    synonyms: JSON.stringify({
      '重庆工厂': ['重庆', '重庆厂区', '重庆生产基地']
    }),
    example_query: '查询重庆工厂的库存情况',
    priority: 5,
    status: 'active'
  },

  // 物料查询规则 - 基于真实物料
  {
    intent_name: 'query_battery_cover_material',
    description: '查询电池盖物料信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'material_name',
        type: 'string',
        description: '物料名称',
        extract_pattern: '(电池盖|后盖)'
      }
    ]),
    trigger_words: JSON.stringify(['电池盖', '后盖', '手机后盖']),
    synonyms: JSON.stringify({
      '电池盖': ['后盖', '手机后盖', '背盖']
    }),
    example_query: '查询电池盖的库存和质量情况',
    priority: 5,
    status: 'active'
  },

  // 供应商查询规则 - 基于真实供应商
  {
    intent_name: 'query_supplier_julong',
    description: '查询聚龙供应商信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'supplier_name',
        type: 'string',
        description: '供应商名称',
        extract_pattern: '(聚龙)'
      }
    ]),
    trigger_words: JSON.stringify(['聚龙', '聚龙供应商']),
    synonyms: JSON.stringify({
      '聚龙': ['聚龙公司', '聚龙供应商']
    }),
    example_query: '查询聚龙供应商的物料质量',
    priority: 5,
    status: 'active'
  },

  // 综合查询规则
  {
    intent_name: 'query_general_inventory',
    description: '通用库存查询',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'keyword',
        type: 'string',
        description: '查询关键词',
        extract_pattern: '(.+)'
      }
    ]),
    trigger_words: JSON.stringify(['库存', '物料', '查询', '检查']),
    synonyms: JSON.stringify({
      '库存': ['存货', '物料', '材料'],
      '查询': ['查看', '检查', '搜索']
    }),
    example_query: '查询库存情况',
    priority: 3,
    status: 'active'
  }
];

async function updateRealRules() {
  console.log('🔄 开始更新基于真实业务数据的智能问答规则...\n');

  try {
    // 连接数据库
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });

    console.log('✅ 连接到数据库成功！');

    // 清空现有规则
    await connection.execute('DELETE FROM nlp_intent_rules WHERE status = "active"');
    console.log('🗑️ 清空现有活跃规则');

    // 插入真实业务规则
    let insertedCount = 0;
    for (const rule of REAL_BUSINESS_RULES) {
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

    console.log(`\n📊 真实业务规则更新完成:`);
    console.log(`   成功插入: ${insertedCount} 条规则`);
    console.log(`   数据库中活跃规则总数: ${totalCount} 条`);

    await connection.end();
    console.log('\n🎉 基于真实业务数据的规则更新完成！');

  } catch (error) {
    console.error('❌ 更新规则失败:', error);
    process.exit(1);
  }
}

// 运行更新
updateRealRules();
