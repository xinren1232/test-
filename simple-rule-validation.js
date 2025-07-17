/**
 * 简化的规则验证脚本
 * 测试三个场景的代表性查询，确认字段映射是否正确
 */

const API_BASE_URL = 'http://localhost:3001';

async function simpleRuleValidation() {
  try {
    console.log('🔍 简化的规则验证测试...\n');
    
    // 测试三个场景的代表性查询
    const testCases = [
      { 
        query: '查询库存信息', 
        scenario: '库存',
        expectedFields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注']
      },
      { 
        query: '查询上线信息', 
        scenario: '上线',
        expectedFields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '不良现象', '检验日期', '备注']
      },
      { 
        query: '查询测试信息', 
        scenario: '测试',
        expectedFields: ['测试编号', '日期', '项目', '基线', '物料编码', '批次', '物料名称', '供应商', '测试结果', '不合格描述', '备注']
      }
    ];
    
    let successCount = 0;
    
    for (const testCase of testCases) {
      console.log(`📋 测试${testCase.scenario}场景: ${testCase.query}`);
      
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
              successCount++;
            } else {
              if (missingFields.length > 0) {
                console.log(`  ❌ 缺失字段: ${missingFields.join(', ')}`);
              }
              if (extraFields.length > 0) {
                console.log(`  ⚠️  额外字段: ${extraFields.join(', ')}`);
              }
            }
            
            // 显示数据质量
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
      
      console.log(''); // 空行分隔
    }
    
    console.log(`🎉 验证完成！`);
    console.log(`✅ 字段完全匹配的场景: ${successCount}/3`);
    
    if (successCount === 3) {
      console.log('🎊 所有场景字段映射都正确！');
    } else {
      console.log('⚠️  部分场景需要进一步修复');
      
      // 提供修复建议
      console.log('\n💡 修复建议:');
      if (successCount < 3) {
        console.log('1. 检查库存规则是否使用正确的inventory表');
        console.log('2. 确认所有规则的字段映射与前端场景完全一致');
        console.log('3. 验证数据同步是否正确');
      }
    }
    
    // 额外测试：检查数据量限制
    console.log('\n🔍 检查数据量限制...');
    await testDataLimits();
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error);
  }
}

async function testDataLimits() {
  const queries = ['查询库存信息', '查询上线信息', '查询测试信息'];
  
  for (const query of queries) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.tableData) {
        const data = result.data.tableData;
        
        if (data.length <= 50) {
          console.log(`  ✅ ${query}: ${data.length}条 (LIMIT生效)`);
        } else {
          console.log(`  ❌ ${query}: ${data.length}条 (超出限制)`);
        }
      }
    } catch (error) {
      console.log(`  ❌ ${query}: 查询出错`);
    }
  }
}

simpleRuleValidation();
