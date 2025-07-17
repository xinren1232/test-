/**
 * 检查测试场景规则的字段映射问题
 */

const API_BASE_URL = 'http://localhost:3001';

// 前端测试页面的实际字段设计（不可更改）
const TESTING_ACTUAL_FIELDS = [
  '测试编号', '日期', '项目', '基线', '物料编码', '数量', 
  '物料名称', '供应商', '测试结果', '不合格描述', '备注'
];

async function checkTestingRulesFields() {
  try {
    console.log('🔍 检查测试场景规则的字段映射问题...\n');
    
    // 获取规则库
    const response = await fetch(`${API_BASE_URL}/api/rules`);
    const result = await response.json();
    
    if (!result.success) {
      console.log('❌ 获取规则失败');
      return;
    }
    
    const rules = result.data;
    
    // 找出测试相关规则
    const testingRules = rules.filter(rule => 
      (rule.category && rule.category.includes('测试')) ||
      (rule.intent_name && (rule.intent_name.includes('测试') || rule.intent_name.includes('检验')))
    );
    
    console.log(`📊 找到 ${testingRules.length} 条测试相关规则\n`);
    
    // 检查每条测试规则的字段问题
    const fieldIssues = [];
    
    testingRules.forEach((rule, index) => {
      console.log(`规则${index + 1}: ${rule.intent_name} (ID: ${rule.id})`);
      
      const sql = rule.action_target || '';
      console.log(`SQL片段: ${sql.substring(0, 150)}...`);
      
      // 检查关键字段问题
      const issues = [];
      
      // 1. 检查必要字段是否存在
      TESTING_ACTUAL_FIELDS.forEach(field => {
        if (!sql.includes(field)) {
          issues.push(`缺少"${field}"字段`);
        }
      });
      
      // 2. 检查数据库字段映射
      if (sql.includes('material_code') && !sql.includes('物料编码')) {
        issues.push('material_code字段未映射到"物料编码"');
      }
      if (sql.includes('material_name') && !sql.includes('物料名称')) {
        issues.push('material_name字段未映射到"物料名称"');
      }
      if (sql.includes('supplier_name') && !sql.includes('供应商')) {
        issues.push('supplier_name字段未映射到"供应商"');
      }
      if (sql.includes('defect_desc') && !sql.includes('不合格描述')) {
        issues.push('defect_desc字段未映射到"不合格描述"');
      }
      
      // 3. 检查表名是否正确
      if (!sql.includes('lab_tests')) {
        issues.push('可能使用了错误的表名，应该使用lab_tests');
      }
      
      if (issues.length > 0) {
        console.log(`   ❌ 发现问题:`);
        issues.forEach(issue => console.log(`      - ${issue}`));
        fieldIssues.push({
          rule: rule,
          issues: issues
        });
      } else {
        console.log(`   ✅ 字段正常`);
      }
      
      console.log('');
    });
    
    // 检查数据库中的实际数据
    console.log('🔍 检查lab_tests表的实际数据...');
    await checkLabTestsData();
    
    // 生成修复建议
    if (fieldIssues.length > 0) {
      console.log('\n🔧 需要修复的规则:');
      generateTestingFixSuggestions(fieldIssues);
    } else {
      console.log('\n✅ 所有测试规则字段都正常');
    }
    
  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  }
}

async function checkLabTestsData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'SELECT * FROM lab_tests LIMIT 3'
      })
    });
    
    const result = await response.json();
    
    if (result.success && result.data && result.data.tableData) {
      const data = result.data.tableData;
      console.log(`📊 lab_tests表有 ${data.length} 条记录`);
      
      if (data.length > 0) {
        const firstRecord = data[0];
        console.log('第一条记录的字段:');
        Object.entries(firstRecord).forEach(([key, value]) => {
          const displayValue = value === null ? '[NULL]' : 
                             value === '' ? '[EMPTY]' : 
                             value === undefined ? '[UNDEFINED]' : value;
          console.log(`  ${key}: ${displayValue}`);
        });
        
        // 检查关键字段是否有数据
        const keyFields = ['material_code', 'material_name', 'supplier_name', 'defect_desc'];
        keyFields.forEach(field => {
          const value = firstRecord[field];
          if (!value || value === '') {
            console.log(`  ⚠️  ${field} 字段为空`);
          }
        });
      }
    } else {
      console.log('❌ 无法获取lab_tests表数据');
    }
    
  } catch (error) {
    console.error('❌ 检查lab_tests数据失败:', error);
  }
}

function generateTestingFixSuggestions(fieldIssues) {
  console.log('\n-- 修复测试规则字段映射的建议\n');
  
  // 正确的测试查询SQL模板
  const correctTestingSQL = `
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
  
  console.log('正确的测试查询SQL模板:');
  console.log(correctTestingSQL);
  console.log('\n关键改进点:');
  console.log('1. 使用lab_tests表');
  console.log('2. 正确映射所有11个字段');
  console.log('3. 使用DATE_FORMAT格式化日期');
  console.log('4. 使用COALESCE处理空值');
  console.log('5. 字段名完全匹配前端显示');
}

checkTestingRulesFields();
