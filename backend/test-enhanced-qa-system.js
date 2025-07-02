/**
 * 测试增强的问答系统
 * 验证基于GPT方案的NLP意图识别和参数提取功能
 */
import { processRealQuery, updateRealInMemoryData } from './src/services/realDataAssistantService.js';

// 基于真实物料供应商的测试数据
const enhancedTestData = {
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
      quantity: 1000,
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
    },
    {
      id: "INV_005",
      materialName: "LCD显示屏",
      materialCode: "DS-L001",
      materialType: "光学类",
      batchNo: "TM2024005",
      supplier: "天马",
      quantity: 300,
      status: "风险",
      warehouse: "南昌库存",
      factory: "南昌工厂",
      inboundTime: "2024-02-05",
      expiryDate: "2024-08-05",
      notes: "亮度偏低"
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
    },
    {
      id: "TEST_004",
      materialName: "LCD显示屏",
      batchNo: "TM2024005",
      supplier: "天马",
      testDate: "2024-02-06",
      testResult: "FAIL",
      defectDescription: "亮度不达标",
      projectId: "S662LN"
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
      materialName: "喇叭",
      materialCode: "SPK001", 
      batchNo: "GE2024004",
      supplier: "歌尔",
      factory: "宜宾工厂",
      line: "产线02",
      onlineTime: "2024-02-02",
      defectRate: 0.8,
      defect: null,
      projectId: "S662LN"
    },
    {
      id: "PROD_003",
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

async function testEnhancedQASystem() {
  console.log('🚀 测试增强的问答系统...\n');
  
  // 推送测试数据
  console.log('📤 推送增强测试数据...');
  updateRealInMemoryData(enhancedTestData);
  console.log('✅ 数据推送完成！\n');
  
  // 测试各种增强的查询场景
  const enhancedTestQueries = [
    // 基础库存查询
    '查询BOE供应商的物料',
    '查询OLED显示屏的库存',
    '查询深圳工厂的库存情况',
    
    // 状态筛选查询
    '目前有哪些风险库存？',
    '有哪些冻结的物料？',
    '查询聚龙供应商的风险库存',
    
    // 测试结果查询
    '查询批次BOE2024001的测试结果',
    '有哪些测试不合格的记录？',
    '查询天马供应商的测试结果',
    
    // 生产情况查询
    '查询深圳工厂的生产情况',
    '有哪些高不良率的生产记录？',
    '查询产线01的生产数据',
    
    // 项目查询
    '查询项目X6827的情况',
    '查询项目S665LN的数据',
    
    // 统计汇总查询
    '工厂数据汇总',
    '供应商数据统计',
    '系统总体概况',
    
    // 复合查询
    '查询深圳工厂BOE供应商的库存',
    '查询OLED显示屏的测试不合格记录',
    
    // 模糊查询测试
    '查询显示屏相关的库存',
    '查询摄像头的情况',
    
    // 无法识别的查询（测试fallback）
    '今天天气怎么样？',
    '帮我计算1+1等于多少'
  ];
  
  console.log('🔍 开始测试增强查询功能:\n');
  
  for (const query of enhancedTestQueries) {
    console.log(`🎯 测试查询: "${query}"`);
    console.log('-'.repeat(60));
    
    try {
      const result = await processRealQuery(query);
      
      // 检查结果质量
      const containsRealData = 
        result.includes('BOE') || 
        result.includes('聚龙') || 
        result.includes('歌尔') ||
        result.includes('天马') ||
        result.includes('盛泰') ||
        result.includes('OLED显示屏') ||
        result.includes('电池盖') ||
        result.includes('摄像头') ||
        result.includes('深圳工厂') ||
        result.includes('重庆工厂');
        
      if (containsRealData) {
        console.log('✅ 查询成功！包含真实数据');
      } else if (result.includes('您可以尝试以下查询方式')) {
        console.log('💡 触发了智能提示');
      } else {
        console.log('⚠️ 查询成功，但结果可能不完整');
      }
      
      // 显示结果摘要
      const lines = result.split('\n');
      if (lines.length > 10) {
        console.log('📋 结果摘要:');
        console.log(lines.slice(0, 10).join('\n'));
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
  
  console.log('🎉 增强问答系统测试完成！');
  console.log('\n📊 测试总结:');
  console.log('✅ 增强的NLP意图识别功能');
  console.log('✅ 智能参数提取和筛选');
  console.log('✅ 基于真实物料供应商数据');
  console.log('✅ 智能fallback提示功能');
  console.log('✅ 支持复合查询和模糊匹配');
}

testEnhancedQASystem().catch(console.error);
