/**
 * 全面诊断规则问题
 * 逐一检查每个规则的SQL语法、字段映射、数据返回等问题
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function comprehensiveRuleDiagnosis() {
  console.log('🔍 全面诊断规则问题...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 获取所有活跃规则
    console.log('1. 获取所有活跃规则:');
    const [rules] = await connection.query(`
      SELECT id, intent_name, description, action_type, action_target, example_query, priority
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY priority DESC, id ASC
    `);
    
    console.log(`   找到 ${rules.length} 条活跃规则\n`);
    
    // 2. 逐一测试每个规则
    let successCount = 0;
    let failureCount = 0;
    const failedRules = [];
    
    for (let i = 0; i < Math.min(rules.length, 10); i++) { // 限制测试前10条规则
      const rule = rules[i];
      console.log(`📋 [${i + 1}/${Math.min(rules.length, 10)}] 测试规则: ${rule.intent_name}`);
      console.log(`   描述: ${rule.description}`);
      console.log(`   示例: ${rule.example_query}`);
      console.log(`   优先级: ${rule.priority}`);
      
      try {
        // 检查SQL语法
        if (!rule.action_target || rule.action_target.trim() === '') {
          console.log(`   ❌ SQL为空`);
          failureCount++;
          failedRules.push({
            rule: rule.intent_name,
            error: 'SQL为空',
            fix: '需要添加SQL查询'
          });
          continue;
        }
        
        // 执行SQL查询
        const sql = rule.action_target;
        console.log(`   SQL预览: ${sql.substring(0, 100)}...`);
        
        const startTime = Date.now();
        const [results] = await connection.query(sql);
        const executionTime = Date.now() - startTime;
        
        console.log(`   ✅ 执行成功: ${results.length} 条记录, 耗时 ${executionTime}ms`);
        
        // 检查返回数据结构
        if (results.length > 0) {
          const fields = Object.keys(results[0]);
          console.log(`   📊 返回字段: ${fields.join(', ')}`);
          
          // 检查是否有中文字段名
          const chineseFields = fields.filter(field => /[\u4e00-\u9fa5]/.test(field));
          if (chineseFields.length > 0) {
            console.log(`   🏷️  中文字段: ${chineseFields.join(', ')}`);
          }
          
          // 显示第一条记录示例
          console.log(`   📝 数据示例: ${JSON.stringify(results[0])}`);
        } else {
          console.log(`   ⚠️  返回数据为空`);
        }
        
        successCount++;
        
      } catch (error) {
        console.log(`   ❌ 执行失败: ${error.message}`);
        failureCount++;
        failedRules.push({
          rule: rule.intent_name,
          error: error.message,
          sql: sql.substring(0, 200),
          fix: '需要修复SQL语法或字段映射'
        });
      }
      
      console.log('');
    }
    
    // 3. 检查数据库表结构
    console.log('3. 检查数据库表结构:');
    const tables = ['inventory', 'online_tracking', 'lab_tests'];
    
    for (const table of tables) {
      console.log(`\n📋 表: ${table}`);
      try {
        const [columns] = await connection.query(`
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = 'iqe_inspection' 
          AND TABLE_NAME = ?
          ORDER BY ORDINAL_POSITION
        `, [table]);
        
        console.log(`   字段列表: ${columns.map(col => col.COLUMN_NAME).join(', ')}`);
        
        // 检查数据量
        const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   数据量: ${countResult[0].count} 条记录`);
        
      } catch (error) {
        console.log(`   ❌ 表不存在或查询失败: ${error.message}`);
      }
    }
    
    // 4. 生成修复建议
    console.log('\n\n4. 诊断总结:');
    console.log(`   ✅ 成功规则: ${successCount} 条`);
    console.log(`   ❌ 失败规则: ${failureCount} 条`);
    
    if (failedRules.length > 0) {
      console.log('\n📋 失败规则详情:');
      failedRules.forEach((failed, index) => {
        console.log(`   ${index + 1}. ${failed.rule}`);
        console.log(`      错误: ${failed.error}`);
        console.log(`      建议: ${failed.fix}`);
        if (failed.sql) {
          console.log(`      SQL: ${failed.sql}...`);
        }
        console.log('');
      });
    }
    
    // 5. 生成修复脚本
    if (failedRules.length > 0) {
      console.log('5. 生成修复建议:');
      
      failedRules.forEach((failed, index) => {
        if (failed.error.includes('Unknown column')) {
          console.log(`   🔧 ${failed.rule}: 字段映射错误，需要检查表结构`);
        } else if (failed.error.includes('Table') && failed.error.includes("doesn't exist")) {
          console.log(`   🔧 ${failed.rule}: 表不存在，需要检查表名`);
        } else if (failed.error.includes('SQL syntax')) {
          console.log(`   🔧 ${failed.rule}: SQL语法错误，需要修复查询语句`);
        } else {
          console.log(`   🔧 ${failed.rule}: 其他错误，需要详细检查`);
        }
      });
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 诊断失败:', error.message);
  }
}

// 执行诊断
comprehensiveRuleDiagnosis();
