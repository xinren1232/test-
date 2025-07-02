/**
 * 优化工厂查询规则
 * 修改工厂查询逻辑，显示详细的物料信息而不是统计汇总
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function optimizeFactoryQueryRules() {
  console.log('🔧 优化工厂查询规则...');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 连接到数据库成功！');
    
    // 修改工厂库存查询规则 - 显示详细物料信息而不是统计汇总
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = ?,
        description = '查询特定工厂的详细库存物料信息'
      WHERE intent_name = '工厂库存,工厂物料,查询工厂,工厂情况'
    `, [`SELECT 
          storage_location as 工厂,
          material_code as 物料编码,
          material_name as 物料名称,
          batch_code as 批次号,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          risk_level as 风险等级,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 检验日期,
          DATE_FORMAT(created_at, '%Y-%m-%d') as 入库日期,
          notes as 备注
        FROM inventory 
        WHERE storage_location LIKE CONCAT('%', ?, '%')
        ORDER BY created_at DESC LIMIT 20`]);
    
    console.log('✅ 工厂库存查询规则已优化');
    
    // 添加一个新的工厂统计查询规则（如果用户想要统计信息）
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, description, action_type, action_target, 
        parameters, example_query, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      '工厂统计,工厂汇总,工厂概况,工厂总览',
      '查询工厂的统计汇总信息',
      'SQL_QUERY',
      `SELECT 
        storage_location as 工厂,
        COUNT(*) as 物料种类数,
        SUM(quantity) as 总库存量,
        COUNT(CASE WHEN status = '风险' THEN 1 END) as 风险物料数,
        COUNT(CASE WHEN status = '冻结' THEN 1 END) as 冻结物料数,
        COUNT(CASE WHEN status = '正常' THEN 1 END) as 正常物料数,
        GROUP_CONCAT(DISTINCT supplier_name ORDER BY supplier_name SEPARATOR ', ') as 供应商列表,
        GROUP_CONCAT(DISTINCT material_name ORDER BY material_name SEPARATOR ', ') as 物料清单
      FROM inventory 
      WHERE storage_location LIKE CONCAT('%', ?, '%')
      GROUP BY storage_location`,
      JSON.stringify([
        {
          name: 'factory_name',
          type: 'string',
          description: '工厂名称',
          extract_patterns: [
            '重庆工厂',
            '深圳工厂',
            '南昌工厂',
            '宜宾工厂'
          ]
        }
      ]),
      '查询重庆工厂的统计概况',
      'active'
    ]);
    
    console.log('✅ 添加工厂统计查询规则');
    
    // 同样优化供应商查询规则 - 显示详细物料信息
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = ?,
        description = '查询特定供应商的详细库存物料信息'
      WHERE intent_name = '供应商库存,查询供应商,供应商物料,供应商情况'
    `, [`SELECT 
          supplier_name as 供应商,
          material_code as 物料编码,
          material_name as 物料名称,
          batch_code as 批次号,
          storage_location as 工厂,
          quantity as 数量,
          status as 状态,
          risk_level as 风险等级,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 检验日期,
          DATE_FORMAT(created_at, '%Y-%m-%d') as 入库日期,
          notes as 备注
        FROM inventory 
        WHERE supplier_name LIKE CONCAT('%', ?, '%')
        ORDER BY created_at DESC LIMIT 20`]);
    
    console.log('✅ 供应商查询规则已优化');
    
    // 添加供应商统计查询规则
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, description, action_type, action_target, 
        parameters, example_query, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      '供应商统计,供应商汇总,供应商概况,供应商总览',
      '查询供应商的统计汇总信息',
      'SQL_QUERY',
      `SELECT 
        supplier_name as 供应商,
        COUNT(*) as 物料种类数,
        SUM(quantity) as 总库存量,
        COUNT(CASE WHEN status = '风险' THEN 1 END) as 风险物料数,
        COUNT(CASE WHEN status = '冻结' THEN 1 END) as 冻结物料数,
        COUNT(CASE WHEN status = '正常' THEN 1 END) as 正常物料数,
        GROUP_CONCAT(DISTINCT storage_location ORDER BY storage_location SEPARATOR ', ') as 工厂分布,
        GROUP_CONCAT(DISTINCT material_name ORDER BY material_name SEPARATOR ', ') as 物料清单
      FROM inventory 
      WHERE supplier_name LIKE CONCAT('%', ?, '%')
      GROUP BY supplier_name`,
      JSON.stringify([
        {
          name: 'supplier_name',
          type: 'string',
          description: '供应商名称',
          extract_patterns: [
            '紫光',
            '广正',
            '黑龙',
            '欣旺',
            '比亚迪',
            '宁德时代'
          ]
        }
      ]),
      '查询紫光供应商的统计概况',
      'active'
    ]);
    
    console.log('✅ 添加供应商统计查询规则');
    
    console.log('🎉 规则优化完成！');
    
    // 显示当前所有规则
    const [rules] = await connection.query(`
      SELECT intent_name, description, example_query 
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY created_at
    `);
    
    console.log('\n📋 当前活跃的查询规则:');
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name}`);
      console.log(`   描述: ${rule.description}`);
      console.log(`   示例: ${rule.example_query}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ 优化失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

optimizeFactoryQueryRules().catch(console.error);
