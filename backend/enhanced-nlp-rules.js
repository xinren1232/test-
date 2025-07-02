/**
 * 增强的NLP规则 - 基于三个业务场景的深度分析
 */
import mysql from 'mysql2/promise';

async function createEnhancedNlpRules() {
  console.log('🚀 创建增强的NLP规则...');
  
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
    
    // 增强的NLP规则 - 覆盖三个业务场景的深度查询
    const enhancedRules = [
      
      // ========== 库存管理场景 ==========
      
      // 1. 基础库存查询
      {
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
      
      // 2. 风险库存分析
      {
        intent_name: '高风险库存,风险库存,查询风险,风险物料,危险库存',
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
          notes as 风险原因,
          inspector as 检验员,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间
        FROM inventory 
        WHERE risk_level = 'high' 
        ORDER BY created_at DESC LIMIT 10`,
        parameters: JSON.stringify([]),
        example_query: '目前有哪些高风险库存？',
        status: 'active'
      },
      
      // 3. 供应商库存分析
      {
        intent_name: '供应商库存,查询供应商,供应商物料,供应商情况',
        description: '查询特定供应商的库存物料',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          supplier_name as 供应商,
          COUNT(*) as 物料种类数,
          SUM(quantity) as 总库存量,
          COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as 高风险物料数,
          COUNT(CASE WHEN status = '异常' THEN 1 END) as 异常物料数,
          GROUP_CONCAT(DISTINCT material_name ORDER BY material_name SEPARATOR ', ') as 物料清单
        FROM inventory 
        WHERE supplier_name = ? 
        GROUP BY supplier_name`,
        parameters: JSON.stringify([{
          name: 'supplier_name',
          type: 'string',
          description: '供应商名称'
        }]),
        example_query: '查询欣旺达的库存情况',
        status: 'active'
      },
      
      // 4. 批次全生命周期跟踪
      {
        intent_name: '批次跟踪,批次全信息,批次生命周期,批次详情',
        description: '查询批次的完整生命周期信息',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          '库存信息' as 信息类型,
          i.batch_code as 批次号,
          i.material_name as 物料名称,
          i.supplier_name as 供应商,
          CAST(i.quantity AS CHAR) as 数量状态,
          i.status as 当前状态,
          i.risk_level as 风险等级,
          DATE_FORMAT(i.inbound_time, '%Y-%m-%d') as 相关日期
        FROM inventory i 
        WHERE i.batch_code = ?
        UNION ALL
        SELECT 
          '测试信息' as 信息类型,
          lt.batch_code,
          lt.test_item as 测试项目,
          lt.test_result as 测试结果,
          lt.conclusion as 结论,
          lt.tester as 测试员,
          lt.reviewer as 审核员,
          DATE_FORMAT(lt.test_date, '%Y-%m-%d') as 相关日期
        FROM lab_tests lt 
        WHERE lt.batch_code = ?
        UNION ALL
        SELECT 
          '上线信息' as 信息类型,
          ot.batch_code,
          ot.factory as 工厂,
          ot.line as 产线,
          CONCAT(ROUND(ot.defect_rate * 100, 2), '%') as 不良率,
          CAST(ot.exception_count AS CHAR) as 异常次数,
          ot.operator as 操作员,
          DATE_FORMAT(ot.online_date, '%Y-%m-%d') as 相关日期
        FROM online_tracking ot 
        WHERE ot.batch_code = ?
        ORDER BY 信息类型, 相关日期 DESC`,
        parameters: JSON.stringify([
          { name: 'batch_code', type: 'string', description: '批次号' },
          { name: 'batch_code', type: 'string', description: '批次号' },
          { name: 'batch_code', type: 'string', description: '批次号' }
        ]),
        example_query: '查询批次 BATCH001 的全生命周期信息',
        status: 'active'
      },
      
      // ========== 实验室测试场景 ==========
      
      // 5. 测试结果查询
      {
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
        WHERE batch_code = ? 
        ORDER BY test_date DESC`,
        parameters: JSON.stringify([{
          name: 'batch_code',
          type: 'string',
          description: '批次号'
        }]),
        example_query: '查询批次 BATCH001 的测试结果',
        status: 'active'
      },
      
      // 6. 不良率分析
      {
        intent_name: '不良率,测试不良,检测不良,NG率,失败率',
        description: '分析测试不良率情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          supplier_name as 供应商,
          COUNT(*) as 总测试数,
          COUNT(CASE WHEN test_result IN ('NG', '不合格') THEN 1 END) as 不良数量,
          ROUND(COUNT(CASE WHEN test_result IN ('NG', '不合格') THEN 1 END) * 100.0 / COUNT(*), 2) as 不良率百分比,
          GROUP_CONCAT(DISTINCT CASE WHEN test_result IN ('NG', '不合格') THEN defect_desc END SEPARATOR '; ') as 主要不良现象
        FROM lab_tests 
        WHERE test_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY supplier_name 
        HAVING COUNT(*) > 0
        ORDER BY 不良率百分比 DESC
        LIMIT 10`,
        parameters: JSON.stringify([]),
        example_query: '最近的测试不良率情况如何？',
        status: 'active'
      },
      
      // 7. 测试项目分析
      {
        intent_name: '测试项目,检测项目,测试类型,检测类型',
        description: '分析特定测试项目的结果',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          test_item as 测试项目,
          COUNT(*) as 测试总数,
          COUNT(CASE WHEN test_result = 'OK' THEN 1 END) as 合格数量,
          COUNT(CASE WHEN test_result IN ('NG', '不合格') THEN 1 END) as 不合格数量,
          ROUND(COUNT(CASE WHEN test_result = 'OK' THEN 1 END) * 100.0 / COUNT(*), 2) as 合格率,
          GROUP_CONCAT(DISTINCT supplier_name ORDER BY supplier_name SEPARATOR ', ') as 涉及供应商
        FROM lab_tests 
        WHERE test_item LIKE CONCAT('%', ?, '%')
        GROUP BY test_item 
        ORDER BY 测试总数 DESC`,
        parameters: JSON.stringify([{
          name: 'test_item',
          type: 'string',
          description: '测试项目关键词'
        }]),
        example_query: '电阻测试的情况如何？',
        status: 'active'
      },
      
      // ========== 产线上线跟踪场景 ==========
      
      // 8. 工厂产线使用情况
      {
        intent_name: '工厂使用,产线使用,工厂情况,产线情况,生产情况',
        description: '查询工厂产线使用情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          factory as 工厂,
          line as 产线,
          COUNT(DISTINCT batch_code) as 使用批次数,
          COUNT(DISTINCT material_code) as 使用物料种类,
          AVG(defect_rate * 100) as 平均不良率,
          SUM(exception_count) as 总异常次数,
          GROUP_CONCAT(DISTINCT supplier_name ORDER BY supplier_name SEPARATOR ', ') as 涉及供应商,
          DATE_FORMAT(MAX(online_date), '%Y-%m-%d') as 最近上线日期
        FROM online_tracking 
        WHERE factory = ? 
        GROUP BY factory, line 
        ORDER BY 平均不良率 DESC`,
        parameters: JSON.stringify([{
          name: 'factory',
          type: 'string',
          description: '工厂名称'
        }]),
        example_query: '查询深圳工厂的使用情况',
        status: 'active'
      },
      
      // 9. 异常分析
      {
        intent_name: '异常情况,异常分析,问题分析,故障分析,异常统计',
        description: '综合分析异常情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          '库存异常' as 异常类型,
          material_name as 物料名称,
          batch_code as 批次号,
          supplier_name as 供应商,
          status as 状态,
          notes as 异常描述,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 发生日期
        FROM inventory 
        WHERE status IN ('异常', '风险') OR risk_level = 'high'
        UNION ALL
        SELECT 
          '测试异常' as 异常类型,
          material_name,
          batch_code,
          supplier_name,
          test_result as 状态,
          CONCAT(test_item, ': ', COALESCE(defect_desc, '未知异常')) as 异常描述,
          DATE_FORMAT(test_date, '%Y-%m-%d') as 发生日期
        FROM lab_tests 
        WHERE test_result IN ('NG', '不合格')
        UNION ALL
        SELECT 
          '产线异常' as 异常类型,
          material_name,
          batch_code,
          supplier_name,
          CONCAT(factory, '-', line) as 状态,
          CONCAT('不良率: ', ROUND(defect_rate * 100, 2), '%, 异常次数: ', exception_count) as 异常描述,
          DATE_FORMAT(online_date, '%Y-%m-%d') as 发生日期
        FROM online_tracking 
        WHERE defect_rate > 0.05 OR exception_count > 0
        ORDER BY 发生日期 DESC
        LIMIT 20`,
        parameters: JSON.stringify([]),
        example_query: '目前有哪些异常情况？',
        status: 'active'
      },
      
      // 10. 质量趋势分析
      {
        intent_name: '质量趋势,趋势分析,质量变化,性能趋势',
        description: '分析质量趋势变化',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          DATE_FORMAT(test_date, '%Y-%m') as 月份,
          COUNT(*) as 测试总数,
          COUNT(CASE WHEN test_result = 'OK' THEN 1 END) as 合格数,
          ROUND(COUNT(CASE WHEN test_result = 'OK' THEN 1 END) * 100.0 / COUNT(*), 2) as 合格率,
          COUNT(DISTINCT supplier_name) as 供应商数量,
          COUNT(DISTINCT material_code) as 物料种类数
        FROM lab_tests 
        WHERE test_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(test_date, '%Y-%m')
        ORDER BY 月份 DESC`,
        parameters: JSON.stringify([]),
        example_query: '最近几个月的质量趋势如何？',
        status: 'active'
      }
    ];
    
    // 插入增强规则
    for (const rule of enhancedRules) {
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
    
    console.log(`✅ 成功插入 ${enhancedRules.length} 条增强规则`);
    
    // 验证插入结果
    const [rules] = await connection.query('SELECT intent_name, description FROM nlp_intent_rules WHERE status = "active"');
    console.log('\n📋 当前活跃的增强NLP规则:');
    rules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.intent_name} - ${rule.description}`);
    });
    
    await connection.end();
    console.log('\n🎉 增强NLP规则创建完成！');
    
  } catch (error) {
    console.error('❌ 创建增强NLP规则失败:', error);
    process.exit(1);
  }
}

createEnhancedNlpRules();
