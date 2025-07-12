import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkOnlineTrackingRule() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🔍 检查在线跟踪查询规则的当前SQL...');
    const [rules] = await connection.execute(
      'SELECT intent_name, action_target FROM nlp_intent_rules WHERE intent_name = ?',
      ['在线跟踪查询']
    );

    if (rules.length > 0) {
      console.log('当前SQL查询:');
      console.log(rules[0].action_target);
    } else {
      console.log('未找到规则');
    }

    console.log('\n🔍 测试在线跟踪查询规则的实际执行...');

    // 模拟查询"电池"的在线跟踪
    const testQuery = `
SELECT
  material_name as 物料名称,
  supplier_name as 供应商,
  line as 生产线,
  project as 项目,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
  factory as 工厂,
  workshop as 车间,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 异常次数
FROM online_tracking
WHERE material_name = '电池'
ORDER BY online_date DESC
LIMIT 10
`;

    console.log('执行的SQL查询:');
    console.log(testQuery);

    const [results] = await connection.execute(testQuery);
    console.log(`\n查询结果 (${results.length}条记录):`);

    if (results.length > 0) {
      results.forEach((row, index) => {
        console.log(`${index + 1}. ${JSON.stringify(row, null, 2)}`);
      });
    } else {
      console.log('❌ 没有找到匹配的记录');

      // 检查是否有电池相关的记录
      const [allBattery] = await connection.execute(
        'SELECT material_name, COUNT(*) as count FROM online_tracking WHERE material_name LIKE "%电池%" GROUP BY material_name'
      );
      console.log('\n包含"电池"的记录统计:');
      allBattery.forEach(row => {
        console.log(`- ${row.material_name}: ${row.count}条记录`);
      });
    }

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await connection.end();
  }
}

checkOnlineTrackingRule();
