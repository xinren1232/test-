/**
 * 测试数据同步流程
 * 验证前端数据推送到后端，以及问答系统使用最新数据的完整流程
 */
import express from 'express';
import cors from 'cors';
import { processQuery, updateInMemoryData } from './src/services/assistantService.js';

// 创建测试服务器
const app = express();
app.use(cors());
app.use(express.json());

// 模拟前端推送的真实数据
const mockFrontendData = {
  inventory: [
    {
      id: "INV_001",
      factory: "重庆工厂",
      warehouse: "重庆库存",
      materialCode: "CS-广1083",
      materialName: "电容",
      supplier: "广正",
      batchCode: "105281",
      quantity: 294,
      status: "正常",
      inspectionDate: "2025-08-26",
      shelfLife: "2025-12-26",
      remark: "-"
    },
    {
      id: "INV_002", 
      factory: "深圳工厂",
      warehouse: "深圳库存",
      materialCode: "RES-泰科001",
      materialName: "电阻器-0805-10K",
      supplier: "泰科电子",
      batchCode: "TK2023101",
      quantity: 10000,
      status: "正常",
      inspectionDate: "2023-10-15",
      shelfLife: "2024-10-15",
      remark: "不良率: 0.8%"
    },
    {
      id: "INV_003",
      factory: "深圳工厂", 
      warehouse: "深圳库存",
      materialCode: "CAP-三星002",
      materialName: "电容器-0603-1uF",
      supplier: "三星电子",
      batchCode: "SS2023050",
      quantity: 15000,
      status: "风险",
      inspectionDate: "2023-10-18",
      shelfLife: "2024-10-18",
      remark: "不良率: 1.2%"
    }
  ],
  inspection: [
    {
      id: "TEST_001",
      testId: "L001",
      materialCode: "RES-泰科001",
      materialName: "电阻器-0805-10K",
      supplier: "泰科电子",
      batchCode: "TK2023101",
      testDate: "2023-10-16",
      testType: "电气参数",
      result: "合格",
      tester: "李明",
      defectDesc: null
    },
    {
      id: "TEST_002",
      testId: "L002", 
      materialCode: "CAP-三星002",
      materialName: "电容器-0603-1uF",
      supplier: "三星电子",
      batchCode: "SS2023050",
      testDate: "2023-10-19",
      testType: "电气参数",
      result: "不合格",
      tester: "张伟",
      defectDesc: "电容值偏差过大"
    }
  ],
  production: [
    {
      id: "PROD_001",
      materialCode: "RES-泰科001",
      materialName: "电阻器-0805-10K",
      supplier: "泰科电子",
      batchCode: "TK2023101",
      factory: "深圳工厂",
      line: "SMT生产线01",
      date: "2023-10-20",
      totalCount: 5000,
      defectCount: 35,
      defectRate: 0.7,
      operator: "张明"
    },
    {
      id: "PROD_002",
      materialCode: "CAP-三星002", 
      materialName: "电容器-0603-1uF",
      supplier: "三星电子",
      batchCode: "SS2023050",
      factory: "深圳工厂",
      line: "SMT生产线01", 
      date: "2023-10-22",
      totalCount: 6000,
      defectCount: 72,
      defectRate: 1.2,
      operator: "李强"
    }
  ]
};

async function testDataSyncFlow() {
  console.log('🧪 开始测试数据同步流程...\n');
  
  // 步骤1: 模拟前端推送数据到后端
  console.log('📤 步骤1: 模拟前端推送数据到后端');
  console.log('推送的数据统计:');
  console.log(`- 库存数据: ${mockFrontendData.inventory.length} 条`);
  console.log(`- 检验数据: ${mockFrontendData.inspection.length} 条`);
  console.log(`- 生产数据: ${mockFrontendData.production.length} 条`);
  
  try {
    updateInMemoryData(mockFrontendData);
    console.log('✅ 数据推送成功！\n');
  } catch (error) {
    console.log('❌ 数据推送失败:', error.message);
    return;
  }
  
  // 步骤2: 测试问答系统是否使用了最新数据
  console.log('🔍 步骤2: 测试问答系统查询功能');
  
  const testQueries = [
    // 基于真实数据的查询
    '查询重庆工厂的库存情况',
    '查询泰科电子供应商的物料',
    '查询电容器的库存',
    '查询批次 TK2023101 的库存',
    '目前有哪些风险库存？',
    '查询批次 SS2023050 的测试结果',
    '有哪些测试不良的记录？',
    '查询深圳工厂的生产情况'
  ];
  
  for (const query of testQueries) {
    console.log(`\n🔍 测试查询: "${query}"`);
    console.log('-'.repeat(50));
    
    try {
      const result = await processQuery(query);
      
      if (result && result.length > 0) {
        console.log('✅ 查询成功！');
        
        // 检查结果是否包含我们推送的真实数据
        const containsRealData = 
          result.includes('重庆工厂') || 
          result.includes('泰科电子') || 
          result.includes('三星电子') ||
          result.includes('TK2023101') ||
          result.includes('SS2023050') ||
          result.includes('电阻器-0805-10K') ||
          result.includes('电容器-0603-1uF');
          
        if (containsRealData) {
          console.log('🎉 结果包含真实数据！数据同步成功！');
        } else {
          console.log('⚠️ 结果未包含真实数据，可能仍在使用旧数据');
        }
        
        // 显示结果摘要
        const lines = result.split('\n');
        console.log('结果摘要:', lines.slice(0, 5).join('\n'));
        if (lines.length > 5) {
          console.log('...(更多结果)');
        }
      } else {
        console.log('⚠️ 查询返回空结果');
      }
    } catch (error) {
      console.log('❌ 查询失败:', error.message);
    }
  }
  
  console.log('\n🎯 测试总结:');
  console.log('✅ 数据推送接口正常工作');
  console.log('✅ 问答系统能够处理查询请求');
  console.log('📋 如果查询结果包含真实数据，说明数据同步流程完全正常');
  console.log('📋 如果查询结果不包含真实数据，需要检查问答逻辑是否正确使用内存数据');
}

// 运行测试
testDataSyncFlow().catch(console.error);
