import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixTestFieldsFinal() {
  console.log('🔧 最终修复测试场景字段映射...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查测试表的实际字段和数据
    console.log('1. 📊 检查测试表实际数据:');
    const [sampleData] = await connection.execute(`
      SELECT test_id, test_date, project_id, baseline_id, material_code, 
             material_name, supplier_name, test_result, defect_desc, 
             conclusion, notes
      FROM lab_tests 
      LIMIT 5
    `);
    
    console.log('   测试数据样本:');
    sampleData.forEach((item, index) => {
      console.log(`     ${index + 1}. 测试ID: ${item.test_id}`);
      console.log(`        项目ID: ${item.project_id || '空'}, 基线ID: ${item.baseline_id || '空'}`);
      console.log(`        测试结果: ${item.test_result}, 不良描述: ${item.defect_desc || '空'}`);
      console.log(`        结论: ${item.conclusion || '空'}, 备注: ${item.notes || '空'}`);
      console.log('');
    });
    
    // 2. 根据实际页面字段要求创建正确的SQL
    console.log('2. 🔧 创建正确的测试场景SQL模板:');
    
    // 实际页面字段：测试编号、日期、项目、基线、物料编码、批次、物料名称、供应商、测试结果、不良现象、备注
    const correctTestSQL = `
SELECT 
  COALESCE(test_id, '无编号') as 测试编号,
  COALESCE(DATE_FORMAT(test_date, '%Y-%m-%d'), '未知日期') as 日期,
  COALESCE(project_id, '未知项目') as 项目,
  COALESCE(baseline_id, '未知基线') as 基线,
  COALESCE(material_code, '无编码') as 物料编码,
  COALESCE(batch_code, '无批次') as 批次,
  COALESCE(material_name, '未知物料') as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  CASE 
    WHEN test_result = 'PASS' THEN 'OK'
    WHEN test_result = 'FAIL' THEN 'NG'
    ELSE COALESCE(test_result, '未知')
  END as 测试结果,
  COALESCE(defect_desc, '') as 不良现象,
  COALESCE(notes, '') as 备注
FROM lab_tests 
WHERE 1=1`;
    
    console.log('   正确的测试SQL模板:');
    console.log(correctTestSQL);
    
    // 3. 测试新的SQL
    console.log('\n3. 🧪 测试新的SQL:');
    try {
      const [testResult] = await connection.execute(correctTestSQL + ' ORDER BY test_date DESC LIMIT 10');
      console.log(`   ✅ SQL测试成功，返回 ${testResult.length} 条记录`);
      
      if (testResult.length > 0) {
        console.log('   📊 前3条数据:');
        testResult.slice(0, 3).forEach((item, index) => {
          console.log(`     ${index + 1}. ${item.测试编号} | ${item.物料名称} | ${item.供应商}`);
          console.log(`        项目: ${item.项目} | 基线: ${item.基线} | 测试结果: ${item.测试结果}`);
          console.log(`        不良现象: ${item.不良现象} | 备注: ${item.备注}`);
        });
        
        // 验证字段
        const fields = Object.keys(testResult[0]);
        console.log(`   📋 返回字段: [${fields.join(', ')}]`);
        console.log(`   📊 字段数量: ${fields.length} 个`);
        
        // 验证测试结果转换
        const testResults = [...new Set(testResult.map(item => item.测试结果))];
        console.log(`   🔍 测试结果值: [${testResults.join(', ')}]`);
      }
    } catch (error) {
      console.log(`   ❌ SQL测试失败: ${error.message}`);
      return;
    }
    
    // 4. 获取所有测试场景规则并修复
    console.log('\n4. 📋 修复所有测试场景规则:');
    const [testRules] = await connection.execute(`
      SELECT id, intent_name
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND category = '测试场景'
      ORDER BY intent_name
    `);
    
    console.log(`   找到 ${testRules.length} 条测试规则需要修复`);
    
    let fixedCount = 0;
    
    for (const rule of testRules) {
      console.log(`\n🔍 修复规则: ${rule.intent_name}`);
      
      let newSQL = correctTestSQL;
      
      // 根据规则类型添加特定条件
      if (rule.intent_name.includes('供应商')) {
        // 供应商规则
        const supplierName = rule.intent_name.replace('供应商测试查询', '');
        newSQL += ` AND supplier_name = '${supplierName}' ORDER BY test_date DESC LIMIT 50`;
      } else if (rule.intent_name.includes('类')) {
        // 物料大类规则
        const materialCategories = {
          '结构件类': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
          '光学类': ['LCD显示屏', 'OLED显示屏', '摄像头'],
          '充电类': ['电池', '充电器'],
          '声学类': ['听筒', '喇叭'],
          '包装类': ['保护套', '标签', '包装盒']
        };
        
        const categoryName = rule.intent_name.replace('测试查询', '');
        const materialList = materialCategories[categoryName] || [];
        
        if (materialList.length > 0) {
          const materialCondition = materialList.map(m => `material_name LIKE '%${m}%'`).join(' OR ');
          newSQL += ` AND (${materialCondition}) ORDER BY test_date DESC LIMIT 50`;
        } else {
          newSQL += ` ORDER BY test_date DESC LIMIT 50`;
        }
      } else {
        // 基础查询规则
        newSQL += ` ORDER BY test_date DESC LIMIT 50`;
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
    
    // 5. 验证关键规则
    console.log(`\n5. 🧪 验证关键规则修复结果:`);
    
    const testRuleNames = [
      '测试信息查询',
      'BOE供应商测试查询',
      '结构件类测试查询'
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
            console.log(`      样本: ${sample.测试编号} | ${sample.物料名称} | ${sample.供应商}`);
            console.log(`      项目: ${sample.项目} | 基线: ${sample.基线} | 结果: ${sample.测试结果}`);
            console.log(`      不良现象: ${sample.不良现象} | 备注: ${sample.备注}`);
            
            // 验证字段正确性
            const fields = Object.keys(sample);
            const expectedFields = ['测试编号', '日期', '项目', '基线', '物料编码', '批次', '物料名称', '供应商', '测试结果', '不良现象', '备注'];
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
    
    console.log('\n📋 测试场景字段最终修复完成:');
    console.log('==========================================');
    console.log(`✅ 成功修复 ${fixedCount} 条测试规则`);
    console.log('✅ 项目和基线字段现在使用实际数据库字段');
    console.log('✅ 测试结果转换为OK/NG格式');
    console.log('✅ 不合格描述改为不良现象');
    console.log('✅ 备注字段使用notes而非conclusion');
    console.log('✅ 添加了批次字段');
    
    console.log('\n📋 修复后的测试场景字段列表:');
    console.log('   1. 测试编号 (test_id)');
    console.log('   2. 日期 (test_date)');
    console.log('   3. 项目 (project_id) - 使用实际数据');
    console.log('   4. 基线 (baseline_id) - 使用实际数据');
    console.log('   5. 物料编码 (material_code)');
    console.log('   6. 批次 (batch_code)');
    console.log('   7. 物料名称 (material_name)');
    console.log('   8. 供应商 (supplier_name)');
    console.log('   9. 测试结果 (PASS→OK, FAIL→NG)');
    console.log('   10. 不良现象 (defect_desc)');
    console.log('   11. 备注 (notes)');
    
    console.log('\n🔄 请重新测试前端测试信息查询');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixTestFieldsFinal();
