/**
 * 智能问答助手故障排除指南
 */

console.log('🔧 智能问答助手故障排除指南\n');

console.log('📋 问题诊断步骤:\n');

console.log('1. 🔍 检查服务状态:');
console.log('   - 后端服务: http://localhost:3002/health');
console.log('   - 前端服务: http://localhost:5173/');
console.log('   - 确保两个服务都返回200状态码\n');

console.log('2. 🌐 检查网络连接:');
console.log('   - 测试API端点: curl http://localhost:3002/api/assistant/query');
console.log('   - 测试前端代理: curl http://localhost:5173/api/health');
console.log('   - 确保代理配置正确\n');

console.log('3. 📊 检查数据状态:');
console.log('   - 运行: node quick-push-data.js');
console.log('   - 确保数据推送成功');
console.log('   - 验证查询功能正常\n');

console.log('4. 🎨 检查前端页面:');
console.log('   - 访问: http://localhost:5173');
console.log('   - 点击"智能助手"菜单');
console.log('   - 检查浏览器控制台是否有错误\n');

console.log('🔧 常见问题解决方案:\n');

console.log('❌ 问题1: 页面无法打开');
console.log('   解决方案:');
console.log('   - 检查路由配置是否正确');
console.log('   - 确认组件文件存在且无语法错误');
console.log('   - 重启前端服务: npm run dev\n');

console.log('❌ 问题2: 图表不显示');
console.log('   解决方案:');
console.log('   - 检查ChartRenderer组件是否正确导入');
console.log('   - 确认ECharts库已安装');
console.log('   - 使用测试版本页面(AssistantPageTest.vue)\n');

console.log('❌ 问题3: API调用失败');
console.log('   解决方案:');
console.log('   - 检查后端服务是否运行');
console.log('   - 验证代理配置(vite.config.js)');
console.log('   - 检查CORS设置\n');

console.log('❌ 问题4: 数据查询无结果');
console.log('   解决方案:');
console.log('   - 运行数据推送脚本');
console.log('   - 检查NLP规则配置');
console.log('   - 验证数据格式正确性\n');

console.log('🚀 快速修复命令:\n');

console.log('# 重启所有服务');
console.log('taskkill /f /im node.exe');
console.log('cd backend && npm start');
console.log('cd ai-inspection-dashboard && npm run dev\n');

console.log('# 推送测试数据');
console.log('cd backend && node quick-push-data.js\n');

console.log('# 测试API连接');
console.log('curl http://localhost:3002/health');
console.log('curl http://localhost:5173/\n');

console.log('💡 当前状态检查:\n');

// 检查当前状态
import fetch from 'node-fetch';

async function checkCurrentStatus() {
  try {
    // 检查后端
    const backendResponse = await fetch('http://localhost:3002/health');
    console.log(`✅ 后端服务: ${backendResponse.status === 200 ? '正常' : '异常'}`);
    
    // 检查前端
    const frontendResponse = await fetch('http://localhost:5173/');
    console.log(`✅ 前端服务: ${frontendResponse.status === 200 ? '正常' : '异常'}`);
    
    // 测试API
    const apiResponse = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '测试查询' })
    });
    console.log(`✅ API查询: ${apiResponse.status === 200 ? '正常' : '异常'}`);
    
    console.log('\n🎉 如果所有服务都正常，请访问: http://localhost:5173');
    console.log('📱 点击"智能助手"菜单进入问答页面');
    
  } catch (error) {
    console.log(`❌ 服务检查失败: ${error.message}`);
    console.log('💡 请按照上述步骤重启服务');
  }
}

checkCurrentStatus().catch(console.error);
