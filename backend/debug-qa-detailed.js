/**
 * 详细调试智能问答系统 - 追踪数据查询问题
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

async function debugQASystem() {
  let connection;
  
  try {
    console.log('🔍 开始详细调试智能问答系统...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 测试电池查询的完整流程
    console.log('🔋 测试电池查询流程:');
    console.log('   查询条件: material_name = "电池"');
    
    // 库存查询
    const [inventoryResult] = await connection.execute(`
      SELECT COUNT(*) as 批次数, SUM(quantity) as 总数量,
             COUNT(DISTINCT supplier_name) as 供应商数量,
             COUNT(CASE WHEN status = '风险' THEN 1 END) as 风险批次
      FROM inventory WHERE material_name = ?
    `, ['电池']);
    
    console.log('   📦 库存查询结果:', inventoryResult[0]);
    
    // 测试查询
    const [testingResult] = await connection.execute(`
      SELECT COUNT(*) as 测试总数,
             SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) as 通过数,
             SUM(CASE WHEN test_result = 'FAIL' THEN 1 ELSE 0 END) as 失败数
      FROM lab_tests WHERE material_name = ?
    `, ['电池']);
    
    console.log('   🧪 测试查询结果:', testingResult[0]);
    
    // 详细记录查询
    const [detailsResult] = await connection.execute(`
      SELECT material_name, supplier_name, quantity, status, storage_location, batch_code
      FROM inventory WHERE material_name = ?
      ORDER BY quantity DESC
      LIMIT 5
    `, ['电池']);
    
    console.log('   📋 详细记录 (前5条):');
    detailsResult.forEach((record, index) => {
      console.log(`      ${index + 1}. ${record.material_name} - ${record.supplier_name} - ${record.quantity}件 - ${record.status}`);
    });
    
    // 2. 模拟智能问答系统的数据结构
    console.log('\n🤖 模拟智能问答系统数据结构:');
    const qaData = {
      inventory: inventoryResult[0],
      testing: testingResult[0],
      details: detailsResult
    };
    
    console.log('   完整数据结构:', JSON.stringify(qaData, null, 2));
    
    // 3. 测试格式化函数
    console.log('\n📝 测试格式化函数:');
    const material = '电池';
    let response = `📊 **${material}综合情况**：\n\n`;

    response += `📦 **库存情况**：\n`;
    response += `- 批次数：${qaData.inventory.批次数} 批\n`;
    response += `- 总数量：${qaData.inventory.总数量} 件\n`;
    response += `- 供应商数量：${qaData.inventory.供应商数量} 家\n`;
    response += `- 风险批次：${qaData.inventory.风险批次} 批\n\n`;

    if (qaData.testing.测试总数 > 0) {
      const passRate = ((qaData.testing.通过数 / qaData.testing.测试总数) * 100).toFixed(1);
      response += `🧪 **测试情况**：\n`;
      response += `- 测试总数：${qaData.testing.测试总数} 次\n`;
      response += `- 通过率：${passRate}%\n\n`;
    }
    
    if (qaData.details && qaData.details.length > 0) {
      response += `📋 **详细记录**：\n`;
      qaData.details.forEach((record, index) => {
        response += `${index + 1}. ${record.supplier_name} - ${record.quantity}件 - ${record.status} (${record.storage_location})\n`;
      });
    }

    console.log('   生成的回复:');
    console.log(response);
    
    // 4. 测试BOE供应商查询
    console.log('\n🏢 测试BOE供应商查询:');
    const [boeResult] = await connection.execute(`
      SELECT COUNT(*) as 批次数, SUM(quantity) as 总数量,
             COUNT(DISTINCT material_name) as 物料种类
      FROM inventory WHERE supplier_name = ?
    `, ['BOE']);
    
    console.log('   查询结果:', boeResult[0]);
    
    const [boeDetails] = await connection.execute(`
      SELECT material_name, quantity, status, storage_location, batch_code
      FROM inventory WHERE supplier_name = ?
      ORDER BY quantity DESC
      LIMIT 5
    `, ['BOE']);
    
    console.log('   详细记录:');
    boeDetails.forEach((record, index) => {
      console.log(`      ${index + 1}. ${record.material_name} - ${record.quantity}件 - ${record.status} (${record.storage_location})`);
    });
    
    // 5. 测试风险状态查询
    console.log('\n⚠️ 测试风险状态查询:');
    const [riskResult] = await connection.execute(`
      SELECT COUNT(*) as 风险记录数, SUM(quantity) as 风险总量
      FROM inventory WHERE status = ?
    `, ['风险']);
    
    console.log('   查询结果:', riskResult[0]);
    
    const [riskDetails] = await connection.execute(`
      SELECT material_name, supplier_name, quantity, storage_location, batch_code
      FROM inventory WHERE status = ?
      ORDER BY quantity DESC
      LIMIT 5
    `, ['风险']);
    
    console.log('   详细记录:');
    riskDetails.forEach((record, index) => {
      console.log(`      ${index + 1}. ${record.material_name} - ${record.supplier_name} - ${record.quantity}件 (${record.storage_location})`);
    });
    
    console.log('\n✅ 调试完成 - 数据库查询正常，问题可能在智能问答系统的数据传递或格式化环节');
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugQASystem();
