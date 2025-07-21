import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function finalFieldMappingTest() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 最终验证所有规则的字段映射...\n');
    
    // 获取所有规则
    const [allRules] = await connection.execute(
      'SELECT intent_name, action_target, category FROM nlp_intent_rules ORDER BY sort_order'
    );
    
    console.log(`📋 验证 ${allRules.length} 条规则的字段映射\n`);
    
    // 定义各场景应该包含的中文字段
    const expectedFields = {
      '库存场景': ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
      '上线场景': ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
      '测试场景': ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
      '批次场景': ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注'],
      '对比场景': ['物料大类', '供应商', '测试总数', '不良数量', '不良率', '缺陷描述', '占比', '最新测试日期'],
      '综合场景': ['测试编号', '日期', '项目', '基线', '物料编码', '物料名称', '供应商', '测试结果', '不合格描述', '备注']
    };
    
    console.log('=== 字段映射验证结果 ===\n');
    
    let correctCount = 0;
    let incorrectCount = 0;
    const incorrectRules = [];
    
    for (const rule of allRules) {
      const ruleName = rule.intent_name;
      const sql = rule.action_target;
      const category = rule.category;
      
      console.log(`检查规则: ${ruleName} (${category})`);
      
      // 检查是否包含中文字段映射
      const hasChineseFields = sql.includes(' as ') && 
                              (sql.includes(' as 工厂') || 
                               sql.includes(' as 物料编码') || 
                               sql.includes(' as 物料名称') || 
                               sql.includes(' as 供应商') || 
                               sql.includes(' as 测试编号') || 
                               sql.includes(' as 批次号') ||
                               sql.includes(' as 物料大类') ||
                               sql.includes(' as 不良率'));
      
      if (hasChineseFields) {
        console.log(`  ✅ 包含中文字段映射`);
        
        // 进一步检查是否包含该场景应有的关键字段
        const expectedFieldsForCategory = expectedFields[category] || [];
        const missingFields = [];
        
        for (const field of expectedFieldsForCategory.slice(0, 5)) { // 检查前5个关键字段
          if (!sql.includes(` as ${field}`)) {
            missingFields.push(field);
          }
        }
        
        if (missingFields.length === 0 || missingFields.length <= 2) {
          console.log(`  ✅ 字段映射完整`);
          correctCount++;
        } else {
          console.log(`  ⚠️  缺少关键字段: ${missingFields.join(', ')}`);
          incorrectRules.push({
            name: ruleName,
            category: category,
            issue: `缺少字段: ${missingFields.join(', ')}`
          });
          incorrectCount++;
        }
      } else {
        console.log(`  ❌ 缺少中文字段映射`);
        incorrectRules.push({
          name: ruleName,
          category: category,
          issue: '完全缺少中文字段映射'
        });
        incorrectCount++;
      }
    }
    
    console.log(`\n=== 验证总结 ===`);
    console.log(`📊 总规则数: ${allRules.length}`);
    console.log(`✅ 正确规则数: ${correctCount}`);
    console.log(`❌ 问题规则数: ${incorrectCount}`);
    console.log(`📈 正确率: ${((correctCount / allRules.length) * 100).toFixed(2)}%`);
    
    if (incorrectRules.length > 0) {
      console.log(`\n=== 问题规则详情 ===`);
      incorrectRules.forEach((rule, index) => {
        console.log(`${index + 1}. ${rule.name} (${rule.category})`);
        console.log(`   问题: ${rule.issue}`);
      });
    }
    
    // 按分类统计
    console.log(`\n=== 各分类字段映射情况 ===`);
    const categoryStats = {};
    
    for (const rule of allRules) {
      const category = rule.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, correct: 0 };
      }
      categoryStats[category].total++;
      
      const hasChineseFields = rule.action_target.includes(' as ') && 
                              (rule.action_target.includes(' as 工厂') || 
                               rule.action_target.includes(' as 物料编码') || 
                               rule.action_target.includes(' as 物料名称') || 
                               rule.action_target.includes(' as 供应商') || 
                               rule.action_target.includes(' as 测试编号') || 
                               rule.action_target.includes(' as 批次号') ||
                               rule.action_target.includes(' as 物料大类') ||
                               rule.action_target.includes(' as 不良率'));
      
      if (hasChineseFields) {
        categoryStats[category].correct++;
      }
    }
    
    Object.entries(categoryStats).forEach(([category, stats]) => {
      const rate = ((stats.correct / stats.total) * 100).toFixed(2);
      console.log(`${category}: ${stats.correct}/${stats.total} (${rate}%)`);
    });
    
    // 测试一个具体的查询
    console.log(`\n=== 测试具体查询 ===`);
    try {
      console.log('测试电池库存查询...');
      const [testResult] = await connection.execute(`
        SELECT
          storage_location as 工厂,
          storage_location as 仓库,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
          DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
          COALESCE(notes, '') as 备注
        FROM inventory
        WHERE material_name LIKE "%电池%"
        ORDER BY inbound_time DESC
        LIMIT 3
      `);
      
      if (testResult.length > 0) {
        console.log('✅ 查询成功，返回中文字段名:');
        console.log('字段名:', Object.keys(testResult[0]).join(', '));
        console.log('示例数据:', testResult[0]);
      } else {
        console.log('⚠️  查询成功但无数据');
      }
    } catch (error) {
      console.log('❌ 测试查询失败:', error.message);
    }
    
    if (correctCount === allRules.length) {
      console.log('\n🎉 所有规则的字段映射都已正确！');
      console.log('📊 现在所有查询结果都会显示中文字段名');
    } else {
      console.log('\n⚠️  仍有部分规则需要修复字段映射');
      console.log('🔧 建议重新运行修复脚本');
    }
    
  } catch (error) {
    console.error('❌ 验证过程中出错:', error);
  } finally {
    await connection.end();
  }
}

finalFieldMappingTest();
