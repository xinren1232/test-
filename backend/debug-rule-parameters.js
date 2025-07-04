/**
 * 调试规则参数配置
 */

import mysql from 'mysql2/promise';

async function debugRuleParameters() {
  console.log('🔍 调试规则参数配置\n');
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功\n');
    
    // 1. 查询所有包含工厂相关的规则
    console.log('🏭 查询工厂相关规则:');
    const [factoryRules] = await connection.query(`
      SELECT id, intent_name, description, parameters, trigger_words, action_target
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%工厂%' OR trigger_words LIKE '%工厂%'
      ORDER BY id
    `);
    
    for (const rule of factoryRules) {
      console.log(`\n规则ID: ${rule.id}`);
      console.log(`意图名称: ${rule.intent_name}`);
      console.log(`描述: ${rule.description}`);
      console.log(`触发词: ${rule.trigger_words}`);
      console.log(`参数配置: ${rule.parameters}`);
      console.log(`SQL模板: ${rule.action_target?.substring(0, 100)}...`);
      
      // 尝试解析参数配置
      if (rule.parameters) {
        try {
          const params = JSON.parse(rule.parameters);
          console.log(`解析后的参数:`, JSON.stringify(params, null, 2));
        } catch (e) {
          console.log(`❌ 参数解析失败: ${e.message}`);
        }
      }
    }
    
    // 2. 查询所有库存相关的规则
    console.log('\n\n📦 查询库存相关规则:');
    const [inventoryRules] = await connection.query(`
      SELECT id, intent_name, description, parameters, trigger_words, action_target
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%库存%' OR trigger_words LIKE '%库存%'
      ORDER BY id
      LIMIT 5
    `);
    
    for (const rule of inventoryRules) {
      console.log(`\n规则ID: ${rule.id}`);
      console.log(`意图名称: ${rule.intent_name}`);
      console.log(`描述: ${rule.description}`);
      console.log(`触发词: ${rule.trigger_words}`);
      console.log(`参数配置: ${rule.parameters}`);
      
      // 尝试解析参数配置
      if (rule.parameters) {
        try {
          const params = JSON.parse(rule.parameters);
          console.log(`解析后的参数:`, JSON.stringify(params, null, 2));
        } catch (e) {
          console.log(`❌ 参数解析失败: ${e.message}`);
        }
      }
    }
    
    // 3. 测试参数提取逻辑
    console.log('\n\n🧪 测试参数提取逻辑:');
    
    const testQuery = '查询深圳工厂库存';
    console.log(`测试查询: "${testQuery}"`);
    
    // 模拟参数提取
    const mockRule = {
      parameters: JSON.stringify({
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
      })
    };
    
    // 手动执行参数提取逻辑
    const params = {};
    const paramConfig = JSON.parse(mockRule.parameters);
    
    for (const [paramName, paramDef] of Object.entries(paramConfig)) {
      console.log(`\n检查参数: ${paramName}`);
      console.log(`extract_from: ${JSON.stringify(paramDef.extract_from)}`);
      
      if (paramDef.extract_from && Array.isArray(paramDef.extract_from)) {
        for (const keyword of paramDef.extract_from) {
          console.log(`  检查关键词: "${keyword}" 在 "${testQuery}" 中`);
          if (testQuery.includes(keyword)) {
            console.log(`  ✅ 找到匹配: "${keyword}"`);
            
            // 应用映射规则
            let value = keyword;
            if (paramDef.mapping && paramDef.mapping[keyword]) {
              value = paramDef.mapping[keyword];
              console.log(`  🔄 应用映射: "${keyword}" -> "${value}"`);
            }
            params[paramName] = value;
            break;
          } else {
            console.log(`  ❌ 不匹配: "${keyword}"`);
          }
        }
      }
    }
    
    console.log(`\n最终提取的参数: ${JSON.stringify(params)}`);
    
    // 4. 检查实际数据库中的规则是否有正确的参数配置
    console.log('\n\n🔍 检查实际规则的参数配置:');
    const [actualRules] = await connection.query(`
      SELECT id, intent_name, parameters
      FROM nlp_intent_rules 
      WHERE (intent_name LIKE '%工厂%' OR trigger_words LIKE '%工厂%')
      AND parameters IS NOT NULL
      AND parameters != ''
      ORDER BY id
    `);
    
    for (const rule of actualRules) {
      console.log(`\n规则ID: ${rule.id} - ${rule.intent_name}`);
      if (rule.parameters) {
        try {
          const params = JSON.parse(rule.parameters);
          if (params.factory && params.factory.extract_from) {
            console.log(`✅ 有工厂参数配置: ${JSON.stringify(params.factory.extract_from)}`);
          } else {
            console.log(`❌ 缺少工厂参数配置`);
          }
        } catch (e) {
          console.log(`❌ 参数解析失败: ${e.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
  
  console.log('\n🎯 规则参数调试完成');
}

debugRuleParameters().catch(console.error);
