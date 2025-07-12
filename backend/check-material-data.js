const mysql = require('mysql2/promise');

async function checkMaterialData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  console.log('🔍 检查数据库中的物料数据...\n');

  try {
    // 1. 查看所有物料名称
    const [materials] = await connection.execute(`
      SELECT DISTINCT material_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY material_name 
      ORDER BY material_name
    `);

    console.log('📋 数据库中的所有物料:');
    materials.forEach(m => {
      console.log(`  ${m.material_name}: ${m.count}条记录`);
    });

    // 2. 特别检查电池相关物料
    console.log('\n🔋 电池相关物料详情:');
    const [batteryMaterials] = await connection.execute(`
      SELECT material_name, supplier_name, COUNT(*) as count
      FROM inventory 
      WHERE material_name LIKE '%电池%'
      GROUP BY material_name, supplier_name
      ORDER BY material_name, supplier_name
    `);

    batteryMaterials.forEach(m => {
      console.log(`  ${m.material_name} (${m.supplier_name}): ${m.count}条`);
    });

    // 3. 检查规则库中的电池查询规则
    console.log('\n📝 检查规则库中的物料查询规则:');
    const [rules] = await connection.execute(`
      SELECT intent_name, trigger_words, action_target
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%物料%' OR trigger_words LIKE '%电池%'
      ORDER BY intent_name
    `);

    rules.forEach(rule => {
      console.log(`  规则: ${rule.intent_name}`);
      console.log(`  触发词: ${rule.trigger_words}`);
      console.log(`  SQL: ${rule.action_target.substring(0, 100)}...`);
      console.log('');
    });

    // 4. 测试电池查询
    console.log('\n🧪 测试电池查询:');
    const [batteryQuery] = await connection.execute(`
      SELECT material_name, supplier_name, quantity, status
      FROM inventory 
      WHERE material_name LIKE '%电池%'
      ORDER BY material_name
      LIMIT 10
    `);

    batteryQuery.forEach(item => {
      console.log(`  ${item.material_name} | ${item.supplier_name} | ${item.quantity} | ${item.status}`);
    });

  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await connection.end();
  }
}

checkMaterialData().catch(console.error);
