// 快速测试问答功能
// 在浏览器控制台中运行这段代码

console.log('🧪 快速测试问答功能');

// 1. 查找输入框
const input = document.querySelector('.el-input__inner');
console.log('输入框:', input ? '找到' : '未找到');

if (input) {
  // 2. 设置测试消息
  input.value = '查询库存状态';
  
  // 3. 触发input事件
  input.dispatchEvent(new Event('input', { bubbles: true }));
  
  // 4. 触发回车键
  input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
  
  console.log('✅ 测试消息已发送');
  
  // 5. 检查结果
  setTimeout(() => {
    const messages = document.querySelectorAll('[class*="message"]');
    console.log('消息数量:', messages.length);
    if (messages.length > 0) {
      console.log('最新消息:', messages[messages.length - 1].textContent);
    }
  }, 2000);
} else {
  console.log('❌ 未找到输入框');
}
