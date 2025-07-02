/**
 * 更新NLP规则以支持真实业务数据格式
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function updateNLPRules() {
  console.log('🔧 更新NLP规则以支持真实业务数据格式...');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 连接到数据库成功！');
    
    // 更新现有规则，改进参数提取逻辑
    const updatedRules = [
      {
        id: 29,
        intent_name: '查询库存,库存查询,查库存,库存情况',
        description: '查询物料库存信息',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          material_code as 物料编码,
          material_name as 物料名称,
          batch_code as 批次号,
          supplier_name as 供应商,
          quantity as 数量,
          storage_location as 存储位置,
          status as 状态,
          risk_level as 风险等级,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
          inspector as 检验员
        FROM inventory 
        WHERE material_code LIKE CONCAT('%', ?, '%') OR material_name LIKE CONCAT('%', ?, '%')
        ORDER BY created_at DESC LIMIT 10`,
        parameters: JSON.stringify([
          {
            name: 'material_code',
            type: 'string',
            description: '物料编码或物料名称',
            extract_patterns: [
              'CS-[A-Z]类\\d+',
              'CS-[A-Z]-[A-Z]\\d+',
              '电芯',
              '欣旺',
              '广汽',
              '紫光'
            ]
          }
        ]),
        example_query: '查询物料 CS-B类2234 的库存'
      },
      {
        id: 31,
        intent_name: '供应商库存,查询供应商,供应商物料,供应商情况',
        description: '查询特定供应商的库存物料',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          supplier_name as 供应商,
          COUNT(*) as 物料种类数,
          SUM(quantity) as 总库存量,
          COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as 高风险物料数,
          COUNT(CASE WHEN status = '异常' THEN 1 END) as 异常物料数,
          GROUP_CONCAT(DISTINCT material_name ORDER BY material_name SEPARATOR ', ') as 物料清单,
          GROUP_CONCAT(DISTINCT storage_location ORDER BY storage_location SEPARATOR ', ') as 工厂分布
        FROM inventory 
        WHERE supplier_name LIKE CONCAT('%', ?, '%')
        GROUP BY supplier_name`,
        parameters: JSON.stringify([
          {
            name: 'supplier_name',
            type: 'string',
            description: '供应商名称',
            extract_patterns: [
              '紫光',
              '欣旺',
              '广汽',
              '比亚迪',
              '宁德时代'
            ]
          }
        ]),
        example_query: '查询紫光供应商的库存情况'
      },
      {
        id: 34,
        intent_name: '测试结果,检测结果,实验结果,测试报告',
        description: '查询测试结果详情',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          batch_code as 批次号,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          test_item as 测试项目,
          test_result as 测试结果,
          conclusion as 结论,
          defect_desc as 缺陷描述,
          DATE_FORMAT(test_date, '%Y-%m-%d') as 测试日期,
          tester as 测试员,
          reviewer as 审核员
        FROM lab_tests 
        WHERE batch_code LIKE CONCAT('%', ?, '%') OR material_code LIKE CONCAT('%', ?, '%')
        ORDER BY test_date DESC LIMIT 10`,
        parameters: JSON.stringify([
          {
            name: 'batch_code',
            type: 'string',
            description: '批次号或物料编码',
            extract_patterns: [
              'CS-[A-Z]类\\d+',
              'CS-[A-Z]-[A-Z]\\d+',
              'BATCH\\d+'
            ]
          }
        ]),
        example_query: '查询批次 CS-B类2234 的测试结果'
      }
    ];
    
    // 添加新的规则：按物料名称查询
    const newRules = [
      {
        intent_name: '物料名称查询,按名称查库存,查询物料名称',
        description: '按物料名称查询库存',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          material_code as 物料编码,
          material_name as 物料名称,
          batch_code as 批次号,
          supplier_name as 供应商,
          quantity as 数量,
          storage_location as 存储位置,
          status as 状态,
          risk_level as 风险等级,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
          inspector as 检验员
        FROM inventory 
        WHERE material_name LIKE CONCAT('%', ?, '%')
        ORDER BY created_at DESC LIMIT 10`,
        parameters: JSON.stringify([
          {
            name: 'material_name',
            type: 'string',
            description: '物料名称',
            extract_patterns: [
              '电芯',
              '电阻器',
              '电容器',
              '传感器'
            ]
          }
        ]),
        example_query: '查询电芯的库存情况',
        status: 'active'
      },
      {
        intent_name: '工厂库存,工厂物料,查询工厂库存',
        description: '查询特定工厂的库存情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          storage_location as 工厂,
          COUNT(*) as 物料种类数,
          SUM(quantity) as 总库存量,
          COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as 高风险物料数,
          COUNT(CASE WHEN status = '异常' THEN 1 END) as 异常物料数,
          GROUP_CONCAT(DISTINCT supplier_name ORDER BY supplier_name SEPARATOR ', ') as 供应商列表,
          GROUP_CONCAT(DISTINCT material_name ORDER BY material_name SEPARATOR ', ') as 物料清单
        FROM inventory 
        WHERE storage_location LIKE CONCAT('%', ?, '%')
        GROUP BY storage_location`,
        parameters: JSON.stringify([
          {
            name: 'factory_name',
            type: 'string',
            description: '工厂名称',
            extract_patterns: [
              '宜宾工厂',
              '重庆工厂',
              '深圳工厂',
              '东莞工厂'
            ]
          }
        ]),
        example_query: '查询重庆工厂的库存情况',
        status: 'active'
      }
    ];
    
    // 更新现有规则
    for (const rule of updatedRules) {
      await connection.query(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, parameters = ?, updated_at = NOW()
        WHERE id = ?
      `, [rule.action_target, rule.parameters, rule.id]);
      console.log(`✅ 更新规则: ${rule.intent_name}`);
    }
    
    // 添加新规则
    for (const rule of newRules) {
      await connection.query(`
        INSERT INTO nlp_intent_rules (
          intent_name, description, action_type, action_target, 
          parameters, example_query, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        rule.intent_name, rule.description, rule.action_type, 
        rule.action_target, rule.parameters, rule.example_query, rule.status
      ]);
      console.log(`✅ 添加新规则: ${rule.intent_name}`);
    }
    
    // 添加一些高风险数据用于测试
    console.log('📊 添加高风险测试数据...');
    await connection.query(`
      UPDATE inventory 
      SET risk_level = 'high', status = '风险', notes = '需要重点关注'
      WHERE material_code = 'CS-B类6034'
    `);
    
    console.log('🎉 NLP规则更新完成！');
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateNLPRules().catch(console.error);
