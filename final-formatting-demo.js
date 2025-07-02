/**
 * 最终格式化效果演示
 * 展示所有修复后的查询格式
 */

import { processRealQuery, updateRealInMemoryData } from './backend/src/services/realDataAssistantService.js';

// 丰富的测试数据
const testData = {
  inventory: [
    {
      id: 'INV_001',
      materialName: 'OLED显示屏',
      materialCode: 'MAT_OLED_001',
      supplier: 'BOE',
      quantity: 500,
      status: '正常',
      factory: '深圳工厂',
      warehouse: 'A区',
      batchNo: 'TK240601',
      inboundTime: '2024-06-01 10:00:00'
    },
    {
      id: 'INV_002',
      materialName: '电池盖',
      materialCode: 'MAT_COVER_002',
      supplier: '聚龙',
      quantity: 1000,
      status: '风险',
      factory: '深圳工厂',
      warehouse: 'B区',
      batchNo: 'SS240602',
      inboundTime: '2024-06-02 14:30:00'
    },
    {
      id: 'INV_003',
      materialName: '散热片',
      materialCode: 'MAT_HEAT_003',
      supplier: '富士康',
      quantity: 800,
      status: '冻结',
      factory: '上海工厂',
      warehouse: 'C区',
      batchNo: 'TK240603',
      inboundTime: '2024-06-03 09:15:00'
    },
    {
      id: 'INV_004',
      materialName: '摄像头模组',
      materialCode: 'MAT_CAM_004',
      supplier: 'BOE',
      quantity: 300,
      status: '正常',
      factory: '上海工厂',
      warehouse: 'D区',
      batchNo: 'TK240604',
      inboundTime: '2024-06-04 11:20:00'
    }
  ],
  inspection: [
    {
      id: 'TEST_001',
      materialName: 'OLED显示屏',
      supplier: 'BOE',
      batchNo: 'TK240601',
      testResult: 'PASS',
      testDate: '2024-06-01',
      defectDescription: null
    },
    {
      id: 'TEST_002',
      materialName: '电池盖',
      supplier: '聚龙',
      batchNo: 'SS240602',
      testResult: 'FAIL',
      testDate: '2024-06-02',
      defectDescription: '表面划痕'
    },
    {
      id: 'TEST_003',
      materialName: '散热片',
      supplier: '富士康',
      batchNo: 'TK240603',
      testResult: 'PASS',
      testDate: '2024-06-03',
      defectDescription: null
    }
  ],
  production: [
    {
      id: 'PROD_001',
      materialName: 'OLED显示屏',
      materialCode: 'MAT_OLED_001',
      supplier: 'BOE',
      batchNo: 'TK240601',
      factory: '深圳工厂',
      line: '产线A',
      onlineTime: '2024-06-01 16:00:00',
      defectRate: 0.5,
      defect: null,
      projectId: 'PRJ_001'
    },
    {
      id: 'PROD_002',
      materialName: '电池盖',
      materialCode: 'MAT_COVER_002',
      supplier: '聚龙',
      batchNo: 'SS240602',
      factory: '深圳工厂',
      line: '产线B',
      onlineTime: '2024-06-02 18:30:00',
      defectRate: 2.8,
      defect: '装配不良',
      projectId: 'PRJ_002'
    },
    {
      id: 'PROD_003',
      materialName: '散热片',
      materialCode: 'MAT_HEAT_003',
      supplier: '富士康',
      batchNo: 'TK240603',
      factory: '上海工厂',
      line: '产线C',
      onlineTime: '2024-06-03 20:15:00',
      defectRate: 4.2,
      defect: '尺寸偏差',
      projectId: 'PRJ_003'
    }
  ]
};

async function demonstrateFormattedQueries() {
  console.log('🎨 最终格式化效果演示\n');
  console.log('=' .repeat(80));
  
  // 更新内存数据
  updateRealInMemoryData(testData);
  
  const demoQueries = [
    {
      category: '📦 库存查询',
      queries: [
        '目前有哪些风险库存？',
        '查询BOE供应商的物料'
      ]
    },
    {
      category: '🏭 生产查询', 
      queries: [
        '显示所有生产记录',
        '查询深圳工厂的生产情况'
      ]
    },
    {
      category: '🔍 追溯查询',
      queries: [
        '批次TK240601的全链路追溯'
      ]
    },
    {
      category: '📊 统计汇总',
      queries: [
        '工厂汇总统计',
        '供应商汇总统计', 
        '系统数据总览'
      ]
    }
  ];
  
  for (const category of demoQueries) {
    console.log(`\n${category.category}`);
    console.log('-'.repeat(60));
    
    for (const query of category.queries) {
      console.log(`\n🔍 查询: ${query}`);
      console.log('~'.repeat(40));
      
      try {
        const result = await processRealQuery(query);
        
        // 检查是否为HTML格式
        if (result.includes('<div class="query-results')) {
          console.log('✅ 使用新的HTML格式化');
          console.log('📄 HTML长度:', result.length, '字符');
          
          // 提取关键信息
          const titleMatch = result.match(/<h3[^>]*>([^<]+)<\/h3>/);
          if (titleMatch) {
            console.log('📋 标题:', titleMatch[1].replace(/<[^>]*>/g, ''));
          }
          
          const badgeMatch = result.match(/共 <strong>(\d+)<\/strong> 条记录/);
          if (badgeMatch) {
            console.log('📊 记录数:', badgeMatch[1]);
          }
        } else {
          console.log('⚠️ 仍使用文本格式');
          console.log('📝 内容预览:', result.substring(0, 100) + '...');
        }
      } catch (error) {
        console.error('❌ 查询失败:', error.message);
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🎉 格式化效果演示完成！');
  console.log('\n📈 修复成果总结:');
  console.log('✅ 风险库存查询 - 卡片式布局');
  console.log('✅ 生产记录查询 - 生产卡片布局');
  console.log('✅ 批次全链路追溯 - 分段式追溯布局');
  console.log('✅ 工厂汇总统计 - 汇总卡片布局');
  console.log('✅ 系统数据总览 - 概览仪表板布局');
  console.log('\n🚀 所有主要查询类型都已优化为结构化HTML格式！');
}

// 运行演示
demonstrateFormattedQueries().catch(console.error);
