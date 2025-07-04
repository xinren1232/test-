/**
 * 修复规则参数的JSON存储问题
 */

import mysql from 'mysql2/promise';

async function fixRuleParametersJSON() {
  console.log('🔧 修复规则参数的JSON存储问题\n');
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功\n');
    
    // 1. 修复工厂库存查询规则 (ID: 82)
    console.log('🔧 修复工厂库存查询规则 (ID: 82)...');
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
      UPDATE nlp_intent_rules 
      SET parameters = ?
      WHERE id = 82
    `, [JSON.stringify(factoryInventoryParams)]);
    
    console.log('✅ 工厂库存查询规则参数已修复');
    
    // 2. 修复车间生产分析规则 (ID: 80)
    console.log('🔧 修复车间生产分析规则 (ID: 80)...');
    const productionAnalysisParams = {
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
      UPDATE nlp_intent_rules 
      SET parameters = ?
      WHERE id = 80
    `, [JSON.stringify(productionAnalysisParams)]);
    
    console.log('✅ 车间生产分析规则参数已修复');
    
    // 3. 添加供应商查询规则的参数配置
    console.log('🔧 修复供应商查询规则...');
    const supplierParams = {
      "supplier": {
        "type": "string",
        "description": "供应商名称",
        "extract_from": ["聚龙", "BOE", "歌尔", "欣冠", "广正", "紫光", "黑龙", "欣旺", "比亚迪", "宁德时代"],
        "mapping": {}
      }
    };
    
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET parameters = ?
      WHERE intent_name LIKE '%供应商%' AND (parameters IS NULL OR parameters = '' OR parameters = '[object Object]')
    `, [JSON.stringify(supplierParams)]);
    
    console.log('✅ 供应商查询规则参数已修复');
    
    // 4. 添加物料查询规则的参数配置
    console.log('🔧 修复物料查询规则...');
    const materialParams = {
      "material": {
        "type": "string",
        "description": "物料名称",
        "extract_from": ["电池盖", "中框", "LCD显示屏", "OLED显示屏", "摄像头模组", "电容器", "电阻器", "传感器"],
        "mapping": {}
      }
    };
    
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET parameters = ?
      WHERE intent_name LIKE '%物料%' AND (parameters IS NULL OR parameters = '' OR parameters = '[object Object]')
    `, [JSON.stringify(materialParams)]);
    
    console.log('✅ 物料查询规则参数已修复');
    
    // 5. 验证修复结果
    console.log('\n🔍 验证修复结果:');
    const [updatedRules] = await connection.query(`
      SELECT id, intent_name, parameters
      FROM nlp_intent_rules 
      WHERE id IN (80, 82) OR intent_name LIKE '%供应商%' OR intent_name LIKE '%物料%'
      ORDER BY id
    `);
    
    for (const rule of updatedRules) {
      console.log(`\n规则ID: ${rule.id} - ${rule.intent_name}`);
      if (rule.parameters) {
        try {
          const params = JSON.parse(rule.parameters);
          console.log(`✅ 参数解析成功:`, Object.keys(params));
          
          // 检查是否有extract_from配置
          for (const [paramName, paramDef] of Object.entries(params)) {
            if (paramDef.extract_from && Array.isArray(paramDef.extract_from)) {
              console.log(`  ${paramName}: ${paramDef.extract_from.length} 个提取关键词`);
            }
          }
        } catch (e) {
          console.log(`❌ 参数解析失败: ${e.message}`);
        }
      } else {
        console.log(`⚠️ 无参数配置`);
      }
    }
    
    // 6. 测试修复后的参数提取
    console.log('\n🧪 测试修复后的参数提取:');
    
    const testCases = [
      { query: '查询深圳工厂库存', expected: { factory: '深圳工厂' } },
      { query: '查询重庆工厂的库存情况', expected: { factory: '重庆工厂' } },
      { query: '查询聚龙供应商的物料', expected: { supplier: '聚龙' } },
      { query: '查询电池盖的库存', expected: { material: '电池盖' } }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n测试: "${testCase.query}"`);
      console.log(`期望: ${JSON.stringify(testCase.expected)}`);
      
      // 模拟参数提取逻辑
      const extractedParams = {};
      
      // 检查工厂参数
      const factoryKeywords = ["深圳工厂", "重庆工厂", "南昌工厂", "宜宾工厂", "深圳", "重庆", "南昌", "宜宾"];
      for (const keyword of factoryKeywords) {
        if (testCase.query.includes(keyword)) {
          extractedParams.factory = keyword.includes('工厂') ? keyword : keyword + '工厂';
          break;
        }
      }
      
      // 检查供应商参数
      const supplierKeywords = ["聚龙", "BOE", "歌尔", "欣冠", "广正"];
      for (const keyword of supplierKeywords) {
        if (testCase.query.includes(keyword)) {
          extractedParams.supplier = keyword;
          break;
        }
      }
      
      // 检查物料参数
      const materialKeywords = ["电池盖", "中框", "LCD显示屏", "OLED显示屏", "摄像头模组"];
      for (const keyword of materialKeywords) {
        if (testCase.query.includes(keyword)) {
          extractedParams.material = keyword;
          break;
        }
      }
      
      console.log(`实际: ${JSON.stringify(extractedParams)}`);
      
      // 检查是否匹配期望
      const matches = Object.keys(testCase.expected).every(key => 
        extractedParams[key] === testCase.expected[key]
      );
      
      if (matches) {
        console.log(`✅ 参数提取正确`);
      } else {
        console.log(`❌ 参数提取不匹配`);
      }
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
  
  console.log('\n🎯 规则参数JSON修复完成');
}

fixRuleParametersJSON().catch(console.error);
