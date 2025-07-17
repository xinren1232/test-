/**
 * 修复测试规则字段，使其与实际页面字段完全匹配
 */

const API_BASE_URL = 'http://localhost:3001';

// 实际测试页面的字段（根据截图）
const ACTUAL_TESTING_PAGE_FIELDS = [
  '工厂', '基线', '项目', '物料编码', '物料名称', '供应商', 
  '批次', '不良率', '不良现象', '检验日期', '备注'
];

// 正确的测试查询SQL模板（匹配实际页面字段）
const CORRECT_TESTING_SQL_TEMPLATE = `
SELECT 
  COALESCE(factory, '未知工厂') as 工厂,
  COALESCE(baseline_id, '') as 基线,
  COALESCE(project_id, '') as 项目,
  COALESCE(material_code, '') as 物料编码,
  COALESCE(material_name, '') as 物料名称,
  COALESCE(supplier_name, '') as 供应商,
  COALESCE(batch_code, '') as 批次,
  COALESCE(defect_rate, '0%') as 不良率,
  COALESCE(defect_desc, '') as 不良现象,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM lab_tests 
ORDER BY test_date DESC 
LIMIT 50`.trim();

// 需要修复的所有测试规则
const ALL_TESTING_RULES_TO_FIX = [
  { id: 660, name: '测试信息查询' },
  { id: 726, name: '结构件类测试查询', condition: "WHERE material_name LIKE '%结构%' OR material_name LIKE '%框架%' OR material_name LIKE '%外壳%' OR material_name LIKE '%支架%'" },
  { id: 729, name: '光学类测试查询', condition: "WHERE material_name LIKE '%显示%' OR material_name LIKE '%屏%' OR material_name LIKE '%光学%' OR material_name LIKE '%镜头%'" },
  { id: 732, name: '充电类测试查询', condition: "WHERE material_name LIKE '%充电%' OR material_name LIKE '%电池%' OR material_name LIKE '%电源%'" },
  { id: 735, name: '声学类测试查询', condition: "WHERE material_name LIKE '%扬声器%' OR material_name LIKE '%听筒%' OR material_name LIKE '%麦克风%' OR material_name LIKE '%音频%'" },
  { id: 738, name: '包装类测试查询', condition: "WHERE material_name LIKE '%包装%' OR material_name LIKE '%保护套%' OR material_name LIKE '%标签%' OR material_name LIKE '%盒子%'" },
  { id: 663, name: 'BOE供应商测试查询', condition: "WHERE supplier_name = 'BOE'" },
  { id: 666, name: '东声供应商测试查询', condition: "WHERE supplier_name = '东声'" },
  { id: 669, name: '丽德宝供应商测试查询', condition: "WHERE supplier_name = '丽德宝'" },
  { id: 672, name: '华星供应商测试查询', condition: "WHERE supplier_name = '华星'" },
  { id: 675, name: '天实供应商测试查询', condition: "WHERE supplier_name = '天实'" },
  { id: 678, name: '天马供应商测试查询', condition: "WHERE supplier_name = '天马'" },
  { id: 681, name: '奥海供应商测试查询', condition: "WHERE supplier_name = '奥海'" },
  { id: 684, name: '富群供应商测试查询', condition: "WHERE supplier_name = '富群'" },
  { id: 687, name: '广正供应商测试查询', condition: "WHERE supplier_name = '广正'" },
  { id: 690, name: '怡同供应商测试查询', condition: "WHERE supplier_name = '怡同'" },
  { id: 693, name: '欣冠供应商测试查询', condition: "WHERE supplier_name = '欣冠'" },
  { id: 696, name: '歌尔供应商测试查询', condition: "WHERE supplier_name = '歌尔'" },
  { id: 699, name: '深奥供应商测试查询', condition: "WHERE supplier_name = '深奥'" },
  { id: 702, name: '理威供应商测试查询', condition: "WHERE supplier_name = '理威'" },
  { id: 705, name: '瑞声供应商测试查询', condition: "WHERE supplier_name = '瑞声'" },
  { id: 708, name: '百佳达供应商测试查询', condition: "WHERE supplier_name = '百佳达'" },
  { id: 711, name: '盛泰供应商测试查询', condition: "WHERE supplier_name = '盛泰'" },
  { id: 714, name: '维科供应商测试查询', condition: "WHERE supplier_name = '维科'" },
  { id: 717, name: '聚龙供应商测试查询', condition: "WHERE supplier_name = '聚龙'" },
  { id: 720, name: '辉阳供应商测试查询', condition: "WHERE supplier_name = '辉阳'" },
  { id: 723, name: '风华供应商测试查询', condition: "WHERE supplier_name = '风华'" }
];

async function fixTestingRulesCorrectFields() {
  try {
    console.log('🔧 修复测试规则字段，使其与实际页面完全匹配...\n');
    console.log('📋 实际测试页面字段:');
    ACTUAL_TESTING_PAGE_FIELDS.forEach((field, index) => {
      console.log(`  ${index + 1}. ${field}`);
    });
    console.log('');
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const rule of ALL_TESTING_RULES_TO_FIX) {
      console.log(`修复规则: ${rule.name} (ID: ${rule.id})`);
      
      try {
        // 构建正确的SQL（使用实际页面字段）
        let newSQL = CORRECT_TESTING_SQL_TEMPLATE;
        if (rule.condition) {
          newSQL = newSQL.replace(
            'FROM lab_tests',
            `FROM lab_tests\n${rule.condition}`
          );
          console.log(`  添加条件: ${rule.condition}`);
        }
        
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
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`🎉 测试规则字段修复完成！`);
    console.log(`✅ 成功修复: ${fixedCount} 条规则`);
    console.log(`❌ 修复失败: ${errorCount} 条规则\n`);
    
    // 验证修复结果
    if (fixedCount > 0) {
      console.log('🔍 验证修复结果...');
      await validateCorrectFields();
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  }
}

async function validateCorrectFields() {
  try {
    // 测试修复后的规则
    const testQuery = '查询测试信息';
    console.log(`\n测试查询: ${testQuery}`);
    
    const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: testQuery })
    });
    
    const result = await response.json();
    
    if (result.success && result.data && result.data.tableData) {
      const data = result.data.tableData;
      console.log(`✅ 查询成功，返回 ${data.length} 条记录`);
      
      if (data.length > 0) {
        const firstRecord = data[0];
        console.log('\n📊 返回字段检查:');
        
        // 检查是否包含所有实际页面字段
        const missingFields = ACTUAL_TESTING_PAGE_FIELDS.filter(field => !(field in firstRecord));
        const extraFields = Object.keys(firstRecord).filter(field => !ACTUAL_TESTING_PAGE_FIELDS.includes(field));
        
        if (missingFields.length === 0 && extraFields.length === 0) {
          console.log('✅ 字段完全匹配实际页面');
        } else {
          if (missingFields.length > 0) {
            console.log(`❌ 缺失字段: ${missingFields.join(', ')}`);
          }
          if (extraFields.length > 0) {
            console.log(`⚠️  多余字段: ${extraFields.join(', ')}`);
          }
        }
        
        // 显示实际字段内容
        console.log('\n📋 第一条记录的字段内容:');
        ACTUAL_TESTING_PAGE_FIELDS.forEach(field => {
          const value = firstRecord[field];
          const displayValue = value === null ? '[NULL]' : 
                             value === '' ? '[EMPTY]' : 
                             value === undefined ? '[UNDEFINED]' : value;
          console.log(`  ${field}: ${displayValue}`);
        });
      }
    } else {
      console.log('❌ 查询失败或无数据');
      if (result.message) {
        console.log(`错误信息: ${result.message}`);
      }
    }
    
    console.log('\n✅ 验证完成');
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error);
  }
}

// 运行修复
fixTestingRulesCorrectFields();
