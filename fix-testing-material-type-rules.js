/**
 * 修复测试场景的物料类型查询规则
 * 将material_type字段改为使用material_name字段过滤
 */

const API_BASE_URL = 'http://localhost:3001';

// 正确的测试查询SQL模板
const CORRECT_TESTING_SQL = `
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
ORDER BY test_date DESC 
LIMIT 50`.trim();

// 需要修复的物料类型规则（使用material_name字段过滤）
const MATERIAL_TYPE_RULES_TO_FIX = [
  { 
    id: 726, 
    name: '结构件类测试查询', 
    condition: "WHERE material_name LIKE '%结构%' OR material_name LIKE '%框架%' OR material_name LIKE '%外壳%' OR material_name LIKE '%支架%'" 
  },
  { 
    id: 729, 
    name: '光学类测试查询', 
    condition: "WHERE material_name LIKE '%显示%' OR material_name LIKE '%屏%' OR material_name LIKE '%光学%' OR material_name LIKE '%镜头%'" 
  },
  { 
    id: 732, 
    name: '充电类测试查询', 
    condition: "WHERE material_name LIKE '%充电%' OR material_name LIKE '%电池%' OR material_name LIKE '%电源%'" 
  },
  { 
    id: 735, 
    name: '声学类测试查询', 
    condition: "WHERE material_name LIKE '%扬声器%' OR material_name LIKE '%听筒%' OR material_name LIKE '%麦克风%' OR material_name LIKE '%音频%'" 
  },
  { 
    id: 738, 
    name: '包装类测试查询', 
    condition: "WHERE material_name LIKE '%包装%' OR material_name LIKE '%保护套%' OR material_name LIKE '%标签%' OR material_name LIKE '%盒子%'" 
  }
];

async function fixTestingMaterialTypeRules() {
  try {
    console.log('🔧 修复测试场景的物料类型查询规则...\n');
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const rule of MATERIAL_TYPE_RULES_TO_FIX) {
      console.log(`修复规则: ${rule.name} (ID: ${rule.id})`);
      
      try {
        // 构建正确的SQL（使用material_name字段过滤）
        let newSQL = CORRECT_TESTING_SQL;
        newSQL = newSQL.replace(
          'FROM lab_tests',
          `FROM lab_tests\n${rule.condition}`
        );
        
        console.log(`  修复条件: ${rule.condition}`);
        
        // 通过API更新规则
        const response = await fetch(`${API_BASE_URL}/api/rules/${rule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action_target: newSQL
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log(`  ✅ 修复成功`);
            fixedCount++;
          } else {
            console.log(`  ❌ 修复失败: ${result.message}`);
            errorCount++;
          }
        } else {
          console.log(`  ❌ API请求失败: ${response.status}`);
          errorCount++;
        }
        
      } catch (error) {
        console.log(`  ❌ 修复出错: ${error.message}`);
        errorCount++;
      }
      
      console.log('');
      
      // 添加小延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`🎉 物料类型规则修复完成！`);
    console.log(`✅ 成功修复: ${fixedCount} 条规则`);
    console.log(`❌ 修复失败: ${errorCount} 条规则\n`);
    
    // 验证修复结果
    if (fixedCount > 0) {
      console.log('🔍 验证修复结果...');
      await validateMaterialTypeRules();
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  }
}

async function validateMaterialTypeRules() {
  try {
    // 测试修复后的物料类型查询
    const testQueries = [
      { query: '查询光学类测试', expectKeywords: ['显示', '屏', '光学', '镜头'] },
      { query: '查询结构件类测试', expectKeywords: ['结构', '框架', '外壳', '支架'] },
      { query: '查询充电类测试', expectKeywords: ['充电', '电池', '电源'] }
    ];
    
    for (const test of testQueries) {
      console.log(`\n测试查询: ${test.query}`);
      
      const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: test.query })
      });
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.tableData) {
        const data = result.data.tableData;
        console.log(`  ✅ 查询成功，返回 ${data.length} 条记录`);
        
        if (data.length > 0) {
          // 检查返回的数据是否包含预期的关键词
          const materialNames = data.map(record => record.物料名称).filter(name => name);
          const hasExpectedKeywords = materialNames.some(name => 
            test.expectKeywords.some(keyword => name.includes(keyword))
          );
          
          if (hasExpectedKeywords) {
            console.log(`  ✅ 物料过滤正确`);
          } else {
            console.log(`  ⚠️  物料过滤可能不准确`);
            console.log(`    实际物料名称: ${materialNames.slice(0, 3).join(', ')}...`);
          }
        } else {
          console.log(`  ⚠️  查询成功但无数据，可能物料名称中没有匹配的关键词`);
        }
      } else {
        console.log(`  ❌ 查询失败`);
        if (result.message) {
          console.log(`    错误信息: ${result.message}`);
        }
      }
    }
    
    console.log('\n✅ 验证完成');
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error);
  }
}

// 运行修复
fixTestingMaterialTypeRules();
