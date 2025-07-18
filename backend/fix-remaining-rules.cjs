// 修复剩余的有问题的规则
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixRemainingRules() {
  try {
    console.log('🔧 修复剩余的有问题的规则...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 查找所有仍有问题的规则
    console.log('📊 1. 查找仍有问题的规则:');
    const [problemRules] = await connection.execute(`
      SELECT id, intent_name, action_target, trigger_words 
      FROM nlp_intent_rules 
      WHERE action_target = 'production_data' 
      OR action_target LIKE '%production_data%'
      OR action_target = ''
      OR action_target IS NULL
      ORDER BY id
    `);
    
    console.log(`找到 ${problemRules.length} 条仍有问题的规则`);
    
    // 2. 为每个规则生成正确的SQL
    for (const rule of problemRules) {
      console.log(`\n修复规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`触发词: ${rule.trigger_words}`);
      
      let newSQL = '';
      const triggerWords = (rule.trigger_words || '').toString().toLowerCase();
      const intentName = (rule.intent_name || '').toString().toLowerCase();
      
      // 根据规则名称和触发词确定查询类型
      if (intentName.includes('检验') || intentName.includes('测试') || triggerWords.includes('检验') || triggerWords.includes('测试') || triggerWords.includes('检测')) {
        // 检验相关查询
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
      } else if (intentName.includes('上线') || intentName.includes('生产') || triggerWords.includes('上线') || triggerWords.includes('生产')) {
        // 上线生产相关查询
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
        // 默认库存查询
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
      } else if (triggerWords.includes('聚龙')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%聚龙%' AND");
      }
      
      // 清理SQL格式
      newSQL = newSQL.trim().replace(/\s+/g, ' ');
      
      // 更新规则
      try {
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ? 
          WHERE id = ?
        `, [newSQL, rule.id]);
        
        console.log(`✅ 规则 ${rule.id} SQL已更新`);
        
        // 测试新SQL
        try {
          const [testResults] = await connection.execute(newSQL);
          console.log(`   测试结果: ${testResults.length} 条数据`);
        } catch (testError) {
          console.log(`   ⚠️ SQL测试失败: ${testError.message}`);
        }
      } catch (updateError) {
        console.log(`❌ 规则 ${rule.id} 更新失败: ${updateError.message}`);
      }
    }
    
    // 3. 最终验证
    console.log('\n✅ 3. 最终验证所有规则:');
    const [allActiveRules] = await connection.execute(`
      SELECT id, intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      ORDER BY priority DESC 
      LIMIT 10
    `);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const rule of allActiveRules) {
      try {
        const [results] = await connection.execute(rule.action_target);
        console.log(`✅ 规则 ${rule.id}: ${results.length} 条数据`);
        successCount++;
      } catch (error) {
        console.log(`❌ 规则 ${rule.id}: ${error.message.substring(0, 100)}...`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 验证结果: ${successCount} 个成功, ${errorCount} 个失败`);
    
    await connection.end();
    console.log('\n🎉 剩余规则修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixRemainingRules().catch(console.error);
