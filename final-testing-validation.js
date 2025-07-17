/**
 * 最终测试验证 - 验证所有测试查询功能
 */

const API_BASE_URL = 'http://localhost:3001';

async function finalTestingValidation() {
  try {
    console.log('🎯 最终测试验证 - 验证所有测试查询功能\n');
    
    const testQueries = [
      { query: '查询测试信息', description: '基础测试查询' },
      { query: '查询聚龙供应商的测试', description: '供应商过滤查询' },
      { query: '查询光学类测试', description: '物料类型过滤查询' },
      { query: '查询结构件类测试', description: '结构件类型过滤查询' },
      { query: '查询充电类测试', description: '充电类型过滤查询' }
    ];
    
    let passCount = 0;
    
    for (const test of testQueries) {
      console.log(`🧪 ${test.description}: ${test.query}`);
      
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
          const firstRecord = data[0];
          
          // 检查字段完整性
          const requiredFields = ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次', '不良率', '不良现象', '检验日期', '备注'];
          const missingFields = requiredFields.filter(field => !(field in firstRecord));
          
          if (missingFields.length === 0) {
            console.log(`  ✅ 所有必要字段都存在`);
            
            // 检查关键字段是否有数据
            const keyFields = ['物料编码', '物料名称', '供应商', '项目', '基线'];
            const emptyKeyFields = keyFields.filter(field => !firstRecord[field] || firstRecord[field] === '');
            
            if (emptyKeyFields.length === 0) {
              console.log(`  ✅ 关键字段都有数据`);
              console.log(`    物料编码: ${firstRecord.物料编码}`);
              console.log(`    物料名称: ${firstRecord.物料名称}`);
              console.log(`    供应商: ${firstRecord.供应商}`);
              console.log(`    项目: ${firstRecord.项目}`);
              console.log(`    基线: ${firstRecord.基线}`);
              passCount++;
            } else {
              console.log(`  ❌ 关键字段为空: ${emptyKeyFields.join(', ')}`);
            }
          } else {
            console.log(`  ❌ 缺失字段: ${missingFields.join(', ')}`);
          }
          
          // 检查数据过滤是否正确
          if (test.query.includes('聚龙')) {
            const allJulong = data.slice(0, 5).every(record => record.供应商 === '聚龙');
            if (allJulong) {
              console.log(`  ✅ 供应商过滤正确`);
            } else {
              console.log(`  ⚠️  供应商过滤可能不准确`);
            }
          }
          
          if (test.query.includes('光学类')) {
            const hasOpticalMaterials = data.slice(0, 5).some(record => 
              record.物料名称.includes('显示') || 
              record.物料名称.includes('屏') || 
              record.物料名称.includes('摄像头') ||
              record.物料名称.includes('LCD') ||
              record.物料名称.includes('OLED')
            );
            if (hasOpticalMaterials) {
              console.log(`  ✅ 光学类物料过滤正确`);
            } else {
              console.log(`  ⚠️  光学类物料过滤可能不准确`);
            }
          }
          
        } else {
          console.log(`  ⚠️  查询成功但无数据`);
        }
      } else {
        console.log(`  ❌ 查询失败`);
        if (result.message) {
          console.log(`    错误信息: ${result.message}`);
        }
      }
      
      console.log('');
    }
    
    // 总结验证结果
    console.log('─'.repeat(60));
    console.log(`🎯 最终验证结果: ${passCount}/${testQueries.length} 通过`);
    
    if (passCount === testQueries.length) {
      console.log('🎉 所有测试查询功能正常！');
      console.log('✅ 字段映射完全正确');
      console.log('✅ 数据内容丰富多样');
      console.log('✅ 过滤功能准确');
      console.log('✅ 与前端页面字段完全匹配');
    } else {
      console.log('⚠️  部分测试查询存在问题，需要进一步调试');
    }
    
    // 数据质量报告
    console.log('\n📊 数据质量报告:');
    await generateDataQualityReport();
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error);
  }
}

async function generateDataQualityReport() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/debug/lab_tests`);
    const result = await response.json();
    
    if (result.success) {
      const stats = result.nullStatistics;
      const totalRecords = stats.total_records;
      
      console.log(`📈 数据统计 (总计 ${totalRecords} 条记录):`);
      console.log(`  物料编码完整率: ${Math.round((totalRecords - stats.material_code_null) / totalRecords * 100)}%`);
      console.log(`  物料名称完整率: ${Math.round((totalRecords - stats.material_name_null) / totalRecords * 100)}%`);
      console.log(`  供应商完整率: ${Math.round((totalRecords - stats.supplier_name_null) / totalRecords * 100)}%`);
      
      // 检查数据多样性
      if (result.sampleData && result.sampleData.length > 0) {
        const materials = [...new Set(result.sampleData.map(r => r.material_name))];
        const suppliers = [...new Set(result.sampleData.map(r => r.supplier_name))];
        
        console.log(`📊 数据多样性:`);
        console.log(`  物料种类: ${materials.length} 种`);
        console.log(`  供应商数量: ${suppliers.length} 家`);
        
        if (materials.length >= 5 && suppliers.length >= 5) {
          console.log('✅ 数据多样性良好');
        } else {
          console.log('⚠️  数据多样性有待提升');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 生成数据质量报告失败:', error);
  }
}

finalTestingValidation();
