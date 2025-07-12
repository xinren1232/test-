/**
 * 快速规则分析工具
 * 直接分析当前规则库的问题
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 真实字段映射
const CORRECT_FIELD_MAPPINGS = {
  inventory: {
    '工厂': 'storage_location',
    '仓库': 'warehouse',
    '物料编码': 'material_code',
    '物料名称': 'material_name',
    '供应商': 'supplier_name',
    '数量': 'quantity',
    '状态': 'status',
    '入库时间': 'inbound_time',
    '到期时间': 'expiry_date',
    '备注': 'notes'
  },
  online: {
    '工厂': 'factory',
    '基线': 'baseline_id',
    '项目': 'project_id',
    '物料编码': 'material_code',
    '物料名称': 'material_name',
    '供应商': 'supplier_name',
    '批次号': 'batch_no',
    '不良率': 'defect_rate',
    '本周异常': 'weekly_anomalies',
    '检验日期': 'inspection_date',
    '备注': 'notes'
  },
  testing: {
    '测试编号': 'test_id',
    '日期': 'test_date',
    '项目': 'project_id',
    '基线': 'baseline_id',
    '物料编码': 'material_code',
    '数量': 'quantity',
    '物料名称': 'material_name',
    '供应商': 'supplier_name',
    '测试结果': 'test_result',
    '不合格描述': 'defect_description',
    '备注': 'notes'
  }
};

async function analyzeCurrentRules() {
  console.log('🔍 分析当前规则库...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 获取所有活跃规则
    const [rules] = await connection.execute(`
      SELECT 
        id, 
        intent_name, 
        description, 
        action_target, 
        category,
        trigger_words,
        example_query
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY category, priority
    `);
    
    console.log(`\n📊 找到 ${rules.length} 个活跃规则`);
    
    const issues = [];
    
    for (const rule of rules) {
      const ruleIssues = [];
      
      // 检查SQL查询的字段映射
      if (rule.action_target && rule.action_target.includes('SELECT')) {
        const sql = rule.action_target;
        
        // 检查是否使用了正确的字段别名
        if (rule.category === 'inventory' || rule.intent_name.includes('库存')) {
          const requiredFields = Object.keys(CORRECT_FIELD_MAPPINGS.inventory);
          const missingFields = requiredFields.filter(field => !sql.includes(`as ${field}`) && !sql.includes(`AS ${field}`));
          
          if (missingFields.length > 0) {
            ruleIssues.push(`库存规则缺少字段别名: ${missingFields.join(', ')}`);
          }
        }
        
        if (rule.category === 'online' || rule.intent_name.includes('在线') || rule.intent_name.includes('跟踪')) {
          const requiredFields = Object.keys(CORRECT_FIELD_MAPPINGS.online);
          const missingFields = requiredFields.filter(field => !sql.includes(`as ${field}`) && !sql.includes(`AS ${field}`));
          
          if (missingFields.length > 0) {
            ruleIssues.push(`在线规则缺少字段别名: ${missingFields.join(', ')}`);
          }
        }
        
        if (rule.category === 'testing' || rule.intent_name.includes('测试') || rule.intent_name.includes('检验')) {
          const requiredFields = Object.keys(CORRECT_FIELD_MAPPINGS.testing);
          const missingFields = requiredFields.filter(field => !sql.includes(`as ${field}`) && !sql.includes(`AS ${field}`));
          
          if (missingFields.length > 0) {
            ruleIssues.push(`测试规则缺少字段别名: ${missingFields.join(', ')}`);
          }
        }
        
        // 检查是否使用了错误的表名
        if (sql.includes('FROM inventory') && (rule.intent_name.includes('在线') || rule.intent_name.includes('测试'))) {
          ruleIssues.push('规则类型与查询表不匹配');
        }
      }
      
      if (ruleIssues.length > 0) {
        issues.push({
          id: rule.id,
          name: rule.intent_name,
          category: rule.category,
          issues: ruleIssues,
          sql: rule.action_target
        });
      }
    }
    
    console.log(`\n❌ 发现 ${issues.length} 个规则存在问题:`);
    issues.forEach((issue, index) => {
      console.log(`\n${index + 1}. 规则: ${issue.name} (ID: ${issue.id})`);
      console.log(`   分类: ${issue.category}`);
      issue.issues.forEach(i => console.log(`   - ${i}`));
    });
    
    return issues;
    
  } finally {
    await connection.end();
  }
}

async function checkDataConsistency() {
  console.log('\n🔍 检查数据一致性...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 检查物料分布
    const [materialStats] = await connection.execute(`
      SELECT 
        material_name,
        COUNT(*) as inventory_count
      FROM inventory 
      GROUP BY material_name
      ORDER BY inventory_count DESC
    `);
    
    console.log('\n📊 库存物料分布:');
    materialStats.slice(0, 10).forEach(stat => {
      console.log(`${stat.material_name}: ${stat.inventory_count}条记录`);
    });
    
    // 检查项目基线分布
    const [projectStats] = await connection.execute(`
      SELECT 
        project_id,
        baseline_id,
        COUNT(*) as test_count
      FROM lab_tests 
      WHERE project_id IS NOT NULL AND baseline_id IS NOT NULL
      GROUP BY project_id, baseline_id
      ORDER BY baseline_id, project_id
    `);
    
    console.log('\n📊 项目基线分布:');
    projectStats.forEach(stat => {
      console.log(`${stat.baseline_id} -> ${stat.project_id}: ${stat.test_count}条测试记录`);
    });
    
    return {
      materialStats,
      projectStats
    };
    
  } finally {
    await connection.end();
  }
}

async function generateFixPlan(issues) {
  console.log('\n🎯 生成修复计划...');
  
  const plan = {
    fieldMappingFixes: [],
    categoryOptimizations: [],
    dataConsistencyFixes: []
  };
  
  // 按问题类型分组
  issues.forEach(issue => {
    if (issue.issues.some(i => i.includes('缺少字段别名'))) {
      plan.fieldMappingFixes.push({
        ruleId: issue.id,
        ruleName: issue.name,
        category: issue.category,
        action: 'UPDATE_FIELD_ALIASES'
      });
    }
    
    if (issue.issues.some(i => i.includes('表不匹配'))) {
      plan.categoryOptimizations.push({
        ruleId: issue.id,
        ruleName: issue.name,
        action: 'FIX_TABLE_MAPPING'
      });
    }
  });
  
  console.log('\n📋 修复计划:');
  console.log(`\n🔧 字段映射修复: ${plan.fieldMappingFixes.length} 个规则`);
  plan.fieldMappingFixes.forEach(fix => {
    console.log(`   - ${fix.ruleName} (${fix.category})`);
  });
  
  console.log(`\n🔧 分类优化: ${plan.categoryOptimizations.length} 个规则`);
  plan.categoryOptimizations.forEach(fix => {
    console.log(`   - ${fix.ruleName}`);
  });
  
  return plan;
}

async function main() {
  try {
    console.log('🚀 开始快速规则分析...\n');
    
    const issues = await analyzeCurrentRules();
    const dataStats = await checkDataConsistency();
    const fixPlan = await generateFixPlan(issues);
    
    console.log('\n✅ 分析完成！');
    console.log(`\n📊 总结:`);
    console.log(`- 发现 ${issues.length} 个规则问题`);
    console.log(`- 物料种类: ${dataStats.materialStats.length} 种`);
    console.log(`- 项目基线组合: ${dataStats.projectStats.length} 种`);
    
    return { issues, dataStats, fixPlan };
    
  } catch (error) {
    console.error('❌ 分析失败:', error);
    throw error;
  }
}

main().catch(console.error);
