/**
 * 检查规则逻辑问题
 * 重点检查参数处理和查询过滤逻辑
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkRuleLogic() {
  console.log('🔍 检查规则逻辑问题...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查物料库存查询规则
    console.log('1. 检查物料库存查询规则:');
    const [inventoryRules] = await connection.query(`
      SELECT id, intent_name, description, action_target, parameters, example_query
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%库存%' OR intent_name LIKE '%inventory%'
      ORDER BY id
      LIMIT 3
    `);
    
    for (const rule of inventoryRules) {
      console.log(`\n📋 规则: ${rule.intent_name}`);
      console.log(`   描述: ${rule.description}`);
      console.log(`   示例: ${rule.example_query}`);
      
      // 检查SQL查询
      const sql = rule.action_target;
      console.log(`   SQL查询:`);
      console.log(`   ${sql.substring(0, 200)}...`);
      
      // 检查是否有参数占位符
      const hasParameters = sql.includes('?') || sql.includes('LIKE CONCAT');
      console.log(`   是否有参数过滤: ${hasParameters ? '✅ 是' : '❌ 否'}`);
      
      // 检查参数配置
      if (rule.parameters) {
        try {
          const params = JSON.parse(rule.parameters);
          console.log(`   参数配置: ${JSON.stringify(params)}`);
        } catch (e) {
          console.log(`   参数配置: 解析失败`);
        }
      } else {
        console.log(`   参数配置: 无`);
      }
      
      // 测试执行SQL（不带参数）
      try {
        // 移除参数占位符进行测试
        let testSql = sql.replace(/\?/g, "''");
        testSql = testSql.replace(/LIKE CONCAT\('%', '', '%'\)/g, "LIKE '%'");
        
        const [results] = await connection.query(testSql);
        console.log(`   执行结果: 返回 ${results.length} 条记录`);
        
        if (results.length === 132) {
          console.log(`   ⚠️  问题: 返回了所有库存数据，缺少有效过滤`);
        }
        
      } catch (error) {
        console.log(`   执行结果: SQL执行失败 - ${error.message}`);
      }
    }
    
    // 2. 检查其他常见规则的参数问题
    console.log('\n\n2. 检查其他规则的参数处理:');
    const [otherRules] = await connection.query(`
      SELECT id, intent_name, action_target, parameters, example_query
      FROM nlp_intent_rules 
      WHERE action_target LIKE '%?%' OR action_target LIKE '%CONCAT%'
      ORDER BY id
      LIMIT 5
    `);
    
    for (const rule of otherRules) {
      console.log(`\n📋 规则: ${rule.intent_name}`);
      console.log(`   示例: ${rule.example_query}`);
      
      // 统计参数占位符数量
      const paramCount = (rule.action_target.match(/\?/g) || []).length;
      console.log(`   参数占位符数量: ${paramCount}`);
      
      // 检查参数配置
      let configuredParams = 0;
      if (rule.parameters) {
        try {
          const params = JSON.parse(rule.parameters);
          configuredParams = Array.isArray(params) ? params.length : 0;
        } catch (e) {
          configuredParams = 0;
        }
      }
      
      console.log(`   配置的参数数量: ${configuredParams}`);
      
      if (paramCount !== configuredParams && paramCount > 0) {
        console.log(`   ⚠️  参数不匹配: SQL需要${paramCount}个参数，但只配置了${configuredParams}个`);
      }
    }
    
    // 3. 检查数据库中的实际数据分布
    console.log('\n\n3. 检查数据库实际数据:');
    
    // 检查库存表
    const [inventoryStats] = await connection.query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT material_name) as unique_materials,
        COUNT(DISTINCT supplier_name) as unique_suppliers
      FROM inventory
    `);
    
    console.log(`   库存表统计:`);
    console.log(`   - 总记录数: ${inventoryStats[0].total_records}`);
    console.log(`   - 不同物料: ${inventoryStats[0].unique_materials}`);
    console.log(`   - 不同供应商: ${inventoryStats[0].unique_suppliers}`);
    
    // 检查电池相关数据
    const [batteryData] = await connection.query(`
      SELECT COUNT(*) as count
      FROM inventory 
      WHERE material_name LIKE '%电池%'
    `);
    
    console.log(`   电池相关记录: ${batteryData[0].count} 条`);
    
    // 4. 生成修复建议
    console.log('\n\n4. 修复建议:');
    console.log('   📝 问题分析:');
    console.log('   - 规则SQL查询缺少有效的参数过滤');
    console.log('   - 参数占位符可能没有正确传递实际值');
    console.log('   - 需要在NLP处理时提取关键词并传递给SQL');
    
    console.log('\n   🔧 修复方案:');
    console.log('   1. 修复SQL查询的参数处理逻辑');
    console.log('   2. 确保NLP服务正确提取查询关键词');
    console.log('   3. 添加默认过滤条件避免返回全部数据');
    console.log('   4. 优化参数配置和传递机制');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

// 执行检查
checkRuleLogic();
