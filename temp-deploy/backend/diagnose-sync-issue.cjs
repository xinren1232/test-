// 诊断数据同步后的问题
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function diagnoseSyncIssue() {
  let connection;
  
  try {
    console.log('🔍 诊断数据同步后的问题...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查所有相关表的结构
    console.log('\n📋 检查表结构:');
    
    const tables = ['inventory', 'lab_tests', 'online_tracking', 'frontend_data_sync'];
    
    for (const table of tables) {
      try {
        console.log(`\n${table}表结构:`);
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        columns.forEach(col => {
          console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'}`);
        });
        
        // 检查数据量
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  数据量: ${count[0].count} 条`);
        
        // 检查数据样本
        const [sample] = await connection.execute(`SELECT * FROM ${table} LIMIT 1`);
        if (sample.length > 0) {
          console.log(`  字段名: ${Object.keys(sample[0]).join(', ')}`);
        }
        
      } catch (error) {
        console.log(`❌ ${table}表检查失败: ${error.message}`);
      }
    }
    
    // 2. 检查frontend_data_sync表的数据
    console.log('\n📊 检查frontend_data_sync表数据:');
    try {
      const [syncData] = await connection.execute(`
        SELECT data_type, COUNT(*) as count 
        FROM frontend_data_sync 
        GROUP BY data_type
      `);
      
      if (syncData.length > 0) {
        console.log('数据类型统计:');
        syncData.forEach(row => {
          console.log(`  ${row.data_type}: ${row.count} 条`);
        });
        
        // 检查每种类型的数据样本
        for (const row of syncData) {
          console.log(`\n${row.data_type}数据样本:`);
          const [sample] = await connection.execute(`
            SELECT data_content 
            FROM frontend_data_sync 
            WHERE data_type = ? 
            LIMIT 1
          `, [row.data_type]);
          
          if (sample.length > 0 && sample[0].data_content) {
            try {
              const data = JSON.parse(sample[0].data_content);
              if (Array.isArray(data) && data.length > 0) {
                console.log(`  字段: ${Object.keys(data[0]).join(', ')}`);
                console.log(`  第一条数据:`);
                Object.entries(data[0]).forEach(([key, value]) => {
                  const displayValue = typeof value === 'string' && value.length > 30 
                    ? value.substring(0, 30) + '...' 
                    : value;
                  console.log(`    ${key}: ${displayValue}`);
                });
              }
            } catch (parseError) {
              console.log(`  数据解析失败: ${parseError.message}`);
            }
          }
        }
      } else {
        console.log('frontend_data_sync表无数据');
      }
    } catch (error) {
      console.log(`❌ frontend_data_sync表检查失败: ${error.message}`);
    }
    
    // 3. 测试规则SQL
    console.log('\n🧪 测试规则SQL:');
    
    const testSQLs = [
      {
        name: '库存基础查询',
        sql: `SELECT 
          SUBSTRING_INDEX(storage_location, '-', 1) as '工厂',
          material_name as '物料名称',
          supplier_name as '供应商',
          quantity as '数量',
          status as '状态'
        FROM inventory LIMIT 1`
      },
      {
        name: '检验数据查询',
        sql: `SELECT 
          test_id as '测试编号',
          material_name as '物料名称',
          test_result as '测试结果'
        FROM lab_tests LIMIT 1`
      },
      {
        name: '生产数据查询',
        sql: `SELECT 
          id as '测试编号',
          material_name as '物料名称',
          factory as '工厂'
        FROM online_tracking LIMIT 1`
      }
    ];
    
    for (const test of testSQLs) {
      try {
        console.log(`\n测试: ${test.name}`);
        const [results] = await connection.execute(test.sql);
        console.log(`✅ 成功: 返回 ${results.length} 条记录`);
        
        if (results.length > 0) {
          console.log(`  字段: ${Object.keys(results[0]).join(', ')}`);
        }
      } catch (error) {
        console.log(`❌ 失败: ${error.message}`);
        
        // 尝试简化查询
        const simplifiedSQL = test.sql.replace(/SUBSTRING_INDEX\([^,]+,\s*'[^']+',\s*[^)]+\)/g, 'storage_location');
        try {
          console.log(`  尝试简化查询...`);
          const [simpleResults] = await connection.execute(simplifiedSQL);
          console.log(`  ✅ 简化查询成功: ${simpleResults.length} 条记录`);
        } catch (simpleError) {
          console.log(`  ❌ 简化查询也失败: ${simpleError.message}`);
        }
      }
    }
    
    // 4. 检查字段是否存在
    console.log('\n🔍 检查关键字段是否存在:');
    
    const keyFields = {
      inventory: ['storage_location', 'material_name', 'supplier_name', 'quantity', 'status'],
      lab_tests: ['test_id', 'material_name', 'test_result'],
      online_tracking: ['id', 'material_name', 'factory']
    };
    
    for (const [table, fields] of Object.entries(keyFields)) {
      console.log(`\n${table}表字段检查:`);
      
      for (const field of fields) {
        try {
          await connection.execute(`SELECT ${field} FROM ${table} LIMIT 1`);
          console.log(`  ✅ ${field}: 存在`);
        } catch (error) {
          console.log(`  ❌ ${field}: 不存在或有问题`);
        }
      }
    }
    
    console.log('\n🎉 诊断完成！');
    
  } catch (error) {
    console.error('❌ 诊断失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

diagnoseSyncIssue();
