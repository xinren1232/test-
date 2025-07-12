import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkAndGenerateData() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查数据库中的数据情况...\n');
    
    // 检查各表的记录数
    const [invCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    const [labCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    
    console.log('📊 当前数据库记录数:');
    console.log(`  📦 库存表(inventory): ${invCount[0].count} 条`);
    console.log(`  🧪 测试表(lab_tests): ${labCount[0].count} 条`);
    console.log(`  🏭 上线跟踪表(online_tracking): ${onlineCount[0].count} 条`);
    
    // 如果online_tracking表为空，生成一些测试数据
    if (onlineCount[0].count === 0) {
      console.log('\n🔧 online_tracking表为空，生成测试数据...');
      
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
        },
        {
          id: 'OT002', 
          batch_code: '772174',
          material_code: 'CS-M-金3351',
          material_name: '中框',
          supplier_name: '小米',
          online_date: '2024-07-09',
          factory: '北京',
          project: 'Project-B',
          defect_rate: 0.01,
          exception_count: 0
        },
        {
          id: 'OT003',
          batch_code: '784281',
          material_code: 'DS-L-银5140',
          material_name: 'LCD显示屏',
          supplier_name: 'BOE',
          online_date: '2024-07-08',
          factory: '上海',
          project: 'Project-C',
          defect_rate: 0.03,
          exception_count: 2
        },
        {
          id: 'OT004',
          batch_code: '782043',
          material_code: 'BAT-银4687',
          material_name: '电池',
          supplier_name: '华为',
          online_date: '2024-07-07',
          factory: '深圳',
          project: 'Project-A',
          defect_rate: 0.015,
          exception_count: 1
        },
        {
          id: 'OT005',
          batch_code: '407281',
          material_code: 'CAM-天6870',
          material_name: '摄像头(CAM)',
          supplier_name: '天马',
          online_date: '2024-07-06',
          factory: '广州',
          project: 'Project-D',
          defect_rate: 0.025,
          exception_count: 3
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
      
      console.log(`✅ 已生成 ${testData.length} 条online_tracking测试数据`);
    }
    
    // 如果lab_tests表数据不足，生成一些NG测试数据
    if (labCount[0].count < 10) {
      console.log('\n🔧 生成一些NG测试数据...');
      
      const ngTestData = [
        {
          test_id: 'TEST001',
          batch_code: '669033',
          material_code: 'SFK-金1250',
          material_name: '电池',
          supplier_name: '华为',
          test_result: 'NG',
          defect_desc: '电压不稳定'
        },
        {
          test_id: 'TEST002',
          batch_code: '772174', 
          material_code: 'CS-M-金3351',
          material_name: '中框',
          supplier_name: '小米',
          test_result: 'NG',
          defect_desc: '尺寸偏差'
        },
        {
          test_id: 'TEST003',
          batch_code: '784281',
          material_code: 'DS-L-银5140',
          material_name: 'LCD显示屏',
          supplier_name: 'BOE',
          test_result: 'PASS',
          defect_desc: ''
        }
      ];
      
      for (const data of ngTestData) {
        await connection.execute(`
          INSERT INTO lab_tests (
            test_id, batch_code, material_code, material_name, supplier_name,
            test_date, test_result, defect_desc, project_id, baseline_id,
            test_item, conclusion, tester, notes, created_at
          ) VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          data.test_id,
          data.batch_code,
          data.material_code,
          data.material_name,
          data.supplier_name,
          data.test_result,
          data.defect_desc,
          'Project-Test',
          'Baseline-V1.0',
          '功能测试',
          data.test_result === 'PASS' ? '合格' : '不合格',
          '测试员001',
          '测试数据'
        ]);
      }
      
      console.log(`✅ 已生成 ${ngTestData.length} 条lab_tests测试数据`);
    }
    
    // 验证数据生成结果
    console.log('\n=== 验证数据生成结果 ===');
    
    // 测试批次669033的上线情况查询
    const [batchOnlineData] = await connection.execute(`
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
      WHERE batch_code LIKE '%669033%'
      ORDER BY online_date DESC
      LIMIT 20
    `);
    
    console.log(`\n🔍 批次669033上线情况查询结果 (${batchOnlineData.length}条):`);
    batchOnlineData.forEach((row, index) => {
      console.log(`${index + 1}. ${row.物料名称} - ${row.供应商} (${row.工厂})`);
      console.log(`   批次: ${row.批次号}, 项目: ${row.项目}, 不良率: ${(row.不良率 * 100).toFixed(2)}%`);
    });
    
    // 测试NG测试结果查询
    const [ngTestData] = await connection.execute(`
      SELECT
        test_id as 测试编号,
        DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
        project_id as 项目,
        baseline_id as 基线,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        test_result as 测试结果,
        COALESCE(defect_desc, '') as 不合格描述,
        COALESCE(notes, '') as 备注
      FROM lab_tests
      WHERE test_result = 'NG'
      ORDER BY test_date DESC
      LIMIT 10
    `);
    
    console.log(`\n🧪 NG测试结果查询 (${ngTestData.length}条):`);
    ngTestData.forEach((row, index) => {
      console.log(`${index + 1}. ${row.物料名称} - ${row.供应商}`);
      console.log(`   测试编号: ${row.测试编号}, 不合格描述: ${row.不合格描述}`);
    });
    
    console.log('\n✅ 数据检查和生成完成！');
    
  } catch (error) {
    console.error('❌ 操作失败:', error);
  } finally {
    await connection.end();
  }
}

checkAndGenerateData();
