/**
 * 测试智能问答页面的统计卡片功能
 */

const API_BASE_URL = 'http://localhost:3001';

async function testStatisticsCards() {
  console.log('🧪 测试智能问答页面的统计卡片功能...\n');
  
  try {
    // 1. 测试库存场景查询
    console.log('1️⃣ 测试库存场景查询...');
    await testInventoryScenario();
    
    // 2. 测试生产场景查询
    console.log('\n2️⃣ 测试生产场景查询...');
    await testProductionScenario();
    
    // 3. 测试测试场景查询
    console.log('\n3️⃣ 测试测试场景查询...');
    await testTestingScenario();
    
    // 4. 生成验证指南
    console.log('\n4️⃣ 生成验证指南...');
    generateVerificationGuide();
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

async function testInventoryScenario() {
  const testQueries = [
    '查询库存信息',
    '查询充电类库存',
    '查询BOE供应商库存'
  ];
  
  for (const query of testQueries) {
    console.log(`🔍 测试查询: ${query}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data && result.data.tableData) {
          console.log(`  ✅ 查询成功，返回 ${result.data.tableData.length} 条记录`);
          
          // 模拟前端统计生成
          const stats = generateInventoryStatistics(result.data.tableData);
          console.log('  📊 预期统计卡片:');
          stats.forEach(stat => {
            console.log(`    ${stat.icon} ${stat.label}: ${stat.value} ${stat.subtitle || ''}`);
          });
        } else {
          console.log(`  ❌ 查询失败: ${result.message || '未知错误'}`);
        }
      } else {
        console.log(`  ❌ 请求失败: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ 查询出错: ${error.message}`);
    }
  }
}

async function testProductionScenario() {
  const testQueries = [
    '查询上线信息',
    '查询光学类上线',
    '查询不良率高的上线记录'
  ];
  
  for (const query of testQueries) {
    console.log(`🔍 测试查询: ${query}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data && result.data.tableData) {
          console.log(`  ✅ 查询成功，返回 ${result.data.tableData.length} 条记录`);
          
          // 模拟前端统计生成
          const stats = generateProductionStatistics(result.data.tableData);
          console.log('  📊 预期统计卡片:');
          stats.forEach(stat => {
            console.log(`    ${stat.icon} ${stat.label}: ${stat.value} ${stat.subtitle || ''}`);
          });
        } else {
          console.log(`  ❌ 查询失败: ${result.message || '未知错误'}`);
        }
      } else {
        console.log(`  ❌ 请求失败: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ 查询出错: ${error.message}`);
    }
  }
}

async function testTestingScenario() {
  const testQueries = [
    '查询测试信息',
    '查询结构件类测试',
    '查询测试失败的记录'
  ];
  
  for (const query of testQueries) {
    console.log(`🔍 测试查询: ${query}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data && result.data.tableData) {
          console.log(`  ✅ 查询成功，返回 ${result.data.tableData.length} 条记录`);
          
          // 模拟前端统计生成
          const stats = generateTestingStatistics(result.data.tableData);
          console.log('  📊 预期统计卡片:');
          stats.forEach(stat => {
            console.log(`    ${stat.icon} ${stat.label}: ${stat.value} ${stat.subtitle || ''}`);
          });
        } else {
          console.log(`  ❌ 查询失败: ${result.message || '未知错误'}`);
        }
      } else {
        console.log(`  ❌ 请求失败: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ 查询出错: ${error.message}`);
    }
  }
}

// 模拟前端统计生成函数
function generateInventoryStatistics(data) {
  const stats = [];
  
  // 1. 物料和批次统计
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
  
  // 2. 供应商统计
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
  
  // 3. 风险库存统计
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
  
  // 4. 冻结库存统计
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
  
  // 1. 物料和批次统计
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
  
  // 2. 项目统计
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
  
  // 3. 供应商统计
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
  
  // 4. 不良率统计 (3%为分界)
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
  
  // 1. 物料和批次统计
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
  
  // 2. 项目统计
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
  
  // 3. 供应商统计
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
  
  // 4. NG批次统计
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

function generateVerificationGuide() {
  console.log('📋 统计卡片功能验证指南:');
  console.log('=' .repeat(60));
  
  console.log('\n✅ 已完成的更新:');
  console.log('1. 在 AssistantPageNew.vue 中添加了统计卡片组件');
  console.log('2. 实现了三种场景的统计逻辑:');
  console.log('   - 库存场景: 物料批次、供应商、风险库存、冻结库存');
  console.log('   - 生产场景: 物料批次、项目、供应商、不良率统计');
  console.log('   - 测试场景: 物料批次、项目、供应商、NG批次');
  console.log('3. 添加了查询类型识别功能');
  console.log('4. 添加了完整的CSS样式');
  
  console.log('\n🔍 验证步骤:');
  console.log('1. 访问: http://localhost:5174/assistant');
  console.log('2. 测试库存查询: "查询库存信息"');
  console.log('3. 测试生产查询: "查询上线信息"');
  console.log('4. 测试测试查询: "查询测试信息"');
  console.log('5. 检查每个查询结果前是否显示统计卡片');
  
  console.log('\n📊 预期效果:');
  console.log('- 查询结果前显示4个统计卡片');
  console.log('- 卡片根据查询类型显示不同内容');
  console.log('- 卡片有不同的颜色和图标');
  console.log('- 卡片数据与表格数据一致');
  
  console.log('\n🎯 成功标志:');
  console.log('✅ 库存查询显示: 物料批次、供应商、风险库存、冻结库存');
  console.log('✅ 生产查询显示: 物料批次、项目、供应商、不良率统计');
  console.log('✅ 测试查询显示: 物料批次、项目、供应商、NG批次');
  console.log('✅ 统计数据准确反映查询结果');
  
  console.log('\n=' .repeat(60));
}

// 运行测试
testStatisticsCards();
