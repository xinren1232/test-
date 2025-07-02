/**
 * 直接测试问答功能脚本
 * 在浏览器控制台中运行
 */

console.log('🧪 开始直接测试问答功能...\n');

// 1. 查找输入框和发送按钮
console.log('📊 步骤1: 查找页面元素');

const inputElement = document.querySelector('.el-input__inner') || 
                    document.querySelector('input[placeholder*="问题"]') ||
                    document.querySelector('input');

const sendButton = document.querySelector('.input-with-send + .el-button') ||
                  document.querySelector('button[type="submit"]') ||
                  document.querySelector('.el-button');

console.log('🔍 页面元素状态:');
console.log(`  输入框: ${inputElement ? '✅ 找到' : '❌ 未找到'}`);
console.log(`  发送按钮: ${sendButton ? '✅ 找到' : '❌ 未找到'}`);

if (inputElement) {
  console.log(`  输入框占位符: "${inputElement.placeholder}"`);
  console.log(`  输入框类名: "${inputElement.className}"`);
}

// 2. 直接测试问答功能
console.log('\n📊 步骤2: 直接测试问答功能');

function testQADirectly(testMessage = '查询库存状态') {
  console.log(`🎯 测试消息: "${testMessage}"`);
  
  if (!inputElement) {
    console.log('❌ 无法找到输入框，无法测试');
    return false;
  }
  
  try {
    // 1. 设置输入值
    console.log('📝 设置输入值...');
    inputElement.value = testMessage;
    
    // 2. 触发Vue的input事件
    console.log('🔄 触发input事件...');
    const inputEvent = new Event('input', { bubbles: true });
    inputElement.dispatchEvent(inputEvent);
    
    // 3. 触发回车键事件
    console.log('⌨️ 触发回车键事件...');
    const enterEvent = new KeyboardEvent('keyup', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true
    });
    inputElement.dispatchEvent(enterEvent);
    
    console.log('✅ 事件触发完成');
    
    // 4. 等待响应并检查结果
    setTimeout(() => {
      console.log('📋 检查响应结果...');
      
      // 查找消息元素
      const messageElements = document.querySelectorAll('[class*="message"], [class*="chat"]');
      console.log(`  页面消息数量: ${messageElements.length}`);
      
      if (messageElements.length > 0) {
        console.log('  最新消息:');
        Array.from(messageElements).slice(-3).forEach((el, index) => {
          const text = el.textContent.trim();
          if (text) {
            console.log(`    消息${index + 1}: ${text.substring(0, 100)}...`);
          }
        });
      } else {
        console.log('  ❌ 未找到消息元素');
      }
      
      // 检查输入框是否被清空
      console.log(`  输入框状态: "${inputElement.value}"`);
      
    }, 2000);
    
    return true;
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return false;
  }
}

// 3. 检查Vue应用状态
console.log('\n📊 步骤3: 检查Vue应用状态');

// 查找Vue应用实例
const appElement = document.querySelector('#app');
if (appElement) {
  console.log('✅ 找到应用根元素');
  
  // 检查Vue实例
  if (appElement.__vue__) {
    console.log('✅ 找到Vue 2实例');
  } else if (appElement._vnode) {
    console.log('✅ 找到Vue 3实例');
  } else {
    console.log('❌ 未找到Vue实例');
  }
} else {
  console.log('❌ 未找到应用根元素');
}

// 4. 监听网络请求
console.log('\n📊 步骤4: 监听网络请求');

const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 网络请求:', args[0]);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('📡 响应:', response.status, response.statusText);
      return response;
    })
    .catch(error => {
      console.log('❌ 网络错误:', error.message);
      throw error;
    });
};

// 5. 监听控制台错误
console.log('\n📊 步骤5: 监听控制台错误');

const originalError = console.error;
const capturedErrors = [];

console.error = function(...args) {
  capturedErrors.push(args);
  console.log('🚨 捕获错误:', args);
  originalError.apply(console, args);
};

// 6. 执行测试
console.log('\n📊 步骤6: 执行测试');

// 自动测试
setTimeout(() => {
  console.log('🚀 开始自动测试...');
  testQADirectly('查询库存状态');
  
  // 第二个测试
  setTimeout(() => {
    console.log('\n🚀 第二个测试...');
    testQADirectly('质量分析');
    
    // 第三个测试
    setTimeout(() => {
      console.log('\n🚀 第三个测试...');
      testQADirectly('测试功能');
      
      // 最终报告
      setTimeout(() => {
        console.log('\n🎯 测试完成报告:');
        console.log(`  捕获错误数: ${capturedErrors.length}`);
        
        if (capturedErrors.length > 0) {
          console.log('  错误详情:');
          capturedErrors.forEach((error, index) => {
            console.log(`    错误${index + 1}:`, error);
          });
        }
        
        const finalMessages = document.querySelectorAll('[class*="message"], [class*="chat"]');
        console.log(`  最终消息数: ${finalMessages.length}`);
        
        // 恢复原始函数
        console.error = originalError;
        window.fetch = originalFetch;
        
        console.log('\n💡 如果问答功能不工作，请检查:');
        console.log('  1. 控制台是否有JavaScript错误');
        console.log('  2. Vue组件是否正确绑定事件');
        console.log('  3. 输入框的v-model是否正常工作');
        console.log('  4. sendMessage函数是否被正确调用');
        
      }, 3000);
    }, 3000);
  }, 3000);
}, 1000);

// 7. 提供手动测试函数
window.manualQATest = function(message = '手动测试消息') {
  console.log('🔧 手动测试:', message);
  return testQADirectly(message);
};

// 8. 提供强制触发函数
window.forceTriggerSend = function() {
  console.log('🔧 强制触发发送...');
  
  // 尝试直接调用Vue组件的方法
  try {
    // 查找Vue组件实例
    const vueElements = document.querySelectorAll('[data-v-]');
    for (let element of vueElements) {
      if (element.__vueParentComponent) {
        const component = element.__vueParentComponent;
        if (component.ctx && component.ctx.sendMessage) {
          console.log('✅ 找到sendMessage方法，直接调用');
          component.ctx.sendMessage();
          return true;
        }
      }
    }
    
    console.log('❌ 未找到Vue组件的sendMessage方法');
    return false;
  } catch (error) {
    console.error('❌ 强制触发失败:', error);
    return false;
  }
};

console.log('\n🎯 测试脚本准备完成！');
console.log('💡 可用函数:');
console.log('  manualQATest("你的问题") - 手动测试问答');
console.log('  forceTriggerSend() - 强制触发发送');
console.log('💡 自动测试将在1秒后开始...');
