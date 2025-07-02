/**
 * 紧急数据推送工具 - 如果前端推送仍有问题，使用此脚本
 */
import fetch from 'node-fetch';

async function emergencyDataPush() {
  console.log('🚨 紧急数据推送工具...\n');
  
  try {
    // 生成标准的132条库存数据
    const materials = [
      { name: "电池盖", type: "结构件类", suppliers: ["聚龙", "欣冠", "广正"] },
      { name: "中框", type: "结构件类", suppliers: ["聚龙", "欣冠", "广正"] },
      { name: "手机卡托", type: "结构件类", suppliers: ["聚龙", "欣冠", "广正"] },
      { name: "侧键", type: "结构件类", suppliers: ["聚龙", "欣冠", "广正"] },
      { name: "装饰件", type: "结构件类", suppliers: ["聚龙", "欣冠", "广正"] },
      { name: "LCD显示屏", type: "光学类", suppliers: ["帝晶", "天马", "BOE"] },
      { name: "OLED显示屏", type: "光学类", suppliers: ["BOE", "天马", "华星"] },
      { name: "摄像头模组", type: "光学类", suppliers: ["盛泰", "天实", "深奥"] },
      { name: "电池", type: "充电类", suppliers: ["百俊达", "奥海", "辰阳"] },
      { name: "充电器", type: "充电类", suppliers: ["锂威", "风华", "维科"] },
      { name: "扬声器", type: "声学类", suppliers: ["东声", "豪声", "歌尔"] },
      { name: "听筒", type: "声学类", suppliers: ["东声", "豪声", "歌尔"] },
      { name: "保护套", type: "包料类", suppliers: ["丽德宝", "裕同", "富群"] },
      { name: "标签", type: "包料类", suppliers: ["丽德宝", "裕同", "富群"] },
      { name: "包装盒", type: "包料类", suppliers: ["丽德宝", "裕同", "富群"] }
    ];
    
    const factories = ["深圳工厂", "重庆工厂", "宜宾工厂", "南昌工厂"];
    const warehouses = ["深圳库存", "重庆库存", "宜宾库存", "南昌库存"];
    const statuses = ["正常", "风险", "冻结"];
    
    const inventoryData = [];
    const inspectionData = [];
    const productionData = [];
    
    let inventoryId = 1;
    let inspectionId = 1;
    let productionId = 1;
    
    // 生成132条库存数据 (15种物料 × 3个供应商 × 3个批次 = 135条，取132条)
    let recordCount = 0;
    for (let materialIndex = 0; materialIndex < materials.length && recordCount < 132; materialIndex++) {
      const material = materials[materialIndex];
      for (let supplierIndex = 0; supplierIndex < material.suppliers.length && recordCount < 132; supplierIndex++) {
        const supplier = material.suppliers[supplierIndex];
        for (let batchIndex = 0; batchIndex < 3 && recordCount < 132; batchIndex++) {
          const batchNo = `${material.name.substring(0, 2)}${(materialIndex + 1).toString().padStart(2, '0')}${(supplierIndex + 1)}${(batchIndex + 1)}`;
          const materialCode = `CS-${material.type.substring(0, 1)}-${material.name.substring(0, 1)}${Math.floor(Math.random() * 9000) + 1000}`;
          const factory = factories[Math.floor(Math.random() * factories.length)];
          const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const quantity = Math.floor(Math.random() * 1500) + 100;
          
          // 库存记录
          inventoryData.push({
            id: `INV_${inventoryId.toString().padStart(3, '0')}`,
            materialName: material.name,
            materialCode: materialCode,
            materialType: material.type,
            batchNo: batchNo,
            supplier: supplier,
            quantity: quantity,
            status: status,
            warehouse: warehouse,
            factory: factory,
            inboundTime: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            expiryDate: `2026-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            notes: status === '冻结' ? '待质量确认' : status === '风险' ? '需要重点关注' : '正常库存'
          });
          inventoryId++;
          recordCount++;
          
          // 为每个批次生成3条测试记录
          for (let testIndex = 0; testIndex < 3; testIndex++) {
            const testResult = Math.random() > 0.8 ? 'FAIL' : 'PASS';
            inspectionData.push({
              id: `TEST_${inspectionId.toString().padStart(3, '0')}`,
              materialName: material.name,
              batchNo: batchNo,
              supplier: supplier,
              testDate: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
              testResult: testResult,
              defectDescription: testResult === 'FAIL' ? '质量不符合标准' : null
            });
            inspectionId++;
          }
          
          // 为每个批次生成8条上线记录
          for (let prodIndex = 0; prodIndex < 8; prodIndex++) {
            const defectRate = Math.random() * 5;
            productionData.push({
              id: `PROD_${productionId.toString().padStart(4, '0')}`,
              materialName: material.name,
              materialCode: materialCode,
              batchNo: batchNo,
              supplier: supplier,
              factory: factory,
              line: `产线${String(Math.floor(Math.random() * 5) + 1).padStart(2, '0')}`,
              onlineTime: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
              defectRate: parseFloat(defectRate.toFixed(1)),
              defect: defectRate > 3 ? '缺陷率偏高' : defectRate > 1 ? '轻微缺陷' : null
            });
            productionId++;
          }
        }
      }
    }
    
    const testData = {
      inventory: inventoryData,
      inspection: inspectionData,
      production: productionData
    };
    
    console.log(`📊 生成标准数据: 库存${testData.inventory.length}条, 检验${testData.inspection.length}条, 生产${testData.production.length}条`);
    
    // 推送到后端
    console.log('\n📤 推送数据到问答助手...');
    
    const response = await fetch('http://localhost:3002/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      throw new Error(`推送失败: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ 数据推送成功:', result.message);
    
    // 测试查询
    console.log('\n🔍 测试问答功能...');
    
    const queries = [
      '查询聚龙供应商的物料',
      '查询深圳工厂的库存情况',
      '目前有哪些风险库存？',
      '查询电池盖',
      '查询OLED显示屏',
      '工厂数据汇总'
    ];
    
    for (const query of queries) {
      console.log(`\n🎯 测试: "${query}"`);
      
      try {
        const queryResponse = await fetch('http://localhost:3002/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query })
        });
        
        if (queryResponse.ok) {
          const queryResult = await queryResponse.json();
          const reply = queryResult.reply || '';
          
          if (reply.includes('找到')) {
            const lines = reply.split('\n');
            const summaryLine = lines.find(line => line.includes('找到') && line.includes('条')) || lines[0];
            console.log('✅ 成功:', summaryLine);
          } else {
            console.log('⚠️ 结果:', reply.substring(0, 50) + '...');
          }
        } else {
          console.log('❌ 查询失败:', queryResponse.status);
        }
      } catch (error) {
        console.log('❌ 错误:', error.message);
      }
    }
    
    console.log('\n🎉 紧急数据推送完成！');
    console.log('现在你可以在前端问答助手页面进行查询了。');
    
  } catch (error) {
    console.error('❌ 紧急推送失败:', error.message);
  }
}

emergencyDataPush().catch(console.error);
