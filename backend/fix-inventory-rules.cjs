// 修复库存相关规则
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixInventoryRules() {
  try {
    console.log('🔧 修复库存相关规则...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 查找所有库存相关的错误规则
    console.log('📊 1. 查找库存相关的错误规则:');
    const [inventoryRules] = await connection.execute(`
      SELECT id, intent_name, action_target, trigger_words 
      FROM nlp_intent_rules 
      WHERE (action_target LIKE '%inventory_data%' 
      OR action_target LIKE '%lab_data%'
      OR action_target LIKE '%test_data%'
      OR action_target = 'inventory_data'
      OR action_target = 'lab_data'
      OR action_target = 'test_data')
      AND status = 'active'
      ORDER BY id
    `);
    
    console.log(`找到 ${inventoryRules.length} 条库存相关的错误规则`);
    
    // 2. 为每个规则生成正确的SQL
    for (const rule of inventoryRules) {
      console.log(`\n修复规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`触发词: ${rule.trigger_words}`);
      
      let newSQL = '';
      const triggerWords = (rule.trigger_words || '').toString().toLowerCase();
      const intentName = (rule.intent_name || '').toString().toLowerCase();
      
      // 根据规则类型生成SQL
      if (intentName.includes('检验') || intentName.includes('测试') || intentName.includes('lab')) {
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
      } else {
        // 库存相关查询
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
      } else if (triggerWords.includes('聚龙')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%聚龙%' AND");
      } else if (triggerWords.includes('欣冠')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%欣冠%' AND");
      } else if (triggerWords.includes('广正')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%广正%' AND");
      }
      
      // 根据物料类型添加过滤条件
      if (triggerWords.includes('电池')) {
        newSQL = newSQL.replace('WHERE', "WHERE material_name LIKE '%电池%' AND");
      } else if (triggerWords.includes('显示屏')) {
        newSQL = newSQL.replace('WHERE', "WHERE material_name LIKE '%显示屏%' AND");
      } else if (triggerWords.includes('摄像头')) {
        newSQL = newSQL.replace('WHERE', "WHERE material_name LIKE '%摄像头%' AND");
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
          if (testResults.length > 0) {
            console.log(`   字段: ${Object.keys(testResults[0]).join(', ')}`);
          }
        } catch (testError) {
          console.log(`   ⚠️ SQL测试失败: ${testError.message}`);
        }
      } catch (updateError) {
        console.log(`❌ 规则 ${rule.id} 更新失败: ${updateError.message}`);
      }
    }
    
    // 3. 测试几个关键查询
    console.log('\n🧪 3. 测试关键查询:');
    
    const testCases = [
      { query: '聚龙供应商', desc: '聚龙供应商查询' },
      { query: '库存查询', desc: '库存查询' },
      { query: '全测试', desc: '全测试查询' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n测试: ${testCase.desc}`);
      
      const [rules] = await connection.execute(`
        SELECT id, intent_name, action_target
        FROM nlp_intent_rules 
        WHERE status = 'active' 
        AND (trigger_words LIKE ? OR intent_name LIKE ?)
        ORDER BY priority DESC
        LIMIT 1
      `, [`%${testCase.query}%`, `%${testCase.query}%`]);
      
      if (rules.length > 0) {
        const rule = rules[0];
        console.log(`✅ 找到规则: ${rule.intent_name}`);
        
        try {
          const [results] = await connection.execute(rule.action_target);
          console.log(`✅ 查询成功: ${results.length} 条数据`);
        } catch (error) {
          console.log(`❌ 查询失败: ${error.message}`);
        }
      } else {
        console.log(`❌ 未找到匹配规则`);
      }
    }
    
    await connection.end();
    console.log('\n🎉 库存规则修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixInventoryRules().catch(console.error);
