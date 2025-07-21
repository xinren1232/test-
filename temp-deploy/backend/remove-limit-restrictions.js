/**
 * 移除数据库规则中的所有LIMIT限制
 * 确保智能问答返回完整数据，不受50条限制
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function removeLimitRestrictions() {
  console.log('🔧 移除数据库规则中的所有LIMIT限制...\n');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 1. 查找所有包含LIMIT的规则
    console.log('1️⃣ 查找包含LIMIT限制的规则...');
    const [rulesWithLimit] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND action_target LIKE '%LIMIT%'
      ORDER BY intent_name
    `);
    
    console.log(`   找到 ${rulesWithLimit.length} 个包含LIMIT限制的规则\n`);
    
    if (rulesWithLimit.length === 0) {
      console.log('✅ 没有发现LIMIT限制，无需处理');
      return;
    }
    
    // 2. 显示将要修改的规则
    console.log('2️⃣ 将要修改的规则:');
    rulesWithLimit.forEach((rule, index) => {
      console.log(`   ${index + 1}. ${rule.intent_name}`);
      
      // 显示LIMIT部分
      const limitMatch = rule.action_target.match(/LIMIT\s+\d+/gi);
      if (limitMatch) {
        console.log(`      当前限制: ${limitMatch.join(', ')}`);
      }
    });
    
    console.log('');
    
    // 3. 移除LIMIT限制
    console.log('3️⃣ 开始移除LIMIT限制...');
    let updatedCount = 0;
    
    for (const rule of rulesWithLimit) {
      try {
        // 移除各种LIMIT格式
        let updatedSQL = rule.action_target;
        
        // 移除 LIMIT n
        updatedSQL = updatedSQL.replace(/\s+LIMIT\s+\d+/gi, '');
        
        // 移除 LIMIT offset, count
        updatedSQL = updatedSQL.replace(/\s+LIMIT\s+\d+\s*,\s*\d+/gi, '');
        
        // 清理多余的空白和换行
        updatedSQL = updatedSQL.trim();
        
        if (updatedSQL !== rule.action_target) {
          // 更新规则
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET action_target = ?, updated_at = NOW()
            WHERE id = ?
          `, [updatedSQL, rule.id]);
          
          console.log(`   ✅ 更新: ${rule.intent_name}`);
          updatedCount++;
        }
        
      } catch (error) {
        console.log(`   ❌ 更新失败: ${rule.intent_name} - ${error.message}`);
      }
    }
    
    console.log(`\n📊 更新完成: 成功移除 ${updatedCount} 个规则的LIMIT限制\n`);
    
    // 4. 验证移除结果
    console.log('4️⃣ 验证移除结果...');
    const [remainingRules] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND action_target LIKE '%LIMIT%'
    `);
    
    if (remainingRules.length === 0) {
      console.log('   ✅ 所有LIMIT限制已成功移除');
    } else {
      console.log(`   ⚠️  仍有 ${remainingRules.length} 个规则包含LIMIT:`);
      remainingRules.forEach(rule => {
        console.log(`      - ${rule.intent_name}`);
      });
    }
    
    // 5. 测试查询结果数量
    console.log('\n5️⃣ 测试查询结果数量...');
    
    // 测试库存查询
    const [inventoryCount] = await connection.execute(`
      SELECT COUNT(*) as total FROM inventory
    `);
    console.log(`   库存总数据: ${inventoryCount[0].total} 条`);
    
    // 测试生产查询
    const [productionCount] = await connection.execute(`
      SELECT COUNT(*) as total FROM online_tracking
    `);
    console.log(`   生产总数据: ${productionCount[0].total} 条`);
    
    // 测试测试查询
    const [testCount] = await connection.execute(`
      SELECT COUNT(*) as total FROM lab_tests
    `);
    console.log(`   测试总数据: ${testCount[0].total} 条`);
    
    console.log('\n🎉 LIMIT限制移除完成！');
    console.log('🎯 现在智能问答将返回所有符合条件的数据，不再受50条限制');
    
  } finally {
    await connection.end();
  }
}

// 运行脚本
removeLimitRestrictions().catch(console.error);
