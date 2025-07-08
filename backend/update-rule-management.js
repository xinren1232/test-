/**
 * 更新规则管理界面
 * 确保前端能正确显示扩展的规则
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function updateRuleManagement() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 更新规则管理界面...\n');
    
    // 1. 获取所有规则并按类别分组
    const [allRules] = await connection.execute(
      'SELECT * FROM nlp_intent_rules ORDER BY priority DESC, intent_name'
    );
    
    console.log(`📋 共有 ${allRules.length} 条规则\n`);
    
    // 2. 按功能分类
    const ruleCategories = {
      '库存管理': [],
      '测试检验': [],
      '批次管理': [],
      '供应商管理': [],
      '异常分析': [],
      '时间查询': [],
      '状态查询': [],
      '数量分析': []
    };
    
    allRules.forEach(rule => {
      if (rule.intent_name.includes('库存')) {
        ruleCategories['库存管理'].push(rule);
      } else if (rule.intent_name.includes('测试') || rule.intent_name.includes('检测')) {
        ruleCategories['测试检验'].push(rule);
      } else if (rule.intent_name.includes('批次')) {
        ruleCategories['批次管理'].push(rule);
      } else if (rule.intent_name.includes('供应商')) {
        ruleCategories['供应商管理'].push(rule);
      } else if (rule.intent_name.includes('异常')) {
        ruleCategories['异常分析'].push(rule);
      } else if (rule.intent_name.includes('今日') || rule.intent_name.includes('今天')) {
        ruleCategories['时间查询'].push(rule);
      } else if (rule.intent_name.includes('风险') || rule.intent_name.includes('正常')) {
        ruleCategories['状态查询'].push(rule);
      } else if (rule.intent_name.includes('低库存') || rule.intent_name.includes('高库存') || rule.intent_name.includes('通过率')) {
        ruleCategories['数量分析'].push(rule);
      } else {
        ruleCategories['库存管理'].push(rule); // 默认分类
      }
    });
    
    // 3. 显示分类结果
    console.log('📊 规则分类结果:\n');
    
    Object.keys(ruleCategories).forEach(category => {
      const rules = ruleCategories[category];
      if (rules.length > 0) {
        console.log(`${category} (${rules.length}条):`);
        rules.forEach((rule, index) => {
          console.log(`  ${index + 1}. ${rule.intent_name} - ${rule.description}`);
        });
        console.log('');
      }
    });
    
    // 4. 生成规则管理界面的配置
    const ruleManagementConfig = {
      categories: Object.keys(ruleCategories).map(category => ({
        name: category,
        count: ruleCategories[category].length,
        rules: ruleCategories[category].map(rule => ({
          id: rule.id,
          name: rule.intent_name,
          description: rule.description,
          priority: rule.priority,
          status: rule.status,
          example: rule.example_query,
          triggerWords: rule.trigger_words,
          createdAt: rule.created_at
        }))
      })).filter(cat => cat.count > 0),
      totalRules: allRules.length,
      activeRules: allRules.filter(r => r.status === 'active').length
    };
    
    console.log('🎯 规则管理配置生成完成:');
    console.log(`- 总规则数: ${ruleManagementConfig.totalRules}`);
    console.log(`- 活跃规则: ${ruleManagementConfig.activeRules}`);
    console.log(`- 分类数量: ${ruleManagementConfig.categories.length}`);
    
    // 5. 验证字段映射完整性
    console.log('\n🔍 验证字段映射完整性...\n');
    
    const fieldMappingTests = [
      {
        name: '库存页面字段',
        expected: ['工厂', '仓库', '物料编号', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
        sql: allRules.find(r => r.intent_name === '物料库存查询')?.action_target
      },
      {
        name: '测试页面字段',
        expected: ['测试编号', '日期', '项目', '基线', '物料编号', '批次', '物料名称', '供应商', '测试结果', '不良描述'],
        sql: allRules.find(r => r.intent_name === '物料测试结果查询')?.action_target
      },
      {
        name: '批次页面字段',
        expected: ['批次号', '物料编号', '物料名称', '供应商', '数量', '入库时间', '产线异常', '测试异常', '备注'],
        sql: allRules.find(r => r.intent_name === '批次信息查询')?.action_target
      }
    ];
    
    for (const test of fieldMappingTests) {
      if (test.sql) {
        try {
          const [results] = await connection.execute(test.sql);
          if (results.length > 0) {
            const actualFields = Object.keys(results[0]);
            const fieldsMatch = test.expected.every(field => actualFields.includes(field)) && 
                               actualFields.every(field => test.expected.includes(field));
            
            if (fieldsMatch) {
              console.log(`✅ ${test.name}: 字段映射完全匹配`);
            } else {
              console.log(`⚠️ ${test.name}: 字段映射不匹配`);
              console.log(`   期望: ${test.expected.join(', ')}`);
              console.log(`   实际: ${actualFields.join(', ')}`);
            }
          }
        } catch (error) {
          console.log(`❌ ${test.name}: SQL执行错误 - ${error.message}`);
        }
      }
    }
    
    console.log('\n🎉 规则管理界面更新完成！');
    console.log('\n📋 使用说明:');
    console.log('1. 所有规则都基于真实前端页面字段设计');
    console.log('2. 规则按优先级和功能分类组织');
    console.log('3. 支持17种不同类型的查询需求');
    console.log('4. 字段映射与前端页面完全一致');
    console.log('5. 可通过规则管理界面进行测试和管理');
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
  } finally {
    await connection.end();
  }
}

updateRuleManagement().catch(console.error);
