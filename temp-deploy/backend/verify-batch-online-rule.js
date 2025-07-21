import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function verifyBatchOnlineRule() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 验证批次上线情况查询规则...\n');
    
    // 查看当前规则的SQL
    const [rules] = await connection.execute(`
      SELECT intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE intent_name = '批次上线情况查询'
    `);
    
    if (rules.length > 0) {
      console.log('当前规则SQL:');
      console.log(rules[0].action_target);
      console.log('\n');
      
      // 检查是否查询的是online_tracking表
      if (rules[0].action_target.includes('online_tracking')) {
        console.log('✅ 规则已正确更新为查询online_tracking表');
      } else {
        console.log('❌ 规则仍在查询错误的表，需要修复');
        
        // 修复规则
        const correctSQL = `
SELECT
  factory as 工厂,
  baseline_id as 基线,
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
LIMIT 20`.trim();
        
        await connection.execute(
          'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
          [correctSQL, '批次上线情况查询']
        );
        
        console.log('✅ 已修复批次上线情况查询规则');
      }
    } else {
      console.log('❌ 未找到批次上线情况查询规则');
    }
    
    // 测试查询online_tracking表的数据
    console.log('\n🔍 测试online_tracking表数据...');
    const [onlineData] = await connection.execute(`
      SELECT 
        batch_code,
        material_name,
        supplier_name,
        factory,
        project,
        baseline_id,
        defect_rate,
        exception_count,
        DATE_FORMAT(online_date, '%Y-%m-%d') as online_date
      FROM online_tracking 
      WHERE batch_code IS NOT NULL 
      ORDER BY online_date DESC 
      LIMIT 5
    `);
    
    console.log(`找到 ${onlineData.length} 条online_tracking数据:`);
    onlineData.forEach((row, index) => {
      console.log(`${index + 1}. 批次: ${row.batch_code}, 物料: ${row.material_name}, 供应商: ${row.supplier_name}`);
    });
    
  } catch (error) {
    console.error('❌ 验证过程中出错:', error);
  } finally {
    await connection.end();
  }
}

verifyBatchOnlineRule();
