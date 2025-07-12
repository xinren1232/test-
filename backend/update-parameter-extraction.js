import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

async function updateParameterExtraction() {
  console.log('🔧 更新参数提取逻辑...\n');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 获取数据库中的真实供应商列表
    console.log('1. 获取数据库中的真实供应商列表...');
    const [suppliers] = await connection.execute(`
      SELECT DISTINCT supplier_name, COUNT(*) as count
      FROM inventory 
      WHERE supplier_name IS NOT NULL AND supplier_name != ''
      GROUP BY supplier_name
      ORDER BY count DESC
    `);
    
    console.log('数据库中的供应商:');
    const realSuppliers = suppliers.map(s => s.supplier_name);
    realSuppliers.forEach((supplier, index) => {
      console.log(`  ${index + 1}. ${supplier} (${suppliers[index].count} 条记录)`);
    });
    
    // 2. 获取数据库中的真实物料列表
    console.log('\n2. 获取数据库中的真实物料列表...');
    const [materials] = await connection.execute(`
      SELECT DISTINCT material_name, COUNT(*) as count
      FROM inventory 
      WHERE material_name IS NOT NULL AND material_name != ''
      GROUP BY material_name
      ORDER BY count DESC
    `);
    
    console.log('数据库中的物料:');
    const realMaterials = materials.map(m => m.material_name);
    realMaterials.forEach((material, index) => {
      console.log(`  ${index + 1}. ${material} (${materials[index].count} 条记录)`);
    });
    
    // 3. 获取数据库中的真实工厂列表
    console.log('\n3. 获取数据库中的真实工厂列表...');
    const [factories] = await connection.execute(`
      SELECT DISTINCT storage_location, COUNT(*) as count
      FROM inventory 
      WHERE storage_location IS NOT NULL AND storage_location != ''
      GROUP BY storage_location
      ORDER BY count DESC
    `);
    
    console.log('数据库中的工厂:');
    const realFactories = factories.map(f => f.storage_location);
    realFactories.forEach((factory, index) => {
      console.log(`  ${index + 1}. ${factory} (${factories[index].count} 条记录)`);
    });
    
    // 4. 生成更新的参数提取配置
    console.log('\n4. 生成更新的参数提取配置...');
    
    const updatedConfig = {
      suppliers: realSuppliers,
      materials: realMaterials.sort((a, b) => b.length - a.length), // 按长度排序，优先匹配长词
      factories: realFactories,
      // 添加供应商别名映射
      supplierAliases: {
        'BOE': ['BOE', '京东方', 'boe'],
        '聚龙': ['聚龙', 'julong'],
        '歌尔': ['歌尔', '歌尔股份', 'goer'],
        '天马': ['天马', 'tianma'],
        '华星': ['华星', '华星光电'],
        '欣冠': ['欣冠', 'xinguan'],
        '广正': ['广正', 'guangzheng']
      },
      // 添加物料别名映射
      materialAliases: {
        'LCD显示屏': ['LCD显示屏', 'LCD屏', '液晶屏', '显示屏'],
        'OLED显示屏': ['OLED显示屏', 'OLED屏', 'OLED', '有机屏'],
        '摄像头(CAM)': ['摄像头', 'CAM', '摄像头模组', '相机'],
        '电池盖': ['电池盖', '电池后盖'],
        '手机卡托': ['手机卡托', '卡托', 'SIM卡托'],
        '充电器': ['充电器', '充电头', '适配器']
      }
    };
    
    console.log('\n更新的配置:');
    console.log(`供应商数量: ${updatedConfig.suppliers.length}`);
    console.log(`物料数量: ${updatedConfig.materials.length}`);
    console.log(`工厂数量: ${updatedConfig.factories.length}`);
    
    // 5. 保存配置到文件
    const fs = await import('fs');
    const configContent = `// 自动生成的参数提取配置
// 生成时间: ${new Date().toISOString()}

export const REAL_SUPPLIERS = ${JSON.stringify(updatedConfig.suppliers, null, 2)};

export const REAL_MATERIALS = ${JSON.stringify(updatedConfig.materials, null, 2)};

export const REAL_FACTORIES = ${JSON.stringify(updatedConfig.factories, null, 2)};

export const SUPPLIER_ALIASES = ${JSON.stringify(updatedConfig.supplierAliases, null, 2)};

export const MATERIAL_ALIASES = ${JSON.stringify(updatedConfig.materialAliases, null, 2)};

// 参数提取函数
export function extractSupplierFromQuery(query) {
  const queryLower = query.toLowerCase();
  
  // 首先检查别名
  for (const [supplier, aliases] of Object.entries(SUPPLIER_ALIASES)) {
    for (const alias of aliases) {
      if (queryLower.includes(alias.toLowerCase())) {
        return supplier;
      }
    }
  }
  
  // 然后检查完整供应商名称
  for (const supplier of REAL_SUPPLIERS) {
    if (queryLower.includes(supplier.toLowerCase())) {
      return supplier;
    }
  }
  
  return null;
}

export function extractMaterialFromQuery(query) {
  const queryLower = query.toLowerCase();
  
  // 首先检查别名
  for (const [material, aliases] of Object.entries(MATERIAL_ALIASES)) {
    for (const alias of aliases) {
      if (queryLower.includes(alias.toLowerCase())) {
        return material;
      }
    }
  }
  
  // 然后按长度排序检查（避免短词匹配长词）
  for (const material of REAL_MATERIALS) {
    if (queryLower.includes(material.toLowerCase())) {
      return material;
    }
  }
  
  return null;
}

export function extractFactoryFromQuery(query) {
  const queryLower = query.toLowerCase();
  
  for (const factory of REAL_FACTORIES) {
    if (queryLower.includes(factory.toLowerCase())) {
      return factory;
    }
  }
  
  return null;
}
`;
    
    fs.writeFileSync('../backend/src/config/parameterExtractionConfig.js', configContent);
    console.log('\n✅ 配置文件已保存到: backend/src/config/parameterExtractionConfig.js');
    
    console.log('\n✅ 参数提取逻辑更新完成!');
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateParameterExtraction();
