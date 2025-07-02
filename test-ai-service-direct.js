/**
 * 直接测试AI服务的脚本
 * 在浏览器控制台中运行
 */

console.log('🤖 开始直接测试AI服务...\n');

// 测试配置
const TEST_CONFIG = {
  apiKey: 'sk-cab797574abf4288bcfaca253191565d',
  apiURL: 'https://api.deepseek.com/chat/completions',
  model: 'deepseek-chat'
};

// 直接测试DeepSeek API
async function testDeepSeekAPI() {
  console.log('🔬 直接测试DeepSeek API...');
  console.log('📋 配置信息:');
  console.log(`  API地址: ${TEST_CONFIG.apiURL}`);
  console.log(`  模型: ${TEST_CONFIG.model}`);
  console.log(`  API密钥长度: ${TEST_CONFIG.apiKey.length}`);
  
  try {
    const requestBody = {
      model: TEST_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的IQE质量智能助手。'
        },
        {
          role: 'user',
          content: '你好，请简单介绍一下你的功能。'
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    };
    
    console.log('📤 发送请求...');
    console.log('📋 请求体:', requestBody);
    
    const response = await fetch(TEST_CONFIG.apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_CONFIG.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API测试成功!');
      console.log('📝 完整响应:', data);
      
      if (data.choices && data.choices[0]) {
        const aiReply = data.choices[0].message.content;
        console.log('🤖 AI回复:', aiReply);
        
        // 显示成功消息
        showResult('success', 'API测试成功', aiReply);
        return true;
      } else {
        console.log('⚠️ 响应格式异常');
        showResult('warning', '响应格式异常', JSON.stringify(data));
        return false;
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ API测试失败');
      console.log('📝 错误信息:', errorData);
      
      showResult('error', 'API测试失败', JSON.stringify(errorData));
      return false;
    }
    
  } catch (error) {
    console.error('❌ 请求异常:', error);
    showResult('error', '请求异常', error.message);
    return false;
  }
}

// 测试AI服务类
async function testAIServiceClass() {
  console.log('\n🔧 测试AI服务类...');
  
  try {
    // 动态导入AI服务
    console.log('📦 导入AI服务模块...');
    
    // 检查是否已经加载
    if (window.aiServiceTest) {
      console.log('✅ 使用已加载的AI服务');
      return await testServiceInstance(window.aiServiceTest);
    }
    
    // 尝试从全局变量获取
    const aiServiceModule = await import('/src/utils/aiService.js');
    const aiService = aiServiceModule.aiService || aiServiceModule.default;
    
    if (!aiService) {
      throw new Error('AI服务模块导入失败');
    }
    
    console.log('✅ AI服务模块导入成功');
    window.aiServiceTest = aiService; // 缓存到全局
    
    return await testServiceInstance(aiService);
    
  } catch (error) {
    console.error('❌ AI服务类测试失败:', error);
    showResult('error', 'AI服务类测试失败', error.message);
    return false;
  }
}

// 测试服务实例
async function testServiceInstance(aiService) {
  console.log('🧪 测试服务实例方法...');
  
  try {
    // 测试连接
    console.log('🔗 测试连接方法...');
    const connectionResult = await aiService.testConnection();
    console.log(`📊 连接测试结果: ${connectionResult}`);
    
    if (connectionResult) {
      console.log('✅ 连接测试成功');
    } else {
      console.log('❌ 连接测试失败');
    }
    
    // 测试聊天方法
    console.log('💬 测试聊天方法...');
    const chatMessages = [
      { role: 'user', content: '你好，这是一个测试消息。' }
    ];
    
    const chatResult = await aiService.chat(chatMessages);
    console.log('📊 聊天测试结果:', chatResult);
    
    if (chatResult && chatResult.choices && chatResult.choices[0]) {
      const reply = chatResult.choices[0].message.content;
      console.log('✅ 聊天测试成功');
      console.log('🤖 AI回复:', reply);
      
      showResult('success', '服务实例测试成功', reply);
      return true;
    } else {
      console.log('❌ 聊天测试失败');
      showResult('error', '聊天测试失败', '响应格式异常');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 服务实例测试异常:', error);
    showResult('error', '服务实例测试异常', error.message);
    return false;
  }
}

// 显示结果
function showResult(type, title, message) {
  const colors = {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3'
  };
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  console.log(`\n${icons[type]} === ${title} ===`);
  console.log(`📝 ${message}`);
  
  // 尝试在页面上显示结果
  try {
    const resultDiv = document.createElement('div');
    resultDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 2px solid ${colors[type]};
      border-radius: 8px;
      padding: 15px;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;
    
    resultDiv.innerHTML = `
      <div style="font-weight: bold; color: ${colors[type]}; margin-bottom: 8px;">
        ${icons[type]} ${title}
      </div>
      <div style="font-size: 14px; color: #333; max-height: 200px; overflow-y: auto;">
        ${message}
      </div>
      <button onclick="this.parentElement.remove()" style="
        position: absolute;
        top: 5px;
        right: 5px;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #999;
      ">×</button>
    `;
    
    document.body.appendChild(resultDiv);
    
    // 5秒后自动移除
    setTimeout(() => {
      if (resultDiv.parentElement) {
        resultDiv.remove();
      }
    }, 5000);
    
  } catch (error) {
    console.log('⚠️ 无法在页面显示结果');
  }
}

// 运行完整测试
async function runCompleteTest() {
  console.log('🎯 === 开始完整AI服务测试 ===\n');
  
  const results = {
    directAPI: false,
    serviceClass: false
  };
  
  // 测试1: 直接API调用
  console.log('📋 测试1: 直接API调用');
  results.directAPI = await testDeepSeekAPI();
  
  // 等待一下
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试2: AI服务类
  console.log('\n📋 测试2: AI服务类');
  results.serviceClass = await testAIServiceClass();
  
  // 显示总结
  console.log('\n🎯 === 测试总结 ===');
  console.log(`直接API调用: ${results.directAPI ? '✅ 成功' : '❌ 失败'}`);
  console.log(`AI服务类: ${results.serviceClass ? '✅ 成功' : '❌ 失败'}`);
  
  if (results.directAPI && results.serviceClass) {
    console.log('🎉 所有测试通过！AI功能应该可以正常工作。');
    showResult('success', '测试完成', '所有测试通过！AI功能正常。');
  } else if (results.directAPI) {
    console.log('⚠️ 直接API可用，但服务类有问题。');
    showResult('warning', '部分成功', '直接API可用，但服务类有问题。');
  } else {
    console.log('❌ 测试失败，AI功能不可用。');
    showResult('error', '测试失败', 'AI功能不可用，请检查配置。');
  }
  
  return results;
}

// 快速测试函数
window.quickAITest = async function() {
  console.log('⚡ 快速AI测试...');
  return await testDeepSeekAPI();
};

window.fullAITest = runCompleteTest;
window.testAIService = testAIServiceClass;

// 自动开始测试
console.log('🚀 AI服务测试脚本已加载');
console.log('💡 可用函数:');
console.log('  quickAITest() - 快速测试');
console.log('  fullAITest() - 完整测试');
console.log('  testAIService() - 测试服务类');

// 自动运行快速测试
setTimeout(() => {
  console.log('\n🔄 自动开始快速测试...');
  quickAITest();
}, 1000);
