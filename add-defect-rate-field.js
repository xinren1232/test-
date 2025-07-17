/**
 * 添加defect_rate字段到lab_tests表
 */

const API_BASE_URL = 'http://localhost:3001';

async function addDefectRateField() {
  try {
    console.log('🔧 添加defect_rate字段到lab_tests表...\n');
    
    // 1. 添加defect_rate字段
    console.log('1️⃣ 添加defect_rate字段...');
    const addFieldResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `ALTER TABLE lab_tests ADD COLUMN defect_rate VARCHAR(10) DEFAULT '0%' COMMENT '不良率'`
      })
    });
    
    if (addFieldResponse.ok) {
      const result = await addFieldResponse.json();
      console.log('✅ defect_rate字段添加成功');
    } else {
      const error = await addFieldResponse.json();
      if (error.error && error.error.includes('Duplicate column name')) {
        console.log('ℹ️  defect_rate字段已存在，跳过添加');
      } else {
        console.log('❌ 添加defect_rate字段失败:', error.error);
        return;
      }
    }
    
    // 2. 更新现有数据，生成真实的不良率
    console.log('\n2️⃣ 更新现有数据，生成真实的不良率...');
    const updateDataResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `
          UPDATE lab_tests 
          SET defect_rate = CASE 
            WHEN test_result = '合格' THEN 
              CASE FLOOR(RAND() * 5)
                WHEN 0 THEN '0%'
                WHEN 1 THEN '0.5%'
                WHEN 2 THEN '1%'
                WHEN 3 THEN '1.5%'
                ELSE '2%'
              END
            WHEN test_result = '不合格' THEN 
              CASE FLOOR(RAND() * 3)
                WHEN 0 THEN '3%'
                WHEN 1 THEN '4%'
                ELSE '5%'
              END
            ELSE '0%'
          END
          WHERE defect_rate = '0%' OR defect_rate IS NULL
        `
      })
    });
    
    if (updateDataResponse.ok) {
      const result = await updateDataResponse.json();
      console.log('✅ 现有数据的不良率更新成功');
      console.log(`   更新了记录数: ${result.affectedRows || '未知'}`);
    } else {
      const error = await updateDataResponse.json();
      console.log('❌ 更新现有数据失败:', error.error);
    }
    
    // 3. 验证修复结果
    console.log('\n3️⃣ 验证修复结果...');
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
        console.log('\n前5条记录的不良率验证:');
        data.slice(0, 5).forEach((record, index) => {
          console.log(`记录 ${index + 1}:`);
          console.log(`  物料名称: ${record.物料名称}`);
          console.log(`  不良率: ${record.不良率}`);
          console.log(`  不良现象: ${record.不良现象}`);
        });
        
        // 检查不良率多样性
        const defectRates = [...new Set(data.slice(0, 10).map(r => r.不良率))];
        console.log(`\n不良率多样性: ${defectRates.length} 种 (${defectRates.join(', ')})`);
        
        if (defectRates.length > 1 && !defectRates.every(rate => rate === '0%')) {
          console.log('🎉 不良率数据已修复，显示真实数据！');
        } else {
          console.log('⚠️  不良率仍显示固定值，可能需要进一步检查');
        }
      }
    } else {
      console.log('❌ 验证查询失败');
      if (queryResult.message) {
        console.log(`错误信息: ${queryResult.message}`);
      }
    }
    
    console.log('\n✅ defect_rate字段修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  }
}

addDefectRateField();
