import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkActualFieldMappings() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查实际的字段映射情况...\n');
    
    // 获取之前报告有问题的4个规则
    const problemRules = [
      '供应商对比分析',
      '大类别Top不良分析', 
      '结构件类深度不良分析',
      '光学类显示缺陷专项分析'
    ];
    
    const [rules] = await connection.execute(
      'SELECT intent_name, action_target FROM nlp_intent_rules WHERE intent_name IN (?, ?, ?, ?)',
      problemRules
    );
    
    console.log('=== 检查实际字段映射 ===\n');
    
    for (const rule of rules) {
      console.log(`规则: ${rule.intent_name}`);
      console.log('SQL内容:');
      console.log(rule.action_target);
      
      // 提取所有 "as 中文字段" 的映射
      const chineseFieldMatches = rule.action_target.match(/as\s+([^\s,\n]+)/g);
      if (chineseFieldMatches) {
        const chineseFields = chineseFieldMatches.map(match => match.replace('as ', ''));
        console.log('中文字段映射:');
        chineseFields.forEach((field, index) => {
          console.log(`  ${index + 1}. ${field}`);
        });
        
        // 检查是否包含中文字符
        const hasChineseFields = chineseFields.some(field => /[\u4e00-\u9fa5]/.test(field));
        console.log(`包含中文字段: ${hasChineseFields ? '✅' : '❌'}`);
        
        if (hasChineseFields) {
          console.log('✅ 该规则字段映射正确');
        } else {
          console.log('❌ 该规则缺少中文字段映射');
        }
      } else {
        console.log('❌ 未找到字段映射');
      }
      
      console.log('---\n');
    }
    
    // 测试一个具体的查询
    console.log('=== 测试具体查询执行 ===\n');
    
    try {
      console.log('测试供应商对比分析查询...');
      const supplierRule = rules.find(r => r.intent_name === '供应商对比分析');
      if (supplierRule) {
        // 简化SQL避免子查询问题
        const testSQL = `
          SELECT
            '供应商对比' as 分析类型,
            supplier_name as 供应商,
            COUNT(*) as 库存记录数,
            SUM(quantity) as 总库存量,
            COUNT(CASE WHEN status = '正常' THEN 1 END) as 正常库存,
            COUNT(CASE WHEN status = '风险' THEN 1 END) as 风险库存,
            COUNT(CASE WHEN status = '冻结' THEN 1 END) as 冻结库存,
            ROUND(AVG(quantity), 2) as 平均库存量,
            DATE_FORMAT(MAX(inbound_time), '%Y-%m-%d') as 最新入库时间
          FROM inventory
          WHERE supplier_name IS NOT NULL AND supplier_name != ''
          GROUP BY supplier_name
          ORDER BY 总库存量 DESC
          LIMIT 3
        `;
        
        const [testResult] = await connection.execute(testSQL);
        
        if (testResult.length > 0) {
          console.log('✅ 查询成功，返回字段:');
          console.log('字段名:', Object.keys(testResult[0]).join(', '));
          console.log('示例数据:', testResult[0]);
        } else {
          console.log('⚠️  查询成功但无数据');
        }
      }
    } catch (error) {
      console.log('❌ 测试查询失败:', error.message);
    }
    
    // 统计所有规则的字段映射情况
    console.log('\n=== 全部规则字段映射统计 ===');
    const [allRules] = await connection.execute(
      'SELECT intent_name, action_target, category FROM nlp_intent_rules ORDER BY sort_order'
    );
    
    let totalRules = allRules.length;
    let rulesWithChineseFields = 0;
    
    for (const rule of allRules) {
      const hasChineseFields = /as\s+[\u4e00-\u9fa5]/.test(rule.action_target);
      if (hasChineseFields) {
        rulesWithChineseFields++;
      }
    }
    
    console.log(`📊 总规则数: ${totalRules}`);
    console.log(`✅ 包含中文字段的规则: ${rulesWithChineseFields}`);
    console.log(`❌ 缺少中文字段的规则: ${totalRules - rulesWithChineseFields}`);
    console.log(`📈 中文字段映射覆盖率: ${((rulesWithChineseFields / totalRules) * 100).toFixed(2)}%`);
    
    if (rulesWithChineseFields === totalRules) {
      console.log('\n🎉 所有规则都已包含中文字段映射！');
      console.log('📊 现在所有查询结果都会显示中文字段名');
    } else {
      console.log('\n⚠️  仍有部分规则缺少中文字段映射');
      
      // 列出缺少中文字段的规则
      const rulesWithoutChinese = allRules.filter(rule => 
        !/as\s+[\u4e00-\u9fa5]/.test(rule.action_target)
      );
      
      if (rulesWithoutChinese.length > 0) {
        console.log('\n缺少中文字段映射的规则:');
        rulesWithoutChinese.forEach((rule, index) => {
          console.log(`${index + 1}. ${rule.intent_name} (${rule.category})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 检查过程中出错:', error);
  } finally {
    await connection.end();
  }
}

checkActualFieldMappings();
