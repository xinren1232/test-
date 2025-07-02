/**
 * AI功能调试脚本
 * 在浏览器控制台中运行，用于诊断AI功能问题
 */

console.log('🤖 开始AI功能调试...\n');

// 检查AI功能状态
function debugAIFunction() {
  console.log('📊 === AI功能诊断报告 ===\n');
  
  // 1. 检查页面元素
  console.log('🔍 步骤1: 检查页面元素');
  const elements = checkPageElements();
  
  // 2. 检查AI服务状态
  console.log('\n🔍 步骤2: 检查AI服务状态');
  checkAIService();
  
  // 3. 检查网络连接
  console.log('\n🔍 步骤3: 检查网络连接');
  testNetworkConnection();
  
  // 4. 模拟AI调用
  console.log('\n🔍 步骤4: 模拟AI调用');
  setTimeout(() => simulateAICall(), 2000);
}

// 检查页面元素
function checkPageElements() {
  const elements = {
    input: document.querySelector('input[placeholder*="问题"], .el-input__inner'),
    sendButton: document.querySelector('button[type="primary"], .el-button--primary'),
    aiSwitch: document.querySelector('.el-switch'),
    messages: document.querySelectorAll('.message-item, .message, [class*="message"]'),
    testButtons: document.querySelectorAll('button')
  };
  
  console.log('📋 页面元素检查:');
  console.log(`  输入框: ${elements.input ? '✅ 找到' : '❌ 未找到'}`);
  console.log(`  发送按钮: ${elements.sendButton ? '✅ 找到' : '❌ 未找到'}`);
  console.log(`  AI开关: ${elements.aiSwitch ? '✅ 找到' : '❌ 未找到'}`);
  console.log(`  消息数量: ${elements.messages.length}`);
  console.log(`  按钮数量: ${elements.testButtons.length}`);
  
  // 检查AI开关状态
  if (elements.aiSwitch) {
    const isAIMode = elements.aiSwitch.classList.contains('is-checked');
    console.log(`  AI模式状态: ${isAIMode ? '✅ 已开启' : '⚠️ 已关闭'}`);
  }
  
  return elements;
}

// 检查AI服务状态
function checkAIService() {
  // 检查Vue应用实例
  const vueApp = document.querySelector('#app').__vue_app__;
  if (vueApp) {
    console.log('✅ Vue应用实例存在');
  } else {
    console.log('❌ Vue应用实例不存在');
  }
  
  // 检查全局变量
  console.log('📋 全局变量检查:');
  console.log(`  window.aiService: ${typeof window.aiService}`);
  console.log(`  window.aiServiceInstance: ${typeof window.aiServiceInstance}`);
  
  // 检查控制台错误
  console.log('📋 控制台错误检查:');
  console.log('  请查看控制台是否有红色错误信息');
  
  // 检查网络请求
  console.log('📋 网络请求检查:');
  console.log('  请查看Network标签页是否有失败的请求');
}

// 测试网络连接
async function testNetworkConnection() {
  try {
    console.log('🌐 测试基础网络连接...');
    
    // 测试本地连接
    const localTest = await fetch('/', { method: 'HEAD' });
    console.log(`  本地服务器: ${localTest.ok ? '✅ 正常' : '❌ 异常'}`);
    
    // 测试DeepSeek API连接（不发送实际请求，只测试域名解析）
    console.log('🤖 测试DeepSeek API连接...');
    console.log('  API地址: https://api.deepseek.com');
    console.log('  注意: 需要检查API密钥和网络访问权限');
    
  } catch (error) {
    console.error('❌ 网络连接测试失败:', error);
  }
}

// 模拟AI调用
async function simulateAICall() {
  console.log('🧪 开始模拟AI调用...');
  
  try {
    // 模拟API请求
    const testMessage = {
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: 'Hello, this is a test message.' }
      ],
      max_tokens: 100
    };
    
    console.log('📤 模拟请求数据:', testMessage);
    
    // 检查API密钥
    const apiKey = 'sk-cab797574abf4288bcfaca253191565d';
    console.log(`🔑 API密钥: ${apiKey ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`🔑 密钥长度: ${apiKey.length} 字符`);
    
    // 模拟请求（不实际发送）
    console.log('🔄 模拟发送请求到: https://api.deepseek.com/chat/completions');
    console.log('📋 请求头:');
    console.log('  Content-Type: application/json');
    console.log('  Authorization: Bearer [API_KEY]');
    
    // 检查可能的错误原因
    console.log('\n🔍 可能的错误原因:');
    console.log('  1. API密钥无效或过期');
    console.log('  2. 网络连接问题（防火墙、代理）');
    console.log('  3. CORS跨域问题');
    console.log('  4. API配额用完');
    console.log('  5. 代码逻辑错误');
    
  } catch (error) {
    console.error('❌ 模拟AI调用失败:', error);
  }
}

// 手动测试AI功能
function manualTestAI() {
  console.log('🧪 手动测试AI功能...');
  
  const input = document.querySelector('input[placeholder*="问题"], .el-input__inner');
  const aiSwitch = document.querySelector('.el-switch');
  
  if (!input) {
    console.log('❌ 未找到输入框');
    return;
  }
  
  // 确保AI模式开启
  if (aiSwitch && !aiSwitch.classList.contains('is-checked')) {
    console.log('🔄 开启AI模式...');
    aiSwitch.click();
  }
  
  // 发送测试消息
  const testMessage = '你好，这是一个测试消息';
  console.log(`📤 发送测试消息: "${testMessage}"`);
  
  input.value = testMessage;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new KeyboardEvent('keyup', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    bubbles: true
  }));
  
  console.log('✅ 测试消息已发送，请观察响应');
}

// 检查具体错误信息
function checkDetailedErrors() {
  console.log('🔍 详细错误检查...');
  
  // 检查控制台错误
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push(args);
    originalError.apply(console, args);
  };
  
  setTimeout(() => {
    console.error = originalError;
    console.log(`📋 捕获到 ${errors.length} 个错误:`);
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.join(' ')}`);
    });
  }, 5000);
  
  console.log('⏳ 错误监听已启动，5秒后显示结果...');
}

// 提供解决方案
function provideSolutions() {
  console.log('\n💡 === 可能的解决方案 ===');
  console.log('1. 检查API密钥是否正确');
  console.log('2. 确认网络连接正常');
  console.log('3. 检查浏览器控制台错误');
  console.log('4. 尝试刷新页面');
  console.log('5. 检查DeepSeek API服务状态');
  console.log('6. 验证API配额是否充足');
  
  console.log('\n🛠️ === 调试工具 ===');
  console.log('debugAIFunction() - 运行完整诊断');
  console.log('manualTestAI() - 手动测试AI功能');
  console.log('checkDetailedErrors() - 监听详细错误');
  console.log('testDirectAPI() - 直接测试API');
}

// 直接测试API
async function testDirectAPI() {
  console.log('🔬 直接测试DeepSeek API...');
  
  const apiKey = 'sk-cab797574abf4288bcfaca253191565d';
  const apiURL = 'https://api.deepseek.com/chat/completions';
  
  try {
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: 'Hello, this is a test.' }
        ],
        max_tokens: 50
      })
    });
    
    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API测试成功!');
      console.log('📝 响应数据:', data);
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ API测试失败');
      console.log('📝 错误信息:', errorData);
    }
    
  } catch (error) {
    console.error('❌ 直接API测试失败:', error);
    console.log('可能原因: 网络问题、CORS限制、或API服务不可用');
  }
}

// 导出函数到全局
window.debugAIFunction = debugAIFunction;
window.manualTestAI = manualTestAI;
window.checkDetailedErrors = checkDetailedErrors;
window.testDirectAPI = testDirectAPI;

// 自动开始诊断
debugAIFunction();
provideSolutions();

console.log('\n🎯 AI功能调试脚本已加载完成!');
console.log('💡 可用命令:');
console.log('  debugAIFunction() - 完整诊断');
console.log('  manualTestAI() - 手动测试');
console.log('  testDirectAPI() - 直接测试API');
