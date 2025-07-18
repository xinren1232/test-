// 测试完整字段映射
const axios = require('axios');

async function testCompleteFields() {
  try {
    console.log('🔍 测试完整字段映射...\n');
    
    // 测试库存查询 - 应该包含所有字段
    console.log('📦 测试库存数据完整字段:');
    const inventoryResponse = await axios.post('http://localhost:3001/api/assistant/query', {
      query: '查询库存信息'
    });
    
    if (inventoryResponse.data.success && inventoryResponse.data.tableData.length > 0) {
      console.log(`✅ 成功获取 ${inventoryResponse.data.tableData.length} 条库存数据`);
      
      const firstItem = inventoryResponse.data.tableData[0];
      console.log('库存数据字段列表:');
      const fields = Object.keys(firstItem);
      console.log(`  字段数量: ${fields.length}`);
      console.log(`  字段列表: ${fields.join(', ')}`);
      
      console.log('\n第一条库存数据详情:');
      Object.entries(firstItem).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
      
      // 检查期望的字段是否存在
      const expectedFields = ['工厂', '仓库', '物料编码', '物料名称', '物料类型', '供应商', '批次号', '数量', '状态', '入库时间', '到期时间', '备注'];
      const missingFields = expectedFields.filter(field => !fields.includes(field));
      
      if (missingFields.length === 0) {
        console.log('✅ 所有期望字段都存在！');
      } else {
        console.log(`❌ 缺少字段: ${missingFields.join(', ')}`);
      }
      
    } else {
      console.log('❌ 库存数据查询失败');
      console.log('响应:', inventoryResponse.data);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 测试检验查询 - 应该包含所有字段
    console.log('🔬 测试检验数据完整字段:');
    const inspectionResponse = await axios.post('http://localhost:3001/api/assistant/query', {
      query: '查询检验数据'
    });
    
    if (inspectionResponse.data.success && inspectionResponse.data.tableData.length > 0) {
      console.log(`✅ 成功获取 ${inspectionResponse.data.tableData.length} 条检验数据`);
      
      const firstItem = inspectionResponse.data.tableData[0];
      console.log('检验数据字段列表:');
      const fields = Object.keys(firstItem);
      console.log(`  字段数量: ${fields.length}`);
      console.log(`  字段列表: ${fields.join(', ')}`);
      
      console.log('\n第一条检验数据详情:');
      Object.entries(firstItem).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
      
    } else {
      console.log('❌ 检验数据查询失败');
    }
    
    console.log('\n🎯 完整字段映射测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testCompleteFields();
