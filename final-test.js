/**
 * 最终问答功能测试脚本
 * 在浏览器控制台中运行
 */

console.log('🎯 最终问答功能测试开始...\n');

// 1. 检查页面状态
console.log('📊 步骤1: 检查页面状态');

// 检查是否有错误
const hasErrors = document.querySelector('.error, [class*="error"]');
console.log(`页面错误状态: ${hasErrors ? '❌ 有错误' : '✅ 无错误'}`);

// 检查输入框
const input = document.querySelector('.el-input__inner');
console.log(`输入框状态: ${input ? '✅ 找到' : '❌ 未找到'}`);

// 检查测试按钮
const testButtons = document.querySelectorAll('button');
console.log(`按钮数量: ${testButtons.length}`);

// 2. 检查Vue组件状态
console.log('\n📊 步骤2: 检查Vue组件状态');

// 检查控制台错误
let errorCount = 0;
const originalError = console.error;
console.error = function(...args) {
  errorCount++;
  console.log(`🚨 错误 ${errorCount}:`, args);
  originalError.apply(console, args);
};

// 3. 执行测试
console.log('\n📊 步骤3: 执行问答测试');

function testQA(message = '测试问答功能') {
  console.log(`🧪 测试消息: "${message}"`);
  
  if (!input) {
    console.log('❌ 无法找到输入框');
    return false;
  }
  
  try {
    // 设置输入值
    input.value = message;
    
    // 触发Vue事件
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    // 触发回车
    input.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      bubbles: true
    }));
    
    console.log('✅ 事件已触发');
    
    // 检查结果
    setTimeout(() => {
      console.log('\n📋 检查测试结果:');
      console.log(`  输入框值: "${input.value}"`);
      console.log(`  错误数量: ${errorCount}`);
      
      // 查找消息元素
      const messages = document.querySelectorAll('[class*="message"], .chat-message, .message');
      console.log(`  消息元素数量: ${messages.length}`);
      
      if (messages.length > 0) {
        console.log('  最新消息:');
        Array.from(messages).slice(-2).forEach((msg, index) => {
          const text = msg.textContent.trim();
          if (text) {
            console.log(`    ${index + 1}: ${text.substring(0, 80)}...`);
          }
        });
      }
      
      // 检查调试信息
      const debugInfo = document.querySelector('.debug-info');
      if (debugInfo) {
        console.log(`  调试信息: ${debugInfo.textContent}`);
      }
      
    }, 2000);
    
    return true;
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
    return false;
  }
}

// 4. 检查测试按钮功能
console.log('\n📊 步骤4: 检查测试按钮');

const testButton = Array.from(testButtons).find(btn => 
  btn.textContent.includes('测试') || btn.textContent.includes('🧪')
);

if (testButton) {
  console.log('✅ 找到测试按钮');
  console.log('🔄 点击测试按钮...');
  
  testButton.click();
  
  setTimeout(() => {
    console.log('📋 测试按钮点击结果检查完成');
  }, 2000);
} else {
  console.log('❌ 未找到测试按钮');
}

// 5. 手动输入测试
console.log('\n📊 步骤5: 手动输入测试');

setTimeout(() => {
  testQA('查询库存状态');
  
  setTimeout(() => {
    testQA('质量分析');
    
    setTimeout(() => {
      testQA('BOE供应商表现');
      
      setTimeout(() => {
        console.log('\n🎯 所有测试完成！');
        console.log('📊 最终统计:');
        console.log(`  总错误数: ${errorCount}`);
        console.log(`  页面消息数: ${document.querySelectorAll('[class*="message"]').length}`);
        
        // 恢复console.error
        console.error = originalError;
        
        console.log('\n💡 测试结论:');
        if (errorCount === 0) {
          console.log('✅ 没有JavaScript错误，问答功能应该正常');
        } else {
          console.log('❌ 存在JavaScript错误，需要修复');
        }
        
        const finalMessages = document.querySelectorAll('[class*="message"]');
        if (finalMessages.length > 3) {
          console.log('✅ 消息数量增加，问答功能可能正常工作');
        } else {
          console.log('❌ 消息数量未增加，问答功能可能有问题');
        }
        
      }, 3000);
    }, 3000);
  }, 3000);
}, 2000);

// 6. 提供手动测试函数
window.quickTest = function(msg = '快速测试') {
  return testQA(msg);
};

window.checkStatus = function() {
  console.log('🔍 当前状态检查:');
  console.log(`  输入框: ${input ? '可用' : '不可用'}`);
  console.log(`  按钮数: ${document.querySelectorAll('button').length}`);
  console.log(`  消息数: ${document.querySelectorAll('[class*="message"]').length}`);
  console.log(`  错误数: ${errorCount}`);
};

console.log('\n🎯 测试脚本已启动！');
console.log('💡 可用函数:');
console.log('  quickTest("你的问题") - 快速测试');
console.log('  checkStatus() - 检查当前状态');
console.log('💡 自动测试将在2秒后开始...');
