/**
 * 前端数据同步修复脚本
 * 在浏览器控制台中运行此脚本
 */

console.log('🔧 开始修复前端数据同步问题...');

// 1. 检查localStorage中的数据
function checkLocalStorageData() {
  console.log('\n📊 检查localStorage数据:');
  
  const inventoryData = localStorage.getItem('unified_inventory_data');
  const labData = localStorage.getItem('unified_lab_data');
  const factoryData = localStorage.getItem('unified_factory_data');
  
  console.log('库存数据:', inventoryData ? JSON.parse(inventoryData).length + ' 条' : '无数据');
  console.log('检测数据:', labData ? JSON.parse(labData).length + ' 条' : '无数据');
  console.log('生产数据:', factoryData ? JSON.parse(factoryData).length + ' 条' : '无数据');
  
  return {
    inventory: inventoryData ? JSON.parse(inventoryData) : [],
    inspection: labData ? JSON.parse(labData) : [],
    production: factoryData ? JSON.parse(factoryData) : []
  };
}

// 2. 手动推送数据到后端
async function manualPushData() {
  console.log('\n🔄 手动推送数据到后端...');
  
  try {
    const data = checkLocalStorageData();
    
    if (data.inventory.length === 0 && data.inspection.length === 0 && data.production.length === 0) {
      console.log('⚠️ 没有数据可推送，请先生成数据');
      return false;
    }
    
    console.log(`准备推送: 库存${data.inventory.length}条, 检测${data.inspection.length}条, 生产${data.production.length}条`);
    
    const response = await fetch('/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 数据推送成功:', result);
      return true;
    } else {
      const error = await response.text();
      console.log('❌ 数据推送失败:', response.status, error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ 推送过程出错:', error);
    return false;
  }
}

// 3. 测试问答功能
async function testQAFunction() {
  console.log('\n🎯 测试问答功能...');
  
  const testQueries = [
    '查询库存状态',
    '有哪些风险物料？',
    '查询测试记录',
    '工厂数据汇总'
  ];
  
  for (const query of testQueries) {
    console.log(`\n测试查询: "${query}"`);
    
    try {
      const response = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ 查询成功:', result.reply.substring(0, 50) + '...');
      } else {
        const error = await response.text();
        console.log('❌ 查询失败:', response.status, error);
      }
    } catch (error) {
      console.error('❌ 查询出错:', error);
    }
  }
}

// 4. 完整的修复流程
async function fullRepairProcess() {
  console.log('\n🔧 开始完整修复流程...');
  
  // 检查数据
  const data = checkLocalStorageData();
  
  if (data.inventory.length === 0 && data.inspection.length === 0 && data.production.length === 0) {
    console.log('⚠️ 检测到没有数据，请按以下步骤操作:');
    console.log('1. 访问 数据管理 页面');
    console.log('2. 点击 "快速生成数据" 按钮');
    console.log('3. 生成库存、检测、生产数据');
    console.log('4. 重新运行此修复脚本');
    return;
  }
  
  // 推送数据
  const pushSuccess = await manualPushData();
  
  if (pushSuccess) {
    // 测试问答
    await testQAFunction();
    console.log('\n🎉 数据同步修复完成！');
  } else {
    console.log('\n❌ 数据推送失败，请检查后端服务状态');
  }
}

// 5. 诊断网络连接
async function diagnoseNetworkConnection() {
  console.log('\n🔍 诊断网络连接...');
  
  try {
    // 测试后端健康检查
    const healthResponse = await fetch('/api/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ 后端服务正常:', healthData.status);
    } else {
      console.log('❌ 后端服务异常:', healthResponse.status);
    }
  } catch (error) {
    console.log('❌ 无法连接后端服务:', error.message);
  }
}

// 导出函数供控制台使用
window.dataSync = {
  checkData: checkLocalStorageData,
  pushData: manualPushData,
  testQA: testQAFunction,
  fullRepair: fullRepairProcess,
  diagnose: diagnoseNetworkConnection
};

console.log('\n📋 可用命令:');
console.log('- dataSync.checkData() - 检查本地数据');
console.log('- dataSync.pushData() - 手动推送数据');
console.log('- dataSync.testQA() - 测试问答功能');
console.log('- dataSync.fullRepair() - 完整修复流程');
console.log('- dataSync.diagnose() - 诊断网络连接');

console.log('\n🚀 建议先运行: dataSync.fullRepair()');

// 自动运行诊断
dataSync.diagnose();
