/**
 * 测试AI增强分析功能
 * 验证复杂查询是否能触发AI分析而不是只返回基础数据
 */

import fetch from 'node-fetch';

// 测试用例 - 应该触发AI增强分析的复杂查询
const aiEnhancedTestCases = [
  {
    name: '综合质量分析',
    query: '请分析当前所有物料的质量状况，包括库存风险、测试结果和生产表现，并提供改进建议',
    scenario: 'quality_analysis',
    analysisMode: 'ai_enhanced',
    expectedFeatures: ['分析', '建议', '质量', '风险', '改进']
  },
  {
    name: '供应商对比分析',
    query: '对比聚龙、BOE、歌尔三个供应商的整体表现，分析各自的优势和风险点',
    scenario: 'supplier_analysis',
    analysisMode: 'ai_enhanced',
    expectedFeatures: ['对比', '聚龙', 'BOE', '歌尔', '优势', '风险']
  },
  {
    name: '项目质量追踪',
    query: '分析X6827和KI5K项目的质量表现差异，找出影响因素',
    scenario: 'project_analysis',
    analysisMode: 'ai_enhanced',
    expectedFeatures: ['X6827', 'KI5K', '项目', '差异', '因素']
  },
  {
    name: '预测性分析',
    query: '基于当前数据预测未来可能出现的质量问题和风险',
    scenario: 'predictive_analysis',
    analysisMode: 'ai_enhanced',
    expectedFeatures: ['预测', '未来', '质量问题', '风险']
  }
];

// 基础查询测试用例 - 应该返回结构化数据
const basicQueryTestCases = [
  {
    name: '深圳工厂库存查询',
    query: '查询深圳工厂的库存情况',
    scenario: 'inventory_management',
    analysisMode: 'intelligent',
    expectedFeatures: ['深圳工厂', '库存', '电池盖', 'LCD显示屏']
  },
  {
    name: '聚龙供应商查询',
    query: '查询聚龙供应商的物料',
    scenario: 'supplier_management',
    analysisMode: 'intelligent',
    expectedFeatures: ['聚龙', '电池盖', '中框']
  }
];

async function testAIEnhancedAnalysis() {
  console.log('🤖 测试AI增强分析功能\n');
  
  // 1. 先推送测试数据
  const testData = {
    inventory: [
      { id: 'inv-001', materialName: '电池盖', supplier: '聚龙', factory: '深圳工厂', storage_location: '深圳工厂', status: '正常', quantity: 150, batchNo: 'JL2024001', projectId: 'X6827' },
      { id: 'inv-002', materialName: '中框', supplier: '聚龙', factory: '重庆工厂', storage_location: '重庆工厂', status: '风险', quantity: 200, batchNo: 'JL2024002', projectId: 'X6827' },
      { id: 'inv-003', materialName: 'LCD显示屏', supplier: 'BOE', factory: '深圳工厂', storage_location: '深圳工厂', status: '正常', quantity: 100, batchNo: 'BOE2024001', projectId: 'KI5K' },
      { id: 'inv-004', materialName: 'OLED显示屏', supplier: 'BOE', factory: '南昌工厂', storage_location: '南昌工厂', status: '冻结', quantity: 80, batchNo: 'BOE2024002', projectId: 'KI5K' },
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
    console.log('✅ 测试数据推送成功\n');
  } catch (error) {
    console.error('❌ 数据推送失败:', error.message);
    return;
  }
  
  // 2. 测试AI增强分析
  console.log('🤖 测试AI增强分析...\n');
  
  for (const testCase of aiEnhancedTestCases) {
    console.log(`🧠 测试: ${testCase.name}`);
    console.log(`   查询: ${testCase.query}`);
    
    try {
      // 使用AI增强端点
      const response = await fetch('http://localhost:3001/api/assistant/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: testCase.query,
          scenario: testCase.scenario,
          analysisMode: testCase.analysisMode
        })
      });

      if (!response.ok) {
        console.log(`   ❌ AI查询失败: ${response.status}`);
        continue;
      }

      // 读取流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullResponse += parsed.content;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
      
      if (fullResponse.length > 0) {
        // 检查是否包含期望的特征
        const foundFeatures = testCase.expectedFeatures.filter(feature => 
          fullResponse.toLowerCase().includes(feature.toLowerCase())
        );
        
        if (foundFeatures.length > 0) {
          console.log(`   ✅ AI分析成功 - 包含特征: ${foundFeatures.join(', ')}`);
        } else {
          console.log(`   ⚠️ AI分析成功但缺少期望特征`);
        }
        
        // 检查响应长度和复杂度
        if (fullResponse.length > 200) {
          console.log(`   ✅ 响应详细 (${fullResponse.length}字符)`);
        } else {
          console.log(`   ⚠️ 响应较简单 (${fullResponse.length}字符)`);
        }
        
        // 显示响应摘要
        const summary = fullResponse.substring(0, 100).replace(/\n/g, ' ');
        console.log(`   📋 响应摘要: ${summary}...`);
        
      } else {
        console.log(`   ❌ AI分析失败: 无响应内容`);
      }
      
    } catch (error) {
      console.log(`   ❌ AI分析异常: ${error.message}`);
    }
    
    console.log(''); // 空行分隔
  }
  
  // 3. 对比测试基础查询
  console.log('📋 对比测试基础查询...\n');
  
  for (const testCase of basicQueryTestCases) {
    console.log(`🔍 测试: ${testCase.name}`);
    console.log(`   查询: ${testCase.query}`);
    
    try {
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: testCase.query,
          scenario: testCase.scenario,
          analysisMode: testCase.analysisMode
        })
      });

      if (!response.ok) {
        console.log(`   ❌ 基础查询失败: ${response.status}`);
        continue;
      }

      const result = await response.json();
      const responseText = result.reply || result.response || '';
      
      if (responseText) {
        // 检查是否包含期望的特征
        const foundFeatures = testCase.expectedFeatures.filter(feature => 
          responseText.includes(feature)
        );
        
        if (foundFeatures.length > 0) {
          console.log(`   ✅ 基础查询成功 - 包含特征: ${foundFeatures.join(', ')}`);
        } else {
          console.log(`   ⚠️ 基础查询成功但缺少期望特征`);
        }
        
        // 显示响应摘要
        const summary = responseText.split('\n')[0] || responseText.substring(0, 100);
        console.log(`   📋 响应摘要: ${summary}...`);
        
      } else {
        console.log(`   ❌ 基础查询失败: 无响应内容`);
      }
      
    } catch (error) {
      console.log(`   ❌ 基础查询异常: ${error.message}`);
    }
    
    console.log(''); // 空行分隔
  }
  
  console.log('🎯 AI增强分析测试完成');
}

testAIEnhancedAnalysis().catch(console.error);
