import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixIntentMatching() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 修复意图匹配问题...\n');
    
    // 1. 检查当前的风险库存查询规则
    console.log('=== 检查风险库存查询规则 ===');
    const [riskRules] = await connection.execute(`
      SELECT intent_name, trigger_words, priority, action_target 
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%风险%' OR intent_name LIKE '%库存状态%'
      ORDER BY priority DESC
    `);
    
    console.log('当前风险相关规则:');
    riskRules.forEach(rule => {
      console.log(`- ${rule.intent_name} (优先级: ${rule.priority})`);
      console.log(`  触发词: ${rule.trigger_words}`);
      console.log(`  SQL: ${rule.action_target.substring(0, 100)}...`);
      console.log('');
    });
    
    // 2. 修复风险库存查询规则
    console.log('=== 修复风险库存查询规则 ===');
    
    const riskInventorySQL = `
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
WHERE status = '风险'
ORDER BY inbound_time DESC
LIMIT 20`.trim();
    
    // 更新风险库存查询规则
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = ?,
        trigger_words = ?,
        priority = 15,
        updated_at = NOW()
      WHERE intent_name = '风险库存查询'
    `, [
      riskInventorySQL,
      JSON.stringify(["风险库存", "风险状态", "风险物料", "查询风险", "风险状态的物料"])
    ]);
    
    console.log('✅ 风险库存查询规则已修复');
    
    // 3. 修复库存状态查询规则
    console.log('\n=== 修复库存状态查询规则 ===');
    
    const statusInventorySQL = `
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
WHERE status IN ('风险', '冻结', '异常')
ORDER BY 
  CASE status 
    WHEN '风险' THEN 1 
    WHEN '冻结' THEN 2 
    WHEN '异常' THEN 3 
    ELSE 4 
  END,
  inbound_time DESC
LIMIT 20`.trim();
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = ?,
        trigger_words = ?,
        priority = 12,
        updated_at = NOW()
      WHERE intent_name = '库存状态查询'
    `, [
      statusInventorySQL,
      JSON.stringify(["库存状态", "状态查询", "异常库存", "库存异常", "状态物料"])
    ]);
    
    console.log('✅ 库存状态查询规则已修复');
    
    // 4. 降低物料对比分析规则的优先级
    console.log('\n=== 调整物料对比分析规则优先级 ===');
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET 
        priority = 5,
        updated_at = NOW()
      WHERE intent_name = '物料对比分析'
    `);
    
    console.log('✅ 物料对比分析规则优先级已降低');
    
    // 5. 创建专门的风险状态查询规则
    console.log('\n=== 创建专门的风险状态查询规则 ===');
    
    // 先删除可能存在的旧规则
    await connection.execute(`
      DELETE FROM nlp_intent_rules 
      WHERE intent_name = '风险状态物料查询'
    `);
    
    const riskStatusSQL = `
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
WHERE status = '风险'
ORDER BY inbound_time DESC
LIMIT 20`.trim();
    
    await connection.execute(`
      INSERT INTO nlp_intent_rules (
        intent_name, description, action_type, action_target, 
        parameters, trigger_words, synonyms, example_query, 
        priority, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      '风险状态物料查询',
      '专门查询风险状态的物料库存信息，显示详细的库存记录',
      'SQL_QUERY',
      riskStatusSQL,
      JSON.stringify([]),
      JSON.stringify(["风险状态的物料", "查询风险状态", "风险状态物料", "风险物料查询"]),
      JSON.stringify({"风险": ["异常", "问题"], "状态": ["情况", "状况"], "物料": ["材料", "零件"]}),
      '查询风险状态的物料',
      20, // 最高优先级
      'active'
    ]);
    
    console.log('✅ 风险状态物料查询规则已创建');
    
    // 6. 验证修复结果
    console.log('\n=== 验证修复结果 ===');
    
    const [updatedRules] = await connection.execute(`
      SELECT intent_name, priority, trigger_words
      FROM nlp_intent_rules 
      WHERE intent_name IN ('风险状态物料查询', '风险库存查询', '库存状态查询', '物料对比分析')
      ORDER BY priority DESC
    `);
    
    console.log('修复后的规则优先级:');
    updatedRules.forEach(rule => {
      console.log(`- ${rule.intent_name} (优先级: ${rule.priority})`);
      const triggers = JSON.parse(rule.trigger_words || '[]');
      console.log(`  触发词: ${triggers.join(', ')}`);
    });
    
    // 7. 测试风险状态查询
    console.log('\n=== 测试风险状态查询 ===');
    
    const [testResult] = await connection.execute(riskStatusSQL);
    console.log(`✅ 风险状态查询测试成功，返回 ${testResult.length} 条记录`);
    
    if (testResult.length > 0) {
      console.log('返回字段:', Object.keys(testResult[0]).join(', '));
      console.log('第一条记录:', testResult[0]);
    }
    
    console.log('\n✅ 意图匹配修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error);
  } finally {
    await connection.end();
  }
}

fixIntentMatching();
