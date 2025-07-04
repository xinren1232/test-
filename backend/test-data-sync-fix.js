/**
 * 测试数据同步修复
 * 模拟前端生成的132条数据并推送到后端
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function testDataSyncFix() {
  console.log('🔧 测试数据同步修复...\n');

  try {
    // 1. 生成模拟前端数据（使用MaterialSupplierMap.js中的真实供应商）
    console.log('📊 步骤1: 生成模拟前端数据...');
    
    const materials = [
      { name: "电池盖", category: "结构件类", suppliers: ["聚龙", "欣冠", "广正"] },
      { name: "中框", category: "结构件类", suppliers: ["聚龙", "欣冠", "广正"] },
      { name: "手机卡托", category: "结构件类", suppliers: ["聚龙", "欣冠", "广正"] },
      { name: "侧键", category: "结构件类", suppliers: ["聚龙", "欣冠", "广正"] },
      { name: "装饰件", category: "结构件类", suppliers: ["聚龙", "欣冠", "广正"] },
      { name: "LCD显示屏", category: "光学类", suppliers: ["帝晶", "天马", "BOE"] },
      { name: "OLED显示屏", category: "光学类", suppliers: ["BOE", "天马", "华星"] },
      { name: "摄像头模组", category: "光学类", suppliers: ["盛泰", "天实", "深奥"] },
      { name: "电池", category: "充电类", suppliers: ["百俊达", "奥海", "辰阳"] },
      { name: "充电器", category: "充电类", suppliers: ["锂威", "风华", "维科"] }
    ];

    const factories = ['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂'];
    const warehouses = ['中央库存', '重庆库存', '深圳库存'];
    const statuses = ['正常', '风险', '冻结'];

    const inventoryData = [];
    let id = 1;

    // 生成132条库存数据 (10种物料 × 3个供应商 × 4-5个批次)
    for (let materialIndex = 0; materialIndex < materials.length && id <= 132; materialIndex++) {
      const material = materials[materialIndex];
      for (let supplierIndex = 0; supplierIndex < material.suppliers.length && id <= 132; supplierIndex++) {
        const supplier = material.suppliers[supplierIndex];
        
        // 每个物料-供应商组合生成4-5个批次
        const batchCount = materialIndex < 2 ? 5 : 4; // 前两种物料多生成一个批次
        for (let batchIndex = 0; batchIndex < batchCount && id <= 132; batchIndex++) {
          const batchNo = `${material.name.substring(0, 2)}${(materialIndex + 1).toString().padStart(2, '0')}${(supplierIndex + 1)}${(batchIndex + 1)}`;
          const factory = factories[Math.floor(Math.random() * factories.length)];
          const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const quantity = Math.floor(Math.random() * 1000) + 100;
          
          // 使用前端数据结构的字段名
          const inventoryRecord = {
            id: `INV-${id.toString().padStart(3, '0')}`,
            materialName: material.name,  // 前端使用的字段名
            materialCode: `CS-${material.category.substring(0, 1)}-${material.name.substring(0, 1)}${Math.floor(Math.random() * 9000) + 1000}`,
            materialType: material.category,  // 前端使用的字段名
            batchNo: batchNo,  // 前端使用的字段名
            supplier: supplier,  // 前端使用的字段名
            quantity: quantity,
            status: status,
            factory: factory,  // 前端使用的字段名
            warehouse: warehouse,  // 前端使用的字段名
            inboundTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            lastUpdateTime: new Date().toISOString(),
            freezeReason: status === '冻结' ? '质量异常，待检验' : null
          };

          inventoryData.push(inventoryRecord);
          id++;
        }
      }
    }

    console.log(`✅ 生成了 ${inventoryData.length} 条库存数据`);
    console.log(`📋 供应商分布:`);
    const supplierCount = {};
    inventoryData.forEach(item => {
      supplierCount[item.supplier] = (supplierCount[item.supplier] || 0) + 1;
    });
    console.table(supplierCount);

    // 2. 推送数据到后端API
    console.log('\n📤 步骤2: 推送数据到后端API...');
    
    const dataToPush = {
      inventory: inventoryData,
      inspection: [], // 暂时为空
      production: []  // 暂时为空
    };

    const response = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToPush)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ 数据推送成功:', result);

    // 3. 验证数据库中的数据
    console.log('\n🔍 步骤3: 验证数据库中的数据...');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 检查库存数据总数
    const [countResult] = await connection.query('SELECT COUNT(*) as count FROM inventory');
    console.log(`📦 数据库中库存数据总数: ${countResult[0].count}`);

    // 检查供应商分布
    const [supplierResult] = await connection.query(`
      SELECT supplier_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY supplier_name 
      ORDER BY count DESC
    `);
    console.log('🏢 数据库中供应商分布:');
    console.table(supplierResult);

    // 检查物料分布
    const [materialResult] = await connection.query(`
      SELECT material_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY material_name 
      ORDER BY count DESC
    `);
    console.log('📋 数据库中物料分布:');
    console.table(materialResult);

    // 检查是否包含"聚龙"等供应商
    const [targetSupplierResult] = await connection.query(`
      SELECT supplier_name, COUNT(*) as count 
      FROM inventory 
      WHERE supplier_name IN ('聚龙', '欣冠', '广正')
      GROUP BY supplier_name
    `);
    
    if (targetSupplierResult.length > 0) {
      console.log('✅ 成功同步目标供应商数据:');
      console.table(targetSupplierResult);
    } else {
      console.log('❌ 未找到目标供应商数据（聚龙、欣冠、广正）');
    }

    await connection.end();

    console.log('\n🎉 数据同步修复测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testDataSyncFix();
