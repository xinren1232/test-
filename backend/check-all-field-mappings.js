import mysql from 'mysql2/promise';

async function checkAllFieldMappings() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔍 检查lab_tests表结构...');
    const [fields] = await connection.execute('DESCRIBE lab_tests');
    console.log('表字段:');
    fields.forEach(field => {
      console.log(`  ${field.Field}: ${field.Type} ${field.Null === 'YES' ? '(可空)' : '(非空)'}`);
    });

    console.log('\n📊 检查实际数据中的项目和基线字段...');
    const [samples] = await connection.execute(`
      SELECT 
        test_id,
        material_code,
        batch_code,
        project_id,
        baseline_id,
        material_name,
        supplier_name,
        test_result
      FROM lab_tests 
      LIMIT 5
    `);
    
    console.log('样本数据:');
    samples.forEach((row, i) => {
      console.log(`${i+1}. 测试ID: ${row.test_id}`);
      console.log(`   material_code: ${row.material_code}`);
      console.log(`   batch_code: ${row.batch_code}`);
      console.log(`   project_id: ${row.project_id || '无'}`);
      console.log(`   baseline_id: ${row.baseline_id || '无'}`);
      console.log(`   物料名称: ${row.material_name}`);
      console.log(`   供应商: ${row.supplier_name}`);
      console.log(`   测试结果: ${row.test_result}`);
      console.log('');
    });

    console.log('🔍 检查当前NLP规则中的字段映射...');
    const [rules] = await connection.execute(`
      SELECT intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%测试%' OR intent_name LIKE '%NG%' OR intent_name LIKE '%OK%'
      ORDER BY intent_name
    `);
    
    console.log('相关规则的字段映射:');
    rules.forEach(rule => {
      console.log(`\n规则: ${rule.intent_name}`);
      const target = rule.action_target;
      if (target.includes('project_id')) {
        console.log('  ✅ 使用 project_id 字段');
      } else if (target.includes('material_code')) {
        console.log('  ⚠️  使用 material_code 作为项目字段');
      }
      
      if (target.includes('baseline_id')) {
        console.log('  ✅ 使用 baseline_id 字段');
      } else if (target.includes('batch_code')) {
        console.log('  ⚠️  使用 batch_code 作为基线字段');
      }
    });

  } finally {
    await connection.end();
  }
}

checkAllFieldMappings().catch(console.error);
