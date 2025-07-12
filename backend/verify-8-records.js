import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function verify8Records() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 验证批次669033的8条上线履历记录...\n');
    
    // 1. 检查批次669033的所有记录
    const [allRecords] = await connection.execute(
      'SELECT * FROM online_tracking WHERE batch_code = "669033" ORDER BY online_date ASC'
    );
    
    console.log(`✅ 找到 ${allRecords.length} 条批次669033的记录:`);
    allRecords.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}`);
      console.log(`   工厂: ${record.factory}, 车间: ${record.workshop}, 生产线: ${record.line}`);
      console.log(`   日期: ${record.online_date}, 不良率: ${(record.defect_rate * 100).toFixed(2)}%`);
      console.log(`   备注: ${record.notes}\n`);
    });
    
    // 2. 测试查询SQL
    console.log('=== 测试查询SQL ===');
    const testSQL = `
SELECT
  factory as 工厂,
  'Baseline-V1.0' as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(COALESCE(defect_rate, 0) * 100, 2), '%') as 不良率,
  COALESCE(exception_count, 0) as 本周异常,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
WHERE batch_code LIKE CONCAT('%', ?, '%')
ORDER BY online_date DESC
LIMIT 20`;
    
    const [queryResult] = await connection.execute(testSQL, ['669033']);
    console.log(`查询结果: ${queryResult.length} 条记录`);
    
    queryResult.forEach((row, index) => {
      console.log(`${index + 1}. 工厂: ${row.工厂}, 基线: ${row.基线}, 项目: ${row.项目}`);
      console.log(`   物料: ${row.物料名称} (${row.物料编码}), 供应商: ${row.供应商}`);
      console.log(`   批次: ${row.批次号}, 不良率: ${row.不良率}, 异常: ${row.本周异常}`);
      console.log(`   检验日期: ${row.检验日期}, 备注: ${row.备注}\n`);
    });
    
    // 3. 检查规则是否正确更新
    console.log('=== 检查规则是否正确更新 ===');
    const [ruleCheck] = await connection.execute(
      'SELECT intent_name, action_target FROM nlp_intent_rules WHERE intent_name = "批次上线情况查询"'
    );
    
    if (ruleCheck.length > 0) {
      console.log('规则内容:');
      console.log(ruleCheck[0].action_target);
    } else {
      console.log('❌ 未找到批次上线情况查询规则');
    }
    
    if (queryResult.length === 8) {
      console.log('\n✅ 验证成功！批次669033有8条上线履历记录，查询正常工作。');
    } else {
      console.log(`\n❌ 验证失败！期望8条记录，实际查询到${queryResult.length}条记录。`);
    }
    
  } catch (error) {
    console.error('❌ 验证失败:', error);
  } finally {
    await connection.end();
  }
}

verify8Records();
