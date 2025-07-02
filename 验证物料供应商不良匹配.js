/**
 * 验证物料-供应商-不良匹配规则
 * 检查数据生成是否按照正确的业务规则进行匹配
 */

console.log('🔍 开始验证物料-供应商-不良匹配规则...\n');

try {
  // 导入相关模块
  const { getAllMaterials, getRandomSupplierForMaterial } = await import('./ai-inspection-dashboard/src/data/material_supplier_mapping.js');
  const { materialSuppliers, materialDefects } = await import('./ai-inspection-dashboard/src/data/MaterialData.js');
  
  console.log('✅ 模块导入成功\n');
  
  // 1. 检查物料列表
  console.log('📋 1. 检查物料列表:');
  const allMaterials = getAllMaterials();
  console.log(`  总物料数量: ${allMaterials.length}`);
  console.log('  前10个物料:');
  allMaterials.slice(0, 10).forEach((material, index) => {
    console.log(`    ${index + 1}. ${material.name} (${material.category})`);
  });
  
  // 2. 检查物料-供应商匹配
  console.log('\n🏭 2. 检查物料-供应商匹配:');
  const materialSupplierCheck = {};
  
  allMaterials.slice(0, 5).forEach(material => {
    const supplier = getRandomSupplierForMaterial(material.name);
    materialSupplierCheck[material.name] = supplier;
    console.log(`  ${material.name} -> ${supplier}`);
  });
  
  // 3. 检查简化物料名称映射
  console.log('\n🔄 3. 检查物料名称映射:');
  
  // 模拟物料名称映射逻辑
  const MATERIAL_NAME_MAPPING = {
    "手机壳料-后盖": "电池盖",
    "手机壳料-中框": "中框", 
    "手机卡托": "手机卡托",
    "侧键": "侧键",
    "装饰件": "装饰件",
    "LCD屏幕": "LCD显示屏",
    "OLED屏幕": "OLED显示屏",
    "CAM摄像头模组": "摄像头模组",
    "电声(喇叭/听筒)": "扬声器",
    "电池": "电池",
    "充电器": "充电器",
    "包材(彩盒/泡棉等)": "包装盒"
  };
  
  function getSimplifiedMaterialName(materialName) {
    return MATERIAL_NAME_MAPPING[materialName] || materialName;
  }
  
  allMaterials.slice(0, 8).forEach(material => {
    const simplified = getSimplifiedMaterialName(material.name);
    console.log(`  ${material.name} -> ${simplified}`);
  });
  
  // 4. 检查不良现象匹配
  console.log('\n⚠️ 4. 检查不良现象匹配:');
  
  allMaterials.slice(0, 8).forEach(material => {
    const simplified = getSimplifiedMaterialName(material.name);
    const defects = materialDefects[simplified];
    
    if (defects) {
      console.log(`  ✅ ${material.name} -> ${simplified}: [${defects.slice(0, 3).join(', ')}...]`);
    } else {
      console.log(`  ❌ ${material.name} -> ${simplified}: 未找到不良现象定义`);
    }
  });
  
  // 5. 检查MaterialData.js中的供应商匹配
  console.log('\n🏪 5. 检查MaterialData.js中的供应商匹配:');
  
  const materialDataSuppliers = Object.keys(materialSuppliers).slice(0, 5);
  materialDataSuppliers.forEach(material => {
    const suppliers = materialSuppliers[material];
    console.log(`  ${material}: [${suppliers.join(', ')}]`);
  });
  
  // 6. 检查不一致性
  console.log('\n🔍 6. 检查数据一致性:');
  
  let inconsistencies = 0;
  
  // 检查是否所有简化物料名称都有对应的不良现象定义
  const uniqueSimplifiedNames = new Set();
  allMaterials.forEach(material => {
    const simplified = getSimplifiedMaterialName(material.name);
    uniqueSimplifiedNames.add(simplified);
  });
  
  console.log('  简化物料名称覆盖检查:');
  Array.from(uniqueSimplifiedNames).forEach(simplifiedName => {
    if (!materialDefects[simplifiedName]) {
      console.log(`    ❌ 缺少不良现象定义: ${simplifiedName}`);
      inconsistencies++;
    } else {
      console.log(`    ✅ ${simplifiedName}: ${materialDefects[simplifiedName].length}种不良现象`);
    }
  });
  
  // 7. 生成修复建议
  console.log('\n💡 7. 修复建议:');
  
  if (inconsistencies === 0) {
    console.log('  ✅ 所有物料-供应商-不良匹配规则都正确配置');
  } else {
    console.log(`  ❌ 发现 ${inconsistencies} 个不一致问题`);
    console.log('  建议修复措施:');
    console.log('    1. 完善物料名称映射表，确保所有物料都有对应的简化名称');
    console.log('    2. 为缺失的简化物料名称添加不良现象定义');
    console.log('    3. 统一使用MaterialData.js作为唯一的数据源');
    console.log('    4. 删除重复的物料-供应商-不良定义');
  }
  
  // 8. 测试数据生成
  console.log('\n🧪 8. 测试数据生成:');
  
  try {
    const { generateCompleteDataset } = await import('./ai-inspection-dashboard/src/data/data_generator.js');
    
    console.log('  正在生成测试数据集...');
    const dataset = generateCompleteDataset();
    
    console.log(`  ✅ 数据生成成功:`);
    console.log(`    库存: ${dataset.inventory.length} 条`);
    console.log(`    测试: ${dataset.inspection.length} 条`);
    console.log(`    生产: ${dataset.production.length} 条`);
    
    // 检查第一条记录的匹配情况
    if (dataset.inventory.length > 0) {
      const firstItem = dataset.inventory[0];
      console.log(`  第一条库存记录:`);
      console.log(`    物料: ${firstItem.material_name}`);
      console.log(`    供应商: ${firstItem.supplier}`);
      
      // 检查对应的测试记录
      const testRecords = dataset.inspection.filter(item => item.batch_code === firstItem.batch_code);
      if (testRecords.length > 0) {
        const failedTest = testRecords.find(test => test.test_result === 'FAIL');
        if (failedTest) {
          console.log(`    不良现象: ${failedTest.defect_description || '无'}`);
        }
      }
    }
    
  } catch (error) {
    console.log(`  ❌ 数据生成测试失败: ${error.message}`);
  }
  
  console.log('\n🎉 物料-供应商-不良匹配验证完成!');
  
} catch (error) {
  console.error('❌ 验证过程中出错:', error);
  console.error('错误详情:', error.stack);
}
