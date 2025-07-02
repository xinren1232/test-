/**
 * 前端调试脚本 - 在浏览器控制台中运行
 * 用于检查前端数据推送问题
 */

console.log('🔍 开始前端数据推送调试...\n');

// 1. 检查localStorage中的数据
console.log('📊 步骤1: 检查localStorage数据...');

const inventoryData = localStorage.getItem('unified_inventory_data') || localStorage.getItem('inventory_data');
const labData = localStorage.getItem('unified_lab_data') || localStorage.getItem('lab_data');
const factoryData = localStorage.getItem('unified_factory_data') || localStorage.getItem('factory_data');

console.log('📋 localStorage数据状态:');
console.log(`  - 库存数据: ${inventoryData ? '✅ 存在' : '❌ 不存在'}`);
console.log(`  - 测试数据: ${labData ? '✅ 存在' : '❌ 不存在'}`);
console.log(`  - 生产数据: ${factoryData ? '✅ 存在' : '❌ 不存在'}`);

if (inventoryData) {
  try {
    const inventory = JSON.parse(inventoryData);
    console.log(`  - 库存记录数: ${inventory.length}`);
    console.log(`  - 库存数据示例:`, inventory.slice(0, 2));
  } catch (e) {
    console.log('  - 库存数据解析失败:', e.message);
  }
}

if (labData) {
  try {
    const lab = JSON.parse(labData);
    console.log(`  - 测试记录数: ${lab.length}`);
    console.log(`  - 测试数据示例:`, lab.slice(0, 2));
  } catch (e) {
    console.log('  - 测试数据解析失败:', e.message);
  }
}

if (factoryData) {
  try {
    const factory = JSON.parse(factoryData);
    console.log(`  - 生产记录数: ${factory.length}`);
    console.log(`  - 生产数据示例:`, factory.slice(0, 2));
  } catch (e) {
    console.log('  - 生产数据解析失败:', e.message);
  }
}

// 2. 检查前端服务
console.log('\n📊 步骤2: 检查前端服务...');

// 检查是否有SystemDataUpdater
if (typeof window !== 'undefined' && window.systemDataUpdater) {
  console.log('✅ SystemDataUpdater 可用');
} else {
  console.log('❌ SystemDataUpdater 不可用');
}

// 3. 手动测试数据推送
console.log('\n📊 步骤3: 手动测试数据推送...');

async function testDataPush() {
  try {
    // 准备测试数据
    const testData = {
      inventory: inventoryData ? JSON.parse(inventoryData).slice(0, 5) : [
        {
          id: 'TEST_001',
          materialName: '测试物料',
          materialCode: 'TEST-001',
          supplier: '测试供应商',
          quantity: 100,
          status: '正常',
          factory: '测试工厂'
        }
      ],
      inspection: labData ? JSON.parse(labData).slice(0, 3) : [],
      production: factoryData ? JSON.parse(factoryData).slice(0, 3) : []
    };
    
    console.log('🔄 准备推送数据:', {
      inventory: testData.inventory.length,
      inspection: testData.inspection.length,
      production: testData.production.length
    });
    
    // 方法1: 通过前端代理推送
    console.log('🔄 方法1: 通过前端代理推送...');
    const proxyResponse = await fetch('/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📋 代理响应状态:', proxyResponse.status);
    
    if (proxyResponse.ok) {
      const proxyResult = await proxyResponse.json();
      console.log('✅ 前端代理推送成功:', proxyResult);
    } else {
      const proxyError = await proxyResponse.text();
      console.log('❌ 前端代理推送失败:', proxyError);
      
      // 方法2: 直接推送到后端
      console.log('🔄 方法2: 直接推送到后端...');
      const directResponse = await fetch('http://localhost:3002/api/assistant/update-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      console.log('📋 直接响应状态:', directResponse.status);
      
      if (directResponse.ok) {
        const directResult = await directResponse.json();
        console.log('✅ 直接后端推送成功:', directResult);
      } else {
        const directError = await directResponse.text();
        console.log('❌ 直接后端推送失败:', directError);
      }
    }
    
    // 4. 测试查询功能
    console.log('\n📊 步骤4: 测试查询功能...');
    
    const queryResponse = await fetch('/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '查询库存状态' })
    });
    
    if (queryResponse.ok) {
      const queryResult = await queryResponse.json();
      console.log('✅ 查询成功:');
      console.log(queryResult.reply);
    } else {
      console.log('❌ 查询失败:', queryResponse.status);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  }
}

// 执行测试
testDataPush();

// 5. 提供手动推送函数
console.log('\n📊 步骤5: 提供手动推送函数...');

window.manualPushData = async function() {
  console.log('🔄 执行手动数据推送...');
  
  try {
    // 获取最新的localStorage数据
    const currentInventory = localStorage.getItem('unified_inventory_data') || localStorage.getItem('inventory_data');
    const currentLab = localStorage.getItem('unified_lab_data') || localStorage.getItem('lab_data');
    const currentFactory = localStorage.getItem('unified_factory_data') || localStorage.getItem('factory_data');
    
    const pushData = {
      inventory: currentInventory ? JSON.parse(currentInventory) : [],
      inspection: currentLab ? JSON.parse(currentLab) : [],
      production: currentFactory ? JSON.parse(currentFactory) : []
    };
    
    console.log('📊 推送数据统计:', {
      inventory: pushData.inventory.length,
      inspection: pushData.inspection.length,
      production: pushData.production.length
    });
    
    const response = await fetch('/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pushData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 手动推送成功:', result);
      alert('数据推送成功！');
    } else {
      const error = await response.text();
      console.log('❌ 手动推送失败:', error);
      alert('数据推送失败: ' + error);
    }
  } catch (error) {
    console.error('❌ 手动推送出错:', error);
    alert('数据推送出错: ' + error.message);
  }
};

console.log('\n🎯 调试完成！');
console.log('💡 如果需要手动推送数据，请在控制台中运行: manualPushData()');
console.log('💡 如果问题仍然存在，请检查网络面板中的请求详情');
