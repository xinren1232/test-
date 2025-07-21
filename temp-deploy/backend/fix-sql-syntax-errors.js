/**
 * 修复SQL语法错误
 * 主要处理残留的参数占位符和语法问题
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixSQLSyntaxErrors() {
  console.log('🔧 修复SQL语法错误...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 查找包含参数占位符的规则
    console.log('1. 查找包含参数占位符的规则:');
    const [rulesWithParams] = await connection.query(`
      SELECT id, intent_name, action_target
      FROM nlp_intent_rules 
      WHERE action_target LIKE '%?%'
      AND status = 'active'
      ORDER BY id
    `);
    
    console.log(`   找到 ${rulesWithParams.length} 条包含参数占位符的规则\n`);
    
    // 2. 逐一修复这些规则
    for (const rule of rulesWithParams) {
      console.log(`📋 修复规则: ${rule.intent_name}`);
      
      let fixedSQL = rule.action_target;
      
      // 移除孤立的参数占位符
      fixedSQL = fixedSQL.replace(/\s+\?\s*$/gm, ''); // 移除行末的 ?
      fixedSQL = fixedSQL.replace(/\s+\?\s*\n/gm, '\n'); // 移除行中的 ?
      fixedSQL = fixedSQL.replace(/WHERE\s+\?\s*/gi, 'WHERE 1=1 '); // 替换 WHERE ?
      fixedSQL = fixedSQL.replace(/AND\s+\?\s*/gi, ''); // 移除 AND ?
      fixedSQL = fixedSQL.replace(/OR\s+\?\s*/gi, ''); // 移除 OR ?
      
      // 修复LIKE CONCAT模式
      fixedSQL = fixedSQL.replace(/LIKE\s+CONCAT\s*\(\s*['"]%['"],\s*\?\s*,\s*['"]%['"]\s*\)/gi, "LIKE '%'");
      
      // 修复其他常见的参数占位符问题
      fixedSQL = fixedSQL.replace(/=\s*\?/gi, "IS NOT NULL");
      fixedSQL = fixedSQL.replace(/!=\s*\?/gi, "IS NOT NULL");
      
      console.log(`   原SQL: ${rule.action_target.substring(0, 100)}...`);
      console.log(`   修复后: ${fixedSQL.substring(0, 100)}...`);
      
      // 测试修复后的SQL
      try {
        await connection.query(fixedSQL);
        console.log(`   ✅ SQL语法正确`);
        
        // 更新数据库
        await connection.query(`
          UPDATE nlp_intent_rules 
          SET action_target = ?
          WHERE id = ?
        `, [fixedSQL, rule.id]);
        
        console.log(`   ✅ 已更新到数据库`);
        
      } catch (error) {
        console.log(`   ❌ SQL仍有问题: ${error.message}`);
        
        // 如果还有问题，使用更简单的查询
        const simpleSQL = generateSimpleSQL(rule.intent_name);
        if (simpleSQL) {
          try {
            await connection.query(simpleSQL);
            await connection.query(`
              UPDATE nlp_intent_rules 
              SET action_target = ?
              WHERE id = ?
            `, [simpleSQL, rule.id]);
            console.log(`   ✅ 使用简化SQL修复成功`);
          } catch (simpleError) {
            console.log(`   ❌ 简化SQL也失败: ${simpleError.message}`);
          }
        }
      }
      
      console.log('');
    }
    
    // 3. 验证修复结果
    console.log('3. 验证修复结果:');
    const [allRules] = await connection.query(`
      SELECT id, intent_name, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY priority DESC
      LIMIT 10
    `);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const rule of allRules) {
      try {
        await connection.query(rule.action_target);
        successCount++;
        console.log(`   ✅ ${rule.intent_name}: SQL正常`);
      } catch (error) {
        failureCount++;
        console.log(`   ❌ ${rule.intent_name}: ${error.message.substring(0, 50)}...`);
      }
    }
    
    console.log(`\n📊 验证结果: ${successCount} 成功, ${failureCount} 失败`);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

// 生成简单的SQL查询
function generateSimpleSQL(intentName) {
  if (intentName.includes('库存')) {
    return `SELECT 
      storage_location as 工厂,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, "%Y-%m-%d") as 入库时间
    FROM inventory 
    ORDER BY inbound_time DESC 
    LIMIT 20`;
  }
  
  if (intentName.includes('在线') || intentName.includes('跟踪')) {
    return `SELECT 
      id as 跟踪编号,
      DATE_FORMAT(online_date, "%Y-%m-%d") as 日期,
      material_name as 物料名称,
      supplier_name as 供应商,
      exception_count as 异常数量,
      notes as 备注
    FROM online_tracking 
    ORDER BY online_date DESC 
    LIMIT 20`;
  }
  
  if (intentName.includes('测试')) {
    return `SELECT 
      test_id as 测试编号,
      DATE_FORMAT(test_date, "%Y-%m-%d") as 日期,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      defect_desc as 不良描述
    FROM lab_tests 
    ORDER BY test_date DESC 
    LIMIT 20`;
  }
  
  if (intentName.includes('批次')) {
    return `SELECT 
      batch_code as 批次号,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态
    FROM inventory 
    ORDER BY created_at DESC 
    LIMIT 20`;
  }
  
  return null;
}

// 执行修复
fixSQLSyntaxErrors();
