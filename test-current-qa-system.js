/**
 * 测试当前智能问答系统的实际工作情况
 */

const testQuestions = [
  '查询电池库存',
  '查询BOE供应商库存',
  '查询风险状态的库存',
  '查询测试失败(NG)的记录',
  '对比聚龙和天马供应商表现'
];

const testQASystem = async () => {
  console.log('🧪 测试当前智能问答系统...\n');
  
  for (const question of testQuestions) {
    console.log(`\n🔍 测试问题: "${question}"`);
    console.log('─'.repeat(50));
    
    try {
      const response = await fetch('http://localhost:3001/api/intelligent-qa/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ API调用成功');
        console.log('📊 响应结构:', {
          success: result.success,
          hasData: !!result.data,
          hasAnswer: !!result.data?.answer,
          hasTableData: !!result.data?.data,
          dataLength: Array.isArray(result.data?.data) ? result.data.data.length : 0
        });
        
        if (result.success && result.data) {
          console.log('📝 回答内容:', result.data.answer?.substring(0, 200) + '...');
          
          if (result.data.data && Array.isArray(result.data.data) && result.data.data.length > 0) {
            console.log(`📋 数据表格: ${result.data.data.length} 条记录`);
            console.log('🔍 示例数据:', result.data.data[0]);
          } else {
            console.log('⚠️ 无表格数据返回');
          }
        } else {
          console.log('❌ 问答处理失败:', result.error || '未知错误');
        }
      } else {
        console.log(`❌ API调用失败: ${response.status}`);
        const errorText = await response.text();
        console.log('错误详情:', errorText);
      }
    } catch (error) {
      console.log(`❌ 请求异常: ${error.message}`);
    }
  }
};

// 测试规则匹配
const testRuleMatching = async () => {
  console.log('\n\n🎯 测试规则匹配系统...\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '查询电池库存'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 规则匹配API调用成功');
      console.log('📊 响应结构:', {
        success: result.success,
        hasData: !!result.data,
        dataLength: Array.isArray(result.data) ? result.data.length : 0,
        hasReply: !!result.reply,
        matchedRule: result.matchedRule
      });
      
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        console.log(`📋 返回数据: ${result.data.length} 条记录`);
        console.log('🔍 示例数据:', result.data[0]);
      }
      
      if (result.reply) {
        console.log('📝 回复内容:', result.reply.substring(0, 200) + '...');
      }
    } else {
      console.log(`❌ 规则匹配API调用失败: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ 规则匹配测试异常: ${error.message}`);
  }
};

// 执行测试
const runTests = async () => {
  await testQASystem();
  await testRuleMatching();
  
  console.log('\n\n📋 测试总结:');
  console.log('1. 检查智能问答API是否返回真实数据');
  console.log('2. 检查规则匹配API是否正常工作');
  console.log('3. 验证前端是否正确处理API响应');
};

runTests().catch(console.error);
