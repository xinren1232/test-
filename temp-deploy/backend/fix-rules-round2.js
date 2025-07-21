import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixRulesRound2() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 第二轮规则修正...');
    
    // 获取所有规则
    const [rules] = await connection.execute('SELECT * FROM nlp_intent_rules ORDER BY intent_name');
    
    console.log(`\n开始第二轮修正 ${rules.length} 条规则：\n`);
    
    let fixedCount = 0;
    
    for (const rule of rules) {
      console.log(`📋 处理规则: ${rule.intent_name}`);
      
      let originalSQL = rule.action_target;
      let fixedSQL = originalSQL;
      let needsUpdate = false;
      
      // 第二轮修正
      const round2Replacements = [
        // 修正字段名错误
        { from: /factory\s+as\s+工厂/gi, to: 'storage_location as 工厂' },
        { from: /warehouse\s+as\s+仓库/gi, to: 'storage_location as 仓库' },
        { from: /material_type\s+as\s+物料类型/gi, to: 'material_name as 物料类型' },
        
        // 修正lab_tests表的字段
        { from: /baseline_id/gi, to: 'batch_code' },
        { from: /baseline\s+as\s+基线/gi, to: 'batch_code as 基线' },
        { from: /project_id/gi, to: 'test_item' },
        { from: /project\s+as\s+项目/gi, to: 'test_item as 项目' },
        
        // 修正GROUP_CONCAT语法错误
        { from: /GROUP_CONCAT\(DISTINCT\s+([^)]+)\s+LIMIT\s+\d+\)/gi, to: 'GROUP_CONCAT(DISTINCT $1)' },
        { from: /GROUP_CONCAT\(DISTINCT\s+([^)]+)\s+ORDER\s+BY\s+([^)]+)\)/gi, to: 'GROUP_CONCAT(DISTINCT $1 ORDER BY $2)' },
        
        // 修正SEPARATOR语法
        { from: /SEPARATOR\s+';'/gi, to: "SEPARATOR '; '" },
        { from: /SEPARATOR\s+','/gi, to: "SEPARATOR ', '" },
        
        // 修正窗口函数中的中文字段名
        { from: /ORDER\s+BY\s+月份/gi, to: 'ORDER BY DATE_FORMAT(test_date, \'%Y-%m\')' },
        
        // 修正多个GROUP_CONCAT在同一行的问题
        { from: /GROUP_CONCAT\(DISTINCT\s+status\)\s+as\s+状态列表\s+GROUP_CONCAT\(DISTINCT\s+factory\)/gi, 
          to: 'GROUP_CONCAT(DISTINCT status) as 状态列表, GROUP_CONCAT(DISTINCT storage_location)' },
        
        // 清理语法错误
        { from: /,\s*,/g, to: ',' },
        { from: /,\s*FROM/gi, to: ' FROM' },
        { from: /,\s*WHERE/gi, to: ' WHERE' },
        { from: /,\s*ORDER/gi, to: ' ORDER' },
        { from: /,\s*GROUP/gi, to: ' GROUP' },
        { from: /,\s*HAVING/gi, to: ' HAVING' }
      ];
      
      round2Replacements.forEach(replacement => {
        const newSQL = fixedSQL.replace(replacement.from, replacement.to);
        if (newSQL !== fixedSQL) {
          needsUpdate = true;
          fixedSQL = newSQL;
        }
      });
      
      // 特殊处理一些复杂的规则
      if (rule.intent_name === '供应商库存查询') {
        fixedSQL = `
SELECT
  supplier_name as 供应商,
  COUNT(*) as 库存批次数,
  SUM(quantity) as 总数量,
  COUNT(CASE WHEN status LIKE '%风险%' THEN 1 END) as 风险批次,
  GROUP_CONCAT(DISTINCT material_name ORDER BY material_name SEPARATOR ', ') as 物料类型,
  AVG(quantity) as 平均数量
FROM inventory
GROUP BY supplier_name
ORDER BY 总数量 DESC
LIMIT 10`.trim();
        needsUpdate = true;
      }
      
      if (rule.intent_name === '供应商物料查询') {
        fixedSQL = `
SELECT
  storage_location as 工厂,
  storage_location as 仓库,
  material_name as 物料类型,
  supplier_name as 供应商名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
  notes as 备注
FROM inventory
WHERE supplier_name = COALESCE(?, '')
ORDER BY inbound_time DESC
LIMIT 10`.trim();
        needsUpdate = true;
      }
      
      if (rule.intent_name === '物料库存信息查询') {
        fixedSQL = `
SELECT
  storage_location as 工厂,
  storage_location as 仓库,
  material_name as 物料类型,
  supplier_name as 供应商名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
  notes as 备注
FROM inventory
WHERE material_name = COALESCE(?, '')
ORDER BY inbound_time DESC
LIMIT 10`.trim();
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        console.log(`🔧 修正字段问题`);
        
        // 更新数据库
        await connection.execute(
          'UPDATE nlp_intent_rules SET action_target = ? WHERE id = ?',
          [fixedSQL, rule.id]
        );
        
        fixedCount++;
        console.log(`✅ 已更新`);
      } else {
        console.log(`✅ 无需修正`);
      }
      
      console.log('---\n');
    }
    
    console.log(`\n🎉 第二轮修正完成！共修正了 ${fixedCount} 条规则`);
    
  } catch (error) {
    console.error('❌ 修正失败:', error);
  } finally {
    await connection.end();
  }
}

fixRulesRound2();
