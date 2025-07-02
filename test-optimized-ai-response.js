/**
 * 测试优化后的AI回复内容和结构
 */
import fetch from 'node-fetch';

async function testOptimizedAIResponse() {
  console.log('🔧 测试优化后的AI回复内容和结构...\n');
  
  try {
    // 测试不同类型的问题，验证回复优化效果
    const testQueries = [
      {
        name: '简单问候',
        query: '你好',
        expectedLength: 'short' // 期望简短回复
      },
      {
        name: '功能介绍',
        query: '请介绍一下你的功能',
        expectedLength: 'medium' // 期望中等长度回复
      },
      {
        name: '质量分析',
        query: '请分析一下当前的质量管理情况',
        expectedLength: 'medium' // 期望中等长度回复
      },
      {
        name: '具体问题',
        query: '为什么会出现质量问题？',
        expectedLength: 'medium' // 期望中等长度回复
      },
      {
        name: '业务查询',
        query: '查询深圳工厂的库存',
        expectedLength: 'long' // 期望较长回复（专业模板）
      }
    ];

    for (const testCase of testQueries) {
      console.log(`\n🎯 测试${testCase.name}: "${testCase.query}"`);
      
      try {
        const startTime = Date.now();
        
        const response = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: testCase.query,
            scenario: 'comprehensive_quality',
            analysisMode: 'professional',
            requireDataAnalysis: true
          })
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (response.ok) {
          const result = await response.json();
          console.log('✅ 查询成功');
          console.log('📋 数据源:', result.source || '未知');
          console.log('🤖 AI增强:', result.aiEnhanced ? '是' : '否');
          console.log('⏱️ 响应时间:', responseTime, 'ms');
          console.log('📄 回复长度:', result.reply.length, '字符');
          
          // 分析回复质量
          console.log('\n📊 回复质量分析:');
          
          // 1. 长度分析
          let lengthStatus = '';
          if (result.reply.length < 100) {
            lengthStatus = '简短';
          } else if (result.reply.length < 300) {
            lengthStatus = '适中';
          } else if (result.reply.length < 600) {
            lengthStatus = '较长';
          } else {
            lengthStatus = '冗长';
          }
          console.log('📏 回复长度:', lengthStatus);
          
          // 2. 结构分析
          const hasMarkdown = result.reply.includes('#') || result.reply.includes('**') || result.reply.includes('*');
          const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(result.reply);
          const hasStructure = result.reply.includes('\n') && (result.reply.includes('-') || result.reply.includes('1.') || result.reply.includes('•'));
          
          console.log('📝 格式特征:');
          console.log('  - Markdown格式:', hasMarkdown ? '是' : '否');
          console.log('  - 表情符号:', hasEmoji ? '是' : '否');
          console.log('  - 结构化内容:', hasStructure ? '是' : '否');
          
          // 3. 内容质量
          const lines = result.reply.split('\n').filter(line => line.trim().length > 0);
          console.log('📄 内容行数:', lines.length);
          
          // 4. 显示回复预览
          console.log('\n📖 回复预览:');
          const preview = result.reply.length > 200 ? 
            result.reply.substring(0, 200) + '...' : 
            result.reply;
          console.log(preview);
          
          // 5. 优化建议
          console.log('\n💡 优化评估:');
          if (result.reply.length > 500 && result.source === 'ai-enhanced') {
            console.log('⚠️ AI回复过长，建议进一步优化提示词');
          } else if (result.reply.length < 50) {
            console.log('⚠️ 回复过短，可能缺少有用信息');
          } else {
            console.log('✅ 回复长度适中');
          }
          
          if (hasStructure) {
            console.log('✅ 回复结构清晰');
          } else {
            console.log('⚠️ 回复缺少结构化格式');
          }
          
        } else {
          console.log('❌ 查询失败:', response.status, response.statusText);
          const errorText = await response.text();
          console.log('❌ 错误详情:', errorText);
        }
      } catch (error) {
        console.log('❌ 查询错误:', error.message);
      }
      
      console.log('\n' + '='.repeat(60));
    }

    console.log('\n🎯 AI回复优化测试完成！');
    console.log('\n📋 优化总结:');
    console.log('- 已简化AI提示词，减少冗长介绍');
    console.log('- 已移除前端额外格式化，保持AI原始回复');
    console.log('- 建议根据测试结果进一步调整提示词');

  } catch (error) {
    console.error('❌ 测试过程出错:', error.message);
  }
}

// 运行测试
testOptimizedAIResponse();
