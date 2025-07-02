/**
 * AI功能诊断脚本
 */

async function diagnoseAI() {
  console.log('🔍 开始AI功能诊断...\n');

  // 1. 测试后端健康状态
  console.log('📊 步骤1: 检查后端健康状态...');
  try {
    const healthResponse = await fetch('http://localhost:3002/health');
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ 后端服务正常运行');
      console.log(`   - 运行时间: ${health.uptime}秒`);
      console.log(`   - 版本: ${health.version}`);
    } else {
      console.log('❌ 后端服务异常:', healthResponse.status);
      return;
    }
  } catch (error) {
    console.log('❌ 无法连接到后端服务:', error.message);
    return;
  }

  // 2. 测试AI健康状态
  console.log('\n📊 步骤2: 检查AI服务健康状态...');
  try {
    const aiHealthResponse = await fetch('http://localhost:3002/api/assistant/ai-health');
    if (aiHealthResponse.ok) {
      const aiHealth = await aiHealthResponse.json();
      console.log('✅ AI服务状态:', aiHealth.status);
      console.log('   - DeepSeek状态:', aiHealth.deepSeek.status);
    } else {
      console.log('❌ AI服务异常:', aiHealthResponse.status);
    }
  } catch (error) {
    console.log('❌ AI健康检查失败:', error.message);
  }

  // 3. 测试传统问答
  console.log('\n📊 步骤3: 测试传统问答...');
  try {
    const queryResponse = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '你好' })
    });

    if (queryResponse.ok) {
      const queryResult = await queryResponse.json();
      console.log('✅ 传统问答正常');
      console.log('   - 回复:', queryResult.reply.substring(0, 100) + '...');
    } else {
      console.log('❌ 传统问答失败:', queryResponse.status);
    }
  } catch (error) {
    console.log('❌ 传统问答测试失败:', error.message);
  }

  // 4. 测试AI增强问答
  console.log('\n📊 步骤4: 测试AI增强问答...');
  try {
    const aiResponse = await fetch('http://localhost:3002/api/assistant/ai-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '你好，请介绍一下你的功能' })
    });

    console.log('AI响应状态:', aiResponse.status);
    console.log('AI响应头:', Object.fromEntries(aiResponse.headers.entries()));

    if (aiResponse.ok) {
      console.log('✅ AI增强问答连接成功');
      
      // 读取流式响应
      const reader = aiResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let contentReceived = '';

      console.log('📡 开始读取流式响应...');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('📦 收到数据:', data.type, data.message || data.content?.substring(0, 50));
              
              if (data.type === 'content') {
                contentReceived += data.content;
              }
            } catch (parseError) {
              console.log('⚠️ 解析失败:', line);
            }
          }
        }
      }

      console.log('✅ AI增强问答完成');
      console.log('   - 收到内容长度:', contentReceived.length);
      console.log('   - 内容预览:', contentReceived.substring(0, 200) + '...');
    } else {
      console.log('❌ AI增强问答失败:', aiResponse.status);
      const errorText = await aiResponse.text();
      console.log('   - 错误信息:', errorText);
    }
  } catch (error) {
    console.log('❌ AI增强问答测试失败:', error.message);
  }

  // 5. 测试规则获取
  console.log('\n📊 步骤5: 测试规则获取...');
  try {
    const rulesResponse = await fetch('http://localhost:3002/api/assistant/rules');
    if (rulesResponse.ok) {
      const rulesResult = await rulesResponse.json();
      console.log('✅ 规则获取成功');
      console.log(`   - 规则数量: ${rulesResult.rules.length}`);
    } else {
      console.log('❌ 规则获取失败:', rulesResponse.status);
    }
  } catch (error) {
    console.log('❌ 规则获取测试失败:', error.message);
  }

  console.log('\n🎯 诊断完成！');
}

// 在Node.js环境中运行
if (typeof window === 'undefined') {
  // Node.js环境
  import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
    diagnoseAI();
  });
} else {
  // 浏览器环境
  diagnoseAI();
}
