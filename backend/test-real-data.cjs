// 测试真实数据读取
const fetch = require('node-fetch');

async function testRealData() {
  try {
    console.log('🧪 测试真实数据读取...\n');
    
    // 1. 测试库存查询
    console.log('📦 测试库存查询 (132条数据)...');
    const inventoryResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: '查询库存信息'
      })
    });
    
    if (inventoryResponse.ok) {
      const inventoryResult = await inventoryResponse.json();
      console.log('✅ 库存查询成功');
      console.log(`📊 返回数据: ${inventoryResult.data?.tableData?.length || 0} 条`);
      console.log(`📋 匹配规则: ${inventoryResult.data?.matchedRule || '未知'}`);
      console.log(`📈 统计卡片: ${inventoryResult.data?.cards?.length || 0} 个`);
      
      if (inventoryResult.data?.tableData?.length > 0) {
        console.log('📝 前3条数据样本:');
        inventoryResult.data.tableData.slice(0, 3).forEach((item, index) => {
          console.log(`  记录${index + 1}:`);
          console.log(`    物料名称: ${item['物料名称']}`);
          console.log(`    供应商: ${item['供应商']}`);
          console.log(`    工厂: ${item['工厂']}`);
          console.log(`    数量: ${item['数量']}`);
          console.log(`    状态: ${item['状态']}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ 库存查询失败:', inventoryResponse.status);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. 测试检验查询
    console.log('🔬 测试检验查询 (396条数据)...');
    const inspectionResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: '查询检验数据'
      })
    });
    
    if (inspectionResponse.ok) {
      const inspectionResult = await inspectionResponse.json();
      console.log('✅ 检验查询成功');
      console.log(`📊 返回数据: ${inspectionResult.data?.tableData?.length || 0} 条`);
      console.log(`📋 匹配规则: ${inspectionResult.data?.matchedRule || '未知'}`);
      console.log(`📈 统计卡片: ${inspectionResult.data?.cards?.length || 0} 个`);
      
      if (inspectionResult.data?.tableData?.length > 0) {
        console.log('📝 前3条数据样本:');
        inspectionResult.data.tableData.slice(0, 3).forEach((item, index) => {
          console.log(`  记录${index + 1}:`);
          console.log(`    物料名称: ${item['物料名称']}`);
          console.log(`    供应商: ${item['供应商']}`);
          console.log(`    测试结果: ${item['测试结果']}`);
          console.log(`    测试日期: ${item['测试日期']}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ 检验查询失败:', inspectionResponse.status);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. 测试生产查询
    console.log('🏭 测试生产查询 (1056条数据)...');
    const productionResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: '查询生产数据'
      })
    });
    
    if (productionResponse.ok) {
      const productionResult = await productionResponse.json();
      console.log('✅ 生产查询成功');
      console.log(`📊 返回数据: ${productionResult.data?.tableData?.length || 0} 条`);
      console.log(`📋 匹配规则: ${productionResult.data?.matchedRule || '未知'}`);
      console.log(`📈 统计卡片: ${productionResult.data?.cards?.length || 0} 个`);
      
      if (productionResult.data?.tableData?.length > 0) {
        console.log('📝 前3条数据样本:');
        productionResult.data.tableData.slice(0, 3).forEach((item, index) => {
          console.log(`  记录${index + 1}:`);
          console.log(`    物料名称: ${item['物料名称']}`);
          console.log(`    供应商: ${item['供应商']}`);
          console.log(`    工厂: ${item['工厂']}`);
          console.log(`    项目ID: ${item['项目ID']}`);
          console.log(`    缺陷率: ${item['缺陷率']}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ 生产查询失败:', productionResponse.status);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 4. 测试供应商过滤
    console.log('🔍 测试供应商过滤查询...');
    const supplierResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: '查询BOE供应商的库存'
      })
    });
    
    if (supplierResponse.ok) {
      const supplierResult = await supplierResponse.json();
      console.log('✅ 供应商过滤查询成功');
      console.log(`📊 返回数据: ${supplierResult.data?.tableData?.length || 0} 条`);
      console.log(`📋 匹配规则: ${supplierResult.data?.matchedRule || '未知'}`);
      
      if (supplierResult.data?.tableData?.length > 0) {
        console.log('📝 BOE供应商数据样本:');
        supplierResult.data.tableData.slice(0, 2).forEach((item, index) => {
          console.log(`  记录${index + 1}:`);
          console.log(`    供应商: ${item['供应商']}`);
          console.log(`    物料名称: ${item['物料名称']}`);
          console.log(`    数量: ${item['数量']}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ 供应商过滤查询失败:', supplierResponse.status);
    }
    
    console.log('🎉 真实数据测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testRealData();
