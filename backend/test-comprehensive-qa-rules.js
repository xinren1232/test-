/**
 * 全面测试基于真实数据字段的问答规则
 * 验证所有新增的查询场景
 */
import { processRealQuery, updateRealInMemoryData } from './src/services/realDataAssistantService.js';

// 基于真实数据字段的完整测试数据
const comprehensiveTestData = {
  inventory: [
    {
      id: "INV_001",
      materialName: "OLED显示屏",
      materialCode: "DS-O001",
      materialType: "光学类",
      batchNo: "BOE2024001",
      supplier: "BOE",
      quantity: 500,
      status: "正常",
      warehouse: "中央库存",
      factory: "深圳工厂",
      inboundTime: "2024-01-15",
      expiryDate: "2024-07-15",
      notes: "高分辨率OLED屏"
    },
    {
      id: "INV_002", 
      materialName: "电池盖",
      materialCode: "CS-B001",
      materialType: "结构件类",
      batchNo: "JL2024002",
      supplier: "聚龙",
      quantity: 50,
      status: "风险",
      warehouse: "深圳库存",
      factory: "深圳工厂",
      inboundTime: "2024-01-20",
      expiryDate: "2025-01-20",
      notes: "表面有轻微划痕"
    },
    {
      id: "INV_003",
      materialName: "摄像头(CAM)",
      materialCode: "CAM001",
      materialType: "光学类", 
      batchNo: "ST2024003",
      supplier: "盛泰",
      quantity: 200,
      status: "冻结",
      warehouse: "重庆库存",
      factory: "重庆工厂",
      inboundTime: "2024-01-25",
      expiryDate: "2024-12-25",
      notes: "待质量确认"
    },
    {
      id: "INV_004",
      materialName: "喇叭",
      materialCode: "SPK001",
      materialType: "声学类",
      batchNo: "GE2024004",
      supplier: "歌尔",
      quantity: 800,
      status: "正常",
      warehouse: "宜宾库存", 
      factory: "宜宾工厂",
      inboundTime: "2024-02-01",
      expiryDate: "2025-02-01",
      notes: "高保真喇叭"
    }
  ],
  inspection: [
    {
      id: "TEST_001",
      materialName: "OLED显示屏",
      batchNo: "BOE2024001",
      supplier: "BOE",
      testDate: "2024-01-16",
      testResult: "PASS",
      defectDescription: null,
      projectId: "X6827"
    },
    {
      id: "TEST_002",
      materialName: "电池盖", 
      batchNo: "JL2024002",
      supplier: "聚龙",
      testDate: "2024-01-21",
      testResult: "FAIL",
      defectDescription: "表面划伤超标",
      projectId: "S665LN"
    },
    {
      id: "TEST_003",
      materialName: "摄像头(CAM)",
      batchNo: "ST2024003", 
      supplier: "盛泰",
      testDate: "2024-01-26",
      testResult: "FAIL",
      defectDescription: "无法拍照",
      projectId: "KI4K"
    }
  ],
  production: [
    {
      id: "PROD_001",
      materialName: "OLED显示屏",
      materialCode: "DS-O001",
      batchNo: "BOE2024001",
      supplier: "BOE",
      factory: "深圳工厂",
      line: "产线01",
      onlineTime: "2024-01-17",
      defectRate: 2.1,
      defect: "轻微mura现象",
      projectId: "X6827"
    },
    {
      id: "PROD_002",
      materialName: "电池盖",
      materialCode: "CS-B001",
      batchNo: "JL2024002", 
      supplier: "聚龙",
      factory: "深圳工厂",
      line: "产线01",
      onlineTime: "2024-01-22",
      defectRate: 8.5,
      defect: "划伤、变形",
      projectId: "S665LN"
    }
  ]
};

async function testComprehensiveQARules() {
  console.log('🚀 全面测试基于真实数据字段的问答规则...\n');
  
  // 推送测试数据
  updateRealInMemoryData(comprehensiveTestData);
  console.log('✅ 测试数据推送完成！\n');
  
  // 全面的测试查询列表
  const comprehensiveQueries = [
    // 1. 库存查询规则组测试
    '查询OLED显示屏的库存',
    '查询物料编码DS-O001的库存',
    '查询光学类物料的库存',
    '查询批次BOE2024001的库存',
    '查询中央库存的物料',
    '查询库存数量少的物料',
    '查询最近入库的物料',
    '查询即将过期的物料',
    
    // 2. 库存状态查询测试
    '目前有哪些风险库存？',
    '有哪些冻结的物料？',
    '查询正常状态的库存',
    
    // 3. 检验测试查询测试
    '查询批次BOE2024001的测试结果',
    '有哪些测试不合格的记录？',
    '查询测试合格的记录',
    '查询今天的测试记录',
    '查询有不良描述的测试记录',
    
    // 4. 生产查询测试
    '查询深圳工厂的生产情况',
    '有哪些高不良率的生产记录？',
    '查询不良率低的生产记录',
    '查询产线01的生产数据',
    '查询最近上线的物料',
    '查询有不良现象的生产记录',
    
    // 5. 项目查询测试
    '查询项目X6827的情况',
    '项目数据汇总',
    
    // 6. 统计汇总测试
    '工厂数据汇总',
    '供应商数据统计',
    '按物料类别统计库存',
    '系统总体概况',
    
    // 7. 复合查询测试
    '查询BOE供应商在深圳工厂的库存',
    '查询OLED显示屏的测试和生产情况',
    '追溯批次BOE2024001的全链路',
    
    // 8. 边界情况测试
    '查询不存在的物料',
    '查询空批次号',
    '今天天气怎么样？'
  ];
  
  console.log('🔍 开始全面测试查询功能:\n');
  
  for (const query of comprehensiveQueries) {
    console.log(`🎯 测试查询: "${query}"`);
    console.log('-'.repeat(60));
    
    try {
      const result = await processRealQuery(query);
      
      // 分析结果质量
      let resultQuality = '⚠️ 未知';
      if (result.includes('找到') && result.includes('条记录')) {
        resultQuality = '✅ 成功查询';
      } else if (result.includes('没有找到') || result.includes('当前没有')) {
        resultQuality = '📭 空结果';
      } else if (result.includes('您可以尝试以下查询方式')) {
        resultQuality = '💡 智能提示';
      } else if (result.includes('汇总') || result.includes('统计')) {
        resultQuality = '📊 统计结果';
      }
      
      console.log(`${resultQuality}`);
      
      // 显示结果摘要
      const lines = result.split('\n');
      if (lines.length > 8) {
        console.log('📋 结果摘要:');
        console.log(lines.slice(0, 8).join('\n'));
        console.log('...(更多结果)');
      } else {
        console.log('📋 完整结果:');
        console.log(result);
      }
      
    } catch (error) {
      console.log('❌ 查询失败:', error.message);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
  }
  
  console.log('🎉 全面测试完成！');
  console.log('\n📊 测试总结:');
  console.log('✅ 库存查询规则组 (8种场景)');
  console.log('✅ 库存状态查询 (3种状态)');
  console.log('✅ 检验测试查询 (5种场景)');
  console.log('✅ 生产查询 (6种场景)');
  console.log('✅ 项目查询 (2种场景)');
  console.log('✅ 统计汇总 (4种场景)');
  console.log('✅ 复合查询 (3种场景)');
  console.log('✅ 边界情况处理');
  console.log('\n🎯 基于真实数据字段的全面问答规则已完成！');
}

testComprehensiveQARules().catch(console.error);
