/**
 * 测试AI问答功能
 */
import fetch from 'node-fetch';

async function testAIFunctionality() {
  console.log('🤖 测试AI问答功能...\n');
  
  try {
    // 1. 检查后端健康状态
    console.log('📊 步骤1: 检查后端健康状态...');
    const healthResponse = await fetch('http://localhost:3001/health');
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ 后端服务正常:', health.status);
    } else {
      console.log('❌ 后端服务异常:', healthResponse.status);
      return;
    }

    // 2. 检查AI健康状态
    console.log('\n📊 步骤2: 检查AI健康状态...');
    const aiHealthResponse = await fetch('http://localhost:3001/api/assistant/ai-health');
    if (aiHealthResponse.ok) {
      const aiHealth = await aiHealthResponse.json();
      console.log('✅ AI服务状态:', aiHealth.status);
      console.log('🔑 DeepSeek状态:', aiHealth.deepSeek?.status || '未知');
    } else {
      console.log('❌ AI健康检查失败:', aiHealthResponse.status);
    }

    // 3. 测试基础问答
    console.log('\n📊 步骤3: 测试基础问答...');
    const basicQueries = [
      '你好',
      '请介绍一下你的功能',
      '你能做什么？'
    ];

    for (const query of basicQueries) {
      console.log(`\n🎯 测试查询: "${query}"`);
      
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ 回复:', result.reply.substring(0, 100) + '...');
        console.log('📋 匹配规则:', result.matchedRule || '无');
        console.log('🤖 AI增强:', result.aiEnhanced ? '是' : '否');
      } else {
        console.log('❌ 查询失败:', response.status);
        const errorText = await response.text();
        console.log('错误详情:', errorText);
      }
    }

    // 4. 测试业务查询
    console.log('\n📊 步骤4: 测试业务查询...');
    const businessQueries = [
      '查询库存情况',
      '查询深圳工厂的物料',
      '有哪些风险库存？',
      '查询测试不合格的记录'
    ];

    for (const query of businessQueries) {
      console.log(`\n🎯 测试业务查询: "${query}"`);
      
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ 回复长度:', result.reply.length, '字符');
        console.log('📋 匹配规则:', result.matchedRule || '无');
        console.log('🤖 AI增强:', result.aiEnhanced ? '是' : '否');
        console.log('📄 回复预览:', result.reply.substring(0, 150) + '...');
      } else {
        console.log('❌ 查询失败:', response.status);
      }
    }

    // 5. 测试AI直接调用
    console.log('\n📊 步骤5: 测试AI直接调用...');
    const aiResponse = await fetch('http://localhost:3001/api/assistant/debug-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        query: '请分析一下IQE质量管理系统的核心功能' 
      })
    });

    if (aiResponse.ok) {
      const aiResult = await aiResponse.json();
      console.log('✅ AI直接调用成功');
      if (aiResult.aiResponse && typeof aiResult.aiResponse === 'string') {
        console.log('🤖 AI回复:', aiResult.aiResponse.substring(0, 200) + '...');
      } else {
        console.log('🤖 AI回复:', JSON.stringify(aiResult, null, 2));
      }
    } else {
      console.log('❌ AI直接调用失败:', aiResponse.status);
    }

    console.log('\n🎉 AI功能测试完成！');

  } catch (error) {
    console.error('❌ 测试过程出错:', error.message);
  }
}

// 运行测试
testAIFunctionality();
