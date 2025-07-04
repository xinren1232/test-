/**
 * 测试修复后的参数提取功能
 */

import fetch from 'node-fetch';

const testData = {
  inventory: [
    {
      id: 'test-001',
      materialName: '电池盖',
      supplier: '聚龙',
      factory: '深圳工厂',
      storage_location: '深圳工厂',
      status: '正常',
      quantity: 100,
      batchNo: 'JL2024001'
    },
    {
      id: 'test-002',
      materialName: '中框',
      supplier: '欣冠',
      factory: '重庆工厂',
      storage_location: '重庆工厂',
      status: '风险',
      quantity: 200,
      batchNo: 'XG2024001'
    }
  ],
  inspection: [],
  production: []
};

async function testParameterExtraction() {
  console.log('🧪 测试修复后的参数提取功能\n');
  
  // 推送测试数据
  console.log('📤 推送测试数据...');
  await fetch('http://localhost:3001/api/assistant/update-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testData)
  });
  console.log('✅ 测试数据推送完成\n');
  
  // 测试查询
  const testCases = [
    { query: '查询深圳工厂库存', expected: { factory: '深圳工厂' } },
    { query: '查询重庆工厂的库存情况', expected: { factory: '重庆工厂' } },
    { query: '查询聚龙供应商的物料', expected: { supplier: '聚龙' } },
    { query: '查询电池盖的库存', expected: { material: '电池盖' } }
  ];
  
  for (const testCase of testCases) {
    console.log(`🔍 测试查询: "${testCase.query}"`);
    console.log(`期望参数: ${JSON.stringify(testCase.expected)}`);
    
    try {
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: testCase.query,
          scenario: 'inventory_management',
          analysisMode: 'intelligent'
        })
      });
      
      const result = await response.json();
      
      if (result.success && result.intentResult) {
        console.log(`实际参数: ${JSON.stringify(result.intentResult.params)}`);
        console.log(`结果数量: ${result.intentResult.results?.length || 0}`);
        
        // 检查参数是否正确提取
        let paramMatch = true;
        for (const [key, value] of Object.entries(testCase.expected)) {
          if (result.intentResult.params[key] !== value) {
            paramMatch = false;
            break;
          }
        }
        
        if (paramMatch) {
          console.log('✅ 参数提取正确');
          
          // 检查结果是否正确过滤
          if (result.intentResult.results && result.intentResult.results.length > 0) {
            const firstResult = result.intentResult.results[0];
            console.log(`第一条结果工厂: "${firstResult.factory || firstResult.storage_location || ''}"`);
            console.log(`第一条结果供应商: "${firstResult.supplier || ''}"`);
            console.log(`第一条结果物料: "${firstResult.material_name || firstResult.materialName || ''}"`);
            
            if (testCase.expected.factory && (firstResult.factory === testCase.expected.factory || firstResult.storage_location === testCase.expected.factory)) {
              console.log('✅ 工厂过滤正确');
            } else if (testCase.expected.factory) {
              console.log('❌ 工厂过滤不正确');
            }
          } else {
            console.log('⚠️ 无查询结果');
          }
        } else {
          console.log('❌ 参数提取不正确');
        }
      } else {
        console.log('❌ 查询失败:', result.error || '未知错误');
      }
      
    } catch (error) {
      console.log('❌ 请求失败:', error.message);
    }
    
    console.log(''); // 空行分隔
  }
  
  console.log('🎯 参数提取测试完成');
}

testParameterExtraction().catch(console.error);
