// 测试前端数据加载情况
(function() {
  console.log('🧪 开始测试前端数据加载情况...');
  
  // 检查所有可能的localStorage键
  const keys = [
    'inventoryData',
    'testData', 
    'productionData',
    'batchData',
    'unified_inventory_data',
    'unified_lab_data',
    'unified_factory_data',
    'inventory_data',
    'lab_data',
    'lab_test_data',
    'factory_data',
    'online_data',
    'batch_data'
  ];
  
  console.log('📊 localStorage数据检查:');
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log(`✅ ${key}: ${Array.isArray(parsed) ? parsed.length : 'N/A'} 条记录`);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`   首条数据:`, parsed[0]);
        }
      } catch (error) {
        console.log(`❌ ${key}: 解析失败 - ${error.message}`);
      }
    } else {
      console.log(`⚪ ${key}: 不存在`);
    }
  });
  
  // 测试前端智能问答引擎的数据加载逻辑
  console.log('\n🔍 测试前端数据加载逻辑:');
  
  const inventoryData = JSON.parse(
    localStorage.getItem('inventoryData') ||
    localStorage.getItem('unified_inventory_data') ||
    localStorage.getItem('inventory_data') ||
    '[]'
  );
  const testData = JSON.parse(
    localStorage.getItem('testData') ||
    localStorage.getItem('unified_lab_data') ||
    localStorage.getItem('lab_data') ||
    localStorage.getItem('lab_test_data') ||
    '[]'
  );
  const productionData = JSON.parse(
    localStorage.getItem('productionData') ||
    localStorage.getItem('unified_factory_data') ||
    localStorage.getItem('factory_data') ||
    localStorage.getItem('online_data') ||
    '[]'
  );
  const batchData = JSON.parse(
    localStorage.getItem('batchData') ||
    localStorage.getItem('batch_data') ||
    '[]'
  );
  
  console.log(`📊 前端引擎数据统计:`);
  console.log(`   库存数据: ${inventoryData.length} 条`);
  console.log(`   测试数据: ${testData.length} 条`);
  console.log(`   生产数据: ${productionData.length} 条`);
  console.log(`   批次数据: ${batchData.length} 条`);
  
  // 如果没有数据，尝试加载同步脚本
  if (inventoryData.length === 0 && testData.length === 0 && productionData.length === 0) {
    console.log('⚠️ 检测到无数据，尝试加载同步脚本...');
    
    const script = document.createElement('script');
    script.src = '/sync-data-auto.js';
    script.onload = () => {
      console.log('✅ 同步脚本加载完成，请重新运行此测试');
    };
    script.onerror = () => {
      console.log('❌ 同步脚本加载失败');
    };
    document.head.appendChild(script);
  } else {
    console.log('✅ 检测到数据，前端智能问答引擎应该可以正常工作');
    
    // 测试意图识别
    if (window.recognizeQueryIntent) {
      const testQueries = ['查询电池库存', '查询BOE供应商库存', '查询测试失败(NG)的记录'];
      console.log('\n🎯 测试意图识别:');
      testQueries.forEach(query => {
        const intent = window.recognizeQueryIntent(query);
        console.log(`   "${query}" -> ${intent}`);
      });
    } else {
      console.log('⚠️ recognizeQueryIntent函数不存在，可能页面未完全加载');
    }
  }
  
  console.log('\n🏁 测试完成');
})();
