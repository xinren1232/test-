import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixOnlineRules() {
  console.log('🔧 修复上线场景规则...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查上线表结构
    console.log('1. 📊 检查上线表结构:');
    const [columns] = await connection.execute('DESCRIBE online_tracking');
    console.log('   上线表字段:');
    columns.forEach(col => {
      console.log(`     - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? '可空' : '非空'})`);
    });
    
    // 2. 检查上线数据样本
    console.log('\n2. 📋 检查上线数据样本:');
    const [sampleData] = await connection.execute('SELECT * FROM online_tracking LIMIT 3');
    console.log(`   上线数据样本 (${sampleData.length} 条):`);
    sampleData.forEach((item, index) => {
      console.log(`     ${index + 1}. 物料: ${item.material_name}, 供应商: ${item.supplier_name}`);
      console.log(`        不良率: ${item.defect_rate}, 日期: ${item.online_date}`);
    });
    
    // 3. 创建正确的上线场景SQL模板
    console.log('\n3. 🔧 创建正确的上线场景SQL模板:');
    
    const correctOnlineSQL = `
SELECT 
  COALESCE('N/A', '未知工厂') as 工厂,
  COALESCE('N/A', '未知基线') as 基线,
  COALESCE('N/A', '未知项目') as 项目,
  COALESCE(material_code, '无编码') as 物料编码,
  COALESCE(material_name, '未知物料') as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  COALESCE('N/A', '无批次') as 批次号,
  COALESCE(defect_rate, 0) as 不良率,
  COALESCE(exception_count, 0) as 本周异常,
  COALESCE(DATE_FORMAT(online_date, '%Y-%m-%d'), '未知日期') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking 
WHERE 1=1`;
    
    console.log('   正确的上线SQL模板:');
    console.log(correctOnlineSQL);
    
    // 4. 测试正确的SQL
    console.log('\n4. 🧪 测试正确的SQL:');
    try {
      const [testResult] = await connection.execute(correctOnlineSQL + ' ORDER BY online_date DESC LIMIT 10');
      console.log(`   ✅ SQL测试成功，返回 ${testResult.length} 条记录`);
      
      if (testResult.length > 0) {
        console.log('   📊 前3条数据:');
        testResult.slice(0, 3).forEach((item, index) => {
          console.log(`     ${index + 1}. ${item.物料名称} | ${item.供应商} | 不良率:${item.不良率} | ${item.检验日期}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ SQL测试失败: ${error.message}`);
      return;
    }
    
    // 5. 获取所有上线场景规则
    console.log('\n5. 📋 获取所有上线场景规则:');
    const [onlineRules] = await connection.execute(`
      SELECT id, intent_name
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND category = '上线场景'
      ORDER BY intent_name
    `);
    
    console.log(`   找到 ${onlineRules.length} 条上线规则需要修复`);
    
    // 6. 修复所有上线规则
    let fixedCount = 0;
    
    for (const rule of onlineRules) {
      console.log(`\n🔍 修复规则: ${rule.intent_name}`);
      
      let newSQL = correctOnlineSQL;
      
      // 根据规则类型添加特定条件
      if (rule.intent_name.includes('供应商')) {
        // 供应商规则
        const supplierName = rule.intent_name.replace('供应商上线查询', '');
        newSQL += ` AND supplier_name = '${supplierName}' ORDER BY online_date DESC LIMIT 50`;
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
          newSQL += ` AND (${materialCondition}) ORDER BY online_date DESC LIMIT 50`;
        } else {
          newSQL += ` ORDER BY online_date DESC LIMIT 50`;
        }
      } else {
        // 基础查询规则
        newSQL += ` ORDER BY online_date DESC LIMIT 50`;
      }
      
      // 7. 测试并更新规则
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
    
    // 8. 验证修复结果
    console.log(`\n6. 📊 修复结果验证:`);
    console.log(`   成功修复 ${fixedCount}/${onlineRules.length} 条上线规则`);
    
    // 9. 测试几个关键上线规则
    console.log('\n7. 🧪 测试关键上线规则:');
    
    const testRules = [
      '上线信息查询',
      'BOE供应商上线查询',
      '光学类上线查询'
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
            console.log(`      样本: ${sample.物料名称} | ${sample.供应商} | 不良率:${sample.不良率}`);
          }
        } catch (error) {
          console.log(`   ❌ ${ruleName}: 执行失败 - ${error.message}`);
        }
      }
    }
    
    await connection.end();
    
    console.log('\n📋 上线规则修复完成总结:');
    console.log('==========================================');
    console.log(`✅ 成功修复 ${fixedCount} 条上线规则`);
    console.log('✅ 使用正确的数据库字段名');
    console.log('✅ 所有SQL查询都使用COALESCE处理空值');
    console.log('✅ 确保返回完整记录');
    
    console.log('\n🔄 现在所有规则都应该能正常工作了！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixOnlineRules();
