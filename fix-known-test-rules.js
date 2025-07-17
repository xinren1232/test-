/**
 * 修复已知的测试规则，使用正确的lab_tests表和字段映射
 */

const API_BASE_URL = 'http://localhost:3001';

async function fixKnownTestRules() {
  try {
    console.log('🔧 修复已知的测试规则...\n');
    
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
    
    // 已知的测试规则列表
    const testRules = [
      { id: 660, name: '测试基本信息查询', type: 'basic' },
      { id: 726, name: '结构件类测试查询', type: 'category', filter: "WHERE material_name LIKE '%结构%' OR material_name LIKE '%框架%' OR material_name LIKE '%外壳%' OR material_name LIKE '%支架%' OR material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%'" },
      { id: 729, name: '光学类测试查询', type: 'category', filter: "WHERE material_name LIKE '%显示%' OR material_name LIKE '%屏%' OR material_name LIKE '%光学%' OR material_name LIKE '%镜头%' OR material_name LIKE '%LCD%' OR material_name LIKE '%OLED%' OR material_name LIKE '%摄像头%'" },
      { id: 732, name: '充电类测试查询', type: 'category', filter: "WHERE material_name LIKE '%充电%' OR material_name LIKE '%电池%' OR material_name LIKE '%电源%'" },
      { id: 735, name: '声学类测试查询', type: 'category', filter: "WHERE material_name LIKE '%扬声器%' OR material_name LIKE '%听筒%' OR material_name LIKE '%麦克风%' OR material_name LIKE '%音频%' OR material_name LIKE '%喇叭%'" },
      { id: 738, name: '包装类测试查询', type: 'category', filter: "WHERE material_name LIKE '%包装%' OR material_name LIKE '%保护套%' OR material_name LIKE '%标签%' OR material_name LIKE '%盒子%'" }
    ];
    
    // 供应商测试规则
    const supplierTestRules = [
      { id: 663, name: 'BOE供应商测试查询', supplier: 'BOE' },
      { id: 666, name: '东声供应商测试查询', supplier: '东声' },
      { id: 669, name: '丽德宝供应商测试查询', supplier: '丽德宝' },
      { id: 672, name: '华星供应商测试查询', supplier: '华星' },
      { id: 675, name: '天实供应商测试查询', supplier: '天实' },
      { id: 678, name: '天马供应商测试查询', supplier: '天马' },
      { id: 681, name: '奥海供应商测试查询', supplier: '奥海' },
      { id: 684, name: '富群供应商测试查询', supplier: '富群' },
      { id: 687, name: '广正供应商测试查询', supplier: '广正' },
      { id: 690, name: '怡同供应商测试查询', supplier: '怡同' },
      { id: 693, name: '欣冠供应商测试查询', supplier: '欣冠' },
      { id: 696, name: '歌尔供应商测试查询', supplier: '歌尔' },
      { id: 699, name: '深奥供应商测试查询', supplier: '深奥' },
      { id: 702, name: '理威供应商测试查询', supplier: '理威' },
      { id: 705, name: '瑞声供应商测试查询', supplier: '瑞声' },
      { id: 708, name: '百佳达供应商测试查询', supplier: '百佳达' },
      { id: 711, name: '盛泰供应商测试查询', supplier: '盛泰' },
      { id: 714, name: '维科供应商测试查询', supplier: '维科' },
      { id: 717, name: '聚龙供应商测试查询', supplier: '聚龙' },
      { id: 720, name: '辉阳供应商测试查询', supplier: '辉阳' },
      { id: 723, name: '风华供应商测试查询', supplier: '风华' }
    ];
    
    let fixedCount = 0;
    
    // 修复基本和类别测试规则
    console.log('1️⃣ 修复基本和类别测试规则...');
    for (const rule of testRules) {
      console.log(`修复规则: ${rule.name} (ID: ${rule.id})`);
      
      try {
        let finalSQL = correctTestSQL;
        
        // 添加过滤条件
        if (rule.filter) {
          finalSQL = finalSQL.replace(
            'FROM lab_tests',
            `FROM lab_tests\n${rule.filter}`
          );
          console.log(`  添加过滤条件`);
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
    
    // 修复供应商测试规则
    console.log('\n2️⃣ 修复供应商测试规则...');
    for (const rule of supplierTestRules) {
      console.log(`修复规则: ${rule.name} (ID: ${rule.id})`);
      
      try {
        let finalSQL = correctTestSQL.replace(
          'FROM lab_tests',
          `FROM lab_tests\nWHERE supplier_name = '${rule.supplier}'`
        );
        
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
    
    // 验证修复结果
    if (fixedCount > 0) {
      console.log('\n3️⃣ 验证修复结果...');
      await validateTestRules();
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  }
}

async function validateTestRules() {
  const testQueries = [
    '查询测试信息',
    '查询充电类测试',
    '查询光学类测试',
    '查询聚龙供应商测试'
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
          
          console.log(`  📋 字段验证:`);
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
          const hasValidData = firstRecord.测试编号 && firstRecord.测试编号.startsWith('TEST-') &&
                              firstRecord.物料名称 && firstRecord.供应商 && 
                              firstRecord.测试结果 && (firstRecord.测试结果 === 'PASS' || firstRecord.测试结果 === 'FAIL');
          
          if (hasValidData) {
            console.log(`  ✅ 数据质量优秀，包含真实测试信息`);
          } else {
            console.log(`  ⚠️  数据质量需要改善`);
          }
          
          // 检查过滤效果
          if (query.includes('充电类')) {
            const hasChargingMaterials = data.slice(0, 3).some(record => 
              record.物料名称 && (record.物料名称.includes('充电') || record.物料名称.includes('电池') || record.物料名称.includes('电源'))
            );
            if (hasChargingMaterials) {
              console.log(`  ✅ 充电类过滤正确`);
            } else {
              console.log(`  ⚠️  充电类过滤可能不准确`);
            }
          }
          
          if (query.includes('光学类')) {
            const hasOpticalMaterials = data.slice(0, 3).some(record => 
              record.物料名称 && (record.物料名称.includes('显示') || record.物料名称.includes('屏') || 
                                record.物料名称.includes('摄像头') || record.物料名称.includes('LCD') || 
                                record.物料名称.includes('OLED'))
            );
            if (hasOpticalMaterials) {
              console.log(`  ✅ 光学类过滤正确`);
            } else {
              console.log(`  ⚠️  光学类过滤可能不准确`);
            }
          }
          
          if (query.includes('聚龙')) {
            const hasJulongSupplier = data.slice(0, 3).every(record => 
              record.供应商 === '聚龙'
            );
            if (hasJulongSupplier) {
              console.log(`  ✅ 聚龙供应商过滤正确`);
            } else {
              console.log(`  ⚠️  聚龙供应商过滤可能不准确`);
            }
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

fixKnownTestRules();
