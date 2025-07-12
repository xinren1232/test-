/**
 * 调试批次统计问题
 */

async function debugBatchCount() {
  console.log('🔍 调试批次统计问题...\n');
  
  try {
    const response = await fetch('http://localhost:3002/api/intelligent-qa/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: '查询结构件类库存'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ 查询成功`);
      console.log(`📊 数据量: ${result.data.dataCount} 条记录`);
      
      // 检查返回的表格数据
      if (result.data.tableData && result.data.tableData.length > 0) {
        console.log('\n📋 前10条查询结果:');
        const sampleData = result.data.tableData.slice(0, 10);
        
        const materialTypes = new Set();
        const batchCodes = new Set();
        const suppliers = new Set();
        
        sampleData.forEach((item, index) => {
          console.log(`${index + 1}. 物料: ${item.material_name || item.物料名称}, 批次: ${item.batch_code || item.批次号}, 供应商: ${item.supplier_name || item.供应商}`);
          
          if (item.material_name || item.物料名称) {
            materialTypes.add(item.material_name || item.物料名称);
          }
          if (item.batch_code || item.批次号) {
            batchCodes.add(item.batch_code || item.批次号);
          }
          if (item.supplier_name || item.供应商) {
            suppliers.add(item.supplier_name || item.供应商);
          }
        });
        
        console.log('\n📊 统计结果 (前10条):');
        console.log(`物料种类: ${materialTypes.size}`);
        console.log(`批次种类: ${batchCodes.size}`);
        console.log(`供应商: ${suppliers.size}`);
        
        console.log('\n📦 物料种类列表:');
        Array.from(materialTypes).forEach((material, index) => {
          console.log(`  ${index + 1}. ${material}`);
        });
        
        console.log('\n🏷️ 批次列表:');
        Array.from(batchCodes).forEach((batch, index) => {
          console.log(`  ${index + 1}. ${batch}`);
        });
      }
      
      // 检查卡片数据
      if (result.data.cards && result.data.cards.length > 0) {
        console.log('\n🎴 卡片数据:');
        const firstCard = result.data.cards[0];
        if (firstCard.splitData) {
          console.log(`第一个卡片 - 物料: ${firstCard.splitData.material.value}${firstCard.splitData.material.unit}, 批次: ${firstCard.splitData.batch.value}${firstCard.splitData.batch.unit}`);
        }
      }
      
    } else {
      console.log(`❌ 查询失败: ${result.data?.answer || '未知错误'}`);
    }
    
  } catch (error) {
    console.log(`❌ 请求失败: ${error.message}`);
  }
}

debugBatchCount().catch(console.error);
