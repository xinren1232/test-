/**
 * 检查数据同步问题 - 为什么前端生成的完整数据在后端查询时变成空值
 */

const API_BASE_URL = 'http://localhost:3001';

async function checkDataSyncIssue() {
  try {
    console.log('🔍 检查数据同步问题...\n');
    
    // 1. 检查所有相关表的数据
    console.log('1️⃣ 检查所有相关表的数据...');
    await checkAllTables();
    
    // 2. 检查数据同步API的字段映射
    console.log('\n2️⃣ 检查数据同步API的字段映射...');
    await checkSyncFieldMapping();
    
    // 3. 对比前端生成数据和后端存储数据
    console.log('\n3️⃣ 对比前端生成数据和后端存储数据...');
    await compareDataStructure();
    
  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  }
}

async function checkAllTables() {
  const tables = ['production_tracking', 'online_tracking', 'inventory', 'lab_tests'];
  
  for (const table of tables) {
    try {
      console.log(`\n📊 检查 ${table} 表:`);
      
      // 检查记录数
      const countResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: `SELECT COUNT(*) as count FROM ${table}`
        })
      });
      
      if (countResponse.ok) {
        const countResult = await countResponse.json();
        const recordCount = countResult.result[0].count;
        console.log(`  记录数: ${recordCount}`);
        
        if (recordCount > 0) {
          // 检查表结构
          const structureResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sql: `
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'iqe_inspection' AND TABLE_NAME = '${table}'
                ORDER BY ORDINAL_POSITION
              `
            })
          });
          
          if (structureResponse.ok) {
            const structureResult = await structureResponse.json();
            const columns = structureResult.result.map(row => row.COLUMN_NAME);
            console.log(`  字段: ${columns.join(', ')}`);
            
            // 检查关键字段是否存在
            const keyFields = ['factory', 'baseline', 'project', 'batch_code', 'defect_rate'];
            const existingKeyFields = keyFields.filter(field => columns.includes(field));
            const missingKeyFields = keyFields.filter(field => !columns.includes(field));
            
            if (existingKeyFields.length > 0) {
              console.log(`  ✅ 存在关键字段: ${existingKeyFields.join(', ')}`);
            }
            if (missingKeyFields.length > 0) {
              console.log(`  ❌ 缺失关键字段: ${missingKeyFields.join(', ')}`);
            }
            
            // 查看前3条数据
            const dataResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sql: `SELECT * FROM ${table} LIMIT 3`
              })
            });
            
            if (dataResponse.ok) {
              const dataResult = await dataResponse.json();
              const records = dataResult.result;
              
              if (records.length > 0) {
                console.log(`  📋 第一条记录示例:`);
                const firstRecord = records[0];
                Object.entries(firstRecord).forEach(([key, value]) => {
                  if (keyFields.includes(key) || ['material_name', 'supplier_name', 'material_code'].includes(key)) {
                    const displayValue = value === null ? '[NULL]' : 
                                       value === '' ? '[EMPTY]' : 
                                       value === undefined ? '[UNDEFINED]' : value;
                    console.log(`    ${key}: ${displayValue}`);
                  }
                });
              }
            }
          }
        }
      } else {
        console.log(`  ❌ 表不存在或查询失败`);
      }
    } catch (error) {
      console.log(`  ❌ 检查 ${table} 表时出错: ${error.message}`);
    }
  }
}

async function checkSyncFieldMapping() {
  console.log('🔍 检查后端数据同步的字段映射逻辑...');
  
  // 这里我们需要检查后端代码中的字段映射
  console.log('\n根据之前的代码检索，后端同步上线数据的字段映射可能是:');
  console.log('  前端字段 -> 后端字段');
  console.log('  factory -> factory');
  console.log('  baseline -> baseline');
  console.log('  project -> project');
  console.log('  materialCode -> material_code');
  console.log('  materialName -> material_name');
  console.log('  supplier -> supplier_name');
  console.log('  batchCode -> batch_code');
  console.log('  defectRate -> defect_rate');
  
  console.log('\n💡 可能的问题:');
  console.log('1. 前端发送的字段名与后端期望的不匹配');
  console.log('2. 后端数据同步时字段映射逻辑有误');
  console.log('3. 数据同步到了错误的表');
  console.log('4. 前端生成的数据没有正确发送到后端');
}

async function compareDataStructure() {
  console.log('🔍 对比前端生成数据结构和后端存储结构...');
  
  console.log('\n📋 前端生成的上线数据结构 (根据截图):');
  console.log('  工厂: 深圳工厂, 重庆工厂等');
  console.log('  基线: I6789基线');
  console.log('  项目: S665LN项目');
  console.log('  物料编码: CS-B-欣3443');
  console.log('  物料名称: 电池盖');
  console.log('  供应商: 欣冠');
  console.log('  批次: 646001');
  console.log('  不良率: 1.5%, 0.5%, 2.1%');
  console.log('  不良现象: 尺寸, 尺寸+功能');
  console.log('  检验日期: 2025/07/02 20:39');
  
  console.log('\n📋 后端查询结果 (根据截图):');
  console.log('  工厂: 未知工厂 (固定值)');
  console.log('  基线: [空值]');
  console.log('  项目: [空值]');
  console.log('  物料编码: BAT-深8869 (有数据)');
  console.log('  物料名称: 电池 (有数据)');
  console.log('  供应商: 深奥 (有数据)');
  console.log('  批次号: [空值]');
  console.log('  不良率: 0% (固定值)');
  console.log('  不良现象: [空值]');
  console.log('  检验日期: 2025-07-30 (有数据)');
  
  console.log('\n🔍 问题分析:');
  console.log('✅ 有数据的字段: material_code, material_name, supplier_name, test_date');
  console.log('❌ 缺失数据的字段: factory, baseline, project, batch_code, defect_rate, defect_phenomenon');
  
  console.log('\n💡 可能的解决方案:');
  console.log('1. 检查前端数据生成时是否包含了所有字段');
  console.log('2. 检查后端数据同步API的字段映射');
  console.log('3. 确认数据是否同步到了正确的表');
  console.log('4. 修复字段映射逻辑，确保所有字段都能正确同步');
}

checkDataSyncIssue();
