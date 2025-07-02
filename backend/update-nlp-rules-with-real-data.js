/**
 * 更新NLP规则以匹配实际数据结构
 */
import mysql from 'mysql2/promise';

async function updateNlpRules() {
  console.log('🔄 更新NLP规则以匹配实际数据结构...');
  
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
    
    // 基于实际数据结构的新规则
    const newRules = [
      // 1. 库存查询 - 基于实际inventory表结构
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
      
      // 2. 批次库存查询
      {
        intent_name: '查询批次库存,批次查询',
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
      
      // 3. 高风险库存查询
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
      
      // 4. 供应商库存查询
      {
        intent_name: '查询供应商库存,供应商查询',
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
      
      // 5. 测试结果查询 - 基于实际lab_tests表结构
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
      
      // 6. 物料测试结果查询
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
      
      // 7. 上线跟踪查询 - 基于实际online_tracking表结构
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
      
      // 8. 工厂产线查询
      {
        intent_name: '查询工厂产线,工厂使用情况',
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
      
      // 9. 综合批次信息查询
      {
        intent_name: '批次全信息,批次详情',
        description: '查询批次的完整信息（库存+测试+上线）',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          '库存信息' as 类型,
          i.batch_code as 批次号,
          i.material_name as 物料名称,
          i.supplier_name as 供应商,
          i.quantity as 数量,
          i.status as 状态,
          i.risk_level as 风险等级
        FROM inventory i 
        WHERE i.batch_code = ?
        UNION ALL
        SELECT 
          '测试信息' as 类型,
          lt.batch_code,
          lt.test_item as 测试项目,
          lt.test_result as 测试结果,
          lt.conclusion as 结论,
          DATE_FORMAT(lt.test_date, '%Y-%m-%d') as 测试日期,
          lt.tester as 测试员
        FROM lab_tests lt 
        WHERE lt.batch_code = ?
        UNION ALL
        SELECT 
          '上线信息' as 类型,
          ot.batch_code,
          ot.factory as 工厂,
          ot.line as 产线,
          CONCAT(ROUND(ot.defect_rate * 100, 2), '%') as 不良率,
          DATE_FORMAT(ot.online_date, '%Y-%m-%d') as 上线日期,
          ot.operator as 操作员
        FROM online_tracking ot 
        WHERE ot.batch_code = ?`,
        parameters: JSON.stringify([
          { name: 'batch_code', type: 'string', description: '批次号' },
          { name: 'batch_code', type: 'string', description: '批次号' },
          { name: 'batch_code', type: 'string', description: '批次号' }
        ]),
        example_query: '查询批次 BATCH001 的详细信息',
        status: 'active'
      },
      
      // 10. 异常情况查询
      {
        intent_name: '查询异常,异常情况,问题物料',
        description: '查询有异常的物料和批次',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          i.material_code as 物料编码,
          i.material_name as 物料名称,
          i.batch_code as 批次号,
          i.supplier_name as 供应商,
          i.status as 库存状态,
          i.risk_level as 风险等级,
          COALESCE(ot.exception_count, 0) as 上线异常次数,
          COALESCE(GROUP_CONCAT(DISTINCT lt.test_result), '无测试') as 测试结果
        FROM inventory i
        LEFT JOIN online_tracking ot ON i.batch_code = ot.batch_code
        LEFT JOIN lab_tests lt ON i.batch_code = lt.batch_code
        WHERE i.status IN ('异常', '风险') OR i.risk_level = 'high' OR ot.exception_count > 0
        GROUP BY i.batch_code, i.material_code
        ORDER BY i.risk_level DESC, ot.exception_count DESC
        LIMIT 10`,
        parameters: JSON.stringify([]),
        example_query: '目前有哪些异常情况？',
        status: 'active'
      }
    ];
    
    // 插入新规则
    for (const rule of newRules) {
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
    
    console.log(`✅ 成功插入 ${newRules.length} 条新规则`);
    
    // 验证插入结果
    const [rules] = await connection.query('SELECT intent_name, description FROM nlp_intent_rules WHERE status = "active"');
    console.log('\n📋 当前活跃的NLP规则:');
    rules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.intent_name} - ${rule.description}`);
    });
    
    await connection.end();
    console.log('\n🎉 NLP规则更新完成！');
    
  } catch (error) {
    console.error('❌ 更新NLP规则失败:', error);
    process.exit(1);
  }
}

updateNlpRules();
