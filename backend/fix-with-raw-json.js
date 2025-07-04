/**
 * 使用原始JSON字符串修复参数
 */

import mysql from 'mysql2/promise';

async function fixWithRawJSON() {
  console.log('🔧 使用原始JSON字符串修复参数\n');
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功\n');
    
    // 1. 删除刚才创建的有问题的规则
    console.log('🗑️ 删除有问题的规则:');
    await connection.query(`DELETE FROM nlp_intent_rules WHERE id IN (88, 89, 90, 91, 92)`);
    console.log('✅ 已删除有问题的规则');
    
    // 2. 使用原始JSON字符串创建规则
    console.log('\n🔧 使用原始JSON字符串创建规则:');
    
    // 规则1: 工厂库存查询
    const factoryParamsJSON = '{"factory":{"type":"string","description":"工厂名称","extract_from":["深圳工厂","重庆工厂","南昌工厂","宜宾工厂","深圳","重庆","南昌","宜宾"],"mapping":{"深圳":"深圳工厂","重庆":"重庆工厂","南昌":"南昌工厂","宜宾":"宜宾工厂"}}}';
    
    // 先测试JSON是否有效
    try {
      JSON.parse(factoryParamsJSON);
      console.log('✅ 工厂参数JSON格式有效');
    } catch (e) {
      console.log('❌ 工厂参数JSON格式无效:', e.message);
      return;
    }
    
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
      factoryParamsJSON,  // 直接使用字符串
      '["重庆工厂","深圳工厂","南昌工厂","宜宾工厂","重庆","深圳","南昌","宜宾","工厂","库存"]',
      '{}',
      5,
      'active'
    ]);
    
    console.log('✅ 已创建工厂库存查询规则');
    
    // 规则2: 供应商查询
    const supplierParamsJSON = '{"supplier":{"type":"string","description":"供应商名称","extract_from":["聚龙","BOE","歌尔","欣冠","广正","紫光","黑龙","欣旺","比亚迪","宁德时代"],"mapping":{}}}';
    
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
      supplierParamsJSON,
      '["供应商","聚龙","BOE","歌尔","欣冠","广正","紫光","黑龙","欣旺"]',
      '{}',
      3,
      'active'
    ]);
    
    console.log('✅ 已创建供应商查询规则');
    
    // 3. 立即验证新创建的规则
    console.log('\n🔍 立即验证新创建的规则:');
    const [newRules] = await connection.query(`
      SELECT id, intent_name, parameters
      FROM nlp_intent_rules 
      WHERE intent_name IN ('工厂库存查询', '供应商查询')
      ORDER BY id DESC
      LIMIT 2
    `);
    
    for (const rule of newRules) {
      console.log(`\nID: ${rule.id} - ${rule.intent_name}`);
      console.log(`原始参数: ${rule.parameters}`);
      console.log(`参数类型: ${typeof rule.parameters}`);
      
      if (rule.parameters) {
        try {
          const params = JSON.parse(rule.parameters);
          console.log(`✅ 参数解析成功:`, Object.keys(params));
          
          // 显示extract_from配置
          for (const [paramName, paramDef] of Object.entries(params)) {
            if (paramDef.extract_from && Array.isArray(paramDef.extract_from)) {
              console.log(`  ${paramName}: ${paramDef.extract_from.length} 个关键词`);
              console.log(`    前3个: [${paramDef.extract_from.slice(0, 3).join(', ')}]`);
            }
          }
        } catch (e) {
          console.log(`❌ 参数解析失败: ${e.message}`);
        }
      }
    }
    
    // 4. 测试参数提取功能
    console.log('\n🧪 测试参数提取功能:');
    
    const testCases = [
      { query: '查询深圳工厂库存', expected: 'factory', value: '深圳工厂' },
      { query: '查询聚龙供应商的物料', expected: 'supplier', value: '聚龙' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n测试: "${testCase.query}"`);
      
      // 获取相应的规则
      const ruleName = testCase.expected === 'factory' ? '工厂库存查询' : '供应商查询';
      const [rules] = await connection.query(`
        SELECT parameters FROM nlp_intent_rules WHERE intent_name = ?
      `, [ruleName]);
      
      if (rules.length > 0 && rules[0].parameters) {
        try {
          const paramConfig = JSON.parse(rules[0].parameters);
          const extractedParams = {};
          
          for (const [paramName, paramDef] of Object.entries(paramConfig)) {
            if (paramDef.extract_from && Array.isArray(paramDef.extract_from)) {
              for (const keyword of paramDef.extract_from) {
                if (testCase.query.includes(keyword)) {
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
          
          if (extractedParams[testCase.expected] === testCase.value) {
            console.log('✅ 参数提取测试成功！');
          } else {
            console.log(`❌ 参数提取测试失败，期望: ${testCase.expected}=${testCase.value}`);
          }
          
        } catch (e) {
          console.log(`❌ 测试失败: ${e.message}`);
        }
      } else {
        console.log('❌ 未找到规则或参数配置');
      }
    }
    
    // 5. 如果测试成功，现在测试实际的查询API
    if (newRules.length > 0) {
      console.log('\n🚀 测试实际的查询API:');
      
      // 这里我们需要导入并测试实际的服务
      try {
        // 模拟API调用测试
        const testQuery = '查询深圳工厂库存';
        console.log(`API测试查询: "${testQuery}"`);
        
        // 获取工厂库存查询规则
        const [factoryRule] = await connection.query(`
          SELECT * FROM nlp_intent_rules WHERE intent_name = '工厂库存查询'
        `);
        
        if (factoryRule.length > 0) {
          const rule = factoryRule[0];
          console.log(`使用规则: ID ${rule.id} - ${rule.intent_name}`);
          
          // 手动执行参数提取逻辑
          const paramConfig = JSON.parse(rule.parameters);
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
          
          console.log(`API测试 - 提取的参数: ${JSON.stringify(extractedParams)}`);
          
          if (extractedParams.factory) {
            console.log('✅ API测试准备就绪 - 参数提取正常工作！');
            console.log('🎯 现在可以测试完整的查询流程了');
          } else {
            console.log('❌ API测试失败 - 参数提取不工作');
          }
        }
        
      } catch (e) {
        console.log(`❌ API测试失败: ${e.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
  
  console.log('\n🎯 原始JSON字符串修复完成');
}

fixWithRawJSON().catch(console.error);
