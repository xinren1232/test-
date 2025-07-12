import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixMaterialCategoryData() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔧 开始修复物料大类别数据...\n');
    
    // 1. 修复JSON格式问题
    console.log('📝 1. 修复JSON格式问题...');
    
    // 获取所有需要修复的记录
    const [records] = await connection.execute(`
      SELECT id, material_name, common_defects 
      FROM material_subcategories 
      WHERE common_defects NOT LIKE '[%'
    `);
    
    console.log(`发现 ${records.length} 条需要修复的记录`);
    
    for (const record of records) {
      if (record.common_defects) {
        // 将逗号分隔的字符串转换为JSON数组
        const defectsArray = record.common_defects.split(',').map(item => item.trim());
        const jsonDefects = JSON.stringify(defectsArray);
        
        await connection.execute(`
          UPDATE material_subcategories 
          SET common_defects = ?
          WHERE id = ?
        `, [jsonDefects, record.id]);
        
        console.log(`✅ 修复 ${record.material_name}: ${jsonDefects}`);
      }
    }
    
    // 2. 修复common_suppliers字段
    console.log('\n📝 2. 修复common_suppliers字段...');
    
    const [supplierRecords] = await connection.execute(`
      SELECT id, material_name, common_suppliers 
      FROM material_subcategories 
      WHERE common_suppliers NOT LIKE '[%'
    `);
    
    for (const record of supplierRecords) {
      if (record.common_suppliers) {
        const suppliersArray = record.common_suppliers.split(',').map(item => item.trim());
        const jsonSuppliers = JSON.stringify(suppliersArray);
        
        await connection.execute(`
          UPDATE material_subcategories 
          SET common_suppliers = ?
          WHERE id = ?
        `, [jsonSuppliers, record.id]);
        
        console.log(`✅ 修复供应商 ${record.material_name}: ${jsonSuppliers}`);
      }
    }
    
    // 3. 创建缺失的test_tracking表（如果不存在）
    console.log('\n📊 3. 检查并创建缺失的表...');
    
    try {
      await connection.execute('SELECT 1 FROM test_tracking LIMIT 1');
      console.log('✅ test_tracking表已存在');
    } catch (error) {
      console.log('⚠️ test_tracking表不存在，创建中...');
      
      await connection.execute(`
        CREATE TABLE test_tracking (
          id INT AUTO_INCREMENT PRIMARY KEY,
          test_id VARCHAR(50) NOT NULL,
          test_date DATE NOT NULL,
          project VARCHAR(100),
          baseline VARCHAR(100),
          material_type VARCHAR(100),
          quantity INT DEFAULT 1,
          material_name VARCHAR(100),
          supplier_name VARCHAR(100),
          test_result ENUM('OK', 'NG') NOT NULL,
          defect_description TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_test_date (test_date),
          INDEX idx_material_name (material_name),
          INDEX idx_supplier_name (supplier_name),
          INDEX idx_test_result (test_result)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='测试跟踪表'
      `);
      
      console.log('✅ test_tracking表创建完成');
      
      // 插入一些测试数据
      console.log('📥 插入测试数据...');
      
      const testData = [
        ['T001', '2024-01-15', '项目A', '基线1', '结构件类', 1, '电池盖', '聚龙', 'OK', '', '测试通过'],
        ['T002', '2024-01-15', '项目A', '基线1', '结构件类', 1, '中框', '聚龙', 'NG', '划伤', '外观不良'],
        ['T003', '2024-01-16', '项目B', '基线2', '光学类', 1, 'LCD显示屏', '天马', 'OK', '', '测试通过'],
        ['T004', '2024-01-16', '项目B', '基线2', '光学类', 1, 'OLED显示屏', 'BOE', 'NG', '漏光', '显示异常'],
        ['T005', '2024-01-17', '项目C', '基线3', '充电类', 1, '电池', '百佳达', 'OK', '', '测试通过'],
        ['T006', '2024-01-17', '项目C', '基线3', '充电类', 1, '充电器', '理想', 'NG', '无法充电', '功能异常'],
        ['T007', '2024-01-18', '项目D', '基线4', '声学类', 1, '喇叭', '歌尔', 'OK', '', '测试通过'],
        ['T008', '2024-01-18', '项目D', '基线4', '声学类', 1, '听筒', '东声', 'NG', '无声', '功能异常'],
        ['T009', '2024-01-19', '项目E', '基线5', '包材类', 1, '保护套', '富群', 'OK', '', '测试通过'],
        ['T010', '2024-01-19', '项目E', '基线5', '包材类', 1, '包装盒', '裕同', 'NG', '破损', '包装不良']
      ];
      
      for (const data of testData) {
        await connection.execute(`
          INSERT INTO test_tracking (
            test_id, test_date, project, baseline, material_type, 
            quantity, material_name, supplier_name, test_result, 
            defect_description, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, data);
      }
      
      console.log(`✅ 插入了 ${testData.length} 条测试数据`);
    }
    
    // 4. 验证修复结果
    console.log('\n🔍 4. 验证修复结果...');
    
    const [fixedRecords] = await connection.execute(`
      SELECT material_name, common_defects, common_suppliers 
      FROM material_subcategories 
      LIMIT 5
    `);
    
    console.log('修复后的数据示例:');
    fixedRecords.forEach(record => {
      try {
        const defects = JSON.parse(record.common_defects || '[]');
        const suppliers = JSON.parse(record.common_suppliers || '[]');
        console.log(`  ${record.material_name}:`);
        console.log(`    不良: ${defects.slice(0, 3).join(', ')}`);
        console.log(`    供应商: ${suppliers.slice(0, 3).join(', ')}`);
      } catch (error) {
        console.log(`  ${record.material_name}: JSON解析错误`);
      }
    });
    
    // 5. 测试规则执行
    console.log('\n🧪 5. 测试规则执行...');
    
    const [testRule] = await connection.execute(`
      SELECT action_target 
      FROM nlp_intent_rules 
      WHERE intent_name = '结构件类物料查询'
    `);
    
    if (testRule[0]) {
      try {
        const [results] = await connection.execute(testRule[0].action_target);
        console.log(`✅ 结构件类物料查询: 返回${results.length}条记录`);
        if (results.length > 0) {
          console.log('示例结果:');
          results.slice(0, 3).forEach((row, i) => {
            console.log(`  ${i+1}. ${row.物料名称} - ${row.供应商} (${row.状态})`);
          });
        }
      } catch (error) {
        console.log(`❌ 规则执行失败: ${error.message}`);
      }
    }
    
    console.log('\n🎉 物料大类别数据修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixMaterialCategoryData();
