/**
 * 修复库存规则的字段映射问题
 * 确保规则输出的字段与前端页面完全匹配
 */

// 使用后端API来执行修复，避免直接数据库连接问题
const API_BASE_URL = 'http://localhost:3001';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 正确的库存查询SQL模板（匹配前端字段）
const CORRECT_INVENTORY_SQL = `
SELECT 
  COALESCE(SUBSTRING_INDEX(storage_location, '-', 1), '未知工厂') as 工厂,
  COALESCE(SUBSTRING_INDEX(storage_location, '-', -1), '未知仓库') as 仓库,
  COALESCE(material_code, '') as 物料编码,
  COALESCE(material_name, '') as 物料名称,
  COALESCE(supplier_name, '') as 供应商,
  COALESCE(quantity, 0) as 数量,
  COALESCE(status, '正常') as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
ORDER BY inbound_time DESC 
LIMIT 50`.trim();

// 需要添加WHERE条件的特殊规则
const SPECIAL_RULES = {
  '结构件类库存查询': "WHERE material_type LIKE '%结构件%'",
  '光学类库存查询': "WHERE material_type LIKE '%光学%' OR material_name LIKE '%显示%' OR material_name LIKE '%屏%'",
  '充电类库存查询': "WHERE material_name LIKE '%充电%' OR material_name LIKE '%电池%'",
  '声学类库存查询': "WHERE material_name LIKE '%扬声器%' OR material_name LIKE '%听筒%'",
  '包装类库存查询': "WHERE material_name LIKE '%包装%' OR material_name LIKE '%保护套%' OR material_name LIKE '%标签%'"
};

// 供应商特定规则
const SUPPLIER_RULES = [
  'BOE供应商库存查询', '东声供应商库存查询', '丽德宝供应商库存查询', '华星供应商库存查询',
  '天实供应商库存查询', '天马供应商库存查询', '奥海供应商库存查询', '富群供应商库存查询',
  '广正供应商库存查询', '怡同供应商库存查询', '欣冠供应商库存查询', '歌尔供应商库存查询',
  '深奥供应商库存查询', '理威供应商库存查询', '瑞声供应商库存查询', '百佳达供应商库存查询',
  '盛泰供应商库存查询', '维科供应商库存查询', '聚龙供应商库存查询', '辉阳供应商库存查询',
  '风华供应商库存查询'
];

async function fixInventoryRulesFields() {
  let connection;
  
  try {
    console.log('🔧 开始修复库存规则字段映射...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 获取所有库存相关规则
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE (category LIKE '%库存%' OR intent_name LIKE '%库存%')
      AND action_type = 'SQL_QUERY'
      ORDER BY id
    `);
    
    console.log(`📊 找到 ${rules.length} 条库存规则需要修复\n`);
    
    let fixedCount = 0;
    
    // 2. 逐个修复规则
    for (const rule of rules) {
      console.log(`修复规则: ${rule.intent_name} (ID: ${rule.id})`);
      
      let newSQL = CORRECT_INVENTORY_SQL;
      
      // 3. 为特殊规则添加WHERE条件
      if (SPECIAL_RULES[rule.intent_name]) {
        newSQL = newSQL.replace(
          'FROM inventory',
          `FROM inventory\n${SPECIAL_RULES[rule.intent_name]}`
        );
        console.log(`  添加特殊条件: ${SPECIAL_RULES[rule.intent_name]}`);
      }
      
      // 4. 为供应商规则添加WHERE条件
      if (SUPPLIER_RULES.includes(rule.intent_name)) {
        const supplierName = rule.intent_name.replace('供应商库存查询', '');
        const whereCondition = `WHERE supplier_name = '${supplierName}'`;
        newSQL = newSQL.replace(
          'FROM inventory',
          `FROM inventory\n${whereCondition}`
        );
        console.log(`  添加供应商条件: ${whereCondition}`);
      }
      
      // 5. 更新规则
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ? WHERE id = ?',
        [newSQL, rule.id]
      );
      
      fixedCount++;
      console.log(`  ✅ 修复完成\n`);
    }
    
    console.log(`🎉 修复完成！共修复 ${fixedCount} 条规则\n`);
    
    // 6. 验证修复结果
    console.log('🔍 验证修复结果...');
    await validateFixedRules(connection);
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function validateFixedRules(connection) {
  try {
    // 检查修复后的规则
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE (category LIKE '%库存%' OR intent_name LIKE '%库存%')
      AND action_type = 'SQL_QUERY'
      LIMIT 3
    `);
    
    console.log('验证前3条规则的字段:');
    
    for (const rule of rules) {
      console.log(`\n规则: ${rule.intent_name}`);
      
      // 检查必要字段是否存在
      const requiredFields = ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'];
      const sql = rule.action_target;
      
      const missingFields = requiredFields.filter(field => !sql.includes(field));
      
      if (missingFields.length === 0) {
        console.log('  ✅ 所有必要字段都存在');
      } else {
        console.log(`  ❌ 缺失字段: ${missingFields.join(', ')}`);
      }
      
      // 检查特殊字段
      if (sql.includes('到期时间') && sql.includes('DATE_ADD')) {
        console.log('  ✅ 到期时间使用正确的计算公式');
      } else if (sql.includes('到期时间')) {
        console.log('  ⚠️  到期时间可能使用了错误的字段');
      }
      
      if (sql.includes('SUBSTRING_INDEX') && sql.includes('工厂') && sql.includes('仓库')) {
        console.log('  ✅ 工厂和仓库字段正确分离');
      }
    }
    
    console.log('\n✅ 验证完成');
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error);
  }
}

// 运行修复
fixInventoryRulesFields();
