/**
 * 修复NLP规则中的问题
 */
import mysql from 'mysql2/promise';

async function fixNlpRules() {
  console.log('🔧 修复NLP规则中的问题...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 连接到数据库成功！');
    
    // 清空现有规则
    await connection.query('DELETE FROM nlp_intent_rules');
    console.log('🗑️  清空现有规则');
    
    // 修复后的规则
    const fixedRules = [
      // 1. 高风险库存查询 - 无参数
      {
        intent_name: '高风险库存,风险库存,查询风险',
        description: '查询高风险等级的库存物料',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          material_code as 物料编码,
          material_name as 物料名称,
          batch_code as 批次号,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          storage_location as 存储位置,
          notes as 备注,
          inspector as 检验员
        FROM inventory 
        WHERE risk_level = 'high' 
        ORDER BY created_at DESC LIMIT 10`,
        parameters: JSON.stringify([]),
        example_query: '目前有哪些高风险库存？',
        status: 'active'
      },
      
      // 2. 库存查询 - 需要物料编码
      {
        intent_name: '查询库存,库存查询,查库存',
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
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间
        FROM inventory 
        WHERE material_code = ? 
        ORDER BY created_at DESC LIMIT 5`,
        parameters: JSON.stringify([{
          name: 'material_code',
          type: 'string',
          description: '物料编码'
        }]),
        example_query: '查询物料 M12345 的库存',
        status: 'active'
      },
      
      // 3. 批次库存查询 - 需要批次号
      {
        intent_name: '查询批次库存,批次查询,批次库存',
        description: '根据批次号查询库存信息',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          batch_code as 批次号,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          risk_level as 风险等级,
          storage_location as 存储位置,
          inspector as 检验员,
          notes as 备注
        FROM inventory 
        WHERE batch_code = ? 
        ORDER BY created_at DESC`,
        parameters: JSON.stringify([{
          name: 'batch_code',
          type: 'string',
          description: '批次号'
        }]),
        example_query: '查询批次 BATCH001 的库存',
        status: 'active'
      },
      
      // 4. 供应商库存查询 - 需要供应商名称
      {
        intent_name: '查询供应商库存,供应商查询,供应商库存',
        description: '查询特定供应商的库存物料',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          supplier_name as 供应商,
          material_code as 物料编码,
          material_name as 物料名称,
          batch_code as 批次号,
          quantity as 数量,
          status as 状态,
          risk_level as 风险等级,
          storage_location as 存储位置
        FROM inventory 
        WHERE supplier_name = ? 
        ORDER BY created_at DESC LIMIT 10`,
        parameters: JSON.stringify([{
          name: 'supplier_name',
          type: 'string',
          description: '供应商名称'
        }]),
        example_query: '查询欣旺达的库存',
        status: 'active'
      },
      
      // 5. 测试结果查询 - 需要批次号
      {
        intent_name: '查询测试结果,测试结果,检测结果',
        description: '根据批次号查询测试结果',
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
        WHERE batch_code = ? 
        ORDER BY created_at DESC`,
        parameters: JSON.stringify([{
          name: 'batch_code',
          type: 'string',
          description: '批次号'
        }]),
        example_query: '查询批次 BATCH001 的测试结果',
        status: 'active'
      },
      
      // 6. 物料测试结果查询 - 需要物料编码
      {
        intent_name: '查询物料测试,物料测试结果',
        description: '根据物料编码查询测试结果',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          material_code as 物料编码,
          material_name as 物料名称,
          batch_code as 批次号,
          test_item as 测试项目,
          test_result as 测试结果,
          conclusion as 结论,
          DATE_FORMAT(test_date, '%Y-%m-%d') as 测试日期,
          tester as 测试员
        FROM lab_tests 
        WHERE material_code = ? 
        ORDER BY test_date DESC LIMIT 10`,
        parameters: JSON.stringify([{
          name: 'material_code',
          type: 'string',
          description: '物料编码'
        }]),
        example_query: '查询物料 M12345 的测试结果',
        status: 'active'
      },
      
      // 7. 上线跟踪查询 - 需要批次号
      {
        intent_name: '查询上线情况,上线跟踪,产线使用',
        description: '根据批次号查询上线使用情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          batch_code as 批次号,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          factory as 工厂,
          workshop as 车间,
          line as 产线,
          project as 项目,
          CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
          exception_count as 异常次数,
          DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
          operator as 操作员
        FROM online_tracking 
        WHERE batch_code = ? 
        ORDER BY online_date DESC`,
        parameters: JSON.stringify([{
          name: 'batch_code',
          type: 'string',
          description: '批次号'
        }]),
        example_query: '查询批次 BATCH001 的上线情况',
        status: 'active'
      },
      
      // 8. 工厂产线查询 - 需要工厂名称
      {
        intent_name: '查询工厂产线,工厂使用情况,工厂情况',
        description: '查询特定工厂的物料使用情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          factory as 工厂,
          line as 产线,
          material_name as 物料名称,
          batch_code as 批次号,
          supplier_name as 供应商,
          CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
          exception_count as 异常次数,
          DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期
        FROM online_tracking 
        WHERE factory = ? 
        ORDER BY online_date DESC LIMIT 10`,
        parameters: JSON.stringify([{
          name: 'factory',
          type: 'string',
          description: '工厂名称'
        }]),
        example_query: '查询深圳工厂的使用情况',
        status: 'active'
      },
      
      // 9. 异常情况查询 - 无参数，修复SQL
      {
        intent_name: '查询异常,异常情况,问题物料',
        description: '查询有异常的物料和批次',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          material_code as 物料编码,
          material_name as 物料名称,
          batch_code as 批次号,
          supplier_name as 供应商,
          status as 库存状态,
          risk_level as 风险等级,
          notes as 备注
        FROM inventory 
        WHERE status IN ('异常', '风险') OR risk_level = 'high'
        ORDER BY risk_level DESC, created_at DESC
        LIMIT 10`,
        parameters: JSON.stringify([]),
        example_query: '目前有哪些异常情况？',
        status: 'active'
      },
      
      // 10. 所有库存概览 - 无参数
      {
        intent_name: '所有库存,库存概览,库存总览',
        description: '查看所有库存概览',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          material_code as 物料编码,
          material_name as 物料名称,
          batch_code as 批次号,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          risk_level as 风险等级
        FROM inventory 
        ORDER BY created_at DESC 
        LIMIT 20`,
        parameters: JSON.stringify([]),
        example_query: '显示所有库存',
        status: 'active'
      }
    ];
    
    // 插入修复后的规则
    for (const rule of fixedRules) {
      await connection.query(
        `INSERT INTO nlp_intent_rules 
         (intent_name, description, action_type, action_target, parameters, example_query, status, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          rule.intent_name,
          rule.description,
          rule.action_type,
          rule.action_target,
          rule.parameters,
          rule.example_query,
          rule.status
        ]
      );
    }
    
    console.log(`✅ 成功插入 ${fixedRules.length} 条修复后的规则`);
    
    // 验证插入结果
    const [rules] = await connection.query('SELECT intent_name, description FROM nlp_intent_rules WHERE status = "active"');
    console.log('\n📋 当前活跃的NLP规则:');
    rules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.intent_name} - ${rule.description}`);
    });
    
    await connection.end();
    console.log('\n🎉 NLP规则修复完成！');
    
  } catch (error) {
    console.error('❌ 修复NLP规则失败:', error);
    process.exit(1);
  }
}

fixNlpRules();
