/**
 * 测试智能问答左侧规则设计功能
 * 验证基础查询、高级分析、图表工具等各项功能
 */

import fetch from 'node-fetch';

// 测试数据 - 基于用户实际数据结构
const testData = {
  inventory: [
    // 结构件类物料
    { id: 'inv-001', materialName: '电池盖', supplier: '聚龙', factory: '深圳工厂', storage_location: '深圳工厂', status: '正常', quantity: 150, batchNo: 'JL2024001', projectId: 'X6827' },
    { id: 'inv-002', materialName: '中框', supplier: '聚龙', factory: '重庆工厂', storage_location: '重庆工厂', status: '风险', quantity: 200, batchNo: 'JL2024002', projectId: 'X6827' },
    
    // 光学类物料
    { id: 'inv-003', materialName: 'LCD显示屏', supplier: 'BOE', factory: '深圳工厂', storage_location: '深圳工厂', status: '正常', quantity: 100, batchNo: 'BOE2024001', projectId: 'KI5K' },
    { id: 'inv-004', materialName: 'OLED显示屏', supplier: 'BOE', factory: '南昌工厂', storage_location: '南昌工厂', status: '冻结', quantity: 80, batchNo: 'BOE2024002', projectId: 'KI5K' },
    
    // 声学类物料
    { id: 'inv-005', materialName: '摄像头模组', supplier: '歌尔', factory: '宜宾工厂', storage_location: '宜宾工厂', status: '正常', quantity: 120, batchNo: 'GE2024001', projectId: 'S665LN' }
  ],
  inspection: [
    { id: 'test-001', materialName: '电池盖', supplier: '聚龙', batchNo: 'JL2024001', testResult: 'PASS', projectId: 'X6827', baselineId: 'I6789' },
    { id: 'test-002', materialName: '中框', supplier: '聚龙', batchNo: 'JL2024002', testResult: 'FAIL', projectId: 'X6827', baselineId: 'I6789' },
    { id: 'test-003', materialName: 'LCD显示屏', supplier: 'BOE', batchNo: 'BOE2024001', testResult: 'PASS', projectId: 'KI5K', baselineId: 'I6788' },
    { id: 'test-004', materialName: 'OLED显示屏', supplier: 'BOE', batchNo: 'BOE2024002', testResult: 'FAIL', projectId: 'KI5K', baselineId: 'I6788' }
  ],
  production: [
    { id: 'prod-001', materialName: '电池盖', supplier: '聚龙', factory: '深圳工厂', batchNo: 'JL2024001', projectId: 'X6827', defectRate: 0.02 },
    { id: 'prod-002', materialName: '中框', supplier: '聚龙', factory: '重庆工厂', batchNo: 'JL2024002', projectId: 'X6827', defectRate: 0.08 },
    { id: 'prod-003', materialName: 'LCD显示屏', supplier: 'BOE', factory: '深圳工厂', batchNo: 'BOE2024001', projectId: 'KI5K', defectRate: 0.01 },
    { id: 'prod-004', materialName: 'OLED显示屏', supplier: 'BOE', factory: '南昌工厂', batchNo: 'BOE2024002', projectId: 'KI5K', defectRate: 0.15 }
  ]
};

// 规则测试用例
const ruleTestCases = [
  // 基础查询规则测试
  {
    category: '基础查询',
    name: '结构件类分析',
    query: '结合库存、测试、生产数据，分析结构件类物料（电池盖、中框等）的整体质量状况和风险分布',
    expectedKeywords: ['电池盖', '中框', '聚龙', '质量', '风险'],
    description: '应该返回结构件类物料的综合分析'
  },
  {
    category: '基础查询',
    name: '供应商综合评估',
    query: '整合聚龙、BOE、歌尔等供应商在不同物料类别、工厂、项目中的表现数据',
    expectedKeywords: ['聚龙', 'BOE', '歌尔', '供应商', '表现'],
    description: '应该返回供应商的综合评估结果'
  },
  {
    category: '基础查询',
    name: '项目质量追踪',
    query: '基于项目-基线关系，追踪X6827(I6789)、KI5K(I6788)等项目的物料质量链路',
    expectedKeywords: ['X6827', 'KI5K', 'I6789', 'I6788', '项目'],
    description: '应该返回项目质量追踪结果'
  },
  
  // 高级分析规则测试
  {
    category: '高级分析',
    name: '多维关联分析',
    query: '基于物料分类、供应商映射、项目基线、工厂仓库等多个业务规则，进行深度关联分析',
    expectedKeywords: ['物料', '供应商', '项目', '工厂', '关联'],
    description: '应该返回多维度关联分析结果'
  },
  {
    category: '高级分析',
    name: '问题根因分析',
    query: '当发现质量问题时，跨表追踪从供应商→物料→测试→生产的完整链路，定位根本原因',
    expectedKeywords: ['质量问题', '供应商', '物料', '测试', '生产'],
    description: '应该返回问题根因分析结果'
  },
  
  // 图表工具规则测试
  {
    category: '图表工具',
    name: '结构件类质量分析',
    query: '综合分析结构件类物料（电池盖、中框、手机卡托等）的库存-测试-生产全链路质量状况',
    expectedKeywords: ['结构件', '电池盖', '中框', '库存', '测试', '生产'],
    description: '应该返回结构件类质量分析图表'
  },
  {
    category: '图表工具',
    name: '供应商-物料匹配',
    query: '分析聚龙（结构件）、BOE（光学类）、歌尔（声学类）等供应商与物料类别的质量匹配度',
    expectedKeywords: ['聚龙', 'BOE', '歌尔', '结构件', '光学类', '声学类'],
    description: '应该返回供应商物料匹配分析'
  }
];

async function testRuleFunctionality() {
  console.log('🔍 测试智能问答左侧规则设计功能\n');
  
  // 1. 先推送测试数据
  console.log('📤 推送测试数据...');
  try {
    const updateResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    if (!updateResponse.ok) {
      throw new Error(`数据推送失败: ${updateResponse.status}`);
    }

    const updateResult = await updateResponse.json();
    console.log('✅ 测试数据推送成功');
    console.log(`   库存: ${testData.inventory.length}条, 检验: ${testData.inspection.length}条, 生产: ${testData.production.length}条\n`);

  } catch (error) {
    console.error('❌ 数据推送失败:', error.message);
    return;
  }
  
  // 2. 测试各类规则功能
  console.log('🧪 开始测试规则功能...\n');
  
  let successCount = 0;
  let totalCount = ruleTestCases.length;
  
  for (const testCase of ruleTestCases) {
    console.log(`📋 测试 [${testCase.category}] ${testCase.name}`);
    console.log(`   查询: ${testCase.query.substring(0, 50)}...`);
    console.log(`   期望: ${testCase.description}`);
    
    try {
      const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: testCase.query,
          scenario: 'inventory_management',
          analysisMode: 'intelligent'
        })
      });

      if (!queryResponse.ok) {
        console.log(`   ❌ 查询失败: ${queryResponse.status}`);
        continue;
      }

      const queryResult = await queryResponse.json();
      
      if (queryResult.reply || queryResult.response) {
        const responseText = queryResult.reply || queryResult.response || '';
        
        // 检查响应是否包含期望的关键词
        const foundKeywords = testCase.expectedKeywords.filter(keyword => 
          responseText.includes(keyword)
        );
        
        if (foundKeywords.length > 0) {
          console.log(`   ✅ 查询成功 - 包含关键词: ${foundKeywords.join(', ')}`);
          successCount++;
        } else {
          console.log(`   ⚠️ 查询成功但缺少关键词`);
        }
        
        // 检查数据来源
        if (queryResult.intentResult?.source === 'memory_data') {
          console.log(`   ✅ 使用了内存中的真实数据`);
        } else if (queryResult.source === 'intelligent-intent') {
          console.log(`   ✅ 使用了智能意图识别`);
        } else {
          console.log(`   ⚠️ 数据来源: ${queryResult.source || '未知'}`);
        }
        
        // 显示响应摘要
        const summary = responseText.split('\n')[0] || responseText.substring(0, 80);
        console.log(`   📋 响应摘要: ${summary}...`);

        // 显示完整响应（用于调试）
        if (foundKeywords.length === 0) {
          console.log(`   🔍 完整响应: ${responseText.substring(0, 200)}...`);
        }
        
      } else {
        console.log(`   ❌ 查询失败: 无响应内容`);
      }
      
    } catch (error) {
      console.log(`   ❌ 查询异常: ${error.message}`);
    }
    
    console.log(''); // 空行分隔
  }
  
  // 3. 输出测试总结
  console.log('📊 测试总结:');
  console.log(`   总测试数: ${totalCount}`);
  console.log(`   成功数: ${successCount}`);
  console.log(`   成功率: ${((successCount / totalCount) * 100).toFixed(1)}%`);
  
  if (successCount === totalCount) {
    console.log('🎉 所有规则功能测试通过！');
  } else if (successCount > totalCount * 0.7) {
    console.log('✅ 大部分规则功能正常，需要优化部分功能');
  } else {
    console.log('⚠️ 规则功能需要进一步修复和优化');
  }
}

testRuleFunctionality().catch(console.error);
