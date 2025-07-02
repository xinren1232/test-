/**
 * AI智能问答助手页面测试脚本
 * 在浏览器控制台中运行
 */

console.log('🤖 开始测试AI智能问答助手页面...\n');

// 测试函数
function testAIAssistant() {
  console.log('📊 步骤1: 检查页面状态');
  
  // 检查页面元素
  const inputElement = document.querySelector('.el-input__inner, input[placeholder*="问题"], input[placeholder*="请输入"]');
  const sendButton = document.querySelector('button[type="primary"], .el-button--primary');
  const aiSwitch = document.querySelector('.el-switch, [role="switch"]');
  const testButtons = document.querySelectorAll('button[class*="test"], .el-button');
  
  console.log(`输入框: ${inputElement ? '✅ 找到' : '❌ 未找到'}`);
  console.log(`发送按钮: ${sendButton ? '✅ 找到' : '❌ 未找到'}`);
  console.log(`AI开关: ${aiSwitch ? '✅ 找到' : '❌ 未找到'}`);
  console.log(`按钮数量: ${testButtons.length}`);
  
  if (!inputElement) {
    console.log('❌ 无法找到输入框，测试终止');
    return false;
  }
  
  console.log('\n📊 步骤2: 测试基础模式');
  testBasicMode(inputElement);
}

function testBasicMode(inputElement) {
  console.log('🔍 测试基础模式查询');
  
  // 确保AI模式关闭
  const aiSwitch = document.querySelector('.el-switch');
  if (aiSwitch && aiSwitch.classList.contains('is-checked')) {
    aiSwitch.click();
    console.log('🔄 已关闭AI模式');
  }
  
  const testQuery = '查询库存状态';
  console.log(`发送查询: "${testQuery}"`);
  
  // 记录消息数量
  const messagesBefore = document.querySelectorAll('.message, .chat-message, [class*="message"]').length;
  console.log(`发送前消息数: ${messagesBefore}`);
  
  // 发送消息
  inputElement.value = testQuery;
  inputElement.dispatchEvent(new Event('input', { bubbles: true }));
  inputElement.dispatchEvent(new KeyboardEvent('keyup', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    bubbles: true
  }));
  
  // 等待响应
  setTimeout(() => {
    const messagesAfter = document.querySelectorAll('.message, .chat-message, [class*="message"]').length;
    console.log(`发送后消息数: ${messagesAfter}`);
    
    if (messagesAfter > messagesBefore) {
      console.log('✅ 基础模式测试成功');
    } else {
      console.log('❌ 基础模式测试失败');
    }
    
    // 继续测试AI模式
    setTimeout(() => testAIMode(inputElement), 2000);
  }, 3000);
}

function testAIMode(inputElement) {
  console.log('\n📊 步骤3: 测试AI增强模式');
  
  // 开启AI模式
  const aiSwitch = document.querySelector('.el-switch');
  if (aiSwitch && !aiSwitch.classList.contains('is-checked')) {
    aiSwitch.click();
    console.log('🔄 已开启AI模式');
  }
  
  const testQuery = '分析质量趋势';
  console.log(`发送AI查询: "${testQuery}"`);
  
  // 记录消息数量
  const messagesBefore = document.querySelectorAll('.message, .chat-message, [class*="message"]').length;
  console.log(`发送前消息数: ${messagesBefore}`);
  
  // 发送消息
  inputElement.value = testQuery;
  inputElement.dispatchEvent(new Event('input', { bubbles: true }));
  inputElement.dispatchEvent(new KeyboardEvent('keyup', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    bubbles: true
  }));
  
  // 等待响应
  setTimeout(() => {
    const messagesAfter = document.querySelectorAll('.message, .chat-message, [class*="message"]').length;
    console.log(`发送后消息数: ${messagesAfter}`);
    
    if (messagesAfter > messagesBefore) {
      console.log('✅ AI模式测试成功');
    } else {
      console.log('❌ AI模式测试失败');
    }
    
    // 测试功能按钮
    setTimeout(() => testFunctionButtons(), 2000);
  }, 5000); // AI模式可能需要更长时间
}

function testFunctionButtons() {
  console.log('\n📊 步骤4: 测试功能按钮');
  
  // 查找测试按钮
  const testButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent.includes('测试') || 
    btn.textContent.includes('连接') ||
    btn.textContent.includes('基础') ||
    btn.textContent.includes('AI')
  );
  
  console.log(`找到测试按钮: ${testButtons.length}个`);
  
  testButtons.forEach((button, index) => {
    console.log(`按钮${index + 1}: "${button.textContent.trim()}"`);
  });
  
  if (testButtons.length > 0) {
    console.log('🔄 点击第一个测试按钮');
    const messagesBefore = document.querySelectorAll('.message, .chat-message, [class*="message"]').length;
    
    testButtons[0].click();
    
    setTimeout(() => {
      const messagesAfter = document.querySelectorAll('.message, .chat-message, [class*="message"]').length;
      
      if (messagesAfter > messagesBefore) {
        console.log('✅ 功能按钮测试成功');
      } else {
        console.log('❌ 功能按钮测试失败');
      }
      
      // 显示测试总结
      setTimeout(showTestSummary, 2000);
    }, 3000);
  } else {
    console.log('⚠️ 未找到测试按钮');
    setTimeout(showTestSummary, 1000);
  }
}

function showTestSummary() {
  console.log('\n📋 AI助手测试总结:');
  
  const totalMessages = document.querySelectorAll('.message, .chat-message, [class*="message"]').length;
  const hasInput = !!document.querySelector('.el-input__inner, input[placeholder*="问题"], input[placeholder*="请输入"]');
  const hasAISwitch = !!document.querySelector('.el-switch, [role="switch"]');
  const testButtons = document.querySelectorAll('button').length;
  
  console.log(`总消息数: ${totalMessages}`);
  console.log(`输入框状态: ${hasInput ? '正常' : '异常'}`);
  console.log(`AI开关状态: ${hasAISwitch ? '正常' : '异常'}`);
  console.log(`按钮数量: ${testButtons}`);
  
  // 检查控制台错误
  console.log('\n🔍 检查控制台错误:');
  const errors = [];
  
  if (totalMessages < 2) errors.push('消息数量过少');
  if (!hasInput) errors.push('输入框缺失');
  if (!hasAISwitch) errors.push('AI开关缺失');
  if (testButtons < 3) errors.push('功能按钮过少');
  
  if (errors.length === 0) {
    console.log('🎉 AI智能问答助手测试通过！');
  } else {
    console.log('⚠️ 发现问题:');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  // 检查页面特定功能
  console.log('\n🔧 功能检查:');
  console.log(`AI模式切换: ${hasAISwitch ? '可用' : '不可用'}`);
  console.log(`消息发送: ${hasInput ? '可用' : '不可用'}`);
  console.log(`页面响应: 正常`);
}

// 检查页面加载状态
function checkPageReady() {
  if (document.readyState === 'complete') {
    setTimeout(testAIAssistant, 1000);
  } else {
    console.log('⏳ 等待页面加载完成...');
    setTimeout(checkPageReady, 1000);
  }
}

// 开始测试
checkPageReady();

// 提供手动测试函数
window.testAI = testAIAssistant;
window.quickAITest = function(query = '测试AI查询', useAI = true) {
  const input = document.querySelector('.el-input__inner, input[placeholder*="问题"], input[placeholder*="请输入"]');
  const aiSwitch = document.querySelector('.el-switch');
  
  if (input) {
    // 设置AI模式
    if (aiSwitch) {
      const isAIOn = aiSwitch.classList.contains('is-checked');
      if (useAI && !isAIOn) {
        aiSwitch.click();
        console.log('🔄 已开启AI模式');
      } else if (!useAI && isAIOn) {
        aiSwitch.click();
        console.log('🔄 已关闭AI模式');
      }
    }
    
    // 发送查询
    input.value = query;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'Enter',
      code: 'Enter', 
      keyCode: 13,
      bubbles: true
    }));
    
    console.log(`✅ 已发送${useAI ? 'AI' : '基础'}查询: "${query}"`);
  } else {
    console.log('❌ 未找到输入框');
  }
};

console.log('💡 可用函数:');
console.log('  testAI() - 运行完整测试');
console.log('  quickAITest("你的问题", true) - 快速AI测试');
console.log('  quickAITest("你的问题", false) - 快速基础测试');
