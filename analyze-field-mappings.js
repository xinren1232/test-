/**
 * 分析规则库中的字段映射问题
 */

const API_BASE_URL = 'http://localhost:3001';

// 前端页面的标准字段定义
const FRONTEND_FIELD_STANDARDS = {
  inventory: {
    name: '库存页面',
    fields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注']
  },
  online: {
    name: '上线页面', 
    fields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注']
  },
  testing: {
    name: '测试页面',
    fields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注']
  },
  batch: {
    name: '批次管理页面',
    fields: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注']
  }
};

// 数据库字段映射
const DB_FIELD_MAPPING = {
  inventory: {
    '工厂': 'storage_location',
    '仓库': 'storage_location', 
    '物料编码': 'material_code',
    '物料名称': 'material_name',
    '供应商': 'supplier_name',
    '数量': 'quantity',
    '状态': 'status',
    '入库时间': 'inbound_time',
    '到期时间': 'expiry_date',  // 注意：不是inbound_time
    '备注': 'notes'
  },
  production_tracking: {
    '工厂': 'factory',
    '基线': 'baseline',
    '项目': 'project',
    '物料编码': 'material_code',
    '物料名称': 'material_name',
    '供应商': 'supplier_name',
    '批次号': 'batch_code',
    '不良率': 'defect_rate',
    '本周异常': 'weekly_anomaly',
    '检验日期': 'test_date',
    '备注': 'notes'
  },
  lab_tests: {
    '测试编号': 'test_id',
    '日期': 'test_date',
    '项目': 'project_id',
    '基线': 'baseline_id',
    '物料编码': 'material_code',
    '数量': 'quantity',
    '物料名称': 'material_name',
    '供应商': 'supplier_name',
    '测试结果': 'test_result',
    '不合格描述': 'defect_desc',
    '备注': 'notes'
  }
};

async function analyzeFieldMappings() {
  try {
    console.log('🔍 分析规则库中的字段映射问题...\n');
    
    // 1. 获取所有规则
    const response = await fetch(`${API_BASE_URL}/api/rules`);
    const result = await response.json();
    
    if (!result.success || !result.data) {
      console.log('❌ 获取规则失败');
      return;
    }
    
    const rules = result.data;
    console.log(`📊 总规则数: ${rules.length}\n`);
    
    // 2. 按场景分类规则
    const rulesByCategory = {
      inventory: [],
      online: [],
      testing: [],
      batch: [],
      other: []
    };
    
    rules.forEach(rule => {
      const category = rule.category || '';
      const intentName = rule.intent_name || '';
      
      if (category.includes('库存') || intentName.includes('库存')) {
        rulesByCategory.inventory.push(rule);
      } else if (category.includes('上线') || intentName.includes('上线') || intentName.includes('生产')) {
        rulesByCategory.online.push(rule);
      } else if (category.includes('测试') || intentName.includes('测试') || intentName.includes('检验')) {
        rulesByCategory.testing.push(rule);
      } else if (category.includes('批次') || intentName.includes('批次')) {
        rulesByCategory.batch.push(rule);
      } else {
        rulesByCategory.other.push(rule);
      }
    });
    
    // 3. 分析每个场景的字段映射问题
    for (const [scenarioKey, scenarioRules] of Object.entries(rulesByCategory)) {
      if (scenarioKey === 'other' || scenarioRules.length === 0) continue;
      
      const standard = FRONTEND_FIELD_STANDARDS[scenarioKey];
      if (!standard) continue;
      
      console.log(`📋 ${standard.name} (${scenarioRules.length}条规则):`);
      console.log(`   标准字段: ${standard.fields.join(', ')}\n`);
      
      // 分析每条规则的字段映射
      scenarioRules.forEach((rule, index) => {
        console.log(`   规则${index + 1}: ${rule.intent_name}`);
        
        const sql = rule.action_target || '';
        const fieldsInSQL = extractFieldsFromSQL(sql);
        
        console.log(`   SQL中的字段: ${fieldsInSQL.join(', ')}`);
        
        // 检查缺失的字段
        const missingFields = standard.fields.filter(field => 
          !fieldsInSQL.includes(field)
        );
        
        if (missingFields.length > 0) {
          console.log(`   ❌ 缺失字段: ${missingFields.join(', ')}`);
        } else {
          console.log(`   ✅ 字段完整`);
        }
        
        // 检查特殊问题
        checkSpecialIssues(rule, scenarioKey);
        
        console.log('');
      });
      
      console.log('─'.repeat(60) + '\n');
    }
    
    // 4. 生成修复建议
    console.log('🔧 修复建议:\n');
    generateFixSuggestions();
    
  } catch (error) {
    console.error('❌ 分析过程中出现错误:', error);
  }
}

function extractFieldsFromSQL(sql) {
  const fields = [];
  
  // 提取 "as 字段名" 的模式
  const asMatches = sql.match(/as\s+([^\s,]+)/gi);
  if (asMatches) {
    asMatches.forEach(match => {
      const field = match.replace(/as\s+/i, '').trim();
      if (field && !fields.includes(field)) {
        fields.push(field);
      }
    });
  }
  
  return fields;
}

function checkSpecialIssues(rule, scenarioKey) {
  const sql = rule.action_target || '';
  
  // 检查库存场景的特殊问题
  if (scenarioKey === 'inventory') {
    // 检查到期时间字段
    if (sql.includes('到期时间')) {
      if (sql.includes('inbound_time') && sql.includes('到期时间')) {
        console.log(`   ⚠️  到期时间使用了inbound_time，应该使用expiry_date或计算字段`);
      }
      if (sql.includes('未设置')) {
        console.log(`   ⚠️  到期时间显示"未设置"，应该计算实际到期日期`);
      }
    }
    
    // 检查工厂和仓库字段
    if (sql.includes('storage_location') && sql.includes('工厂') && sql.includes('仓库')) {
      console.log(`   ⚠️  工厂和仓库都使用storage_location，应该分别映射`);
    }
  }
  
  // 检查上线场景的特殊问题
  if (scenarioKey === 'online') {
    if (sql.includes('本周异常') && !sql.includes('weekly_anomaly')) {
      console.log(`   ⚠️  本周异常字段映射可能不正确`);
    }
  }
  
  // 检查测试场景的特殊问题
  if (scenarioKey === 'testing') {
    if (sql.includes('不合格描述') && !sql.includes('defect_desc')) {
      console.log(`   ⚠️  不合格描述字段映射可能不正确`);
    }
  }
}

function generateFixSuggestions() {
  console.log('1. 库存场景修复建议:');
  console.log('   - 到期时间字段应使用: DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), "%Y-%m-%d") as 到期时间');
  console.log('   - 工厂字段应使用: SUBSTRING_INDEX(storage_location, "-", 1) as 工厂');
  console.log('   - 仓库字段应使用: SUBSTRING_INDEX(storage_location, "-", -1) as 仓库');
  console.log('');
  
  console.log('2. 上线场景修复建议:');
  console.log('   - 检验日期字段应使用: DATE_FORMAT(test_date, "%Y-%m-%d") as 检验日期');
  console.log('   - 本周异常字段应使用: COALESCE(weekly_anomaly, "无异常") as 本周异常');
  console.log('');
  
  console.log('3. 测试场景修复建议:');
  console.log('   - 不合格描述字段应使用: COALESCE(defect_desc, "") as 不合格描述');
  console.log('   - 测试结果字段应使用: COALESCE(test_result, "合格") as 测试结果');
  console.log('');
  
  console.log('4. 批次管理场景修复建议:');
  console.log('   - 入库日期字段应使用: DATE_FORMAT(inbound_time, "%Y-%m-%d") as 入库日期');
  console.log('   - 产线异常和测试异常需要统计计算');
}

analyzeFieldMappings();
