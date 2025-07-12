/**
 * 测试场景化统计卡片
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function testInventoryCards() {
  console.log('📦 测试库存场景统计卡片...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 1. 物料/批次统计
    const [materialStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(DISTINCT batch_code) as 批次数量,
        COUNT(*) as 总记录数
      FROM inventory
    `);
    
    // 2. 供应商统计
    const [supplierStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT supplier_name) as 供应商数量
      FROM inventory
    `);
    
    // 3. 风险库存统计
    const [riskStats] = await connection.execute(`
      SELECT 
        COUNT(*) as 风险库存数量,
        SUM(quantity) as 风险库存总量
      FROM inventory 
      WHERE status = '风险'
    `);
    
    // 4. 冻结库存统计
    const [frozenStats] = await connection.execute(`
      SELECT 
        COUNT(*) as 冻结库存数量,
        SUM(quantity) as 冻结库存总量
      FROM inventory 
      WHERE status = '冻结'
    `);
    
    console.log('库存场景统计结果:');
    console.log(`📦 物料/批次: ${materialStats[0].物料种类}种物料, ${materialStats[0].批次数量}个批次`);
    console.log(`🏢 供应商: ${supplierStats[0].供应商数量}个供应商`);
    console.log(`⚠️ 风险库存: ${riskStats[0].风险库存数量 || 0}条记录, ${riskStats[0].风险库存总量 || 0}件`);
    console.log(`🔒 冻结库存: ${frozenStats[0].冻结库存数量 || 0}条记录, ${frozenStats[0].冻结库存总量 || 0}件`);
    
    return {
      material: materialStats[0],
      supplier: supplierStats[0],
      risk: riskStats[0],
      frozen: frozenStats[0]
    };
    
  } finally {
    await connection.end();
  }
}

async function testOnlineCards() {
  console.log('\n🚀 测试上线场景统计卡片...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 1. 物料/批次统计
    const [materialStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(DISTINCT batch_code) as 批次数量
      FROM online_tracking
    `);
    
    // 2. 项目统计
    const [projectStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT project) as 项目数量,
        COUNT(DISTINCT baseline) as 基线数量
      FROM online_tracking
    `);
    
    // 3. 供应商统计
    const [supplierStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT supplier_name) as 供应商数量
      FROM online_tracking
    `);
    
    // 4. 不良统计（3%为分界）
    const [defectStats] = await connection.execute(`
      SELECT 
        SUM(CASE WHEN defect_rate <= 0.03 THEN 1 ELSE 0 END) as 标准内,
        SUM(CASE WHEN defect_rate > 0.03 THEN 1 ELSE 0 END) as 标准外,
        AVG(defect_rate) as 平均不良率
      FROM online_tracking
      WHERE defect_rate IS NOT NULL
    `);
    
    console.log('上线场景统计结果:');
    console.log(`📦 物料/批次: ${materialStats[0].物料种类 || 0}种物料, ${materialStats[0].批次数量 || 0}个批次`);
    console.log(`🎯 项目: ${projectStats[0].项目数量 || 0}个项目, ${projectStats[0].基线数量 || 0}个基线`);
    console.log(`🏢 供应商: ${supplierStats[0].供应商数量 || 0}个供应商`);
    console.log(`📊 不良分析: 标准内${defectStats[0].标准内 || 0}个, 标准外${defectStats[0].标准外 || 0}个`);
    console.log(`   平均不良率: ${((defectStats[0].平均不良率 || 0) * 100).toFixed(2)}%`);
    
    return {
      material: materialStats[0],
      project: projectStats[0],
      supplier: supplierStats[0],
      defect: defectStats[0]
    };
    
  } finally {
    await connection.end();
  }
}

async function testTestCards() {
  console.log('\n🧪 测试测试场景统计卡片...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 1. 物料/批次统计
    const [materialStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(DISTINCT batch_code) as 批次数量
      FROM lab_tests
    `);
    
    // 2. 项目统计
    const [projectStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT project_id) as 项目数量,
        COUNT(DISTINCT baseline_id) as 基线数量
      FROM lab_tests
      WHERE project_id IS NOT NULL
    `);
    
    // 3. 供应商统计
    const [supplierStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT supplier_name) as 供应商数量
      FROM lab_tests
    `);
    
    // 4. NG批次统计
    const [ngStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT batch_code) as NG批次数量,
        COUNT(*) as NG测试次数,
        COUNT(DISTINCT material_name) as NG物料种类
      FROM lab_tests 
      WHERE test_result = 'FAIL' OR conclusion = 'NG'
    `);
    
    console.log('测试场景统计结果:');
    console.log(`📦 物料/批次: ${materialStats[0].物料种类 || 0}种物料, ${materialStats[0].批次数量 || 0}个批次`);
    console.log(`🎯 项目: ${projectStats[0].项目数量 || 0}个项目, ${projectStats[0].基线数量 || 0}个基线`);
    console.log(`🏢 供应商: ${supplierStats[0].供应商数量 || 0}个供应商`);
    console.log(`❌ NG批次: ${ngStats[0].NG批次数量 || 0}个批次, ${ngStats[0].NG测试次数 || 0}次NG测试`);
    console.log(`   涉及${ngStats[0].NG物料种类 || 0}种物料`);
    
    return {
      material: materialStats[0],
      project: projectStats[0],
      supplier: supplierStats[0],
      ng: ngStats[0]
    };
    
  } finally {
    await connection.end();
  }
}

async function main() {
  try {
    console.log('🚀 开始测试场景化统计卡片...\n');
    
    // 测试三个场景
    const inventoryResults = await testInventoryCards();
    const onlineResults = await testOnlineCards();
    const testResults = await testTestCards();
    
    console.log('\n✅ 场景化统计卡片测试完成！');
    console.log('\n📋 卡片设计总结:');
    console.log('1. 库存场景: 物料/批次、供应商、风险库存、冻结库存');
    console.log('2. 上线场景: 物料/批次、项目、供应商、不良分析(3%分界)');
    console.log('3. 测试场景: 物料/批次、项目、供应商、NG批次');
    
    return {
      inventory: inventoryResults,
      online: onlineResults,
      test: testResults
    };
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    throw error;
  }
}

main().catch(console.error);
