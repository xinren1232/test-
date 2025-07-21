import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function finalFixAllRules() {
  console.log('🔧 最终修复所有规则的SQL模板...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 删除所有有问题的规则，重新创建标准规则
    console.log('1. 清理有问题的规则...');
    
    // 删除所有包含错误的规则
    await connection.execute(`
      DELETE FROM nlp_intent_rules 
      WHERE (action_target LIKE '%?%' 
         OR action_target LIKE '%supplier%' AND action_target NOT LIKE '%supplier_name%'
         OR action_target LIKE '%lastUpdateTime%'
         OR action_target LIKE '%CONCAT%')
      AND status = 'active'
    `);
    
    console.log('   ✅ 清理完成');

    // 2. 创建标准的规则模板
    console.log('2. 创建标准规则...');
    
    const standardRules = [
      {
        intent_name: '物料库存信息查询_优化',
        keywords: '库存,inventory,物料库存',
        action_target: `
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
FROM inventory 
WHERE 1=1
ORDER BY inbound_time DESC 
LIMIT 50`,
        scenario: 'basic',
        priority: 10
      },
      {
        intent_name: '物料测试情况查询',
        keywords: '测试,test,测试情况',
        action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '') as 项目,
  COALESCE(baseline_id, '') as 基线,
  material_code as 物料编码,
  1 as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests 
WHERE 1=1
ORDER BY test_date DESC 
LIMIT 50`,
        scenario: 'basic',
        priority: 10
      },
      {
        intent_name: '物料上线情况查询',
        keywords: '上线,online,上线情况',
        action_target: `
SELECT 
  id as 跟踪编号,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 日期,
  material_name as 物料名称,
  supplier_name as 供应商,
  COALESCE(defect_rate, 0) as 不良率,
  COALESCE(exception_count, 0) as 异常次数,
  COALESCE(notes, '') as 备注
FROM online_tracking 
WHERE 1=1
ORDER BY online_date DESC 
LIMIT 50`,
        scenario: 'basic',
        priority: 10
      },
      {
        intent_name: '结构件类上线情况查询',
        keywords: '结构件,上线,结构件类',
        action_target: `
SELECT 
  id as 跟踪编号,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 日期,
  material_name as 物料名称,
  supplier_name as 供应商,
  COALESCE(defect_rate, 0) as 不良率,
  COALESCE(exception_count, 0) as 异常次数,
  COALESCE(notes, '') as 备注
FROM online_tracking 
WHERE material_name LIKE '%中框%' OR material_name LIKE '%侧键%' OR material_name LIKE '%卡托%'
ORDER BY online_date DESC 
LIMIT 50`,
        scenario: 'basic',
        priority: 15
      },
      {
        intent_name: '光学类上线情况查询',
        keywords: '光学,上线,光学类',
        action_target: `
SELECT 
  id as 跟踪编号,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 日期,
  material_name as 物料名称,
  supplier_name as 供应商,
  COALESCE(defect_rate, 0) as 不良率,
  COALESCE(exception_count, 0) as 异常次数,
  COALESCE(notes, '') as 备注
FROM online_tracking 
WHERE material_name LIKE '%显示屏%' OR material_name LIKE '%摄像头%'
ORDER BY online_date DESC 
LIMIT 50`,
        scenario: 'basic',
        priority: 15
      },
      {
        intent_name: '包装类测试情况查询',
        keywords: '包装,测试,包装类',
        action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '') as 项目,
  COALESCE(baseline_id, '') as 基线,
  material_code as 物料编码,
  1 as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests 
WHERE material_name LIKE '%包装%' OR material_name LIKE '%标签%'
ORDER BY test_date DESC 
LIMIT 50`,
        scenario: 'basic',
        priority: 15
      },
      {
        intent_name: '充电类测试情况查询',
        keywords: '充电,测试,充电类',
        action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '') as 项目,
  COALESCE(baseline_id, '') as 基线,
  material_code as 物料编码,
  1 as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests 
WHERE material_name LIKE '%充电%' OR material_name LIKE '%电池%'
ORDER BY test_date DESC 
LIMIT 50`,
        scenario: 'basic',
        priority: 15
      }
    ];

    // 插入标准规则
    for (const rule of standardRules) {
      await connection.execute(`
        INSERT INTO nlp_intent_rules (
          intent_name, keywords, action_target, scenario, priority, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())
        ON DUPLICATE KEY UPDATE
        action_target = VALUES(action_target),
        keywords = VALUES(keywords),
        updated_at = NOW()
      `, [
        rule.intent_name,
        rule.keywords,
        rule.action_target.trim(),
        rule.scenario,
        rule.priority
      ]);
      
      console.log(`   ✅ 创建规则: ${rule.intent_name}`);
    }

    // 3. 验证修复结果
    console.log('\n🧪 验证修复结果...');
    
    const [allRules] = await connection.query(`
      SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = 'active'
    `);
    
    const [problemRules] = await connection.query(`
      SELECT COUNT(*) as problems FROM nlp_intent_rules 
      WHERE (action_target LIKE '%?%' 
         OR (action_target LIKE '%supplier%' AND action_target NOT LIKE '%supplier_name%')
         OR action_target LIKE '%lastUpdateTime%')
      AND status = 'active'
    `);
    
    console.log(`✅ 总规则数: ${allRules[0].total}`);
    console.log(`✅ 问题规则数: ${problemRules[0].problems}`);
    
    if (problemRules[0].problems === 0) {
      console.log('🎉 所有SQL问题已修复！');
    } else {
      console.log(`⚠️ 仍有 ${problemRules[0].problems} 条规则存在问题`);
    }
    
    await connection.end();
    console.log('\n🎉 最终修复完成！请重启后端服务。');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

finalFixAllRules();
