/**
 * 诊断问答系统无回复问题
 */
import { processRealQuery, updateRealInMemoryData } from './src/services/realDataAssistantService.js';
import { enhancedIntentMatching, extractParameters } from './src/services/enhancedNLPService.js';

async function diagnoseQAIssue() {
  console.log('🔍 诊断问答系统无回复问题...\n');
  
  try {
    // 1. 检查数据状态
    console.log('📊 步骤1: 检查数据状态...');
    
    // 推送测试数据
    const testData = {
      inventory: [
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
          inboundTime: '2025-06-15',
          expiryDate: '2026-06-15',
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
          inboundTime: '2025-06-10',
          expiryDate: '2026-06-10',
          notes: '需要重点关注'
        }
      ],
      inspection: [
        {
          id: 'TEST_001',
          materialName: '电池盖',
          batchNo: 'JL2024001',
          supplier: '聚龙',
          testDate: '2025-06-16',
          testResult: 'PASS',
          defectDescription: null
        },
        {
          id: 'TEST_002',
          materialName: 'OLED显示屏',
          batchNo: 'BOE2024001',
          supplier: 'BOE',
          testDate: '2025-06-11',
          testResult: 'FAIL',
          defectDescription: '显示异常'
        }
      ],
      production: [
        {
          id: 'PROD_001',
          materialName: '电池盖',
          batchNo: 'JL2024001',
          supplier: '聚龙',
          factory: '深圳工厂',
          line: '产线01',
          onlineTime: '2025-06-17',
          defectRate: 1.2,
          defect: null
        }
      ]
    };
    
    updateRealInMemoryData(testData);
    console.log(`✅ 测试数据已推送: 库存${testData.inventory.length}条, 检验${testData.inspection.length}条, 生产${testData.production.length}条`);
    
    // 2. 测试意图匹配
    console.log('\n📊 步骤2: 测试意图匹配...');
    
    const testQueries = [
      '查询聚龙供应商的物料',
      '查询深圳工厂的库存情况',
      '目前有哪些风险库存？',
      '查询电池盖',
      '查询OLED显示屏',
      '有哪些测试不合格的记录？'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🎯 测试查询: "${query}"`);
      
      // 测试意图匹配
      const matchedRule = enhancedIntentMatching(query);
      if (matchedRule) {
        console.log(`✅ 意图匹配成功: ${matchedRule.intent}`);
        
        // 测试参数提取
        const parameters = extractParameters(query, matchedRule);
        console.log(`📋 提取的参数:`, parameters);
        
        // 测试完整查询
        try {
          const result = await processRealQuery(query);
          if (result && result.trim().length > 0) {
            console.log(`✅ 查询成功，返回${result.length}个字符`);
            // 显示结果的前100个字符
            console.log(`📋 结果预览: ${result.substring(0, 100)}...`);
          } else {
            console.log(`❌ 查询返回空结果`);
          }
        } catch (error) {
          console.log(`❌ 查询执行失败: ${error.message}`);
        }
      } else {
        console.log(`❌ 意图匹配失败`);
      }
    }
    
    // 3. 检查常见问题
    console.log('\n📊 步骤3: 检查常见问题...');
    
    // 检查是否有数据
    console.log('✅ 数据检查: 有测试数据');
    
    // 检查意图规则
    try {
      const simpleMatch = enhancedIntentMatching('查询聚龙');
      if (simpleMatch) {
        console.log('✅ 意图规则检查: 规则加载正常');
      } else {
        console.log('❌ 意图规则检查: 规则可能未加载');
      }
    } catch (error) {
      console.log('❌ 意图规则检查失败:', error.message);
    }
    
    // 4. 提供解决方案
    console.log('\n🔧 步骤4: 问题解决建议...');
    
    console.log('如果问答仍然无回复，可能的原因和解决方案:');
    console.log('1. 前端查询格式问题 - 确保查询文本正确传递');
    console.log('2. 意图匹配阈值过高 - 已调整为0.4');
    console.log('3. 参数提取失败 - 检查查询关键词');
    console.log('4. 数据格式不匹配 - 确保字段名称正确');
    
    console.log('\n推荐的测试查询:');
    console.log('- "查询聚龙供应商的物料"');
    console.log('- "查询深圳工厂的库存情况"');
    console.log('- "目前有哪些风险库存？"');
    console.log('- "工厂数据汇总"');
    
    console.log('\n🎉 诊断完成！');
    
  } catch (error) {
    console.error('❌ 诊断过程中出现错误:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

diagnoseQAIssue().catch(console.error);
