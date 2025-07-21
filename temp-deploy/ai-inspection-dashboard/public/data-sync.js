
// 前端数据同步脚本 - 自动生成于 2025-07-17T21:12:59.681Z
// 这个脚本将生成的数据同步到前端localStorage

(function() {
  console.log('🔄 开始同步生成的数据到前端localStorage...');
  
  // 库存数据
  const inventoryData = [
  {
    "id": "INV_001",
    "remark": "-",
    "status": "正常",
    "factory": "重庆工厂",
    "quantity": 294,
    "supplier": "广正",
    "batchCode": "105281",
    "shelfLife": "2025-12-26",
    "warehouse": "重庆库存",
    "materialCode": "CS-广1083",
    "materialName": "电容",
    "inspectionDate": "2025-08-26"
  },
  {
    "id": "INV_002",
    "remark": "需要重点关注",
    "status": "风险",
    "factory": "深圳工厂",
    "quantity": 1500,
    "supplier": "黑龙",
    "batchCode": "411013",
    "shelfLife": "2025-11-15",
    "warehouse": "深圳库存",
    "materialCode": "CS-B-第2236",
    "materialName": "电容",
    "inspectionDate": "2025-06-15"
  },
  {
    "id": "INV_003",
    "remark": "高端显示屏",
    "status": "正常",
    "factory": "东莞工厂",
    "quantity": 150,
    "supplier": "聚龙光电",
    "batchCode": "JL20250115",
    "shelfLife": "2025-07-15",
    "warehouse": "东莞库存",
    "materialCode": "OLED-聚龙-001",
    "materialName": "OLED显示屏",
    "inspectionDate": "2025-01-15"
  },
  {
    "id": "INV_004",
    "remark": "触控芯片",
    "status": "正常",
    "factory": "苏州工厂",
    "quantity": 500,
    "supplier": "BOE科技",
    "batchCode": "BOE20250117",
    "shelfLife": "2025-12-17",
    "warehouse": "苏州库存",
    "materialCode": "IC-BOE-8719",
    "materialName": "触控IC芯片",
    "inspectionDate": "2025-01-17"
  },
  {
    "id": "INV_005",
    "remark": "48MP高清摄像头",
    "status": "正常",
    "factory": "武汉工厂",
    "quantity": 80,
    "supplier": "华星光电",
    "batchCode": "HX20250118",
    "shelfLife": "2025-06-18",
    "warehouse": "武汉库存",
    "materialCode": "CAM-华星-48MP",
    "materialName": "摄像头模组",
    "inspectionDate": "2025-01-18"
  }
];
  
  // 检验数据  
  const inspectionData = [
  {
    "id": "TEST_001",
    "supplier": "广正",
    "testDate": "2025-08-26",
    "batchCode": "105281",
    "conclusion": "质量良好",
    "testResult": "合格",
    "projectName": "项目A",
    "baselineName": "基线1.0",
    "materialCode": "CS-广1083",
    "materialName": "电容",
    "defectPhenomena": "无"
  },
  {
    "id": "TEST_002",
    "supplier": "聚龙光电",
    "testDate": "2025-01-15",
    "batchCode": "JL20250115",
    "conclusion": "显示效果优秀",
    "testResult": "合格",
    "projectName": "项目B",
    "baselineName": "基线2.0",
    "materialCode": "OLED-聚龙-001",
    "materialName": "OLED显示屏",
    "defectPhenomena": "无"
  },
  {
    "id": "TEST_003",
    "supplier": "BOE科技",
    "testDate": "2025-01-17",
    "batchCode": "BOE20250117",
    "conclusion": "需要返工",
    "testResult": "不合格",
    "projectName": "项目C",
    "baselineName": "基线1.5",
    "materialCode": "IC-BOE-8719",
    "materialName": "触控IC芯片",
    "defectPhenomena": "响应延迟"
  }
];
  
  // 生产数据
  const productionData = [
  {
    "id": "PROD_001",
    "batchNo": "105281",
    "factory": "重庆工厂",
    "useTime": "2025-08-27",
    "supplier": "广正",
    "projectId": "项目A",
    "baselineId": "基线1.0",
    "defectRate": 0.02,
    "materialCode": "CS-广1083",
    "materialName": "电容"
  },
  {
    "id": "PROD_002",
    "batchNo": "JL20250115",
    "factory": "东莞工厂",
    "useTime": "2025-01-16",
    "supplier": "聚龙光电",
    "projectId": "项目B",
    "baselineId": "基线2.0",
    "defectRate": 0.01,
    "materialCode": "OLED-聚龙-001",
    "materialName": "OLED显示屏"
  },
  {
    "id": "PROD_003",
    "batchNo": "BOE20250117",
    "factory": "苏州工厂",
    "useTime": "2025-01-18",
    "supplier": "BOE科技",
    "projectId": "项目C",
    "baselineId": "基线1.5",
    "defectRate": 0.08,
    "materialCode": "IC-BOE-8719",
    "materialName": "触控IC芯片"
  }
];
  
  try {
    // 同步到localStorage - 使用统一的键名
    localStorage.setItem('unified_inventory_data', JSON.stringify(inventoryData));
    localStorage.setItem('unified_lab_data', JSON.stringify(inspectionData));
    localStorage.setItem('unified_factory_data', JSON.stringify(productionData));
    
    // 兼容旧版本键名
    localStorage.setItem('inventory_data', JSON.stringify(inventoryData));
    localStorage.setItem('lab_data', JSON.stringify(inspectionData));
    localStorage.setItem('factory_data', JSON.stringify(productionData));
    localStorage.setItem('lab_test_data', JSON.stringify(inspectionData));
    localStorage.setItem('production_data', JSON.stringify(productionData));
    
    console.log('✅ 数据同步到localStorage成功:');
    console.log(`  - 库存数据: ${inventoryData.length} 条`);
    console.log(`  - 检验数据: ${inspectionData.length} 条`);
    console.log(`  - 生产数据: ${productionData.length} 条`);
    
    // 触发数据更新事件
    window.dispatchEvent(new CustomEvent('dataSync', {
      detail: {
        inventory: inventoryData,
        inspection: inspectionData,
        production: productionData
      }
    }));
    
    return true;
  } catch (error) {
    console.error('❌ 数据同步失败:', error);
    return false;
  }
})();

// 导出数据供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    inventory: [
  {
    "id": "INV_001",
    "remark": "-",
    "status": "正常",
    "factory": "重庆工厂",
    "quantity": 294,
    "supplier": "广正",
    "batchCode": "105281",
    "shelfLife": "2025-12-26",
    "warehouse": "重庆库存",
    "materialCode": "CS-广1083",
    "materialName": "电容",
    "inspectionDate": "2025-08-26"
  },
  {
    "id": "INV_002",
    "remark": "需要重点关注",
    "status": "风险",
    "factory": "深圳工厂",
    "quantity": 1500,
    "supplier": "黑龙",
    "batchCode": "411013",
    "shelfLife": "2025-11-15",
    "warehouse": "深圳库存",
    "materialCode": "CS-B-第2236",
    "materialName": "电容",
    "inspectionDate": "2025-06-15"
  },
  {
    "id": "INV_003",
    "remark": "高端显示屏",
    "status": "正常",
    "factory": "东莞工厂",
    "quantity": 150,
    "supplier": "聚龙光电",
    "batchCode": "JL20250115",
    "shelfLife": "2025-07-15",
    "warehouse": "东莞库存",
    "materialCode": "OLED-聚龙-001",
    "materialName": "OLED显示屏",
    "inspectionDate": "2025-01-15"
  },
  {
    "id": "INV_004",
    "remark": "触控芯片",
    "status": "正常",
    "factory": "苏州工厂",
    "quantity": 500,
    "supplier": "BOE科技",
    "batchCode": "BOE20250117",
    "shelfLife": "2025-12-17",
    "warehouse": "苏州库存",
    "materialCode": "IC-BOE-8719",
    "materialName": "触控IC芯片",
    "inspectionDate": "2025-01-17"
  },
  {
    "id": "INV_005",
    "remark": "48MP高清摄像头",
    "status": "正常",
    "factory": "武汉工厂",
    "quantity": 80,
    "supplier": "华星光电",
    "batchCode": "HX20250118",
    "shelfLife": "2025-06-18",
    "warehouse": "武汉库存",
    "materialCode": "CAM-华星-48MP",
    "materialName": "摄像头模组",
    "inspectionDate": "2025-01-18"
  }
],
    inspection: [
  {
    "id": "TEST_001",
    "supplier": "广正",
    "testDate": "2025-08-26",
    "batchCode": "105281",
    "conclusion": "质量良好",
    "testResult": "合格",
    "projectName": "项目A",
    "baselineName": "基线1.0",
    "materialCode": "CS-广1083",
    "materialName": "电容",
    "defectPhenomena": "无"
  },
  {
    "id": "TEST_002",
    "supplier": "聚龙光电",
    "testDate": "2025-01-15",
    "batchCode": "JL20250115",
    "conclusion": "显示效果优秀",
    "testResult": "合格",
    "projectName": "项目B",
    "baselineName": "基线2.0",
    "materialCode": "OLED-聚龙-001",
    "materialName": "OLED显示屏",
    "defectPhenomena": "无"
  },
  {
    "id": "TEST_003",
    "supplier": "BOE科技",
    "testDate": "2025-01-17",
    "batchCode": "BOE20250117",
    "conclusion": "需要返工",
    "testResult": "不合格",
    "projectName": "项目C",
    "baselineName": "基线1.5",
    "materialCode": "IC-BOE-8719",
    "materialName": "触控IC芯片",
    "defectPhenomena": "响应延迟"
  }
],
    production: [
  {
    "id": "PROD_001",
    "batchNo": "105281",
    "factory": "重庆工厂",
    "useTime": "2025-08-27",
    "supplier": "广正",
    "projectId": "项目A",
    "baselineId": "基线1.0",
    "defectRate": 0.02,
    "materialCode": "CS-广1083",
    "materialName": "电容"
  },
  {
    "id": "PROD_002",
    "batchNo": "JL20250115",
    "factory": "东莞工厂",
    "useTime": "2025-01-16",
    "supplier": "聚龙光电",
    "projectId": "项目B",
    "baselineId": "基线2.0",
    "defectRate": 0.01,
    "materialCode": "OLED-聚龙-001",
    "materialName": "OLED显示屏"
  },
  {
    "id": "PROD_003",
    "batchNo": "BOE20250117",
    "factory": "苏州工厂",
    "useTime": "2025-01-18",
    "supplier": "BOE科技",
    "projectId": "项目C",
    "baselineId": "基线1.5",
    "defectRate": 0.08,
    "materialCode": "IC-BOE-8719",
    "materialName": "触控IC芯片"
  }
]
  };
}
