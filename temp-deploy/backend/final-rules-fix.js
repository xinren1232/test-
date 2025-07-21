import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

/**
 * 最终修复所有规则的字段映射
 */

async function finalRulesFix() {
  let connection;
  
  try {
    console.log('🔧 开始最终规则修复...\n');
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 修复所有上线场景规则
    console.log('🏭 修复上线场景规则...');
    const correctOnlineSQL = `SELECT
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
FROM online_tracking`;

    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = REPLACE(action_target, 
        SUBSTRING(action_target, 1, LOCATE('FROM online_tracking', action_target) + 19),
        ?
      )
      WHERE category = '上线场景' 
      AND action_type = 'SQL_QUERY'
      AND action_target LIKE '%FROM online_tracking%'
    `, [correctOnlineSQL]);
    
    console.log('✅ 上线场景规则已修复');
    
    // 2. 修复所有批次管理规则
    console.log('📦 修复批次管理规则...');
    const correctBatchSQL = `SELECT
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
GROUP BY i.batch_code, i.material_code, i.material_name, i.supplier_name, i.quantity, i.inbound_time, i.notes, ot.exception_count, lt.test_result`;

    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = CONCAT(
        ?,
        SUBSTRING(action_target, LOCATE('WHERE', action_target))
      )
      WHERE category = '批次管理' 
      AND action_type = 'SQL_QUERY'
      AND action_target LIKE '%FROM%'
    `, [correctBatchSQL]);
    
    console.log('✅ 批次管理规则已修复');
    
    // 3. 检查并修复特定的问题规则
    console.log('🔍 检查特定问题规则...');
    
    // 查找仍然有问题的规则
    const [problematicRules] = await connection.execute(`
      SELECT id, intent_name, category, action_target
      FROM nlp_intent_rules 
      WHERE category IN ('上线场景', '批次管理')
      AND action_type = 'SQL_QUERY'
      AND status = 'active'
      AND (action_target LIKE '%test_id%' OR action_target LIKE '%test_date%')
    `);
    
    console.log(`找到 ${problematicRules.length} 条需要特殊处理的规则`);
    
    for (const rule of problematicRules) {
      console.log(`修复规则 ${rule.id}: ${rule.intent_name}`);
      
      let fixedSQL = rule.action_target;
      
      if (rule.category === '上线场景') {
        // 替换为正确的上线字段映射
        fixedSQL = correctOnlineSQL;
        
        // 保留WHERE条件
        const whereMatch = rule.action_target.match(/(WHERE[\s\S]*?)(?:ORDER BY|GROUP BY|LIMIT|$)/i);
        if (whereMatch) {
          fixedSQL += '\n' + whereMatch[1].trim();
        }
        
        // 添加默认排序和限制
        fixedSQL += '\nORDER BY inspection_date DESC\nLIMIT 20';
        
      } else if (rule.category === '批次管理') {
        // 替换为正确的批次管理字段映射
        fixedSQL = correctBatchSQL;
        
        // 保留WHERE条件，但需要调整表别名
        const whereMatch = rule.action_target.match(/(WHERE[\s\S]*?)(?:ORDER BY|GROUP BY|LIMIT|$)/i);
        if (whereMatch) {
          let whereClause = whereMatch[1].trim();
          // 调整字段引用
          whereClause = whereClause.replace(/\bbatch_code\b/g, 'i.batch_code');
          whereClause = whereClause.replace(/\bmaterial_code\b/g, 'i.material_code');
          whereClause = whereClause.replace(/\bmaterial_name\b/g, 'i.material_name');
          fixedSQL += '\n' + whereClause;
        }
        
        // 添加默认排序和限制
        fixedSQL += '\nORDER BY i.inbound_time DESC\nLIMIT 20';
      }
      
      // 更新规则
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, updated_at = NOW()
        WHERE id = ?
      `, [fixedSQL, rule.id]);
      
      console.log(`✅ 规则 ${rule.id} 已修复`);
    }
    
    // 4. 验证修复结果
    console.log('\n🧪 验证修复结果...');
    
    const testQueries = [
      {
        category: '库存场景',
        sql: `SELECT
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
LIMIT 5`
      },
      {
        category: '上线场景',
        sql: correctOnlineSQL + '\nORDER BY inspection_date DESC\nLIMIT 5'
      },
      {
        category: '测试场景',
        sql: `SELECT
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
LIMIT 5`
      },
      {
        category: '批次管理',
        sql: correctBatchSQL + '\nORDER BY i.inbound_time DESC\nLIMIT 5'
      }
    ];
    
    for (const test of testQueries) {
      try {
        const [results] = await connection.execute(test.sql);
        console.log(`✅ ${test.category}: 返回 ${results.length} 条记录`);
        if (results.length > 0) {
          console.log(`   字段: ${Object.keys(results[0]).join(', ')}`);
        }
      } catch (error) {
        console.log(`❌ ${test.category}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 最终规则修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

finalRulesFix().catch(console.error);
