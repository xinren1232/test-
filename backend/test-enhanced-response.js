/**
 * 测试增强响应格式化服务
 */

import EnhancedResponseFormatter from './src/services/EnhancedResponseFormatter.js';

// 模拟库存数据
const mockInventoryData = [
  {
    material_name: 'LCD显示屏',
    supplier_name: '聚龙',
    batch_number: 'JL20241201001',
    quantity: 500,
    status: '正常',
    factory: '深圳工厂',
    inbound_time: '2024-12-01T10:30:00Z'
  },
  {
    material_name: 'OLED面板',
    supplier_name: 'BOE',
    batch_number: 'BOE20241201002',
    quantity: 300,
    status: '风险',
    factory: '深圳工厂',
    inbound_time: '2024-12-01T14:20:00Z'
  },
  {
    material_name: '触控芯片',
    supplier_name: '欣冠',
    batch_number: 'XG20241201003',
    quantity: 800,
    status: '正常',
    factory: '深圳工厂',
    inbound_time: '2024-12-01T09:15:00Z'
  },
  {
    material_name: '电容器',
    supplier_name: '广正',
    batch_number: 'GZ20241201004',
    quantity: 1200,
    status: '正常',
    factory: '深圳工厂',
    inbound_time: '2024-12-01T16:45:00Z'
  },
  {
    material_name: '连接器',
    supplier_name: '天马',
    batch_number: 'TM20241201005',
    quantity: 200,
    status: '警告',
    factory: '深圳工厂',
    inbound_time: '2024-12-01T11:30:00Z'
  }
];

// 模拟检验数据
const mockInspectionData = [
  {
    material_name: 'LCD显示屏',
    supplier_name: '聚龙',
    test_result: 'PASS',
    test_date: '2024-12-01T12:00:00Z'
  },
  {
    material_name: 'OLED面板',
    supplier_name: 'BOE',
    test_result: 'FAIL',
    test_date: '2024-12-01T15:00:00Z'
  },
  {
    material_name: '触控芯片',
    supplier_name: '欣冠',
    test_result: 'PASS',
    test_date: '2024-12-01T10:00:00Z'
  },
  {
    material_name: '电容器',
    supplier_name: '广正',
    test_result: 'PASS',
    test_date: '2024-12-01T17:00:00Z'
  },
  {
    material_name: '连接器',
    supplier_name: '天马',
    test_result: 'FAIL',
    test_date: '2024-12-01T13:00:00Z'
  }
];

console.log('🧪 测试增强响应格式化服务\n');

// 测试库存查询格式化
console.log('📦 测试库存查询格式化:');
const inventoryResponse = EnhancedResponseFormatter.formatInventoryQuery(mockInventoryData, {
  title: '深圳工厂库存查询结果',
  queryType: 'factory',
  factoryName: '深圳工厂'
});

console.log('库存响应结构:');
console.log('- 类型:', inventoryResponse.type);
console.log('- 标题:', inventoryResponse.title);
console.log('- 汇总信息:');
console.log('  * 总批次数:', inventoryResponse.summary.totalBatches);
console.log('  * 总数量:', inventoryResponse.summary.totalQuantity);
console.log('  * 物料种类:', inventoryResponse.summary.materialTypes);
console.log('  * 风险项目:', inventoryResponse.summary.riskItems);
console.log('- 图表数据:');
console.log('  * 状态分布图:', inventoryResponse.charts.statusPie.data.length, '个状态');
console.log('  * 供应商分布图:', inventoryResponse.charts.supplierBar.data.length, '个供应商');
console.log('- 表格数据:');
console.log('  * 列数:', inventoryResponse.table.columns.length);
console.log('  * 行数:', inventoryResponse.table.rows.length);
console.log('  * 分页信息:', inventoryResponse.table.pagination);

console.log('\n📊 测试质量分析格式化:');
const qualityResponse = EnhancedResponseFormatter.formatQualityAnalysis(mockInspectionData, {
  title: '质量分析报告',
  queryType: 'quality_analysis'
});

console.log('质量响应结构:');
console.log('- 类型:', qualityResponse.type);
console.log('- 标题:', qualityResponse.title);
console.log('- 汇总信息:');
console.log('  * 总测试数:', qualityResponse.summary.totalTests);
console.log('  * 合格数:', qualityResponse.summary.passedTests);
console.log('  * 不合格数:', qualityResponse.summary.failedTests);
console.log('  * 合格率:', qualityResponse.summary.passRate + '%');
console.log('  * 质量等级:', qualityResponse.summary.qualityGrade);
console.log('- 图表数据:');
console.log('  * 合格率仪表盘:', qualityResponse.charts.passRateGauge.value + '%');
console.log('  * 供应商对比图:', qualityResponse.charts.supplierComparison.data?.length || 0, '个供应商');
console.log('- 洞察信息:', qualityResponse.insights.length, '条洞察');
console.log('- 改进建议:', qualityResponse.recommendations.length, '条建议');

console.log('\n✅ 测试完成！');

// 输出完整的JSON结构供前端测试
console.log('\n📋 完整库存响应JSON:');
console.log(JSON.stringify(inventoryResponse, null, 2));

console.log('\n📋 完整质量响应JSON:');
console.log(JSON.stringify(qualityResponse, null, 2));
