import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

/**
 * 移除所有数据生成和查询的数量限制
 * 
 * 包括：
 * 1. 数据库规则中的LIMIT限制
 * 2. 代码中的slice(0, 20)限制
 * 3. 其他硬编码的数量限制
 */

async function removeAllDataLimits() {
  console.log('🚀 开始移除所有数据生成和查询的数量限制...\n');
  
  // 第一步：移除数据库规则中的LIMIT限制
  await removeDatabaseLimits();
  
  // 第二步：移除代码中的数量限制
  await removeCodeLimits();
  
  // 第三步：验证移除效果
  await validateRemoval();
  
  console.log('\n🎉 所有数据限制移除完成！');
}

/**
 * 移除数据库规则中的LIMIT限制
 */
async function removeDatabaseLimits() {
  console.log('📋 1. 移除数据库规则中的LIMIT限制...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 获取所有包含LIMIT的规则
    const [rules] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND action_target LIKE '%LIMIT%'
      ORDER BY intent_name
    `);
    
    console.log(`   找到 ${rules.length} 个包含LIMIT限制的规则`);
    
    let updatedCount = 0;
    
    for (const rule of rules) {
      try {
        // 移除各种LIMIT格式
        let updatedSQL = rule.action_target;
        
        // 移除 LIMIT n
        updatedSQL = updatedSQL.replace(/\s+LIMIT\s+\d+/gi, '');
        // 移除 LIMIT offset, count
        updatedSQL = updatedSQL.replace(/\s+LIMIT\s+\d+\s*,\s*\d+/gi, '');
        // 移除行尾的LIMIT
        updatedSQL = updatedSQL.replace(/LIMIT\s+\d+\s*$/gi, '');
        
        // 清理多余的空白和分号
        updatedSQL = updatedSQL.trim().replace(/;+$/, '');
        
        if (updatedSQL !== rule.action_target) {
          // 更新规则
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET action_target = ?, updated_at = NOW()
            WHERE id = ?
          `, [updatedSQL, rule.id]);
          
          console.log(`   ✅ ${rule.intent_name}`);
          updatedCount++;
        }
        
      } catch (error) {
        console.log(`   ❌ 更新规则 ${rule.intent_name} 失败: ${error.message}`);
      }
    }
    
    console.log(`   📊 成功移除 ${updatedCount} 个规则的LIMIT限制\n`);
    
  } finally {
    await connection.end();
  }
}

/**
 * 移除代码中的数量限制
 */
async function removeCodeLimits() {
  console.log('💻 2. 移除代码中的数量限制...');
  
  const filesToCheck = [
    'backend/src/services/assistantService.js',
    'backend/final-rule-processor-fix.js',
    'backend/src/routes/rulesRoutes.js'
  ];
  
  let totalUpdated = 0;
  
  for (const filePath of filesToCheck) {
    if (fs.existsSync(filePath)) {
      console.log(`   检查文件: ${filePath}`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      let updated = false;
      
      // 移除 .slice(0, 20) 限制
      const slicePattern = /\.slice\(0,\s*\d+\)/g;
      if (slicePattern.test(content)) {
        content = content.replace(slicePattern, '');
        updated = true;
        console.log(`     ✅ 移除了 .slice(0, n) 限制`);
      }
      
      // 移除 dataSource.slice(0, 20) 限制
      const dataSourceSlicePattern = /dataSource\.slice\(0,\s*\d+\)/g;
      if (dataSourceSlicePattern.test(content)) {
        content = content.replace(dataSourceSlicePattern, 'dataSource');
        updated = true;
        console.log(`     ✅ 移除了 dataSource.slice(0, n) 限制`);
      }
      
      // 移除 results.slice(0, 20) 限制
      const resultsSlicePattern = /results\.slice\(0,\s*\d+\)/g;
      if (resultsSlicePattern.test(content)) {
        content = content.replace(resultsSlicePattern, 'results');
        updated = true;
        console.log(`     ✅ 移除了 results.slice(0, n) 限制`);
      }
      
      // 移除 filteredData.slice(0, 20) 限制
      const filteredDataSlicePattern = /filteredData\.slice\(0,\s*\d+\)/g;
      if (filteredDataSlicePattern.test(content)) {
        content = content.replace(filteredDataSlicePattern, 'filteredData');
        updated = true;
        console.log(`     ✅ 移除了 filteredData.slice(0, n) 限制`);
      }
      
      // 移除硬编码的LIMIT 20
      const hardcodedLimitPattern = /LIMIT\s+\d+/gi;
      if (hardcodedLimitPattern.test(content)) {
        content = content.replace(hardcodedLimitPattern, '');
        updated = true;
        console.log(`     ✅ 移除了硬编码的 LIMIT n`);
      }
      
      if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        totalUpdated++;
        console.log(`     💾 文件已更新`);
      } else {
        console.log(`     ℹ️  无需更新`);
      }
    } else {
      console.log(`   ⚠️  文件不存在: ${filePath}`);
    }
  }
  
  console.log(`   📊 成功更新 ${totalUpdated} 个文件\n`);
}

/**
 * 验证移除效果
 */
async function validateRemoval() {
  console.log('🔍 3. 验证移除效果...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 检查数据库中是否还有LIMIT限制
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
      console.log('   ✅ 数据库规则：所有LIMIT限制已移除');
    } else {
      console.log(`   ⚠️  数据库规则：仍有 ${remainingRules.length} 个规则包含LIMIT`);
      remainingRules.forEach(rule => {
        console.log(`      - ${rule.intent_name}`);
      });
    }
    
    // 测试一个规则的查询结果数量
    console.log('\n   🧪 测试查询结果数量...');
    
    const testSQL = `
      SELECT 
        storage_location as 工厂,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态
      FROM inventory
      ORDER BY inbound_time DESC
    `;
    
    const [testResults] = await connection.execute(testSQL);
    console.log(`   📊 测试查询返回 ${testResults.length} 条记录（无限制）`);
    
    // 检查各表的总记录数
    const tables = ['inventory', 'online_tracking', 'lab_tests'];
    console.log('\n   📈 各表记录数统计:');
    
    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`      ${table}: ${count[0].count} 条记录`);
      } catch (error) {
        console.log(`      ${table}: 查询失败`);
      }
    }
    
  } finally {
    await connection.end();
  }
}

/**
 * 额外优化：确保规则返回合理数量的数据
 */
async function optimizeDataRetrieval() {
  console.log('\n⚡ 4. 优化数据检索策略...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 为性能考虑，给一些可能返回大量数据的规则添加合理的ORDER BY
    const optimizationRules = [
      {
        pattern: 'SELECT.*FROM inventory',
        optimization: 'ORDER BY inbound_time DESC'
      },
      {
        pattern: 'SELECT.*FROM online_tracking',
        optimization: 'ORDER BY inspection_date DESC'
      },
      {
        pattern: 'SELECT.*FROM lab_tests',
        optimization: 'ORDER BY test_date DESC'
      }
    ];
    
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
    `);
    
    let optimizedCount = 0;
    
    for (const rule of allRules) {
      let updatedSQL = rule.action_target;
      let needsUpdate = false;
      
      for (const opt of optimizationRules) {
        const regex = new RegExp(opt.pattern, 'i');
        if (regex.test(updatedSQL) && !updatedSQL.includes('ORDER BY')) {
          updatedSQL += `\n${opt.optimization}`;
          needsUpdate = true;
          break;
        }
      }
      
      if (needsUpdate) {
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?
          WHERE id = ?
        `, [updatedSQL, rule.id]);
        
        console.log(`   ✅ 优化排序: ${rule.intent_name}`);
        optimizedCount++;
      }
    }
    
    console.log(`   📊 优化了 ${optimizedCount} 个规则的排序策略`);
    
  } finally {
    await connection.end();
  }
}

// 执行移除操作
removeAllDataLimits()
  .then(() => optimizeDataRetrieval())
  .catch(console.error);
