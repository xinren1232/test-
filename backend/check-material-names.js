/**
 * 检查数据库中的实际物料名称
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

async function checkMaterialNames() {
  let connection;
  
  try {
    console.log('🔍 检查数据库中的物料名称...');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查所有物料名称
    console.log('\n📦 库存表中的物料名称:');
    const [inventoryMaterials] = await connection.execute(`
      SELECT DISTINCT material_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY material_name 
      ORDER BY count DESC 
      LIMIT 20
    `);
    
    inventoryMaterials.forEach(item => {
      console.log(`   ${item.material_name}: ${item.count} 条记录`);
    });
    
    // 2. 检查测试表中的物料名称
    console.log('\n🧪 测试表中的物料名称:');
    const [testMaterials] = await connection.execute(`
      SELECT DISTINCT material_name, COUNT(*) as count 
      FROM lab_tests 
      GROUP BY material_name 
      ORDER BY count DESC 
      LIMIT 20
    `);
    
    testMaterials.forEach(item => {
      console.log(`   ${item.material_name}: ${item.count} 条记录`);
    });
    
    // 3. 检查包含"电池"的物料
    console.log('\n🔋 包含"电池"的物料:');
    const [batteryMaterials] = await connection.execute(`
      SELECT DISTINCT material_name, COUNT(*) as count 
      FROM inventory 
      WHERE material_name LIKE '%电池%'
      GROUP BY material_name 
      ORDER BY count DESC
    `);
    
    if (batteryMaterials.length > 0) {
      batteryMaterials.forEach(item => {
        console.log(`   ${item.material_name}: ${item.count} 条记录`);
      });
    } else {
      console.log('   ❌ 没有找到包含"电池"的物料');
    }
    
    // 4. 检查供应商名称
    console.log('\n🏢 供应商名称:');
    const [suppliers] = await connection.execute(`
      SELECT DISTINCT supplier_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY supplier_name 
      ORDER BY count DESC 
      LIMIT 15
    `);
    
    suppliers.forEach(item => {
      console.log(`   ${item.supplier_name}: ${item.count} 条记录`);
    });
    
    // 5. 检查包含"BOE"的供应商
    console.log('\n🔍 包含"BOE"的供应商:');
    const [boeSuppliers] = await connection.execute(`
      SELECT DISTINCT supplier_name, COUNT(*) as count 
      FROM inventory 
      WHERE supplier_name LIKE '%BOE%'
      GROUP BY supplier_name 
      ORDER BY count DESC
    `);
    
    if (boeSuppliers.length > 0) {
      boeSuppliers.forEach(item => {
        console.log(`   ${item.supplier_name}: ${item.count} 条记录`);
      });
    } else {
      console.log('   ❌ 没有找到包含"BOE"的供应商');
    }
    
    // 6. 检查状态
    console.log('\n📊 库存状态:');
    const [statuses] = await connection.execute(`
      SELECT DISTINCT status, COUNT(*) as count 
      FROM inventory 
      GROUP BY status 
      ORDER BY count DESC
    `);
    
    statuses.forEach(item => {
      console.log(`   ${item.status}: ${item.count} 条记录`);
    });
    
    // 7. 测试具体查询
    console.log('\n🧪 测试具体查询:');
    
    // 测试电池查询
    const [batteryQuery] = await connection.execute(`
      SELECT COUNT(*) as 批次数, SUM(quantity) as 总数量,
             COUNT(DISTINCT supplier_name) as 供应商数量,
             COUNT(CASE WHEN status = '风险' THEN 1 END) as 风险批次
      FROM inventory WHERE material_name = ?
    `, ['电池']);
    
    console.log('   精确匹配"电池":', batteryQuery[0]);
    
    // 测试BOE查询
    const [boeQuery] = await connection.execute(`
      SELECT COUNT(*) as 批次数, SUM(quantity) as 总数量,
             COUNT(DISTINCT material_name) as 物料种类
      FROM inventory WHERE supplier_name = ?
    `, ['BOE']);
    
    console.log('   精确匹配"BOE":', boeQuery[0]);
    
    // 测试风险状态查询
    const [riskQuery] = await connection.execute(`
      SELECT COUNT(*) as 风险记录数
      FROM inventory WHERE status = ?
    `, ['风险']);
    
    console.log('   精确匹配"风险"状态:', riskQuery[0]);
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkMaterialNames();
