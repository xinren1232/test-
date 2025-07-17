import mysql from 'mysql2/promise';

async function checkProductionTables() {
  let connection;
  
  try {
    console.log('🔍 检查生产数据相关的表...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 查看所有表
    console.log('\n📋 步骤1: 查看所有表...');
    const [tables] = await connection.execute("SHOW TABLES");
    console.log('数据库中的所有表:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // 2. 查找包含production的表
    console.log('\n🔍 步骤2: 查找生产相关的表...');
    const productionTables = tables.filter(table => {
      const tableName = Object.values(table)[0].toLowerCase();
      return tableName.includes('production') || tableName.includes('online') || tableName.includes('factory');
    });
    
    if (productionTables.length > 0) {
      console.log('找到生产相关的表:');
      productionTables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`  ✅ ${tableName}`);
      });
    } else {
      console.log('❌ 没有找到生产相关的表');
    }
    
    // 3. 检查每个生产相关表的结构
    console.log('\n📊 步骤3: 检查生产相关表的结构...');
    
    for (const table of productionTables) {
      const tableName = Object.values(table)[0];
      console.log(`\n🔍 检查 ${tableName} 表:`);
      
      try {
        // 获取表结构
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log('  字段结构:');
        columns.forEach(col => {
          console.log(`    ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // 获取数据样本
        const [sample] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 1`);
        if (sample.length > 0) {
          console.log('  数据样本:');
          Object.entries(sample[0]).forEach(([field, value]) => {
            console.log(`    ${field}: ${value}`);
          });
        } else {
          console.log('  ⚠️ 表中没有数据');
        }
        
        // 获取记录数量
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`  📊 记录数量: ${count[0].count}条`);
        
      } catch (error) {
        console.log(`  ❌ 检查${tableName}表失败: ${error.message}`);
      }
    }
    
    // 4. 基于真实数据生成程序，推断应该有的生产数据字段
    console.log('\n💡 步骤4: 基于data_generator.js推断的生产数据字段...');
    
    const expectedProductionFields = {
      'id': 'VARCHAR - 生产记录ID',
      'factory': 'VARCHAR - 工厂名称',
      'productionLine': 'VARCHAR - 生产线',
      'baselineId': 'VARCHAR - 基线ID',
      'projectId': 'VARCHAR - 项目ID',
      'material_code': 'VARCHAR - 物料编码',
      'material_name': 'VARCHAR - 物料名称',
      'supplier': 'VARCHAR - 供应商',
      'batch_code': 'VARCHAR - 批次号',
      'defectRate': 'DECIMAL - 不良率',
      'defect': 'TEXT - 缺陷描述',
      'inspectionDate': 'DATE - 检验日期'
    };
    
    console.log('期望的生产数据字段:');
    Object.entries(expectedProductionFields).forEach(([field, desc]) => {
      console.log(`  ${field}: ${desc}`);
    });
    
    // 5. 检查是否需要创建生产数据表
    console.log('\n🔧 步骤5: 生产数据表建议...');
    
    if (productionTables.length === 0) {
      console.log('建议创建生产数据表:');
      console.log(`
CREATE TABLE production_online (
  id VARCHAR(50) PRIMARY KEY,
  factory VARCHAR(50) NOT NULL,
  production_line VARCHAR(20),
  baseline_id VARCHAR(20),
  project_id VARCHAR(20),
  material_code VARCHAR(50) NOT NULL,
  material_name VARCHAR(100),
  supplier VARCHAR(100),
  batch_code VARCHAR(50),
  defect_rate DECIMAL(5,2) DEFAULT 0,
  defect TEXT,
  inspection_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`);
    } else {
      console.log('已存在生产相关表，可以基于现有表结构修复规则映射');
    }
    
    console.log('\n🎉 生产数据表检查完成！');
    
  } catch (error) {
    console.error('❌ 检查生产数据表失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

checkProductionTables().catch(console.error);
