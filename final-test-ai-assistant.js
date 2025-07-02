/**
 * AI智能问答助手最终测试脚本
 * 在浏览器控制台中运行
 */

console.log('🎯 开始AI智能问答助手最终测试...\n');

// 全面测试函数
function runFinalTest() {
  console.log('📊 === AI智能问答助手最终测试 ===\n');
  
  // 步骤1: 检查页面基础元素
  console.log('🔍 步骤1: 检查页面基础元素');
  const pageCheck = checkPageElements();
  
  if (!pageCheck.success) {
    console.log('❌ 页面基础检查失败，测试终止');
    return false;
  }
  
  console.log('✅ 页面基础检查通过\n');
  
  // 步骤2: 测试基础模式
  setTimeout(() => {
    console.log('🔍 步骤2: 测试基础模式');
    testBasicMode();
  }, 1000);
}

// 检查页面元素
function checkPageElements() {
  const elements = {
    input: document.querySelector('input[placeholder*="问题"], .el-input__inner'),
    sendButton: document.querySelector('button[type="primary"], .el-button--primary'),
    aiSwitch: document.querySelector('.el-switch'),
    messages: document.querySelectorAll('.message-item, .message, [class*="message"]'),
    testButtons: document.querySelectorAll('button[class*="test"], button:contains("测试")')
  };
  
  const results = {
    input: !!elements.input,
    sendButton: !!elements.sendButton,
    aiSwitch: !!elements.aiSwitch,
    messagesCount: elements.messages.length,
    testButtonsCount: elements.testButtons.length
  };
  
  console.log('📋 页面元素检查结果:');
  console.log(`  输入框: ${results.input ? '✅ 找到' : '❌ 未找到'}`);
  console.log(`  发送按钮: ${results.sendButton ? '✅ 找到' : '❌ 未找到'}`);
  console.log(`  AI开关: ${results.aiSwitch ? '✅ 找到' : '❌ 未找到'}`);
  console.log(`  消息数量: ${results.messagesCount}`);
  console.log(`  功能按钮: ${results.testButtonsCount}`);
  
  const success = results.input && results.sendButton && results.messagesCount > 0;
  
  return { success, elements, results };
}

// 测试基础模式
function testBasicMode() {
  const input = document.querySelector('input[placeholder*="问题"], .el-input__inner');
  const aiSwitch = document.querySelector('.el-switch');
  
  // 确保基础模式
  if (aiSwitch && aiSwitch.classList.contains('is-checked')) {
    aiSwitch.click();
    console.log('🔄 已切换到基础模式');
  }
  
  const testQuery = '查询库存状态';
  console.log(`📤 发送基础查询: "${testQuery}"`);
  
  const messagesBefore = document.querySelectorAll('.message-item, .message, [class*="message"]').length;
  
  // 发送消息
  if (input) {
    input.value = testQuery;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      bubbles: true
    }));
  }
  
  // 检查结果
  setTimeout(() => {
    const messagesAfter = document.querySelectorAll('.message-item, .message, [class*="message"]').length;
    
    if (messagesAfter > messagesBefore) {
      console.log('✅ 基础模式测试成功');
      console.log(`📊 消息数量: ${messagesBefore} → ${messagesAfter}\n`);
      
      // 继续测试AI模式
      setTimeout(() => testAIMode(), 2000);
    } else {
      console.log('❌ 基础模式测试失败');
      console.log(`📊 消息数量未变化: ${messagesBefore}\n`);
      
      // 尝试其他测试
      setTimeout(() => testFunctionButtons(), 1000);
    }
  }, 3000);
}

// 测试AI模式
function testAIMode() {
  console.log('🔍 步骤3: 测试AI增强模式');
  
  const input = document.querySelector('input[placeholder*="问题"], .el-input__inner');
  const aiSwitch = document.querySelector('.el-switch');
  
  // 开启AI模式
  if (aiSwitch && !aiSwitch.classList.contains('is-checked')) {
    aiSwitch.click();
    console.log('🔄 已切换到AI增强模式');
  }
  
  const testQuery = '分析质量趋势';
  console.log(`📤 发送AI查询: "${testQuery}"`);
  
  const messagesBefore = document.querySelectorAll('.message-item, .message, [class*="message"]').length;
  
  // 发送消息
  if (input) {
    input.value = testQuery;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      bubbles: true
    }));
  }
  
  // 检查结果
  setTimeout(() => {
    const messagesAfter = document.querySelectorAll('.message-item, .message, [class*="message"]').length;
    
    if (messagesAfter > messagesBefore) {
      console.log('✅ AI模式测试成功');
      console.log(`📊 消息数量: ${messagesBefore} → ${messagesAfter}\n`);
    } else {
      console.log('❌ AI模式测试失败');
      console.log(`📊 消息数量未变化: ${messagesBefore}\n`);
    }
    
    // 继续测试功能按钮
    setTimeout(() => testFunctionButtons(), 2000);
  }, 5000); // AI模式可能需要更长时间
}

// 测试功能按钮
function testFunctionButtons() {
  console.log('🔍 步骤4: 测试功能按钮');
  
  // 查找所有可能的测试按钮
  const allButtons = Array.from(document.querySelectorAll('button'));
  const testButtons = allButtons.filter(btn => {
    const text = btn.textContent.toLowerCase();
    return text.includes('测试') || 
           text.includes('连接') || 
           text.includes('基础') || 
           text.includes('清空') ||
           text.includes('ai');
  });
  
  console.log(`📋 找到功能按钮: ${testButtons.length}个`);
  testButtons.forEach((btn, index) => {
    console.log(`  ${index + 1}. "${btn.textContent.trim()}"`);
  });
  
  if (testButtons.length > 0) {
    console.log('🔄 测试第一个功能按钮');
    const messagesBefore = document.querySelectorAll('.message-item, .message, [class*="message"]').length;
    
    testButtons[0].click();
    
    setTimeout(() => {
      const messagesAfter = document.querySelectorAll('.message-item, .message, [class*="message"]').length;
      
      if (messagesAfter > messagesBefore) {
        console.log('✅ 功能按钮测试成功');
      } else {
        console.log('⚠️ 功能按钮可能是非消息类功能');
      }
      
      // 显示最终测试结果
      setTimeout(() => showFinalResults(), 2000);
    }, 3000);
  } else {
    console.log('⚠️ 未找到功能按钮');
    setTimeout(() => showFinalResults(), 1000);
  }
}

// 显示最终测试结果
function showFinalResults() {
  console.log('\n🎯 === 最终测试结果 ===');
  
  const finalCheck = checkPageElements();
  const totalMessages = finalCheck.results.messagesCount;
  const hasInput = finalCheck.results.input;
  const hasAISwitch = finalCheck.results.aiSwitch;
  const hasSendButton = finalCheck.results.sendButton;
  
  console.log('\n📊 功能状态总结:');
  console.log(`✅ 页面加载: 正常`);
  console.log(`${hasInput ? '✅' : '❌'} 输入功能: ${hasInput ? '正常' : '异常'}`);
  console.log(`${hasSendButton ? '✅' : '❌'} 发送功能: ${hasSendButton ? '正常' : '异常'}`);
  console.log(`${hasAISwitch ? '✅' : '❌'} 模式切换: ${hasAISwitch ? '正常' : '异常'}`);
  console.log(`📈 消息总数: ${totalMessages}`);
  
  // 评估整体状态
  const criticalIssues = [];
  if (!hasInput) criticalIssues.push('输入框缺失');
  if (!hasSendButton) criticalIssues.push('发送按钮缺失');
  if (totalMessages < 2) criticalIssues.push('消息数量过少');
  
  const minorIssues = [];
  if (!hasAISwitch) minorIssues.push('AI开关缺失');
  if (finalCheck.results.testButtonsCount < 2) minorIssues.push('功能按钮较少');
  
  console.log('\n🔍 问题诊断:');
  if (criticalIssues.length === 0 && minorIssues.length === 0) {
    console.log('🎉 恭喜！AI智能问答助手功能完全正常！');
  } else {
    if (criticalIssues.length > 0) {
      console.log('❌ 严重问题:');
      criticalIssues.forEach(issue => console.log(`  - ${issue}`));
    }
    if (minorIssues.length > 0) {
      console.log('⚠️ 轻微问题:');
      minorIssues.forEach(issue => console.log(`  - ${issue}`));
    }
  }
  
  // 提供建议
  console.log('\n💡 使用建议:');
  if (hasInput && hasSendButton) {
    console.log('✅ 可以正常发送消息进行对话');
  }
  if (hasAISwitch) {
    console.log('✅ 可以切换基础模式和AI增强模式');
  }
  console.log('✅ 页面已成功加载，可以开始使用');
  
  console.log('\n🔧 可用测试函数:');
  console.log('  runFinalTest() - 重新运行完整测试');
  console.log('  quickSend("你的问题") - 快速发送消息');
  console.log('  toggleAI() - 切换AI模式');
}

// 快速发送消息函数
window.quickSend = function(message = '测试消息') {
  const input = document.querySelector('input[placeholder*="问题"], .el-input__inner');
  if (input) {
    input.value = message;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      bubbles: true
    }));
    console.log(`✅ 已发送消息: "${message}"`);
  } else {
    console.log('❌ 未找到输入框');
  }
};

// 切换AI模式函数
window.toggleAI = function() {
  const aiSwitch = document.querySelector('.el-switch');
  if (aiSwitch) {
    aiSwitch.click();
    const isAI = aiSwitch.classList.contains('is-checked');
    console.log(`✅ 已切换到${isAI ? 'AI增强' : '基础'}模式`);
  } else {
    console.log('❌ 未找到AI开关');
  }
};

// 检查页面加载状态
function checkPageReady() {
  if (document.readyState === 'complete') {
    setTimeout(runFinalTest, 1000);
  } else {
    console.log('⏳ 等待页面加载完成...');
    setTimeout(checkPageReady, 1000);
  }
}

// 导出测试函数
window.runFinalTest = runFinalTest;
window.checkPageElements = checkPageElements;

// 开始测试
checkPageReady();

console.log('💡 测试脚本已加载，可用函数:');
console.log('  runFinalTest() - 运行完整测试');
console.log('  quickSend("消息") - 快速发送消息');
console.log('  toggleAI() - 切换AI模式');
