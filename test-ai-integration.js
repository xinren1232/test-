/**
 * 测试AI智能问答接入状态
 */
import fetch from 'node-fetch';

async function testAIIntegration() {
  console.log('🤖 测试AI智能问答接入状态...\n');
  
  try {
    // 1. 测试AI健康状态
    console.log('📊 步骤1: 检查AI健康状态...');
    const healthResponse = await fetch('http://localhost:3001/api/assistant/ai-health');
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ AI服务状态:', health.status);
      console.log('🔑 DeepSeek状态:', health.deepSeek?.status || '未知');
      console.log('🔧 服务启用:', health.enabled);
    } else {
      console.log('❌ AI健康检查失败:', healthResponse.status);
      return;
    }

    // 2. 测试应该触发AI的查询
    console.log('\n📊 步骤2: 测试AI触发查询...');
    const aiQueries = [
      '你好，请介绍一下你的功能',
      '请分析一下当前的质量管理情况',
      '为什么会出现质量问题？',
      '如何优化我们的质量管理流程？',
      '请详细分析OLED显示屏的质量趋势'
    ];

    for (const query of aiQueries) {
      console.log(`\n🎯 测试AI查询: "${query}"`);
      
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ 查询成功');
        console.log('📋 数据源:', result.source || '未知');
        console.log('🤖 AI增强:', result.aiEnhanced ? '是' : '否');
        console.log('📄 回复长度:', result.reply.length, '字符');
        
        // 检查是否是AI回复
        if (result.source === 'ai-enhanced' || result.aiEnhanced) {
          console.log('🎉 AI成功处理此查询！');
        } else {
          console.log('⚠️ 此查询未使用AI处理');
        }
      } else {
        console.log('❌ 查询失败:', response.status);
      }
    }

    // 3. 测试AI直接调用
    console.log('\n📊 步骤3: 测试AI直接调用...');
    const directAIResponse = await fetch('http://localhost:3001/api/assistant/debug-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        query: '请介绍一下IQE质量管理系统的核心功能和优势' 
      })
    });

    if (directAIResponse.ok) {
      const aiResult = await directAIResponse.json();
      console.log('✅ AI直接调用成功');
      console.log('🤖 AI回复类型:', typeof aiResult.aiResponse);
      if (aiResult.aiResponse && typeof aiResult.aiResponse === 'string') {
        console.log('📄 AI回复预览:', aiResult.aiResponse.substring(0, 200) + '...');
      } else {
        console.log('📄 AI回复内容:', JSON.stringify(aiResult, null, 2));
      }
    } else {
      console.log('❌ AI直接调用失败:', directAIResponse.status);
      const errorText = await directAIResponse.text();
      console.log('错误详情:', errorText);
    }

    // 4. 检查AI服务配置
    console.log('\n📊 步骤4: 检查AI服务配置...');
    const testResponse = await fetch('http://localhost:3001/api/assistant/test');
    if (testResponse.ok) {
      const testResult = await testResponse.json();
      console.log('✅ 测试端点响应:', testResult.message);
      console.log('🔧 AI服务启用状态:', testResult.aiServiceEnabled);
    }

    console.log('\n🎯 AI接入诊断完成！');

  } catch (error) {
    console.error('❌ 测试过程出错:', error.message);
  }
}

// 运行测试
testAIIntegration();
