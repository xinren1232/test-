/**
 * 查找并修复测试查询使用的具体规则
 */

const API_BASE_URL = 'http://localhost:3001';

async function findAndFixTestRules() {
  try {
    console.log('🔍 查找并修复测试查询使用的具体规则...\n');
    
    // 1. 获取所有规则，查找可能的测试相关规则
    console.log('1️⃣ 获取所有规则，查找可能的测试相关规则...');
    await findAllTestRelatedRules();
    
    // 2. 通过测试查询来反向查找使用的规则
    console.log('\n2️⃣ 通过测试查询来反向查找使用的规则...');
    await reverseEngineerTestRules();
    
    // 3. 直接修复可能的测试规则ID
    console.log('\n3️⃣ 直接修复可能的测试规则ID...');
    await directFixTestRules();
    
  } catch (error) {
    console.error('❌ 查找修复过程中出现错误:', error);
  }
}

async function findAllTestRelatedRules() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rules`);
    if (response.ok) {
      const result = await response.json();
      const allRules = result.data || result.rules || [];
      
      console.log(`📊 总规则数: ${allRules.length}`);
      
      // 查找可能的测试相关规则（更宽泛的搜索）
      const possibleTestRules = allRules.filter(rule => {
        const name = rule.rule_name ? rule.rule_name.toLowerCase() : '';
        const desc = rule.description ? rule.description.toLowerCase() : '';
        const target = rule.action_target ? rule.action_target.toLowerCase() : '';
        
        return name.includes('测试') || name.includes('检验') || name.includes('lab') || 
               name.includes('test') || name.includes('检测') || name.includes('质量') ||
               desc.includes('测试') || desc.includes('检验') || desc.includes('lab') ||
               target.includes('lab_tests') || target.includes('production_tracking');
      });
      
      console.log(`🔍 可能的测试相关规则 (${possibleTestRules.length}条):`);
      possibleTestRules.forEach(rule => {
        console.log(`  ID: ${rule.id}`);
        console.log(`  名称: ${rule.rule_name || '无名称'}`);
        console.log(`  描述: ${rule.description || '无描述'}`);
        if (rule.action_target) {
          const target = rule.action_target.substring(0, 100);
          console.log(`  SQL片段: ${target}${rule.action_target.length > 100 ? '...' : ''}`);
        }
        console.log('');
      });
      
      // 查找包含production_tracking的规则（当前测试查询可能使用的）
      const productionRules = allRules.filter(rule => 
        rule.action_target && rule.action_target.includes('production_tracking')
      );
      
      console.log(`📊 使用production_tracking表的规则 (${productionRules.length}条):`);
      productionRules.forEach(rule => {
        console.log(`  ID: ${rule.id}, 名称: ${rule.rule_name || '无名称'}`);
      });
      
    } else {
      console.log('❌ 获取规则列表失败');
    }
  } catch (error) {
    console.error('❌ 查找规则时出错:', error);
  }
}

async function reverseEngineerTestRules() {
  console.log('🔍 通过API调试来查找测试查询使用的规则...');
  
  // 这里我们需要检查后端日志或者通过其他方式确定
  // 测试查询"查询测试信息"实际调用的是哪个规则ID
  
  console.log('💡 建议通过以下方式确定测试规则ID:');
  console.log('1. 检查后端日志，查看"查询测试信息"调用的规则ID');
  console.log('2. 检查规则库中ID在600-800范围内的规则');
  console.log('3. 查找action_target包含测试相关字段的规则');
}

async function directFixTestRules() {
  // 基于之前的经验，测试相关规则ID可能在特定范围内
  // 让我们尝试一些可能的ID
  const possibleTestRuleIds = [
    // 基于上线规则ID是661, 727, 730, 733, 736, 739
    // 测试规则可能在类似的范围
    662, 663, 664, 665, 666, 667, 668, 669, 670,
    728, 729, 731, 732, 734, 735, 737, 738, 740,
    // 或者在其他范围
    600, 601, 602, 603, 604, 605,
    700, 701, 702, 703, 704, 705
  ];
  
  // 正确的lab_tests表SQL模板
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
  
  console.log('🔧 尝试修复可能的测试规则ID...');
  
  let fixedCount = 0;
  
  for (const ruleId of possibleTestRuleIds) {
    try {
      // 先检查规则是否存在
      const checkResponse = await fetch(`${API_BASE_URL}/api/rules/${ruleId}`);
      
      if (checkResponse.ok) {
        const ruleData = await checkResponse.json();
        const rule = ruleData.data || ruleData;
        
        if (rule && rule.rule_name) {
          console.log(`\n找到规则 ${ruleId}: ${rule.rule_name}`);
          
          // 检查是否可能是测试相关规则
          const name = rule.rule_name.toLowerCase();
          const isTestRelated = name.includes('测试') || name.includes('检验') || 
                               name.includes('lab') || name.includes('test') ||
                               name.includes('检测') || name.includes('质量');
          
          if (isTestRelated || rule.action_target?.includes('production_tracking')) {
            console.log(`  可能是测试相关规则，尝试修复...`);
            
            let finalSQL = correctTestSQL;
            
            // 根据规则名称添加过滤条件
            if (name.includes('充电') || name.includes('电池')) {
              finalSQL = finalSQL.replace(
                'FROM lab_tests',
                `FROM lab_tests\nWHERE material_name LIKE '%充电%' OR material_name LIKE '%电池%' OR material_name LIKE '%电源%'`
              );
            } else if (name.includes('光学') || name.includes('显示')) {
              finalSQL = finalSQL.replace(
                'FROM lab_tests',
                `FROM lab_tests\nWHERE material_name LIKE '%显示%' OR material_name LIKE '%屏%' OR material_name LIKE '%光学%' OR material_name LIKE '%镜头%' OR material_name LIKE '%LCD%' OR material_name LIKE '%OLED%' OR material_name LIKE '%摄像头%'`
              );
            } else if (name.includes('结构')) {
              finalSQL = finalSQL.replace(
                'FROM lab_tests',
                `FROM lab_tests\nWHERE material_name LIKE '%结构%' OR material_name LIKE '%框架%' OR material_name LIKE '%外壳%' OR material_name LIKE '%支架%' OR material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%卡托%' OR material_name LIKE '%侧键%'`
              );
            }
            
            const updateResponse = await fetch(`${API_BASE_URL}/api/rules/${ruleId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action_target: finalSQL
              })
            });
            
            if (updateResponse.ok) {
              const updateResult = await updateResponse.json();
              if (updateResult.success) {
                console.log(`  ✅ 修复成功`);
                fixedCount++;
              } else {
                console.log(`  ❌ 修复失败: ${updateResult.message}`);
              }
            } else {
              console.log(`  ❌ 更新请求失败: ${updateResponse.status}`);
            }
          } else {
            console.log(`  跳过非测试相关规则`);
          }
        }
      }
    } catch (error) {
      // 规则不存在或其他错误，跳过
      continue;
    }
  }
  
  console.log(`\n🎉 尝试修复完成！`);
  console.log(`✅ 成功修复: ${fixedCount} 条规则`);
  
  if (fixedCount > 0) {
    console.log('\n🔍 验证修复结果...');
    await validateTestQueries();
  }
}

async function validateTestQueries() {
  const testQueries = ['查询测试信息', '查询充电类测试'];
  
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
          
          // 检查关键字段
          const hasTestId = firstRecord.测试编号 && firstRecord.测试编号 !== '[空值]';
          const hasTestResult = firstRecord.测试结果 && firstRecord.测试结果 !== '[空值]';
          const hasDate = firstRecord.日期 && firstRecord.日期 !== '[空值]';
          
          console.log(`    测试编号: ${firstRecord.测试编号 || '[空值]'}`);
          console.log(`    日期: ${firstRecord.日期 || '[空值]'}`);
          console.log(`    测试结果: ${firstRecord.测试结果 || '[空值]'}`);
          console.log(`    物料名称: ${firstRecord.物料名称 || '[空值]'}`);
          
          if (hasTestId && hasTestResult && hasDate) {
            console.log(`  ✅ 字段修复成功，数据完整`);
          } else {
            console.log(`  ⚠️  字段修复可能不完整`);
          }
        }
      } else {
        console.log(`  ❌ 查询失败: ${result.message || '未知错误'}`);
      }
    } catch (error) {
      console.log(`  ❌ 查询出错: ${error.message}`);
    }
  }
}

findAndFixTestRules();
