/**
 * 重新创建规则 - 删除有问题的规则并重新创建
 */

import mysql from 'mysql2/promise';

async function recreateRules() {
  console.log('🔧 重新创建规则\n');
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功\n');
    
    // 1. 备份现有规则信息
    console.log('📋 备份现有规则信息:');
    const [existingRules] = await connection.query(`
      SELECT id, intent_name, description, action_type, action_target, trigger_words, synonyms, priority
      FROM nlp_intent_rules 
      WHERE id IN (78, 79, 80, 82, 84)
      ORDER BY id
    `);
    
    console.log(`找到 ${existingRules.length} 个规则需要重新创建`);
    
    // 2. 删除有问题的规则
    console.log('\n🗑️ 删除有问题的规则:');
    await connection.query(`DELETE FROM nlp_intent_rules WHERE id IN (78, 79, 80, 82, 84)`);
    console.log('✅ 已删除有问题的规则');
    
    // 3. 重新创建规则
    console.log('\n🔧 重新创建规则:');
    
    // 规则1: 工厂库存查询 (原ID: 82)
    const factoryInventoryParams = {
      "factory": {
        "type": "string",
        "description": "工厂名称",
        "extract_from": ["深圳工厂", "重庆工厂", "南昌工厂", "宜宾工厂", "深圳", "重庆", "南昌", "宜宾"],
        "mapping": {
          "深圳": "深圳工厂",
          "重庆": "重庆工厂",
          "南昌": "南昌工厂",
          "宜宾": "宜宾工厂"
        }
      }
    };
    
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, description, action_type, action_target, parameters, 
        trigger_words, synonyms, priority, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      '工厂库存查询',
      '查询特定工厂的库存详情，支持工厂名称参数提取',
      'MEMORY_QUERY',
      'SELECT * FROM inventory WHERE storage_location LIKE CONCAT("%", ?, "%") ORDER BY inbound_time DESC',
      JSON.stringify(factoryInventoryParams),
      JSON.stringify(["重庆工厂", "深圳工厂", "南昌工厂", "宜宾工厂", "重庆", "深圳", "南昌", "宜宾", "工厂", "库存"]),
      JSON.stringify({}),
      5,
      'active'
    ]);
    
    console.log('✅ 已创建工厂库存查询规则');
    
    // 规则2: 车间生产分析 (原ID: 80)
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, description, action_type, action_target, parameters, 
        trigger_words, synonyms, priority, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      '车间生产分析',
      '分析真实工厂的生产情况，包括产线效率和车间统计',
      'MEMORY_QUERY',
      'SELECT * FROM online_tracking WHERE factory LIKE CONCAT("%", ?, "%") ORDER BY online_date DESC',
      JSON.stringify(factoryInventoryParams),
      JSON.stringify(["车间", "生产", "分析", "工厂", "产线", "制造", "加工", "生产线", "产能", "效率"]),
      JSON.stringify({}),
      4,
      'active'
    ]);
    
    console.log('✅ 已创建车间生产分析规则');
    
    // 规则3: 供应商查询 (原ID: 78)
    const supplierParams = {
      "supplier": {
        "type": "string",
        "description": "供应商名称",
        "extract_from": ["聚龙", "BOE", "歌尔", "欣冠", "广正", "紫光", "黑龙", "欣旺", "比亚迪", "宁德时代"],
        "mapping": {}
      }
    };
    
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, description, action_type, action_target, parameters, 
        trigger_words, synonyms, priority, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      '供应商查询',
      '查询特定供应商的相关信息和物料',
      'MEMORY_QUERY',
      'SELECT * FROM inventory WHERE supplier LIKE CONCAT("%", ?, "%") ORDER BY inbound_time DESC',
      JSON.stringify(supplierParams),
      JSON.stringify(["供应商", "聚龙", "BOE", "歌尔", "欣冠", "广正", "紫光", "黑龙", "欣旺"]),
      JSON.stringify({}),
      3,
      'active'
    ]);
    
    console.log('✅ 已创建供应商查询规则');
    
    // 规则4: 物料质量分析 (原ID: 79)
    const materialParams = {
      "material": {
        "type": "string",
        "description": "物料名称",
        "extract_from": ["电池盖", "中框", "LCD显示屏", "OLED显示屏", "摄像头模组", "电容器", "电阻器", "传感器"],
        "mapping": {}
      }
    };
    
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, description, action_type, action_target, parameters, 
        trigger_words, synonyms, priority, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      '物料质量分析',
      '分析特定物料的质量情况和检测数据',
      'MEMORY_QUERY',
      'SELECT * FROM inventory WHERE material_name LIKE CONCAT("%", ?, "%") ORDER BY inbound_time DESC',
      JSON.stringify(materialParams),
      JSON.stringify(["物料", "质量", "分析", "电池盖", "中框", "显示屏", "摄像头", "电容器", "电阻器"]),
      JSON.stringify({}),
      3,
      'active'
    ]);
    
    console.log('✅ 已创建物料质量分析规则');
    
    // 规则5: 供应商物料查询 (原ID: 84)
    const combinedParams = {
      "supplier": {
        "type": "string",
        "description": "供应商名称",
        "extract_from": ["聚龙", "BOE", "歌尔", "欣冠", "广正", "紫光", "黑龙", "欣旺"],
        "mapping": {}
      },
      "material": {
        "type": "string",
        "description": "物料名称",
        "extract_from": ["电池盖", "中框", "LCD显示屏", "OLED显示屏", "摄像头模组", "电容器", "电阻器"],
        "mapping": {}
      }
    };
    
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, description, action_type, action_target, parameters, 
        trigger_words, synonyms, priority, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      '供应商物料查询',
      '查询特定供应商的特定物料信息',
      'MEMORY_QUERY',
      'SELECT * FROM inventory WHERE supplier LIKE CONCAT("%", ?, "%") AND material_name LIKE CONCAT("%", ?, "%") ORDER BY inbound_time DESC',
      JSON.stringify(combinedParams),
      JSON.stringify(["供应商", "物料", "查询", "分析"]),
      JSON.stringify({}),
      4,
      'active'
    ]);
    
    console.log('✅ 已创建供应商物料查询规则');
    
    // 4. 验证新创建的规则
    console.log('\n🔍 验证新创建的规则:');
    const [newRules] = await connection.query(`
      SELECT id, intent_name, parameters
      FROM nlp_intent_rules 
      WHERE intent_name IN ('工厂库存查询', '车间生产分析', '供应商查询', '物料质量分析', '供应商物料查询')
      ORDER BY id
    `);
    
    for (const rule of newRules) {
      console.log(`\nID: ${rule.id} - ${rule.intent_name}`);
      if (rule.parameters) {
        try {
          const params = JSON.parse(rule.parameters);
          console.log(`✅ 参数解析成功:`, Object.keys(params));
          
          // 显示extract_from配置
          for (const [paramName, paramDef] of Object.entries(params)) {
            if (paramDef.extract_from && Array.isArray(paramDef.extract_from)) {
              console.log(`  ${paramName}: ${paramDef.extract_from.length} 个关键词 [${paramDef.extract_from.slice(0, 3).join(', ')}...]`);
            }
          }
        } catch (e) {
          console.log(`❌ 参数解析失败: ${e.message}`);
        }
      } else {
        console.log(`⚠️ 无参数配置`);
      }
    }
    
    // 5. 测试新规则的参数提取
    console.log('\n🧪 测试新规则的参数提取:');
    
    const testQuery = '查询深圳工厂库存';
    console.log(`测试查询: "${testQuery}"`);
    
    // 获取工厂库存查询规则
    const [factoryRule] = await connection.query(`
      SELECT id, intent_name, parameters
      FROM nlp_intent_rules 
      WHERE intent_name = '工厂库存查询'
    `);
    
    if (factoryRule.length > 0 && factoryRule[0].parameters) {
      try {
        const paramConfig = JSON.parse(factoryRule[0].parameters);
        const extractedParams = {};
        
        for (const [paramName, paramDef] of Object.entries(paramConfig)) {
          if (paramDef.extract_from && Array.isArray(paramDef.extract_from)) {
            for (const keyword of paramDef.extract_from) {
              if (testQuery.includes(keyword)) {
                let value = keyword;
                if (paramDef.mapping && paramDef.mapping[keyword]) {
                  value = paramDef.mapping[keyword];
                }
                extractedParams[paramName] = value;
                break;
              }
            }
          }
        }
        
        console.log(`提取的参数: ${JSON.stringify(extractedParams)}`);
        
        if (extractedParams.factory === '深圳工厂') {
          console.log('✅ 参数提取测试成功！');
        } else {
          console.log('❌ 参数提取测试失败');
        }
        
      } catch (e) {
        console.log(`❌ 测试失败: ${e.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 重新创建规则过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
  
  console.log('\n🎯 规则重新创建完成');
}

recreateRules().catch(console.error);
