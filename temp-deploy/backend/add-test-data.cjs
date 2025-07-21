// 添加测试数据
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function addTestData() {
  let connection;
  try {
    console.log('📊 添加测试数据...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查现有数据
    console.log('1. 检查现有数据:');
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    
    for (const table of tables) {
      const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`  ${table}: ${count[0].count} 条数据`);
    }
    
    // 2. 添加库存数据
    console.log('\n2. 添加库存测试数据:');
    
    const inventoryData = [
      ['OLED显示屏_12.9寸', '聚龙光电', 'OLED显示屏', 150, '正常', 'A区-01-001', '2024-01-15 10:30:00', '低'],
      ['LCD显示屏_10.1寸', '天马微电子', 'LCD显示屏', 200, '正常', 'A区-01-002', '2024-01-16 14:20:00', '低'],
      ['触控IC芯片_FT8719', 'BOE科技', '触控芯片', 500, '正常', 'B区-02-001', '2024-01-17 09:15:00', '中'],
      ['摄像头模组_48MP', '华星光电', '摄像头', 80, '正常', 'C区-03-001', '2024-01-18 16:45:00', '低'],
      ['电池模组_5000mAh', '广正新能源', '电池', 120, '正常', 'D区-04-001', '2024-01-19 11:30:00', '中'],
      ['充电器_65W快充', '奥海科技', '充电器', 300, '正常', 'E区-05-001', '2024-01-20 13:20:00', '低'],
      ['扬声器_立体声', '辉阳声学', '扬声器', 250, '正常', 'F区-06-001', '2024-01-21 15:10:00', '低'],
      ['结构件_铝合金边框', '理威精密', '结构件', 180, '正常', 'G区-07-001', '2024-01-22 08:45:00', '中'],
      ['光学镜头_广角', '风华高科', '光学器件', 90, '正常', 'H区-08-001', '2024-01-23 12:15:00', '低'],
      ['包装盒_环保材质', '维科包装', '包装材料', 1000, '正常', 'I区-09-001', '2024-01-24 14:30:00', '低']
    ];
    
    for (const data of inventoryData) {
      try {
        await connection.execute(`
          INSERT INTO inventory 
          (material_name, supplier_name, material_type, quantity, status, storage_location, inbound_time, risk_level)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, data);
        console.log(`  ✅ 添加库存: ${data[0]}`);
      } catch (error) {
        if (!error.message.includes('Duplicate entry')) {
          console.log(`  ❌ 添加失败: ${data[0]} - ${error.message}`);
        }
      }
    }
    
    // 3. 添加检验数据
    console.log('\n3. 添加检验测试数据:');
    
    const labTestData = [
      ['TEST001', 'OLED显示屏_12.9寸', '聚龙光电', '合格', '合格', '2024-01-15 11:00:00', '张工', '显示效果良好'],
      ['TEST002', 'LCD显示屏_10.1寸', '天马微电子', '合格', '合格', '2024-01-16 15:00:00', '李工', '色彩还原准确'],
      ['TEST003', '触控IC芯片_FT8719', 'BOE科技', '不合格', '不合格', '2024-01-17 10:00:00', '王工', '响应延迟超标'],
      ['TEST004', '摄像头模组_48MP', '华星光电', '合格', '合格', '2024-01-18 17:00:00', '赵工', '成像清晰度达标'],
      ['TEST005', '电池模组_5000mAh', '广正新能源', '合格', '合格', '2024-01-19 12:00:00', '陈工', '容量测试通过'],
      ['TEST006', '充电器_65W快充', '奥海科技', '合格', '合格', '2024-01-20 14:00:00', '刘工', '充电效率符合要求'],
      ['TEST007', '扬声器_立体声', '辉阳声学', '不合格', '不合格', '2024-01-21 16:00:00', '杨工', '音质失真严重'],
      ['TEST008', '结构件_铝合金边框', '理威精密', '合格', '合格', '2024-01-22 09:00:00', '周工', '强度测试通过'],
      ['TEST009', '光学镜头_广角', '风华高科', '合格', '合格', '2024-01-23 13:00:00', '吴工', '光学性能良好'],
      ['TEST010', '包装盒_环保材质', '维科包装', '合格', '合格', '2024-01-24 15:00:00', '郑工', '环保标准达标']
    ];
    
    for (const data of labTestData) {
      try {
        await connection.execute(`
          INSERT INTO lab_tests 
          (test_id, material_name, supplier_name, test_result, conclusion, test_date, tester, defect_desc)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, data);
        console.log(`  ✅ 添加检验: ${data[0]}`);
      } catch (error) {
        if (!error.message.includes('Duplicate entry')) {
          console.log(`  ❌ 添加失败: ${data[0]} - ${error.message}`);
        }
      }
    }
    
    // 4. 添加上线数据
    console.log('\n4. 添加上线测试数据:');
    
    const onlineTrackingData = [
      ['BATCH001', 'OLED显示屏_12.9寸', '聚龙光电', '深圳工厂', 0.02, 0, '2024-01-16 08:00:00', '操作员A'],
      ['BATCH002', 'LCD显示屏_10.1寸', '天马微电子', '东莞工厂', 0.01, 0, '2024-01-17 08:30:00', '操作员B'],
      ['BATCH003', '触控IC芯片_FT8719', 'BOE科技', '苏州工厂', 0.08, 2, '2024-01-18 09:00:00', '操作员C'],
      ['BATCH004', '摄像头模组_48MP', '华星光电', '武汉工厂', 0.03, 1, '2024-01-19 09:30:00', '操作员D'],
      ['BATCH005', '电池模组_5000mAh', '广正新能源', '惠州工厂', 0.02, 0, '2024-01-20 10:00:00', '操作员E'],
      ['BATCH006', '充电器_65W快充', '奥海科技', '佛山工厂', 0.01, 0, '2024-01-21 10:30:00', '操作员F'],
      ['BATCH007', '扬声器_立体声', '辉阳声学', '中山工厂', 0.06, 1, '2024-01-22 11:00:00', '操作员G'],
      ['BATCH008', '结构件_铝合金边框', '理威精密', '江门工厂', 0.02, 0, '2024-01-23 11:30:00', '操作员H'],
      ['BATCH009', '光学镜头_广角', '风华高科', '珠海工厂', 0.03, 0, '2024-01-24 12:00:00', '操作员I'],
      ['BATCH010', '包装盒_环保材质', '维科包装', '汕头工厂', 0.01, 0, '2024-01-25 12:30:00', '操作员J']
    ];
    
    for (const data of onlineTrackingData) {
      try {
        await connection.execute(`
          INSERT INTO online_tracking 
          (batch_code, material_name, supplier_name, factory, defect_rate, exception_count, online_date, operator)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, data);
        console.log(`  ✅ 添加上线: ${data[0]}`);
      } catch (error) {
        if (!error.message.includes('Duplicate entry')) {
          console.log(`  ❌ 添加失败: ${data[0]} - ${error.message}`);
        }
      }
    }
    
    // 5. 验证数据添加结果
    console.log('\n5. 验证数据添加结果:');
    
    for (const table of tables) {
      const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`  ${table}: ${count[0].count} 条数据`);
      
      if (count[0].count > 0) {
        const [sample] = await connection.execute(`SELECT * FROM ${table} LIMIT 1`);
        console.log(`    示例字段: ${Object.keys(sample[0]).join(', ')}`);
      }
    }
    
    // 6. 测试查询
    console.log('\n6. 测试查询:');
    
    const testQueries = [
      {
        name: '全测试查询',
        sql: `SELECT 
          material_name as 物料名称,
          supplier_name as 供应商,
          CAST(quantity AS CHAR) as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库日期
        FROM inventory 
        WHERE status = '正常'
        ORDER BY inbound_time DESC
        LIMIT 5`
      },
      {
        name: '聚龙供应商查询',
        sql: `SELECT 
          material_name as 物料名称,
          supplier_name as 供应商,
          CAST(quantity AS CHAR) as 数量,
          status as 状态
        FROM inventory 
        WHERE supplier_name LIKE '%聚龙%'
        LIMIT 5`
      },
      {
        name: '检验结果查询',
        sql: `SELECT 
          test_id as 测试编号,
          material_name as 物料名称,
          test_result as 测试结果,
          conclusion as 结论
        FROM lab_tests 
        LIMIT 5`
      }
    ];
    
    for (const query of testQueries) {
      try {
        const [results] = await connection.execute(query.sql);
        console.log(`  ✅ ${query.name}: ${results.length} 条数据`);
        if (results.length > 0) {
          console.log(`    第一条: ${JSON.stringify(results[0])}`);
        }
      } catch (error) {
        console.log(`  ❌ ${query.name}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 测试数据添加完成！');
    
  } catch (error) {
    console.error('❌ 添加测试数据失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addTestData();
