/**
 * 修复测试场景规则的字段映射问题
 */

const API_BASE_URL = 'http://localhost:3001';

// 正确的测试查询SQL模板（匹配前端字段）
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

// 需要修复的测试规则ID列表
const TESTING_RULES_TO_FIX = [
  { id: 660, name: '测试信息查询' },
  { id: 726, name: '结构件类测试查询', condition: "WHERE material_type LIKE '%结构件%'" },
  { id: 729, name: '光学类测试查询', condition: "WHERE material_type LIKE '%光学%' OR material_name LIKE '%显示%' OR material_name LIKE '%屏%'" },
  { id: 732, name: '充电类测试查询', condition: "WHERE material_name LIKE '%充电%' OR material_name LIKE '%电池%'" },
  { id: 735, name: '声学类测试查询', condition: "WHERE material_name LIKE '%扬声器%' OR material_name LIKE '%听筒%'" },
  { id: 738, name: '包装类测试查询', condition: "WHERE material_name LIKE '%包装%' OR material_name LIKE '%保护套%' OR material_name LIKE '%标签%'" },
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

async function fixTestingRulesFields() {
  try {
    console.log('🔧 修复测试场景规则字段映射...\n');
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const rule of TESTING_RULES_TO_FIX) {
      console.log(`修复规则: ${rule.name} (ID: ${rule.id})`);
      
      try {
        // 构建正确的SQL
        let newSQL = CORRECT_TESTING_SQL;
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
    
    console.log(`🎉 测试规则修复完成！`);
    console.log(`✅ 成功修复: ${fixedCount} 条规则`);
    console.log(`❌ 修复失败: ${errorCount} 条规则\n`);
    
    // 检查数据同步状态
    console.log('🔍 检查测试数据同步状态...');
    await checkTestingDataSync();
    
    // 验证修复结果
    if (fixedCount > 0) {
      console.log('\n🔍 验证修复结果...');
      await validateTestingRules();
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  }
}

async function checkTestingDataSync() {
  try {
    // 检查数据验证API
    const response = await fetch(`${API_BASE_URL}/api/data/validate`);
    const result = await response.json();
    
    if (result.success) {
      console.log('📊 当前数据状态:');
      console.log(`  库存数据: ${result.data.inventory} 条`);
      console.log(`  测试数据: ${result.data.inspection} 条`);
      console.log(`  生产数据: ${result.data.production} 条`);
      console.log(`  批次数据: ${result.data.batches} 条`);
      
      if (result.data.inspection === 0) {
        console.log('\n⚠️  测试数据为空，需要重新同步数据');
        console.log('请在前端数据生成页面重新生成测试数据');
      }
    }
    
  } catch (error) {
    console.error('❌ 检查数据同步状态失败:', error);
  }
}

async function validateTestingRules() {
  try {
    // 测试几个修复后的规则
    const testQueries = [
      '查询测试信息',
      '查询聚龙供应商的测试',
      '查询光学类测试'
    ];
    
    for (const query of testQueries) {
      console.log(`\n测试查询: ${query}`);
      
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
          const requiredFields = ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'];
          const missingFields = requiredFields.filter(field => !(field in firstRecord));
          
          if (missingFields.length === 0) {
            console.log(`  ✅ 所有必要字段都存在`);
            
            // 检查关键字段是否有数据
            console.log(`    测试编号: ${firstRecord.测试编号}`);
            console.log(`    物料编码: ${firstRecord.物料编码}`);
            console.log(`    物料名称: ${firstRecord.物料名称}`);
            console.log(`    供应商: ${firstRecord.供应商}`);
            console.log(`    不合格描述: ${firstRecord.不合格描述}`);
          } else {
            console.log(`  ❌ 缺失字段: ${missingFields.join(', ')}`);
          }
        } else {
          console.log(`  ⚠️  查询成功但无数据，可能需要重新同步测试数据`);
        }
      } else {
        console.log(`  ❌ 查询失败或无数据`);
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
fixTestingRulesFields();
