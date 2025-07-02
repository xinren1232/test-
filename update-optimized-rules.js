/**
 * 更新优化的智能问答规则
 * 基于实际数据结构和字段重新设计规则
 */

const mysql = require('mysql2/promise');

// 基于实际数据的优化规则
const OPTIMIZED_RULES = [
  // 库存查询规则 - 基于实际inventory表字段
  {
    intent_name: 'query_inventory_by_factory',
    description: '按工厂查询库存',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'storage_location',
        type: 'string',
        description: '工厂/存储位置',
        extract_pattern: '(深圳工厂|宜宾工厂|上海工厂)'
      }
    ]),
    trigger_words: JSON.stringify(['工厂', '库存', '深圳', '宜宾', '上海', '存储']),
    synonyms: JSON.stringify({
      '工厂': ['厂区', '生产基地', '制造厂'],
      '库存': ['存货', '物料', '材料'],
      '深圳': ['深圳工厂', '深圳厂区']
    }),
    example_query: '查询深圳工厂的库存',
    priority: 5,
    status: 'active'
  },
  {
    intent_name: 'query_inventory_by_supplier',
    description: '按供应商查询库存',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'supplier_name',
        type: 'string',
        description: '供应商名称',
        extract_pattern: '(泰科电子|三星电子|BOE|聚龙|歌尔)'
      }
    ]),
    trigger_words: JSON.stringify(['供应商', '泰科电子', '三星电子', 'BOE', '聚龙', '歌尔']),
    synonyms: JSON.stringify({
      '供应商': ['厂商', '制造商', '提供商'],
      '泰科电子': ['泰科', 'TE'],
      '三星电子': ['三星', 'Samsung']
    }),
    example_query: '查询泰科电子供应商的物料',
    priority: 5,
    status: 'active'
  },
  {
    intent_name: 'query_inventory_by_material',
    description: '按物料类型查询库存',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'material_name',
        type: 'string',
        description: '物料名称',
        extract_pattern: '(电阻器|电容器|电子元件)'
      },
      {
        name: 'material_type',
        type: 'string',
        description: '物料类型',
        extract_pattern: '(电子元件|机械零件|原材料)'
      }
    ]),
    trigger_words: JSON.stringify(['电阻器', '电容器', '电子元件', '物料', '材料']),
    synonyms: JSON.stringify({
      '电阻器': ['电阻', '阻值器件'],
      '电容器': ['电容', '容值器件'],
      '电子元件': ['电子器件', '电子零件']
    }),
    example_query: '查询电阻器的库存情况',
    priority: 5,
    status: 'active'
  },
  {
    intent_name: 'query_inventory_by_status',
    description: '按状态查询库存',
    action_type: 'MEMORY_QUERY',
    action_target: 'inventory',
    parameters: JSON.stringify([
      {
        name: 'status',
        type: 'string',
        description: '库存状态',
        extract_pattern: '(正常|异常|冻结|风险)'
      },
      {
        name: 'risk_level',
        type: 'string',
        description: '风险等级',
        extract_pattern: '(low|medium|high)'
      }
    ]),
    trigger_words: JSON.stringify(['状态', '正常', '异常', '冻结', '风险', '风险等级']),
    synonyms: JSON.stringify({
      '异常': ['问题', '故障', '不正常'],
      '风险': ['危险', '隐患', '问题'],
      '正常': ['良好', '健康', '正常状态']
    }),
    example_query: '查询风险等级为medium的库存',
    priority: 5,
    status: 'active'
  },

  // 测试记录查询规则 - 基于实际lab_tests表字段
  {
    intent_name: 'query_lab_test_by_result',
    description: '按测试结果查询测试记录',
    action_type: 'MEMORY_QUERY',
    action_target: 'lab_tests',
    parameters: JSON.stringify([
      {
        name: 'test_result',
        type: 'string',
        description: '测试结果',
        extract_pattern: '(合格|不合格|PASS|FAIL)'
      },
      {
        name: 'conclusion',
        type: 'string',
        description: '测试结论',
        extract_pattern: '(合格|不合格)'
      }
    ]),
    trigger_words: JSON.stringify(['测试', '合格', '不合格', 'PASS', 'FAIL', '测试结果']),
    synonyms: JSON.stringify({
      '合格': ['通过', 'PASS', '成功'],
      '不合格': ['失败', 'FAIL', '未通过'],
      '测试': ['检测', '检验', '试验']
    }),
    example_query: '查询测试结果为合格的记录',
    priority: 5,
    status: 'active'
  },
  {
    intent_name: 'query_lab_test_by_item',
    description: '按测试项目查询测试记录',
    action_type: 'MEMORY_QUERY',
    action_target: 'lab_tests',
    parameters: JSON.stringify([
      {
        name: 'test_item',
        type: 'string',
        description: '测试项目',
        extract_pattern: '(电气参数|机械性能|外观检查)'
      }
    ]),
    trigger_words: JSON.stringify(['电气参数', '机械性能', '外观检查', '测试项目']),
    synonyms: JSON.stringify({
      '电气参数': ['电气性能', '电性能'],
      '机械性能': ['机械参数', '物理性能'],
      '外观检查': ['外观测试', '外观验证']
    }),
    example_query: '查询电气参数测试记录',
    priority: 5,
    status: 'active'
  },

  // 生产记录查询规则 - 基于实际online_tracking表字段
  {
    intent_name: 'query_production_by_factory',
    description: '按工厂查询生产记录',
    action_type: 'MEMORY_QUERY',
    action_target: 'online_tracking',
    parameters: JSON.stringify([
      {
        name: 'factory',
        type: 'string',
        description: '工厂名称',
        extract_pattern: '(深圳工厂|宜宾工厂|上海工厂)'
      }
    ]),
    trigger_words: JSON.stringify(['生产', '工厂', '深圳', '宜宾', '上海', '生产记录']),
    synonyms: JSON.stringify({
      '生产': ['制造', '加工', '产线'],
      '工厂': ['厂区', '生产基地'],
      '记录': ['数据', '信息', '档案']
    }),
    example_query: '查询深圳工厂的生产记录',
    priority: 5,
    status: 'active'
  },
  {
    intent_name: 'query_production_by_defect_rate',
    description: '按不良率查询生产记录',
    action_type: 'MEMORY_QUERY',
    action_target: 'online_tracking',
    parameters: JSON.stringify([
      {
        name: 'defect_rate_threshold',
        type: 'number',
        description: '不良率阈值',
        extract_pattern: '([0-9.]+)%?'
      }
    ]),
    trigger_words: JSON.stringify(['不良率', '缺陷率', '异常率', '高不良率']),
    synonyms: JSON.stringify({
      '不良率': ['缺陷率', '异常率', '故障率'],
      '高': ['超过', '大于', '高于']
    }),
    example_query: '查询不良率高于0.01的生产记录',
    priority: 5,
    status: 'active'
  }
];

async function updateOptimizedRules() {
  console.log('🔄 开始更新优化的智能问答规则...\n');

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

    // 插入优化规则
    let insertedCount = 0;
    for (const rule of OPTIMIZED_RULES) {
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

    console.log(`\n📊 规则更新完成:`);
    console.log(`   成功插入: ${insertedCount} 条规则`);
    console.log(`   数据库中活跃规则总数: ${totalCount} 条`);

    await connection.end();
    console.log('\n🎉 优化规则更新完成！');

  } catch (error) {
    console.error('❌ 更新规则失败:', error);
    process.exit(1);
  }
}

// 运行更新
updateOptimizedRules();
