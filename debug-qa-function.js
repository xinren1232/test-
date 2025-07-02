/**
 * AI智能问答助手页面调试脚本
 * 在浏览器控制台中运行，检查问答功能
 */

console.log('🔍 开始调试AI智能问答助手页面...\n');

// 1. 检查页面元素
console.log('📊 步骤1: 检查页面元素...');

const inputElement = document.querySelector('input[placeholder*="问题"]') || 
                    document.querySelector('.el-input__inner') ||
                    document.querySelector('input[type="text"]');

const sendButton = document.querySelector('button[type="submit"]') ||
                  document.querySelector('.el-button') ||
                  document.querySelector('button');

console.log('🔍 页面元素检查:');
console.log(`  - 输入框: ${inputElement ? '✅ 找到' : '❌ 未找到'}`);
console.log(`  - 发送按钮: ${sendButton ? '✅ 找到' : '❌ 未找到'}`);

if (inputElement) {
  console.log(`  - 输入框类型: ${inputElement.tagName}`);
  console.log(`  - 输入框类名: ${inputElement.className}`);
  console.log(`  - 输入框占位符: ${inputElement.placeholder}`);
}

if (sendButton) {
  console.log(`  - 按钮文本: ${sendButton.textContent}`);
  console.log(`  - 按钮类名: ${sendButton.className}`);
}

// 2. 检查Vue应用实例
console.log('\n📊 步骤2: 检查Vue应用实例...');

// 尝试获取Vue应用实例
let vueApp = null;
if (window.__VUE__) {
  console.log('✅ Vue开发工具可用');
}

// 检查页面中的Vue组件
const vueElements = document.querySelectorAll('[data-v-]');
console.log(`🔍 Vue组件元素数量: ${vueElements.length}`);

// 3. 检查事件监听器
console.log('\n📊 步骤3: 检查事件监听器...');

if (inputElement) {
  const inputEvents = getEventListeners ? getEventListeners(inputElement) : {};
  console.log('🔍 输入框事件监听器:', Object.keys(inputEvents));
}

if (sendButton) {
  const buttonEvents = getEventListeners ? getEventListeners(sendButton) : {};
  console.log('🔍 发送按钮事件监听器:', Object.keys(buttonEvents));
}

// 4. 模拟用户输入测试
console.log('\n📊 步骤4: 模拟用户输入测试...');

function simulateUserInput(text) {
  if (!inputElement) {
    console.log('❌ 无法找到输入框，无法模拟输入');
    return false;
  }
  
  try {
    // 设置输入值
    inputElement.value = text;
    
    // 触发input事件
    const inputEvent = new Event('input', { bubbles: true });
    inputElement.dispatchEvent(inputEvent);
    
    // 触发change事件
    const changeEvent = new Event('change', { bubbles: true });
    inputElement.dispatchEvent(changeEvent);
    
    console.log(`✅ 成功模拟输入: "${text}"`);
    return true;
  } catch (error) {
    console.log(`❌ 模拟输入失败: ${error.message}`);
    return false;
  }
}

function simulateButtonClick() {
  if (!sendButton) {
    console.log('❌ 无法找到发送按钮，无法模拟点击');
    return false;
  }
  
  try {
    // 触发click事件
    const clickEvent = new Event('click', { bubbles: true });
    sendButton.dispatchEvent(clickEvent);
    
    console.log('✅ 成功模拟按钮点击');
    return true;
  } catch (error) {
    console.log(`❌ 模拟点击失败: ${error.message}`);
    return false;
  }
}

// 5. 检查网络请求
console.log('\n📊 步骤5: 检查网络请求能力...');

async function testNetworkRequests() {
  console.log('🔍 测试网络请求...');
  
  // 测试基础网络连接
  try {
    const response = await fetch('/api/test', { method: 'GET' });
    console.log(`📡 前端代理连接: ${response.status === 404 ? '✅ 可达' : '❓ 状态' + response.status}`);
  } catch (error) {
    console.log(`❌ 前端代理连接失败: ${error.message}`);
  }
  
  // 测试后端连接
  try {
    const response = await fetch('http://localhost:3002/api/test', { method: 'GET' });
    console.log(`📡 后端直连: ${response.status === 404 ? '✅ 可达' : '❓ 状态' + response.status}`);
  } catch (error) {
    console.log(`❌ 后端直连失败: ${error.message}`);
  }
}

testNetworkRequests();

// 6. 检查控制台错误
console.log('\n📊 步骤6: 检查控制台错误...');

// 监听新的错误
const originalError = console.error;
console.error = function(...args) {
  console.log('🚨 检测到控制台错误:', args);
  originalError.apply(console, args);
};

// 7. 提供手动测试函数
console.log('\n📊 步骤7: 提供手动测试函数...');

window.testQAFunction = function(testMessage = '测试问题') {
  console.log(`🧪 开始测试问答功能: "${testMessage}"`);
  
  // 1. 模拟输入
  if (simulateUserInput(testMessage)) {
    console.log('✅ 输入模拟成功');
    
    // 2. 等待一下再点击
    setTimeout(() => {
      if (simulateButtonClick()) {
        console.log('✅ 点击模拟成功');
        
        // 3. 监听响应
        setTimeout(() => {
          const messages = document.querySelectorAll('.message, .chat-message, .el-message');
          console.log(`📝 页面消息数量: ${messages.length}`);
          
          if (messages.length > 0) {
            console.log('✅ 检测到页面消息更新');
            Array.from(messages).slice(-2).forEach((msg, index) => {
              console.log(`  消息${index + 1}: ${msg.textContent.substring(0, 100)}...`);
            });
          } else {
            console.log('❌ 未检测到页面消息更新');
          }
        }, 2000);
      }
    }, 500);
  }
};

// 8. 检查数据服务
console.log('\n📊 步骤8: 检查数据服务...');

// 检查localStorage数据
const inventoryData = localStorage.getItem('unified_inventory_data') || localStorage.getItem('inventory_data');
const labData = localStorage.getItem('unified_lab_data') || localStorage.getItem('lab_data');
const factoryData = localStorage.getItem('unified_factory_data') || localStorage.getItem('factory_data');

console.log('📊 localStorage数据状态:');
console.log(`  - 库存数据: ${inventoryData ? '✅ 存在' : '❌ 不存在'}`);
console.log(`  - 测试数据: ${labData ? '✅ 存在' : '❌ 不存在'}`);
console.log(`  - 生产数据: ${factoryData ? '✅ 存在' : '❌ 不存在'}`);

// 9. 检查Vue响应式数据
console.log('\n📊 步骤9: 检查Vue响应式数据...');

// 尝试访问Vue组件的数据
try {
  const appElement = document.querySelector('#app') || document.querySelector('.app');
  if (appElement && appElement.__vue__) {
    console.log('✅ 找到Vue实例');
    const vueInstance = appElement.__vue__;
    console.log('📊 Vue实例数据:', Object.keys(vueInstance.$data || {}));
  } else {
    console.log('❌ 未找到Vue实例');
  }
} catch (error) {
  console.log(`❌ 访问Vue实例失败: ${error.message}`);
}

// 10. 提供完整测试流程
console.log('\n📊 步骤10: 提供完整测试流程...');

window.fullQATest = async function() {
  console.log('🚀 开始完整问答功能测试...\n');
  
  // 测试1: 基础输入输出
  console.log('🧪 测试1: 基础输入输出');
  testQAFunction('查询深圳工厂库存');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 测试2: AI功能
  console.log('\n🧪 测试2: AI功能测试');
  
  // 先开启AI模式
  const aiSwitch = document.querySelector('.el-switch') || document.querySelector('[role="switch"]');
  if (aiSwitch) {
    aiSwitch.click();
    console.log('✅ 尝试开启AI模式');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    testQAFunction('分析深圳工厂的整体质量状况');
  } else {
    console.log('❌ 未找到AI模式开关');
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 测试3: 网络请求
  console.log('\n🧪 测试3: 网络请求测试');
  try {
    const response = await fetch('/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '测试查询' })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 网络请求成功:', result);
    } else {
      console.log(`❌ 网络请求失败: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ 网络请求异常: ${error.message}`);
  }
  
  console.log('\n🎯 完整测试完成！');
};

// 输出使用说明
console.log('\n🎯 调试完成！可用的测试函数:');
console.log('💡 testQAFunction("你的问题") - 测试单个问答');
console.log('💡 fullQATest() - 运行完整测试流程');
console.log('💡 检查上方的诊断结果，查找问题根源');

// 自动运行基础检查
console.log('\n🔄 自动运行基础检查...');
setTimeout(() => {
  testQAFunction('测试问题');
}, 1000);
