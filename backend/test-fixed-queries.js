/**
 * 测试修复后的查询功能
 */
import { processRealQuery, updateRealInMemoryData } from './src/services/realDataAssistantService.js';

async function testFixedQueries() {
  console.log('🔧 测试修复后的查询功能...\n');
  
  try {
    // 1. 推送测试数据
    console.log('📊 步骤1: 推送测试数据...');
    
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
          factory: '深圳工厂'
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
          factory: '深圳工厂'
        },
        {
          id: 'INV_003',
          materialName: '中框',
          materialCode: 'CS-S-Z001',
          materialType: '结构件类',
          batchNo: 'JL2024002',
          supplier: '聚龙',
          quantity: 500,
          status: '冻结',
          warehouse: '重庆库存',
          factory: '重庆工厂'
        }
      ],
      inspection: [
        {
          id: 'TEST_001',
          materialName: '电池盖',
          batchNo: 'JL2024001',
          supplier: '聚龙',
          testDate: '2025-06-16',
          testResult: 'PASS'
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
          defectRate: 1.2
        },
        {
          id: 'PROD_002',
          materialName: 'OLED显示屏',
          batchNo: 'BOE2024001',
          supplier: 'BOE',
          factory: '深圳工厂',
          defectRate: 3.5,
          defect: '显示缺陷'
        }
      ]
    };
    
    updateRealInMemoryData(testData);
    console.log(`✅ 推送数据: 库存${testData.inventory.length}条, 检验${testData.inspection.length}条, 生产${testData.production.length}条`);
    
    // 2. 测试修复后的查询
    console.log('\n📊 步骤2: 测试修复后的查询...');
    
    const fixedQueries = [
      '查询中框',
      '查询结构件类物料',
      '查询光学类物料',
      '查询OLED显示屏',
      '查询电池盖',
      '有哪些测试不合格的记录？'
    ];
    
    for (const query of fixedQueries) {
      console.log(`\n🎯 测试查询: "${query}"`);
      
      try {
        const result = await processRealQuery(query);
        
        // 分析结果
        if (result.includes('暂无数据') || result.includes('请指定要查询的物料名称') || result.includes('抱歉，我暂时无法理解')) {
          console.log('❌ 查询失败 - 规则未匹配或数据未找到');
          console.log('📋 结果:', result.substring(0, 100) + '...');
        } else if (result.includes('找到') && (result.includes('聚龙') || result.includes('电池盖') || result.includes('OLED') || result.includes('BOE') || result.includes('中框') || result.includes('结构件类') || result.includes('光学类'))) {
          console.log('✅ 查询成功 - 包含推送的数据');
          // 提取关键信息
          const lines = result.split('\n');
          const summaryLine = lines.find(line => line.includes('找到') && line.includes('条')) || lines[0];
          console.log('📋 结果摘要:', summaryLine);
        } else {
          console.log('⚠️ 查询结果异常');
          console.log('📋 结果:', result.substring(0, 150) + '...');
        }
        
      } catch (error) {
        console.log('❌ 查询出错:', error.message);
      }
    }
    
    console.log('\n🎉 修复测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

testFixedQueries().catch(console.error);
