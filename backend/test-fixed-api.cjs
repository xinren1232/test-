// 测试修复后的API
const axios = require('axios');

async function testFixedAPI() {
  try {
    console.log('🧪 测试修复后的API...\n');
    
    // 1. 测试健康检查
    console.log('1. 测试健康检查...');
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ 健康检查成功:', healthResponse.data.message);
    
    // 2. 测试规则列表
    console.log('\n2. 测试规则列表...');
    const rulesResponse = await axios.get('http://localhost:3001/api/rules');
    console.log(`✅ 获取到${rulesResponse.data.data.length}条规则`);
    
    // 3. 测试智能查询 - 库存查询
    console.log('\n3. 测试智能查询 - 库存查询...');
    const queryResponse = await axios.post('http://localhost:3001/api/assistant/query', {
      query: '查询库存信息',
      context: {}
    });
    
    console.log('📋 查询响应:', JSON.stringify(queryResponse.data, null, 2));

    if (queryResponse.data && queryResponse.data.success && queryResponse.data.data) {
      console.log(`✅ 智能查询成功，返回${queryResponse.data.data.length}条数据`);

      // 显示前3条数据的详细信息
      console.log('\n📦 前3条数据详情:');
      queryResponse.data.data.slice(0, 3).forEach((item, index) => {
        console.log(`\n第${index + 1}条:`);
        Object.entries(item).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      });

      // 检查数据质量
      const firstItem = queryResponse.data.data[0];
      if (firstItem) {
        console.log('\n🔍 数据质量检查:');
        console.log(`   工厂: ${firstItem.工厂 ? '✅ 有效' : '❌ 未识别'}`);
        console.log(`   物料名称: ${firstItem.物料名称 ? '✅ 有效' : '❌ 未识别'}`);
        console.log(`   供应商: ${firstItem.供应商 ? '✅ 有效' : '❌ 未识别'}`);
        console.log(`   数量: ${firstItem.数量 ? '✅ 有效' : '❌ 无数量'}`);
      }

    } else {
      console.log('❌ 智能查询失败:', queryResponse.data ? queryResponse.data.message : '无响应数据');
    }
    
    console.log('\n🎯 API测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testFixedAPI();
