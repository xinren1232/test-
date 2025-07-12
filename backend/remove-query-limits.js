/**
 * 移除所有规则的查询数据限制
 * 确保返回所有满足条件的数据，而不是限制20条或50条
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

/**
 * 移除所有规则SQL中的LIMIT限制
 */
async function removeQueryLimits() {
  console.log('🔧 移除所有规则的查询数据限制...');
  
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
    
    console.log(`找到 ${rules.length} 个包含LIMIT限制的规则`);
    
    let updatedCount = 0;
    
    for (const rule of rules) {
      try {
        // 移除LIMIT子句
        let updatedSQL = rule.action_target;
        
        // 移除各种LIMIT格式
        updatedSQL = updatedSQL.replace(/\s+LIMIT\s+\d+/gi, '');
        updatedSQL = updatedSQL.replace(/\s+LIMIT\s+\d+\s*,\s*\d+/gi, '');
        
        // 清理多余的空白
        updatedSQL = updatedSQL.trim();
        
        if (updatedSQL !== rule.action_target) {
          // 更新规则
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET action_target = ?, updated_at = NOW()
            WHERE id = ?
          `, [updatedSQL, rule.id]);
          
          console.log(`✅ 更新规则: ${rule.intent_name}`);
          console.log(`   移除前: ...${rule.action_target.slice(-30)}`);
          console.log(`   移除后: ...${updatedSQL.slice(-30)}`);
          updatedCount++;
        }
        
      } catch (error) {
        console.log(`❌ 更新规则 ${rule.intent_name} 失败: ${error.message}`);
      }
    }
    
    console.log(`\n📊 更新结果: 成功移除 ${updatedCount} 个规则的LIMIT限制`);
    
    return { updatedCount, totalRules: rules.length };
    
  } finally {
    await connection.end();
  }
}

/**
 * 验证移除结果
 */
async function validateRemoval() {
  console.log('\n🔍 验证LIMIT移除结果...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 检查是否还有包含LIMIT的规则
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
      console.log('✅ 所有规则的LIMIT限制已成功移除');
    } else {
      console.log(`⚠️ 仍有 ${remainingRules.length} 个规则包含LIMIT:`);
      remainingRules.forEach(rule => {
        console.log(`- ${rule.intent_name}`);
      });
    }
    
    // 测试一个规则的查询结果
    console.log('\n🧪 测试查询结果数量...');
    
    const testSQL = `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE (material_name = '电池盖' OR material_name = '中框' OR material_name = '手机卡托' OR material_name = '侧键' OR material_name = '装饰件')
ORDER BY material_name, inbound_time DESC`;
    
    const [testResults] = await connection.execute(testSQL);
    console.log(`测试查询返回 ${testResults.length} 条记录（无LIMIT限制）`);
    
    if (testResults.length > 0) {
      const materialCounts = {};
      testResults.forEach(record => {
        materialCounts[record.物料名称] = (materialCounts[record.物料名称] || 0) + 1;
      });
      
      console.log('物料分布统计:');
      Object.entries(materialCounts).forEach(([material, count]) => {
        console.log(`  ${material}: ${count}条`);
      });
    }
    
    return { remainingRules: remainingRules.length, testResultCount: testResults.length };
    
  } finally {
    await connection.end();
  }
}

/**
 * 检查数据库中的实际数据量
 */
async function checkDataVolume() {
  console.log('\n📊 检查数据库实际数据量...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 检查各表的数据量
    const tables = [
      { name: 'inventory', desc: '库存数据' },
      { name: 'lab_tests', desc: '测试数据' },
      { name: 'online_tracking', desc: '在线跟踪数据' }
    ];
    
    for (const table of tables) {
      const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table.name}`);
      console.log(`${table.desc}: ${count[0].count} 条记录`);
      
      // 检查物料分布
      if (table.name === 'inventory') {
        const [materialStats] = await connection.execute(`
          SELECT material_name, COUNT(*) as count 
          FROM ${table.name} 
          GROUP BY material_name 
          ORDER BY count DESC
        `);
        
        console.log(`  物料种类: ${materialStats.length} 种`);
        materialStats.slice(0, 5).forEach(stat => {
          console.log(`    ${stat.material_name}: ${stat.count}条`);
        });
      }
    }
    
    // 检查结构件类物料的实际数量
    const [structuralMaterials] = await connection.execute(`
      SELECT material_name, COUNT(*) as count
      FROM inventory 
      WHERE material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件')
      GROUP BY material_name
      ORDER BY material_name
    `);
    
    console.log('\n结构件类物料统计:');
    let totalStructural = 0;
    structuralMaterials.forEach(material => {
      console.log(`  ${material.material_name}: ${material.count}条`);
      totalStructural += material.count;
    });
    console.log(`  结构件类总计: ${totalStructural}条`);
    
    return { totalStructural, materialStats: structuralMaterials };
    
  } finally {
    await connection.end();
  }
}

async function main() {
  try {
    console.log('🚀 开始移除查询数据限制...\n');
    
    // 1. 检查当前数据量
    const dataVolume = await checkDataVolume();
    
    // 2. 移除LIMIT限制
    const removeResults = await removeQueryLimits();
    
    // 3. 验证移除结果
    const validationResults = await validateRemoval();
    
    console.log('\n✅ 查询数据限制移除完成！');
    console.log(`📊 处理统计:`);
    console.log(`- 更新规则: ${removeResults.updatedCount} 个`);
    console.log(`- 剩余LIMIT: ${validationResults.remainingRules} 个`);
    console.log(`- 测试查询结果: ${validationResults.testResultCount} 条`);
    console.log(`- 结构件类总数据: ${dataVolume.totalStructural} 条`);
    
    if (validationResults.remainingRules === 0) {
      console.log('\n🎉 所有规则的数据限制已成功移除！');
      console.log('🎯 现在查询将返回所有满足条件的数据');
    } else {
      console.log('\n⚠️ 仍有部分规则需要手动检查');
    }
    
    return {
      success: validationResults.remainingRules === 0,
      removeResults,
      validationResults,
      dataVolume
    };
    
  } catch (error) {
    console.error('❌ 移除过程中发生错误:', error);
    throw error;
  }
}

main().catch(console.error);
