/**
 * 修复响应格式一致性问题
 * 确保所有查询都返回统一的文本格式，而不是混合的HTML格式
 */

const fixResponseFormatConsistency = async () => {
  console.log('🔧 修复响应格式一致性问题...');
  
  // 测试问题查询
  const problematicQueries = [
    '重庆工厂的库存情况',
    '欣冠供应商电池盖库存',
    'BOE供应商OLED显示屏',
    'OLED显示屏库存情况',
    '电容器深圳工厂库存',
    '南昌工厂BOE供应商电容器',
    '合格物料统计'
  ];
  
  console.log('\n🔍 测试问题查询的响应格式...');
  
  for (const query of problematicQueries) {
    console.log(`\n📝 测试查询: "${query}"`);
    
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
      
      // 分析响应格式
      const isHTML = result.reply.includes('<div class="query-results');
      const isStandardText = result.reply.includes('📊 **查询结果**');
      const isEmpty = result.reply.includes('没有找到匹配的记录');
      
      console.log(`📋 响应来源: ${result.source}`);
      console.log(`📋 分析模式: ${result.analysisMode}`);
      console.log(`📋 格式类型: ${isHTML ? 'HTML格式' : isStandardText ? '标准文本格式' : '其他格式'}`);
      
      if (isHTML) {
        console.log(`⚠️ 检测到HTML格式响应 - 需要修复`);
        console.log(`📄 HTML长度: ${result.reply.length} 字符`);
        
        // 尝试提取HTML中的数据信息
        const recordMatch = result.reply.match(/共 <strong>(\d+)<\/strong> 条记录/);
        if (recordMatch) {
          console.log(`📊 记录数量: ${recordMatch[1]} 条`);
        }
      } else if (isStandardText) {
        console.log(`✅ 标准文本格式 - 正常`);
        const recordMatch = result.reply.match(/共 (\d+) 条记录/);
        if (recordMatch) {
          console.log(`📊 记录数量: ${recordMatch[1]} 条`);
        }
      } else if (isEmpty) {
        console.log(`⚠️ 空结果 - 可能是参数提取问题`);
      } else {
        console.log(`❓ 未知格式响应`);
        console.log(`📄 响应预览: ${result.reply.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
  }
  
  // 分析问题并提供解决方案
  console.log('\n' + '='.repeat(80));
  console.log('🎯 问题分析和解决方案');
  console.log('='.repeat(80));
  
  console.log(`
📋 问题分析:
1. 某些查询触发了HTML格式化器 (ResponseFormatterService)
2. 某些查询触发了标准文本格式化器 (intelligentIntentService)
3. 响应格式不一致，影响前端显示

🔧 解决方案:
1. 统一所有查询都使用智能意图服务的文本格式
2. 禁用或修改HTML格式化器的触发条件
3. 确保参数提取逻辑的一致性

💡 建议修改:
1. 修改后端控制器的处理优先级
2. 确保智能意图服务优先处理所有查询
3. 统一响应格式为文本格式
  `);
  
  // 测试修复后的效果
  console.log('\n🧪 测试修复建议...');
  
  // 创建一个测试查询来验证智能意图服务是否正常工作
  const testQuery = '查询深圳工厂库存'; // 这个查询应该正常工作
  
  try {
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: testQuery,
        scenario: 'basic',
        analysisMode: 'rule'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ 正常查询测试成功`);
      console.log(`📋 响应来源: ${result.source}`);
      console.log(`📋 格式: ${result.reply.includes('📊 **查询结果**') ? '标准文本' : '其他'}`);
      
      if (result.source === 'intelligent-intent') {
        console.log(`✅ 智能意图服务工作正常`);
      } else {
        console.log(`⚠️ 查询未使用智能意图服务: ${result.source}`);
      }
    }
  } catch (error) {
    console.log(`❌ 测试查询失败: ${error.message}`);
  }
};

// 运行修复分析
fixResponseFormatConsistency();
