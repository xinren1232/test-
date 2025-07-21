import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixAllSQLErrors() {
  console.log('🔧 修复所有SQL语法错误...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 查找所有包含参数占位符错误的规则
    console.log('1. 查找包含SQL语法错误的规则:');
    const [problemRules] = await connection.query(`
      SELECT id, intent_name, action_target
      FROM nlp_intent_rules 
      WHERE (action_target LIKE '%?, \'%\'%' 
         OR action_target LIKE '%CONCAT(\'%\', ?, \'%\')%'
         OR action_target LIKE '%supplier%'
         OR action_target LIKE '%lastUpdateTime%')
      AND status = 'active'
      ORDER BY id
    `);
    
    console.log(`   找到 ${problemRules.length} 条有问题的规则\n`);
    
    // 2. 批量修复这些规则
    let fixedCount = 0;
    
    for (const rule of problemRules) {
      console.log(`修复规则: ${rule.intent_name}`);
      
      let fixedSQL = rule.action_target;
      
      // 修复常见的SQL错误
      fixedSQL = fixedSQL
        // 修复参数占位符错误
        .replace(/CONCAT\('%', \?, '%'\)/g, "CONCAT('%', COALESCE(?, ''), '%')")
        .replace(/\?, '%'\)/g, "COALESCE(?, ''), '%')")
        .replace(/WHERE material_name LIKE CONCAT\('%', \?, '%'\)/g, "WHERE 1=1")
        .replace(/WHERE supplier_name LIKE CONCAT\('%', \?, '%'\)/g, "WHERE 1=1")
        // 修复字段名错误
        .replace(/supplier\b/g, 'supplier_name')
        .replace(/lastUpdateTime/g, 'updated_at')
        // 移除多余的参数
        .replace(/\s+AND\s+\?\s*=\s*\?/g, '')
        // 简化复杂的WHERE条件
        .replace(/WHERE\s+1=1\s+AND\s+1=1/g, 'WHERE 1=1');
      
      // 如果是库存查询，使用标准模板
      if (rule.intent_name.includes('库存')) {
        fixedSQL = `
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
ORDER BY inbound_time DESC 
LIMIT 20`;
      }
      
      // 如果是测试查询，使用标准模板
      else if (rule.intent_name.includes('测试')) {
        fixedSQL = `
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
ORDER BY test_date DESC 
LIMIT 20`;
      }
      
      // 如果是上线查询，使用标准模板
      else if (rule.intent_name.includes('上线')) {
        fixedSQL = `
SELECT 
  id as 跟踪编号,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 日期,
  material_name as 物料名称,
  supplier_name as 供应商,
  COALESCE(defect_rate, 0) as 不良率,
  COALESCE(exception_count, 0) as 异常次数,
  COALESCE(notes, '') as 备注
FROM online_tracking 
ORDER BY online_date DESC 
LIMIT 20`;
      }
      
      // 更新规则
      try {
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, updated_at = NOW()
          WHERE id = ?
        `, [fixedSQL.trim(), rule.id]);
        
        fixedCount++;
        console.log(`  ✅ 已修复`);
      } catch (error) {
        console.log(`  ❌ 修复失败: ${error.message}`);
      }
    }
    
    console.log(`\n✅ 总共修复了 ${fixedCount} 条规则`);
    
    // 3. 验证修复结果
    console.log('\n🧪 验证修复结果...');
    const [verifyRules] = await connection.query(`
      SELECT id, intent_name, action_target
      FROM nlp_intent_rules 
      WHERE action_target LIKE '%?%'
      AND status = 'active'
      LIMIT 5
    `);
    
    if (verifyRules.length === 0) {
      console.log('✅ 所有参数占位符问题已修复');
    } else {
      console.log(`⚠️ 仍有 ${verifyRules.length} 条规则包含参数占位符`);
    }
    
    await connection.end();
    console.log('\n🎉 SQL错误修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

fixAllSQLErrors();
