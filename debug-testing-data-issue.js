/**
 * 调试测试数据问题 - 检查数据生成和同步过程
 */

const API_BASE_URL = 'http://localhost:3001';

async function debugTestingDataIssue() {
  try {
    console.log('🔍 调试测试数据问题...\n');
    
    // 1. 检查lab_tests表的实际数据
    console.log('1️⃣ 检查lab_tests表的实际数据...');
    const labTestsResponse = await fetch(`${API_BASE_URL}/api/debug/lab_tests`);
    const labTestsResult = await labTestsResponse.json();
    
    if (labTestsResult.success && labTestsResult.sampleData.length > 0) {
      console.log('📊 lab_tests表前3条记录:');
      labTestsResult.sampleData.slice(0, 3).forEach((record, index) => {
        console.log(`\n记录 ${index + 1}:`);
        console.log(`  test_id: ${record.test_id}`);
        console.log(`  material_code: "${record.material_code}"`);
        console.log(`  material_name: "${record.material_name}"`);
        console.log(`  supplier_name: "${record.supplier_name}"`);
        console.log(`  project_id: "${record.project_id}"`);
        console.log(`  baseline_id: "${record.baseline_id}"`);
        console.log(`  batch_code: "${record.batch_code}"`);
        console.log(`  test_date: ${record.test_date}`);
        console.log(`  defect_desc: "${record.defect_desc}"`);
        console.log(`  notes: "${record.notes}"`);
      });
      
      // 统计空值情况
      const stats = labTestsResult.nullStatistics;
      console.log('\n📈 空值统计:');
      console.log(`  material_code空值: ${stats.material_code_null}/${stats.total_records} (${Math.round(stats.material_code_null/stats.total_records*100)}%)`);
      console.log(`  material_name空值: ${stats.material_name_null}/${stats.total_records} (${Math.round(stats.material_name_null/stats.total_records*100)}%)`);
      console.log(`  supplier_name空值: ${stats.supplier_name_null}/${stats.total_records} (${Math.round(stats.supplier_name_null/stats.total_records*100)}%)`);
      
      // 检查project_id和baseline_id的空值情况
      const projectEmptyCount = labTestsResult.sampleData.filter(record => 
        !record.project_id || record.project_id === ''
      ).length;
      const baselineEmptyCount = labTestsResult.sampleData.filter(record => 
        !record.baseline_id || record.baseline_id === ''
      ).length;
      
      console.log(`  project_id空值: ${projectEmptyCount}/${labTestsResult.sampleData.length} (${Math.round(projectEmptyCount/labTestsResult.sampleData.length*100)}%)`);
      console.log(`  baseline_id空值: ${baselineEmptyCount}/${labTestsResult.sampleData.length} (${Math.round(baselineEmptyCount/labTestsResult.sampleData.length*100)}%)`);
    }
    
    console.log('\n' + '─'.repeat(60) + '\n');
    
    // 2. 检查数据同步过程
    console.log('2️⃣ 检查数据同步字段映射...');
    console.log('后端期望的字段映射:');
    console.log('  item.material_code || item.materialCode || ""');
    console.log('  item.material_name || item.materialName || ""');
    console.log('  item.supplier || item.supplier_name || ""');
    console.log('  item.project || ""');
    console.log('  item.baseline || ""');
    
    console.log('\n前端可能发送的字段名:');
    console.log('  materialCode (驼峰命名)');
    console.log('  materialName (驼峰命名)');
    console.log('  supplier (简单命名)');
    console.log('  project (简单命名)');
    console.log('  baseline (简单命名)');
    
    console.log('\n' + '─'.repeat(60) + '\n');
    
    // 3. 测试查询结果
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
        const firstRecord = data[0];
        console.log('\n第一条记录的显示字段:');
        console.log(`  工厂: "${firstRecord.工厂}"`);
        console.log(`  基线: "${firstRecord.基线}"`);
        console.log(`  项目: "${firstRecord.项目}"`);
        console.log(`  物料编码: "${firstRecord.物料编码}"`);
        console.log(`  物料名称: "${firstRecord.物料名称}"`);
        console.log(`  供应商: "${firstRecord.供应商}"`);
        console.log(`  批次: "${firstRecord.批次}"`);
        console.log(`  不良率: "${firstRecord.不良率}"`);
        console.log(`  不良现象: "${firstRecord.不良现象}"`);
        console.log(`  检验日期: "${firstRecord.检验日期}"`);
        console.log(`  备注: "${firstRecord.备注}"`);
        
        // 分析空值问题
        const emptyFields = [];
        Object.entries(firstRecord).forEach(([key, value]) => {
          if (!value || value === '') {
            emptyFields.push(key);
          }
        });
        
        if (emptyFields.length > 0) {
          console.log(`\n❌ 空值字段: ${emptyFields.join(', ')}`);
        } else {
          console.log('\n✅ 所有字段都有数据');
        }
      }
    } else {
      console.log('❌ 查询失败');
    }
    
    console.log('\n' + '─'.repeat(60) + '\n');
    
    // 4. 生成问题分析和解决方案
    console.log('4️⃣ 问题分析和解决方案...');
    generateProblemAnalysis();
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error);
  }
}

function generateProblemAnalysis() {
  console.log('🔍 问题分析:');
  console.log('1. 数据库中material_code字段全部为空 - 前端数据生成或同步问题');
  console.log('2. project_id和baseline_id字段为空 - 数据同步时字段映射问题');
  console.log('3. 数据多样性不足 - 只显示"电池盖"和"聚龙"，缺乏数据多样性');
  
  console.log('\n💡 解决方案:');
  console.log('1. 检查前端数据生成逻辑，确保materialCode字段有值');
  console.log('2. 修复后端数据同步的字段映射，支持project和baseline字段');
  console.log('3. 重新生成多样化的测试数据');
  console.log('4. 验证MaterialCodeMap.js是否正确生成物料编码');
  
  console.log('\n🔧 立即修复步骤:');
  console.log('1. 修复后端数据同步字段映射');
  console.log('2. 重新生成和同步数据');
  console.log('3. 验证查询结果');
}

debugTestingDataIssue();
