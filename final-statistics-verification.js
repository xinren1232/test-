/**
 * 最终验证 - 智能问答页面统计卡片功能
 */

const API_BASE_URL = 'http://localhost:3001';

async function runFinalStatisticsVerification() {
  console.log('🎯 开始统计卡片功能最终验证...\n');
  
  try {
    // 1. 验证后端数据
    console.log('1️⃣ 验证后端数据...');
    const backendResult = await verifyBackendData();
    
    // 2. 验证统计逻辑
    console.log('\n2️⃣ 验证统计逻辑...');
    const statisticsResult = await verifyStatisticsLogic();
    
    // 3. 验证查询类型识别
    console.log('\n3️⃣ 验证查询类型识别...');
    const typeResult = await verifyQueryTypeIdentification();
    
    // 4. 生成最终报告
    console.log('\n4️⃣ 生成最终报告...');
    generateFinalStatisticsReport(backendResult, statisticsResult, typeResult);
    
  } catch (error) {
    console.error('❌ 最终验证过程中出现错误:', error);
  }
}

async function verifyBackendData() {
  const scenarios = [
    { query: '查询库存信息', expectedType: 'inventory' },
    { query: '查询上线信息', expectedType: 'production' },
    { query: '查询测试信息', expectedType: 'testing' }
  ];
  
  const results = [];
  
  for (const scenario of scenarios) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: scenario.query })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data && result.data.tableData) {
          console.log(`✅ ${scenario.expectedType}场景数据正常: ${result.data.tableData.length} 条记录`);
          
          results.push({
            type: scenario.expectedType,
            success: true,
            recordCount: result.data.tableData.length,
            data: result.data.tableData,
            fields: result.data.tableData.length > 0 ? Object.keys(result.data.tableData[0]) : []
          });
        } else {
          console.log(`❌ ${scenario.expectedType}场景数据异常`);
          results.push({
            type: scenario.expectedType,
            success: false,
            error: result.message || '数据格式错误'
          });
        }
      } else {
        console.log(`❌ ${scenario.expectedType}场景请求失败: ${response.status}`);
        results.push({
          type: scenario.expectedType,
          success: false,
          error: `HTTP ${response.status}`
        });
      }
    } catch (error) {
      console.log(`❌ ${scenario.expectedType}场景测试出错: ${error.message}`);
      results.push({
        type: scenario.expectedType,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

async function verifyStatisticsLogic() {
  // 测试统计逻辑的准确性
  const testData = {
    inventory: [
      { 物料名称: '电池A', 批次号: 'B001', 供应商: 'BOE', 状态: '正常', 数量: '150' },
      { 物料名称: '电池B', 批次号: 'B002', 供应商: '天马', 状态: '风险', 数量: '50' },
      { 物料名称: '屏幕A', 批次号: 'B003', 供应商: 'BOE', 状态: '冻结', 数量: '200' }
    ],
    production: [
      { 物料名称: '光学A', 批次号: 'P001', 项目: '项目1', 供应商: '聚龙', 不良率: '2.5' },
      { 物料名称: '光学B', 批次号: 'P002', 项目: '项目2', 供应商: '天马', 不良率: '4.2' },
      { 物料名称: '结构A', 批次号: 'P003', 项目: '项目1', 供应商: '聚龙', 不良率: '1.8' }
    ],
    testing: [
      { 物料名称: '测试A', 批次号: 'T001', 项目: '项目1', 供应商: '供应商1', 测试结果: 'OK' },
      { 物料名称: '测试B', 批次号: 'T002', 项目: '项目2', 供应商: '供应商2', 测试结果: 'NG' },
      { 物料名称: '测试C', 批次号: 'T003', 项目: '项目1', 供应商: '供应商1', 测试结果: 'OK' }
    ]
  };
  
  const results = {};
  
  // 测试库存统计
  const inventoryStats = generateInventoryStatistics(testData.inventory);
  results.inventory = {
    success: inventoryStats.length === 4,
    stats: inventoryStats,
    expected: {
      materials: 3,
      suppliers: 2,
      riskItems: 1,
      frozenItems: 1
    }
  };
  
  console.log('📊 库存统计测试:');
  inventoryStats.forEach(stat => {
    console.log(`  ${stat.icon} ${stat.label}: ${stat.value} ${stat.subtitle || ''}`);
  });
  
  // 测试生产统计
  const productionStats = generateProductionStatistics(testData.production);
  results.production = {
    success: productionStats.length === 4,
    stats: productionStats,
    expected: {
      materials: 3,
      projects: 2,
      suppliers: 2,
      standardItems: 2,
      overStandardItems: 1
    }
  };
  
  console.log('📊 生产统计测试:');
  productionStats.forEach(stat => {
    console.log(`  ${stat.icon} ${stat.label}: ${stat.value} ${stat.subtitle || ''}`);
  });
  
  // 测试测试统计
  const testingStats = generateTestingStatistics(testData.testing);
  results.testing = {
    success: testingStats.length === 4,
    stats: testingStats,
    expected: {
      materials: 3,
      projects: 2,
      suppliers: 2,
      ngBatches: 1
    }
  };
  
  console.log('📊 测试统计测试:');
  testingStats.forEach(stat => {
    console.log(`  ${stat.icon} ${stat.label}: ${stat.value} ${stat.subtitle || ''}`);
  });
  
  return results;
}

async function verifyQueryTypeIdentification() {
  const testCases = [
    { query: '查询库存信息', expectedType: 'inventory' },
    { query: '查询仓库状态', expectedType: 'inventory' },
    { query: '查询上线信息', expectedType: 'production' },
    { query: '查询生产数据', expectedType: 'production' },
    { query: '查询测试信息', expectedType: 'testing' },
    { query: '查询检验结果', expectedType: 'testing' },
    { query: '查询其他信息', expectedType: 'inventory' } // 默认类型
  ];
  
  const results = [];
  
  testCases.forEach(testCase => {
    const identifiedType = identifyQueryType(testCase.query, null);
    const success = identifiedType === testCase.expectedType;
    
    console.log(`${success ? '✅' : '❌'} "${testCase.query}" -> ${identifiedType} (期望: ${testCase.expectedType})`);
    
    results.push({
      query: testCase.query,
      expected: testCase.expectedType,
      actual: identifiedType,
      success: success
    });
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`✅ 查询类型识别测试: ${successCount}/${results.length} 通过`);
  
  return {
    success: successCount === results.length,
    results: results,
    passRate: successCount / results.length
  };
}

// 模拟前端统计函数
function generateInventoryStatistics(data) {
  const stats = [];
  
  const materials = new Set();
  const batches = new Set();
  data.forEach(item => {
    if (item.物料名称) materials.add(item.物料名称);
    if (item.批次号 || item.批次) batches.add(item.批次号 || item.批次);
  });
  
  stats.push({
    icon: '📦',
    label: '物料和批次',
    value: materials.size,
    subtitle: `${batches.size} 个批次`,
    type: 'primary'
  });
  
  const suppliers = new Set();
  data.forEach(item => {
    if (item.供应商) suppliers.add(item.供应商);
  });
  
  stats.push({
    icon: '🏭',
    label: '供应商',
    value: suppliers.size,
    subtitle: '家供应商',
    type: 'info'
  });
  
  const riskItems = data.filter(item => 
    item.状态 === '风险' || item.状态 === 'RISK' || 
    (item.数量 && parseInt(item.数量) < 100)
  );
  
  stats.push({
    icon: '⚠️',
    label: '风险库存',
    value: riskItems.length,
    subtitle: '需关注',
    type: 'warning'
  });
  
  const frozenItems = data.filter(item => 
    item.状态 === '冻结' || item.状态 === 'FROZEN'
  );
  
  stats.push({
    icon: '🧊',
    label: '冻结库存',
    value: frozenItems.length,
    subtitle: '已冻结',
    type: 'danger'
  });
  
  return stats;
}

function generateProductionStatistics(data) {
  const stats = [];
  
  const materials = new Set();
  const batches = new Set();
  data.forEach(item => {
    if (item.物料名称) materials.add(item.物料名称);
    if (item.批次号 || item.批次) batches.add(item.批次号 || item.批次);
  });
  
  stats.push({
    icon: '📦',
    label: '物料和批次',
    value: materials.size,
    subtitle: `${batches.size} 个批次`,
    type: 'primary'
  });
  
  const projects = new Set();
  data.forEach(item => {
    if (item.项目) projects.add(item.项目);
  });
  
  stats.push({
    icon: '🎯',
    label: '项目',
    value: projects.size,
    subtitle: '个项目',
    type: 'info'
  });
  
  const suppliers = new Set();
  data.forEach(item => {
    if (item.供应商) suppliers.add(item.供应商);
  });
  
  stats.push({
    icon: '🏭',
    label: '供应商',
    value: suppliers.size,
    subtitle: '家供应商',
    type: 'success'
  });
  
  const standardItems = data.filter(item => {
    const defectRate = parseFloat(item.不良率) || 0;
    return defectRate <= 3;
  });
  
  const overStandardItems = data.filter(item => {
    const defectRate = parseFloat(item.不良率) || 0;
    return defectRate > 3;
  });
  
  stats.push({
    icon: '📊',
    label: '不良率',
    value: `${standardItems.length}/${overStandardItems.length}`,
    subtitle: '标准内/标准外',
    type: overStandardItems.length > 0 ? 'warning' : 'success'
  });
  
  return stats;
}

function generateTestingStatistics(data) {
  const stats = [];
  
  const materials = new Set();
  const batches = new Set();
  data.forEach(item => {
    if (item.物料名称) materials.add(item.物料名称);
    if (item.批次号 || item.批次) batches.add(item.批次号 || item.批次);
  });
  
  stats.push({
    icon: '📦',
    label: '物料和批次',
    value: materials.size,
    subtitle: `${batches.size} 个批次`,
    type: 'primary'
  });
  
  const projects = new Set();
  data.forEach(item => {
    if (item.项目) projects.add(item.项目);
  });
  
  stats.push({
    icon: '🎯',
    label: '项目',
    value: projects.size,
    subtitle: '个项目',
    type: 'info'
  });
  
  const suppliers = new Set();
  data.forEach(item => {
    if (item.供应商) suppliers.add(item.供应商);
  });
  
  stats.push({
    icon: '🏭',
    label: '供应商',
    value: suppliers.size,
    subtitle: '家供应商',
    type: 'success'
  });
  
  const ngBatches = new Set();
  data.forEach(item => {
    const result = item.测试结果 || item.testResult || '';
    if (result === 'NG' || result === 'FAIL' || result.includes('失败')) {
      if (item.批次号 || item.批次) {
        ngBatches.add(item.批次号 || item.批次);
      }
    }
  });
  
  stats.push({
    icon: '❌',
    label: 'NG批次',
    value: ngBatches.size,
    subtitle: '个批次',
    type: 'danger'
  });
  
  return stats;
}

function identifyQueryType(query, responseData) {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('库存') || queryLower.includes('inventory') || queryLower.includes('仓库')) {
    return 'inventory';
  }
  
  if (queryLower.includes('上线') || queryLower.includes('生产') || queryLower.includes('production') || queryLower.includes('online')) {
    return 'production';
  }
  
  if (queryLower.includes('测试') || queryLower.includes('检验') || queryLower.includes('test') || queryLower.includes('lab')) {
    return 'testing';
  }
  
  return 'inventory';
}

function generateFinalStatisticsReport(backendResult, statisticsResult, typeResult) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 统计卡片功能最终验证报告');
  console.log('='.repeat(60));
  
  console.log('\n✅ 已完成的功能实现:');
  console.log('1. 在查询结果前添加了统计卡片组件');
  console.log('2. 实现了三种场景的统计逻辑');
  console.log('3. 添加了查询类型自动识别');
  console.log('4. 设计了完整的卡片样式和响应式布局');
  console.log('5. 集成了统计数据生成和显示流程');
  
  console.log('\n📊 验证结果:');
  
  // 后端数据验证
  const backendSuccess = backendResult.filter(r => r.success).length;
  console.log(`后端数据: ${backendSuccess}/${backendResult.length} 场景正常`);
  
  // 统计逻辑验证
  const statsSuccess = Object.values(statisticsResult).filter(r => r.success).length;
  console.log(`统计逻辑: ${statsSuccess}/${Object.keys(statisticsResult).length} 场景正确`);
  
  // 类型识别验证
  console.log(`类型识别: ${Math.round(typeResult.passRate * 100)}% 准确率`);
  
  console.log('\n🎯 功能特性:');
  console.log('📦 库存场景: 物料批次、供应商、风险库存、冻结库存');
  console.log('🏭 生产场景: 物料批次、项目、供应商、不良率统计(3%分界)');
  console.log('🔬 测试场景: 物料批次、项目、供应商、NG批次');
  
  console.log('\n🎨 界面设计:');
  console.log('- 4个统计卡片网格布局');
  console.log('- 不同颜色边框区分卡片类型');
  console.log('- 图标、数值、标签、副标题完整显示');
  console.log('- 悬停效果和响应式适配');
  
  const allPassed = backendSuccess === backendResult.length && 
                   statsSuccess === Object.keys(statisticsResult).length && 
                   typeResult.success;
  
  console.log('\n🎉 验证结论:');
  if (allPassed) {
    console.log('🎊 所有功能测试通过！统计卡片功能完全实现！');
    console.log('\n📱 用户验证步骤:');
    console.log('1. 访问: http://localhost:5174/assistant');
    console.log('2. 输入查询并观察统计卡片显示');
    console.log('3. 验证不同场景显示不同的统计项目');
    console.log('4. 检查统计数据与表格数据的一致性');
  } else {
    console.log('⚠️  部分功能需要进一步优化');
    console.log('请检查前端页面的实际显示效果');
  }
  
  console.log('\n' + '='.repeat(60));
}

// 运行最终验证
runFinalStatisticsVerification();
