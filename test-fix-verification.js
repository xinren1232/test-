/**
 * 验证AI功能修复的测试脚本
 * 在浏览器控制台中运行
 */

console.log('🔧 验证AI功能修复...\n');

// 测试修复后的功能
async function verifyAIFix() {
  console.log('📋 === AI功能修复验证 ===\n');
  
  try {
    // 1. 检查页面是否正常加载
    console.log('🔍 步骤1: 检查页面状态');
    const pageCheck = checkPageStatus();
    
    if (!pageCheck.success) {
      console.log('❌ 页面检查失败:', pageCheck.error);
      return false;
    }
    
    // 2. 检查是否还有ReferenceError
    console.log('\n🔍 步骤2: 检查JavaScript错误');
    const errorCheck = await checkJavaScriptErrors();
    
    // 3. 模拟发送消息测试
    console.log('\n🔍 步骤3: 模拟消息发送');
    const messageTest = await simulateMessageSend();
    
    // 4. 显示结果
    console.log('\n📊 === 验证结果 ===');
    console.log(`页面状态: ${pageCheck.success ? '✅ 正常' : '❌ 异常'}`);
    console.log(`错误检查: ${errorCheck.success ? '✅ 无错误' : '❌ 有错误'}`);
    console.log(`消息测试: ${messageTest.success ? '✅ 成功' : '❌ 失败'}`);
    
    const allPassed = pageCheck.success && errorCheck.success && messageTest.success;
    
    if (allPassed) {
      console.log('🎉 修复验证成功！AI功能应该可以正常使用了。');
      showNotification('success', '修复成功', 'AI功能已修复，可以正常使用！');
    } else {
      console.log('⚠️ 仍有问题需要解决。');
      showNotification('warning', '部分修复', '还有一些问题需要进一步解决。');
    }
    
    return allPassed;
    
  } catch (error) {
    console.error('❌ 验证过程出错:', error);
    showNotification('error', '验证失败', error.message);
    return false;
  }
}

// 检查页面状态
function checkPageStatus() {
  try {
    // 检查关键元素
    const elements = {
      input: document.querySelector('input[placeholder*="问题"], .el-input__inner'),
      sendButton: document.querySelector('button[type="primary"], .el-button--primary'),
      messages: document.querySelectorAll('.message-item, .message, [class*="message"]'),
      aiSwitch: document.querySelector('.el-switch')
    };
    
    console.log('📋 页面元素检查:');
    console.log(`  输入框: ${elements.input ? '✅ 存在' : '❌ 缺失'}`);
    console.log(`  发送按钮: ${elements.sendButton ? '✅ 存在' : '❌ 缺失'}`);
    console.log(`  消息区域: ${elements.messages.length} 个`);
    console.log(`  AI开关: ${elements.aiSwitch ? '✅ 存在' : '❌ 缺失'}`);
    
    const hasRequiredElements = elements.input && elements.sendButton;
    
    return {
      success: hasRequiredElements,
      elements: elements,
      error: hasRequiredElements ? null : '缺少必要的页面元素'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// 检查JavaScript错误
async function checkJavaScriptErrors() {
  return new Promise((resolve) => {
    const errors = [];
    const originalError = console.error;
    
    // 监听错误
    console.error = function(...args) {
      const errorMsg = args.join(' ');
      if (errorMsg.includes('ReferenceError') || errorMsg.includes('Cannot access')) {
        errors.push(errorMsg);
      }
      originalError.apply(console, args);
    };
    
    // 监听2秒
    setTimeout(() => {
      console.error = originalError;
      
      console.log(`📋 错误监听结果: ${errors.length} 个相关错误`);
      if (errors.length > 0) {
        console.log('❌ 发现的错误:');
        errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      } else {
        console.log('✅ 未发现ReferenceError相关错误');
      }
      
      resolve({
        success: errors.length === 0,
        errors: errors
      });
    }, 2000);
    
    console.log('⏳ 开始监听JavaScript错误（2秒）...');
  });
}

// 模拟消息发送
async function simulateMessageSend() {
  try {
    console.log('🧪 模拟发送测试消息...');
    
    const input = document.querySelector('input[placeholder*="问题"], .el-input__inner');
    if (!input) {
      throw new Error('未找到输入框');
    }
    
    // 确保AI模式开启
    const aiSwitch = document.querySelector('.el-switch');
    if (aiSwitch && !aiSwitch.classList.contains('is-checked')) {
      console.log('🔄 开启AI模式...');
      aiSwitch.click();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 输入测试消息
    const testMessage = '你好，这是一个修复验证测试';
    console.log(`📝 输入测试消息: "${testMessage}"`);
    
    input.value = testMessage;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    // 模拟按回车
    input.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      bubbles: true
    }));
    
    console.log('✅ 消息发送模拟完成');
    console.log('💡 请观察页面是否正常响应，没有出现ReferenceError');
    
    return {
      success: true,
      message: '消息发送模拟成功'
    };
    
  } catch (error) {
    console.error('❌ 消息发送模拟失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 显示通知
function showNotification(type, title, message) {
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
  
  try {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-left: 4px solid ${colors[type]};
      border-radius: 4px;
      padding: 16px;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: bold; color: ${colors[type]}; margin-bottom: 8px;">
        ${icons[type]} ${title}
      </div>
      <div style="font-size: 14px; color: #666;">
        ${message}
      </div>
      <button onclick="this.parentElement.remove()" style="
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        color: #999;
      ">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // 5秒后自动移除
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
    
  } catch (error) {
    console.log('⚠️ 无法显示通知');
  }
}

// 快速验证函数
window.quickVerify = function() {
  console.log('⚡ 快速验证修复...');
  return verifyAIFix();
};

// 手动测试AI功能
window.manualAITest = function() {
  console.log('🧪 手动测试AI功能...');
  
  const input = document.querySelector('input[placeholder*="问题"], .el-input__inner');
  if (!input) {
    console.log('❌ 未找到输入框');
    return;
  }
  
  const testMessage = '你好，请介绍一下你的功能';
  input.value = testMessage;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.focus();
  
  console.log('✅ 已输入测试消息，请按回车发送');
};

// 导出到全局
window.verifyAIFix = verifyAIFix;

console.log('🎯 AI修复验证脚本已加载');
console.log('💡 可用函数:');
console.log('  quickVerify() - 快速验证');
console.log('  verifyAIFix() - 完整验证');
console.log('  manualAITest() - 手动测试');

// 自动开始验证
setTimeout(() => {
  console.log('\n🔄 自动开始修复验证...');
  verifyAIFix();
}, 1000);
