/**
 * 基于真实数据字段更新NLP规则
 * 根据你提供的实际字段结构重新设计问答规则
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function updateNLPForRealFields() {
  console.log('🔧 基于真实数据字段更新NLP规则...');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 连接到数据库成功！');
    
    // 清空现有规则
    await connection.query('DELETE FROM nlp_intent_rules');
    console.log('🗑️ 清空现有NLP规则');
    
    // 基于真实数据字段的新NLP规则
    const newRules = [
      {
        intent_name: '查询库存,库存查询,查库存,库存情况,物料库存',
        description: '查询物料库存信息',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          material_code as 物料编码,
          material_name as 物料名称,
          batch_code as 批次号,
          supplier_name as 供应商,
          quantity as 数量,
          storage_location as 工厂,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 检验日期,
          notes as 备注
        FROM inventory 
        WHERE material_code LIKE CONCAT('%', ?, '%') 
           OR material_name LIKE CONCAT('%', ?, '%')
           OR batch_code LIKE CONCAT('%', ?, '%')
        ORDER BY created_at DESC LIMIT 10`,
        parameters: JSON.stringify([
          {
            name: 'search_term',
            type: 'string',
            description: '搜索关键词（物料编码、物料名称或批次号）',
            extract_patterns: [
              'CS-[A-Z]\\d+',
              'CS-[A-Z]-[A-Z]\\d+',
              '\\d{6}',
              '电容',
              '电芯'
            ]
          }
        ]),
        example_query: '查询物料 CS-B-第2236 的库存',
        status: 'active'
      },
      {
        intent_name: '风险库存,高风险库存,风险物料,异常库存',
        description: '查询风险状态的库存物料',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          material_code as 物料编码,
          material_name as 物料名称,
          batch_code as 批次号,
          supplier_name as 供应商,
          quantity as 数量,
          storage_location as 工厂,
          status as 状态,
          notes as 风险原因,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 检验日期
        FROM inventory 
        WHERE status IN ('风险', '冻结') OR risk_level = 'high'
        ORDER BY created_at DESC LIMIT 10`,
        parameters: JSON.stringify([]),
        example_query: '目前有哪些风险库存？',
        status: 'active'
      },
      {
        intent_name: '供应商库存,查询供应商,供应商物料,供应商情况',
        description: '查询特定供应商的库存物料',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          supplier_name as 供应商,
          COUNT(*) as 物料种类数,
          SUM(quantity) as 总库存量,
          COUNT(CASE WHEN status = '风险' THEN 1 END) as 风险物料数,
          COUNT(CASE WHEN status = '冻结' THEN 1 END) as 冻结物料数,
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
              '广正',
              '黑龙',
              '欣旺',
              '比亚迪',
              '宁德时代'
            ]
          }
        ]),
        example_query: '查询紫光供应商的库存情况',
        status: 'active'
      },
      {
        intent_name: '工厂库存,工厂物料,查询工厂,工厂情况',
        description: '查询特定工厂的库存情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          storage_location as 工厂,
          COUNT(*) as 物料种类数,
          SUM(quantity) as 总库存量,
          COUNT(CASE WHEN status = '风险' THEN 1 END) as 风险物料数,
          COUNT(CASE WHEN status = '冻结' THEN 1 END) as 冻结物料数,
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
              '重庆工厂',
              '深圳工厂',
              '南昌工厂',
              '宜宾工厂'
            ]
          }
        ]),
        example_query: '查询重庆工厂的库存情况',
        status: 'active'
      },
      {
        intent_name: '测试结果,检测结果,实验结果,测试报告,检验结果',
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
        WHERE batch_code LIKE CONCAT('%', ?, '%') 
           OR material_code LIKE CONCAT('%', ?, '%')
           OR material_name LIKE CONCAT('%', ?, '%')
        ORDER BY test_date DESC LIMIT 10`,
        parameters: JSON.stringify([
          {
            name: 'search_term',
            type: 'string',
            description: '搜索关键词（批次号、物料编码或物料名称）',
            extract_patterns: [
              'CS-[A-Z]\\d+',
              'CS-[A-Z]-[A-Z]\\d+',
              '\\d{6}',
              '电容',
              '电芯'
            ]
          }
        ]),
        example_query: '查询批次 411013 的测试结果',
        status: 'active'
      },
      {
        intent_name: '不良测试,测试不良,NG测试,失败测试,测试异常',
        description: '查询测试不良的记录',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          batch_code as 批次号,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          test_item as 测试项目,
          test_result as 测试结果,
          defect_desc as 缺陷描述,
          DATE_FORMAT(test_date, '%Y-%m-%d') as 测试日期,
          tester as 测试员
        FROM lab_tests 
        WHERE test_result = 'NG' OR conclusion = '不合格'
        ORDER BY test_date DESC LIMIT 10`,
        parameters: JSON.stringify([]),
        example_query: '最近有哪些测试不良的记录？',
        status: 'active'
      },
      {
        intent_name: '生产情况,产线情况,工厂使用,上线情况,生产数据',
        description: '查询工厂生产使用情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          factory as 工厂,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          batch_code as 批次号,
          CONCAT(defect_rate * 100, '%') as 不良率,
          exception_count as 异常次数,
          DATE_FORMAT(use_time, '%Y-%m-%d') as 使用日期,
          workshop as 车间,
          line as 产线
        FROM online_tracking 
        WHERE factory LIKE CONCAT('%', ?, '%')
           OR material_code LIKE CONCAT('%', ?, '%')
           OR batch_code LIKE CONCAT('%', ?, '%')
        ORDER BY use_time DESC LIMIT 10`,
        parameters: JSON.stringify([
          {
            name: 'search_term',
            type: 'string',
            description: '搜索关键词（工厂名称、物料编码或批次号）',
            extract_patterns: [
              '重庆工厂',
              '深圳工厂',
              '南昌工厂',
              '宜宾工厂',
              'CS-[A-Z]\\d+',
              '\\d{6}'
            ]
          }
        ]),
        example_query: '查询重庆工厂的生产情况',
        status: 'active'
      },
      {
        intent_name: '高不良率,不良率高,质量问题,生产异常',
        description: '查询高不良率的生产记录',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          factory as 工厂,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          batch_code as 批次号,
          CONCAT(defect_rate * 100, '%') as 不良率,
          exception_count as 异常次数,
          DATE_FORMAT(use_time, '%Y-%m-%d') as 使用日期
        FROM online_tracking 
        WHERE defect_rate > 0.02
        ORDER BY defect_rate DESC LIMIT 10`,
        parameters: JSON.stringify([]),
        example_query: '最近有哪些高不良率的生产记录？',
        status: 'active'
      }
    ];
    
    // 插入新规则
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
      console.log(`✅ 添加规则: ${rule.intent_name}`);
    }
    
    console.log(`🎉 成功添加 ${newRules.length} 条NLP规则！`);
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateNLPForRealFields().catch(console.error);
