const mysql = require('./backend/node_modules/mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 基于真实数据的修正规则
const CORRECTED_RULES = [
  {
    intent_name: '库存全信息查询',
    description: '查询库存的完整信息，基于真实数据字段',
    trigger_words: JSON.stringify(['库存全信息', '库存详情', '库存完整信息', '详细库存']),
    action_target: `SELECT 
      SUBSTRING_INDEX(storage_location, '-', 1) as 工厂,
      SUBSTRING_INDEX(storage_location, '-', -1) as 仓库,
      material_code as 物料编号,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      batch_code as 批次号,
      DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 入库时间,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as 创建时间,
      COALESCE(notes, '') as 备注
    FROM inventory 
    ORDER BY inbound_time DESC 
    LIMIT 50`,
    action_type: 'SQL_QUERY',
    priority: 9
  },

  {
    intent_name: '检验全信息查询',
    description: '查询检验的完整信息，基于真实数据字段',
    trigger_words: JSON.stringify(['检验全信息', '检验详情', '测试详情', '检验完整信息']),
    action_target: `SELECT 
      test_id as 测试编号,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
      material_code as 物料编号,
      material_name as 物料名称,
      supplier_name as 供应商,
      batch_code as 批次号,
      test_item as 测试项目,
      test_result as 测试结果,
      conclusion as 结论,
      COALESCE(defect_desc, '') as 缺陷描述,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as 创建时间
    FROM lab_tests 
    ORDER BY test_date DESC 
    LIMIT 50`,
    action_type: 'SQL_QUERY',
    priority: 9
  },

  {
    intent_name: '生产全信息查询',
    description: '查询生产的完整信息，基于真实数据字段',
    trigger_words: JSON.stringify(['生产全信息', '上线详情', '生产详情', '生产完整信息']),
    action_target: `SELECT 
      factory as 工厂,
      workshop as 车间,
      \`line\` as 产线,
      project as 项目,
      material_code as 物料编号,
      material_name as 物料名称,
      supplier_name as 供应商,
      batch_code as 批次号,
      CONCAT(ROUND(defect_rate * 100, 2), '%') as 缺陷率,
      exception_count as 异常次数,
      DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
      DATE_FORMAT(use_time, '%Y-%m-%d %H:%i') as 使用时间,
      DATE_FORMAT(inspection_date, '%Y-%m-%d %H:%i') as 检验时间
    FROM online_tracking 
    ORDER BY online_date DESC 
    LIMIT 50`,
    action_type: 'SQL_QUERY',
    priority: 9
  },

  {
    intent_name: '测试项目查询',
    description: '按测试项目查询检验数据，基于真实字段',
    trigger_words: JSON.stringify(['测试项目', '性能测试', '外观检验', '功能测试', '可靠性测试', '环境测试']),
    action_target: `SELECT 
      test_item as 测试项目,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      conclusion as 结论,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 测试日期,
      COALESCE(defect_desc, '') as 缺陷描述
    FROM lab_tests 
    WHERE test_item IS NOT NULL
    ORDER BY test_date DESC`,
    action_type: 'SQL_QUERY',
    priority: 8
  },

  {
    intent_name: '车间产线查询',
    description: '按车间和产线查询生产数据，基于真实字段',
    trigger_words: JSON.stringify(['车间产线', '车间生产', '产线数据']),
    action_target: `SELECT 
      factory as 工厂,
      workshop as 车间,
      \`line\` as 产线,
      material_name as 物料名称,
      supplier_name as 供应商,
      CONCAT(ROUND(defect_rate * 100, 2), '%') as 缺陷率,
      exception_count as 异常次数,
      DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
      DATE_FORMAT(use_time, '%Y-%m-%d %H:%i') as 使用时间
    FROM online_tracking 
    WHERE workshop IS NOT NULL OR \`line\` IS NOT NULL
    ORDER BY online_date DESC`,
    action_type: 'SQL_QUERY',
    priority: 8
  }
];

async function fixRulesBasedOnRealData() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    console.log('🔧 开始修正规则，移除不存在的字段...');
    
    // 删除有问题的规则
    const problematicRules = [
      '库存全信息查询',
      '检验全信息查询', 
      '生产全信息查询',
      '风险等级查询',
      '测试项目查询',
      '车间产线查询'
    ];
    
    for (const ruleName of problematicRules) {
      await connection.execute(`
        DELETE FROM assistant_rules 
        WHERE intent_name = ?
      `, [ruleName]);
      console.log(`🗑️  删除有问题的规则: ${ruleName}`);
    }
    
    // 添加修正后的规则
    for (const rule of CORRECTED_RULES) {
      try {
        await connection.execute(`
          INSERT INTO assistant_rules (
            intent_name, description, trigger_words, action_target, 
            action_type, status, priority, example_query, created_at
          ) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, NOW())
        `, [
          rule.intent_name,
          rule.description,
          rule.trigger_words,
          rule.action_target,
          rule.action_type,
          rule.priority,
          `查询${rule.intent_name.replace('查询', '')}`
        ]);
        
        console.log(`✅ 添加修正规则: ${rule.intent_name}`);
      } catch (error) {
        console.error(`❌ 添加规则失败: ${rule.intent_name}`, error.message);
      }
    }
    
    console.log('\n🎯 规则修正完成！');
    
    // 显示当前所有规则
    const [rules] = await connection.execute(`
      SELECT intent_name, priority, status 
      FROM assistant_rules 
      ORDER BY priority DESC, intent_name
    `);
    
    console.log('\n📋 修正后的规则列表:');
    rules.forEach(rule => {
      console.log(`  ${rule.intent_name} (优先级: ${rule.priority})`);
    });
    
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixRulesBasedOnRealData();
