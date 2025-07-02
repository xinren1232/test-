/**
 * 调试查询逻辑问题
 */
import { processRealQuery, updateRealInMemoryData } from './src/services/realDataAssistantService.js';

async function debugQueryLogic() {
  console.log('🔍 调试查询逻辑问题...\n');
  
  try {
    // 1. 推送明确的测试数据
    console.log('📊 步骤1: 推送明确的测试数据...');
    
    const testData = {
      inventory: [
        {
          id: 'DEBUG_001',
          materialName: '调试测试物料',
          materialCode: 'DEBUG-001',
          materialType: '测试类',
          batchNo: 'DEBUG2024001',
          supplier: '调试供应商',
          quantity: 500,
          status: '正常',
          warehouse: '调试仓库',
          factory: '调试工厂',
          notes: '调试测试数据'
        },
        {
          id: 'DEBUG_002',
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
        }
      ],
      inspection: [
        {
          id: 'DEBUG_TEST_001',
          materialName: '调试测试物料',
          batchNo: 'DEBUG2024001',
          supplier: '调试供应商',
          testDate: '2025-06-27',
          testResult: 'PASS',
          defectDescription: '测试通过'
        }
      ],
      production: [
        {
          id: 'DEBUG_PROD_001',
          materialName: '调试测试物料',
          batchNo: 'DEBUG2024001',
          supplier: '调试供应商',
          factory: '调试工厂',
          defectRate: 0.5
        }
      ]
    };
    
    console.log('🔄 更新内存数据...');
    updateRealInMemoryData(testData);
    console.log('✅ 测试数据已推送');
    
    // 2. 测试各种查询
    console.log('\n📊 步骤2: 测试各种查询...');
    
    const testQueries = [
      '查询所有库存',
      '查询库存状态',
      '查询调试测试物料',
      '查询电池盖',
      '查询聚龙供应商',
      '查询深圳工厂',
      '查询正常状态',
      '有哪些物料',
      '库存情况',
      '物料列表'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🎯 测试查询: "${query}"`);
      try {
        const result = await processRealQuery(query);
        console.log('📋 查询结果:');
        console.log('─'.repeat(30));
        console.log(result);
        console.log('─'.repeat(30));
        
        // 检查结果是否包含我们的测试数据
        const hasDebugData = result.includes('调试测试物料') || result.includes('电池盖');
        console.log(`🔍 包含测试数据: ${hasDebugData ? '✅' : '❌'}`);
        
      } catch (error) {
        console.log('❌ 查询失败:', error.message);
      }
    }
    
    // 3. 检查内存数据状态
    console.log('\n📊 步骤3: 检查内存数据状态...');
    
    // 这里我们需要直接检查realDataAssistantService的内存状态
    console.log('💡 需要检查realDataAssistantService的内存数据状态');
    
    // 4. 测试简单的直接查询
    console.log('\n📊 步骤4: 测试简单的直接查询...');
    
    try {
      // 尝试最简单的查询
      const simpleResult = await processRealQuery('库存');
      console.log('📋 简单查询结果:');
      console.log(simpleResult);
      
      if (simpleResult.includes('没有找到') || simpleResult.includes('请指定')) {
        console.log('⚠️ 查询逻辑可能有问题，返回了默认回复');
      } else {
        console.log('✅ 查询逻辑正常');
      }
      
    } catch (error) {
      console.log('❌ 简单查询失败:', error.message);
    }
    
    // 5. 分析问题
    console.log('\n📊 步骤5: 问题分析...');
    
    console.log('🔍 可能的问题:');
    console.log('1. NLP规则匹配失败');
    console.log('2. 内存数据未正确存储');
    console.log('3. 查询处理逻辑有bug');
    console.log('4. 数据格式不匹配');
    console.log('5. 查询关键词识别失败');
    
    console.log('\n🔧 建议的修复方案:');
    console.log('1. 检查NLP规则配置');
    console.log('2. 验证内存数据存储');
    console.log('3. 简化查询逻辑');
    console.log('4. 添加调试日志');
    console.log('5. 测试基础查询功能');
    
    console.log('\n🎉 查询逻辑调试完成！');
    
  } catch (error) {
    console.error('❌ 调试过程中出错:', error.message);
    console.error('错误详情:', error);
  }
}

debugQueryLogic().catch(console.error);
