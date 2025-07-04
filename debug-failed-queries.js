/**
 * 调试失败的查询，分析为什么它们没有使用智能意图服务
 */

const debugFailedQueries = async () => {
  console.log('🔍 调试失败的查询...');
  
  const failedQueries = [
    '重庆工厂的库存情况',
    '欣冠供应商电池盖库存',
    'BOE供应商OLED显示屏',
    'OLED显示屏库存情况',
    '电容器深圳工厂库存',
    '合格物料统计'
  ];
  
  for (const query of failedQueries) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔍 调试查询: "${query}"`);
    console.log(`${'='.repeat(80)}`);
    
    try {
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          scenario: 'basic',
          analysisMode: 'rule'
        })
      });
      
      if (!response.ok) {
        console.log(`❌ HTTP错误: ${response.status}`);
        continue;
      }
      
      const result = await response.json();
      
      console.log(`📋 响应来源: ${result.source}`);
      console.log(`📋 分析模式: ${result.analysisMode}`);
      console.log(`📋 匹配规则: ${result.matchedRule || '无'}`);
      
      // 检查是否有意图结果
      if (result.intentResult) {
        console.log(`📋 意图处理: ${result.intentResult.success ? '成功' : '失败'}`);
        if (result.intentResult.intent) {
          console.log(`📋 匹配意图: ${result.intentResult.intent}`);
        }
        if (result.intentResult.error) {
          console.log(`❌ 意图错误: ${result.intentResult.error}`);
        }
      }
      
      // 分析响应格式
      const isHTML = result.reply.includes('<div class="query-results');
      const isStandardText = result.reply.includes('📊 **查询结果**');
      
      console.log(`📋 响应格式: ${isHTML ? 'HTML格式' : isStandardText ? '标准文本格式' : '其他格式'}`);
      console.log(`📋 响应长度: ${result.reply.length} 字符`);
      
      // 如果是HTML格式，说明没有使用智能意图服务
      if (isHTML) {
        console.log(`⚠️ 问题: 查询使用了HTML格式响应，说明没有被智能意图服务处理`);
        console.log(`💡 可能原因:`);
        console.log(`   1. 智能意图服务没有匹配到合适的规则`);
        console.log(`   2. 参数提取失败`);
        console.log(`   3. 规则优先级问题`);
        
        // 尝试分析查询中的关键词
        const keywords = {
          factories: ['深圳', '重庆', '南昌', '宜宾'],
          suppliers: ['聚龙', '欣冠', '广正', 'BOE', '三星电子'],
          materials: ['电池盖', 'OLED显示屏', '电容器', '电阻器', '芯片'],
          statuses: ['正常', '风险', '冻结', '异常', '危险', '锁定', '合格']
        };
        
        console.log(`🔍 关键词分析:`);
        Object.entries(keywords).forEach(([type, words]) => {
          const found = words.filter(word => query.includes(word));
          if (found.length > 0) {
            console.log(`   ${type}: ${found.join(', ')}`);
          }
        });
      } else if (isStandardText) {
        console.log(`✅ 正常: 查询使用了标准文本格式，智能意图服务工作正常`);
      }
      
      // 显示响应预览
      console.log(`📄 响应预览:`);
      const preview = result.reply.substring(0, 200).replace(/\n/g, ' ');
      console.log(`   ${preview}...`);
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎯 调试总结`);
  console.log(`${'='.repeat(80)}`);
  console.log(`
📋 问题分析:
1. 某些查询仍然使用rule-based处理而不是intelligent-intent
2. 这些查询可能没有被智能意图服务的规则正确匹配
3. 需要检查规则的触发词和参数提取逻辑

🔧 可能的解决方案:
1. 检查智能意图服务的规则匹配逻辑
2. 优化触发词和参数提取模式
3. 调整规则优先级
4. 确保所有查询都能被智能意图服务处理
  `);
};

// 运行调试
debugFailedQueries();
