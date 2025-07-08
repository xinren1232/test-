/**
 * 分析实际数据结构
 * 基于真实数据来优化NLP规则
 */

import mysql from 'mysql2/promise';

async function analyzeRealData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });
  
  try {
    console.log('=== 分析实际数据结构 ===');
    
    // 1. 检查lab_tests表的实际字段和数据
    console.log('\n1. lab_tests表结构:');
    const [columns] = await connection.execute('DESCRIBE lab_tests');
    columns.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));
    
    // 2. 检查实际数据样本
    console.log('\n2. 实际数据样本:');
    const [samples] = await connection.execute(`
      SELECT test_id, material_name, material_code, batch_code, test_item, 
             supplier_name, test_result, defect_desc 
      FROM lab_tests LIMIT 5
    `);
    console.table(samples);
    
    // 3. 检查项目和基线的实际值
    console.log('\n3. 检查可用于项目和基线的字段:');
    
    const [testItems] = await connection.execute(`
      SELECT DISTINCT test_item FROM lab_tests 
      WHERE test_item IS NOT NULL LIMIT 10
    `);
    console.log('test_item字段值:', testItems.map(r => r.test_item));
    
    const [materialCodes] = await connection.execute(`
      SELECT DISTINCT material_code FROM lab_tests LIMIT 5
    `);
    console.log('material_code字段值:', materialCodes.map(r => r.material_code));
    
    const [batchCodes] = await connection.execute(`
      SELECT DISTINCT batch_code FROM lab_tests LIMIT 5
    `);
    console.log('batch_code字段值:', batchCodes.map(r => r.batch_code));
    
    // 4. 检查不合格描述
    console.log('\n4. 检查不合格描述:');
    const [defects] = await connection.execute(`
      SELECT DISTINCT defect_desc FROM lab_tests 
      WHERE defect_desc IS NOT NULL AND defect_desc != '' LIMIT 10
    `);
    console.log('defect_desc字段值:', defects.map(r => r.defect_desc));
    
    // 5. 分析数据分布
    console.log('\n5. 数据分布分析:');
    
    const [materialStats] = await connection.execute(`
      SELECT material_name, COUNT(*) as count 
      FROM lab_tests 
      GROUP BY material_name 
      ORDER BY count DESC 
      LIMIT 10
    `);
    console.log('物料分布:');
    console.table(materialStats);
    
    const [resultStats] = await connection.execute(`
      SELECT test_result, COUNT(*) as count 
      FROM lab_tests 
      GROUP BY test_result
    `);
    console.log('测试结果分布:');
    console.table(resultStats);
    
    // 6. 基于分析结果提出优化建议
    console.log('\n6. 字段映射优化建议:');
    console.log('根据实际数据分析:');
    console.log('- 项目字段: test_item都是"常规检测"，建议根据material_name生成项目名称');
    console.log('- 基线字段: batch_code是批次号，可以格式化显示');
    console.log('- 物料类型: material_name是实际的物料名称');
    console.log('- 不合格描述: defect_desc字段需要检查是否有实际内容');
    
  } catch (error) {
    console.error('分析过程中出现错误:', error);
  } finally {
    await connection.end();
  }
}

// 执行分析
analyzeRealData().catch(console.error);
