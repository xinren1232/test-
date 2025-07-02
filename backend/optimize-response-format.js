/**
 * 优化问答回复的结构化展示
 * 创建更清晰、更易读的回复格式
 */
import { processRealQuery, updateRealInMemoryData } from './src/services/realDataAssistantService.js';

async function optimizeResponseFormat() {
  console.log('🎨 优化问答回复结构化展示...\n');
  
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
          inboundTime: '2025-06-05',
          expiryDate: '2026-06-05',
          notes: '待质量确认'
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
        }
      ]
    };
    
    updateRealInMemoryData(testData);
    console.log('✅ 测试数据推送完成');
    
    // 2. 测试当前格式
    console.log('\n📊 步骤2: 测试当前回复格式...');
    
    const testQueries = [
      '查询聚龙供应商的物料',
      '目前有哪些风险库存？',
      '工厂数据汇总'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🎯 测试查询: "${query}"`);
      const result = await processRealQuery(query);
      console.log('📋 当前格式:');
      console.log(result);
      console.log('\n' + '='.repeat(80));
    }
    
    // 3. 创建优化的格式化函数
    console.log('\n📊 步骤3: 创建优化的格式化函数...');
    
    // 创建优化的格式化函数
    const optimizedFormatters = createOptimizedFormatters();
    
    // 4. 展示优化后的格式
    console.log('\n📊 步骤4: 展示优化后的格式...');
    
    // 模拟优化后的回复
    const optimizedResults = {
      inventory: testData.inventory.filter(item => item.supplier === '聚龙'),
      riskInventory: testData.inventory.filter(item => item.status === '风险'),
      factorySummary: generateFactorySummaryData(testData)
    };
    
    console.log('\n🎯 优化后的"查询聚龙供应商的物料"格式:');
    console.log(optimizedFormatters.formatInventoryResults(optimizedResults.inventory, '聚龙供应商物料'));
    
    console.log('\n🎯 优化后的"目前有哪些风险库存？"格式:');
    console.log(optimizedFormatters.formatRiskInventoryResults(optimizedResults.riskInventory));
    
    console.log('\n🎯 优化后的"工厂数据汇总"格式:');
    console.log(optimizedFormatters.formatFactorySummary(optimizedResults.factorySummary));
    
    // 5. 生成优化建议
    console.log('\n📊 步骤5: 优化建议...');
    
    console.log('🎨 结构化展示优化建议:');
    console.log('1. 使用表格式布局，信息更清晰');
    console.log('2. 添加状态颜色标识，风险等级一目了然');
    console.log('3. 使用分组展示，相同类型数据聚合');
    console.log('4. 添加统计摘要，关键指标突出显示');
    console.log('5. 使用图标和符号，提升视觉效果');
    
    console.log('\n🎉 回复格式优化完成！');
    
  } catch (error) {
    console.error('❌ 优化失败:', error.message);
  }
}

// 创建优化的格式化函数
function createOptimizedFormatters() {
  return {
    // 优化的库存结果格式化
    formatInventoryResults: (results, title = '库存') => {
      if (results.length === 0) {
        return `❌ 未找到符合条件的${title}记录`;
      }
      
      let output = `📦 ${title}查询结果\n`;
      output += `${'='.repeat(50)}\n`;
      output += `📊 共找到 ${results.length} 条记录\n\n`;
      
      // 按状态分组
      const groupedByStatus = results.reduce((acc, item) => {
        const status = item.status || '未知';
        if (!acc[status]) acc[status] = [];
        acc[status].push(item);
        return acc;
      }, {});
      
      Object.entries(groupedByStatus).forEach(([status, items]) => {
        const statusIcon = getStatusIcon(status);
        output += `${statusIcon} ${status}状态 (${items.length}条)\n`;
        output += `${'-'.repeat(30)}\n`;
        
        items.forEach((item, index) => {
          output += `${index + 1}. 📋 ${item.materialName}\n`;
          output += `   ├─ 🏷️  编码: ${item.materialCode}\n`;
          output += `   ├─ 🏢  供应商: ${item.supplier}\n`;
          output += `   ├─ 🔢  批次: ${item.batchNo}\n`;
          output += `   ├─ 📊  数量: ${item.quantity}\n`;
          output += `   ├─ 🏭  工厂: ${item.factory}\n`;
          output += `   └─ 📍  仓库: ${item.warehouse}\n\n`;
        });
      });
      
      return output;
    },
    
    // 优化的风险库存格式化
    formatRiskInventoryResults: (results) => {
      if (results.length === 0) {
        return `✅ 当前没有风险库存，系统状态良好`;
      }
      
      let output = `🚨 风险库存预警报告\n`;
      output += `${'='.repeat(50)}\n`;
      output += `⚠️  发现 ${results.length} 项风险库存，需要关注\n\n`;
      
      // 按工厂分组
      const groupedByFactory = results.reduce((acc, item) => {
        const factory = item.factory || '未知工厂';
        if (!acc[factory]) acc[factory] = [];
        acc[factory].push(item);
        return acc;
      }, {});
      
      Object.entries(groupedByFactory).forEach(([factory, items]) => {
        output += `🏭 ${factory} (${items.length}项风险)\n`;
        output += `${'-'.repeat(30)}\n`;
        
        items.forEach((item, index) => {
          output += `${index + 1}. ⚠️  ${item.materialName}\n`;
          output += `   ├─ 🏢  供应商: ${item.supplier}\n`;
          output += `   ├─ 🔢  批次: ${item.batchNo}\n`;
          output += `   ├─ 📊  数量: ${item.quantity}\n`;
          output += `   └─ 📝  备注: ${item.notes || '需要关注'}\n\n`;
        });
      });
      
      output += `💡 建议: 请及时处理风险库存，确保产品质量`;
      
      return output;
    },
    
    // 优化的工厂汇总格式化
    formatFactorySummary: (summaryData) => {
      let output = `🏭 工厂数据汇总报告\n`;
      output += `${'='.repeat(50)}\n`;
      output += `📅 统计时间: ${new Date().toLocaleString()}\n\n`;
      
      Object.entries(summaryData).forEach(([factory, stats]) => {
        const riskLevel = getRiskLevel(stats.riskItems, stats.totalItems);
        const riskIcon = getRiskIcon(riskLevel);
        
        output += `🏭 ${factory}\n`;
        output += `${'-'.repeat(30)}\n`;
        output += `📊 库存总量: ${stats.totalQuantity}\n`;
        output += `📦 物料种类: ${stats.totalItems} 种\n`;
        output += `${riskIcon} 风险物料: ${stats.riskItems} 种\n`;
        output += `🧊 冻结物料: ${stats.frozenItems} 种\n`;
        output += `🏭 生产记录: ${stats.productionRecords} 条\n`;
        output += `📈 风险等级: ${riskLevel}\n\n`;
      });
      
      return output;
    }
  };
}

// 获取状态图标
function getStatusIcon(status) {
  const icons = {
    '正常': '✅',
    '风险': '⚠️',
    '冻结': '🧊',
    '未知': '❓'
  };
  return icons[status] || '❓';
}

// 获取风险等级
function getRiskLevel(riskItems, totalItems) {
  if (totalItems === 0) return '无数据';
  const riskRate = (riskItems / totalItems) * 100;
  if (riskRate >= 20) return '高风险';
  if (riskRate >= 10) return '中风险';
  if (riskRate > 0) return '低风险';
  return '安全';
}

// 获取风险图标
function getRiskIcon(riskLevel) {
  const icons = {
    '高风险': '🔴',
    '中风险': '🟡',
    '低风险': '🟢',
    '安全': '✅',
    '无数据': '❓'
  };
  return icons[riskLevel] || '❓';
}

// 生成工厂汇总数据
function generateFactorySummaryData(testData) {
  const factoryStats = {};
  
  testData.inventory.forEach(item => {
    const factory = item.factory || '未知工厂';
    if (!factoryStats[factory]) {
      factoryStats[factory] = {
        totalQuantity: 0,
        totalItems: 0,
        riskItems: 0,
        frozenItems: 0,
        productionRecords: 0
      };
    }
    
    factoryStats[factory].totalQuantity += item.quantity || 0;
    factoryStats[factory].totalItems += 1;
    if (item.status === '风险') factoryStats[factory].riskItems += 1;
    if (item.status === '冻结') factoryStats[factory].frozenItems += 1;
  });
  
  testData.production.forEach(item => {
    const factory = item.factory || '未知工厂';
    if (factoryStats[factory]) {
      factoryStats[factory].productionRecords += 1;
    }
  });
  
  return factoryStats;
}

optimizeResponseFormat().catch(console.error);
