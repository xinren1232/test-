/**
 * 测试验证扩展的NLP规则
 * 基于真实前端字段设计的规则测试
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 测试查询列表
const TEST_QUERIES = [
  {
    query: '查询物料库存信息',
    expectedRule: '物料库存查询',
    description: '测试库存页面字段显示'
  },
  {
    query: '统计各工厂库存情况',
    expectedRule: '工厂库存统计',
    description: '测试工厂库存统计'
  },
  {
    query: '查询物料测试结果',
    expectedRule: '物料测试结果查询',
    description: '测试测试页面字段显示'
  },
  {
    query: '查询OK测试结果',
    expectedRule: 'OK测试结果统计',
    description: '测试OK测试统计'
  },
  {
    query: '查询NG测试结果',
    expectedRule: 'NG测试结果统计',
    description: '测试NG测试统计'
  },
  {
    query: '查询批次信息',
    expectedRule: '批次信息查询',
    description: '测试批次页面字段显示'
  },
  {
    query: '分析供应商质量表现',
    expectedRule: '供应商质量分析',
    description: '测试供应商质量分析'
  },
  {
    query: '统计异常情况',
    expectedRule: '异常统计分析',
    description: '测试异常统计分析'
  }
];

// 简单的意图匹配函数
function matchIntent(query, rules) {
  let bestMatch = null;
  let maxScore = 0;

  for (const rule of rules) {
    try {
      // 处理Buffer对象或字符串
      let triggerWordsStr = rule.trigger_words;
      if (Buffer.isBuffer(triggerWordsStr)) {
        triggerWordsStr = triggerWordsStr.toString();
      }

      // 确保是字符串类型
      if (typeof triggerWordsStr !== 'string') {
        triggerWordsStr = String(triggerWordsStr);
      }

      // 如果是JSON格式，解析它；否则按逗号分割
      let triggerWords;
      if (triggerWordsStr.startsWith('[') && triggerWordsStr.endsWith(']')) {
        triggerWords = JSON.parse(triggerWordsStr);
      } else {
        triggerWords = triggerWordsStr.split(',').map(w => w.trim());
      }

      let score = 0;

      for (const word of triggerWords) {
        if (query.includes(word)) {
          score += 1;
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestMatch = rule;
      }
    } catch (error) {
      console.log(`⚠️ 解析规则 ${rule.intent_name} 的触发词时出错:`, error.message);
      console.log(`触发词原始数据:`, rule.trigger_words);
      console.log(`触发词类型:`, typeof rule.trigger_words);
    }
  }

  return bestMatch;
}

async function testExpandedRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🧪 开始测试扩展的NLP规则...\n');
    
    // 1. 获取所有规则
    const [rules] = await connection.execute(
      'SELECT * FROM nlp_intent_rules ORDER BY priority DESC'
    );
    
    console.log(`📋 共有 ${rules.length} 条规则可供测试\n`);
    
    // 2. 测试每个查询
    for (const testCase of TEST_QUERIES) {
      console.log(`🔍 测试查询: "${testCase.query}"`);
      console.log(`📝 描述: ${testCase.description}`);
      console.log(`🎯 期望规则: ${testCase.expectedRule}`);
      
      // 匹配意图
      const matchedRule = matchIntent(testCase.query, rules);
      
      if (matchedRule) {
        console.log(`✅ 匹配规则: ${matchedRule.intent_name}`);
        
        // 验证是否匹配期望规则
        if (matchedRule.intent_name === testCase.expectedRule) {
          console.log(`🎉 匹配正确！`);
        } else {
          console.log(`⚠️ 匹配不符合期望`);
        }
        
        // 执行SQL查询测试
        try {
          console.log(`🔄 执行SQL查询测试...`);
          const [results] = await connection.execute(matchedRule.action_target);
          console.log(`📊 查询结果: ${results.length} 条记录`);
          
          if (results.length > 0) {
            console.log(`📋 字段列表: ${Object.keys(results[0]).join(', ')}`);
            console.log(`📄 示例数据:`, results[0]);
          }
          
        } catch (sqlError) {
          console.log(`❌ SQL执行错误: ${sqlError.message}`);
        }
        
      } else {
        console.log(`❌ 未找到匹配规则`);
      }
      
      console.log('─'.repeat(80));
    }
    
    // 3. 验证字段映射
    console.log('\n🔍 验证字段映射与真实前端页面的一致性...\n');
    
    // 测试库存查询的字段映射
    const inventoryRule = rules.find(r => r.intent_name === '物料库存查询');
    if (inventoryRule) {
      console.log('📋 库存页面字段验证:');
      const [inventoryResults] = await connection.execute(inventoryRule.action_target);
      if (inventoryResults.length > 0) {
        const fields = Object.keys(inventoryResults[0]);
        console.log('实际字段:', fields.join(', '));
        console.log('期望字段: 工厂, 仓库, 物料编号, 物料名称, 供应商, 数量, 状态, 入库时间, 到期时间, 备注');
        
        const expectedFields = ['工厂', '仓库', '物料编号', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'];
        const missingFields = expectedFields.filter(field => !fields.includes(field));
        const extraFields = fields.filter(field => !expectedFields.includes(field));
        
        if (missingFields.length === 0 && extraFields.length === 0) {
          console.log('✅ 字段映射完全匹配！');
        } else {
          if (missingFields.length > 0) {
            console.log(`⚠️ 缺少字段: ${missingFields.join(', ')}`);
          }
          if (extraFields.length > 0) {
            console.log(`⚠️ 多余字段: ${extraFields.join(', ')}`);
          }
        }
      }
    }
    
    // 测试测试结果查询的字段映射
    const testRule = rules.find(r => r.intent_name === '物料测试结果查询');
    if (testRule) {
      console.log('\n📋 测试页面字段验证:');
      const [testResults] = await connection.execute(testRule.action_target);
      if (testResults.length > 0) {
        const fields = Object.keys(testResults[0]);
        console.log('实际字段:', fields.join(', '));
        console.log('期望字段: 测试编号, 日期, 项目, 基线, 物料编号, 批次, 物料名称, 供应商, 测试结果, 不良描述');
        
        const expectedFields = ['测试编号', '日期', '项目', '基线', '物料编号', '批次', '物料名称', '供应商', '测试结果', '不良描述'];
        const missingFields = expectedFields.filter(field => !fields.includes(field));
        const extraFields = fields.filter(field => !expectedFields.includes(field));
        
        if (missingFields.length === 0 && extraFields.length === 0) {
          console.log('✅ 字段映射完全匹配！');
        } else {
          if (missingFields.length > 0) {
            console.log(`⚠️ 缺少字段: ${missingFields.join(', ')}`);
          }
          if (extraFields.length > 0) {
            console.log(`⚠️ 多余字段: ${extraFields.join(', ')}`);
          }
        }
      }
    }
    
    // 4. 统计测试结果
    console.log('\n📊 测试结果统计:');
    
    let successCount = 0;
    let totalCount = TEST_QUERIES.length;
    
    for (const testCase of TEST_QUERIES) {
      const matchedRule = matchIntent(testCase.query, rules);
      if (matchedRule && matchedRule.intent_name === testCase.expectedRule) {
        successCount++;
      }
    }
    
    console.log(`✅ 成功匹配: ${successCount}/${totalCount}`);
    console.log(`📈 成功率: ${(successCount/totalCount*100).toFixed(1)}%`);
    
    if (successCount === totalCount) {
      console.log('🎉 所有测试用例都通过了！');
    } else {
      console.log('⚠️ 部分测试用例需要优化');
    }
    
    console.log('\n🎯 扩展NLP规则测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await connection.end();
  }
}

testExpandedRules().catch(console.error);
