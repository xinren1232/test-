import mysql from 'mysql2/promise';
import IntelligentIntentService from './src/services/intelligentIntentService.js';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function debugIntentServiceStatus() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 调试智能意图识别服务状态...\n');
    
    // 1. 检查数据库中的意图规则
    console.log('📋 1. 检查数据库中的意图规则:');
    const [rules] = await connection.execute(`
      SELECT intent_name, status, priority, trigger_words, action_type, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY priority DESC
      LIMIT 10
    `);

    console.log(`数据库中活跃规则数量: ${rules.length}`);
    rules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.intent_name} (优先级: ${rule.priority})`);
      console.log(`     触发词: ${rule.trigger_words}`);
      console.log(`     动作类型: ${rule.action_type}`);
      console.log(`     动作目标: ${rule.action_target ? rule.action_target.substring(0, 50) + '...' : '无'}`);
      console.log('');
    });

    // 2. 检查电池相关规则
    console.log('🔋 2. 检查电池相关规则:');
    const [batteryRules] = await connection.execute(`
      SELECT intent_name, trigger_words, parameters, action_target
      FROM nlp_intent_rules 
      WHERE (intent_name LIKE '%电池%' OR trigger_words LIKE '%电池%' OR parameters LIKE '%电池%')
      AND status = 'active'
    `);

    if (batteryRules.length > 0) {
      console.log(`找到 ${batteryRules.length} 条电池相关规则:`);
      batteryRules.forEach((rule, index) => {
        console.log(`  ${index + 1}. ${rule.intent_name}`);
        console.log(`     触发词: ${rule.trigger_words}`);
        console.log(`     参数: ${rule.parameters}`);
        console.log(`     SQL: ${rule.action_target ? rule.action_target.substring(0, 100) + '...' : '无'}`);
        console.log('');
      });
    } else {
      console.log('❌ 没有找到电池相关规则');
    }

    // 3. 测试智能意图服务初始化
    console.log('🧠 3. 测试智能意图服务初始化:');
    const intentService = new IntelligentIntentService();
    await intentService.initialize();
    
    console.log(`服务初始化状态: ${intentService.initialized ? '成功' : '失败'}`);
    console.log(`加载的规则数量: ${intentService.intentRules.length}`);

    // 4. 测试电池查询的意图识别
    console.log('\n🔋 4. 测试电池查询的意图识别:');
    const testQueries = [
      '查询电池',
      '电池库存',
      '查询电池库存',
      '电池'
    ];

    for (const query of testQueries) {
      console.log(`\n📋 测试查询: "${query}"`);
      
      try {
        const result = await intentService.processQuery(query);
        
        console.log(`  结果:`);
        console.log(`    - 成功: ${result.success}`);
        console.log(`    - 意图: ${result.intent || '未识别'}`);
        console.log(`    - 匹配规则: ${result.matchedRule || '无'}`);
        console.log(`    - 数据源: ${result.source}`);
        console.log(`    - 数据条数: ${result.data ? result.data.length : 0}`);
        
        if (result.queryInfo) {
          console.log(`    - 查询信息: ${JSON.stringify(result.queryInfo)}`);
        }
        
        if (result.data && result.data.length > 0) {
          const materials = [...new Set(result.data.map(item => 
            item.物料名称 || item.material_name || '未知'
          ))];
          console.log(`    - 返回物料: ${materials.join(', ')}`);
        }
        
      } catch (error) {
        console.log(`  ❌ 处理失败: ${error.message}`);
      }
    }

    // 5. 检查物料库存查询规则的具体内容
    console.log('\n📦 5. 检查物料库存查询规则:');
    const [materialRules] = await connection.execute(`
      SELECT intent_name, trigger_words, parameters, action_target
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%物料%库存%' OR intent_name LIKE '%库存%查询%'
      AND status = 'active'
      ORDER BY priority DESC
    `);

    materialRules.forEach((rule, index) => {
      console.log(`\n  ${index + 1}. ${rule.intent_name}`);
      console.log(`     触发词: ${rule.trigger_words}`);
      console.log(`     参数: ${rule.parameters}`);
      
      if (rule.action_target) {
        console.log(`     SQL模板:`);
        console.log(`     ${rule.action_target.substring(0, 200)}...`);
      }
    });

    // 6. 手动测试意图识别逻辑
    console.log('\n🔍 6. 手动测试意图识别逻辑:');
    const query = '查询电池库存';
    console.log(`测试查询: "${query}"`);
    
    const matchedIntent = intentService.identifyIntent(query);
    if (matchedIntent) {
      console.log(`✅ 匹配到意图: ${matchedIntent.intent_name}`);
      console.log(`   优先级: ${matchedIntent.priority}`);
      console.log(`   触发词: ${matchedIntent.trigger_words}`);
      
      const extractedParams = intentService.extractParameters(query, matchedIntent);
      console.log(`   提取参数: ${JSON.stringify(extractedParams)}`);
    } else {
      console.log(`❌ 未匹配到任何意图`);
    }

  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行调试
debugIntentServiceStatus();
