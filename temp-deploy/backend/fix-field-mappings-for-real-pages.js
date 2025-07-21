import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

/**
 * 根据实际页面截图修复字段映射
 * 
 * 实际页面字段需求：
 * 库存页面: 工厂、仓库、物料编码、物料名称、供应商、数量、状态、入库时间、到期时间、备注
 * 上线页面: 工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注
 * 测试页面: 测试编号、日期、项目、基线、物料编码、数量、物料名称、供应商、测试结果、不合格描述、备注
 * 批次管理: 批次号、物料编码、物料名称、供应商、数量、入库日期、产线异常、测试异常、备注
 */

// 正确的字段映射SQL模板
const CORRECT_FIELD_MAPPINGS = {
  // 库存页面字段映射
  inventory: {
    sql: `
SELECT
  COALESCE(storage_location, '未知工厂') as 工厂,
  COALESCE(storage_location, '未知仓库') as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
ORDER BY inbound_time DESC
LIMIT 20`,
    description: '库存页面查询'
  },

  // 上线页面字段映射
  online: {
    sql: `
SELECT
  factory as 工厂,
  baseline as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 本周异常,
  DATE_FORMAT(inspection_date, '%Y-%m-%d %H:%i') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
ORDER BY inspection_date DESC
LIMIT 20`,
    description: '上线页面查询'
  },

  // 测试页面字段映射
  testing: {
    sql: `
SELECT
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
FROM lab_tests
ORDER BY test_date DESC
LIMIT 20`,
    description: '测试页面查询'
  },

  // 批次管理页面字段映射
  batch: {
    sql: `
SELECT
  i.batch_code as 批次号,
  i.material_code as 物料编码,
  i.material_name as 物料名称,
  i.supplier_name as 供应商,
  i.quantity as 数量,
  DATE_FORMAT(i.inbound_time, '%Y-%m-%d') as 入库日期,
  COALESCE(ot.exception_count, 0) as 产线异常,
  CASE
    WHEN lt.test_result = 'NG' OR lt.test_result = '不合格' THEN '有异常'
    ELSE '正常'
  END as 测试异常,
  COALESCE(i.notes, '') as 备注
FROM inventory i
LEFT JOIN online_tracking ot ON i.batch_code = ot.batch_code
LEFT JOIN lab_tests lt ON i.material_code = lt.material_code
GROUP BY i.batch_code, i.material_code, i.material_name, i.supplier_name, i.quantity, i.inbound_time, i.notes, ot.exception_count, lt.test_result
ORDER BY i.inbound_time DESC
LIMIT 20`,
    description: '批次管理页面查询'
  }
};

async function fixFieldMappings() {
  let connection;
  
  try {
    console.log('🔧 开始修复字段映射...\n');
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 测试每个场景的SQL查询
    for (const [scenario, config] of Object.entries(CORRECT_FIELD_MAPPINGS)) {
      console.log(`📊 测试 ${config.description}...`);
      
      try {
        const [results] = await connection.execute(config.sql);
        console.log(`✅ ${scenario}: 返回 ${results.length} 条记录`);
        
        if (results.length > 0) {
          console.log('   字段列表:');
          Object.keys(results[0]).forEach(field => {
            console.log(`     - ${field}: ${results[0][field]}`);
          });
        }
        console.log('');
      } catch (error) {
        console.error(`❌ ${scenario} 查询失败:`, error.message);
        console.log('');
      }
    }
    
    // 2. 更新规则库中的字段映射
    console.log('🔄 更新规则库中的字段映射...');
    
    // 获取所有需要更新的规则
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_target as sql_query, category
      FROM nlp_intent_rules
      WHERE category IN ('库存场景', '上线场景', '测试场景', '批次管理')
      AND action_type = 'SQL_QUERY'
      ORDER BY category, id
    `);
    
    console.log(`找到 ${rules.length} 条需要更新的规则`);
    
    // 更新每个规则的字段映射
    for (const rule of rules) {
      let scenarioKey = '';

      // 根据category确定场景
      if (rule.category === '库存场景') scenarioKey = 'inventory';
      else if (rule.category === '上线场景') scenarioKey = 'online';
      else if (rule.category === '测试场景') scenarioKey = 'testing';
      else if (rule.category === '批次管理') scenarioKey = 'batch';

      const mapping = CORRECT_FIELD_MAPPINGS[scenarioKey];
      if (mapping) {
        // 提取基础查询逻辑，保留WHERE条件
        let updatedSQL = rule.sql_query;

        // 根据场景更新SELECT部分
        if (scenarioKey === 'inventory') {
          updatedSQL = updatedSQL.replace(
            /SELECT[\s\S]*?FROM inventory/i,
            mapping.sql.match(/SELECT[\s\S]*?FROM inventory/i)[0]
          );
        } else if (scenarioKey === 'online') {
          updatedSQL = updatedSQL.replace(
            /SELECT[\s\S]*?FROM online_tracking/i,
            mapping.sql.match(/SELECT[\s\S]*?FROM online_tracking/i)[0]
          );
        } else if (scenarioKey === 'testing') {
          updatedSQL = updatedSQL.replace(
            /SELECT[\s\S]*?FROM lab_tests/i,
            mapping.sql.match(/SELECT[\s\S]*?FROM lab_tests/i)[0]
          );
        } else if (scenarioKey === 'batch') {
          // 批次管理比较复杂，需要特殊处理
          if (updatedSQL.includes('FROM inventory') && !updatedSQL.includes('LEFT JOIN')) {
            updatedSQL = updatedSQL.replace(
              /SELECT[\s\S]*?FROM inventory/i,
              mapping.sql.match(/SELECT[\s\S]*?FROM inventory[\s\S]*?GROUP BY/i)[0].replace('GROUP BY', '')
            );
          }
        }

        // 更新数据库中的规则
        await connection.execute(`
          UPDATE nlp_intent_rules
          SET action_target = ?, updated_at = NOW()
          WHERE id = ?
        `, [updatedSQL, rule.id]);

        console.log(`✅ 更新规则 ${rule.id}: ${rule.intent_name}`);
      }
    }
    
    console.log('\n🎉 字段映射修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行修复
fixFieldMappings().catch(console.error);
