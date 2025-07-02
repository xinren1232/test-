/**
 * 全面的NLP规则 - 基于数据字段深度分析的完整场景覆盖
 * 覆盖三个业务场景的所有字段和业务逻辑
 */
import mysql from 'mysql2/promise';

async function createComprehensiveNlpRules() {
  console.log('🚀 创建全面的NLP规则 - 完整场景覆盖...');
  
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
    
    // 全面的NLP规则 - 按业务场景和字段维度设计
    const comprehensiveRules = [
      
      // ========== 库存管理场景 (inventory表) ==========
      
      // 1. 基础库存查询 - 按物料编码
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
          storage_location as 存储位置,
          status as 状态,
          risk_level as 风险等级,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
          inspector as 检验员,
          notes as 备注
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
        intent_name: '查询批次库存,批次查询,批次库存,批次信息',
        description: '查询特定批次的库存信息',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          batch_code as 批次号,
          material_code as 物料编码,
          material_name as 物料名称,
          material_type as 物料类型,
          supplier_name as 供应商,
          quantity as 数量,
          storage_location as 存储位置,
          status as 状态,
          risk_level as 风险等级,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
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
      
      // 3. 风险库存分析
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
      
      // 4. 供应商库存分析
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
      
      // 5. 库位查询
      {
        intent_name: '库位查询,仓库查询,存储位置,库位信息',
        description: '查询特定库位的物料信息',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          storage_location as 库位,
          COUNT(*) as 物料种类数,
          SUM(quantity) as 总数量,
          GROUP_CONCAT(DISTINCT CONCAT(material_name, '(', batch_code, ')') SEPARATOR ', ') as 物料详情,
          GROUP_CONCAT(DISTINCT supplier_name SEPARATOR ', ') as 涉及供应商
        FROM inventory 
        WHERE storage_location LIKE CONCAT('%', ?, '%')
        GROUP BY storage_location
        ORDER BY 总数量 DESC`,
        parameters: JSON.stringify([{
          name: 'storage_location',
          type: 'string',
          description: '库位关键词'
        }]),
        example_query: '仓库A有哪些物料？',
        status: 'active'
      },
      
      // 6. 物料类型统计
      {
        intent_name: '物料类型,类型统计,物料分类,类型分析',
        description: '按物料类型统计库存情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          material_type as 物料类型,
          COUNT(*) as 批次数量,
          COUNT(DISTINCT material_code) as 物料种类数,
          SUM(quantity) as 总库存量,
          COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as 高风险批次数,
          ROUND(AVG(quantity), 2) as 平均库存量,
          GROUP_CONCAT(DISTINCT supplier_name SEPARATOR ', ') as 主要供应商
        FROM inventory 
        WHERE material_type IS NOT NULL
        GROUP BY material_type 
        ORDER BY 总库存量 DESC`,
        parameters: JSON.stringify([]),
        example_query: '各种物料类型的库存情况如何？',
        status: 'active'
      },
      
      // 7. 检验员工作量统计
      {
        intent_name: '检验员统计,检验员工作量,检验员情况',
        description: '统计检验员的工作量',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          inspector as 检验员,
          COUNT(*) as 检验批次数,
          COUNT(DISTINCT material_code) as 检验物料种类,
          SUM(quantity) as 检验总数量,
          COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as 高风险批次数,
          COUNT(CASE WHEN status = '异常' THEN 1 END) as 异常批次数,
          ROUND(COUNT(CASE WHEN risk_level = 'high' THEN 1 END) * 100.0 / COUNT(*), 2) as 高风险率
        FROM inventory 
        WHERE inspector IS NOT NULL
        GROUP BY inspector 
        ORDER BY 检验批次数 DESC`,
        parameters: JSON.stringify([]),
        example_query: '各个检验员的工作量如何？',
        status: 'active'
      },
      
      // 8. 库存状态分析
      {
        intent_name: '库存状态,状态统计,库存分析,状态分析',
        description: '按状态统计库存情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          status as 状态,
          COUNT(*) as 批次数量,
          SUM(quantity) as 总数量,
          COUNT(DISTINCT material_code) as 物料种类数,
          COUNT(DISTINCT supplier_name) as 供应商数量,
          ROUND(AVG(quantity), 2) as 平均数量,
          GROUP_CONCAT(DISTINCT material_type SEPARATOR ', ') as 涉及物料类型
        FROM inventory 
        WHERE status IS NOT NULL
        GROUP BY status 
        ORDER BY 批次数量 DESC`,
        parameters: JSON.stringify([]),
        example_query: '各种状态的库存分布如何？',
        status: 'active'
      },
      
      // ========== 实验室测试场景 (lab_tests表) ==========
      
      // 9. 测试结果查询
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
      
      // 10. 测试项目分析
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
          COUNT(DISTINCT supplier_name) as 涉及供应商数,
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

      // 11. 不良率分析
      {
        intent_name: '不良率,测试不良,检测不良,NG率,失败率',
        description: '分析测试不良率情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT
          supplier_name as 供应商,
          COUNT(*) as 总测试数,
          COUNT(CASE WHEN test_result IN ('NG', '不合格') THEN 1 END) as 不良数量,
          ROUND(COUNT(CASE WHEN test_result IN ('NG', '不合格') THEN 1 END) * 100.0 / COUNT(*), 2) as 不良率百分比,
          COUNT(DISTINCT test_item) as 测试项目数,
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

      // 12. 测试员工作量统计
      {
        intent_name: '测试员统计,测试员工作量,测试员情况',
        description: '统计测试员的工作量',
        action_type: 'SQL_QUERY',
        action_target: `SELECT
          tester as 测试员,
          COUNT(*) as 测试次数,
          COUNT(DISTINCT batch_code) as 测试批次数,
          COUNT(DISTINCT material_code) as 测试物料种类,
          COUNT(CASE WHEN test_result = 'OK' THEN 1 END) as 合格次数,
          COUNT(CASE WHEN test_result IN ('NG', '不合格') THEN 1 END) as 不合格次数,
          ROUND(COUNT(CASE WHEN test_result = 'OK' THEN 1 END) * 100.0 / COUNT(*), 2) as 合格率,
          GROUP_CONCAT(DISTINCT test_item SEPARATOR ', ') as 测试项目
        FROM lab_tests
        WHERE tester IS NOT NULL
        GROUP BY tester
        ORDER BY 测试次数 DESC`,
        parameters: JSON.stringify([]),
        example_query: '各个测试员的工作量如何？',
        status: 'active'
      },

      // 13. 质量趋势分析
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
          COUNT(DISTINCT material_code) as 物料种类数,
          COUNT(DISTINCT test_item) as 测试项目数
        FROM lab_tests
        WHERE test_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(test_date, '%Y-%m')
        ORDER BY 月份 DESC`,
        parameters: JSON.stringify([]),
        example_query: '最近几个月的质量趋势如何？',
        status: 'active'
      },

      // ========== 产线上线场景 (online_tracking表) ==========

      // 14. 工厂产线使用情况
      {
        intent_name: '工厂使用,产线使用,工厂情况,产线情况,生产情况',
        description: '查询工厂产线使用情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT
          factory as 工厂,
          line as 产线,
          COUNT(DISTINCT batch_code) as 使用批次数,
          COUNT(DISTINCT material_code) as 使用物料种类,
          ROUND(AVG(defect_rate * 100), 2) as 平均不良率,
          SUM(exception_count) as 总异常次数,
          COUNT(DISTINCT project) as 涉及项目数,
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

      // 15. 产线效率分析
      {
        intent_name: '产线效率,效率分析,产线性能,生产效率',
        description: '分析产线效率情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT
          CONCAT(factory, '-', line) as 产线,
          COUNT(*) as 上线次数,
          COUNT(DISTINCT batch_code) as 使用批次数,
          ROUND(AVG(defect_rate * 100), 2) as 平均不良率,
          ROUND(AVG(exception_count), 2) as 平均异常次数,
          COUNT(DISTINCT project) as 项目数量,
          COUNT(DISTINCT operator) as 操作员数量,
          CASE
            WHEN AVG(defect_rate) < 0.02 THEN '优秀'
            WHEN AVG(defect_rate) < 0.05 THEN '良好'
            WHEN AVG(defect_rate) < 0.10 THEN '一般'
            ELSE '需改进'
          END as 效率等级
        FROM online_tracking
        GROUP BY factory, line
        ORDER BY 平均不良率 ASC`,
        parameters: JSON.stringify([]),
        example_query: '各产线的效率情况如何？',
        status: 'active'
      },

      // 16. 项目使用分析
      {
        intent_name: '项目使用,项目分析,项目情况,项目统计',
        description: '分析项目使用物料情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT
          project as 项目,
          COUNT(DISTINCT batch_code) as 使用批次数,
          COUNT(DISTINCT material_code) as 使用物料种类,
          COUNT(DISTINCT factory) as 涉及工厂数,
          ROUND(AVG(defect_rate * 100), 2) as 平均不良率,
          SUM(exception_count) as 总异常次数,
          GROUP_CONCAT(DISTINCT CONCAT(factory, '-', line) SEPARATOR ', ') as 使用产线,
          DATE_FORMAT(MIN(online_date), '%Y-%m-%d') as 开始日期,
          DATE_FORMAT(MAX(online_date), '%Y-%m-%d') as 最近日期
        FROM online_tracking
        WHERE project IS NOT NULL
        GROUP BY project
        ORDER BY 使用批次数 DESC`,
        parameters: JSON.stringify([]),
        example_query: '各个项目的物料使用情况如何？',
        status: 'active'
      },

      // 17. 操作员工作分析
      {
        intent_name: '操作员统计,操作员工作量,操作员情况',
        description: '统计操作员的工作情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT
          operator as 操作员,
          COUNT(*) as 操作次数,
          COUNT(DISTINCT batch_code) as 操作批次数,
          COUNT(DISTINCT CONCAT(factory, '-', line)) as 操作产线数,
          ROUND(AVG(defect_rate * 100), 2) as 平均不良率,
          SUM(exception_count) as 总异常次数,
          COUNT(DISTINCT project) as 涉及项目数,
          CASE
            WHEN AVG(defect_rate) < 0.02 THEN '优秀'
            WHEN AVG(defect_rate) < 0.05 THEN '良好'
            WHEN AVG(defect_rate) < 0.10 THEN '一般'
            ELSE '需改进'
          END as 操作水平
        FROM online_tracking
        WHERE operator IS NOT NULL
        GROUP BY operator
        ORDER BY 操作次数 DESC`,
        parameters: JSON.stringify([]),
        example_query: '各个操作员的工作情况如何？',
        status: 'active'
      },

      // ========== 跨场景综合分析 ==========

      // 18. 异常综合分析
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

      // 19. 批次全生命周期跟踪
      {
        intent_name: '批次跟踪,批次全信息,批次生命周期,批次详情,全流程跟踪',
        description: '查询批次的完整生命周期信息',
        action_type: 'SQL_QUERY',
        action_target: `SELECT
          '📦 库存信息' as 阶段,
          i.batch_code as 批次号,
          i.material_name as 物料名称,
          i.supplier_name as 供应商,
          CONCAT(i.quantity, '件') as 数量状态,
          i.status as 当前状态,
          i.risk_level as 风险等级,
          i.inspector as 负责人,
          DATE_FORMAT(i.inbound_time, '%Y-%m-%d') as 相关日期
        FROM inventory i
        WHERE i.batch_code = ?
        UNION ALL
        SELECT
          '🧪 测试信息' as 阶段,
          lt.batch_code,
          lt.test_item as 测试项目,
          lt.test_result as 测试结果,
          lt.conclusion as 结论,
          COALESCE(lt.defect_desc, '无') as 缺陷描述,
          lt.tester as 负责人,
          DATE_FORMAT(lt.test_date, '%Y-%m-%d') as 相关日期
        FROM lab_tests lt
        WHERE lt.batch_code = ?
        UNION ALL
        SELECT
          '🏭 上线信息' as 阶段,
          ot.batch_code,
          ot.factory as 工厂,
          ot.line as 产线,
          CONCAT(ROUND(ot.defect_rate * 100, 2), '%') as 不良率,
          CONCAT(ot.exception_count, '次') as 异常次数,
          ot.operator as 负责人,
          DATE_FORMAT(ot.online_date, '%Y-%m-%d') as 相关日期
        FROM online_tracking ot
        WHERE ot.batch_code = ?
        ORDER BY 相关日期 DESC`,
        parameters: JSON.stringify([
          { name: 'batch_code', type: 'string', description: '批次号' },
          { name: 'batch_code', type: 'string', description: '批次号' },
          { name: 'batch_code', type: 'string', description: '批次号' }
        ]),
        example_query: '查询批次 BATCH001 的全生命周期信息',
        status: 'active'
      },

      // 20. 供应商综合评价
      {
        intent_name: '供应商评价,供应商质量,供应商表现,供应商分析',
        description: '综合评价供应商质量表现',
        action_type: 'SQL_QUERY',
        action_target: `SELECT
          i.supplier_name as 供应商,
          COUNT(DISTINCT i.batch_code) as 供货批次数,
          SUM(i.quantity) as 总供货量,
          COUNT(CASE WHEN i.risk_level = 'high' THEN 1 END) as 高风险批次,
          ROUND(COUNT(CASE WHEN lt.test_result = 'OK' THEN 1 END) * 100.0 / COUNT(lt.test_result), 2) as 测试合格率,
          ROUND(AVG(ot.defect_rate * 100), 2) as 平均产线不良率,
          CASE
            WHEN COUNT(CASE WHEN i.risk_level = 'high' THEN 1 END) = 0
                 AND AVG(ot.defect_rate) < 0.03
                 AND COUNT(CASE WHEN lt.test_result = 'OK' THEN 1 END) * 100.0 / COUNT(lt.test_result) > 95
            THEN '优秀供应商'
            WHEN AVG(ot.defect_rate) < 0.05
                 AND COUNT(CASE WHEN lt.test_result = 'OK' THEN 1 END) * 100.0 / COUNT(lt.test_result) > 90
            THEN '良好供应商'
            ELSE '需改进供应商'
          END as 综合评价
        FROM inventory i
        LEFT JOIN lab_tests lt ON i.batch_code = lt.batch_code
        LEFT JOIN online_tracking ot ON i.batch_code = ot.batch_code
        WHERE i.supplier_name = ?
        GROUP BY i.supplier_name`,
        parameters: JSON.stringify([{
          name: 'supplier_name',
          type: 'string',
          description: '供应商名称'
        }]),
        example_query: '欣旺达供应商的综合质量表现如何？',
        status: 'active'
      },

      // 21. 物料质量档案
      {
        intent_name: '物料档案,物料质量,物料历史,物料表现',
        description: '查询物料的质量档案',
        action_type: 'SQL_QUERY',
        action_target: `SELECT
          i.material_code as 物料编码,
          i.material_name as 物料名称,
          COUNT(DISTINCT i.batch_code) as 历史批次数,
          COUNT(DISTINCT i.supplier_name) as 供应商数量,
          SUM(i.quantity) as 累计数量,
          COUNT(CASE WHEN i.risk_level = 'high' THEN 1 END) as 高风险批次,
          ROUND(COUNT(CASE WHEN lt.test_result = 'OK' THEN 1 END) * 100.0 / COUNT(lt.test_result), 2) as 测试合格率,
          ROUND(AVG(ot.defect_rate * 100), 2) as 平均产线不良率,
          COUNT(DISTINCT ot.factory) as 使用工厂数,
          GROUP_CONCAT(DISTINCT i.supplier_name SEPARATOR ', ') as 供应商列表
        FROM inventory i
        LEFT JOIN lab_tests lt ON i.batch_code = lt.batch_code
        LEFT JOIN online_tracking ot ON i.batch_code = ot.batch_code
        WHERE i.material_code = ?
        GROUP BY i.material_code, i.material_name`,
        parameters: JSON.stringify([{
          name: 'material_code',
          type: 'string',
          description: '物料编码'
        }]),
        example_query: '物料 M12345 的质量档案如何？',
        status: 'active'
      },

      // 22. 时间段分析
      {
        intent_name: '时间段分析,时间统计,时间趋势,时间对比',
        description: '按时间段分析质量情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT
          DATE_FORMAT(i.inbound_time, '%Y-%m') as 月份,
          COUNT(DISTINCT i.batch_code) as 入库批次数,
          SUM(i.quantity) as 入库总量,
          COUNT(CASE WHEN i.risk_level = 'high' THEN 1 END) as 高风险批次,
          COUNT(CASE WHEN lt.test_result = 'OK' THEN 1 END) as 测试合格数,
          COUNT(lt.test_result) as 测试总数,
          ROUND(COUNT(CASE WHEN lt.test_result = 'OK' THEN 1 END) * 100.0 / COUNT(lt.test_result), 2) as 合格率,
          ROUND(AVG(ot.defect_rate * 100), 2) as 平均不良率
        FROM inventory i
        LEFT JOIN lab_tests lt ON i.batch_code = lt.batch_code
        LEFT JOIN online_tracking ot ON i.batch_code = ot.batch_code
        WHERE i.inbound_time >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(i.inbound_time, '%Y-%m')
        ORDER BY 月份 DESC`,
        parameters: JSON.stringify([]),
        example_query: '最近几个月的质量情况趋势如何？',
        status: 'active'
      },

      // 23. 车间工作分析
      {
        intent_name: '车间分析,车间情况,车间统计,车间工作量',
        description: '分析车间工作情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT
          CONCAT(factory, '-', workshop) as 车间,
          COUNT(*) as 作业次数,
          COUNT(DISTINCT batch_code) as 使用批次数,
          COUNT(DISTINCT line) as 产线数量,
          COUNT(DISTINCT operator) as 操作员数量,
          ROUND(AVG(defect_rate * 100), 2) as 平均不良率,
          SUM(exception_count) as 总异常次数,
          COUNT(DISTINCT project) as 涉及项目数
        FROM online_tracking
        WHERE workshop IS NOT NULL
        GROUP BY factory, workshop
        ORDER BY 作业次数 DESC`,
        parameters: JSON.stringify([]),
        example_query: '各个车间的工作情况如何？',
        status: 'active'
      },

      // 24. 库存预警分析
      {
        intent_name: '库存预警,预警分析,库存风险,预警情况',
        description: '分析库存预警情况',
        action_type: 'SQL_QUERY',
        action_target: `SELECT
          material_code as 物料编码,
          material_name as 物料名称,
          batch_code as 批次号,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          risk_level as 风险等级,
          CASE
            WHEN risk_level = 'high' THEN '🔴 高风险预警'
            WHEN status = '异常' THEN '🟡 状态异常预警'
            WHEN DATEDIFF(CURDATE(), inbound_time) > 90 THEN '🟠 库存积压预警'
            ELSE '🟢 正常'
          END as 预警类型,
          DATEDIFF(CURDATE(), inbound_time) as 库存天数,
          inspector as 检验员,
          notes as 备注
        FROM inventory
        WHERE risk_level = 'high'
           OR status = '异常'
           OR DATEDIFF(CURDATE(), inbound_time) > 90
        ORDER BY
          CASE risk_level WHEN 'high' THEN 1 ELSE 2 END,
          DATEDIFF(CURDATE(), inbound_time) DESC`,
        parameters: JSON.stringify([]),
        example_query: '目前有哪些库存预警？',
        status: 'active'
      },

      // 25. 综合质量报告
      {
        intent_name: '质量报告,综合报告,质量总结,整体情况',
        description: '生成综合质量报告',
        action_type: 'SQL_QUERY',
        action_target: `SELECT
          '📊 库存概况' as 类别,
          CONCAT('总批次: ', COUNT(DISTINCT i.batch_code),
                 ', 总数量: ', SUM(i.quantity),
                 ', 高风险: ', COUNT(CASE WHEN i.risk_level = 'high' THEN 1 END)) as 统计信息
        FROM inventory i
        UNION ALL
        SELECT
          '🧪 测试概况' as 类别,
          CONCAT('总测试: ', COUNT(*),
                 ', 合格率: ', ROUND(COUNT(CASE WHEN test_result = 'OK' THEN 1 END) * 100.0 / COUNT(*), 2), '%',
                 ', 不良数: ', COUNT(CASE WHEN test_result IN ('NG', '不合格') THEN 1 END)) as 统计信息
        FROM lab_tests
        UNION ALL
        SELECT
          '🏭 产线概况' as 类别,
          CONCAT('上线批次: ', COUNT(DISTINCT batch_code),
                 ', 平均不良率: ', ROUND(AVG(defect_rate * 100), 2), '%',
                 ', 总异常: ', SUM(exception_count)) as 统计信息
        FROM online_tracking`,
        parameters: JSON.stringify([]),
        example_query: '给我一个综合质量报告',
        status: 'active'
      }
    ];
    
    // 插入规则
    for (const rule of comprehensiveRules) {
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
    
    console.log(`✅ 成功插入 ${comprehensiveRules.length} 条基础规则`);
    
    await connection.end();
    console.log('\n🎉 基础NLP规则创建完成！');
    
  } catch (error) {
    console.error('❌ 创建NLP规则失败:', error);
    process.exit(1);
  }
}

createComprehensiveNlpRules();
