/**
 * 简化的规则检查脚本
 */

import mysql from 'mysql2/promise';

async function simpleRuleCheck() {
  console.log('🔍 简化规则检查\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 1. 检查实际数据
    console.log('📊 实际数据统计:');
    
    const [inventoryCount] = await connection.query('SELECT COUNT(*) as count FROM inventory');
    console.log(`库存数据: ${inventoryCount[0].count} 条`);
    
    const [suppliers] = await connection.query(`
      SELECT supplier_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY supplier_name 
      ORDER BY COUNT(*) DESC 
      LIMIT 5
    `);
    console.log('\n主要供应商:');
    console.table(suppliers);
    
    const [factories] = await connection.query(`
      SELECT storage_location, COUNT(*) as count 
      FROM inventory 
      GROUP BY storage_location 
      ORDER BY COUNT(*) DESC
    `);
    console.log('\n工厂分布:');
    console.table(factories);
    
    const [statuses] = await connection.query(`
      SELECT status, COUNT(*) as count 
      FROM inventory 
      GROUP BY status 
      ORDER BY COUNT(*) DESC
    `);
    console.log('\n状态分布:');
    console.table(statuses);
    
    // 2. 检查当前规则
    console.log('\n📋 当前规则:');
    
    const [rules] = await connection.query(`
      SELECT id, intent_name, description, trigger_words, priority, status
      FROM nlp_intent_rules 
      ORDER BY priority DESC
    `);
    
    for (const rule of rules) {
      console.log(`\n规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`  描述: ${rule.description}`);
      console.log(`  触发词: ${rule.trigger_words}`);
      console.log(`  优先级: ${rule.priority}`);
      console.log(`  状态: ${rule.status}`);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

simpleRuleCheck();
