/**
 * 前端完整修复脚本
 * 在浏览器控制台中运行此脚本来修复数据推送问题
 */

console.log('🔧 开始前端完整修复...\n');

// 1. 检查当前localStorage数据
console.log('📊 步骤1: 检查localStorage数据...');

const inventoryData = localStorage.getItem('unified_inventory_data');
const labData = localStorage.getItem('unified_lab_data');
const factoryData = localStorage.getItem('unified_factory_data');

console.log('📋 当前数据状态:');
console.log(`  - 库存数据: ${inventoryData ? '✅ 存在' : '❌ 不存在'}`);
console.log(`  - 测试数据: ${labData ? '✅ 存在' : '❌ 不存在'}`);
console.log(`  - 生产数据: ${factoryData ? '✅ 存在' : '❌ 不存在'}`);

if (inventoryData) {
  try {
    const inventory = JSON.parse(inventoryData);
    console.log(`  - 库存记录数: ${inventory.length}`);
    if (inventory.length > 0) {
      console.log(`  - 示例记录:`, inventory[0]);
    }
  } catch (e) {
    console.log('  - 库存数据解析失败:', e.message);
  }
}

// 2. 如果没有数据，创建标准测试数据
if (!inventoryData || !labData || !factoryData) {
  console.log('\n📊 步骤2: 创建标准测试数据...');
  
  // 创建标准格式的测试数据
  const standardInventoryData = [
    {
      id: 'INV_001',
      materialName: '电池盖',
      materialCode: 'CS-S-B001',
      materialType: '结构件类',
      batchNo: 'JL2024001',
      supplier: '聚龙',
      quantity: 1200,
      status: '正常',
      warehouse: '深圳库存',
      factory: '深圳工厂',
      notes: '正常库存'
    },
    {
      id: 'INV_002',
      materialName: 'OLED显示屏',
      materialCode: 'CS-O-O001',
      materialType: '光学类',
      batchNo: 'BOE2024001',
      supplier: 'BOE',
      quantity: 800,
      status: '风险',
      warehouse: '深圳库存',
      factory: '深圳工厂',
      notes: '需要重点关注'
    },
    {
      id: 'INV_003',
      materialName: '锂电池',
      materialCode: 'CS-P-L001',
      materialType: '电源类',
      batchNo: 'CATL2024001',
      supplier: '宁德时代',
      quantity: 600,
      status: '冻结',
      warehouse: '深圳库存',
      factory: '深圳工厂',
      notes: '质量问题，暂停使用'
    }
  ];
  
  const standardLabData = [
    {
      id: 'TEST_001',
      materialName: 'OLED显示屏',
      batchNo: 'BOE2024001',
      supplier: 'BOE',
      testDate: '2025-06-27',
      testResult: 'FAIL',
      defectDescription: '显示异常'
    },
    {
      id: 'TEST_002',
      materialName: '锂电池',
      batchNo: 'CATL2024001',
      supplier: '宁德时代',
      testDate: '2025-06-26',
      testResult: 'FAIL',
      defectDescription: '电压不稳定'
    }
  ];
  
  const standardFactoryData = [
    {
      id: 'PROD_001',
      materialName: '电池盖',
      batchNo: 'JL2024001',
      supplier: '聚龙',
      factory: '深圳工厂',
      defectRate: 1.2
    },
    {
      id: 'PROD_002',
      materialName: 'OLED显示屏',
      batchNo: 'BOE2024001',
      supplier: 'BOE',
      factory: '深圳工厂',
      defectRate: 3.5
    }
  ];
  
  // 保存到localStorage
  localStorage.setItem('unified_inventory_data', JSON.stringify(standardInventoryData));
  localStorage.setItem('unified_lab_data', JSON.stringify(standardLabData));
  localStorage.setItem('unified_factory_data', JSON.stringify(standardFactoryData));
  
  console.log('✅ 标准测试数据已创建并保存到localStorage');
}

// 3. 执行数据推送
console.log('\n📊 步骤3: 执行数据推送...');

async function executeDataPush() {
  try {
    // 获取最新数据
    const currentInventory = localStorage.getItem('unified_inventory_data');
    const currentLab = localStorage.getItem('unified_lab_data');
    const currentFactory = localStorage.getItem('unified_factory_data');
    
    const pushData = {
      inventory: currentInventory ? JSON.parse(currentInventory) : [],
      inspection: currentLab ? JSON.parse(currentLab) : [],
      production: currentFactory ? JSON.parse(currentFactory) : []
    };
    
    console.log('📊 准备推送的数据统计:');
    console.log(`  - 库存数据: ${pushData.inventory.length} 条`);
    console.log(`  - 检测数据: ${pushData.inspection.length} 条`);
    console.log(`  - 生产数据: ${pushData.production.length} 条`);
    
    // 推送数据
    console.log('🔄 正在推送数据...');
    const response = await fetch('/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pushData)
    });
    
    console.log('📋 推送响应状态:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 数据推送成功:', result);
      
      // 4. 验证推送结果
      console.log('\n📊 步骤4: 验证推送结果...');
      
      const testQueries = [
        '查询所有库存状态',
        '查询电池盖',
        '查询BOE供应商',
        '查询深圳工厂',
        '哪些物料有质量问题？'
      ];
      
      for (const query of testQueries) {
        console.log(`\n🎯 测试查询: "${query}"`);
        
        const queryResponse = await fetch('/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query })
        });
        
        if (queryResponse.ok) {
          const queryResult = await queryResponse.json();
          console.log('✅ 查询成功');
          console.log('📋 回复预览:', queryResult.reply.substring(0, 100) + '...');
          
          // 检查是否包含我们的测试数据
          const hasTestData = queryResult.reply.includes('电池盖') || 
                             queryResult.reply.includes('OLED显示屏') || 
                             queryResult.reply.includes('锂电池');
          console.log(`🔍 包含测试数据: ${hasTestData ? '✅' : '❌'}`);
          
        } else {
          console.log('❌ 查询失败:', queryResponse.status);
        }
      }
      
      console.log('\n🎉 前端修复完成！');
      console.log('💡 现在可以正常使用智能问答助手了');
      console.log('💡 建议测试查询: "查询所有库存状态"');
      
    } else {
      const error = await response.text();
      console.log('❌ 数据推送失败:', error);
      
      // 尝试直接推送到后端
      console.log('🔄 尝试直接推送到后端...');
      const directResponse = await fetch('http://localhost:3002/api/assistant/update-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pushData)
      });
      
      if (directResponse.ok) {
        const directResult = await directResponse.json();
        console.log('✅ 直接推送成功:', directResult);
      } else {
        const directError = await directResponse.text();
        console.log('❌ 直接推送也失败:', directError);
      }
    }
    
  } catch (error) {
    console.error('❌ 推送过程出错:', error);
  }
}

// 执行推送
executeDataPush();

// 5. 提供便捷函数
window.quickTest = async function() {
  console.log('🚀 快速测试问答功能...');
  
  const response = await fetch('/api/assistant/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: '查询所有库存状态' })
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log('📋 查询结果:');
    console.log(result.reply);
  } else {
    console.log('❌ 查询失败');
  }
};

console.log('\n💡 修复脚本执行完成！');
console.log('💡 如需快速测试，请运行: quickTest()');
