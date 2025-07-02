/**
 * 基于真实业务数据更新智能问答规则
 * 使用前端数据文件中的实际物料、供应商、项目信息
 */

import mysql from 'mysql2/promise';

// 基于真实业务数据的优化规则
const REAL_BUSINESS_RULES = [
  // 物料查询规则 - 基于真实物料
  {
    intent_name: 'query_battery_cover',
    description: '查询电池盖相关信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'material_name',
        type: 'string',
        description: '物料名称',
        extract_pattern: '(电池盖)'
      }
    ]),
    trigger_words: JSON.stringify(['电池盖', '后盖', '背盖']),
    synonyms: JSON.stringify({
      '电池盖': ['后盖', '背盖', '电池后盖'],
      '查询': ['查看', '检查', '搜索']
    }),
    example_query: '查询电池盖的库存情况',
    priority: 5,
    status: 'active'
  },
  {
    intent_name: 'query_display_screen',
    description: '查询显示屏相关信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'material_name',
        type: 'string',
        description: '显示屏类型',
        extract_pattern: '(LCD显示屏|OLED显示屏|显示屏)'
      }
    ]),
    trigger_words: JSON.stringify(['LCD显示屏', 'OLED显示屏', '显示屏', '屏幕']),
    synonyms: JSON.stringify({
      'LCD显示屏': ['LCD屏', 'LCD屏幕'],
      'OLED显示屏': ['OLED屏', 'OLED屏幕'],
      '显示屏': ['屏幕', '屏']
    }),
    example_query: '查询OLED显示屏的库存',
    priority: 5,
    status: 'active'
  },
  {
    intent_name: 'query_camera_module',
    description: '查询摄像头模组相关信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'material_name',
        type: 'string',
        description: '摄像头模组',
        extract_pattern: '(摄像头|摄像头模组|CAM)'
      }
    ]),
    trigger_words: JSON.stringify(['摄像头', '摄像头模组', 'CAM', '相机']),
    synonyms: JSON.stringify({
      '摄像头': ['相机', '摄像头模组', 'CAM'],
      '模组': ['模块', '组件']
    }),
    example_query: '查询摄像头模组的测试情况',
    priority: 5,
    status: 'active'
  },

  // 供应商查询规则 - 基于真实供应商
  {
    intent_name: 'query_supplier_julong',
    description: '查询聚龙供应商相关信息',
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
    example_query: '查询聚龙供应商的物料',
    priority: 5,
    status: 'active'
  },
  {
    intent_name: 'query_supplier_boe',
    description: '查询BOE供应商相关信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'supplier_name',
        type: 'string',
        description: '供应商名称',
        extract_pattern: '(BOE|京东方)'
      }
    ]),
    trigger_words: JSON.stringify(['BOE', '京东方', 'BOE供应商']),
    synonyms: JSON.stringify({
      'BOE': ['京东方', 'BOE科技'],
      '京东方': ['BOE', 'BOE科技']
    }),
    example_query: '查询BOE供应商的显示屏',
    priority: 5,
    status: 'active'
  },
  {
    intent_name: 'query_supplier_goer',
    description: '查询歌尔供应商相关信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'supplier_name',
        type: 'string',
        description: '供应商名称',
        extract_pattern: '(歌尔)'
      }
    ]),
    trigger_words: JSON.stringify(['歌尔', '歌尔声学', '歌尔供应商']),
    synonyms: JSON.stringify({
      '歌尔': ['歌尔声学', '歌尔股份']
    }),
    example_query: '查询歌尔供应商的扬声器',
    priority: 5,
    status: 'active'
  },

  // 工厂查询规则 - 基于真实工厂
  {
    intent_name: 'query_factory_shenzhen',
    description: '查询深圳工厂相关信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'online_tracking',
    parameters: JSON.stringify([
      {
        name: 'factory',
        type: 'string',
        description: '工厂名称',
        extract_pattern: '(深圳工厂|深圳)'
      }
    ]),
    trigger_words: JSON.stringify(['深圳工厂', '深圳', '深圳厂区']),
    synonyms: JSON.stringify({
      '深圳工厂': ['深圳厂区', '深圳生产基地'],
      '深圳': ['深圳工厂', '深圳厂区']
    }),
    example_query: '查询深圳工厂的生产情况',
    priority: 5,
    status: 'active'
  },
  {
    intent_name: 'query_factory_chongqing',
    description: '查询重庆工厂相关信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'online_tracking',
    parameters: JSON.stringify([
      {
        name: 'factory',
        type: 'string',
        description: '工厂名称',
        extract_pattern: '(重庆工厂|重庆)'
      }
    ]),
    trigger_words: JSON.stringify(['重庆工厂', '重庆', '重庆厂区']),
    synonyms: JSON.stringify({
      '重庆工厂': ['重庆厂区', '重庆生产基地'],
      '重庆': ['重庆工厂', '重庆厂区']
    }),
    example_query: '查询重庆工厂的生产情况',
    priority: 5,
    status: 'active'
  },

  // 项目查询规则 - 基于真实项目
  {
    intent_name: 'query_project_smartphone',
    description: '查询智能手机项目相关信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'online_tracking',
    parameters: JSON.stringify([
      {
        name: 'project',
        type: 'string',
        description: '项目类型',
        extract_pattern: '(智能手机|手机|PJ001|PJ003|PJ005|PJ007|PJ008|PJ009)'
      }
    ]),
    trigger_words: JSON.stringify(['智能手机', '手机项目', 'PJ001', 'PJ003', 'PJ005']),
    synonyms: JSON.stringify({
      '智能手机': ['手机', '手机项目'],
      '项目': ['工程', '产品']
    }),
    example_query: '查询智能手机项目的质量情况',
    priority: 5,
    status: 'active'
  },

  // 缺陷查询规则 - 基于真实缺陷类型
  {
    intent_name: 'query_defect_scratch',
    description: '查询划伤缺陷相关信息',
    action_type: 'MEMORY_QUERY',
    action_target: 'lab_tests',
    parameters: JSON.stringify([
      {
        name: 'defect_desc',
        type: 'string',
        description: '缺陷描述',
        extract_pattern: '(划伤|刮花|刮痕)'
      }
    ]),
    trigger_words: JSON.stringify(['划伤', '刮花', '刮痕', '表面划伤']),
    synonyms: JSON.stringify({
      '划伤': ['刮花', '刮痕', '表面划伤'],
      '缺陷': ['不良', '问题', '异常']
    }),
    example_query: '查询划伤缺陷的测试记录',
    priority: 5,
    status: 'active'
  }
];

async function updateRealBusinessRules() {
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
updateRealBusinessRules();
