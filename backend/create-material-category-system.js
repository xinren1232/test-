import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 物料大类别定义
const MATERIAL_CATEGORIES = {
  '结构件类': {
    name: '结构件类',
    description: '手机结构相关的物理组件',
    materials: [
      { name: '电池盖', defects: ['划伤', '堵漆', '起翘', '色差', '紧龙', '欣冠', '厂正'] },
      { name: '中框', defects: ['变形', '破裂', '堵漆', '尺寸异常', '紧龙', '欣冠', '厂正'] },
      { name: '手机卡托', defects: ['注塑不良', '尺寸异常', '堵漆', '毛边', '紧龙', '欣冠', '厂正'] },
      { name: '侧键', defects: ['脱落', '卡键', '尺寸异常', '松动', '紧龙', '欣冠', '厂正'] },
      { name: '装饰件', defects: ['掉色', '偏位', '脱落', '掉色', '紧龙', '欣冠', '厂正'] }
    ],
    suppliers: ['聚龙', '欣冠'],
    priority: 1
  },
  
  '光学类': {
    name: '光学类',
    description: '显示和摄像相关的光学组件',
    materials: [
      { name: 'LCD显示屏', defects: ['漏光', '暗点', '亮屏', '偏色', '希雷', '天马', 'BOE'] },
      { name: 'OLED显示屏', defects: ['闪屏', 'mura', '亮线', '亮线', 'BOE', '天马', '华星'] },
      { name: '摄像头模组', defects: ['刮花', '底座破裂', '脱污', '无法拍照', '盖泰', '天实', '深奥'] }
    ],
    suppliers: ['天马', 'BOE', '华星', '天实', '深奥', '盖泰'],
    priority: 2
  },
  
  '充电类': {
    name: '充电类',
    description: '电源和充电相关组件',
    materials: [
      { name: '电池', defects: ['起鼓', '放电', '漏液', '电压不稳定', '百佳达', '奥海', '辰阳'] },
      { name: '充电器', defects: ['无法充电', '外壳破裂', '输出功率异常', '发热异常', '理想', '风华', '建科'] }
    ],
    suppliers: ['百佳达', '奥海', '辰阳', '理想', '风华', '建科'],
    priority: 3
  },
  
  '声学类': {
    name: '声学类',
    description: '音频相关组件',
    materials: [
      { name: '喇叭', defects: ['无声', '杂声', '音量小', '破裂', '东声', '豪声', '歌尔'] },
      { name: '听筒', defects: ['无声', '杂声', '音量小', '破裂', '东声', '豪声', '歌尔'] }
    ],
    suppliers: ['歌尔', '东声', '豪声'],
    priority: 4
  },
  
  '包材类': {
    name: '包材类',
    description: '包装和保护相关材料',
    materials: [
      { name: '保护套', defects: ['尺寸偏差', '发黄', '模具压痕', '丽密宝', '裕同', '富群'] },
      { name: '标签', defects: ['脱落', '错印', 'logo错误', '尺寸异常', '丽密宝', '裕同', '富群'] },
      { name: '包装盒', defects: ['破损', 'logo错误', '错印', '尺寸异常', '丽密宝', '裕同', '富群'] }
    ],
    suppliers: ['富群', '裕同', '丽密宝'],
    priority: 5
  }
};

async function createMaterialCategorySystem() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🏗️ 开始创建物料大类别系统...\n');
    
    // 1. 创建物料大类别表
    console.log('📊 1. 创建物料大类别表...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS material_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_code VARCHAR(20) NOT NULL UNIQUE,
        category_name VARCHAR(50) NOT NULL,
        description TEXT,
        priority INT DEFAULT 1,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category_code (category_code),
        INDEX idx_priority (priority)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料大类别表'
    `);
    
    // 2. 创建物料子类别表
    console.log('📋 2. 创建物料子类别表...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS material_subcategories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_code VARCHAR(20) NOT NULL,
        material_name VARCHAR(100) NOT NULL,
        material_code VARCHAR(50),
        common_defects JSON,
        common_suppliers JSON,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_code) REFERENCES material_categories(category_code),
        INDEX idx_category_code (category_code),
        INDEX idx_material_name (material_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料子类别表'
    `);
    
    // 3. 创建供应商-大类别关联表
    console.log('🏢 3. 创建供应商-大类别关联表...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS supplier_category_mapping (
        id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_name VARCHAR(100) NOT NULL,
        category_code VARCHAR(20) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        quality_score DECIMAL(3,2) DEFAULT 0.00,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_code) REFERENCES material_categories(category_code),
        UNIQUE KEY uk_supplier_category (supplier_name, category_code),
        INDEX idx_supplier_name (supplier_name),
        INDEX idx_category_code (category_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='供应商-大类别关联表'
    `);
    
    // 4. 插入物料大类别数据
    console.log('📥 4. 插入物料大类别数据...');
    
    for (const [categoryCode, categoryInfo] of Object.entries(MATERIAL_CATEGORIES)) {
      await connection.execute(`
        INSERT INTO material_categories (category_code, category_name, description, priority)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        category_name = VALUES(category_name),
        description = VALUES(description),
        priority = VALUES(priority),
        updated_at = CURRENT_TIMESTAMP
      `, [categoryCode, categoryInfo.name, categoryInfo.description, categoryInfo.priority]);
      
      console.log(`✅ 插入大类别: ${categoryInfo.name}`);
    }
    
    // 5. 插入物料子类别数据
    console.log('\n📥 5. 插入物料子类别数据...');
    
    for (const [categoryCode, categoryInfo] of Object.entries(MATERIAL_CATEGORIES)) {
      for (const material of categoryInfo.materials) {
        await connection.execute(`
          INSERT INTO material_subcategories (category_code, material_name, common_defects, common_suppliers)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          common_defects = VALUES(common_defects),
          common_suppliers = VALUES(common_suppliers),
          updated_at = CURRENT_TIMESTAMP
        `, [
          categoryCode,
          material.name,
          JSON.stringify(material.defects),
          JSON.stringify(categoryInfo.suppliers)
        ]);
        
        console.log(`  ✅ 插入物料: ${material.name} -> ${categoryInfo.name}`);
      }
    }
    
    // 6. 插入供应商-大类别关联数据
    console.log('\n📥 6. 插入供应商-大类别关联数据...');
    
    for (const [categoryCode, categoryInfo] of Object.entries(MATERIAL_CATEGORIES)) {
      for (const supplier of categoryInfo.suppliers) {
        await connection.execute(`
          INSERT INTO supplier_category_mapping (supplier_name, category_code, is_primary)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE
          is_primary = VALUES(is_primary),
          updated_at = CURRENT_TIMESTAMP
        `, [supplier, categoryCode, true]);
        
        console.log(`  ✅ 关联供应商: ${supplier} -> ${categoryInfo.name}`);
      }
    }
    
    // 7. 验证数据插入结果
    console.log('\n📊 7. 验证数据插入结果...');
    
    const [categories] = await connection.execute('SELECT * FROM material_categories ORDER BY priority');
    console.log(`✅ 物料大类别: ${categories.length}个`);
    
    const [subcategories] = await connection.execute('SELECT * FROM material_subcategories');
    console.log(`✅ 物料子类别: ${subcategories.length}个`);
    
    const [mappings] = await connection.execute('SELECT * FROM supplier_category_mapping');
    console.log(`✅ 供应商关联: ${mappings.length}个`);
    
    console.log('\n🎉 物料大类别系统创建完成！');
    
  } catch (error) {
    console.error('❌ 创建物料大类别系统失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createMaterialCategorySystem();
