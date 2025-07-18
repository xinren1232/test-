// 检查前后端服务状态
import fetch from 'node-fetch';

async function checkServiceStatus() {
  console.log('🔍 检查前后端服务状态...\n');
  
  // 检查后端服务
  try {
    console.log('📡 检查后端服务 (http://localhost:3001)...');
    
    // 健康检查
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ 后端健康检查: 正常');
      console.log(`   响应: ${healthData.message}`);
    } else {
      console.log('❌ 后端健康检查: 失败');
    }
    
    // 规则API检查
    const rulesResponse = await fetch('http://localhost:3001/api/rules');
    const rulesData = await rulesResponse.json();
    
    if (rulesResponse.ok && rulesData.success) {
      console.log('✅ 后端规则API: 正常');
      console.log(`   规则数量: ${rulesData.total} 条`);
      console.log(`   示例规则: ${rulesData.data[0]?.intent_name || '无'}`);
    } else {
      console.log('❌ 后端规则API: 失败');
    }
    
  } catch (error) {
    console.log('❌ 后端服务: 无法连接');
    console.log(`   错误: ${error.message}`);
  }
  
  console.log('');
  
  // 检查前端服务
  try {
    console.log('🌐 检查前端服务 (http://localhost:5173)...');
    
    const frontendResponse = await fetch('http://localhost:5173');
    
    if (frontendResponse.ok) {
      console.log('✅ 前端服务: 正常');
      console.log(`   状态码: ${frontendResponse.status}`);
    } else {
      console.log('❌ 前端服务: 响应异常');
      console.log(`   状态码: ${frontendResponse.status}`);
    }
    
  } catch (error) {
    console.log('❌ 前端服务: 无法连接');
    console.log(`   错误: ${error.message}`);
  }
  
  console.log('\n🎯 服务状态检查完成！');
  console.log('📚 访问地址:');
  console.log('   前端: http://localhost:5173');
  console.log('   后端API: http://localhost:3001/api/health');
  console.log('   规则管理: http://localhost:3001/api/rules');
}

checkServiceStatus().catch(console.error);
