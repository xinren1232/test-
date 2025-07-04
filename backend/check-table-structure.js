/**
 * 检查数据库表结构
 */

import mysql from 'mysql2/promise';

async function checkTableStructure() {
  console.log('🔍 检查数据库表结构\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 检查nlp_intent_rules表结构
    console.log('📋 nlp_intent_rules 表结构:');
    const [ruleColumns] = await connection.query('DESCRIBE nlp_intent_rules');
    console.table(ruleColumns);
    
    // 检查inventory表结构
    console.log('\n📦 inventory 表结构:');
    const [inventoryColumns] = await connection.query('DESCRIBE inventory');
    console.table(inventoryColumns);
    
    // 检查lab_tests表结构
    console.log('\n🧪 lab_tests 表结构:');
    const [labColumns] = await connection.query('DESCRIBE lab_tests');
    console.table(labColumns);
    
    // 检查online_tracking表结构
    console.log('\n🏭 online_tracking 表结构:');
    const [trackingColumns] = await connection.query('DESCRIBE online_tracking');
    console.table(trackingColumns);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkTableStructure();
