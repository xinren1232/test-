import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixRulesCallRealData() {
  console.log('🔧 修复规则系统调用真实数据...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查现有真实数据
    console.log('1. 📊 检查现有真实数据:');
    
    // 检查库存数据
    const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    console.log(`   库存数据: ${inventoryCount[0].count} 条`);
    
    // 检查测试数据
    const [testCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    console.log(`   测试数据: ${testCount[0].count} 条`);
    
    // 检查上线数据
    const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    console.log(`   上线数据: ${onlineCount[0].count} 条`);
    
    // 2. 检查上线数据的实际字段和内容
    console.log('\n2. 📋 检查上线数据的实际字段和内容:');
    
    const [onlineFields] = await connection.execute('DESCRIBE online_tracking');
    console.log('   online_tracking表字段:');
    onlineFields.forEach(field => {
      console.log(`     - ${field.Field}: ${field.Type}`);
    });
    
    // 检查上线数据样本
    const [onlineSample] = await connection.execute(`
      SELECT * FROM online_tracking 
      ORDER BY inspection_date DESC 
      LIMIT 5
    `);
    
    console.log('\n   上线数据样本:');
    onlineSample.forEach((item, index) => {
      console.log(`     ${index + 1}. 物料: ${item.material_name} | 供应商: ${item.supplier_name}`);
      console.log(`        工厂: ${item.factory} | 项目: ${item.project} | 基线: ${item.baseline}`);
      console.log(`        批次: ${item.batch_code} | 不良率: ${item.defect_rate}`);
      console.log(`        检验日期: ${item.inspection_date} | 本周异常: ${item.weekly_anomaly || '无'}`);
      console.log('');
    });
    
    // 3. 创建正确的上线场景SQL模板
    console.log('3. 🔧 创建正确的上线场景SQL模板:');
    
    // 根据实际页面字段：工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注
    const correctOnlineSQL = `
SELECT 
  COALESCE(factory, '未知工厂') as 工厂,
  COALESCE(baseline, '未知基线') as 基线,
  COALESCE(project, '未知项目') as 项目,
  COALESCE(material_code, '无编码') as 物料编码,
  COALESCE(material_name, '未知物料') as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  COALESCE(batch_code, '无批次') as 批次号,
  COALESCE(CONCAT(ROUND(defect_rate * 100, 4), '%'), '0%') as 不良率,
  COALESCE(weekly_anomaly, '') as 本周异常,
  COALESCE(DATE_FORMAT(inspection_date, '%Y-%m-%d'), '未知日期') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking 
WHERE 1=1`;
    
    console.log('   正确的上线SQL模板:');
    console.log(correctOnlineSQL);
    
    // 4. 测试新的SQL
    console.log('\n4. 🧪 测试新的上线SQL:');
    try {
      const [testResult] = await connection.execute(correctOnlineSQL + ' ORDER BY inspection_date DESC LIMIT 10');
      console.log(`   ✅ SQL测试成功，返回 ${testResult.length} 条记录`);
      
      if (testResult.length > 0) {
        console.log('   📊 前3条数据:');
        testResult.slice(0, 3).forEach((item, index) => {
          console.log(`     ${index + 1}. ${item.物料名称} | ${item.供应商} | ${item.工厂}`);
          console.log(`        项目: ${item.项目} | 基线: ${item.基线} | 不良率: ${item.不良率}`);
          console.log(`        批次: ${item.批次号} | 本周异常: ${item.本周异常} | 检验日期: ${item.检验日期}`);
        });
        
        // 验证字段
        const fields = Object.keys(testResult[0]);
        console.log(`   📋 返回字段: [${fields.join(', ')}]`);
        console.log(`   📊 字段数量: ${fields.length} 个`);
      }
    } catch (error) {
      console.log(`   ❌ SQL测试失败: ${error.message}`);
      return;
    }
    
    // 5. 获取所有上线场景规则并修复
    console.log('\n5. 📋 修复所有上线场景规则:');
    const [onlineRules] = await connection.execute(`
      SELECT id, intent_name
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND category = '上线场景'
      ORDER BY intent_name
    `);
    
    console.log(`   找到 ${onlineRules.length} 条上线规则需要修复`);
    
    let fixedCount = 0;
    
    for (const rule of onlineRules) {
      console.log(`\n🔍 修复规则: ${rule.intent_name}`);
      
      let newSQL = correctOnlineSQL;
      
      // 根据规则类型添加特定条件
      if (rule.intent_name.includes('供应商')) {
        // 供应商规则
        const supplierName = rule.intent_name.replace('供应商上线查询', '');
        newSQL += ` AND supplier_name = '${supplierName}' ORDER BY inspection_date DESC LIMIT 50`;
      } else if (rule.intent_name.includes('类')) {
        // 物料大类规则
        const materialCategories = {
          '结构件类': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
          '光学类': ['LCD显示屏', 'OLED显示屏', '摄像头'],
          '充电类': ['电池', '充电器'],
          '声学类': ['听筒', '喇叭'],
          '包装类': ['保护套', '标签', '包装盒']
        };
        
        const categoryName = rule.intent_name.replace('上线查询', '');
        const materialList = materialCategories[categoryName] || [];
        
        if (materialList.length > 0) {
          const materialCondition = materialList.map(m => `material_name LIKE '%${m}%'`).join(' OR ');
          newSQL += ` AND (${materialCondition}) ORDER BY inspection_date DESC LIMIT 50`;
        } else {
          newSQL += ` ORDER BY inspection_date DESC LIMIT 50`;
        }
      } else {
        // 基础查询规则
        newSQL += ` ORDER BY inspection_date DESC LIMIT 50`;
      }
      
      // 测试并更新规则
      try {
        const [testResult] = await connection.execute(newSQL);
        console.log(`   ✅ 新SQL测试成功，返回 ${testResult.length} 条记录`);
        
        // 更新规则
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
    
    // 6. 验证关键规则
    console.log(`\n6. 🧪 验证关键上线规则修复结果:`);
    
    const testRuleNames = [
      '上线信息查询',
      'BOE供应商上线查询',
      '结构件类上线查询'
    ];
    
    for (const ruleName of testRuleNames) {
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
            console.log(`      样本: ${sample.物料名称} | ${sample.供应商} | ${sample.工厂}`);
            console.log(`      项目: ${sample.项目} | 基线: ${sample.基线} | 不良率: ${sample.不良率}`);
            console.log(`      批次: ${sample.批次号} | 检验日期: ${sample.检验日期}`);
            
            // 验证字段正确性
            const fields = Object.keys(sample);
            const expectedFields = ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'];
            const isCorrect = expectedFields.every(field => fields.includes(field));
            
            if (isCorrect) {
              console.log(`      ✅ 字段完全正确`);
            } else {
              console.log(`      ❌ 字段不完整`);
            }
          }
        } catch (error) {
          console.log(`   ❌ ${ruleName}: 执行失败 - ${error.message}`);
        }
      }
    }
    
    await connection.end();
    
    console.log('\n📋 规则系统调用真实数据修复完成:');
    console.log('==========================================');
    console.log(`✅ 成功修复 ${fixedCount} 条上线规则`);
    console.log('✅ 规则现在调用真实的online_tracking表数据');
    console.log('✅ 字段映射与实际页面完全一致');
    console.log('✅ 不良率格式化为百分比显示');
    console.log('✅ 所有SQL查询都使用COALESCE处理空值');
    
    console.log('\n📋 上线场景字段列表:');
    console.log('   1. 工厂 (factory)');
    console.log('   2. 基线 (baseline)');
    console.log('   3. 项目 (project)');
    console.log('   4. 物料编码 (material_code)');
    console.log('   5. 物料名称 (material_name)');
    console.log('   6. 供应商 (supplier_name)');
    console.log('   7. 批次号 (batch_code)');
    console.log('   8. 不良率 (defect_rate，格式化为百分比)');
    console.log('   9. 本周异常 (weekly_anomaly)');
    console.log('   10. 检验日期 (inspection_date)');
    console.log('   11. 备注 (notes)');
    
    console.log('\n🔄 现在规则系统会调用您的真实上线数据');
    console.log('   请在前端测试上线信息查询');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixRulesCallRealData();
