// 修复执行失败的规则
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixFailedRules() {
  let connection;
  try {
    console.log('🔧 修复执行失败的规则...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 获取执行失败的规则
    const failedRuleIds = [80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91];
    
    console.log(`📊 需要修复 ${failedRuleIds.length} 条失败规则\n`);
    
    for (const ruleId of failedRuleIds) {
      console.log(`🔧 修复规则 ${ruleId}:`);
      
      // 获取规则信息
      const [ruleInfo] = await connection.execute(`
        SELECT id, intent_name, action_target, trigger_words, category
        FROM nlp_intent_rules 
        WHERE id = ?
      `, [ruleId]);
      
      if (ruleInfo.length === 0) {
        console.log(`  ❌ 规则不存在`);
        continue;
      }
      
      const rule = ruleInfo[0];
      console.log(`  规则名称: ${rule.intent_name}`);
      console.log(`  类别: ${rule.category}`);
      
      let newSQL = '';
      
      // 根据规则类别和名称生成新的SQL
      if (rule.intent_name.includes('库存')) {
        // 库存相关规则
        newSQL = `
          SELECT 
            material_name as 物料名称,
            supplier_name as 供应商,
            CAST(quantity AS CHAR) as 数量,
            status as 状态,
            DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库日期,
            SUBSTRING_INDEX(storage_location, '-', 1) as 工厂
          FROM inventory 
          WHERE status = '正常'
          ORDER BY inbound_time DESC
          LIMIT 10
        `;
        
        // 根据触发词添加特定条件
        const triggerWords = (rule.trigger_words || []).join(',').toLowerCase();
        if (triggerWords.includes('聚龙')) {
          newSQL = newSQL.replace('WHERE status', "WHERE supplier_name LIKE '%聚龙%' AND status");
        } else if (triggerWords.includes('天马')) {
          newSQL = newSQL.replace('WHERE status', "WHERE supplier_name LIKE '%天马%' AND status");
        } else if (triggerWords.includes('boe')) {
          newSQL = newSQL.replace('WHERE status', "WHERE supplier_name LIKE '%BOE%' AND status");
        }
        
      } else if (rule.intent_name.includes('测试') || rule.intent_name.includes('NG')) {
        // 测试相关规则
        newSQL = `
          SELECT 
            test_id as 测试编号,
            material_name as 物料名称,
            supplier_name as 供应商,
            test_result as 测试结果,
            conclusion as 结论,
            DATE_FORMAT(test_date, '%Y-%m-%d') as 测试日期,
            tester as 测试员
          FROM lab_tests 
          ORDER BY test_date DESC
          LIMIT 10
        `;
        
        if (rule.intent_name.includes('NG')) {
          newSQL = newSQL.replace('ORDER BY', "WHERE conclusion = '不合格' ORDER BY");
        }
        
      } else if (rule.intent_name.includes('上线')) {
        // 上线相关规则
        newSQL = `
          SELECT 
            batch_code as 批次号,
            material_name as 物料名称,
            factory as 工厂,
            CAST(defect_rate AS CHAR) as 不良率,
            DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
            operator as 操作员
          FROM online_tracking 
          ORDER BY online_date DESC
          LIMIT 10
        `;
        
        if (rule.intent_name.includes('高不良率')) {
          newSQL = newSQL.replace('ORDER BY', "WHERE defect_rate > 0.05 ORDER BY");
        } else if (rule.intent_name.includes('异常')) {
          newSQL = newSQL.replace('ORDER BY', "WHERE exception_count > 0 ORDER BY");
        }
        
      } else if (rule.intent_name.includes('批次') || rule.intent_name.includes('综合')) {
        // 综合查询规则
        newSQL = `
          SELECT 
            i.material_name as 物料名称,
            i.supplier_name as 供应商,
            CAST(i.quantity AS CHAR) as 库存数量,
            COALESCE(l.test_result, '未测试') as 测试结果,
            COALESCE(o.factory, '未上线') as 工厂
          FROM inventory i
          LEFT JOIN lab_tests l ON i.material_name = l.material_name
          LEFT JOIN online_tracking o ON i.material_name = o.material_name
          WHERE i.status = '正常'
          ORDER BY i.inbound_time DESC
          LIMIT 10
        `;
        
      } else if (rule.intent_name.includes('分析') || rule.intent_name.includes('趋势')) {
        // 分析相关规则
        newSQL = `
          SELECT 
            supplier_name as 供应商,
            COUNT(*) as 物料数量,
            AVG(quantity) as 平均库存,
            COUNT(CASE WHEN status = '正常' THEN 1 END) as 正常数量
          FROM inventory 
          GROUP BY supplier_name
          ORDER BY 物料数量 DESC
          LIMIT 10
        `;
      } else {
        // 默认库存查询
        newSQL = `
          SELECT 
            material_name as 物料名称,
            supplier_name as 供应商,
            CAST(quantity AS CHAR) as 数量,
            status as 状态,
            DATE_FORMAT(inbound_time, '%Y-%m-%d') as 日期
          FROM inventory 
          WHERE status = '正常'
          ORDER BY inbound_time DESC
          LIMIT 10
        `;
      }
      
      // 清理SQL格式
      newSQL = newSQL.trim().replace(/\s+/g, ' ');
      
      try {
        // 测试新SQL
        const [testResults] = await connection.execute(newSQL);
        console.log(`  ✅ 新SQL测试成功: ${testResults.length} 条数据`);
        
        // 更新规则
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, updated_at = NOW()
          WHERE id = ?
        `, [newSQL, ruleId]);
        
        console.log(`  ✅ 规则 ${ruleId} 修复完成`);
        
      } catch (error) {
        console.log(`  ❌ 规则 ${ruleId} 修复失败: ${error.message}`);
      }
      
      console.log('');
    }
    
    // 2. 验证修复结果
    console.log('🧪 验证修复结果:\n');
    
    let fixedCount = 0;
    let stillFailedCount = 0;
    
    for (const ruleId of failedRuleIds) {
      const [ruleInfo] = await connection.execute(`
        SELECT id, intent_name, action_target
        FROM nlp_intent_rules 
        WHERE id = ?
      `, [ruleId]);
      
      if (ruleInfo.length === 0) continue;
      
      const rule = ruleInfo[0];
      
      try {
        const [results] = await connection.execute(rule.action_target);
        console.log(`✅ 规则 ${ruleId} (${rule.intent_name}): ${results.length} 条数据`);
        fixedCount++;
      } catch (error) {
        console.log(`❌ 规则 ${ruleId} (${rule.intent_name}): ${error.message.substring(0, 50)}...`);
        stillFailedCount++;
      }
    }
    
    console.log(`\n📊 修复结果统计:`);
    console.log(`✅ 修复成功: ${fixedCount} 条规则`);
    console.log(`❌ 仍然失败: ${stillFailedCount} 条规则`);
    
    if (fixedCount === failedRuleIds.length) {
      console.log(`🎉 所有失败规则都已修复！`);
    }
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixFailedRules();
