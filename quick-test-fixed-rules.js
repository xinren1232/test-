/**
 * 快速测试修复后的规则
 */

const testQueries = [
  '重庆工厂的库存情况',
  '欣冠供应商电池盖库存',
  'BOE供应商OLED显示屏',
  'OLED显示屏库存情况',
  '电容器深圳工厂库存'
];

const testFixedRules = async () => {
  console.log('🧪 快速测试修复后的规则...\n');
  
  for (const query of testQueries) {
    console.log(`🔍 测试查询: "${query}"`);
    
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
        console.log(`❌ HTTP错误: ${response.status}\n`);
        continue;
      }
      
      const result = await response.json();
      
      // 检查响应来源
      const isIntelligentIntent = result.source === 'intelligent-intent';
      const isStandardText = result.reply.includes('📊 **查询结果**');
      
      if (isIntelligentIntent && isStandardText) {
        // 计算记录数
        const matches = result.reply.match(/\*\*\d+\.\*\*/g);
        const recordCount = matches ? matches.length : 0;
        
        console.log(`✅ 测试通过 - 使用智能意图服务，找到 ${recordCount} 条记录`);
        
        // 显示前两条记录作为样本
        const lines = result.reply.split('\n');
        const sampleLines = lines.slice(0, 3).join(' ').substring(0, 100);
        console.log(`📊 结果样本: ${sampleLines}...`);
      } else {
        console.log(`❌ 测试失败:`);
        console.log(`   响应来源: ${result.source}`);
        console.log(`   格式类型: ${isStandardText ? '标准文本' : 'HTML格式'}`);
      }
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
    
    console.log(''); // 空行分隔
  }
  
  console.log('🎯 快速测试完成！');
};

testFixedRules();
