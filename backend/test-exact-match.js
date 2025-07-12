import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function testExactMatch() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🧪 测试精准匹配功能...\n');
    
    // 1. 测试精准匹配 - 查询"电池"
    console.log('1. 测试精准匹配 - 查询"电池"');
    const [exactResults] = await connection.execute(`
      SELECT
        material_name as 物料名称,
        supplier_name as 供应商,
        line as 生产线,
        project as 项目,
        DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
        factory as 工厂,
        workshop as 车间,
        batch_code as 批次号,
        CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
        exception_count as 异常次数
      FROM online_tracking
      WHERE material_name = ?
      ORDER BY online_date DESC
      LIMIT 10
    `, ['电池']);
    
    console.log(`精准匹配结果 (material_name = '电池'): ${exactResults.length} 条记录`);
    exactResults.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.物料名称} - ${record.供应商} (${record.工厂})`);
    });
    
    // 2. 测试模糊匹配 - 查询包含"电池"的所有物料
    console.log('\n2. 测试模糊匹配 - 查询包含"电池"的所有物料');
    const [fuzzyResults] = await connection.execute(`
      SELECT
        material_name as 物料名称,
        supplier_name as 供应商,
        line as 生产线,
        project as 项目,
        DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
        factory as 工厂,
        workshop as 车间,
        batch_code as 批次号,
        CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
        exception_count as 异常次数
      FROM online_tracking
      WHERE material_name LIKE ?
      ORDER BY online_date DESC
      LIMIT 10
    `, ['%电池%']);
    
    console.log(`模糊匹配结果 (material_name LIKE '%电池%'): ${fuzzyResults.length} 条记录`);
    fuzzyResults.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.物料名称} - ${record.供应商} (${record.工厂})`);
    });
    
    // 3. 对比结果
    console.log('\n📊 结果对比:');
    console.log(`精准匹配: ${exactResults.length} 条记录`);
    console.log(`模糊匹配: ${fuzzyResults.length} 条记录`);
    
    if (exactResults.length < fuzzyResults.length) {
      console.log('✅ 精准匹配成功！返回的记录数少于模糊匹配');
    } else {
      console.log('⚠️ 精准匹配可能有问题，返回记录数与模糊匹配相同或更多');
    }
    
    // 4. 检查精准匹配是否只返回"电池"
    const exactMaterialNames = exactResults.map(r => r.物料名称);
    const onlyBattery = exactMaterialNames.every(name => name === '电池');
    
    console.log('\n🔍 精准匹配验证:');
    console.log(`精准匹配返回的物料名称: ${[...new Set(exactMaterialNames)].join(', ')}`);
    console.log(`是否只包含"电池": ${onlyBattery ? '✅ 是' : '❌ 否'}`);
    
    // 5. 检查模糊匹配是否包含"电池盖"等相关物料
    const fuzzyMaterialNames = fuzzyResults.map(r => r.物料名称);
    const uniqueFuzzyNames = [...new Set(fuzzyMaterialNames)];
    
    console.log('\n🔍 模糊匹配验证:');
    console.log(`模糊匹配返回的物料名称: ${uniqueFuzzyNames.join(', ')}`);
    console.log(`是否包含"电池盖": ${uniqueFuzzyNames.includes('电池盖') ? '✅ 是' : '❌ 否'}`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await connection.end();
  }
}

testExactMatch();
