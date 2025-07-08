/**
 * 测试数据库查询功能
 */

import initializeDatabase from './src/models/index.js';

const testDatabaseQuery = async () => {
  console.log('🧪 测试数据库查询功能...\n');
  
  try {
    // 初始化数据库
    console.log('🔌 初始化数据库连接...');
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    console.log('✅ 数据库连接成功！\n');
    
    // 测试简单查询
    console.log('📊 测试1: 简单库存查询');
    const sql1 = 'SELECT COUNT(*) as total FROM inventory';
    
    try {
      const [results1] = await sequelize.query(sql1, {
        type: sequelize.QueryTypes.SELECT
      });
      
      console.log(`✅ 查询成功: 库存总数 = ${results1.total}`);
    } catch (error) {
      console.log(`❌ 查询失败: ${error.message}`);
    }
    
    // 测试复杂查询
    console.log('\n📊 测试2: 复杂库存查询');
    const sql2 = `
      SELECT 
        material_name as 物料名称, 
        supplier_name as 供应商, 
        storage_location as 存储位置,
        status as 状态, 
        COUNT(*) as 数量
      FROM inventory 
      GROUP BY material_name, supplier_name, storage_location, status
      ORDER BY 数量 DESC 
      LIMIT 5
    `;
    
    try {
      const results2 = await sequelize.query(sql2, {
        type: sequelize.QueryTypes.SELECT
      });
      
      console.log(`✅ 查询成功: 返回 ${results2.length} 条记录`);
      results2.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.物料名称} | ${record.供应商} | ${record.存储位置} | ${record.状态} | 数量: ${record.数量}`);
      });
    } catch (error) {
      console.log(`❌ 查询失败: ${error.message}`);
    }
    
    // 测试带参数的查询
    console.log('\n📊 测试3: 带参数的查询');
    const sql3 = `
      SELECT 
        material_name, 
        supplier_name, 
        status, 
        quantity
      FROM inventory 
      WHERE status = ? 
      LIMIT 3
    `;
    
    try {
      const results3 = await sequelize.query(sql3, {
        replacements: ['正常'],
        type: sequelize.QueryTypes.SELECT
      });
      
      console.log(`✅ 参数查询成功: 返回 ${results3.length} 条记录`);
      results3.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.material_name} | ${record.supplier_name} | ${record.status}`);
      });
    } catch (error) {
      console.log(`❌ 参数查询失败: ${error.message}`);
    }
    
    // 测试规则中使用的SQL
    console.log('\n📊 测试4: 规则SQL查询');
    const ruleSql = `
      SELECT 
        material_name as 物料名称, 
        supplier_name as 供应商, 
        batch_code as 批次号, 
        quantity as 库存数量, 
        storage_location as 存储位置, 
        status as 状态, 
        risk_level as 风险等级, 
        inbound_time as 入库时间 
      FROM inventory 
      ORDER BY inbound_time DESC 
      LIMIT 5
    `;
    
    try {
      const ruleResults = await sequelize.query(ruleSql, {
        type: sequelize.QueryTypes.SELECT
      });
      
      console.log(`✅ 规则SQL查询成功: 返回 ${ruleResults.length} 条记录`);
      ruleResults.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.物料名称} | ${record.供应商} | ${record.状态} | 数量: ${record.库存数量}`);
      });
    } catch (error) {
      console.log(`❌ 规则SQL查询失败: ${error.message}`);
      console.log(`🔍 错误详情:`, error);
    }
    
    console.log('\n🎉 数据库查询测试完成！');
    
  } catch (error) {
    console.log(`❌ 数据库初始化失败: ${error.message}`);
    console.log(`🔍 错误详情:`, error);
  }
};

testDatabaseQuery().catch(console.error);
