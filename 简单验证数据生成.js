/**
 * 简单验证数据生成规则
 */

console.log('🔍 开始验证数据生成规则...');

try {
  // 动态导入数据生成器
  const { generateCompleteDataset } = await import('./ai-inspection-dashboard/src/data/data_generator.js');
  
  console.log('✅ 数据生成器导入成功');
  
  // 生成数据集
  const dataset = generateCompleteDataset();
  
  console.log('📊 数据生成统计:');
  console.log(`  库存数据: ${dataset.inventory.length} 条`);
  console.log(`  测试数据: ${dataset.inspection.length} 条`);
  console.log(`  生产数据: ${dataset.production.length} 条`);
  
  // 验证每个批次的记录数量
  const batchStats = {};
  
  // 统计每个批次的记录数
  dataset.inventory.forEach(item => {
    const batchCode = item.batch_code;
    if (!batchStats[batchCode]) {
      batchStats[batchCode] = { inventory: 0, inspection: 0, production: 0 };
    }
    batchStats[batchCode].inventory++;
  });
  
  dataset.inspection.forEach(item => {
    const batchCode = item.batch_code;
    if (batchStats[batchCode]) {
      batchStats[batchCode].inspection++;
    }
  });
  
  dataset.production.forEach(item => {
    const batchCode = item.batch_code;
    if (batchStats[batchCode]) {
      batchStats[batchCode].production++;
    }
  });
  
  // 检查前3个批次
  const batchCodes = Object.keys(batchStats).slice(0, 3);
  console.log('\n📋 前3个批次的记录统计:');
  
  let allCorrect = true;
  batchCodes.forEach(batchCode => {
    const stats = batchStats[batchCode];
    const testOk = stats.inspection === 3;
    const prodOk = stats.production === 8;
    
    console.log(`  批次 ${batchCode}:`);
    console.log(`    测试: ${stats.inspection} 条 ${testOk ? '✅' : '❌ (应为3条)'}`);
    console.log(`    生产: ${stats.production} 条 ${prodOk ? '✅' : '❌ (应为8条)'}`);
    
    if (!testOk || !prodOk) {
      allCorrect = false;
    }
  });
  
  console.log(`\n🎯 验证结果: ${allCorrect ? '✅ 所有批次记录数量正确' : '❌ 存在记录数量不正确的批次'}`);
  
  // 检查时间字段
  if (dataset.inspection.length > 0 && dataset.production.length > 0) {
    const sampleTest = dataset.inspection[0];
    const sampleProd = dataset.production[0];
    
    console.log('\n⏰ 时间字段检查:');
    console.log(`  测试时间字段: ${sampleTest.testDate ? '✅' : '❌'}`);
    console.log(`  生产时间字段: ${sampleProd.online_time || sampleProd.onlineDate ? '✅' : '❌'}`);
  }
  
  console.log('\n🎉 数据生成规则验证完成!');
  
} catch (error) {
  console.error('❌ 验证过程中出错:', error);
  console.error('错误详情:', error.stack);
}
