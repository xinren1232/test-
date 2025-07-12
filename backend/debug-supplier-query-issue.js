import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

async function debugSupplierQueryIssue() {
  console.log('🔍 调试供应商查询问题...\n');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查供应商库存查询规则的具体实现
    console.log('1. 检查供应商库存查询规则:');
    const [supplierRule] = await connection.execute(`
      SELECT intent_name, action_target, parameters, trigger_words
      FROM nlp_intent_rules 
      WHERE intent_name = '供应商库存查询'
    `);
    
    if (supplierRule.length > 0) {
      const rule = supplierRule[0];
      console.log(`规则名称: ${rule.intent_name}`);
      console.log(`SQL模板:`);
      console.log(rule.action_target);
      console.log(`参数配置: ${rule.parameters}`);
      console.log(`触发词: ${rule.trigger_words}`);
    } else {
      console.log('❌ 未找到供应商库存查询规则');
    }
    
    // 2. 检查数据库中的实际供应商数据
    console.log('\n2. 检查数据库中的实际供应商数据:');
    const [suppliers] = await connection.execute(`
      SELECT DISTINCT supplier_name, COUNT(*) as count
      FROM inventory 
      GROUP BY supplier_name
      ORDER BY count DESC
    `);
    
    console.log('数据库中的供应商分布:');
    suppliers.forEach(supplier => {
      console.log(`  ${supplier.supplier_name}: ${supplier.count} 条记录`);
    });
    
    // 3. 测试BOE供应商查询
    console.log('\n3. 测试BOE供应商查询:');
    const [boeData] = await connection.execute(`
      SELECT storage_location as 工厂, material_name as 物料名称, supplier_name as 供应商, quantity as 数量
      FROM inventory 
      WHERE supplier_name LIKE '%BOE%'
      LIMIT 5
    `);
    
    console.log(`BOE供应商数据 (${boeData.length} 条):`);
    boeData.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.物料名称} | ${item.供应商} | ${item.数量} | ${item.工厂}`);
    });
    
    // 4. 测试聚龙供应商查询
    console.log('\n4. 测试聚龙供应商查询:');
    const [julongData] = await connection.execute(`
      SELECT storage_location as 工厂, material_name as 物料名称, supplier_name as 供应商, quantity as 数量
      FROM inventory 
      WHERE supplier_name LIKE '%聚龙%'
      LIMIT 5
    `);
    
    console.log(`聚龙供应商数据 (${julongData.length} 条):`);
    julongData.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.物料名称} | ${item.供应商} | ${item.数量} | ${item.工厂}`);
    });
    
    // 5. 检查当前SQL模板的问题
    console.log('\n5. 分析SQL模板问题:');
    if (supplierRule.length > 0) {
      const sql = supplierRule[0].action_target;
      
      // 检查是否硬编码了聚龙
      if (sql.includes('聚龙')) {
        console.log('❌ 发现问题: SQL模板硬编码了聚龙供应商');
        console.log('问题行: ' + sql.split('\n').find(line => line.includes('聚龙')));
      }
      
      // 检查是否有正确的参数占位符
      if (!sql.includes('?')) {
        console.log('❌ 发现问题: SQL模板缺少参数占位符');
      } else {
        console.log('✅ SQL模板包含参数占位符');
      }
      
      // 检查WHERE条件
      if (!sql.toLowerCase().includes('where')) {
        console.log('❌ 发现问题: SQL模板缺少WHERE条件');
      } else {
        console.log('✅ SQL模板包含WHERE条件');
      }
    }
    
    // 6. 测试正确的SQL查询
    console.log('\n6. 测试正确的SQL查询:');
    const correctSQL = `
      SELECT 
        storage_location as 工厂,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间
      FROM inventory 
      WHERE supplier_name LIKE CONCAT('%', ?, '%')
      ORDER BY inbound_time DESC 
      LIMIT 15
    `;
    
    console.log('测试BOE查询:');
    const [boeTest] = await connection.execute(correctSQL, ['BOE']);
    console.log(`BOE查询结果: ${boeTest.length} 条记录`);
    boeTest.slice(0, 3).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.物料名称} | ${item.供应商} | ${item.数量}`);
    });
    
    console.log('\n测试聚龙查询:');
    const [julongTest] = await connection.execute(correctSQL, ['聚龙']);
    console.log(`聚龙查询结果: ${julongTest.length} 条记录`);
    julongTest.slice(0, 3).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.物料名称} | ${item.供应商} | ${item.数量}`);
    });
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugSupplierQueryIssue();
