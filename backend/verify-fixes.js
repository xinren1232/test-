import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

/**
 * 验证修复效果
 * 1. 验证规则示例问题是否基于真实数据
 * 2. 验证呈现结果字段是否符合预期设计
 */

async function verifyFixes() {
  try {
    console.log('🔍 验证修复效果...\n');
    
    // 1. 验证规则示例问题
    console.log('📋 1. 验证规则示例问题...');
    await verifyRuleExamples();
    
    // 2. 验证呈现结果字段设计
    console.log('\n🎨 2. 验证呈现结果字段设计...');
    await verifyFieldDesign();
    
    // 3. 测试具体规则执行效果
    console.log('\n🧪 3. 测试具体规则执行效果...');
    await testSpecificRules();
    
    console.log('\n🎉 验证完成！');
    
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error);
  } finally {
    await connection.end();
  }
}

/**
 * 验证规则示例问题
 */
async function verifyRuleExamples() {
  // 检查更新后的触发词
  const [rulesWithExamples] = await connection.execute(`
    SELECT intent_name, category, trigger_words
    FROM nlp_intent_rules 
    WHERE status = 'active'
    AND JSON_LENGTH(trigger_words) > 0
    ORDER BY category, intent_name
    LIMIT 10
  `);
  
  console.log('📊 示例问题验证 (前10个规则):');
  
  for (const rule of rulesWithExamples) {
    const examples = JSON.parse(rule.trigger_words);
    console.log(`\n✅ ${rule.intent_name} (${rule.category || '未分类'})`);
    console.log(`   示例问题: ${examples.join(', ')}`);
    
    // 检查示例是否包含真实数据元素
    const hasRealData = examples.some(example => 
      example.includes('聚龙') || 
      example.includes('BOE') || 
      example.includes('B000001') ||
      example.includes('电池') ||
      example.includes('显示屏')
    );
    
    console.log(`   包含真实数据: ${hasRealData ? '✅ 是' : '❌ 否'}`);
  }
}

/**
 * 验证呈现结果字段设计
 */
async function verifyFieldDesign() {
  const expectedFields = {
    '库存场景': ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
    '测试场景': ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
    '上线场景': ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
    '批次管理': ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注']
  };
  
  for (const [category, expectedFieldList] of Object.entries(expectedFields)) {
    console.log(`\n📋 ${category}字段验证:`);
    
    // 获取该分类的一个规则进行测试
    const [rules] = await connection.execute(`
      SELECT intent_name, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active' AND category = ?
      LIMIT 1
    `, [category]);
    
    if (rules.length > 0) {
      const rule = rules[0];
      
      try {
        const [results] = await connection.execute(rule.action_target);
        
        if (results.length > 0) {
          const actualFields = Object.keys(results[0]);
          console.log(`  实际字段: ${actualFields.join(', ')}`);
          console.log(`  期望字段: ${expectedFieldList.join(', ')}`);
          
          // 计算匹配度
          const matchedFields = actualFields.filter(field => expectedFieldList.includes(field));
          const matchRate = Math.round((matchedFields.length / expectedFieldList.length) * 100);
          
          console.log(`  匹配度: ${matchRate}% (${matchedFields.length}/${expectedFieldList.length})`);
          
          if (matchRate >= 90) {
            console.log(`  ✅ ${category}字段设计优秀`);
          } else if (matchRate >= 70) {
            console.log(`  ⚠️ ${category}字段设计良好`);
            const missingFields = expectedFieldList.filter(field => !actualFields.includes(field));
            if (missingFields.length > 0) {
              console.log(`  缺失字段: ${missingFields.join(', ')}`);
            }
          } else {
            console.log(`  ❌ ${category}字段设计需要改进`);
          }
          
          // 显示示例数据
          console.log(`  示例数据:`);
          const example = results[0];
          Object.entries(example).slice(0, 3).forEach(([key, value]) => {
            console.log(`    ${key}: ${value}`);
          });
          
        } else {
          console.log(`  ⚠️ ${category}无查询结果`);
        }
        
      } catch (error) {
        console.log(`  ❌ ${category}SQL执行失败: ${error.message.substring(0, 50)}...`);
      }
    } else {
      console.log(`  ⚠️ 未找到${category}的规则`);
    }
  }
}

/**
 * 测试具体规则执行效果
 */
async function testSpecificRules() {
  // 测试一些具体的规则
  const testCases = [
    { name: '聚龙供应商库存查询', expectedSupplier: '聚龙' },
    { name: 'BOE供应商库存查询', expectedSupplier: 'BOE' },
    { name: '库存状态查询', expectedFields: ['工厂', '仓库', '物料编码'] },
    { name: '供应商测试情况查询', expectedFields: ['测试编号', '测试结果'] }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🧪 测试规则: ${testCase.name}`);
    
    try {
      const [rules] = await connection.execute(`
        SELECT action_target, trigger_words
        FROM nlp_intent_rules 
        WHERE intent_name = ? AND status = 'active'
      `, [testCase.name]);
      
      if (rules.length > 0) {
        const rule = rules[0];
        const examples = JSON.parse(rule.trigger_words);
        
        console.log(`  示例问题: ${examples.slice(0, 2).join(', ')}`);
        
        const [results] = await connection.execute(rule.action_target);
        console.log(`  查询结果: ${results.length}条记录`);
        
        if (results.length > 0) {
          const fields = Object.keys(results[0]);
          console.log(`  返回字段: ${fields.join(', ')}`);
          
          // 验证特定条件
          if (testCase.expectedSupplier) {
            const hasExpectedSupplier = results.some(record => 
              record.供应商 === testCase.expectedSupplier || 
              record.supplier_name === testCase.expectedSupplier
            );
            console.log(`  包含${testCase.expectedSupplier}数据: ${hasExpectedSupplier ? '✅ 是' : '❌ 否'}`);
          }
          
          if (testCase.expectedFields) {
            const hasExpectedFields = testCase.expectedFields.every(field => fields.includes(field));
            console.log(`  包含期望字段: ${hasExpectedFields ? '✅ 是' : '❌ 否'}`);
          }
          
          // 显示示例数据
          const example = results[0];
          console.log(`  示例数据: ${JSON.stringify(example).substring(0, 100)}...`);
          
        } else {
          console.log(`  ⚠️ 无查询结果`);
        }
        
      } else {
        console.log(`  ❌ 未找到规则`);
      }
      
    } catch (error) {
      console.log(`  ❌ 测试失败: ${error.message}`);
    }
  }
}

// 执行验证
verifyFixes();
