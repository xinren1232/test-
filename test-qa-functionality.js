/**
 * 测试问答功能脚本
 * 在浏览器控制台中运行
 */

console.log('🎯 开始测试问答功能...\n');

// 测试函数
function testQAFunctionality() {
  console.log('📊 步骤1: 检查页面状态');
  
  // 检查页面元素
  const inputElement = document.querySelector('.el-input__inner, input[placeholder*="问题"]');
  const sendButton = document.querySelector('button[type="primary"], .el-button--primary');
  const ruleButtons = document.querySelectorAll('.rule-btn, .el-button--info');
  
  console.log(`输入框: ${inputElement ? '✅ 找到' : '❌ 未找到'}`);
  console.log(`发送按钮: ${sendButton ? '✅ 找到' : '❌ 未找到'}`);
  console.log(`规则按钮数量: ${ruleButtons.length}`);
  
  if (!inputElement) {
    console.log('❌ 无法找到输入框，测试终止');
    return false;
  }
  
  console.log('\n📊 步骤2: 测试规则按钮点击');
  
  // 测试点击第一个规则按钮
  if (ruleButtons.length > 0) {
    const firstButton = ruleButtons[0];
    console.log(`点击按钮: ${firstButton.textContent.trim()}`);
    
    // 记录点击前的消息数量
    const messagesBefore = document.querySelectorAll('.message, .chat-message, [class*="message"]').length;
    console.log(`点击前消息数: ${messagesBefore}`);
    
    // 点击按钮
    firstButton.click();
    
    // 等待响应
    setTimeout(() => {
      const messagesAfter = document.querySelectorAll('.message, .chat-message, [class*="message"]').length;
      console.log(`点击后消息数: ${messagesAfter}`);
      
      if (messagesAfter > messagesBefore) {
        console.log('✅ 规则按钮点击成功，消息数量增加');
      } else {
        console.log('❌ 规则按钮点击后消息数量未增加');
      }
      
      // 继续测试手动输入
      testManualInput(inputElement);
    }, 3000);
  } else {
    console.log('❌ 未找到规则按钮');
    testManualInput(inputElement);
  }
}

function testManualInput(inputElement) {
  console.log('\n📊 步骤3: 测试手动输入');
  
  const testQueries = [
    '查询库存状态',
    '质量分析',
    '深圳工厂库存',
    'BOE供应商物料'
  ];
  
  let currentTest = 0;
  
  function runNextTest() {
    if (currentTest >= testQueries.length) {
      console.log('\n🎯 所有测试完成！');
      showTestSummary();
      return;
    }
    
    const query = testQueries[currentTest];
    console.log(`\n测试查询 ${currentTest + 1}: "${query}"`);
    
    // 记录测试前状态
    const messagesBefore = document.querySelectorAll('.message, .chat-message, [class*="message"]').length;
    
    // 设置输入值
    inputElement.value = query;
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    
    // 触发回车事件
    inputElement.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      bubbles: true
    }));
    
    // 等待响应
    setTimeout(() => {
      const messagesAfter = document.querySelectorAll('.message, .chat-message, [class*="message"]').length;
      
      if (messagesAfter > messagesBefore) {
        console.log(`✅ 查询 "${query}" 成功，消息数从 ${messagesBefore} 增加到 ${messagesAfter}`);
      } else {
        console.log(`❌ 查询 "${query}" 失败，消息数未增加`);
      }
      
      currentTest++;
      setTimeout(runNextTest, 2000);
    }, 3000);
  }
  
  runNextTest();
}

function showTestSummary() {
  console.log('\n📋 测试总结:');
  
  const totalMessages = document.querySelectorAll('.message, .chat-message, [class*="message"]').length;
  const ruleButtons = document.querySelectorAll('.rule-btn, .el-button--info').length;
  const hasInput = !!document.querySelector('.el-input__inner, input[placeholder*="问题"]');
  
  console.log(`总消息数: ${totalMessages}`);
  console.log(`规则按钮数: ${ruleButtons}`);
  console.log(`输入框状态: ${hasInput ? '正常' : '异常'}`);
  
  // 检查是否有错误
  const errors = [];
  if (totalMessages < 3) errors.push('消息数量过少');
  if (ruleButtons < 10) errors.push('规则按钮数量过少');
  if (!hasInput) errors.push('输入框缺失');
  
  if (errors.length === 0) {
    console.log('🎉 问答功能测试通过！');
  } else {
    console.log('⚠️ 发现问题:');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  // 检查控制台错误
  console.log('\n🔍 请检查控制台是否有JavaScript错误');
}

// 检查页面加载状态
function checkPageReady() {
  if (document.readyState === 'complete') {
    setTimeout(testQAFunctionality, 1000);
  } else {
    console.log('⏳ 等待页面加载完成...');
    setTimeout(checkPageReady, 1000);
  }
}

// 开始测试
checkPageReady();

// 提供手动测试函数
window.testQA = testQAFunctionality;
window.quickTest = function(query = '测试查询') {
  const input = document.querySelector('.el-input__inner, input[placeholder*="问题"]');
  if (input) {
    input.value = query;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'Enter',
      code: 'Enter', 
      keyCode: 13,
      bubbles: true
    }));
    console.log(`✅ 已发送测试查询: "${query}"`);
  } else {
    console.log('❌ 未找到输入框');
  }
};

console.log('💡 可用函数:');
console.log('  testQA() - 运行完整测试');
console.log('  quickTest("你的问题") - 快速测试查询');
