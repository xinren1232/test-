/**
 * 修复测试场景的字段映射问题
 * 将测试查询规则改为使用lab_tests表，并匹配真实测试场景字段
 */

const API_BASE_URL = 'http://localhost:3001';

async function fixTestFieldMapping() {
  try {
    console.log('🔧 修复测试场景的字段映射问题...\n');
    
    // 1. 验证lab_tests表的数据完整性
    console.log('1️⃣ 验证lab_tests表的数据完整性...');
    await verifyLabTestsTable();
    
    // 2. 修复所有测试查询规则
    console.log('\n2️⃣ 修复所有测试查询规则...');
    await fixTestQueryRules();
    
    // 3. 验证修复结果
    console.log('\n3️⃣ 验证修复结果...');
    await validateFixedTestRules();
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  }
}

async function verifyLabTestsTable() {
  try {
    // 检查lab_tests表的数据分布
    const dataResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `
          SELECT 
            COUNT(*) as total_count,
            COUNT(DISTINCT material_name) as material_types,
            COUNT(DISTINCT supplier_name) as suppliers,
            COUNT(DISTINCT test_result) as test_results,
            COUNT(CASE WHEN material_code IS NOT NULL AND material_code != '' THEN 1 END) as has_material_code,
            COUNT(CASE WHEN batch_code IS NOT NULL AND batch_code != '' THEN 1 END) as has_batch_code,
            COUNT(CASE WHEN project_id IS NOT NULL AND project_id != '' THEN 1 END) as has_project_id
          FROM lab_tests
        `
      })
    });
    
    if (dataResponse.ok) {
      const dataResult = await dataResponse.json();
      const stats = dataResult.result[0];
      
      console.log('📊 lab_tests表数据统计:');
      console.log(`  总记录数: ${stats.total_count}`);
      console.log(`  物料类型数: ${stats.material_types}`);
      console.log(`  供应商数: ${stats.suppliers}`);
      console.log(`  测试结果类型: ${stats.test_results}`);
      console.log(`  有物料编码的记录: ${stats.has_material_code}/${stats.total_count}`);
      console.log(`  有批次号的记录: ${stats.has_batch_code}/${stats.total_count}`);
      console.log(`  有项目ID的记录: ${stats.has_project_id}/${stats.total_count}`);
    }
    
    // 查看测试结果分布
    const resultResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `
          SELECT test_result, COUNT(*) as count 
          FROM lab_tests 
          WHERE test_result IS NOT NULL 
          GROUP BY test_result
        `
      })
    });
    
    if (resultResponse.ok) {
      const resultData = await resultResponse.json();
      console.log('\n📊 测试结果分布:');
      resultData.result.forEach(row => {
        console.log(`  ${row.test_result}: ${row.count}条`);
      });
    }
    
    // 查看物料类型分布
    const materialResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `
          SELECT material_name, COUNT(*) as count 
          FROM lab_tests 
          WHERE material_name IS NOT NULL 
          GROUP BY material_name 
          ORDER BY count DESC 
          LIMIT 10
        `
      })
    });
    
    if (materialResponse.ok) {
      const materialData = await materialResponse.json();
      console.log('\n📊 主要物料类型 (前10):');
      materialData.result.forEach(row => {
        console.log(`  ${row.material_name}: ${row.count}条`);
      });
    }
    
  } catch (error) {
    console.error('❌ 验证lab_tests表时出错:', error);
  }
}

async function fixTestQueryRules() {
  // 正确的lab_tests表SQL模板，匹配真实测试场景字段
  const correctTestSQL = `
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
  
  // 需要修复的测试规则 (需要先找到测试相关规则的ID)
  console.log('🔍 查找测试相关规则...');
  
  try {
    // 查找包含"测试"关键词的规则
    const rulesResponse = await fetch(`${API_BASE_URL}/api/rules`);
    if (rulesResponse.ok) {
      const rulesResult = await rulesResponse.json();
      const allRules = rulesResult.data || rulesResult.rules || [];
      
      // 筛选测试相关规则
      const testRules = allRules.filter(rule => 
        rule.rule_name && (
          rule.rule_name.includes('测试') ||
          rule.rule_name.includes('检验') ||
          rule.rule_name.includes('lab') ||
          rule.rule_name.includes('test')
        )
      );
      
      console.log(`找到 ${testRules.length} 条测试相关规则:`);
      testRules.forEach(rule => {
        console.log(`  ID: ${rule.id}, 名称: ${rule.rule_name}`);
      });
      
      // 修复每个测试规则
      let fixedCount = 0;
      
      for (const rule of testRules) {
        console.log(`\n修复规则: ${rule.rule_name} (ID: ${rule.id})`);
        
        try {
          let finalSQL = correctTestSQL;
          
          // 为不同类别添加过滤条件
          if (rule.rule_name.includes('充电') || rule.rule_name.includes('电池') || rule.rule_name.includes('电源')) {
            finalSQL = finalSQL.replace(
              'FROM lab_tests',
              `FROM lab_tests\nWHERE material_name LIKE '%充电%' OR material_name LIKE '%电池%' OR material_name LIKE '%电源%'`
            );
            console.log(`  添加充电类过滤条件`);
          } else if (rule.rule_name.includes('光学') || rule.rule_name.includes('显示') || rule.rule_name.includes('屏')) {
            finalSQL = finalSQL.replace(
              'FROM lab_tests',
              `FROM lab_tests\nWHERE material_name LIKE '%显示%' OR material_name LIKE '%屏%' OR material_name LIKE '%光学%' OR material_name LIKE '%镜头%' OR material_name LIKE '%LCD%' OR material_name LIKE '%OLED%' OR material_name LIKE '%摄像头%'`
            );
            console.log(`  添加光学类过滤条件`);
          } else if (rule.rule_name.includes('结构') || rule.rule_name.includes('框架')) {
            finalSQL = finalSQL.replace(
              'FROM lab_tests',
              `FROM lab_tests\nWHERE material_name LIKE '%结构%' OR material_name LIKE '%框架%' OR material_name LIKE '%外壳%' OR material_name LIKE '%支架%' OR material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%卡托%' OR material_name LIKE '%侧键%'`
            );
            console.log(`  添加结构件类过滤条件`);
          } else if (rule.rule_name.includes('声学') || rule.rule_name.includes('音频')) {
            finalSQL = finalSQL.replace(
              'FROM lab_tests',
              `FROM lab_tests\nWHERE material_name LIKE '%扬声器%' OR material_name LIKE '%听筒%' OR material_name LIKE '%麦克风%' OR material_name LIKE '%音频%' OR material_name LIKE '%喇叭%'`
            );
            console.log(`  添加声学类过滤条件`);
          } else if (rule.rule_name.includes('包装')) {
            finalSQL = finalSQL.replace(
              'FROM lab_tests',
              `FROM lab_tests\nWHERE material_name LIKE '%包装%' OR material_name LIKE '%保护套%' OR material_name LIKE '%标签%' OR material_name LIKE '%盒子%'`
            );
            console.log(`  添加包装类过滤条件`);
          }
          
          const response = await fetch(`${API_BASE_URL}/api/rules/${rule.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action_target: finalSQL
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              console.log(`  ✅ 修复成功`);
              fixedCount++;
            } else {
              console.log(`  ❌ 修复失败: ${result.message}`);
            }
          } else {
            console.log(`  ❌ API请求失败: ${response.status}`);
          }
          
        } catch (error) {
          console.log(`  ❌ 修复出错: ${error.message}`);
        }
      }
      
      console.log(`\n🎉 测试规则修复完成！`);
      console.log(`✅ 成功修复: ${fixedCount} 条规则`);
      
    } else {
      console.log('❌ 获取规则列表失败');
    }
    
  } catch (error) {
    console.error('❌ 修复测试规则时出错:', error);
  }
}

async function validateFixedTestRules() {
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
          
          console.log(`  📋 返回字段验证:`);
          console.log(`    测试编号: ${firstRecord.测试编号 || '[空值]'}`);
          console.log(`    日期: ${firstRecord.日期 || '[空值]'}`);
          console.log(`    项目: ${firstRecord.项目 || '[空值]'}`);
          console.log(`    基线: ${firstRecord.基线 || '[空值]'}`);
          console.log(`    物料编码: ${firstRecord.物料编码 || '[空值]'}`);
          console.log(`    批次: ${firstRecord.批次 || '[空值]'}`);
          console.log(`    物料名称: ${firstRecord.物料名称 || '[空值]'}`);
          console.log(`    供应商: ${firstRecord.供应商 || '[空值]'}`);
          console.log(`    测试结果: ${firstRecord.测试结果 || '[空值]'}`);
          console.log(`    不合格描述: ${firstRecord.不合格描述 || '[空值]'}`);
          console.log(`    备注: ${firstRecord.备注 || '[空值]'}`);
          
          // 验证字段完整性
          const expectedFields = ['测试编号', '日期', '项目', '基线', '物料编码', '批次', '物料名称', '供应商', '测试结果', '不合格描述', '备注'];
          const actualFields = Object.keys(firstRecord);
          const missingFields = expectedFields.filter(field => !actualFields.includes(field));
          
          if (missingFields.length === 0) {
            console.log(`  ✅ 字段映射完全正确，与真实测试场景匹配`);
          } else {
            console.log(`  ❌ 仍缺失字段: ${missingFields.join(', ')}`);
          }
          
          // 检查数据质量
          const hasValidData = firstRecord.测试编号 && firstRecord.物料名称 && firstRecord.供应商 && firstRecord.测试结果;
          if (hasValidData) {
            console.log(`  ✅ 数据质量良好，包含真实测试信息`);
          } else {
            console.log(`  ⚠️  数据质量需要改善，某些关键字段为空`);
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
  
  console.log('\n✅ 验证完成');
}

fixTestFieldMapping();
