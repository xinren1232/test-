// 验证是否从真实数据表调取数据
const mysql = require('mysql2/promise');
const axios = require('axios');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function verifyRealData() {
  let connection;
  
  try {
    console.log('🔍 验证数据源真实性...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 直接查询真实数据表
    console.log('\n📋 直接查询inventory表前5条数据:');
    const [realData] = await connection.execute(`
      SELECT * FROM inventory ORDER BY created_at DESC LIMIT 5
    `);
    
    console.log('真实数据表内容:');
    realData.forEach((item, index) => {
      console.log(`\n${index + 1}. ID: ${item.id}`);
      console.log(`   物料编码: ${item.material_code}`);
      console.log(`   物料名称: ${item.material_name}`);
      console.log(`   物料类型: ${item.material_type}`);
      console.log(`   供应商: ${item.supplier_name}`);
      console.log(`   批次号: ${item.batch_code}`);
      console.log(`   数量: ${item.quantity}`);
      console.log(`   状态: ${item.status}`);
      console.log(`   存储位置: ${item.storage_location}`);
      console.log(`   入库时间: ${item.inbound_time}`);
      console.log(`   备注: ${item.notes}`);
    });
    
    // 2. 通过API查询数据
    console.log('\n🌐 通过API查询库存数据:');
    const apiResponse = await axios.post('http://localhost:3001/api/assistant/query', {
      query: '查询库存信息'
    });
    
    if (apiResponse.data.success && apiResponse.data.tableData.length > 0) {
      console.log('API返回数据:');
      const apiData = apiResponse.data.tableData.slice(0, 5);
      
      apiData.forEach((item, index) => {
        console.log(`\n${index + 1}. API数据:`);
        Object.entries(item).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      });
      
      // 3. 对比数据一致性
      console.log('\n🔍 数据一致性对比:');
      
      for (let i = 0; i < Math.min(realData.length, apiData.length); i++) {
        const real = realData[i];
        const api = apiData[i];
        
        console.log(`\n对比第${i + 1}条数据:`);
        
        // 检查关键字段
        const checks = [
          { field: '物料编码', real: real.material_code, api: api.物料编码 },
          { field: '物料名称', real: real.material_name, api: api.物料名称 },
          { field: '供应商', real: real.supplier_name, api: api.供应商 },
          { field: '批次号', real: real.batch_code, api: api.批次号 },
          { field: '数量', real: real.quantity.toString(), api: api.数量 },
          { field: '状态', real: real.status, api: api.状态 }
        ];
        
        checks.forEach(check => {
          const match = check.real === check.api;
          console.log(`   ${check.field}: ${match ? '✅' : '❌'} 真实[${check.real}] vs API[${check.api}]`);
        });
      }
      
    } else {
      console.log('❌ API查询失败');
    }
    
    // 4. 检查是否存在frontend_data_sync表
    console.log('\n📊 检查frontend_data_sync表:');
    try {
      const [syncData] = await connection.execute(`
        SELECT data_type, LENGTH(data_content) as content_length, created_at 
        FROM frontend_data_sync 
        WHERE data_type = 'inventory'
        ORDER BY created_at DESC 
        LIMIT 1
      `);
      
      if (syncData.length > 0) {
        console.log('⚠️  发现frontend_data_sync表存在inventory数据:');
        console.log(`   数据类型: ${syncData[0].data_type}`);
        console.log(`   内容长度: ${syncData[0].content_length} 字符`);
        console.log(`   创建时间: ${syncData[0].created_at}`);
        
        // 获取同步表的实际内容
        const [syncContent] = await connection.execute(`
          SELECT data_content FROM frontend_data_sync 
          WHERE data_type = 'inventory'
          ORDER BY created_at DESC 
          LIMIT 1
        `);
        
        if (syncContent.length > 0) {
          try {
            const syncInventory = JSON.parse(syncContent[0].data_content);
            console.log(`\n同步表中的库存数据 (前3条):`);
            syncInventory.slice(0, 3).forEach((item, index) => {
              console.log(`\n${index + 1}. 同步数据:`);
              Object.entries(item).forEach(([key, value]) => {
                console.log(`   ${key}: ${value}`);
              });
            });
          } catch (error) {
            console.log('❌ 解析同步表数据失败:', error.message);
          }
        }
        
      } else {
        console.log('✅ frontend_data_sync表中没有inventory数据');
      }
      
    } catch (error) {
      console.log('✅ frontend_data_sync表不存在或查询失败');
    }
    
    console.log('\n🎯 验证完成！');
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyRealData();
