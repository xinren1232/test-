import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

/**
 * 修复测试数据生成的字段设计问题
 * 确保数据库字段完全符合场景字段设计要求
 */

// 标准场景字段设计
const STANDARD_FIELD_DESIGNS = {
  '库存场景': {
    expectedFields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
    tableName: 'inventory',
    fieldMapping: {
      '工厂': 'storage_location',
      '仓库': 'storage_location', 
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '状态': 'status',
      '入库时间': 'inbound_time',
      '到期时间': 'expiry_date',
      '备注': 'notes'
    }
  },
  '测试场景': {
    expectedFields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
    tableName: 'lab_tests',
    fieldMapping: {
      '测试编号': 'test_id',
      '日期': 'test_date',
      '项目': 'project_id',
      '基线': 'baseline_id',
      '物料编码': 'material_code',
      '数量': 'quantity',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '测试结果': 'test_result',
      '不合格描述': 'defect_desc',
      '备注': 'notes'
    }
  },
  '上线场景': {
    expectedFields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
    tableName: 'online_tracking',
    fieldMapping: {
      '工厂': 'factory',
      '基线': 'baseline',
      '项目': 'project',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '批次号': 'batch_code',
      '不良率': 'defect_rate',
      '本周异常': 'weekly_anomaly',
      '检验日期': 'inspection_date',
      '备注': 'notes'
    }
  },
  '批次管理': {
    expectedFields: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注'],
    tableName: 'inventory', // 主要基于inventory表，关联其他表
    fieldMapping: {
      '批次号': 'batch_code',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '入库日期': 'inbound_time',
      '产线异常': 'production_anomaly',
      '测试异常': 'test_anomaly',
      '备注': 'notes'
    }
  }
};

async function fixDataFieldMapping() {
  try {
    console.log('🔧 修复测试数据生成的字段设计问题...\n');
    
    // 1. 检查当前数据库表结构
    console.log('📋 1. 检查当前数据库表结构...');
    await checkCurrentTableStructure();
    
    // 2. 修复inventory表字段
    console.log('\n📦 2. 修复inventory表字段...');
    await fixInventoryTableFields();
    
    // 3. 修复lab_tests表字段
    console.log('\n🧪 3. 修复lab_tests表字段...');
    await fixLabTestsTableFields();
    
    // 4. 修复online_tracking表字段
    console.log('\n🏭 4. 修复online_tracking表字段...');
    await fixOnlineTrackingTableFields();
    
    // 5. 验证字段映射
    console.log('\n✅ 5. 验证字段映射...');
    await verifyFieldMapping();
    
    // 6. 重新生成符合标准的测试数据
    console.log('\n🔄 6. 重新生成符合标准的测试数据...');
    await regenerateStandardData();
    
    console.log('\n🎉 字段设计修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  } finally {
    await connection.end();
  }
}

/**
 * 检查当前数据库表结构
 */
async function checkCurrentTableStructure() {
  const tables = ['inventory', 'lab_tests', 'online_tracking'];
  
  for (const table of tables) {
    try {
      const [columns] = await connection.execute(`DESCRIBE ${table}`);
      console.log(`📋 ${table}表字段:`);
      columns.forEach(col => {
        console.log(`  ${col.Field} (${col.Type})`);
      });
      console.log('');
    } catch (error) {
      console.log(`❌ ${table}表不存在或查询失败`);
    }
  }
}

/**
 * 修复inventory表字段
 */
async function fixInventoryTableFields() {
  try {
    // 检查是否需要添加缺失字段
    const [columns] = await connection.execute('DESCRIBE inventory');
    const existingFields = columns.map(col => col.Field);
    
    // 需要的字段
    const requiredFields = {
      'expiry_date': 'DATE COMMENT "到期时间"',
      'batch_code': 'VARCHAR(50) COMMENT "批次号"',
      'production_anomaly': 'VARCHAR(255) DEFAULT "无" COMMENT "产线异常"',
      'test_anomaly': 'VARCHAR(255) DEFAULT "无" COMMENT "测试异常"'
    };
    
    for (const [field, definition] of Object.entries(requiredFields)) {
      if (!existingFields.includes(field)) {
        await connection.execute(`ALTER TABLE inventory ADD COLUMN ${field} ${definition}`);
        console.log(`✅ 添加字段: ${field}`);
      }
    }
    
    // 更新现有数据，确保有到期时间和批次号
    await connection.execute(`
      UPDATE inventory 
      SET 
        expiry_date = DATE_ADD(inbound_time, INTERVAL 365 DAY),
        batch_code = CONCAT('BATCH-', LPAD(id, 3, '0'))
      WHERE expiry_date IS NULL OR batch_code IS NULL
    `);
    
    console.log('✅ inventory表字段修复完成');
    
  } catch (error) {
    console.log(`❌ inventory表字段修复失败: ${error.message}`);
  }
}

/**
 * 修复lab_tests表字段
 */
async function fixLabTestsTableFields() {
  try {
    // 检查字段是否存在
    const [columns] = await connection.execute('DESCRIBE lab_tests');
    const existingFields = columns.map(col => col.Field);
    
    // 确保关键字段存在
    const requiredFields = {
      'project_id': 'VARCHAR(50) DEFAULT "项目1" COMMENT "项目"',
      'baseline_id': 'VARCHAR(50) DEFAULT "基线1" COMMENT "基线"',
      'defect_desc': 'TEXT COMMENT "不合格描述"'
    };
    
    for (const [field, definition] of Object.entries(requiredFields)) {
      if (!existingFields.includes(field)) {
        await connection.execute(`ALTER TABLE lab_tests ADD COLUMN ${field} ${definition}`);
        console.log(`✅ 添加字段: ${field}`);
      }
    }
    
    // 标准化测试结果值
    await connection.execute(`
      UPDATE lab_tests 
      SET test_result = CASE 
        WHEN test_result IN ('PASS', '合格', 'OK') THEN 'OK'
        WHEN test_result IN ('FAIL', 'NG', '不合格') THEN 'NG'
        ELSE test_result
      END
    `);
    
    console.log('✅ lab_tests表字段修复完成');
    
  } catch (error) {
    console.log(`❌ lab_tests表字段修复失败: ${error.message}`);
  }
}

/**
 * 修复online_tracking表字段
 */
async function fixOnlineTrackingTableFields() {
  try {
    // 检查字段是否存在
    const [columns] = await connection.execute('DESCRIBE online_tracking');
    const existingFields = columns.map(col => col.Field);
    
    // 需要的字段
    const requiredFields = {
      'weekly_anomaly': 'VARCHAR(50) DEFAULT "无" COMMENT "本周异常"',
      'baseline': 'VARCHAR(50) DEFAULT "基线1" COMMENT "基线"'
    };
    
    for (const [field, definition] of Object.entries(requiredFields)) {
      if (!existingFields.includes(field)) {
        await connection.execute(`ALTER TABLE online_tracking ADD COLUMN ${field} ${definition}`);
        console.log(`✅ 添加字段: ${field}`);
      }
    }
    
    // 更新现有数据
    await connection.execute(`
      UPDATE online_tracking 
      SET 
        weekly_anomaly = CASE 
          WHEN exception_count > 0 THEN '有异常'
          ELSE '无'
        END,
        baseline = COALESCE(baseline, 'I6788')
      WHERE weekly_anomaly IS NULL OR baseline IS NULL
    `);
    
    console.log('✅ online_tracking表字段修复完成');
    
  } catch (error) {
    console.log(`❌ online_tracking表字段修复失败: ${error.message}`);
  }
}

/**
 * 验证字段映射
 */
async function verifyFieldMapping() {
  for (const [sceneName, design] of Object.entries(STANDARD_FIELD_DESIGNS)) {
    console.log(`📋 验证${sceneName}字段映射:`);

    try {
      // 构建测试SQL
      let testSQL;

      if (sceneName === '库存场景') {
        testSQL = `SELECT
          COALESCE(storage_location, '未知工厂') as 工厂,
          COALESCE(storage_location, '未知仓库') as 仓库,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
          DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
          COALESCE(notes, '') as 备注
        FROM inventory LIMIT 1`;
      } else if (sceneName === '测试场景') {
        testSQL = `SELECT
          test_id as 测试编号,
          DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
          project_id as 项目,
          baseline_id as 基线,
          material_code as 物料编码,
          quantity as 数量,
          material_name as 物料名称,
          supplier_name as 供应商,
          test_result as 测试结果,
          COALESCE(defect_desc, '') as 不合格描述,
          COALESCE(notes, '') as 备注
        FROM lab_tests LIMIT 1`;
      } else if (sceneName === '上线场景') {
        testSQL = `SELECT
          factory as 工厂,
          baseline as 基线,
          project as 项目,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          batch_code as 批次号,
          CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
          weekly_anomaly as 本周异常,
          DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
          COALESCE(notes, '') as 备注
        FROM online_tracking LIMIT 1`;
      }

      if (testSQL) {
        const [results] = await connection.execute(testSQL);

        if (results.length > 0) {
          const actualFields = Object.keys(results[0]);
          const expectedFields = design.expectedFields;

          const matchedFields = actualFields.filter(field => expectedFields.includes(field));
          const matchRate = Math.round((matchedFields.length / expectedFields.length) * 100);

          console.log(`  实际字段: ${actualFields.join(', ')}`);
          console.log(`  期望字段: ${expectedFields.join(', ')}`);
          console.log(`  匹配度: ${matchRate}% (${matchedFields.length}/${expectedFields.length})`);

          if (matchRate === 100) {
            console.log(`  ✅ ${sceneName}字段映射完美`);
          } else {
            const missingFields = expectedFields.filter(field => !actualFields.includes(field));
            console.log(`  ⚠️ 缺失字段: ${missingFields.join(', ')}`);
          }
        } else {
          console.log(`  ⚠️ ${sceneName}无测试数据`);
        }
      }

      console.log('');
    } catch (error) {
      console.log(`  ❌ ${sceneName}验证失败: ${error.message}`);
    }
  }
}

/**
 * 重新生成符合标准的测试数据
 */
async function regenerateStandardData() {
  // 使用真实的物料大类数据
  const materialCategories = {
    '结构件类': {
      materials: ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
      suppliers: ['聚龙', '欣冠', '广正'],
      defects: ['划伤', '掉漆', '变形', '破损', '注塑不良']
    },
    '光学类': {
      materials: ['LCD显示屏', 'OLED显示屏', '摄像头'],
      suppliers: ['帝晶', '天马', 'BOE', '华星'],
      defects: ['漏光', '暗点', '闪屏', 'mura', '划花']
    },
    '充电类': {
      materials: ['电池', '充电器'],
      suppliers: ['百佳达', '奥海', '辰阳', '钜威'],
      defects: ['起鼓', '放电', '无法充电', '外壳破损']
    },
    '声学类': {
      materials: ['喇叭', '听筒'],
      suppliers: ['东声', '豪声', '歌尔'],
      defects: ['无声', '杂音']
    },
    '包料类': {
      materials: ['保护套', '标签', '包装盒'],
      suppliers: ['丽德宝', '裕同', '富群'],
      defects: ['尺寸偏差', '发黄', '脱落', '错印']
    }
  };

  const factories = ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'];
  const projects = ['KI4K', 'MI8K', 'HW5G', 'OP7P', 'VV9X'];
  const baselines = ['I6788', 'M7899', 'H5566', 'O8877', 'V9988'];

  // 清空现有数据
  await connection.execute('DELETE FROM inventory');
  await connection.execute('DELETE FROM lab_tests');
  await connection.execute('DELETE FROM online_tracking');

  console.log('🗑️ 已清空现有数据');

  // 生成132条库存数据
  console.log('📦 生成132条库存数据...');

  let recordId = 1;
  const allMaterials = Object.values(materialCategories).flatMap(cat => cat.materials);
  const allSuppliers = [...new Set(Object.values(materialCategories).flatMap(cat => cat.suppliers))];

  for (let i = 1; i <= 132; i++) {
    const material = allMaterials[(i - 1) % allMaterials.length];
    const supplier = allSuppliers[(i - 1) % allSuppliers.length];
    const factory = factories[(i - 1) % factories.length];

    const inboundTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const expiryDate = new Date(inboundTime.getTime() + 365 * 24 * 60 * 60 * 1000);

    await connection.execute(`
      INSERT INTO inventory (
        id, material_code, material_name, supplier_name, quantity,
        inbound_time, expiry_date, storage_location, status, batch_code,
        production_anomaly, test_anomaly, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      i,
      `MAT-${String(i).padStart(3, '0')}`,
      material,
      supplier,
      Math.floor(Math.random() * 1000) + 100,
      inboundTime,
      expiryDate,
      factory,
      Math.random() < 0.1 ? '风险' : '正常',
      `BATCH-${String(i).padStart(3, '0')}`,
      Math.random() < 0.05 ? '有异常' : '无',
      Math.random() < 0.03 ? '有异常' : '无',
      `库存备注${i}`
    ]);
  }

  console.log('✅ 库存数据生成完成');

  // 为每个批次生成3条测试记录（396条）
  console.log('🧪 生成396条测试数据...');

  const [inventoryRecords] = await connection.execute('SELECT * FROM inventory');
  let testId = 1;

  for (const inventory of inventoryRecords) {
    for (let testIndex = 1; testIndex <= 3; testIndex++) {
      const project = projects[testId % projects.length];
      const baseline = baselines[testId % baselines.length];
      const testResult = Math.random() < 0.9 ? 'OK' : 'NG';

      // 获取该物料可能的缺陷
      let defectDesc = '';
      if (testResult === 'NG') {
        for (const [category, data] of Object.entries(materialCategories)) {
          if (data.materials.includes(inventory.material_name)) {
            defectDesc = data.defects[Math.floor(Math.random() * data.defects.length)];
            break;
          }
        }
      }

      const testDate = new Date(inventory.inbound_time.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000);

      await connection.execute(`
        INSERT INTO lab_tests (
          id, test_id, batch_code, material_code, material_name, supplier_name,
          test_date, project_id, baseline_id, test_result, defect_desc,
          quantity, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `LAB-${testId}`,
        `TEST-${String(testId).padStart(3, '0')}`,
        inventory.batch_code,
        inventory.material_code,
        inventory.material_name,
        inventory.supplier_name,
        testDate,
        project,
        baseline,
        testResult,
        defectDesc,
        Math.floor(Math.random() * 100) + 10,
        `测试备注${testId}`
      ]);

      testId++;
    }
  }

  console.log('✅ 测试数据生成完成');

  // 为每个批次生成8条上线记录（1056条）
  console.log('🏭 生成1056条上线数据...');

  let onlineId = 1;

  for (const inventory of inventoryRecords) {
    for (let onlineIndex = 1; onlineIndex <= 8; onlineIndex++) {
      const project = projects[onlineId % projects.length];
      const baseline = baselines[onlineId % baselines.length];
      const factory = factories[onlineId % factories.length];

      const onlineDate = new Date(inventory.inbound_time.getTime() + Math.random() * 15 * 24 * 60 * 60 * 1000);
      const inspectionDate = new Date(onlineDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000);

      await connection.execute(`
        INSERT INTO online_tracking (
          id, batch_code, material_code, material_name, supplier_name,
          online_date, factory, project, baseline, defect_rate,
          weekly_anomaly, inspection_date, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `TRK-${onlineId}`,
        inventory.batch_code,
        inventory.material_code,
        inventory.material_name,
        inventory.supplier_name,
        onlineDate,
        factory,
        project,
        baseline,
        Math.random() * 0.05, // 0-5%不良率
        Math.random() < 0.1 ? '有异常' : '无',
        inspectionDate,
        `上线备注${onlineId}`
      ]);

      onlineId++;
    }
  }

  console.log('✅ 上线数据生成完成');

  // 验证数据量
  const [invCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
  const [labCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
  const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');

  console.log('\n📊 数据生成结果:');
  console.log(`  📦 库存数据: ${invCount[0].count}条`);
  console.log(`  🧪 测试数据: ${labCount[0].count}条`);
  console.log(`  🏭 上线数据: ${onlineCount[0].count}条`);

  if (invCount[0].count === 132 && labCount[0].count === 396 && onlineCount[0].count === 1056) {
    console.log('✅ 数据量完全符合预期 (132/396/1056)');
  } else {
    console.log('⚠️ 数据量与预期不符');
  }
}

// 执行修复
fixDataFieldMapping();
