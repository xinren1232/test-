import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 期望的字段映射（基于前端页面设计）
const EXPECTED_FIELD_MAPPINGS = {
  inventory: {
    fields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
    db_fields: {
      '工厂': 'storage_location',
      '仓库': 'storage_location', // 需要拆分或使用别名
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '状态': 'status',
      '入库时间': 'inbound_time',
      '到期时间': 'DATE_ADD(inbound_time, INTERVAL 365 DAY)', // 计算字段
      '备注': 'notes'
    }
  },
  online_tracking: {
    fields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
    db_fields: {
      '工厂': 'factory',
      '基线': 'project', // 注意：基线在数据库中对应project字段
      '项目': 'project',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '批次号': 'batch_code',
      '不良率': 'CONCAT(ROUND(defect_rate * 100, 2), "%")',
      '本周异常': 'exception_count',
      '检验日期': 'inspection_date',
      '备注': 'notes'
    }
  },
  lab_tests: {
    fields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
    db_fields: {
      '测试编号': 'test_id',
      '日期': 'test_date',
      '项目': 'project_id',
      '基线': 'baseline_id',
      '物料编码': 'material_code',
      '数量': 'COUNT(*)', // 聚合字段
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '测试结果': 'test_result',
      '不合格描述': 'defect_desc',
      '备注': 'conclusion'
    }
  },
  batch_management: {
    fields: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注'],
    db_fields: {
      '批次号': 'batch_code',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '入库日期': 'inbound_time',
      '产线异常': 'exception_count',
      '测试异常': 'test_result',
      '备注': 'notes'
    }
  }
};

async function analyzeCurrentRulesMapping() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 分析当前规则的字段映射情况...\n');
    
    // 获取所有规则
    const [rules] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        description,
        action_target,
        trigger_words,
        category,
        status
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY category, intent_name
    `);
    
    console.log(`📊 活跃规则总数: ${rules.length}条\n`);
    
    const analysisResults = {
      inventory_rules: [],
      online_rules: [],
      test_rules: [],
      batch_rules: [],
      field_issues: [],
      missing_fields: []
    };
    
    // 分析每个规则
    for (const rule of rules) {
      const analysis = analyzeRuleFieldMapping(rule);
      
      // 根据规则类型分类
      if (rule.intent_name.includes('库存') || rule.intent_name.includes('仓库')) {
        analysisResults.inventory_rules.push(analysis);
      } else if (rule.intent_name.includes('上线') || rule.intent_name.includes('跟踪')) {
        analysisResults.online_rules.push(analysis);
      } else if (rule.intent_name.includes('测试') || rule.intent_name.includes('检测')) {
        analysisResults.test_rules.push(analysis);
      } else if (rule.intent_name.includes('批次')) {
        analysisResults.batch_rules.push(analysis);
      }
      
      // 收集字段问题
      if (analysis.field_issues.length > 0) {
        analysisResults.field_issues.push(...analysis.field_issues);
      }
      
      if (analysis.missing_fields.length > 0) {
        analysisResults.missing_fields.push(...analysis.missing_fields);
      }
    }
    
    // 输出分析结果
    console.log('📋 规则分类统计:');
    console.log(`  库存相关规则: ${analysisResults.inventory_rules.length}条`);
    console.log(`  上线相关规则: ${analysisResults.online_rules.length}条`);
    console.log(`  测试相关规则: ${analysisResults.test_rules.length}条`);
    console.log(`  批次相关规则: ${analysisResults.batch_rules.length}条\n`);
    
    // 详细分析库存规则
    console.log('🏭 库存规则字段映射分析:');
    analysisResults.inventory_rules.forEach((analysis, index) => {
      console.log(`\n${index + 1}. ${analysis.rule_name}`);
      console.log(`   包含字段: ${analysis.included_fields.join(', ')}`);
      console.log(`   缺失字段: ${analysis.missing_fields.join(', ') || '无'}`);
      console.log(`   字段问题: ${analysis.field_issues.join(', ') || '无'}`);
    });
    
    // 详细分析上线规则
    console.log('\n🔄 上线跟踪规则字段映射分析:');
    analysisResults.online_rules.forEach((analysis, index) => {
      console.log(`\n${index + 1}. ${analysis.rule_name}`);
      console.log(`   包含字段: ${analysis.included_fields.join(', ')}`);
      console.log(`   缺失字段: ${analysis.missing_fields.join(', ') || '无'}`);
      console.log(`   字段问题: ${analysis.field_issues.join(', ') || '无'}`);
    });
    
    // 详细分析测试规则
    console.log('\n🧪 测试规则字段映射分析:');
    analysisResults.test_rules.forEach((analysis, index) => {
      console.log(`\n${index + 1}. ${analysis.rule_name}`);
      console.log(`   包含字段: ${analysis.included_fields.join(', ')}`);
      console.log(`   缺失字段: ${analysis.missing_fields.join(', ') || '无'}`);
      console.log(`   字段问题: ${analysis.field_issues.join(', ') || '无'}`);
    });
    
    // 汇总问题
    console.log('\n❌ 发现的主要问题:');
    const uniqueIssues = [...new Set(analysisResults.field_issues)];
    uniqueIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    
    console.log('\n📝 优化建议:');
    generateOptimizationSuggestions(analysisResults);
    
  } catch (error) {
    console.error('❌ 分析失败:', error);
  } finally {
    await connection.end();
  }
}

function analyzeRuleFieldMapping(rule) {
  const analysis = {
    rule_name: rule.intent_name,
    rule_id: rule.id,
    included_fields: [],
    missing_fields: [],
    field_issues: []
  };
  
  const sql = rule.action_target;
  
  // 确定规则类型
  let expectedFields = [];
  let ruleType = '';
  
  if (rule.intent_name.includes('库存') || rule.intent_name.includes('仓库')) {
    expectedFields = EXPECTED_FIELD_MAPPINGS.inventory.fields;
    ruleType = 'inventory';
  } else if (rule.intent_name.includes('上线') || rule.intent_name.includes('跟踪')) {
    expectedFields = EXPECTED_FIELD_MAPPINGS.online_tracking.fields;
    ruleType = 'online_tracking';
  } else if (rule.intent_name.includes('测试') || rule.intent_name.includes('检测')) {
    expectedFields = EXPECTED_FIELD_MAPPINGS.lab_tests.fields;
    ruleType = 'lab_tests';
  } else if (rule.intent_name.includes('批次')) {
    expectedFields = EXPECTED_FIELD_MAPPINGS.batch_management.fields;
    ruleType = 'batch_management';
  }
  
  // 检查包含的字段
  expectedFields.forEach(field => {
    if (sql.includes(`as ${field}`) || sql.includes(`AS ${field}`)) {
      analysis.included_fields.push(field);
    } else {
      analysis.missing_fields.push(field);
    }
  });
  
  // 检查字段映射问题
  if (ruleType === 'inventory') {
    if (sql.includes('material_code as 物料编号')) {
      analysis.field_issues.push('库存页面应显示"物料编码"而不是"物料编号"');
    }
    if (!sql.includes('storage_location as 工厂')) {
      analysis.field_issues.push('缺少工厂字段映射');
    }
    if (!sql.includes('storage_location as 仓库')) {
      analysis.field_issues.push('缺少仓库字段映射');
    }
  }
  
  if (ruleType === 'lab_tests') {
    if (sql.includes('material_name as 物料类型')) {
      analysis.field_issues.push('测试页面"物料类型"应该是独立字段，不是物料名称');
    }
    if (!sql.includes('COUNT(*)') && !sql.includes('数量')) {
      analysis.field_issues.push('测试页面的数量应该是测试次数统计');
    }
  }
  
  return analysis;
}

function generateOptimizationSuggestions(results) {
  console.log('1. 统一字段命名：确保所有规则使用一致的字段别名');
  console.log('2. 补全缺失字段：每个场景的规则应包含该场景的所有前端显示字段');
  console.log('3. 修正字段映射：确保数据库字段正确映射到前端显示字段');
  console.log('4. 添加计算字段：如到期时间、不良率百分比等需要计算的字段');
  console.log('5. 优化数据展示：确保每个规则返回的数据格式符合前端展示需求');
}

analyzeCurrentRulesMapping().catch(console.error);
