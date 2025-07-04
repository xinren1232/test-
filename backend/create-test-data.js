/**
 * 创建测试数据
 * 基于真实数据结构创建测试数据
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

// 真实供应商数据
const suppliers = [
  '歌尔股份', '蓝思科技', '比亚迪电子', '领益智造', '通达集团', '安洁科技',
  '舜宇光学', '大立光电', '欧菲光', '丘钛科技', '信利光电',
  '宁德时代', '比亚迪', '欣旺达', '德赛电池', 'ATL',
  '瑞声科技', 'AAC', '美律实业', '豪威科技',
  '立讯精密', '富士康', '和硕', '广达', '仁宝'
];

// 真实工厂数据
const factories = ['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂'];

// 真实物料数据
const materials = [
  { name: '手机壳料-后盖', code: 'SHKH', category: '结构件-量产管理组' },
  { name: '手机壳料-中框', code: 'SHKZ', category: '结构件-量产管理组' },
  { name: '手机卡托', code: 'SHKT', category: '结构件-量产管理组' },
  { name: 'LCD显示屏', code: 'LCD', category: '显示与光学类' },
  { name: 'OLED显示屏', code: 'OLED', category: '显示与光学类' },
  { name: 'PCB主板', code: 'PCB', category: '电子贴片料' },
  { name: '电池', code: 'BAT', category: '电池与充电类' },
  { name: '喇叭', code: 'SPK', category: '声学与音频类' }
];

const statuses = ['正常', '风险', '冻结'];
const riskLevels = ['low', 'medium', 'high'];

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateBatchCode() {
  return (Math.floor(Math.random() * 900000) + 100000).toString();
}

function generateMaterialCode(prefix) {
  return prefix + Math.floor(Math.random() * 10000).toString().padStart(6, '0');
}

async function createTestData() {
  console.log('🚀 开始创建测试数据...\n');
  
  let connection;
  try {
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 清空现有数据
    console.log('🗑️ 清空现有数据...');
    await connection.execute('DELETE FROM inventory');
    
    // 创建30条测试数据
    console.log('📦 创建库存数据...');
    for (let i = 1; i <= 30; i++) {
      const material = randomChoice(materials);
      const supplier = randomChoice(suppliers);
      const factory = randomChoice(factories);
      const status = randomChoice(statuses);
      const riskLevel = randomChoice(riskLevels);
      const batchCode = generateBatchCode();
      const materialCode = generateMaterialCode(material.code);
      const quantity = Math.floor(Math.random() * 1000) + 100;
      
      await connection.execute(`
        INSERT INTO inventory (
          id, batch_code, material_code, material_name, material_type,
          supplier_name, quantity, inbound_time, storage_location,
          status, risk_level, inspector, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        `INV-${i.toString().padStart(3, '0')}`,
        batchCode,
        materialCode,
        material.name,
        material.category,
        supplier,
        quantity,
        new Date().toISOString().slice(0, 19).replace('T', ' '),
        factory,
        status,
        riskLevel,
        '系统管理员',
        `测试数据 ${i}`
      ]);
      
      if (i % 10 === 0) {
        console.log(`已创建 ${i}/30 条库存数据`);
      }
    }
    
    // 验证数据
    console.log('\n🔍 验证数据创建结果...');
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    console.log(`✅ 库存表中共有 ${rows[0].count} 条记录`);
    
    // 显示供应商统计
    const [suppliers_stats] = await connection.execute(`
      SELECT supplier_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY supplier_name 
      ORDER BY count DESC 
      LIMIT 5
    `);
    
    console.log('\n📊 供应商统计 (前5名):');
    suppliers_stats.forEach((supplier, index) => {
      console.log(`${index + 1}. ${supplier.supplier_name}: ${supplier.count} 条记录`);
    });
    
    // 显示工厂统计
    const [factories_stats] = await connection.execute(`
      SELECT storage_location, COUNT(*) as count 
      FROM inventory 
      GROUP BY storage_location 
      ORDER BY count DESC
    `);
    
    console.log('\n📊 工厂统计:');
    factories_stats.forEach((factory, index) => {
      console.log(`${index + 1}. ${factory.storage_location}: ${factory.count} 条记录`);
    });
    
    console.log('\n🎉 测试数据创建完成！');
    
  } catch (error) {
    console.error('❌ 数据创建失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

// 运行创建
createTestData().catch(console.error);
