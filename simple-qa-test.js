/**
 * 简单问答功能测试脚本
 * 在浏览器控制台中运行
 */

console.log('🧪 开始简单问答功能测试...\n');

// 1. 检查页面基础元素
console.log('📊 步骤1: 检查页面基础元素');

const inputElement = document.querySelector('input[placeholder*="问题"]') || 
                    document.querySelector('.el-input__inner') ||
                    document.querySelector('input');

const sendButton = document.querySelector('button') ||
                  document.querySelector('.el-button');

console.log('🔍 页面元素状态:');
console.log(`  输入框: ${inputElement ? '✅ 找到' : '❌ 未找到'}`);
console.log(`  发送按钮: ${sendButton ? '✅ 找到' : '❌ 未找到'}`);

if (inputElement) {
  console.log(`  输入框占位符: "${inputElement.placeholder}"`);
}

// 2. 检查控制台错误
console.log('\n📊 步骤2: 监听控制台错误');

const originalError = console.error;
const errors = [];

console.error = function(...args) {
  errors.push(args);
  console.log('🚨 捕获到错误:', args);
  originalError.apply(console, args);
};

// 3. 模拟用户输入和发送
console.log('\n📊 步骤3: 模拟用户操作');

function simulateUserAction(testMessage = '测试问题') {
  console.log(`🎯 模拟输入: "${testMessage}"`);
  
  if (!inputElement) {
    console.log('❌ 无法找到输入框');
    return false;
  }
  
  try {
    // 清空输入框
    inputElement.value = '';
    
    // 设置新值
    inputElement.value = testMessage;
    
    // 触发Vue的input事件
    const inputEvent = new Event('input', { bubbles: true });
    inputElement.dispatchEvent(inputEvent);
    
    // 触发change事件
    const changeEvent = new Event('change', { bubbles: true });
    inputElement.dispatchEvent(changeEvent);
    
    console.log('✅ 输入模拟成功');
    
    // 模拟按回车键
    const enterEvent = new KeyboardEvent('keyup', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      bubbles: true
    });
    inputElement.dispatchEvent(enterEvent);
    
    console.log('✅ 回车键模拟成功');
    
    return true;
  } catch (error) {
    console.log('❌ 模拟操作失败:', error.message);
    return false;
  }
}

// 4. 检查网络请求
console.log('\n📊 步骤4: 检查网络请求');

// 监听fetch请求
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 网络请求:', args[0]);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('📡 响应状态:', response.status, response.statusText);
      return response;
    })
    .catch(error => {
      console.log('❌ 网络错误:', error.message);
      throw error;
    });
};

// 5. 检查Vue组件状态
console.log('\n📊 步骤5: 检查Vue组件状态');

// 尝试找到Vue实例
let vueApp = null;
const appElement = document.querySelector('#app');
if (appElement && appElement.__vue__) {
  vueApp = appElement.__vue__;
  console.log('✅ 找到Vue实例');
} else {
  console.log('❌ 未找到Vue实例');
}

// 6. 执行测试
console.log('\n📊 步骤6: 执行实际测试');

// 等待页面完全加载
setTimeout(() => {
  console.log('🚀 开始执行测试...');
  
  // 测试1: 基础输入
  console.log('\n🧪 测试1: 基础问答');
  simulateUserAction('查询库存状态');
  
  // 等待响应
  setTimeout(() => {
    console.log('\n📋 测试1结果检查:');
    console.log(`  捕获的错误数量: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('  错误详情:');
      errors.forEach((error, index) => {
        console.log(`    错误${index + 1}:`, error);
      });
    }
    
    // 检查页面消息更新
    const messageElements = document.querySelectorAll('.message, .chat-message, [class*="message"]');
    console.log(`  页面消息元素数量: ${messageElements.length}`);
    
    if (messageElements.length > 0) {
      console.log('  最新消息内容:');
      Array.from(messageElements).slice(-2).forEach((el, index) => {
        console.log(`    消息${index + 1}: ${el.textContent.substring(0, 100)}...`);
      });
    }
    
    // 测试2: 不同类型的查询
    console.log('\n🧪 测试2: 质量查询');
    simulateUserAction('查询质量状况');
    
    setTimeout(() => {
      console.log('\n🧪 测试3: 供应商查询');
      simulateUserAction('BOE供应商表现');
      
      setTimeout(() => {
        console.log('\n🎯 所有测试完成！');
        console.log('📊 最终统计:');
        console.log(`  总错误数: ${errors.length}`);
        console.log(`  页面消息数: ${document.querySelectorAll('.message, .chat-message, [class*="message"]').length}`);
        
        // 恢复原始函数
        console.error = originalError;
        window.fetch = originalFetch;
        
        console.log('\n💡 如果问答功能仍然不工作，请检查:');
        console.log('  1. 控制台是否有JavaScript错误');
        console.log('  2. 网络请求是否正常');
        console.log('  3. Vue组件是否正确绑定事件');
        console.log('  4. 数据服务是否正常工作');
        
      }, 3000);
    }, 3000);
  }, 3000);
}, 1000);

// 7. 提供手动测试函数
window.manualTest = function(message = '手动测试') {
  console.log('🔧 执行手动测试:', message);
  return simulateUserAction(message);
};

console.log('\n🎯 测试脚本已准备就绪！');
console.log('💡 自动测试将在1秒后开始');
console.log('💡 也可以手动运行: manualTest("你的问题")');
