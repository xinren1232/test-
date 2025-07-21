import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function comprehensiveRulesCheck() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 开始全面检查规则库...');
    
    // 1. 获取所有规则
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, description, priority, trigger_words, action_target
      FROM nlp_intent_rules 
      ORDER BY priority, intent_name
    `);
    
    console.log(`\n📊 当前规则总数: ${allRules.length}`);
    
    // 2. 检查重复规则
    console.log('\n🔍 检查重复规则...');
    const ruleNames = allRules.map(r => r.intent_name);
    const duplicates = [];
    const seen = new Set();
    
    ruleNames.forEach(name => {
      if (seen.has(name)) {
        duplicates.push(name);
      } else {
        seen.add(name);
      }
    });
    
    if (duplicates.length > 0) {
      console.log('❌ 发现重复规则:', duplicates);
    } else {
      console.log('✅ 未发现重复规则名称');
    }
    
    // 3. 按优先级分组显示
    console.log('\n📋 当前规则分组:');
    const groupedRules = {};
    allRules.forEach(rule => {
      if (!groupedRules[rule.priority]) {
        groupedRules[rule.priority] = [];
      }
      groupedRules[rule.priority].push(rule);
    });
    
    Object.keys(groupedRules).forEach(priority => {
      console.log(`\nPriority ${priority} (${groupedRules[priority].length}个规则):`);
      groupedRules[priority].forEach((rule, i) => {
        console.log(`  ${i+1}. ${rule.intent_name}`);
      });
    });
    
    // 4. 检查相似规则
    console.log('\n🔍 检查相似规则...');
    const similarGroups = {
      库存: [],
      测试: [],
      上线: [],
      批次: [],
      供应商: [],
      项目: [],
      基线: []
    };
    
    allRules.forEach(rule => {
      if (rule.intent_name.includes('库存')) similarGroups.库存.push(rule.intent_name);
      if (rule.intent_name.includes('测试')) similarGroups.测试.push(rule.intent_name);
      if (rule.intent_name.includes('上线')) similarGroups.上线.push(rule.intent_name);
      if (rule.intent_name.includes('批次')) similarGroups.批次.push(rule.intent_name);
      if (rule.intent_name.includes('供应商')) similarGroups.供应商.push(rule.intent_name);
      if (rule.intent_name.includes('项目')) similarGroups.项目.push(rule.intent_name);
      if (rule.intent_name.includes('基线')) similarGroups.基线.push(rule.intent_name);
    });
    
    Object.keys(similarGroups).forEach(category => {
      if (similarGroups[category].length > 1) {
        console.log(`\n${category}相关规则 (${similarGroups[category].length}个):`);
        similarGroups[category].forEach((name, i) => {
          console.log(`  ${i+1}. ${name}`);
        });
      }
    });
    
    // 5. 逻辑检查 - 测试关键规则的执行结果
    console.log('\n🧪 逻辑检查 - 测试规则执行结果...');
    
    const testRules = [
      '物料库存查询',
      '物料库存信息查询', 
      '供应商库存查询',
      '物料测试情况查询',
      '测试结果查询',
      '物料上线情况查询',
      '物料上线信息查询',
      '批次信息查询',
      '物料上线Top不良',
      '物料测试Top不良'
    ];
    
    const logicIssues = [];
    
    for (const ruleName of testRules) {
      const rule = allRules.find(r => r.intent_name === ruleName);
      if (rule) {
        try {
          const [results] = await connection.execute(rule.action_target);
          console.log(`✅ ${ruleName}: 返回${results.length}条记录`);
          
          // 检查返回字段
          if (results.length > 0) {
            const fields = Object.keys(results[0]);
            console.log(`   字段: ${fields.join(', ')}`);
            
            // 检查逻辑问题
            if (ruleName.includes('库存') && !fields.some(f => f.includes('库存') || f.includes('数量'))) {
              logicIssues.push(`${ruleName}: 库存查询但缺少库存相关字段`);
            }
            
            if (ruleName.includes('测试') && !fields.some(f => f.includes('测试') || f.includes('结果'))) {
              logicIssues.push(`${ruleName}: 测试查询但缺少测试相关字段`);
            }
            
            if (ruleName.includes('Top') && !fields.some(f => f.includes('排名') || f.includes('率'))) {
              logicIssues.push(`${ruleName}: Top排行但缺少排序相关字段`);
            }
          } else {
            logicIssues.push(`${ruleName}: 返回空结果，可能存在逻辑问题`);
          }
        } catch (error) {
          console.log(`❌ ${ruleName}: 执行失败 - ${error.message}`);
          logicIssues.push(`${ruleName}: SQL执行失败`);
        }
      } else {
        logicIssues.push(`${ruleName}: 规则不存在`);
      }
    }
    
    // 6. 输出逻辑问题总结
    if (logicIssues.length > 0) {
      console.log('\n⚠️ 发现的逻辑问题:');
      logicIssues.forEach((issue, i) => {
        console.log(`  ${i+1}. ${issue}`);
      });
    } else {
      console.log('\n✅ 未发现明显的逻辑问题');
    }
    
    // 7. 识别需要删除的重复规则
    console.log('\n🗑️ 识别需要删除的重复规则...');
    const duplicateRules = [
      ['物料库存查询', '物料库存信息查询'],
      ['物料上线情况查询', '物料上线信息查询'],
      ['物料测试情况查询', '测试结果查询'],
      ['测试NG情况查询', 'NG测试结果查询']
    ];
    
    const toDelete = [];
    duplicateRules.forEach(([rule1, rule2]) => {
      const r1 = allRules.find(r => r.intent_name === rule1);
      const r2 = allRules.find(r => r.intent_name === rule2);
      
      if (r1 && r2) {
        console.log(`发现重复: ${rule1} vs ${rule2}`);
        // 保留描述更详细的规则
        if (r1.description.length > r2.description.length) {
          toDelete.push(r2.intent_name);
          console.log(`  建议删除: ${r2.intent_name}`);
        } else {
          toDelete.push(r1.intent_name);
          console.log(`  建议删除: ${r1.intent_name}`);
        }
      }
    });
    
    console.log(`\n📋 建议删除的规则: ${toDelete.length}个`);
    toDelete.forEach((name, i) => {
      console.log(`  ${i+1}. ${name}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

comprehensiveRulesCheck();
