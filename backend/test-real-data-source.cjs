// 测试从真实数据表查询
const axios = require('axios');

async function testRealDataSource() {
  try {
    console.log('🔍 测试从真实数据表查询...\n');
    
    // 测试库存查询
    console.log('📦 测试库存数据查询:');
    const inventoryResponse = await axios.post('http://localhost:3001/api/assistant/query', {
      query: '查询库存信息'
    });
    
    if (inventoryResponse.data.success && inventoryResponse.data.tableData.length > 0) {
      console.log(`✅ 成功获取 ${inventoryResponse.data.tableData.length} 条库存数据`);
      
      const firstItem = inventoryResponse.data.tableData[0];
      console.log('第一条库存数据:');
      Object.entries(firstItem).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
      
      // 检查是否是真实数据（不是"未知"数据）
      const hasRealData = firstItem.工厂 !== '未知工厂' && 
                         firstItem.仓库 !== '未知仓库' && 
                         firstItem.供应商 !== '未知供应商';
      
      if (hasRealData) {
        console.log('✅ 确认获取到真实数据！');
      } else {
        console.log('❌ 仍然是模拟数据，需要进一步检查');
      }
    } else {
      console.log('❌ 库存数据查询失败');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 测试检验查询
    console.log('🔬 测试检验数据查询:');
    const inspectionResponse = await axios.post('http://localhost:3001/api/assistant/query', {
      query: '查询检验数据'
    });
    
    if (inspectionResponse.data.success && inspectionResponse.data.tableData.length > 0) {
      console.log(`✅ 成功获取 ${inspectionResponse.data.tableData.length} 条检验数据`);
      
      const firstItem = inspectionResponse.data.tableData[0];
      console.log('第一条检验数据:');
      Object.entries(firstItem).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    } else {
      console.log('❌ 检验数据查询失败');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 测试生产查询
    console.log('🏭 测试生产数据查询:');
    const productionResponse = await axios.post('http://localhost:3001/api/assistant/query', {
      query: '查询生产数据'
    });
    
    if (productionResponse.data.success && productionResponse.data.tableData.length > 0) {
      console.log(`✅ 成功获取 ${productionResponse.data.tableData.length} 条生产数据`);
      
      const firstItem = productionResponse.data.tableData[0];
      console.log('第一条生产数据:');
      Object.entries(firstItem).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    } else {
      console.log('❌ 生产数据查询失败');
    }
    
    console.log('\n🎯 真实数据源测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testRealDataSource();
