import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function optimizeAllRulesFieldMapping() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 系统性优化所有规则的字段映射...\n');
    
    // 定义4个标准页面的字段映射SQL模板
    const fieldMappings = {
      // 1）库存页面: 工厂、仓库、物料编码、物料名称、供应商、数量、状态、入库时间、到期时间、备注
      inventory: `
SELECT
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory`,

      // 2）上线页面: 工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注
      online: `
SELECT
  factory as 工厂,
  'Baseline-V1.0' as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(COALESCE(defect_rate, 0) * 100, 2), '%') as 不良率,
  COALESCE(exception_count, 0) as 本周异常,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking`,

      // 3）测试页面: 测试编号、日期、项目、基线、物料编码、数量、物料名称、供应商、测试结果、不合格描述、备注
      test: `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, 'Project-Test') as 项目,
  COALESCE(baseline_id, 'Baseline-V1.0') as 基线,
  material_code as 物料编码,
  100 as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests`,

      // 4）批次管理: 批次号、物料编码、物料名称、供应商、数量、入库日期、产线异常、测试异常、备注
      batch: `
SELECT
  batch_code as 批次号,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库日期,
  CASE 
    WHEN status = '风险' THEN '有异常'
    WHEN status = '冻结' THEN '有异常'
    ELSE '无异常'
  END as 产线异常,
  CASE 
    WHEN risk_level = 'HIGH' THEN '有异常'
    WHEN risk_level = 'MEDIUM' THEN '轻微异常'
    ELSE '无异常'
  END as 测试异常,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE batch_code IS NOT NULL AND batch_code != ''`
    };

    // 1. 优化基础查询规则
    console.log('=== 1. 优化基础查询规则 ===');
    
    // 库存相关规则
    const inventoryRules = [
      '物料库存查询',
      '物料库存信息查询',
      '供应商库存查询',
      '库存状态查询',
      '风险库存查询',
      '物料库存信息查询_优化',
      '供应商库存查询_优化',
      '风险状态物料查询',
      '库存状态查询_风险冻结物料',
      '电池库存查询'
    ];
    
    const inventorySQL = fieldMappings.inventory + '\nORDER BY inbound_time DESC\nLIMIT 20';
    
    for (const ruleName of inventoryRules) {
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
        [inventorySQL.trim(), ruleName]
      );
      console.log(`  ✅ 已优化库存规则: ${ruleName}`);
    }
    
    // 上线跟踪相关规则
    const onlineRules = [
      '在线跟踪查询',
      '物料上线情况查询',
      '供应商上线情况查询',
      '物料上线跟踪查询_优化',
      '批次上线情况查询_优化'
    ];
    
    const onlineSQL = fieldMappings.online + '\nORDER BY online_date DESC\nLIMIT 20';
    
    for (const ruleName of onlineRules) {
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
        [onlineSQL.trim(), ruleName]
      );
      console.log(`  ✅ 已优化上线规则: ${ruleName}`);
    }
    
    // 测试相关规则
    const testRules = [
      'NG测试结果查询',
      '测试NG情况查询',
      '物料测试情况查询',
      '批次测试情况查询',
      '供应商测试情况查询',
      '物料测试结果查询_优化',
      'NG测试结果查询_优化',
      '项目测试情况查询',
      '基线测试情况查询'
    ];
    
    const testSQL = fieldMappings.test + '\nORDER BY test_date DESC\nLIMIT 20';
    
    for (const ruleName of testRules) {
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
        [testSQL.trim(), ruleName]
      );
      console.log(`  ✅ 已优化测试规则: ${ruleName}`);
    }
    
    // 批次管理相关规则
    const batchRules = [
      '批次信息查询',
      '批次库存信息查询',
      '批次综合信息查询',
      '批次综合信息查询_优化',
      '异常批次识别',
      '异常批次识别_优化'
    ];
    
    const batchSQL = fieldMappings.batch + '\nORDER BY inbound_time DESC\nLIMIT 20';
    
    for (const ruleName of batchRules) {
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
        [batchSQL.trim(), ruleName]
      );
      console.log(`  ✅ 已优化批次管理规则: ${ruleName}`);
    }
    
    console.log('\n✅ 第一阶段：基础查询规则优化完成！');
    
  } catch (error) {
    console.error('❌ 优化过程中出错:', error);
  } finally {
    await connection.end();
  }
}

optimizeAllRulesFieldMapping();
