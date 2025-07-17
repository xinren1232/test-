/**
 * 检查lab_tests表是否同步了真实数据
 */

const API_BASE_URL = 'http://localhost:3001';

async function checkLabTestsRealData() {
  try {
    console.log('🔍 检查lab_tests表是否同步了真实数据...\n');
    
    // 1. 检查lab_tests表的详细数据
    console.log('1️⃣ 检查lab_tests表的详细数据...');
    const response = await fetch(`${API_BASE_URL}/api/debug/lab_tests`);
    const result = await response.json();
    
    if (result.success) {
      console.log('📊 lab_tests表结构:');
      result.tableStructure.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (可空: ${col.IS_NULLABLE})`);
      });
      
      console.log('\n📋 前10条实际数据:');
      if (result.sampleData && result.sampleData.length > 0) {
        result.sampleData.slice(0, 10).forEach((record, index) => {
          console.log(`\n记录 ${index + 1}:`);
          console.log(`  test_id: ${record.test_id}`);
          console.log(`  material_code: "${record.material_code}"`);
          console.log(`  material_name: "${record.material_name}"`);
          console.log(`  supplier_name: "${record.supplier_name}"`);
          console.log(`  project_id: "${record.project_id}"`);
          console.log(`  baseline_id: "${record.baseline_id}"`);
          console.log(`  test_result: "${record.test_result}"`);
          console.log(`  defect_desc: "${record.defect_desc}"`);
          console.log(`  test_date: ${record.test_date}`);
        });
        
        // 检查数据多样性
        const uniqueMaterials = [...new Set(result.sampleData.map(r => r.material_name))];
        const uniqueSuppliers = [...new Set(result.sampleData.map(r => r.supplier_name))];
        const uniqueProjects = [...new Set(result.sampleData.map(r => r.project_id))];
        const uniqueBaselines = [...new Set(result.sampleData.map(r => r.baseline_id))];
        const uniqueResults = [...new Set(result.sampleData.map(r => r.test_result))];
        
        console.log('\n📊 数据多样性分析:');
        console.log(`  物料种类: ${uniqueMaterials.length} (${uniqueMaterials.slice(0, 5).join(', ')}${uniqueMaterials.length > 5 ? '...' : ''})`);
        console.log(`  供应商数量: ${uniqueSuppliers.length} (${uniqueSuppliers.slice(0, 5).join(', ')}${uniqueSuppliers.length > 5 ? '...' : ''})`);
        console.log(`  项目数量: ${uniqueProjects.length} (${uniqueProjects.slice(0, 5).join(', ')}${uniqueProjects.length > 5 ? '...' : ''})`);
        console.log(`  基线数量: ${uniqueBaselines.length} (${uniqueBaselines.slice(0, 3).join(', ')}${uniqueBaselines.length > 3 ? '...' : ''})`);
        console.log(`  测试结果: ${uniqueResults.length} (${uniqueResults.join(', ')})`);
        
        // 检查关键字段的空值情况
        const emptyMaterialCodes = result.sampleData.filter(r => !r.material_code || r.material_code === '').length;
        const emptyProjects = result.sampleData.filter(r => !r.project_id || r.project_id === '').length;
        const emptyBaselines = result.sampleData.filter(r => !r.baseline_id || r.baseline_id === '').length;
        
        console.log('\n📈 字段完整性:');
        console.log(`  物料编码空值: ${emptyMaterialCodes}/${result.sampleData.length} (${Math.round(emptyMaterialCodes/result.sampleData.length*100)}%)`);
        console.log(`  项目ID空值: ${emptyProjects}/${result.sampleData.length} (${Math.round(emptyProjects/result.sampleData.length*100)}%)`);
        console.log(`  基线ID空值: ${emptyBaselines}/${result.sampleData.length} (${Math.round(emptyBaselines/result.sampleData.length*100)}%)`);
      }
    }
    
    console.log('\n' + '─'.repeat(60) + '\n');
    
    // 2. 检查不良率字段问题
    console.log('2️⃣ 检查不良率字段问题...');
    console.log('🔍 lab_tests表结构中是否有defect_rate字段?');
    
    const hasDefectRateField = result.tableStructure.some(col => col.COLUMN_NAME === 'defect_rate');
    if (hasDefectRateField) {
      console.log('✅ lab_tests表有defect_rate字段');
    } else {
      console.log('❌ lab_tests表没有defect_rate字段');
      console.log('💡 这就是为什么不良率显示为固定0%的原因');
    }
    
    console.log('\n' + '─'.repeat(60) + '\n');
    
    // 3. 测试当前查询结果
    console.log('3️⃣ 测试当前查询结果...');
    const queryResponse = await fetch(`${API_BASE_URL}/api/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '查询测试信息' })
    });
    
    const queryResult = await queryResponse.json();
    
    if (queryResult.success && queryResult.data && queryResult.data.tableData) {
      const data = queryResult.data.tableData;
      console.log(`✅ 查询成功，返回 ${data.length} 条记录`);
      
      if (data.length > 0) {
        console.log('\n前3条查询结果:');
        data.slice(0, 3).forEach((record, index) => {
          console.log(`\n记录 ${index + 1}:`);
          console.log(`  工厂: "${record.工厂}"`);
          console.log(`  基线: "${record.基线}"`);
          console.log(`  项目: "${record.项目}"`);
          console.log(`  物料编码: "${record.物料编码}"`);
          console.log(`  物料名称: "${record.物料名称}"`);
          console.log(`  供应商: "${record.供应商}"`);
          console.log(`  批次: "${record.批次}"`);
          console.log(`  不良率: "${record.不良率}"`);
          console.log(`  不良现象: "${record.不良现象}"`);
          console.log(`  检验日期: "${record.检验日期}"`);
        });
      }
    }
    
    console.log('\n' + '─'.repeat(60) + '\n');
    
    // 4. 分析问题和解决方案
    console.log('4️⃣ 问题分析和解决方案...');
    analyzeDataSyncIssues(result);
    
  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  }
}

function analyzeDataSyncIssues(labTestsResult) {
  console.log('🔍 数据同步问题分析:');
  
  // 检查是否是真实数据调取
  const hasRealData = labTestsResult.sampleData && labTestsResult.sampleData.length > 0;
  const hasVariedMaterials = hasRealData && [...new Set(labTestsResult.sampleData.map(r => r.material_name))].length > 3;
  const hasVariedSuppliers = hasRealData && [...new Set(labTestsResult.sampleData.map(r => r.supplier_name))].length > 3;
  const hasValidMaterialCodes = hasRealData && labTestsResult.sampleData.some(r => r.material_code && r.material_code !== '');
  const hasValidProjects = hasRealData && labTestsResult.sampleData.some(r => r.project_id && r.project_id !== '');
  
  console.log('\n✅ 已解决的问题:');
  if (hasValidMaterialCodes) {
    console.log('  ✅ 物料编码已有真实数据');
  }
  if (hasValidProjects) {
    console.log('  ✅ 项目ID已有真实数据');
  }
  if (hasVariedMaterials) {
    console.log('  ✅ 物料种类已多样化');
  }
  if (hasVariedSuppliers) {
    console.log('  ✅ 供应商已多样化');
  }
  
  console.log('\n❌ 仍存在的问题:');
  
  // 检查不良率字段
  const hasDefectRateField = labTestsResult.tableStructure.some(col => col.COLUMN_NAME === 'defect_rate');
  if (!hasDefectRateField) {
    console.log('  ❌ lab_tests表缺少defect_rate字段，导致不良率固定显示0%');
  }
  
  // 检查数据是否来自前端生成还是后端脚本
  const isFromFrontend = hasRealData && labTestsResult.sampleData.some(r => 
    r.test_id && r.test_id.startsWith('TEST-') && r.test_id.length > 10
  );
  
  if (isFromFrontend) {
    console.log('  ✅ 数据来源: 前端真实数据生成');
  } else {
    console.log('  ⚠️  数据来源: 可能是后端脚本生成，不是前端MaterialCodeMap.js');
  }
  
  console.log('\n💡 解决方案:');
  console.log('1. 添加defect_rate字段到lab_tests表');
  console.log('2. 修改数据生成逻辑，包含真实的不良率数据');
  console.log('3. 更新SQL查询模板，使用真实的defect_rate字段');
  console.log('4. 确保使用前端MaterialCodeMap.js的真实数据生成');
}

checkLabTestsRealData();
