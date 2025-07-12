import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 标准字段映射定义
const STANDARD_FIELD_MAPPINGS = {
  inventory: {
    name: '库存',
    fields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
    table: 'inventory',
    dbFields: {
      '工厂': 'SUBSTRING_INDEX(storage_location, \'-\', 1)',
      '仓库': 'SUBSTRING_INDEX(storage_location, \'-\', -1)',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '状态': 'status',
      '入库时间': 'DATE_FORMAT(inbound_time, \'%Y-%m-%d %H:%i\')',
      '到期时间': 'DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), \'%Y-%m-%d\')',
      '备注': 'COALESCE(notes, \'\')'
    }
  },
  online: {
    name: '上线',
    fields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
    table: 'online_tracking',
    dbFields: {
      '工厂': 'factory',
      '基线': 'project',
      '项目': 'project',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '批次号': 'batch_code',
      '不良率': 'CONCAT(ROUND(defect_rate * 100, 2), \'%\')',
      '本周异常': 'exception_count',
      '检验日期': 'DATE_FORMAT(inspection_date, \'%Y-%m-%d\')',
      '备注': 'COALESCE(notes, \'\')'
    }
  },
  testing: {
    name: '测试',
    fields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
    table: 'lab_tests',
    dbFields: {
      '测试编号': 'test_id',
      '日期': 'DATE_FORMAT(test_date, \'%Y-%m-%d\')',
      '项目': 'COALESCE(project_id, \'未指定\')',
      '基线': 'COALESCE(baseline_id, \'未指定\')',
      '物料编码': 'material_code',
      '数量': 'COUNT(*) OVER (PARTITION BY material_name, supplier_name)',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '测试结果': 'test_result',
      '不合格描述': 'COALESCE(defect_desc, \'\')',
      '备注': 'COALESCE(conclusion, \'\')'
    }
  },
  batch: {
    name: '批次',
    fields: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注'],
    table: 'inventory',
    dbFields: {
      '批次号': 'batch_code',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '入库日期': 'DATE_FORMAT(inbound_time, \'%Y-%m-%d\')',
      '产线异常': 'COALESCE(ot.exception_count, 0)',
      '测试异常': 'CASE WHEN lt.test_result = \'FAIL\' THEN \'有异常\' WHEN lt.test_result = \'PASS\' THEN \'正常\' ELSE \'未测试\' END',
      '备注': 'COALESCE(i.notes, \'\')'
    }
  }
};

// 物料大类定义
const MATERIAL_CATEGORIES = {
  '结构件类': ['电池盖', '手机卡托', '侧键', '装饰件', '中框'],
  '光学类': ['LCD显示屏', 'OLED显示屏', '摄像头', '显示屏'],
  '充电类': ['电池', '充电器', '锂电池'],
  '声学类': ['喇叭', '听筒'],
  '包装类': ['保护套', '标签', '包装盒']
};

async function comprehensiveRuleValidation() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 开始全面规则库检查优化...\n');
    
    // 1. 获取所有活跃规则
    const [rules] = await connection.execute(`
      SELECT id, intent_name, description, action_target, category, trigger_words, synonyms
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY category, intent_name
    `);
    
    console.log(`📋 共检查 ${rules.length} 条活跃规则\n`);
    
    const validationResults = {
      fieldMapping: [],
      logicConsistency: [],
      sqlOptimization: [],
      functionalIssues: []
    };
    
    // 2. 逐一检查每个规则
    for (const rule of rules) {
      console.log(`🔍 检查规则: ${rule.intent_name}`);
      
      // 字段映射验证
      const fieldIssues = validateFieldMapping(rule);
      if (fieldIssues.length > 0) {
        validationResults.fieldMapping.push({
          rule: rule.intent_name,
          issues: fieldIssues
        });
      }
      
      // 逻辑一致性检查
      const logicIssues = validateLogicConsistency(rule);
      if (logicIssues.length > 0) {
        validationResults.logicConsistency.push({
          rule: rule.intent_name,
          issues: logicIssues
        });
      }
      
      // SQL查询优化检查
      const sqlIssues = validateSQLOptimization(rule);
      if (sqlIssues.length > 0) {
        validationResults.sqlOptimization.push({
          rule: rule.intent_name,
          issues: sqlIssues
        });
      }
      
      // 功能性测试
      try {
        let testSQL = rule.action_target;
        testSQL = testSQL.replace(/\?/g, "'测试值'");
        testSQL = testSQL.replace(/COALESCE\('测试值', ''\)/g, "COALESCE('测试值', '')");
        
        const [results] = await connection.execute(testSQL);
        console.log(`  ✅ 功能测试通过，返回 ${results.length} 条记录`);
      } catch (error) {
        validationResults.functionalIssues.push({
          rule: rule.intent_name,
          error: error.message
        });
        console.log(`  ❌ 功能测试失败: ${error.message}`);
      }
    }
    
    // 3. 生成验证报告
    console.log('\n📊 验证结果汇总:');
    console.log(`字段映射问题: ${validationResults.fieldMapping.length} 个`);
    console.log(`逻辑一致性问题: ${validationResults.logicConsistency.length} 个`);
    console.log(`SQL优化问题: ${validationResults.sqlOptimization.length} 个`);
    console.log(`功能性问题: ${validationResults.functionalIssues.length} 个`);
    
    // 4. 详细问题报告
    if (validationResults.fieldMapping.length > 0) {
      console.log('\n❌ 字段映射问题:');
      validationResults.fieldMapping.forEach((item, index) => {
        console.log(`${index + 1}. ${item.rule}:`);
        item.issues.forEach(issue => console.log(`   - ${issue}`));
      });
    }
    
    if (validationResults.logicConsistency.length > 0) {
      console.log('\n❌ 逻辑一致性问题:');
      validationResults.logicConsistency.forEach((item, index) => {
        console.log(`${index + 1}. ${item.rule}:`);
        item.issues.forEach(issue => console.log(`   - ${issue}`));
      });
    }
    
    if (validationResults.sqlOptimization.length > 0) {
      console.log('\n❌ SQL优化问题:');
      validationResults.sqlOptimization.forEach((item, index) => {
        console.log(`${index + 1}. ${item.rule}:`);
        item.issues.forEach(issue => console.log(`   - ${issue}`));
      });
    }
    
    if (validationResults.functionalIssues.length > 0) {
      console.log('\n❌ 功能性问题:');
      validationResults.functionalIssues.forEach((item, index) => {
        console.log(`${index + 1}. ${item.rule}: ${item.error}`);
      });
    }
    
    return validationResults;
    
  } catch (error) {
    console.error('❌ 验证过程失败:', error);
  } finally {
    await connection.end();
  }
}

function validateFieldMapping(rule) {
  const issues = [];
  const sql = rule.action_target;
  
  // 检查是否使用了标准字段映射
  if (rule.category.includes('库存')) {
    const requiredFields = STANDARD_FIELD_MAPPINGS.inventory.fields;
    const missingFields = requiredFields.filter(field => 
      !sql.includes(`as ${field}`) && !sql.includes(`AS ${field}`)
    );
    if (missingFields.length > 0) {
      issues.push(`缺少库存标准字段: ${missingFields.join(', ')}`);
    }
    
    // 检查是否有非标准字段
    if (sql.includes('总库存') || sql.includes('平均批次量')) {
      issues.push('包含非标准字段，应使用真实数据字段');
    }
  }
  
  if (rule.category.includes('上线') || rule.category.includes('跟踪')) {
    const requiredFields = STANDARD_FIELD_MAPPINGS.online.fields;
    const missingFields = requiredFields.filter(field => 
      !sql.includes(`as ${field}`) && !sql.includes(`AS ${field}`)
    );
    if (missingFields.length > 0) {
      issues.push(`缺少上线标准字段: ${missingFields.join(', ')}`);
    }
  }
  
  if (rule.category.includes('测试')) {
    const requiredFields = STANDARD_FIELD_MAPPINGS.testing.fields;
    const missingFields = requiredFields.filter(field => 
      !sql.includes(`as ${field}`) && !sql.includes(`AS ${field}`)
    );
    if (missingFields.length > 0) {
      issues.push(`缺少测试标准字段: ${missingFields.join(', ')}`);
    }
  }
  
  return issues;
}

function validateLogicConsistency(rule) {
  const issues = [];
  const sql = rule.action_target;
  const ruleName = rule.intent_name;
  
  // 检查物料大类逻辑一致性
  Object.entries(MATERIAL_CATEGORIES).forEach(([categoryName, materials]) => {
    if (ruleName.includes(categoryName)) {
      // 检查是否查询了正确的物料
      const hasCorrectMaterials = materials.some(material => 
        sql.includes(`'${material}'`)
      );
      
      if (!hasCorrectMaterials) {
        issues.push(`${categoryName}规则未包含正确的物料类型`);
      }
      
      // 检查是否包含了其他大类的物料
      Object.entries(MATERIAL_CATEGORIES).forEach(([otherCategory, otherMaterials]) => {
        if (otherCategory !== categoryName) {
          const hasWrongMaterials = otherMaterials.some(material => 
            sql.includes(`'${material}'`)
          );
          if (hasWrongMaterials) {
            issues.push(`${categoryName}规则错误包含了${otherCategory}的物料`);
          }
        }
      });
    }
  });
  
  return issues;
}

function validateSQLOptimization(rule) {
  const issues = [];
  const sql = rule.action_target;
  
  // 检查基本SQL优化
  if (!sql.includes('LIMIT')) {
    issues.push('缺少LIMIT限制，可能返回过多数据');
  }
  
  if (!sql.includes('ORDER BY')) {
    issues.push('缺少ORDER BY排序，结果顺序不确定');
  }
  
  // 检查日期格式化
  if (sql.includes('inbound_time') && !sql.includes('DATE_FORMAT')) {
    issues.push('日期字段未格式化，显示效果不佳');
  }
  
  // 检查空值处理
  if (sql.includes('notes') && !sql.includes('COALESCE')) {
    issues.push('备注字段未处理空值');
  }
  
  return issues;
}

export { comprehensiveRuleValidation, STANDARD_FIELD_MAPPINGS, MATERIAL_CATEGORIES };

// 直接运行验证
comprehensiveRuleValidation().catch(console.error);
