/**
 * 检查规则字段映射
 */
const mysql = require('./backend/node_modules/mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkFieldMapping() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查规则字段映射...\n');

    // 先检查assistant_rules表结构
    const [rulesColumns] = await connection.execute('DESCRIBE assistant_rules');
    console.log('📋 assistant_rules表字段:');
    rulesColumns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });

    // 1. 查看库存全信息查询规则
    const [inventoryRules] = await connection.execute(
      'SELECT intent_name, action_type, action_target FROM assistant_rules WHERE intent_name LIKE ?',
      ['%库存全信息%']
    );

    console.log('\n📋 库存全信息查询规则:');
    inventoryRules.forEach(rule => {
      console.log('规则名称:', rule.intent_name);
      console.log('动作类型:', rule.action_type);
      console.log('数据源:', rule.action_target);
      console.log('---');
    });

    // 2. 查看检验全信息查询规则
    const [inspectionRules] = await connection.execute(
      'SELECT intent_name, action_type, action_target FROM assistant_rules WHERE intent_name LIKE ?',
      ['%检验全信息%']
    );

    console.log('\n📋 检验全信息查询规则:');
    inspectionRules.forEach(rule => {
      console.log('规则名称:', rule.intent_name);
      console.log('动作类型:', rule.action_type);
      console.log('数据源:', rule.action_target);
      console.log('---');
    });

    // 3. 查看生产全信息查询规则
    const [productionRules] = await connection.execute(
      'SELECT intent_name, action_type, action_target FROM assistant_rules WHERE intent_name LIKE ?',
      ['%生产全信息%']
    );

    console.log('\n📋 生产全信息查询规则:');
    productionRules.forEach(rule => {
      console.log('规则名称:', rule.intent_name);
      console.log('动作类型:', rule.action_type);
      console.log('数据源:', rule.action_target);
      console.log('---');
    });
    
    // 4. 检查实际数据库表结构
    console.log('\n🗄️ 检查实际数据库表结构:');
    
    // 库存表结构
    const [inventoryColumns] = await connection.execute('DESCRIBE inventory');
    console.log('\n📦 inventory表字段:');
    inventoryColumns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });
    
    // 检验表结构
    const [inspectionColumns] = await connection.execute('DESCRIBE lab_tests');
    console.log('\n🔬 lab_tests表字段:');
    inspectionColumns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });
    
    // 生产表结构
    const [productionColumns] = await connection.execute('DESCRIBE online_tracking');
    console.log('\n🏭 online_tracking表字段:');
    productionColumns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });
    
  } finally {
    await connection.end();
  }
}

checkFieldMapping().catch(console.error);
