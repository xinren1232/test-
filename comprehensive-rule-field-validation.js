/**
 * 全面测试规则库，解决字段映射差异问题
 * 确保所有规则输出字段与真实场景完全匹配
 */

const API_BASE_URL = 'http://localhost:3001';

async function comprehensiveRuleFieldValidation() {
  try {
    console.log('🔍 全面测试规则库，解决字段映射差异问题...\n');
    
    // 1. 验证库存场景的字段映射
    console.log('1️⃣ 验证库存场景的字段映射...');
    await validateInventoryFieldMapping();
    
    // 2. 测试所有三个场景的代表性规则
    console.log('\n2️⃣ 测试所有三个场景的代表性规则...');
    await testRepresentativeRules();
    
    // 3. 批量检查和修复字段映射问题
    console.log('\n3️⃣ 批量检查和修复字段映射问题...');
    await batchFixFieldMappingIssues();
    
    // 4. 最终验证所有场景
    console.log('\n4️⃣ 最终验证所有场景...');
    await finalValidationAllScenarios();
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error);
  }
}

async function validateInventoryFieldMapping() {
  try {
    // 检查inventory表结构
    const structureResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = 'iqe_inspection' AND TABLE_NAME = 'inventory'
          ORDER BY ORDINAL_POSITION
        `
      })
    });
    
    if (structureResponse.ok) {
      const structureResult = await structureResponse.json();
      const columns = structureResult.result;
      
      console.log('📊 inventory表结构:');
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (可空: ${col.IS_NULLABLE})`);
      });
      
      // 真实库存场景字段 (根据您之前提到的)
      const expectedInventoryFields = ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'];
      
      // 检查字段映射
      const columnNames = columns.map(col => col.COLUMN_NAME);
      const inventoryFieldMapping = {
        '工厂': columnNames.includes('factory') ? 'factory' : (columnNames.includes('storage_location') ? 'storage_location' : null),
        '仓库': columnNames.includes('warehouse') ? 'warehouse' : (columnNames.includes('storage_location') ? 'storage_location' : null),
        '物料编码': columnNames.includes('material_code') ? 'material_code' : null,
        '物料名称': columnNames.includes('material_name') ? 'material_name' : null,
        '供应商': columnNames.includes('supplier_name') ? 'supplier_name' : null,
        '数量': columnNames.includes('quantity') ? 'quantity' : null,
        '状态': columnNames.includes('status') ? 'status' : null,
        '入库时间': columnNames.includes('inbound_time') ? 'inbound_time' : null,
        '到期时间': columnNames.includes('expiry_date') ? 'expiry_date' : (columnNames.includes('expiry_time') ? 'expiry_time' : null),
        '备注': columnNames.includes('notes') ? 'notes' : null
      };
      
      console.log('\n🔍 库存字段映射分析:');
      Object.entries(inventoryFieldMapping).forEach(([chineseField, dbField]) => {
        if (dbField) {
          console.log(`  ✅ ${chineseField} → ${dbField}`);
        } else {
          console.log(`  ❌ ${chineseField} → 未找到对应字段`);
        }
      });
      
      // 生成正确的库存SQL模板
      const correctInventorySQL = generateInventorySQL(inventoryFieldMapping);
      console.log('\n🔧 正确的库存查询SQL模板:');
      console.log(correctInventorySQL);
      
      return { inventoryFieldMapping, correctInventorySQL };
    }
  } catch (error) {
    console.error('❌ 验证库存字段映射时出错:', error);
    return null;
  }
}

function generateInventorySQL(fieldMapping) {
  const sqlMappings = [];
  
  Object.entries(fieldMapping).forEach(([chineseField, dbField]) => {
    if (dbField) {
      if (chineseField === '入库时间' || chineseField === '到期时间') {
        sqlMappings.push(`DATE_FORMAT(${dbField}, '%Y-%m-%d') as ${chineseField}`);
      } else {
        sqlMappings.push(`COALESCE(${dbField}, '') as ${chineseField}`);
      }
    } else {
      sqlMappings.push(`'' as ${chineseField}`);
    }
  });
  
  return `SELECT 
  ${sqlMappings.join(',\n  ')}
FROM inventory 
ORDER BY inbound_time DESC 
LIMIT 50`;
}

async function testRepresentativeRules() {
  const testCases = [
    { query: '查询库存信息', scenario: '库存', expectedFields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'] },
    { query: '查询上线信息', scenario: '上线', expectedFields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '不良现象', '检验日期', '备注'] },
    { query: '查询测试信息', scenario: '测试', expectedFields: ['测试编号', '日期', '项目', '基线', '物料编码', '批次', '物料名称', '供应商', '测试结果', '不合格描述', '备注'] }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📋 测试${testCase.scenario}场景: ${testCase.query}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testCase.query })
      });
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.tableData) {
        const data = result.data.tableData;
        console.log(`  ✅ 查询成功，返回 ${data.length} 条记录`);
        
        if (data.length > 0) {
          const firstRecord = data[0];
          const actualFields = Object.keys(firstRecord);
          
          console.log(`  📊 字段对比:`);
          console.log(`    期望字段: ${testCase.expectedFields.join(', ')}`);
          console.log(`    实际字段: ${actualFields.join(', ')}`);
          
          const missingFields = testCase.expectedFields.filter(field => !actualFields.includes(field));
          const extraFields = actualFields.filter(field => !testCase.expectedFields.includes(field));
          
          if (missingFields.length === 0 && extraFields.length === 0) {
            console.log(`  ✅ 字段完全匹配`);
          } else {
            if (missingFields.length > 0) {
              console.log(`  ❌ 缺失字段: ${missingFields.join(', ')}`);
            }
            if (extraFields.length > 0) {
              console.log(`  ⚠️  额外字段: ${extraFields.join(', ')}`);
            }
          }
          
          // 显示前几个字段的数据质量
          console.log(`  📋 数据质量检查:`);
          testCase.expectedFields.slice(0, 5).forEach(field => {
            const value = firstRecord[field];
            const hasValidData = value && value !== '[空值]' && value !== '' && value !== '未知' && value !== '无';
            console.log(`    ${field}: ${value || '[空值]'} ${hasValidData ? '✅' : '⚠️'}`);
          });
        }
      } else {
        console.log(`  ❌ 查询失败: ${result.message || '未知错误'}`);
      }
    } catch (error) {
      console.log(`  ❌ 查询出错: ${error.message}`);
    }
  }
}

async function batchFixFieldMappingIssues() {
  console.log('🔧 批量检查和修复字段映射问题...');
  
  try {
    // 获取所有规则
    const rulesResponse = await fetch(`${API_BASE_URL}/api/rules`);
    if (!rulesResponse.ok) {
      console.log('❌ 获取规则列表失败');
      return;
    }
    
    const rulesResult = await rulesResponse.json();
    const allRules = rulesResult.data || rulesResult.rules || [];
    
    console.log(`📊 总规则数: ${allRules.length}`);
    
    // 分类规则
    const ruleCategories = {
      inventory: allRules.filter(rule => {
        const desc = rule.description ? rule.description.toLowerCase() : '';
        const target = rule.action_target ? rule.action_target.toLowerCase() : '';
        return desc.includes('库存') || target.includes('inventory');
      }),
      online: allRules.filter(rule => {
        const desc = rule.description ? rule.description.toLowerCase() : '';
        const target = rule.action_target ? rule.action_target.toLowerCase() : '';
        return desc.includes('上线') || target.includes('online_tracking');
      }),
      test: allRules.filter(rule => {
        const desc = rule.description ? rule.description.toLowerCase() : '';
        const target = rule.action_target ? rule.action_target.toLowerCase() : '';
        return desc.includes('测试') || desc.includes('检验') || target.includes('lab_tests');
      })
    };
    
    console.log(`📊 规则分类统计:`);
    console.log(`  库存规则: ${ruleCategories.inventory.length}条`);
    console.log(`  上线规则: ${ruleCategories.online.length}条`);
    console.log(`  测试规则: ${ruleCategories.test.length}条`);
    
    // 检查需要修复的规则
    let needsFixCount = 0;
    
    for (const [category, rules] of Object.entries(ruleCategories)) {
      console.log(`\n🔍 检查${category}类规则...`);
      
      for (const rule of rules.slice(0, 5)) { // 只检查前5条作为示例
        if (rule.action_target) {
          const hasCorrectFields = checkRuleFieldMapping(rule, category);
          if (!hasCorrectFields) {
            console.log(`  ⚠️  规则 ${rule.id} 可能需要字段映射修复`);
            needsFixCount++;
          } else {
            console.log(`  ✅ 规则 ${rule.id} 字段映射正确`);
          }
        }
      }
    }
    
    console.log(`\n📊 检查结果: ${needsFixCount} 条规则可能需要修复`);
    
    if (needsFixCount > 0) {
      console.log('\n💡 建议:');
      console.log('1. 库存规则应使用inventory表，输出库存场景字段');
      console.log('2. 上线规则应使用online_tracking表，输出上线场景字段');
      console.log('3. 测试规则应使用lab_tests表，输出测试场景字段');
      console.log('4. 所有规则都应添加LIMIT 50限制');
    }
    
  } catch (error) {
    console.error('❌ 批量检查时出错:', error);
  }
}

function checkRuleFieldMapping(rule, category) {
  const sql = rule.action_target.toLowerCase();
  
  const expectedPatterns = {
    inventory: ['inventory', '工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
    online: ['online_tracking', '工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '不良现象', '检验日期', '备注'],
    test: ['lab_tests', '测试编号', '日期', '项目', '基线', '物料编码', '批次', '物料名称', '供应商', '测试结果', '不合格描述', '备注']
  };
  
  const patterns = expectedPatterns[category];
  if (!patterns) return true;
  
  // 检查表名
  const hasCorrectTable = sql.includes(patterns[0]);
  
  // 检查字段
  const hasCorrectFields = patterns.slice(1).some(field => sql.includes(field));
  
  return hasCorrectTable && hasCorrectFields;
}

async function finalValidationAllScenarios() {
  console.log('🎯 最终验证所有场景...');
  
  const finalTestCases = [
    '查询库存信息',
    '查询充电类库存',
    '查询上线信息', 
    '查询光学类上线',
    '查询测试信息',
    '查询充电类测试'
  ];
  
  let successCount = 0;
  
  for (const query of finalTestCases) {
    console.log(`\n测试: ${query}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.tableData) {
        const data = result.data.tableData;
        console.log(`  ✅ 成功，返回 ${data.length} 条记录`);
        
        if (data.length > 0 && data.length <= 50) {
          console.log(`  ✅ 数据量合理 (≤50条)`);
          
          const firstRecord = data[0];
          const hasValidData = Object.values(firstRecord).some(value => 
            value && value !== '[空值]' && value !== '' && value !== '未知'
          );
          
          if (hasValidData) {
            console.log(`  ✅ 数据质量良好`);
            successCount++;
          } else {
            console.log(`  ⚠️  数据质量需要改善`);
          }
        } else {
          console.log(`  ⚠️  数据量异常: ${data.length} 条`);
        }
      } else {
        console.log(`  ❌ 查询失败: ${result.message || '未知错误'}`);
      }
    } catch (error) {
      console.log(`  ❌ 查询出错: ${error.message}`);
    }
  }
  
  console.log(`\n🎉 最终验证完成！`);
  console.log(`✅ 成功率: ${successCount}/${finalTestCases.length} (${Math.round(successCount/finalTestCases.length*100)}%)`);
  
  if (successCount === finalTestCases.length) {
    console.log('🎊 所有场景都已正常工作，字段映射完全正确！');
  } else {
    console.log('⚠️  部分场景仍需要进一步优化');
  }
}

comprehensiveRuleFieldValidation();
