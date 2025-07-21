/**
 * 数据结构与规则分析工具
 * 分析真实数据结构，验证规则字段映射，识别问题并生成优化方案
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 真实数据结构定义（基于您提供的信息）
const REAL_DATA_STRUCTURE = {
  // 基线和项目映射
  projectBaselines: {
    'I6789': ['X6827', 'S665LN', 'KI4K', 'X6828'],
    'I6788': ['X6831', 'KI5K', 'KI3K'], 
    'I6787': ['S662LN', 'S663LN', 'S664LN']
  },
  
  // 物料大类结构
  materialCategories: {
    '结构件类': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
    '光学类': ['LCD显示屏', 'OLED显示屏', '摄像头(CAM)'],
    '充电类': ['电池', '充电器'],
    '声学类': ['扬声器', '听筒'],
    '包料类': ['保护套', '标签', '包装盒']
  },
  
  // 供应商映射
  supplierMapping: {
    '结构件类': ['聚龙', '欣冠', '广正'],
    '光学类': ['帝晶', '天马', 'BOE', '华星'],
    '充电类': ['百俊达', '奥海', '辰阳', '锂威', '风华', '维科'],
    '声学类': ['东声', '豪声', '歌尔'],
    '包料类': ['丽德宝', '裕同', '富群']
  },
  
  // 页面字段映射
  pageFields: {
    inventory: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
    online: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
    testing: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
    batch: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注']
  }
};

/**
 * 分析数据库表结构
 */
async function analyzeTableStructure() {
  console.log('🔍 分析数据库表结构...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 获取所有表的结构
    const tables = ['inventory', 'lab_tests', 'factory_production', 'nlp_intent_rules'];
    const tableStructures = {};
    
    for (const table of tables) {
      try {
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        tableStructures[table] = columns.map(col => ({
          field: col.Field,
          type: col.Type,
          null: col.Null,
          key: col.Key,
          default: col.Default
        }));
        console.log(`✅ ${table} 表结构:`, tableStructures[table].map(c => c.field));
      } catch (error) {
        console.log(`❌ 无法获取 ${table} 表结构:`, error.message);
      }
    }
    
    return tableStructures;
  } finally {
    await connection.end();
  }
}

/**
 * 分析当前规则的字段映射问题
 */
async function analyzeRuleFieldMapping() {
  console.log('\n🔍 分析规则字段映射问题...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_target, description, category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY category, priority
    `);
    
    const fieldMappingIssues = [];
    
    for (const rule of rules) {
      const sql = rule.action_target;
      const issues = [];
      
      // 检查字段映射问题
      if (sql.includes('SELECT')) {
        // 提取SELECT子句中的字段
        const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM/is);
        if (selectMatch) {
          const fields = selectMatch[1];
          
          // 检查是否使用了正确的字段映射
          if (rule.category === 'inventory' || rule.intent_name.includes('库存')) {
            const expectedFields = REAL_DATA_STRUCTURE.pageFields.inventory;
            const missingFields = expectedFields.filter(field => 
              !fields.includes(field) && !fields.includes(field.replace(/[^\w]/g, '_'))
            );
            if (missingFields.length > 0) {
              issues.push(`库存页面缺少字段: ${missingFields.join(', ')}`);
            }
          }
          
          if (rule.category === 'online' || rule.intent_name.includes('在线') || rule.intent_name.includes('跟踪')) {
            const expectedFields = REAL_DATA_STRUCTURE.pageFields.online;
            const missingFields = expectedFields.filter(field => 
              !fields.includes(field) && !fields.includes(field.replace(/[^\w]/g, '_'))
            );
            if (missingFields.length > 0) {
              issues.push(`在线页面缺少字段: ${missingFields.join(', ')}`);
            }
          }
          
          if (rule.category === 'testing' || rule.intent_name.includes('测试') || rule.intent_name.includes('检验')) {
            const expectedFields = REAL_DATA_STRUCTURE.pageFields.testing;
            const missingFields = expectedFields.filter(field => 
              !fields.includes(field) && !fields.includes(field.replace(/[^\w]/g, '_'))
            );
            if (missingFields.length > 0) {
              issues.push(`测试页面缺少字段: ${missingFields.join(', ')}`);
            }
          }
        }
      }
      
      if (issues.length > 0) {
        fieldMappingIssues.push({
          ruleId: rule.id,
          ruleName: rule.intent_name,
          category: rule.category,
          issues: issues
        });
      }
    }
    
    console.log(`\n📊 发现 ${fieldMappingIssues.length} 个规则存在字段映射问题:`);
    fieldMappingIssues.forEach(issue => {
      console.log(`\n❌ 规则: ${issue.ruleName} (${issue.category})`);
      issue.issues.forEach(i => console.log(`   - ${i}`));
    });
    
    return fieldMappingIssues;
    
  } finally {
    await connection.end();
  }
}

/**
 * 分析物料大类查询问题
 */
async function analyzeMaterialCategoryIssues() {
  console.log('\n🔍 分析物料大类查询问题...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 检查数据库中的实际物料分布
    const [materialStats] = await connection.execute(`
      SELECT 
        material_name,
        COUNT(*) as count,
        COUNT(DISTINCT supplier_name) as supplier_count
      FROM inventory 
      GROUP BY material_name
      ORDER BY count DESC
    `);
    
    console.log('\n📊 数据库中的物料分布:');
    materialStats.forEach(stat => {
      const category = Object.keys(REAL_DATA_STRUCTURE.materialCategories).find(cat =>
        REAL_DATA_STRUCTURE.materialCategories[cat].includes(stat.material_name)
      );
      console.log(`${stat.material_name}: ${stat.count}条记录, ${stat.supplier_count}个供应商 (${category || '未分类'})`);
    });
    
    // 分析大类查询的复杂性
    console.log('\n📋 物料大类组成分析:');
    Object.entries(REAL_DATA_STRUCTURE.materialCategories).forEach(([category, materials]) => {
      console.log(`${category}: ${materials.length}种物料 - ${materials.join(', ')}`);
      
      // 检查该大类的供应商分布
      const suppliers = REAL_DATA_STRUCTURE.supplierMapping[category] || [];
      console.log(`  供应商: ${suppliers.join(', ')}`);
    });
    
    return {
      materialStats,
      categoryComplexity: Object.keys(REAL_DATA_STRUCTURE.materialCategories).length
    };
    
  } finally {
    await connection.end();
  }
}

/**
 * 分析项目基线数据问题
 */
async function analyzeProjectBaselineIssues() {
  console.log('\n🔍 分析项目基线数据问题...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 检查数据库中的项目基线分布
    const [projectStats] = await connection.execute(`
      SELECT 
        project_id,
        baseline_id,
        COUNT(*) as count
      FROM lab_tests 
      WHERE project_id IS NOT NULL AND baseline_id IS NOT NULL
      GROUP BY project_id, baseline_id
      ORDER BY baseline_id, project_id
    `);
    
    console.log('\n📊 数据库中的项目基线分布:');
    const actualMapping = {};
    projectStats.forEach(stat => {
      if (!actualMapping[stat.baseline_id]) {
        actualMapping[stat.baseline_id] = [];
      }
      actualMapping[stat.baseline_id].push(stat.project_id);
      console.log(`${stat.baseline_id} -> ${stat.project_id}: ${stat.count}条记录`);
    });
    
    console.log('\n📋 预期的项目基线映射:');
    Object.entries(REAL_DATA_STRUCTURE.projectBaselines).forEach(([baseline, projects]) => {
      console.log(`${baseline}: ${projects.join(', ')}`);
    });
    
    // 比较实际与预期的差异
    console.log('\n⚠️ 映射差异分析:');
    Object.keys(REAL_DATA_STRUCTURE.projectBaselines).forEach(baseline => {
      const expected = REAL_DATA_STRUCTURE.projectBaselines[baseline];
      const actual = actualMapping[baseline] || [];
      
      const missing = expected.filter(p => !actual.includes(p));
      const extra = actual.filter(p => !expected.includes(p));
      
      if (missing.length > 0 || extra.length > 0) {
        console.log(`${baseline}:`);
        if (missing.length > 0) console.log(`  缺少项目: ${missing.join(', ')}`);
        if (extra.length > 0) console.log(`  多余项目: ${extra.join(', ')}`);
      }
    });
    
    return {
      actualMapping,
      expectedMapping: REAL_DATA_STRUCTURE.projectBaselines
    };
    
  } finally {
    await connection.end();
  }
}

/**
 * 生成优化建议
 */
function generateOptimizationPlan(analysisResults) {
  console.log('\n🎯 生成优化建议...');

  const plan = {
    priority1: [], // 高优先级
    priority2: [], // 中优先级
    priority3: []  // 低优先级
  };

  // 字段映射问题 - 高优先级
  if (analysisResults.fieldMappingIssues && analysisResults.fieldMappingIssues.length > 0) {
    plan.priority1.push({
      task: '修复规则字段映射',
      description: '更新所有规则的SQL查询，使用正确的字段映射',
      affectedRules: analysisResults.fieldMappingIssues.length,
      action: 'UPDATE_RULE_FIELDS'
    });
  }

  // 物料大类查询优化 - 中优先级
  if (analysisResults.materialStats) {
    plan.priority2.push({
      task: '优化物料大类查询',
      description: '改进大类查询逻辑，正确处理多物料种类汇集',
      complexity: analysisResults.categoryComplexity,
      action: 'OPTIMIZE_CATEGORY_QUERIES'
    });
  }

  // 项目基线数据修复 - 中优先级
  if (analysisResults.projectBaselineMapping) {
    plan.priority2.push({
      task: '修复项目基线数据',
      description: '确保数据生成按实际项目基线映射关系',
      mappingIssues: Object.keys(analysisResults.projectBaselineMapping.expectedMapping).length,
      action: 'FIX_PROJECT_BASELINE_DATA'
    });
  }

  console.log('\n📋 优化计划:');
  console.log('\n🔴 高优先级任务:');
  plan.priority1.forEach((task, i) => {
    console.log(`${i + 1}. ${task.task}: ${task.description}`);
  });

  console.log('\n🟡 中优先级任务:');
  plan.priority2.forEach((task, i) => {
    console.log(`${i + 1}. ${task.task}: ${task.description}`);
  });

  console.log('\n🟢 低优先级任务:');
  plan.priority3.forEach((task, i) => {
    console.log(`${i + 1}. ${task.task}: ${task.description}`);
  });

  return plan;
}

/**
 * 主分析函数
 */
async function main() {
  console.log('🚀 开始数据结构与规则分析...\n');

  try {
    const analysisResults = {};

    // 1. 分析表结构
    analysisResults.tableStructures = await analyzeTableStructure();

    // 2. 分析规则字段映射
    analysisResults.fieldMappingIssues = await analyzeRuleFieldMapping();

    // 3. 分析物料大类问题
    const materialAnalysis = await analyzeMaterialCategoryIssues();
    analysisResults.materialStats = materialAnalysis.materialStats;
    analysisResults.categoryComplexity = materialAnalysis.categoryComplexity;

    // 4. 分析项目基线问题
    analysisResults.projectBaselineMapping = await analyzeProjectBaselineIssues();

    // 5. 生成优化计划
    const optimizationPlan = generateOptimizationPlan(analysisResults);

    console.log('\n✅ 分析完成！');
    console.log('\n📊 分析结果摘要:');
    console.log(`- 发现 ${analysisResults.fieldMappingIssues?.length || 0} 个规则存在字段映射问题`);
    console.log(`- 物料大类包含 ${analysisResults.categoryComplexity} 个类别`);
    console.log(`- 项目基线映射需要验证和修复`);

    return {
      analysisResults,
      optimizationPlan
    };

  } catch (error) {
    console.error('❌ 分析过程中发生错误:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  analyzeTableStructure,
  analyzeRuleFieldMapping,
  analyzeMaterialCategoryIssues,
  analyzeProjectBaselineIssues,
  generateOptimizationPlan,
  main as analyzeDataStructureAndRules,
  REAL_DATA_STRUCTURE
};
