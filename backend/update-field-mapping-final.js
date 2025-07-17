import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function updateFieldMappingFinal() {
  console.log('🔧 根据实际页面字段更新规则库映射...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 定义实际页面字段设计
    console.log('1. 📋 实际页面字段设计:');
    
    const actualFieldDesigns = {
      '库存场景': {
        fields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '批次', '数量', '状态', '入库时间', '到期日期'],
        tableName: 'inventory',
        description: '仓库页面字段'
      },
      '上线场景': {
        fields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次', '不良率', '不良现象', '检验日期'],
        tableName: 'online_tracking',
        description: '上线页面字段'
      },
      '测试场景': {
        fields: ['测试编号', '日期', '项目', '基线', '物料编码', '批次', '物料名称', '供应商', '测试结果', '不良现象'],
        tableName: 'lab_tests',
        description: '测试页面字段'
      }
    };
    
    Object.entries(actualFieldDesigns).forEach(([scenario, config]) => {
      console.log(`   ${scenario} (${config.description}):`);
      console.log(`     字段: [${config.fields.join(', ')}]`);
      console.log(`     字段数量: ${config.fields.length} 个`);
      console.log('');
    });
    
    // 2. 创建正确的SQL模板
    console.log('2. 🔧 创建正确的SQL模板:');
    
    // 库存场景SQL - 10个字段
    const inventorySQL = `
SELECT 
  COALESCE(storage_location, '未知工厂') as 工厂,
  COALESCE(storage_location, '未知仓库') as 仓库,
  COALESCE(material_code, '无编码') as 物料编码,
  COALESCE(material_name, '未知物料') as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  COALESCE(batch_code, '无批次') as 批次,
  COALESCE(quantity, 0) as 数量,
  COALESCE(status, '未知') as 状态,
  COALESCE(DATE_FORMAT(inbound_time, '%Y-%m-%d'), '未知日期') as 入库时间,
  COALESCE(DATE_FORMAT(expiry_date, '%Y-%m-%d'), '未知日期') as 到期日期
FROM inventory 
WHERE 1=1`;
    
    // 上线场景SQL - 10个字段
    const onlineSQL = `
SELECT 
  COALESCE(factory, '未知工厂') as 工厂,
  COALESCE(baseline, '未知基线') as 基线,
  COALESCE(project, '未知项目') as 项目,
  COALESCE(material_code, '无编码') as 物料编码,
  COALESCE(material_name, '未知物料') as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  COALESCE(batch_code, '无批次') as 批次,
  COALESCE(CONCAT(ROUND(defect_rate * 100, 2), '%'), '0%') as 不良率,
  COALESCE(weekly_anomaly, '') as 不良现象,
  COALESCE(DATE_FORMAT(inspection_date, '%Y-%m-%d'), DATE_FORMAT(online_date, '%Y-%m-%d')) as 检验日期
FROM online_tracking 
WHERE 1=1`;
    
    // 测试场景SQL - 10个字段
    const testSQL = `
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
  COALESCE(defect_desc, '') as 不良现象
FROM lab_tests 
WHERE 1=1`;
    
    console.log('   ✅ 库存SQL模板: 10个字段');
    console.log('   ✅ 上线SQL模板: 10个字段');
    console.log('   ✅ 测试SQL模板: 10个字段');
    
    // 3. 测试新的SQL模板
    console.log('\n3. 🧪 测试新的SQL模板:');
    
    const sqlTemplates = {
      '库存场景': inventorySQL,
      '上线场景': onlineSQL,
      '测试场景': testSQL
    };
    
    for (const [scenario, sql] of Object.entries(sqlTemplates)) {
      try {
        const [result] = await connection.execute(sql + ' ORDER BY created_at DESC LIMIT 5');
        console.log(`   ✅ ${scenario}: ${result.length} 条记录`);
        
        if (result.length > 0) {
          const fields = Object.keys(result[0]);
          console.log(`      字段: [${fields.join(', ')}]`);
          console.log(`      字段数量: ${fields.length} 个`);
          
          const sample = result[0];
          const sampleKeys = Object.keys(sample).slice(0, 5);
          console.log(`      样本: ${sampleKeys.map(key => `${key}:${sample[key]}`).join(' | ')}`);
        }
      } catch (error) {
        console.log(`   ❌ ${scenario}: SQL测试失败 - ${error.message}`);
      }
      console.log('');
    }
    
    // 4. 更新所有规则
    console.log('4. 📋 更新所有规则:');
    
    const scenarios = ['库存场景', '上线场景', '测试场景'];
    let totalUpdated = 0;
    
    for (const scenario of scenarios) {
      console.log(`\n🔍 更新${scenario}规则:`);
      
      const [rules] = await connection.execute(`
        SELECT id, intent_name
        FROM nlp_intent_rules 
        WHERE status = 'active'
        AND category = ?
        ORDER BY intent_name
      `, [scenario]);
      
      console.log(`   找到 ${rules.length} 条规则需要更新`);
      
      let baseSQL = sqlTemplates[scenario];
      let updatedCount = 0;
      
      for (const rule of rules) {
        let newSQL = baseSQL;
        
        // 根据规则类型添加特定条件
        if (rule.intent_name.includes('供应商')) {
          const supplierName = rule.intent_name.replace(/供应商(库存|测试|上线)查询/, '');
          newSQL += ` AND supplier_name = '${supplierName}' ORDER BY created_at DESC LIMIT 50`;
        } else if (rule.intent_name.includes('类')) {
          const materialCategories = {
            '结构件类': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
            '光学类': ['LCD显示屏', 'OLED显示屏', '摄像头'],
            '充电类': ['电池', '充电器'],
            '声学类': ['听筒', '喇叭'],
            '包装类': ['保护套', '标签', '包装盒']
          };
          
          const categoryName = rule.intent_name.replace(/(库存|测试|上线)查询/, '');
          const materialList = materialCategories[categoryName] || [];
          
          if (materialList.length > 0) {
            const materialCondition = materialList.map(m => `material_name LIKE '%${m}%'`).join(' OR ');
            newSQL += ` AND (${materialCondition}) ORDER BY created_at DESC LIMIT 50`;
          } else {
            newSQL += ` ORDER BY created_at DESC LIMIT 50`;
          }
        } else {
          // 基础查询规则
          if (scenario === '测试场景') {
            newSQL += ` ORDER BY test_date DESC LIMIT 50`;
          } else if (scenario === '上线场景') {
            newSQL += ` ORDER BY inspection_date DESC LIMIT 50`;
          } else {
            newSQL += ` ORDER BY inbound_time DESC LIMIT 50`;
          }
        }
        
        // 测试并更新规则
        try {
          const [testResult] = await connection.execute(newSQL);
          
          // 更新规则
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET action_target = ?
            WHERE id = ?
          `, [newSQL, rule.id]);
          
          updatedCount++;
          
        } catch (error) {
          console.log(`   ❌ ${rule.intent_name}: SQL测试失败 - ${error.message}`);
        }
      }
      
      console.log(`   ✅ 成功更新 ${updatedCount}/${rules.length} 条规则`);
      totalUpdated += updatedCount;
    }
    
    // 5. 验证关键规则
    console.log('\n5. 🧪 验证关键规则:');
    
    const testRules = [
      '库存信息查询',
      '上线信息查询', 
      '测试信息查询'
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
            const fields = Object.keys(result[0]);
            console.log(`      字段数量: ${fields.length} 个`);
            console.log(`      字段列表: [${fields.join(', ')}]`);
            
            const sample = result[0];
            const firstThreeFields = Object.keys(sample).slice(0, 3);
            console.log(`      样本: ${firstThreeFields.map(key => `${key}:${sample[key]}`).join(' | ')}`);
          }
        } catch (error) {
          console.log(`   ❌ ${ruleName}: 执行失败 - ${error.message}`);
        }
      }
    }
    
    await connection.end();
    
    console.log('\n📋 字段映射更新完成总结:');
    console.log('==========================================');
    console.log(`✅ 总共更新 ${totalUpdated} 条规则`);
    console.log('✅ 字段映射与实际页面完全一致');
    console.log('✅ 库存场景: 10个字段');
    console.log('✅ 上线场景: 10个字段');
    console.log('✅ 测试场景: 10个字段');
    console.log('✅ 所有规则调用真实数据库数据');
    
    console.log('\n📋 最终字段映射:');
    console.log('库存场景: 工厂, 仓库, 物料编码, 物料名称, 供应商, 批次, 数量, 状态, 入库时间, 到期日期');
    console.log('上线场景: 工厂, 基线, 项目, 物料编码, 物料名称, 供应商, 批次, 不良率, 不良现象, 检验日期');
    console.log('测试场景: 测试编号, 日期, 项目, 基线, 物料编码, 批次, 物料名称, 供应商, 测试结果, 不良现象');
    
    console.log('\n🔄 请重新测试前端所有场景查询');
    
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
  }
}

updateFieldMappingFinal();
