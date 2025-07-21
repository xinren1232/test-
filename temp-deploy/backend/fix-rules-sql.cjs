// 修复规则表中的SQL语句
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixRulesSQL() {
  try {
    console.log('🔧 修复规则表中的SQL语句...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查当前有问题的规则
    console.log('📊 1. 检查有问题的规则:');
    const [problemRules] = await connection.execute(`
      SELECT id, intent_name, action_target, trigger_words 
      FROM nlp_intent_rules 
      WHERE action_target LIKE '%production_data%' 
      OR action_target = 'production_data'
      ORDER BY id DESC
      LIMIT 10
    `);
    
    console.log(`找到 ${problemRules.length} 条有问题的规则`);
    
    // 2. 修复规则SQL - 根据规则名称和触发词生成正确的SQL
    const fixedRules = [];
    
    for (const rule of problemRules) {
      let newSQL = '';
      const triggerWords = (rule.trigger_words || '').toString().toLowerCase();
      const intentName = (rule.intent_name || '').toString().toLowerCase();
      
      // 根据规则类型生成对应的SQL
      if (triggerWords.includes('库存') || triggerWords.includes('inventory')) {
        newSQL = `
          SELECT 
            SUBSTRING_INDEX(storage_location, '-', 1) as 工厂,
            SUBSTRING_INDEX(storage_location, '-', -1) as 仓库,
            material_code as 物料编码,
            material_name as 物料名称,
            supplier_name as 供应商,
            quantity as 数量,
            status as 状态,
            DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
            COALESCE(notes, '') as 备注
          FROM inventory 
          WHERE status = '正常'
        `;
      } else if (triggerWords.includes('检验') || triggerWords.includes('测试') || triggerWords.includes('检测')) {
        newSQL = `
          SELECT 
            test_id as 测试编号,
            DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
            material_name as 物料名称,
            supplier_name as 供应商,
            test_result as 测试结果,
            conclusion as 结论,
            COALESCE(defect_desc, '') as 缺陷描述,
            tester as 测试员
          FROM lab_tests 
          WHERE test_result IS NOT NULL
        `;
      } else if (triggerWords.includes('上线') || triggerWords.includes('生产') || triggerWords.includes('tracking')) {
        newSQL = `
          SELECT 
            batch_code as 批次号,
            material_name as 物料名称,
            factory as 工厂,
            workshop as 车间,
            line as 产线,
            DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
            defect_rate as 不良率,
            exception_count as 异常数量,
            operator as 操作员
          FROM online_tracking 
          WHERE online_date IS NOT NULL
        `;
      } else {
        // 默认查询库存
        newSQL = `
          SELECT 
            material_name as 物料名称,
            supplier_name as 供应商,
            quantity as 数量,
            status as 状态
          FROM inventory 
          WHERE status = '正常'
        `;
      }
      
      // 根据供应商添加过滤条件
      if (triggerWords.includes('boe')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%BOE%' AND");
      } else if (triggerWords.includes('天马')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%天马%' AND");
      } else if (triggerWords.includes('华星')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%华星%' AND");
      } else if (triggerWords.includes('盛泰')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%盛泰%' AND");
      } else if (triggerWords.includes('天实')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%天实%' AND");
      }
      
      // 清理SQL格式
      newSQL = newSQL.trim().replace(/\s+/g, ' ');
      
      fixedRules.push({
        id: rule.id,
        intent_name: rule.intent_name,
        old_sql: rule.action_target,
        new_sql: newSQL
      });
    }
    
    // 3. 更新规则
    console.log('\n🔧 2. 更新规则SQL:');
    for (const rule of fixedRules) {
      try {
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ? 
          WHERE id = ?
        `, [rule.new_sql, rule.id]);
        
        console.log(`✅ 规则 ${rule.id} (${rule.intent_name}) 已修复`);
        
        // 测试新SQL
        try {
          const [testResults] = await connection.execute(rule.new_sql);
          console.log(`   测试结果: ${testResults.length} 条数据`);
        } catch (testError) {
          console.log(`   ⚠️ SQL测试失败: ${testError.message}`);
        }
      } catch (updateError) {
        console.log(`❌ 规则 ${rule.id} 更新失败: ${updateError.message}`);
      }
    }
    
    // 4. 验证修复结果
    console.log('\n✅ 3. 验证修复结果:');
    const [verifyRules] = await connection.execute(`
      SELECT id, intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      ORDER BY priority DESC 
      LIMIT 5
    `);
    
    for (const rule of verifyRules) {
      try {
        const [results] = await connection.execute(rule.action_target);
        console.log(`✅ 规则 ${rule.id}: ${results.length} 条数据`);
      } catch (error) {
        console.log(`❌ 规则 ${rule.id}: SQL错误 - ${error.message}`);
      }
    }
    
    await connection.end();
    console.log('\n🎉 规则SQL修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixRulesSQL().catch(console.error);
