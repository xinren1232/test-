/**
 * 浏览器端AI功能测试脚本
 * 在浏览器控制台中运行此脚本
 */

console.log('🔍 开始浏览器端AI功能测试...\n');

async function testAIInBrowser() {
  // 1. 测试后端连接
  console.log('📊 步骤1: 测试后端连接...');
  try {
    const healthResponse = await fetch('http://localhost:3002/health');
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ 后端连接正常');
    } else {
      console.log('❌ 后端连接失败:', healthResponse.status);
      return;
    }
  } catch (error) {
    console.log('❌ 后端连接错误:', error.message);
    return;
  }

  // 2. 测试AI增强问答
  console.log('\n📊 步骤2: 测试AI增强问答...');
  try {
    const aiResponse = await fetch('http://localhost:3002/api/assistant/ai-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '你好，请介绍一下你的功能' })
    });

    console.log('AI响应状态:', aiResponse.status);

    if (aiResponse.ok) {
      console.log('✅ AI增强问答连接成功');
      
      // 测试流式响应读取
      const reader = aiResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

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
              console.log('📦 收到数据:', data);
              
              if (data.type === 'content') {
                fullContent += data.content;
              }
            } catch (parseError) {
              console.log('⚠️ 解析失败:', line);
            }
          }
        }
      }

      console.log('✅ AI增强问答完成');
      console.log('📝 完整回复:', fullContent);
    } else {
      console.log('❌ AI增强问答失败:', aiResponse.status);
    }
  } catch (error) {
    console.log('❌ AI增强问答测试失败:', error.message);
  }

  // 3. 测试前端智能问答页面
  console.log('\n📊 步骤3: 检查前端智能问答页面...');
  
  // 检查当前页面是否是智能问答页面
  const currentPath = window.location.pathname;
  console.log('当前页面路径:', currentPath);
  
  if (currentPath.includes('assistant') || currentPath.includes('智能问答')) {
    console.log('✅ 当前在智能问答页面');
    
    // 检查Vue组件是否存在
    if (window.Vue || document.querySelector('[data-v-]')) {
      console.log('✅ Vue组件已加载');
    } else {
      console.log('❌ Vue组件未加载');
    }
    
    // 检查是否有消息输入框
    const messageInput = document.querySelector('input[placeholder*="问题"]') || 
                        document.querySelector('.message-input') ||
                        document.querySelector('#messageInput');
    
    if (messageInput) {
      console.log('✅ 找到消息输入框');
      
      // 模拟发送消息
      console.log('🔄 模拟发送AI测试消息...');
      messageInput.value = '你好，请介绍一下你的功能';
      
      // 触发输入事件
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // 查找发送按钮
      const sendButton = document.querySelector('button[type="primary"]') ||
                        document.querySelector('.send-button') ||
                        document.querySelector('#sendButton') ||
                        document.querySelector('button:contains("发送")');
      
      if (sendButton) {
        console.log('✅ 找到发送按钮');
        console.log('💡 您可以手动点击发送按钮测试AI功能');
      } else {
        console.log('❌ 未找到发送按钮');
      }
    } else {
      console.log('❌ 未找到消息输入框');
    }
  } else {
    console.log('⚠️ 当前不在智能问答页面');
    console.log('💡 请导航到智能问答页面进行测试');
  }

  console.log('\n🎯 浏览器端测试完成！');
  console.log('💡 如果AI功能仍然不工作，请检查：');
  console.log('   1. 浏览器控制台是否有错误信息');
  console.log('   2. 网络面板中的请求是否成功');
  console.log('   3. 是否在正确的智能问答页面');
}

// 提供手动测试函数
window.testAI = testAIInBrowser;

// 自动运行测试
testAIInBrowser();

console.log('\n💡 您也可以随时运行 testAI() 来重新测试AI功能');
