/**
 * 直接测试智能意图识别服务
 */

async function testIntelligentIntent() {
  console.log('🧠 直接测试智能意图识别服务...\n');
  
  try {
    // 导入智能意图服务
    const { intelligentIntentService } = await import('./src/services/intelligentIntentService.js');
    
    if (!intelligentIntentService) {
      console.log('❌ 智能意图服务未找到');
      return;
    }
    
    const testQueries = [
      '查询电池库存',
      '查询聚龙供应商库存',
      '查询在线跟踪',
      '查询测试结果'
    ];
    
    for (const query of testQueries) {
      console.log(`📋 测试查询: "${query}"`);
      
      try {
        const result = await intelligentIntentService.processQuery(query);
        
        if (result && result.success) {
          console.log(`   ✅ 处理成功`);
          console.log(`   意图: ${result.intent || '未知'}`);
          console.log(`   来源: ${result.source || '未知'}`);
          
          if (result.data && Array.isArray(result.data)) {
            console.log(`   📊 返回数据: ${result.data.length} 条记录`);
            if (result.data.length > 0) {
              const fields = Object.keys(result.data[0]);
              console.log(`   🏷️  字段: ${fields.join(', ')}`);
              console.log(`   📝 示例: ${JSON.stringify(result.data[0])}`);
            }
          } else if (result.reply) {
            console.log(`   💬 回复: ${result.reply.substring(0, 100)}...`);
          } else if (result.data) {
            console.log(`   📄 数据: ${result.data.toString().substring(0, 100)}...`);
          }
          
        } else {
          console.log(`   ❌ 处理失败: ${result?.data || result?.error || '未知错误'}`);
        }
        
      } catch (error) {
        console.log(`   ❌ 异常: ${error.message}`);
      }
      
      console.log('');
    }
    
    // 测试规则匹配
    console.log('📋 测试规则匹配:');
    try {
      // 获取所有规则
      const rules = intelligentIntentService.intentRules || [];
      console.log(`   规则数量: ${rules.length}`);
      
      // 查找库存相关规则
      const inventoryRules = rules.filter(rule => 
        rule.intent_name && rule.intent_name.includes('库存')
      );
      
      console.log(`   库存相关规则: ${inventoryRules.length} 条`);
      inventoryRules.forEach(rule => {
        console.log(`     - ${rule.intent_name} (优先级: ${rule.priority})`);
      });
      
      // 测试意图识别
      const testQuery = '查询电池库存';
      const matchedIntent = intelligentIntentService.identifyIntent(testQuery);
      
      if (matchedIntent) {
        console.log(`   ✅ 匹配意图: ${matchedIntent.intent_name}`);
        console.log(`   优先级: ${matchedIntent.priority}`);
        console.log(`   动作类型: ${matchedIntent.action_type}`);
      } else {
        console.log(`   ❌ 未匹配到意图`);
      }
      
    } catch (error) {
      console.log(`   ❌ 规则测试失败: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 执行测试
testIntelligentIntent();
