/**
 * 检查前端生成的测试数据格式
 */

// 模拟检查localStorage中的测试数据格式
function checkFrontendTestingDataFormat() {
  console.log('🔍 检查前端测试数据格式...\n');
  
  // 根据前端代码，测试数据的字段应该是：
  const expectedTestingFields = {
    // 基础字段
    'id': '测试ID',
    'testId': '测试编号', 
    'date': '日期',
    'project': '项目',
    'baseline': '基线',
    
    // 物料相关字段（关键！）
    'materialCode': '物料编码',  // 驼峰命名
    'materialName': '物料名称',  // 驼峰命名
    'quantity': '数量',
    
    // 供应商字段
    'supplier': '供应商',
    
    // 测试结果字段
    'testResult': '测试结果',
    'defectDescription': '不合格描述',  // 驼峰命名
    'notes': '备注'
  };
  
  console.log('📋 前端测试数据应该包含的字段:');
  Object.entries(expectedTestingFields).forEach(([key, desc]) => {
    console.log(`  ${key} -> ${desc}`);
  });
  
  console.log('\n🔧 后端数据同步字段映射:');
  console.log('  item.material_code || item.materialCode || ""');
  console.log('  item.material_name || item.materialName || ""');
  console.log('  item.supplier || item.supplier_name || ""');
  console.log('  item.defect_description || item.defectDescription || ""');
  
  console.log('\n⚠️  可能的问题:');
  console.log('1. 前端生成的测试数据中materialCode和materialName字段为空');
  console.log('2. 前端可能使用了不同的字段名');
  console.log('3. 数据生成逻辑可能有问题');
  
  console.log('\n💡 解决方案:');
  console.log('1. 检查前端测试数据生成代码');
  console.log('2. 确保MaterialCodeMap.js中的测试数据包含正确的物料信息');
  console.log('3. 修复物料类型查询规则（lab_tests表没有material_type字段）');
}

// 生成修复建议
function generateTestingDataFixSuggestions() {
  console.log('\n🔧 测试数据修复建议:\n');
  
  console.log('1. 修复物料类型查询规则:');
  console.log('   - 光学类测试查询: 使用material_name字段过滤');
  console.log('   - 结构件类测试查询: 使用material_name字段过滤');
  console.log('   - 其他类型查询: 都改为使用material_name字段');
  
  console.log('\n2. 修复供应商查询规则:');
  console.log('   - 确保WHERE条件正确匹配supplier_name字段');
  console.log('   - 检查规则匹配逻辑是否正确');
  
  console.log('\n3. 检查前端数据生成:');
  console.log('   - 确保测试数据包含materialCode和materialName');
  console.log('   - 检查MaterialCodeMap.js中的物料信息');
  console.log('   - 验证数据生成逻辑');
  
  console.log('\n4. 修复后的物料类型查询SQL示例:');
  
  const fixedQueries = {
    '光学类测试查询': `
SELECT 
  COALESCE(test_id, '') as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '') as 项目,
  COALESCE(baseline_id, '') as 基线,
  COALESCE(material_code, '') as 物料编码,
  COALESCE(quantity, 1) as 数量,
  COALESCE(material_name, '') as 物料名称,
  COALESCE(supplier_name, '') as 供应商,
  COALESCE(test_result, '合格') as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests 
WHERE material_name LIKE '%显示%' OR material_name LIKE '%屏%' OR material_name LIKE '%光学%'
ORDER BY test_date DESC 
LIMIT 50`,
    
    '结构件类测试查询': `
SELECT 
  COALESCE(test_id, '') as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '') as 项目,
  COALESCE(baseline_id, '') as 基线,
  COALESCE(material_code, '') as 物料编码,
  COALESCE(quantity, 1) as 数量,
  COALESCE(material_name, '') as 物料名称,
  COALESCE(supplier_name, '') as 供应商,
  COALESCE(test_result, '合格') as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests 
WHERE material_name LIKE '%结构%' OR material_name LIKE '%框架%' OR material_name LIKE '%外壳%'
ORDER BY test_date DESC 
LIMIT 50`
  };
  
  Object.entries(fixedQueries).forEach(([name, sql]) => {
    console.log(`\n${name}:`);
    console.log(sql.trim());
  });
}

// 运行检查
checkFrontendTestingDataFormat();
generateTestingDataFixSuggestions();
