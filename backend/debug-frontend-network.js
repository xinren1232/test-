/**
 * 调试前端网络请求问题
 */
import fetch from 'node-fetch';

async function debugFrontendNetwork() {
  console.log('🔍 调试前端网络请求问题...\n');
  
  try {
    // 1. 检查所有可能的API端点
    console.log('📊 步骤1: 检查所有API端点...');
    
    const endpoints = [
      'http://localhost:3002/health',
      'http://localhost:3002/api/health',
      'http://localhost:3002/api/assistant/update-data',
      'http://localhost:3002/api/assistant/query',
      'http://localhost:5173/api/health',
      'http://localhost:5173/api/assistant/update-data',
      'http://localhost:5173/api/assistant/query'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: endpoint.includes('update-data') || endpoint.includes('query') ? 'POST' : 'GET',
          headers: endpoint.includes('update-data') || endpoint.includes('query') ? {
            'Content-Type': 'application/json'
          } : {},
          body: endpoint.includes('update-data') ? JSON.stringify({
            inventory: [{id: 'test', materialName: '测试'}],
            inspection: [],
            production: []
          }) : endpoint.includes('query') ? JSON.stringify({
            query: '测试查询'
          }) : undefined
        });
        
        console.log(`✅ ${endpoint}: ${response.status}`);
        
        if (endpoint.includes('query') && response.ok) {
          const result = await response.json();
          console.log(`   回复: ${result.reply?.substring(0, 50)}...`);
        }
        
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }
    
    // 2. 检查前端代理配置是否生效
    console.log('\n📊 步骤2: 检查前端代理配置...');
    
    // 测试代理是否正确转发
    const testData = {
      inventory: [
        {
          id: 'PROXY_TEST_001',
          materialName: '代理测试物料',
          materialCode: 'PROXY-001',
          supplier: '代理测试供应商',
          quantity: 999,
          status: '正常',
          factory: '代理测试工厂'
        }
      ],
      inspection: [],
      production: []
    };
    
    console.log('🔄 通过前端代理推送测试数据...');
    const proxyPushResponse = await fetch('http://localhost:5173/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (proxyPushResponse.ok) {
      const proxyPushResult = await proxyPushResponse.json();
      console.log('✅ 代理推送成功:', proxyPushResult);
      
      // 验证数据是否推送成功
      console.log('🔄 验证代理推送的数据...');
      const proxyQueryResponse = await fetch('http://localhost:5173/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: '查询代理测试物料' })
      });
      
      if (proxyQueryResponse.ok) {
        const proxyQueryResult = await proxyQueryResponse.json();
        console.log('✅ 代理查询成功:');
        console.log(proxyQueryResult.reply);
        
        if (proxyQueryResult.reply.includes('代理测试物料')) {
          console.log('🎉 前端代理完全正常！');
        } else {
          console.log('⚠️ 代理推送的数据未被查询到');
        }
      } else {
        console.log('❌ 代理查询失败:', proxyQueryResponse.status);
      }
      
    } else {
      const proxyError = await proxyPushResponse.text();
      console.log('❌ 代理推送失败:', proxyPushResponse.status, proxyError);
    }
    
    // 3. 检查前端SystemDataUpdater的具体问题
    console.log('\n📊 步骤3: 分析SystemDataUpdater问题...');
    
    console.log('🔍 可能的问题原因:');
    console.log('1. 前端localStorage中没有数据');
    console.log('2. SystemDataUpdater.pushDataToAssistant()方法有bug');
    console.log('3. 前端代码中的API调用路径错误');
    console.log('4. 前端数据格式与后端期望不匹配');
    console.log('5. 前端代理配置缓存问题');
    
    console.log('\n🔧 建议的解决步骤:');
    console.log('1. 清除浏览器缓存并强制刷新 (Ctrl+Shift+R)');
    console.log('2. 在浏览器开发者工具中检查网络请求');
    console.log('3. 在控制台中运行调试脚本检查localStorage');
    console.log('4. 手动触发数据推送并观察错误信息');
    
    // 4. 创建前端修复脚本
    console.log('\n📊 步骤4: 创建前端修复脚本...');
    
    const frontendFixScript = `
// 前端修复脚本 - 在浏览器控制台中运行
console.log('🔧 开始修复前端数据推送问题...');

// 1. 检查localStorage数据
const inventoryData = localStorage.getItem('unified_inventory_data');
const labData = localStorage.getItem('unified_lab_data');
const factoryData = localStorage.getItem('unified_factory_data');

console.log('📊 localStorage数据状态:');
console.log('库存数据:', inventoryData ? '存在' : '不存在');
console.log('测试数据:', labData ? '存在' : '不存在');
console.log('生产数据:', factoryData ? '存在' : '不存在');

// 2. 如果没有数据，创建测试数据
if (!inventoryData) {
  console.log('🔄 创建测试库存数据...');
  const testInventory = [
    {
      id: 'FIX_001',
      materialName: '修复测试物料',
      materialCode: 'FIX-001',
      supplier: '修复测试供应商',
      quantity: 100,
      status: '正常',
      factory: '修复测试工厂',
      warehouse: '修复测试仓库'
    }
  ];
  localStorage.setItem('unified_inventory_data', JSON.stringify(testInventory));
  console.log('✅ 测试库存数据已创建');
}

// 3. 手动推送数据
async function manualPushFix() {
  try {
    const pushData = {
      inventory: JSON.parse(localStorage.getItem('unified_inventory_data') || '[]'),
      inspection: JSON.parse(localStorage.getItem('unified_lab_data') || '[]'),
      production: JSON.parse(localStorage.getItem('unified_factory_data') || '[]')
    };
    
    console.log('🔄 推送数据统计:', {
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
    
    console.log('📋 推送响应状态:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 手动推送成功:', result);
      
      // 测试查询
      const queryResponse = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: '查询库存状态' })
      });
      
      if (queryResponse.ok) {
        const queryResult = await queryResponse.json();
        console.log('✅ 查询测试成功:');
        console.log(queryResult.reply);
      }
      
    } else {
      const error = await response.text();
      console.log('❌ 手动推送失败:', error);
    }
  } catch (error) {
    console.error('❌ 推送过程出错:', error);
  }
}

// 执行修复
manualPushFix();

console.log('🎉 前端修复脚本执行完成！');
`;
    
    console.log('📝 前端修复脚本已准备好');
    console.log('💡 请在浏览器控制台中运行上述脚本');
    
    console.log('\n🎉 网络调试完成！');
    
  } catch (error) {
    console.error('❌ 调试过程中出错:', error.message);
  }
}

debugFrontendNetwork().catch(console.error);
