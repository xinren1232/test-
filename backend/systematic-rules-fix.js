import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 实际数据模型字段映射
const ACTUAL_FIELD_MAPPING = {
  inventory: {
    // 模型中实际存在的字段
    actual_fields: ['id', 'batch_code', 'material_code', 'material_name', 'material_type', 'supplier_name', 'quantity', 'inbound_time', 'storage_location', 'status', 'risk_level', 'inspector', 'notes'],
    // 前端显示字段映射
    display_mapping: {
      'storage_location': '工厂',
      'storage_location': '仓库', // 需要拆分或使用别名
      'material_type': '物料类型',
      'supplier_name': '供应商名称',
      'supplier_name': '供应商', // 可以用同一字段
      'quantity': '数量',
      'status': '状态',
      'inbound_time': '入库时间',
      'notes': '备注'
    }
  },
  online_tracking: {
    actual_fields: ['id', 'batch_code', 'material_code', 'material_name', 'supplier_name', 'online_date', 'use_time', 'factory', 'workshop', 'line', 'project', 'defect_rate', 'exception_count', 'operator', 'inspection_date'],
    display_mapping: {
      'id': '测试编号',
      'online_date': '日期',
      'project': '项目',
      'project': '基线', // 需要确认
      'material_type': '物料类型', // 字段不存在，需要处理
      'quantity': '数量', // 字段不存在，需要处理
      'material_name': '物料名称',
      'supplier_name': '供应商',
      'notes': '备注' // 字段不存在，需要处理
    }
  },
  lab_tests: {
    actual_fields: ['id', 'test_id', 'batch_code', 'material_code', 'material_name', 'supplier_name', 'test_date', 'test_item', 'test_result', 'conclusion', 'defect_desc', 'tester', 'reviewer'],
    display_mapping: {
      'test_id': '测试编号',
      'test_date': '日期',
      'test_item': '项目',
      'test_item': '基线', // 需要确认
      'material_type': '物料类型', // 字段不存在，需要处理
      'quantity': '数量', // 字段不存在，需要处理
      'material_name': '物料名称',
      'supplier_name': '供应商',
      'defect_desc': '不合格描述',
      'conclusion': '备注'
    }
  }
};

// 字段修复映射
const FIELD_FIX_MAPPING = {
  // 错误字段 -> 正确字段
  'supplier_name': 'supplier_name', // 实际存在
  'batch_code': 'batch_code', // 实际存在
  'material_code': 'material_code', // 实际存在
  'defect_desc': 'defect_desc', // 实际存在
  'test_id': 'test_id', // 实际存在
  'project_id': 'project', // 修正
  'baseline_id': 'baseline', // 需要确认字段
  'factory': 'factory', // online_tracking中存在
  'workshop': 'workshop', // online_tracking中存在
  'line': 'line', // online_tracking中存在
  'exception_count': 'exception_count', // online_tracking中存在
  'operator': 'operator' // online_tracking中存在
};

async function systematicRulesFix() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🚀 开始系统性规则修复...\n');
    
    // 1. 获取所有需要修复的规则
    const [rules] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        description,
        action_type,
        action_target,
        trigger_words,
        example_query,
        category,
        status
      FROM nlp_intent_rules 
      ORDER BY category, intent_name
    `);
    
    console.log(`📊 规则总数: ${rules.length}条\n`);
    
    let fixedCount = 0;
    const fixResults = {
      triggerWords: 0,
      sqlSyntax: 0,
      fieldMapping: 0,
      failed: []
    };
    
    // 2. 逐个修复规则
    for (const rule of rules) {
      console.log(`🔧 修复规则: ${rule.intent_name}`);
      
      let needsUpdate = false;
      let updatedSQL = rule.action_target;
      let updatedTriggerWords = rule.trigger_words;
      
      // 修复1: 添加触发词
      if (!rule.trigger_words || rule.trigger_words === null) {
        updatedTriggerWords = generateTriggerWords(rule.intent_name);
        needsUpdate = true;
        fixResults.triggerWords++;
        console.log(`  ✅ 添加触发词: ${updatedTriggerWords}`);
      }
      
      // 修复2: 修复字段映射
      if (rule.action_target) {
        const fixedSQL = fixFieldMapping(rule.action_target, rule.intent_name);
        if (fixedSQL !== rule.action_target) {
          updatedSQL = fixedSQL;
          needsUpdate = true;
          fixResults.fieldMapping++;
          console.log(`  ✅ 修复字段映射`);
        }
      }
      
      // 修复3: 修复SQL语法问题
      if (updatedSQL) {
        const cleanedSQL = cleanSQLSyntax(updatedSQL);
        if (cleanedSQL !== updatedSQL) {
          updatedSQL = cleanedSQL;
          needsUpdate = true;
          fixResults.sqlSyntax++;
          console.log(`  ✅ 修复SQL语法`);
        }
      }
      
      // 更新数据库
      if (needsUpdate) {
        try {
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET 
              action_target = ?,
              trigger_words = ?,
              updated_at = NOW()
            WHERE id = ?
          `, [updatedSQL, updatedTriggerWords, rule.id]);
          
          fixedCount++;
          console.log(`  ✅ 规则已更新`);
        } catch (error) {
          fixResults.failed.push({
            rule: rule.intent_name,
            error: error.message
          });
          console.log(`  ❌ 更新失败: ${error.message}`);
        }
      } else {
        console.log(`  ℹ️  无需修复`);
      }
      
      console.log('');
    }
    
    // 3. 生成修复报告
    generateFixReport(fixResults, fixedCount, rules.length);
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await connection.end();
  }
}

// 生成触发词
function generateTriggerWords(intentName) {
  const baseWords = [];
  
  // 根据规则名称生成相关触发词
  if (intentName.includes('库存')) {
    baseWords.push('库存', '仓库', '存储');
  }
  if (intentName.includes('上线')) {
    baseWords.push('上线', '生产', '在线');
  }
  if (intentName.includes('测试')) {
    baseWords.push('测试', '检测', '检验');
  }
  if (intentName.includes('供应商')) {
    baseWords.push('供应商', '厂商');
  }
  if (intentName.includes('物料')) {
    baseWords.push('物料', '材料');
  }
  if (intentName.includes('批次')) {
    baseWords.push('批次', '批号');
  }
  if (intentName.includes('项目')) {
    baseWords.push('项目');
  }
  if (intentName.includes('基线')) {
    baseWords.push('基线');
  }
  
  // 添加通用查询词
  baseWords.push('查询', '统计', '分析');
  
  return JSON.stringify([...new Set(baseWords)]);
}

// 修复字段映射
function fixFieldMapping(sql, ruleName) {
  if (!sql) return sql;
  
  let fixedSQL = sql;
  
  // 修复常见字段错误
  Object.entries(FIELD_FIX_MAPPING).forEach(([wrongField, correctField]) => {
    // 修复字段名
    const fieldRegex = new RegExp(`\\b${wrongField}\\b`, 'gi');
    fixedSQL = fixedSQL.replace(fieldRegex, correctField);
  });
  
  // 移除不存在的字段引用
  fixedSQL = fixedSQL.replace(/,\s*END\s+as\s+[\u4e00-\u9fa5]+/gi, '');
  fixedSQL = fixedSQL.replace(/\bEND\s+as\s+[\u4e00-\u9fa5]+/gi, '');
  
  // 修复特定的计算字段
  fixedSQL = fixedSQL.replace(/\b100\s+as\s+[\u4e00-\u9fa5]+/gi, '0 as 平均不良率');
  
  return fixedSQL;
}

// 清理SQL语法
function cleanSQLSyntax(sql) {
  if (!sql) return sql;
  
  let cleanedSQL = sql;
  
  // 移除可能导致通信包错误的特殊字符
  cleanedSQL = cleanedSQL.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // 规范化空白字符
  cleanedSQL = cleanedSQL.replace(/\s+/g, ' ').trim();
  
  // 确保SQL以分号结尾
  if (!cleanedSQL.endsWith(';')) {
    cleanedSQL += ';';
  }
  
  return cleanedSQL;
}

// 生成修复报告
function generateFixReport(results, fixedCount, totalCount) {
  console.log('📊 修复报告\n');
  console.log('=' .repeat(50));
  
  console.log(`\n📈 修复统计:`);
  console.log(`  总规则数: ${totalCount}条`);
  console.log(`  已修复: ${fixedCount}条`);
  console.log(`  修复率: ${((fixedCount / totalCount) * 100).toFixed(1)}%`);
  
  console.log(`\n🔧 修复类型:`);
  console.log(`  ✅ 添加触发词: ${results.triggerWords}条`);
  console.log(`  ✅ 修复字段映射: ${results.fieldMapping}条`);
  console.log(`  ✅ 修复SQL语法: ${results.sqlSyntax}条`);
  
  if (results.failed.length > 0) {
    console.log(`\n❌ 修复失败 (${results.failed.length}条):`);
    results.failed.forEach(item => {
      console.log(`  - ${item.rule}: ${item.error}`);
    });
  }
  
  console.log('\n🎯 建议后续操作:');
  console.log('1. 运行规则验证脚本确认修复效果');
  console.log('2. 测试修复后的规则功能');
  console.log('3. 更新前端显示字段配置');
  console.log('4. 建立规则质量监控机制');
  
  console.log('\n✅ 系统性修复完成！');
}

systematicRulesFix();
