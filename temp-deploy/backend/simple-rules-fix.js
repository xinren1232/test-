import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

/**
 * 简化的规则修复脚本
 * 基于实际测试结果进行精确修复
 */

async function simpleRulesFix() {
  try {
    console.log('🔧 开始简化规则修复...\n');
    
    // 获取所有规则
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY intent_name
    `);
    
    console.log(`找到 ${allRules.length} 个规则\n`);
    
    let successCount = 0;
    let fixedCount = 0;
    let failedCount = 0;
    
    for (let i = 0; i < allRules.length; i++) {
      const rule = allRules[i];
      console.log(`[${i + 1}/${allRules.length}] ${rule.intent_name}`);
      
      try {
        // 先测试原始SQL
        const [results] = await connection.execute(rule.action_target);
        console.log(`  ✅ 正常 - ${results.length}条记录`);
        successCount++;
        
      } catch (error) {
        // 尝试修复
        const fixedSQL = fixSQL(rule.action_target);
        
        if (fixedSQL !== rule.action_target) {
          try {
            const [testResults] = await connection.execute(fixedSQL);
            
            // 更新数据库
            await connection.execute(`
              UPDATE nlp_intent_rules 
              SET action_target = ?
              WHERE id = ?
            `, [fixedSQL, rule.id]);
            
            console.log(`  🔧 修复成功 - ${testResults.length}条记录`);
            fixedCount++;
            
          } catch (fixError) {
            console.log(`  ❌ 修复失败: ${fixError.message.substring(0, 50)}...`);
            failedCount++;
          }
        } else {
          console.log(`  ❌ 无法修复: ${error.message.substring(0, 50)}...`);
          failedCount++;
        }
      }
    }
    
    console.log('\n📊 修复结果:');
    console.log(`✅ 正常: ${successCount}`);
    console.log(`🔧 修复: ${fixedCount}`);
    console.log(`❌ 失败: ${failedCount}`);
    console.log(`📈 成功率: ${Math.round((successCount + fixedCount) / allRules.length * 100)}%`);
    
  } catch (error) {
    console.error('❌ 修复过程错误:', error);
  } finally {
    await connection.end();
  }
}

/**
 * 修复SQL语句
 */
function fixSQL(sql) {
  let fixed = sql;
  
  // 1. 修复inventory表的常见问题
  if (fixed.includes('FROM inventory')) {
    // 修复factory -> storage_location
    fixed = fixed.replace(/\bfactory\b/g, 'storage_location');
    // 修复warehouse -> storage_location  
    fixed = fixed.replace(/\bwarehouse\b/g, 'storage_location');
  }
  
  // 2. 修复lab_tests表的常见问题
  if (fixed.includes('FROM lab_tests')) {
    // 修复project -> project_id
    fixed = fixed.replace(/\bproject\b/g, 'project_id');
    // 修复baseline -> baseline_id
    fixed = fixed.replace(/\bbaseline\b/g, 'baseline_id');
    // 修复supplier -> supplier_name
    fixed = fixed.replace(/\bsupplier\b/g, 'supplier_name');
  }
  
  // 3. 通用修复
  // 移除可能的语法错误
  fixed = fixed.replace(/\s+/g, ' ').trim();
  
  return fixed;
}

// 执行修复
simpleRulesFix();
