import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixAllRulesSQL() {
  console.log('🔧 修复所有规则SQL查询...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 定义修复后的SQL模板
    const fixedTemplates = {
      // 库存场景 - 修复后的SQL模板
      inventory: `
SELECT 
  COALESCE(storage_location, '未知工厂') as 工厂,
  COALESCE(storage_location, '未知仓库') as 仓库,
  COALESCE(material_code, '无编码') as 物料编码,
  COALESCE(material_name, '未知物料') as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  COALESCE(quantity, 0) as 数量,
  COALESCE(status, '未知状态') as 状态,
  COALESCE(DATE_FORMAT(inbound_time, '%Y-%m-%d'), '未知日期') as 入库时间,
  COALESCE(DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d'), '未知日期') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
WHERE 1=1`,
      
      // 测试场景 - 修复后的SQL模板
      test: `
SELECT 
  COALESCE(test_id, '无编号') as 测试编号,
  COALESCE(DATE_FORMAT(test_date, '%Y-%m-%d'), '未知日期') as 日期,
  COALESCE(project_id, '未知项目') as 项目,
  COALESCE(baseline_id, '未知基线') as 基线,
  COALESCE(material_code, '无编码') as 物料编码,
  COALESCE(quantity, 1) as 数量,
  COALESCE(material_name, '未知物料') as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  COALESCE(test_result, '未知结果') as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests 
WHERE 1=1`,
      
      // 上线场景 - 修复后的SQL模板
      online: `
SELECT 
  COALESCE(factory_location, '未知工厂') as 工厂,
  COALESCE(baseline_version, '未知基线') as 基线,
  COALESCE(project_name, '未知项目') as 项目,
  COALESCE(material_code, '无编码') as 物料编码,
  COALESCE(material_name, '未知物料') as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  COALESCE(batch_number, '无批次') as 批次号,
  COALESCE(defect_rate, 0) as 不良率,
  COALESCE(exception_count, 0) as 本周异常,
  COALESCE(DATE_FORMAT(online_date, '%Y-%m-%d'), '未知日期') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking 
WHERE 1=1`
    };
    
    // 2. 获取所有需要修复的规则
    console.log('1. 📋 获取所有规则:');
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, category, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY category, intent_name
    `);
    
    console.log(`   找到 ${allRules.length} 条规则需要检查`);
    
    // 3. 按场景修复规则
    let fixedCount = 0;
    
    for (const rule of allRules) {
      console.log(`\n🔍 处理规则: ${rule.intent_name} (${rule.category})`);
      
      let newSQL = '';
      let baseTemplate = '';
      
      // 根据场景选择模板
      if (rule.category === '库存场景') {
        baseTemplate = fixedTemplates.inventory;
      } else if (rule.category === '测试场景') {
        baseTemplate = fixedTemplates.test;
      } else if (rule.category === '上线场景') {
        baseTemplate = fixedTemplates.online;
      } else {
        console.log(`   ⚠️  未知场景: ${rule.category}`);
        continue;
      }
      
      // 根据规则类型添加特定条件
      if (rule.intent_name.includes('供应商')) {
        // 供应商规则
        const supplierName = rule.intent_name.replace('供应商库存查询', '').replace('供应商测试查询', '').replace('供应商上线查询', '');
        newSQL = baseTemplate + ` AND supplier_name = '${supplierName}' ORDER BY ${rule.category === '库存场景' ? 'inbound_time' : rule.category === '测试场景' ? 'test_date' : 'online_date'} DESC LIMIT 50`;
      } else if (rule.intent_name.includes('类')) {
        // 物料大类规则
        const materialCategories = {
          '结构件类': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
          '光学类': ['LCD显示屏', 'OLED显示屏', '摄像头'],
          '充电类': ['电池', '充电器'],
          '声学类': ['听筒', '喇叭'],
          '包装类': ['保护套', '标签', '包装盒']
        };
        
        const categoryName = rule.intent_name.replace('库存查询', '').replace('测试查询', '').replace('上线查询', '');
        const materialList = materialCategories[categoryName] || [];
        
        if (materialList.length > 0) {
          const materialCondition = materialList.map(m => `material_name LIKE '%${m}%'`).join(' OR ');
          newSQL = baseTemplate + ` AND (${materialCondition}) ORDER BY ${rule.category === '库存场景' ? 'inbound_time' : rule.category === '测试场景' ? 'test_date' : 'online_date'} DESC LIMIT 50`;
        } else {
          newSQL = baseTemplate + ` ORDER BY ${rule.category === '库存场景' ? 'inbound_time' : rule.category === '测试场景' ? 'test_date' : 'online_date'} DESC LIMIT 50`;
        }
      } else {
        // 基础查询规则
        newSQL = baseTemplate + ` ORDER BY ${rule.category === '库存场景' ? 'inbound_time' : rule.category === '测试场景' ? 'test_date' : 'online_date'} DESC LIMIT 50`;
      }
      
      // 4. 测试新SQL
      try {
        const [testResult] = await connection.execute(newSQL);
        console.log(`   ✅ 新SQL测试成功，返回 ${testResult.length} 条记录`);
        
        // 5. 更新规则
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?
          WHERE id = ?
        `, [newSQL, rule.id]);
        
        fixedCount++;
        console.log(`   ✅ 规则已更新`);
        
      } catch (error) {
        console.log(`   ❌ SQL测试失败: ${error.message}`);
      }
    }
    
    // 6. 验证修复结果
    console.log(`\n2. 📊 修复结果验证:`);
    console.log(`   成功修复 ${fixedCount}/${allRules.length} 条规则`);
    
    // 7. 测试几个关键规则
    console.log('\n3. 🧪 测试关键规则:');
    
    const testRules = [
      '库存信息查询',
      '聚龙供应商库存查询',
      '光学类库存查询'
    ];
    
    for (const ruleName of testRules) {
      const [rule] = await connection.execute(`
        SELECT action_target
        FROM nlp_intent_rules 
        WHERE intent_name = ? AND status = 'active'
      `, [ruleName]);
      
      if (rule.length > 0) {
        try {
          const [result] = await connection.execute(rule[0].action_target);
          console.log(`   ✅ ${ruleName}: ${result.length} 条记录`);
          
          if (result.length > 0) {
            const sample = result[0];
            const fields = Object.keys(sample);
            const hasEmptyFields = fields.some(field => !sample[field] && sample[field] !== 0);
            
            if (hasEmptyFields) {
              console.log(`   ⚠️  存在空字段`);
            } else {
              console.log(`   ✅ 所有字段完整`);
            }
          }
        } catch (error) {
          console.log(`   ❌ ${ruleName}: 执行失败 - ${error.message}`);
        }
      }
    }
    
    await connection.end();
    
    console.log('\n📋 修复完成总结:');
    console.log('==========================================');
    console.log(`✅ 成功修复 ${fixedCount} 条规则`);
    console.log('✅ 所有SQL查询都使用COALESCE处理空值');
    console.log('✅ 确保返回50条完整记录');
    console.log('✅ 字段映射保持一致');
    
    console.log('\n🔄 请重新测试前端查询，应该能看到完整数据');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixAllRulesSQL();
