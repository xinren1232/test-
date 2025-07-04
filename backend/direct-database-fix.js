/**
 * 直接数据库修复 - 检查表结构并强制修复
 */

import mysql from 'mysql2/promise';

async function directDatabaseFix() {
  console.log('🔧 直接数据库修复\n');
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功\n');
    
    // 1. 检查表结构
    console.log('🔍 检查nlp_intent_rules表结构:');
    const [tableStructure] = await connection.query('DESCRIBE nlp_intent_rules');
    
    for (const column of tableStructure) {
      console.log(`  ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    }
    
    // 2. 查看parameters字段的实际内容
    console.log('\n🔍 查看parameters字段的实际内容:');
    const [currentData] = await connection.query(`
      SELECT id, intent_name, parameters, LENGTH(parameters) as param_length
      FROM nlp_intent_rules 
      WHERE id IN (78, 79, 80, 82, 84)
      ORDER BY id
    `);
    
    for (const row of currentData) {
      console.log(`\nID: ${row.id} - ${row.intent_name}`);
      console.log(`参数长度: ${row.param_length}`);
      console.log(`参数内容: "${row.parameters}"`);
      console.log(`参数类型: ${typeof row.parameters}`);
    }
    
    // 3. 尝试删除并重新插入参数
    console.log('\n🔧 清空并重新设置参数:');
    
    // 先清空所有问题参数
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET parameters = NULL 
      WHERE id IN (78, 79, 80, 82, 84)
    `);
    console.log('✅ 已清空问题参数');
    
    // 重新设置规则ID 82的参数
    const factoryParamsStr = '{"factory":{"type":"string","description":"工厂名称","extract_from":["深圳工厂","重庆工厂","南昌工厂","宜宾工厂","深圳","重庆","南昌","宜宾"],"mapping":{"深圳":"深圳工厂","重庆":"重庆工厂","南昌":"南昌工厂","宜宾":"宜宾工厂"}}}';
    
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET parameters = ?
      WHERE id = 82
    `, [factoryParamsStr]);
    
    console.log('✅ 已设置规则ID 82的参数');
    
    // 重新设置规则ID 80的参数
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET parameters = ?
      WHERE id = 80
    `, [factoryParamsStr]);
    
    console.log('✅ 已设置规则ID 80的参数');
    
    // 重新设置规则ID 78的参数
    const supplierParamsStr = '{"supplier":{"type":"string","description":"供应商名称","extract_from":["聚龙","BOE","歌尔","欣冠","广正","紫光","黑龙","欣旺","比亚迪","宁德时代"],"mapping":{}}}';
    
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET parameters = ?
      WHERE id = 78
    `, [supplierParamsStr]);
    
    console.log('✅ 已设置规则ID 78的参数');
    
    // 重新设置规则ID 79的参数
    const materialParamsStr = '{"material":{"type":"string","description":"物料名称","extract_from":["电池盖","中框","LCD显示屏","OLED显示屏","摄像头模组","电容器","电阻器","传感器"],"mapping":{}}}';
    
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET parameters = ?
      WHERE id = 79
    `, [materialParamsStr]);
    
    console.log('✅ 已设置规则ID 79的参数');
    
    // 重新设置规则ID 84的参数
    const combinedParamsStr = '{"supplier":{"type":"string","description":"供应商名称","extract_from":["聚龙","BOE","歌尔","欣冠","广正","紫光","黑龙","欣旺"],"mapping":{}},"material":{"type":"string","description":"物料名称","extract_from":["电池盖","中框","LCD显示屏","OLED显示屏","摄像头模组","电容器","电阻器"],"mapping":{}}}';
    
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET parameters = ?
      WHERE id = 84
    `, [combinedParamsStr]);
    
    console.log('✅ 已设置规则ID 84的参数');
    
    // 4. 验证修复结果
    console.log('\n🔍 验证修复结果:');
    const [verifyData] = await connection.query(`
      SELECT id, intent_name, parameters
      FROM nlp_intent_rules 
      WHERE id IN (78, 79, 80, 82, 84)
      ORDER BY id
    `);
    
    for (const row of verifyData) {
      console.log(`\nID: ${row.id} - ${row.intent_name}`);
      if (row.parameters) {
        try {
          const params = JSON.parse(row.parameters);
          console.log(`✅ 参数解析成功:`, Object.keys(params));
          
          // 显示extract_from配置
          for (const [paramName, paramDef] of Object.entries(params)) {
            if (paramDef.extract_from && Array.isArray(paramDef.extract_from)) {
              console.log(`  ${paramName}: ${paramDef.extract_from.length} 个关键词`);
            }
          }
        } catch (e) {
          console.log(`❌ 参数解析失败: ${e.message}`);
          console.log(`原始参数: ${row.parameters}`);
        }
      } else {
        console.log(`⚠️ 无参数配置`);
      }
    }
    
    // 5. 测试参数提取功能
    console.log('\n🧪 测试参数提取功能:');
    
    const testQuery = '查询深圳工厂库存';
    console.log(`测试查询: "${testQuery}"`);
    
    // 获取修复后的规则
    const [testRule] = await connection.query(`
      SELECT id, intent_name, parameters
      FROM nlp_intent_rules 
      WHERE id = 82
    `);
    
    if (testRule.length > 0 && testRule[0].parameters) {
      try {
        const paramConfig = JSON.parse(testRule[0].parameters);
        const extractedParams = {};
        
        console.log('参数配置:', JSON.stringify(paramConfig, null, 2));
        
        for (const [paramName, paramDef] of Object.entries(paramConfig)) {
          console.log(`\n检查参数: ${paramName}`);
          if (paramDef.extract_from && Array.isArray(paramDef.extract_from)) {
            console.log(`关键词列表: ${JSON.stringify(paramDef.extract_from)}`);
            
            for (const keyword of paramDef.extract_from) {
              console.log(`  检查关键词: "${keyword}" 在 "${testQuery}" 中`);
              if (testQuery.includes(keyword)) {
                console.log(`  ✅ 找到匹配: "${keyword}"`);
                
                let value = keyword;
                if (paramDef.mapping && paramDef.mapping[keyword]) {
                  value = paramDef.mapping[keyword];
                  console.log(`  🔄 应用映射: "${keyword}" -> "${value}"`);
                }
                extractedParams[paramName] = value;
                break;
              }
            }
          }
        }
        
        console.log(`\n最终提取的参数: ${JSON.stringify(extractedParams)}`);
        
        if (Object.keys(extractedParams).length > 0) {
          console.log('✅ 参数提取测试成功！');
        } else {
          console.log('❌ 参数提取测试失败');
        }
        
      } catch (e) {
        console.log(`❌ 测试失败: ${e.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 直接修复过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
  
  console.log('\n🎯 直接数据库修复完成');
}

directDatabaseFix().catch(console.error);
