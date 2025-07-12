import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function debugDataIssue() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 调试数据问题...\n');
    
    // 1. 检查online_tracking表的所有数据
    console.log('=== 检查online_tracking表数据 ===');
    const [allData] = await connection.execute('SELECT * FROM online_tracking');
    console.log(`表中总记录数: ${allData.length}`);
    
    if (allData.length > 0) {
      console.log('\n所有记录:');
      allData.forEach((row, index) => {
        console.log(`${index + 1}. ID: ${row.id}, 批次: ${row.batch_code}, 物料: ${row.material_name}, 供应商: ${row.supplier_name}`);
      });
      
      // 2. 测试具体的查询
      console.log('\n=== 测试具体查询 ===');
      
      // 测试精确匹配
      const [exactMatch] = await connection.execute(
        "SELECT * FROM online_tracking WHERE batch_code = '669033'"
      );
      console.log(`精确匹配 '669033': ${exactMatch.length} 条`);
      
      // 测试模糊匹配
      const [likeMatch] = await connection.execute(
        "SELECT * FROM online_tracking WHERE batch_code LIKE '%669033%'"
      );
      console.log(`模糊匹配 '%669033%': ${likeMatch.length} 条`);
      
      // 测试CONCAT函数
      const [concatMatch] = await connection.execute(
        "SELECT * FROM online_tracking WHERE batch_code LIKE CONCAT('%', ?, '%')",
        ['669033']
      );
      console.log(`CONCAT匹配: ${concatMatch.length} 条`);
      
      if (concatMatch.length > 0) {
        console.log('\n匹配的记录:');
        concatMatch.forEach((row, index) => {
          console.log(`${index + 1}. 批次: ${row.batch_code}, 物料: ${row.material_name}, 工厂: ${row.factory}`);
        });
      }
      
    } else {
      console.log('❌ online_tracking表为空，重新生成数据...');
      
      // 重新生成数据
      const testData = [
        {
          id: 'OT001',
          batch_code: '669033',
          material_code: 'SFK-金1250',
          material_name: '电池',
          supplier_name: '华为',
          online_date: '2024-07-10',
          factory: '深圳',
          project: 'Project-A',
          defect_rate: 0.02,
          exception_count: 1
        }
      ];
      
      for (const data of testData) {
        await connection.execute(`
          INSERT INTO online_tracking (
            id, batch_code, material_code, material_name, supplier_name,
            online_date, factory, project, defect_rate, exception_count,
            workshop, line, operator, inspection_date, notes, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW())
        `, [
          data.id,
          data.batch_code,
          data.material_code,
          data.material_name,
          data.supplier_name,
          data.online_date,
          data.factory,
          data.project,
          data.defect_rate,
          data.exception_count,
          '车间A',
          '生产线1',
          '操作员001',
          '测试数据'
        ]);
      }
      
      console.log('✅ 重新生成数据完成');
      
      // 再次测试查询
      const [newTest] = await connection.execute(
        "SELECT * FROM online_tracking WHERE batch_code LIKE CONCAT('%', ?, '%')",
        ['669033']
      );
      console.log(`重新生成后查询结果: ${newTest.length} 条`);
    }
    
    // 3. 测试完整的规则SQL
    console.log('\n=== 测试完整规则SQL ===');
    const ruleSQL = `
      SELECT
        factory as 工厂,
        project as 项目,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        batch_code as 批次号,
        COALESCE(defect_rate, 0) as 不良率,
        COALESCE(exception_count, 0) as 本周异常,
        DATE_FORMAT(online_date, '%Y-%m-%d') as 检验日期,
        COALESCE(notes, '') as 备注
      FROM online_tracking
      WHERE batch_code LIKE CONCAT('%', ?, '%')
      ORDER BY online_date DESC
      LIMIT 20
    `;
    
    const [ruleResult] = await connection.execute(ruleSQL, ['669033']);
    console.log(`规则SQL查询结果: ${ruleResult.length} 条`);
    
    if (ruleResult.length > 0) {
      console.log('\n查询结果:');
      ruleResult.forEach((row, index) => {
        console.log(`${index + 1}. ${row.物料名称} - ${row.供应商} (${row.工厂})`);
        console.log(`   批次: ${row.批次号}, 项目: ${row.项目}, 不良率: ${(row.不良率 * 100).toFixed(2)}%`);
      });
    }
    
    console.log('\n✅ 调试完成！');
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    await connection.end();
  }
}

debugDataIssue();
