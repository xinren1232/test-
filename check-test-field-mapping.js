/**
 * 检查测试场景的字段映射问题
 * 确保规则输出字段与真实测试场景字段完全匹配
 */

const API_BASE_URL = 'http://localhost:3001';

async function checkTestFieldMapping() {
  try {
    console.log('🔍 检查测试场景的字段映射问题...\n');
    
    // 1. 检查测试相关表的结构和数据
    console.log('1️⃣ 检查测试相关表的结构和数据...');
    await checkTestTables();
    
    // 2. 测试当前的测试查询规则
    console.log('\n2️⃣ 测试当前的测试查询规则...');
    await testCurrentTestRules();
    
    // 3. 生成正确的测试查询SQL
    console.log('\n3️⃣ 生成正确的测试查询SQL...');
    await generateCorrectTestSQL();
    
  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  }
}

async function checkTestTables() {
  const tables = ['lab_tests', 'production_tracking'];
  
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
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'iqe_inspection' AND TABLE_NAME = '${table}'
                ORDER BY ORDINAL_POSITION
              `
            })
          });
          
          if (structureResponse.ok) {
            const structureResult = await structureResponse.json();
            const columns = structureResult.result;
            
            console.log(`  字段结构:`);
            columns.forEach(col => {
              console.log(`    - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (可空: ${col.IS_NULLABLE})`);
            });
            
            // 检查测试场景关键字段
            const testKeyFields = ['test_id', 'test_date', 'project', 'baseline', 'material_code', 'material_name', 'supplier_name', 'test_result', 'defect_desc'];
            const columnNames = columns.map(col => col.COLUMN_NAME);
            const existingFields = testKeyFields.filter(field => columnNames.includes(field));
            const missingFields = testKeyFields.filter(field => !columnNames.includes(field));
            
            if (existingFields.length > 0) {
              console.log(`  ✅ 存在关键字段: ${existingFields.join(', ')}`);
            }
            if (missingFields.length > 0) {
              console.log(`  ❌ 缺失关键字段: ${missingFields.join(', ')}`);
            }
            
            // 查看前3条数据示例
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
                console.log(`  📋 前3条记录示例:`);
                records.forEach((record, index) => {
                  console.log(`\n    记录 ${index + 1}:`);
                  
                  // 显示测试场景相关字段
                  const testFields = ['test_id', 'test_date', 'project', 'project_id', 'baseline', 'baseline_id', 'material_code', 'material_name', 'supplier_name', 'test_result', 'defect_desc', 'quantity', 'notes'];
                  
                  testFields.forEach(field => {
                    if (record.hasOwnProperty(field)) {
                      const value = record[field] === null ? '[NULL]' : 
                                   record[field] === '' ? '[EMPTY]' : 
                                   record[field] === undefined ? '[UNDEFINED]' : record[field];
                      console.log(`      ${field}: ${value}`);
                    }
                  });
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

async function testCurrentTestRules() {
  const testQueries = [
    '查询测试信息',
    '查询充电类测试',
    '查询光学类测试'
  ];
  
  for (const query of testQueries) {
    console.log(`\n测试查询: ${query}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.tableData) {
        const data = result.data.tableData;
        console.log(`  ✅ 查询成功，返回 ${data.length} 条记录`);
        
        if (data.length > 0) {
          const firstRecord = data[0];
          console.log(`  📋 当前返回字段:`);
          
          Object.keys(firstRecord).forEach(key => {
            const value = firstRecord[key] || '[空值]';
            console.log(`    ${key}: ${value}`);
          });
          
          // 对比真实测试场景字段
          const expectedFields = ['测试编号', '日期', '项目', '基线', '物料编码', '批次', '物料名称', '供应商', '测试结果', '不合格描述', '备注'];
          const actualFields = Object.keys(firstRecord);
          
          console.log(`\n  🔍 字段对比分析:`);
          console.log(`    期望字段: ${expectedFields.join(', ')}`);
          console.log(`    实际字段: ${actualFields.join(', ')}`);
          
          const missingFields = expectedFields.filter(field => !actualFields.includes(field));
          const extraFields = actualFields.filter(field => !expectedFields.includes(field));
          
          if (missingFields.length > 0) {
            console.log(`    ❌ 缺失字段: ${missingFields.join(', ')}`);
          }
          if (extraFields.length > 0) {
            console.log(`    ⚠️  额外字段: ${extraFields.join(', ')}`);
          }
          if (missingFields.length === 0 && extraFields.length === 0) {
            console.log(`    ✅ 字段完全匹配`);
          }
        }
      } else {
        console.log(`  ❌ 查询失败`);
        if (result.message) {
          console.log(`    错误信息: ${result.message}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ 查询出错: ${error.message}`);
    }
  }
}

async function generateCorrectTestSQL() {
  console.log('🔧 根据真实测试场景字段生成正确的SQL模板...\n');
  
  // 真实测试场景字段映射
  console.log('📋 真实测试场景字段 (基于截图):');
  console.log('1. 测试编号');
  console.log('2. 日期');
  console.log('3. 项目');
  console.log('4. 基线');
  console.log('5. 物料编码');
  console.log('6. 批次');
  console.log('7. 物料名称');
  console.log('8. 供应商');
  console.log('9. 测试结果');
  console.log('10. 不合格描述');
  console.log('11. 备注');
  
  // 基于lab_tests表的SQL模板
  const labTestsSQL = `
SELECT 
  COALESCE(test_id, '') as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '') as 项目,
  COALESCE(baseline_id, '') as 基线,
  COALESCE(material_code, '') as 物料编码,
  COALESCE(batch_code, '') as 批次,
  COALESCE(material_name, '') as 物料名称,
  COALESCE(supplier_name, '') as 供应商,
  COALESCE(test_result, '') as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests 
ORDER BY test_date DESC 
LIMIT 50`.trim();
  
  console.log('\n🔧 基于lab_tests表的SQL模板:');
  console.log(labTestsSQL);
  
  // 基于production_tracking表的SQL模板（如果lab_tests表数据不完整）
  const productionTrackingSQL = `
SELECT 
  COALESCE(test_id, '') as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project, '') as 项目,
  COALESCE(baseline, '') as 基线,
  COALESCE(material_code, '') as 物料编码,
  '' as 批次,
  COALESCE(material_name, '') as 物料名称,
  COALESCE(supplier_name, '') as 供应商,
  '合格' as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM production_tracking 
ORDER BY test_date DESC 
LIMIT 50`.trim();
  
  console.log('\n🔧 基于production_tracking表的SQL模板:');
  console.log(productionTrackingSQL);
  
  console.log('\n💡 建议:');
  console.log('1. 确认哪个表包含完整的测试数据');
  console.log('2. 根据实际表结构选择合适的SQL模板');
  console.log('3. 更新所有测试相关规则使用正确的字段映射');
  console.log('4. 确保字段顺序与前端测试页面完全一致');
}

checkTestFieldMapping();
