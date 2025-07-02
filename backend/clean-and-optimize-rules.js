/**
 * 清理和优化智能问答规则
 * 移除重复规则和基于示例数据的规则，只保留基于真实业务数据的规则
 */

import mysql from 'mysql2/promise';

// 清理后的规则 - 只基于真实业务数据，无重复
const CLEAN_BUSINESS_RULES = [
  // 项目查询规则 - 基于真实项目
  {
    intent_name: 'query_real_projects',
    description: '查询真实项目信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'online_tracking',
    parameters: JSON.stringify([
      {
        name: 'project',
        type: 'string',
        description: '项目ID',
        extract_pattern: '(X6827|KI5K|S665LN|X6828|X6831|S662LN|S663LN|S664LN)'
      }
    ]),
    trigger_words: JSON.stringify(['X6827', 'KI5K', 'S665LN', '项目', '项目查询']),
    synonyms: JSON.stringify({
      '项目': ['工程', '产品', 'project'],
      'X6827': ['X6827项目', 'X6827工程'],
      'KI5K': ['KI5K项目', 'KI5K工程']
    }),
    example_query: '查询X6827项目的生产情况',
    priority: 5,
    status: 'active'
  },

  // 基线查询规则 - 基于真实基线
  {
    intent_name: 'query_real_baselines',
    description: '查询真实基线信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'lab_tests',
    parameters: JSON.stringify([
      {
        name: 'baseline_id',
        type: 'string',
        description: '基线ID',
        extract_pattern: '(I6789|I6788|I6787)'
      }
    ]),
    trigger_words: JSON.stringify(['I6789', 'I6788', 'I6787', '基线', '基线查询']),
    synonyms: JSON.stringify({
      '基线': ['baseline', '测试基线', '质量基线'],
      'I6789': ['I6789基线', 'I6789测试基线'],
      'I6788': ['I6788基线', 'I6788测试基线']
    }),
    example_query: '查询I6789基线的测试情况',
    priority: 5,
    status: 'active'
  },

  // 工厂查询规则 - 基于真实工厂
  {
    intent_name: 'query_real_factories',
    description: '查询真实工厂信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'storage_location',
        type: 'string',
        description: '工厂位置',
        extract_pattern: '(重庆工厂|深圳工厂|南昌工厂|宜宾工厂)'
      }
    ]),
    trigger_words: JSON.stringify(['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂', '工厂', '工厂查询']),
    synonyms: JSON.stringify({
      '工厂': ['厂区', '生产基地', 'factory'],
      '重庆工厂': ['重庆', '重庆厂区'],
      '深圳工厂': ['深圳', '深圳厂区']
    }),
    example_query: '查询重庆工厂的库存情况',
    priority: 5,
    status: 'active'
  },

  // 物料查询规则 - 基于真实物料
  {
    intent_name: 'query_real_materials',
    description: '查询真实物料信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'material_name',
        type: 'string',
        description: '物料名称',
        extract_pattern: '(电池盖|LCD显示屏|OLED显示屏|摄像头模组|中框|电池|充电器|扬声器|听筒|包装盒)'
      }
    ]),
    trigger_words: JSON.stringify(['电池盖', 'LCD显示屏', 'OLED显示屏', '摄像头模组', '物料', '物料查询']),
    synonyms: JSON.stringify({
      '物料': ['材料', '零件', 'material'],
      '电池盖': ['后盖', '背盖', '手机后盖'],
      'LCD显示屏': ['LCD屏', 'LCD屏幕'],
      'OLED显示屏': ['OLED屏', 'OLED屏幕']
    }),
    example_query: '查询电池盖的库存和质量情况',
    priority: 5,
    status: 'active'
  },

  // 供应商查询规则 - 基于真实供应商
  {
    intent_name: 'query_real_suppliers',
    description: '查询真实供应商信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'supplier_name',
        type: 'string',
        description: '供应商名称',
        extract_pattern: '(聚龙|欣冠|广正|BOE|天马|华星|盛泰|天实|深奥|百俊达|奥海|歌尔)'
      }
    ]),
    trigger_words: JSON.stringify(['聚龙', 'BOE', '歌尔', '天马', '华星', '供应商', '供应商查询']),
    synonyms: JSON.stringify({
      '供应商': ['厂商', '制造商', 'supplier'],
      'BOE': ['京东方', 'BOE科技'],
      '歌尔': ['歌尔声学', '歌尔股份']
    }),
    example_query: '查询聚龙供应商的物料质量',
    priority: 5,
    status: 'active'
  },

  // 通用查询规则
  {
    intent_name: 'query_general',
    description: '通用查询',
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
    trigger_words: JSON.stringify(['查询', '检查', '搜索', '统计', '分析']),
    synonyms: JSON.stringify({
      '查询': ['查看', '检查', '搜索'],
      '统计': ['汇总', '计算', '分析']
    }),
    example_query: '查询库存情况',
    priority: 3,
    status: 'active'
  }
];

async function cleanAndOptimizeRules() {
  console.log('🧹 开始清理和优化智能问答规则...\n');

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

    // 插入清理后的规则
    let insertedCount = 0;
    for (const rule of CLEAN_BUSINESS_RULES) {
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

    console.log(`\n📊 规则清理和优化完成:`);
    console.log(`   成功插入: ${insertedCount} 条规则`);
    console.log(`   数据库中活跃规则总数: ${totalCount} 条`);
    console.log(`   规则已去重，只保留基于真实业务数据的规则`);

    await connection.end();
    console.log('\n🎉 规则清理和优化完成！');

  } catch (error) {
    console.error('❌ 清理规则失败:', error);
    process.exit(1);
  }
}

// 运行清理
cleanAndOptimizeRules();
