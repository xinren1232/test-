/**
 * 测试不同的查询处理模式
 */

async function testProcessingModes() {
  console.log('🧪 测试不同的查询处理模式...\n');
  
  const { default: fetch } = await import('node-fetch');
  
  const testQuery = '查询电池库存';
  
  // 1. 测试当前默认模式
  console.log('1. 测试当前默认模式:');
  try {
    const response1 = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: testQuery })
    });
    
    const result1 = await response1.json();
    console.log(`   处理方式: ${result1.source || '未知'}`);
    console.log(`   AI增强: ${result1.aiEnhanced ? '是' : '否'}`);
    console.log(`   分析模式: ${result1.analysisMode || '未知'}`);
    
    if (result1.data && Array.isArray(result1.data)) {
      console.log(`   ✅ 返回原始数据: ${result1.data.length} 条记录`);
    } else if (result1.reply) {
      console.log(`   💬 返回AI分析: ${result1.reply.substring(0, 100)}...`);
    }
    
  } catch (error) {
    console.log(`   ❌ 测试失败: ${error.message}`);
  }
  
  console.log('');
  
  // 2. 测试强制使用规则模式
  console.log('2. 测试强制规则模式:');
  try {
    const response2 = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: testQuery,
        analysisMode: 'rule-based',
        requireDataAnalysis: true
      })
    });
    
    const result2 = await response2.json();
    console.log(`   处理方式: ${result2.source || '未知'}`);
    console.log(`   AI增强: ${result2.aiEnhanced ? '是' : '否'}`);
    
    if (result2.data && Array.isArray(result2.data)) {
      console.log(`   ✅ 返回原始数据: ${result2.data.length} 条记录`);
      if (result2.data.length > 0) {
        const fields = Object.keys(result2.data[0]);
        console.log(`   📊 字段: ${fields.join(', ')}`);
      }
    } else if (result2.reply) {
      console.log(`   💬 返回分析: ${result2.reply.substring(0, 100)}...`);
    }
    
  } catch (error) {
    console.log(`   ❌ 测试失败: ${error.message}`);
  }
  
  console.log('');
  
  // 3. 直接测试智能意图服务
  console.log('3. 测试智能意图服务:');
  try {
    const response3 = await fetch('http://localhost:3001/api/assistant/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: testQuery })
    });
    
    if (response3.ok) {
      const result3 = await response3.json();
      console.log(`   意图识别: ${result3.success ? '成功' : '失败'}`);
      
      if (result3.success && result3.data) {
        console.log(`   ✅ 返回数据: ${Array.isArray(result3.data) ? result3.data.length + ' 条记录' : '非数组数据'}`);
        if (Array.isArray(result3.data) && result3.data.length > 0) {
          const fields = Object.keys(result3.data[0]);
          console.log(`   📊 字段: ${fields.join(', ')}`);
        }
      } else {
        console.log(`   ❌ 意图识别失败: ${result3.error || '未知错误'}`);
      }
    } else {
      console.log(`   ❌ 请求失败: ${response3.status}`);
    }
    
  } catch (error) {
    console.log(`   ❌ 测试失败: ${error.message}`);
  }
  
  console.log('');
  
  // 4. 测试规则匹配端点
  console.log('4. 测试规则匹配端点:');
  try {
    const response4 = await fetch('http://localhost:3001/api/assistant/match-rule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: testQuery })
    });
    
    if (response4.ok) {
      const result4 = await response4.json();
      console.log(`   规则匹配: ${result4.success ? '成功' : '失败'}`);
      
      if (result4.success) {
        console.log(`   匹配规则: ${result4.matchedRule || '未知'}`);
        console.log(`   规则优先级: ${result4.priority || '未知'}`);
        
        if (result4.data && Array.isArray(result4.data)) {
          console.log(`   ✅ 返回数据: ${result4.data.length} 条记录`);
        }
      }
    } else {
      console.log(`   ❌ 请求失败: ${response4.status}`);
    }
    
  } catch (error) {
    console.log(`   ❌ 测试失败: ${error.message}`);
  }
  
  console.log('\n📋 测试总结:');
  console.log('   - 当前系统优先使用AI增强处理');
  console.log('   - 如需原始数据，可以指定analysisMode为rule-based');
  console.log('   - 智能意图服务可以直接返回结构化数据');
  console.log('   - 建议优化规则优先级或AI判断逻辑');
}

// 执行测试
testProcessingModes();
