import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

/**
 * 修复规则中的字段映射问题
 * 
 * 主要问题：
 * 1. 规则中使用了 'factory' 字段，但数据库中实际字段名不同
 * 2. 规则中使用了 'project' 字段，但数据库中实际字段名不同
 */

// 字段映射关系
const FIELD_MAPPINGS = {
  // inventory表的字段映射
  'inventory': {
    'factory': 'storage_location', // 工厂字段实际是storage_location
    'warehouse': 'storage_location', // 仓库也是storage_location
  },
  
  // online_tracking表的字段映射
  'online_tracking': {
    'project': 'project', // 需要确认实际字段名
    'baseline': 'baseline', // 需要确认实际字段名
  },
  
  // lab_tests表的字段映射
  'lab_tests': {
    'project': 'project_id', // 项目字段实际是project_id
    'baseline': 'baseline_id', // 基线字段实际是baseline_id
  }
};

async function fixRulesFieldMapping() {
  try {
    console.log('🔧 开始修复规则字段映射问题...\n');
    
    // 1. 首先检查数据库表的实际字段
    console.log('📋 1. 检查数据库表的实际字段...');
    await checkActualTableFields();
    
    // 2. 获取所有失败的规则
    console.log('\n📋 2. 获取需要修复的规则...');
    const [failedRules] = await connection.execute(`
      SELECT id, intent_name, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND (
        action_target LIKE '%factory%' OR 
        action_target LIKE '%project%' OR
        action_target LIKE '%baseline%'
      )
      ORDER BY intent_name
    `);
    
    console.log(`找到 ${failedRules.length} 个需要修复的规则\n`);
    
    // 3. 逐个修复规则
    let fixedCount = 0;
    let skippedCount = 0;
    
    console.log('🔧 3. 开始修复规则...\n');
    
    for (let i = 0; i < failedRules.length; i++) {
      const rule = failedRules[i];
      console.log(`[${i + 1}/${failedRules.length}] 修复规则: ${rule.intent_name}`);
      
      let fixedSQL = rule.action_target;
      let hasChanges = false;
      
      // 修复inventory表的字段问题
      if (fixedSQL.includes('FROM inventory') || fixedSQL.includes('JOIN inventory')) {
        // 修复factory字段
        if (fixedSQL.includes('factory')) {
          // 在SELECT中的factory字段，需要保持中文别名
          fixedSQL = fixedSQL.replace(/SELECT[\s\S]*?FROM/gi, (selectPart) => {
            return selectPart.replace(/\bfactory\b/g, 'storage_location as 工厂');
          });
          
          // 在WHERE条件中的factory字段
          fixedSQL = fixedSQL.replace(/WHERE[\s\S]*?(?=ORDER|GROUP|LIMIT|$)/gi, (wherePart) => {
            return wherePart.replace(/\bfactory\b/g, 'storage_location');
          });
          
          hasChanges = true;
        }
      }
      
      // 修复lab_tests表的字段问题
      if (fixedSQL.includes('FROM lab_tests') || fixedSQL.includes('JOIN lab_tests')) {
        // 修复project字段
        if (fixedSQL.includes('project')) {
          fixedSQL = fixedSQL.replace(/\bproject\b/g, 'project_id');
          hasChanges = true;
        }
        
        // 修复baseline字段
        if (fixedSQL.includes('baseline')) {
          fixedSQL = fixedSQL.replace(/\bbaseline\b/g, 'baseline_id');
          hasChanges = true;
        }
      }
      
      // 修复online_tracking表的字段问题
      if (fixedSQL.includes('FROM online_tracking') || fixedSQL.includes('JOIN online_tracking')) {
        // online_tracking表已经有正确的字段名，不需要修复
      }
      
      // 如果有修改，更新数据库
      if (hasChanges) {
        try {
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET action_target = ?
            WHERE id = ?
          `, [fixedSQL, rule.id]);
          
          console.log(`  ✅ 修复成功`);
          fixedCount++;
          
          // 测试修复后的SQL
          try {
            const [testResults] = await connection.execute(fixedSQL);
            console.log(`  🧪 测试通过 - 返回 ${testResults.length} 条记录`);
          } catch (testError) {
            console.log(`  ⚠️  测试失败: ${testError.message}`);
          }
          
        } catch (updateError) {
          console.log(`  ❌ 更新失败: ${updateError.message}`);
        }
      } else {
        console.log(`  ℹ️  无需修复`);
        skippedCount++;
      }
      
      // 每10个规则显示一次进度
      if ((i + 1) % 10 === 0) {
        console.log(`\n📈 进度: ${i + 1}/${failedRules.length} (${Math.round((i + 1) / failedRules.length * 100)}%)\n`);
      }
    }
    
    // 4. 修复结果汇总
    console.log('\n📊 4. 修复结果汇总:');
    console.log(`总规则数: ${failedRules.length}`);
    console.log(`✅ 修复成功: ${fixedCount}`);
    console.log(`ℹ️  无需修复: ${skippedCount}`);
    
    // 5. 重新测试修复后的规则
    console.log('\n🧪 5. 重新测试修复后的规则...');
    await retestFixedRules();
    
    console.log('\n🎉 规则字段映射修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  } finally {
    await connection.end();
  }
}

/**
 * 检查数据库表的实际字段
 */
async function checkActualTableFields() {
  const tables = ['inventory', 'online_tracking', 'lab_tests'];
  
  for (const tableName of tables) {
    console.log(`\n📋 ${tableName} 表字段:`);
    
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'iqe_inspection' AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [tableName]);
      
      const fieldNames = columns.map(col => col.COLUMN_NAME);
      console.log(`  字段: ${fieldNames.join(', ')}`);
      
      // 检查关键字段是否存在
      const keyFields = ['factory', 'project', 'baseline', 'storage_location', 'project_id', 'baseline_id'];
      keyFields.forEach(field => {
        const exists = fieldNames.includes(field);
        if (exists) {
          console.log(`  ✅ ${field}: 存在`);
        }
      });
      
    } catch (error) {
      console.log(`  ❌ 查询失败: ${error.message}`);
    }
  }
}

/**
 * 重新测试修复后的规则
 */
async function retestFixedRules() {
  try {
    // 获取所有活跃规则
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY intent_name
    `);
    
    let successCount = 0;
    let failedCount = 0;
    const sampleResults = [];
    
    // 测试前20个规则作为样本
    const testRules = allRules.slice(0, 20);
    
    for (const rule of testRules) {
      try {
        const [results] = await connection.execute(rule.action_target);
        successCount++;
        
        if (results.length > 0) {
          sampleResults.push({
            rule: rule.intent_name,
            recordCount: results.length,
            fields: Object.keys(results[0])
          });
        }
        
      } catch (error) {
        failedCount++;
      }
    }
    
    console.log(`\n📊 重新测试结果 (样本${testRules.length}个规则):`);
    console.log(`✅ 成功: ${successCount} (${Math.round(successCount / testRules.length * 100)}%)`);
    console.log(`❌ 失败: ${failedCount} (${Math.round(failedCount / testRules.length * 100)}%)`);
    
    if (sampleResults.length > 0) {
      console.log(`\n📄 成功规则示例:`);
      sampleResults.slice(0, 3).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.rule}: ${result.recordCount}条记录`);
        console.log(`     字段: ${result.fields.slice(0, 5).join(', ')}${result.fields.length > 5 ? '...' : ''}`);
      });
    }
    
  } catch (error) {
    console.log(`❌ 重新测试失败: ${error.message}`);
  }
}

// 执行修复
fixRulesFieldMapping();
