/**
 * 测试优化后的回复格式
 */
import { processRealQuery, updateRealInMemoryData } from './src/services/realDataAssistantService.js';

async function testOptimizedFormat() {
  console.log('🎨 测试优化后的回复格式...\n');
  
  try {
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
          materialName: '中框',
          materialCode: 'CS-S-Z001',
          materialType: '结构件类',
          batchNo: 'JL2024002',
          supplier: '聚龙',
          quantity: 500,
          status: '冻结',
          warehouse: '重庆库存',
          factory: '重庆工厂',
          notes: '待质量确认'
        },
        {
          id: 'INV_004',
          materialName: '摄像头模组',
          materialCode: 'CS-O-C001',
          materialType: '光学类',
          batchNo: 'ST2024001',
          supplier: '盛泰',
          quantity: 600,
          status: '正常',
          warehouse: '宜宾库存',
          factory: '宜宾工厂',
          notes: '正常库存'
        }
      ],
      inspection: [
        {
          id: 'TEST_001',
          materialName: 'OLED显示屏',
          batchNo: 'BOE2024001',
          supplier: 'BOE',
          testDate: '2025-06-11',
          testResult: 'FAIL',
          defectDescription: '显示异常'
        },
        {
          id: 'TEST_002',
          materialName: '中框',
          batchNo: 'JL2024002',
          supplier: '聚龙',
          testDate: '2025-06-06',
          testResult: 'FAIL',
          defectDescription: '尺寸偏差'
        },
        {
          id: 'TEST_003',
          materialName: '电池盖',
          batchNo: 'JL2024001',
          supplier: '聚龙',
          testDate: '2025-06-16',
          testResult: 'PASS',
          defectDescription: null
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
          defectRate: 3.5
        }
      ]
    };
    
    updateRealInMemoryData(testData);
    console.log('✅ 测试数据推送完成');
    
    // 测试优化后的查询格式
    const testQueries = [
      '查询聚龙供应商的物料',
      '目前有哪些风险库存？',
      '有哪些测试不合格的记录？',
      '工厂数据汇总'
    ];
    
    for (const query of testQueries) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🎯 测试查询: "${query}"`);
      console.log(`${'='.repeat(80)}`);
      
      const result = await processRealQuery(query);
      console.log(result);
    }
    
    console.log(`\n${'='.repeat(80)}`);
    console.log('🎉 优化后的格式测试完成！');
    console.log(`${'='.repeat(80)}`);
    
    console.log('\n📊 优化效果总结:');
    console.log('✅ 添加了清晰的标题和分隔线');
    console.log('✅ 使用状态分组，信息更有序');
    console.log('✅ 树状结构显示，层次分明');
    console.log('✅ 风险等级评估，一目了然');
    console.log('✅ 统计摘要突出，关键信息清晰');
    
    console.log('\n💡 现在你可以在前端测试这些优化后的查询格式！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testOptimizedFormat().catch(console.error);
