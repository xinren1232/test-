import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

/**
 * 修复规则数据源，将SQL查询改为localStorage数据源引用
 */
async function fixRuleDataSource() {
  try {
    console.log('🔧 开始修复规则数据源...');
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查当前规则的数据源类型
    console.log('\n1. 检查当前规则的数据源类型:');
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_type, action_target 
      FROM nlp_intent_rules 
      ORDER BY id
    `);
    
    console.log(`总规则数: ${rules.length}`);
    
    // 分析规则类型
    const ruleTypes = {
      sql_query: 0,
      memory_query: 0,
      other: 0
    };
    
    rules.forEach(rule => {
      if (rule.action_type === 'SQL_QUERY' || rule.action_target.includes('SELECT')) {
        ruleTypes.sql_query++;
      } else if (rule.action_type === 'memory_query') {
        ruleTypes.memory_query++;
      } else {
        ruleTypes.other++;
      }
    });
    
    console.log('规则类型统计:');
    console.log(`- SQL查询规则: ${ruleTypes.sql_query}条`);
    console.log(`- 内存查询规则: ${ruleTypes.memory_query}条`);
    console.log(`- 其他类型规则: ${ruleTypes.other}条`);
    
    // 2. 将SQL查询规则转换为localStorage数据源规则
    console.log('\n2. 转换规则数据源:');
    
    // 定义数据源映射
    const dataSourceMapping = {
      // 库存相关规则 -> localStorage inventory数据
      inventory: {
        keywords: ['库存', '物料', '批次', '供应商', '工厂', '仓库'],
        dataSource: 'inventory',
        fields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注']
      },
      
      // 测试相关规则 -> localStorage lab数据
      testing: {
        keywords: ['测试', 'NG', '不合格', '合格', '检验', '质量'],
        dataSource: 'inspection',
        fields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注']
      },
      
      // 上线相关规则 -> localStorage factory数据
      production: {
        keywords: ['上线', '生产', '产线', '不良率', '异常', '工厂'],
        dataSource: 'production',
        fields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注']
      }
    };
    
    let convertedCount = 0;
    
    for (const rule of rules) {
      // 跳过已经是memory_query的规则
      if (rule.action_type === 'memory_query') {
        continue;
      }
      
      // 跳过非SQL查询规则
      if (!rule.action_target.includes('SELECT')) {
        continue;
      }
      
      // 根据规则名称和内容确定数据源
      let targetDataSource = null;
      
      for (const [sourceType, config] of Object.entries(dataSourceMapping)) {
        const hasKeyword = config.keywords.some(keyword => 
          rule.intent_name.includes(keyword) || rule.action_target.includes(keyword)
        );
        
        if (hasKeyword) {
          targetDataSource = config.dataSource;
          break;
        }
      }
      
      if (targetDataSource) {
        // 更新规则为memory_query类型
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET 
            action_type = 'memory_query',
            action_target = ?
          WHERE id = ?
        `, [targetDataSource, rule.id]);
        
        console.log(`✅ 已转换规则: ${rule.intent_name} -> ${targetDataSource}`);
        convertedCount++;
      } else {
        console.log(`⚠️ 无法确定数据源: ${rule.intent_name}`);
      }
    }
    
    console.log(`\n🎉 成功转换 ${convertedCount} 条规则!`);
    
    // 3. 验证转换结果
    console.log('\n3. 验证转换结果:');
    const [updatedRules] = await connection.execute(`
      SELECT action_type, action_target, COUNT(*) as count
      FROM nlp_intent_rules 
      GROUP BY action_type, action_target
      ORDER BY count DESC
    `);
    
    console.log('转换后的规则统计:');
    updatedRules.forEach(stat => {
      console.log(`- ${stat.action_type} (${stat.action_target}): ${stat.count}条`);
    });
    
    // 4. 创建数据源配置说明
    console.log('\n4. 数据源配置说明:');
    console.log('规则现在使用以下localStorage数据源:');
    console.log('- inventory: 库存数据 (132条记录)');
    console.log('  字段: 工厂、仓库、物料编码、物料名称、供应商、数量、状态、入库时间、到期时间、备注');
    console.log('- inspection: 测试数据 (396条记录)');
    console.log('  字段: 测试编号、日期、项目、基线、物料编码、数量、物料名称、供应商、测试结果、不合格描述、备注');
    console.log('- production: 上线数据 (1056条记录)');
    console.log('  字段: 工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注');
    
    await connection.end();
    console.log('\n✅ 规则数据源修复完成!');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

fixRuleDataSource();
