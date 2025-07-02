/**
 * DeepSeek API连接测试脚本
 */

console.log('🤖 DeepSeek API连接测试\n');

// 模拟浏览器环境的fetch
if (typeof fetch === 'undefined') {
  console.log('⚠️ 注意：此脚本需要在浏览器环境中运行，或者安装node-fetch');
  console.log('在浏览器控制台中运行以下代码：\n');
}

const testCode = `
// DeepSeek API测试代码
async function testDeepSeekAPI() {
  const apiKey = 'sk-cab797574abf4288bcfaca253191565d';
  const baseURL = 'https://api.deepseek.com';
  const endpoint = '/chat/completions';
  
  console.log('🔍 测试DeepSeek API连接...');
  console.log('📍 API地址:', baseURL + endpoint);
  console.log('🔑 API密钥:', apiKey.substring(0, 10) + '...');
  console.log('🤖 模型:', 'deepseek-chat');
  console.log('');
  
  try {
    const response = await fetch(baseURL + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${apiKey}\`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个质量管理专家，请简洁回答。'
          },
          {
            role: 'user',
            content: '你好，请介绍一下你的能力。'
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
        stream: false
      })
    });
    
    console.log('📡 HTTP状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API调用失败:');
      console.error('   状态码:', response.status);
      console.error('   错误信息:', errorData.error?.message || response.statusText);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ API调用成功!');
    console.log('');
    console.log('📊 响应数据:');
    console.log('   模型:', data.model);
    console.log('   用量:', data.usage);
    console.log('   回复:', data.choices[0].message.content);
    console.log('');
    
    return true;
    
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    
    if (error.message.includes('fetch')) {
      console.error('💡 可能的原因:');
      console.error('   - 网络连接问题');
      console.error('   - CORS跨域限制');
      console.error('   - 防火墙阻止');
    } else if (error.message.includes('401')) {
      console.error('💡 API密钥无效，请检查配置');
    } else if (error.message.includes('429')) {
      console.error('💡 API调用频率超限，请稍后重试');
    }
    
    return false;
  }
}

// 执行测试
testDeepSeekAPI().then(success => {
  if (success) {
    console.log('🎉 DeepSeek API集成测试通过！');
    console.log('✅ 可以正常使用AI功能');
  } else {
    console.log('❌ DeepSeek API集成测试失败');
    console.log('🔧 请检查网络连接和API配置');
  }
});
`;

console.log('📋 测试步骤:');
console.log('');
console.log('1. 🌐 打开浏览器开发者工具');
console.log('2. 📝 复制以下代码到控制台');
console.log('3. ⚡ 按回车执行测试');
console.log('4. 📊 查看测试结果');
console.log('');

console.log('🔧 测试代码:');
console.log('```javascript');
console.log(testCode);
console.log('```');
console.log('');

console.log('📋 根据DeepSeek官方文档的配置验证:');
console.log('');
console.log('✅ 配置项检查:');
console.log('   📍 base_url: https://api.deepseek.com');
console.log('   🔑 api_key: sk-cab797574abf4288bcfaca253191565d');
console.log('   🤖 model: deepseek-chat (指向 DeepSeek-V3-0324)');
console.log('   📡 endpoint: /chat/completions');
console.log('   🔄 stream: 支持流式和非流式');
console.log('');

console.log('📊 API参数说明:');
console.log('   • model: "deepseek-chat" - 使用最新的DeepSeek-V3-0324模型');
console.log('   • temperature: 0.7 - 平衡创造性和准确性');
console.log('   • max_tokens: 2000 - 限制回复长度');
console.log('   • stream: true/false - 支持流式响应');
console.log('');

console.log('🔍 错误排查指南:');
console.log('');
console.log('1. 🔑 API密钥问题:');
console.log('   - 检查密钥是否正确');
console.log('   - 确认密钥是否有效');
console.log('   - 验证账户余额');
console.log('');

console.log('2. 🌐 网络连接问题:');
console.log('   - 检查网络连接');
console.log('   - 确认防火墙设置');
console.log('   - 验证DNS解析');
console.log('');

console.log('3. 🚫 CORS跨域问题:');
console.log('   - 浏览器可能阻止跨域请求');
console.log('   - 在生产环境中通过后端代理');
console.log('   - 或使用CORS扩展进行测试');
console.log('');

console.log('4. 📊 API限制:');
console.log('   - 检查调用频率限制');
console.log('   - 确认账户配额');
console.log('   - 查看API状态页面');
console.log('');

console.log('🎯 优化建议:');
console.log('');
console.log('1. 🔧 生产环境配置:');
console.log('   - 将API密钥存储在环境变量中');
console.log('   - 通过后端代理API调用');
console.log('   - 实现请求重试机制');
console.log('   - 添加请求缓存');
console.log('');

console.log('2. 📊 监控和日志:');
console.log('   - 记录API调用日志');
console.log('   - 监控调用成功率');
console.log('   - 跟踪响应时间');
console.log('   - 设置错误告警');
console.log('');

console.log('3. 🚀 性能优化:');
console.log('   - 合理设置max_tokens');
console.log('   - 优化提示词长度');
console.log('   - 使用流式响应提升体验');
console.log('   - 实现请求队列管理');
console.log('');

console.log('📚 参考资源:');
console.log('   📖 官方文档: https://api-docs.deepseek.com/zh-cn/');
console.log('   🔧 API状态: https://status.deepseek.com/');
console.log('   💬 社区支持: Discord, Twitter');
console.log('   📧 技术支持: api-service@deepseek.com');
console.log('');

console.log('🎉 完成API测试后，即可在IQE AI助手中体验真正的AI分析能力！');
