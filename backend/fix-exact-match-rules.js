import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixExactMatchRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 修改规则为精准匹配...\n');
    
    // 1. 修改在线跟踪查询规则 - 精准匹配
    console.log('1. 修改在线跟踪查询规则...');
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = '
SELECT
  material_name as 物料名称,
  supplier_name as 供应商,
  line as 生产线,
  project as 项目,
  DATE_FORMAT(online_date, \\'%Y-%m-%d\\') as 上线日期,
  factory as 工厂,
  workshop as 车间,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), \\'%\\') as 不良率,
  exception_count as 异常次数
FROM online_tracking
WHERE material_name = COALESCE(?, \\'\\')
ORDER BY online_date DESC
LIMIT 10'
      WHERE intent_name = '在线跟踪查询'
    `);
    
    // 2. 修改物料库存信息查询规则 - 精准匹配
    console.log('2. 修改物料库存信息查询规则...');
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = '
SELECT 
  factory as 工厂,
  warehouse as 仓库,
  material_type as 物料类型,
  supplier_name as 供应商名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, \\'%Y-%m-%d\\') as 入库时间,
  DATE_FORMAT(expiry_date, \\'%Y-%m-%d\\') as 到期时间,
  notes as 备注
FROM inventory 
WHERE material_name = COALESCE(?, \\'\\')
ORDER BY inbound_time DESC
LIMIT 10'
      WHERE intent_name = '物料库存信息查询'
    `);
    
    // 3. 修改物料测试情况查询规则 - 精准匹配
    console.log('3. 修改物料测试情况查询规则...');
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = '
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, \\'%Y-%m-%d\\') as 日期,
  project as 项目,
  baseline as 基线,
  material_type as 物料类型,
  CASE 
    WHEN test_result = \\'OK\\' THEN \\'1次OK\\'
    WHEN test_result = \\'NG\\' THEN \\'1次NG\\'
    ELSE test_result
  END as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  defect_description as 不合格描述,
  notes as 备注
FROM test_tracking 
WHERE material_name = COALESCE(?, \\'\\')
ORDER BY test_date DESC
LIMIT 10'
      WHERE intent_name = '物料测试情况查询'
    `);
    
    // 4. 修改供应商物料查询规则 - 精准匹配
    console.log('4. 修改供应商物料查询规则...');
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = '
SELECT 
  factory as 工厂,
  warehouse as 仓库,
  material_type as 物料类型,
  supplier_name as 供应商名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, \\'%Y-%m-%d\\') as 入库时间,
  DATE_FORMAT(expiry_date, \\'%Y-%m-%d\\') as 到期时间,
  notes as 备注
FROM inventory 
WHERE supplier_name = COALESCE(?, \\'\\')
ORDER BY inbound_time DESC
LIMIT 10'
      WHERE intent_name = '供应商物料查询'
    `);
    
    console.log('\n🎯 精准匹配修改完成！');
    console.log('\n📋 修改说明:');
    console.log('1. 在线跟踪查询 - 现在使用精准匹配 (material_name = ?)');
    console.log('2. 物料库存信息查询 - 现在使用精准匹配 (material_name = ?)');
    console.log('3. 物料测试情况查询 - 现在使用精准匹配 (material_name = ?)');
    console.log('4. 供应商物料查询 - 现在使用精准匹配 (supplier_name = ?)');
    
    // 验证修改结果
    console.log('\n🧪 验证修改结果...');
    const [updatedRules] = await connection.execute(`
      SELECT intent_name, action_target
      FROM nlp_intent_rules 
      WHERE intent_name IN ('在线跟踪查询', '物料库存信息查询', '物料测试情况查询', '供应商物料查询')
    `);
    
    updatedRules.forEach(rule => {
      const isExactMatch = rule.action_target.includes('material_name = COALESCE') || rule.action_target.includes('supplier_name = COALESCE');
      console.log(`✅ ${rule.intent_name}: ${isExactMatch ? '精准匹配' : '模糊匹配'}`);
    });
    
  } catch (error) {
    console.error('❌ 修改失败:', error);
  } finally {
    await connection.end();
  }
}

fixExactMatchRules();
