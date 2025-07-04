/**
 * 强制修复参数配置 - 直接替换所有[object Object]
 */

import mysql from 'mysql2/promise';

async function forceFixParameters() {
  console.log('🔧 强制修复参数配置\n');
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功\n');
    
    // 1. 查看当前有问题的规则
    console.log('🔍 查看当前有问题的规则:');
    const [problemRules] = await connection.query(`
      SELECT id, intent_name, parameters
      FROM nlp_intent_rules 
      WHERE parameters = '[object Object]' OR parameters LIKE '%[object Object]%'
      ORDER BY id
    `);
    
    console.log(`找到 ${problemRules.length} 个有问题的规则:`);
    for (const rule of problemRules) {
      console.log(`  ID: ${rule.id} - ${rule.intent_name}`);
    }
    
    // 2. 逐个修复每个规则
    console.log('\n🔧 开始逐个修复:');
    
    // 修复规则ID 82 - 工厂库存查询
    console.log('修复规则ID 82 - 工厂库存查询...');
    const factoryParams = JSON.stringify({
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
    });
    
    await connection.query('UPDATE nlp_intent_rules SET parameters = ? WHERE id = 82', [factoryParams]);
    console.log('✅ 规则ID 82 已修复');
    
    // 修复规则ID 80 - 车间生产分析
    console.log('修复规则ID 80 - 车间生产分析...');
    await connection.query('UPDATE nlp_intent_rules SET parameters = ? WHERE id = 80', [factoryParams]);
    console.log('✅ 规则ID 80 已修复');
    
    // 修复规则ID 78 - 供应商查询
    console.log('修复规则ID 78 - 供应商查询...');
    const supplierParams = JSON.stringify({
      "supplier": {
        "type": "string",
        "description": "供应商名称",
        "extract_from": ["聚龙", "BOE", "歌尔", "欣冠", "广正", "紫光", "黑龙", "欣旺", "比亚迪", "宁德时代"],
        "mapping": {}
      }
    });
    
    await connection.query('UPDATE nlp_intent_rules SET parameters = ? WHERE id = 78', [supplierParams]);
    console.log('✅ 规则ID 78 已修复');
    
    // 修复规则ID 79 - 物料质量分析
    console.log('修复规则ID 79 - 物料质量分析...');
    const materialParams = JSON.stringify({
      "material": {
        "type": "string",
        "description": "物料名称",
        "extract_from": ["电池盖", "中框", "LCD显示屏", "OLED显示屏", "摄像头模组", "电容器", "电阻器", "传感器"],
        "mapping": {}
      }
    });
    
    await connection.query('UPDATE nlp_intent_rules SET parameters = ? WHERE id = 79', [materialParams]);
    console.log('✅ 规则ID 79 已修复');
    
    // 修复规则ID 84 - 供应商物料查询
    console.log('修复规则ID 84 - 供应商物料查询...');
    const combinedParams = JSON.stringify({
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
    });
    
    await connection.query('UPDATE nlp_intent_rules SET parameters = ? WHERE id = 84', [combinedParams]);
    console.log('✅ 规则ID 84 已修复');
    
    // 3. 验证修复结果
    console.log('\n🔍 验证修复结果:');
    const [fixedRules] = await connection.query(`
      SELECT id, intent_name, parameters
      FROM nlp_intent_rules 
      WHERE id IN (78, 79, 80, 82, 84)
      ORDER BY id
    `);
    
    for (const rule of fixedRules) {
      console.log(`\n规则ID: ${rule.id} - ${rule.intent_name}`);
      if (rule.parameters) {
        try {
          const params = JSON.parse(rule.parameters);
          console.log(`✅ 参数解析成功:`, Object.keys(params));
          
          // 显示每个参数的extract_from配置
          for (const [paramName, paramDef] of Object.entries(params)) {
            if (paramDef.extract_from && Array.isArray(paramDef.extract_from)) {
              console.log(`  ${paramName}: [${paramDef.extract_from.slice(0, 3).join(', ')}...] (${paramDef.extract_from.length}个)`);
            }
          }
        } catch (e) {
          console.log(`❌ 参数解析失败: ${e.message}`);
          console.log(`原始参数: ${rule.parameters}`);
        }
      } else {
        console.log(`⚠️ 无参数配置`);
      }
    }
    
    // 4. 立即测试修复后的查询
    console.log('\n🧪 立即测试修复后的查询:');
    
    // 导入智能意图服务进行测试
    const testQuery = '查询深圳工厂库存';
    console.log(`测试查询: "${testQuery}"`);
    
    // 查找匹配的规则
    const [matchingRules] = await connection.query(`
      SELECT id, intent_name, parameters, trigger_words
      FROM nlp_intent_rules 
      WHERE trigger_words LIKE '%工厂%' AND trigger_words LIKE '%库存%'
      ORDER BY id
      LIMIT 1
    `);
    
    if (matchingRules.length > 0) {
      const rule = matchingRules[0];
      console.log(`匹配规则: ID ${rule.id} - ${rule.intent_name}`);
      
      // 手动执行参数提取
      if (rule.parameters) {
        try {
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
          
          console.log(`提取的参数: ${JSON.stringify(extractedParams)}`);
          
          if (Object.keys(extractedParams).length > 0) {
            console.log('✅ 参数提取成功！');
          } else {
            console.log('❌ 参数提取失败');
          }
          
        } catch (e) {
          console.log(`❌ 参数配置解析失败: ${e.message}`);
        }
      }
    } else {
      console.log('❌ 未找到匹配的规则');
    }
    
  } catch (error) {
    console.error('❌ 强制修复过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
  
  console.log('\n🎯 强制修复完成');
}

forceFixParameters().catch(console.error);
