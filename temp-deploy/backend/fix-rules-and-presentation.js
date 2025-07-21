import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

/**
 * 修复规则示例问题和呈现结果设计
 * 1. 基于真实数据字段内容重新设计规则示例问题
 * 2. 按照真实场景字段要求修复呈现结果
 */

async function fixRulesAndPresentation() {
  try {
    console.log('🔧 开始修复规则示例问题和呈现结果设计...\n');
    
    // 1. 分析真实数据内容
    console.log('📊 1. 分析真实数据内容...');
    const realDataAnalysis = await analyzeRealDataContent();
    
    // 2. 修复规则示例问题
    console.log('\n🎯 2. 修复规则示例问题...');
    await fixRuleExampleQuestions(realDataAnalysis);
    
    // 3. 修复呈现结果字段设计
    console.log('\n🎨 3. 修复呈现结果字段设计...');
    await fixPresentationFieldDesign();
    
    console.log('\n🎉 修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  } finally {
    await connection.end();
  }
}

/**
 * 分析真实数据内容
 */
async function analyzeRealDataContent() {
  console.log('🔍 分析各表的真实数据内容...');
  
  const analysis = {
    inventory: {},
    lab_tests: {},
    online_tracking: {}
  };
  
  // 分析库存数据
  console.log('\n📦 分析inventory表数据...');
  const [inventoryData] = await connection.execute('SELECT * FROM inventory LIMIT 10');
  if (inventoryData.length > 0) {
    const suppliers = [...new Set(inventoryData.map(item => item.supplier_name))];
    const materials = [...new Set(inventoryData.map(item => item.material_name))];
    const factories = [...new Set(inventoryData.map(item => item.storage_location))];
    const materialCodes = [...new Set(inventoryData.map(item => item.material_code))];
    
    analysis.inventory = {
      suppliers: suppliers.slice(0, 5),
      materials: materials.slice(0, 5), 
      factories: factories.slice(0, 4),
      materialCodes: materialCodes.slice(0, 5),
      sampleData: inventoryData[0]
    };
    
    console.log(`  供应商: ${suppliers.join(', ')}`);
    console.log(`  物料: ${materials.slice(0, 3).join(', ')}...`);
    console.log(`  工厂: ${factories.join(', ')}`);
  }
  
  // 分析测试数据
  console.log('\n🧪 分析lab_tests表数据...');
  try {
    const [testData] = await connection.execute('SELECT * FROM lab_tests LIMIT 10');
    if (testData.length > 0) {
      const testResults = [...new Set(testData.map(item => item.test_result))];
      const projects = [...new Set(testData.map(item => item.project))];
      const baselines = [...new Set(testData.map(item => item.baseline))];
      
      analysis.lab_tests = {
        testResults: testResults,
        projects: projects.slice(0, 3),
        baselines: baselines.slice(0, 3),
        sampleData: testData[0]
      };
      
      console.log(`  测试结果: ${testResults.join(', ')}`);
      console.log(`  项目: ${projects.slice(0, 3).join(', ')}`);
    }
  } catch (error) {
    console.log('  ⚠️ lab_tests表查询失败，可能使用不同表名');
  }
  
  // 分析上线跟踪数据
  console.log('\n📈 分析online_tracking表数据...');
  try {
    const [onlineData] = await connection.execute('SELECT * FROM online_tracking LIMIT 10');
    if (onlineData.length > 0) {
      const batchCodes = [...new Set(onlineData.map(item => item.batch_code))];
      const defectRates = onlineData.map(item => item.defect_rate).filter(rate => rate != null);
      
      analysis.online_tracking = {
        batchCodes: batchCodes.slice(0, 5),
        avgDefectRate: defectRates.length > 0 ? (defectRates.reduce((a, b) => a + b, 0) / defectRates.length).toFixed(2) : '0.00',
        sampleData: onlineData[0]
      };
      
      console.log(`  批次号: ${batchCodes.slice(0, 3).join(', ')}...`);
      console.log(`  平均不良率: ${analysis.online_tracking.avgDefectRate}%`);
    }
  } catch (error) {
    console.log('  ⚠️ online_tracking表查询失败，可能使用不同表名');
  }
  
  return analysis;
}

/**
 * 修复规则示例问题
 */
async function fixRuleExampleQuestions(realDataAnalysis) {
  console.log('🎯 基于真实数据重新设计规则示例问题...');
  
  // 获取所有活跃规则
  const [rules] = await connection.execute(`
    SELECT id, intent_name, description, category, trigger_words
    FROM nlp_intent_rules 
    WHERE status = 'active'
    ORDER BY category, intent_name
  `);
  
  console.log(`📊 需要修复的规则数量: ${rules.length}`);
  
  let updatedCount = 0;
  
  for (const rule of rules) {
    try {
      const newExamples = generateRealDataExamples(rule, realDataAnalysis);
      
      if (newExamples.length > 0) {
        // 更新触发词
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET trigger_words = ?
          WHERE id = ?
        `, [JSON.stringify(newExamples), rule.id]);
        
        updatedCount++;
        
        if (updatedCount <= 5) { // 只显示前5个示例
          console.log(`✅ ${rule.intent_name}:`);
          console.log(`   新示例: ${newExamples.join(', ')}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${rule.intent_name}: 更新失败 - ${error.message}`);
    }
  }
  
  console.log(`\n📊 规则示例问题更新完成: ${updatedCount}/${rules.length}`);
}

/**
 * 生成基于真实数据的示例问题
 */
function generateRealDataExamples(rule, realDataAnalysis) {
  const examples = [];
  const { inventory, lab_tests, online_tracking } = realDataAnalysis;
  
  // 根据规则名称和类别生成相应的示例
  const ruleName = rule.intent_name.toLowerCase();
  
  if (ruleName.includes('库存') || ruleName.includes('inventory')) {
    if (inventory.suppliers) {
      examples.push(`查询${inventory.suppliers[0]}的库存`);
      examples.push(`${inventory.suppliers[1]}供应商库存情况`);
    }
    if (inventory.materials) {
      examples.push(`查询${inventory.materials[0]}库存`);
    }
    if (inventory.factories) {
      examples.push(`${inventory.factories[0]}的库存状态`);
    }
  }
  
  if (ruleName.includes('测试') || ruleName.includes('test')) {
    if (lab_tests.projects) {
      examples.push(`查询${lab_tests.projects[0]}项目测试结果`);
    }
    if (lab_tests.testResults) {
      examples.push(`查询${lab_tests.testResults[0]}的测试记录`);
    }
    if (inventory.suppliers) {
      examples.push(`${inventory.suppliers[0]}供应商测试情况`);
    }
  }
  
  if (ruleName.includes('上线') || ruleName.includes('online')) {
    if (online_tracking.batchCodes) {
      examples.push(`查询${online_tracking.batchCodes[0]}批次上线情况`);
    }
    if (inventory.suppliers) {
      examples.push(`${inventory.suppliers[0]}供应商上线状态`);
    }
  }
  
  if (ruleName.includes('批次') || ruleName.includes('batch')) {
    if (online_tracking.batchCodes) {
      examples.push(`查询批次${online_tracking.batchCodes[0]}`);
      examples.push(`批次${online_tracking.batchCodes[1]}管理信息`);
    }
  }
  
  // 如果没有生成示例，使用通用示例
  if (examples.length === 0) {
    if (inventory.suppliers) {
      examples.push(`查询${inventory.suppliers[0]}相关信息`);
    }
    examples.push(rule.description || rule.intent_name);
  }
  
  return examples.slice(0, 4); // 最多返回4个示例
}

/**
 * 修复呈现结果字段设计
 */
async function fixPresentationFieldDesign() {
  console.log('🎨 修复呈现结果字段设计...');

  // 定义标准场景字段设计
  const standardFieldDesigns = {
    '库存场景': {
      fields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
      sqlTemplate: `SELECT
        COALESCE(storage_location, '未知工厂') as 工厂,
        COALESCE(storage_location, '未知仓库') as 仓库,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
        DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
        COALESCE(notes, '') as 备注
      FROM inventory`
    },
    '测试场景': {
      fields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
      sqlTemplate: `SELECT
        test_id as 测试编号,
        DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
        project as 项目,
        baseline as 基线,
        material_code as 物料编码,
        quantity as 数量,
        material_name as 物料名称,
        supplier_name as 供应商,
        test_result as 测试结果,
        COALESCE(defect_description, '') as 不合格描述,
        COALESCE(notes, '') as 备注
      FROM lab_tests`
    },
    '上线场景': {
      fields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
      sqlTemplate: `SELECT
        factory as 工厂,
        baseline as 基线,
        project as 项目,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        batch_code as 批次号,
        CONCAT(ROUND(defect_rate, 2), '%') as 不良率,
        COALESCE(weekly_anomaly, '无') as 本周异常,
        DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
        COALESCE(notes, '') as 备注
      FROM online_tracking`
    },
    '批次管理': {
      fields: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注'],
      sqlTemplate: `SELECT
        batch_code as 批次号,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        DATE_FORMAT(inbound_date, '%Y-%m-%d') as 入库日期,
        COALESCE(production_anomaly, '无') as 产线异常,
        COALESCE(test_anomaly, '无') as 测试异常,
        COALESCE(notes, '') as 备注
      FROM inventory i
      LEFT JOIN online_tracking ot ON i.batch_code = ot.batch_code`
    }
  };

  // 获取需要修复的规则
  const [rulesToFix] = await connection.execute(`
    SELECT id, intent_name, category, action_target
    FROM nlp_intent_rules
    WHERE status = 'active'
    AND category IN ('库存场景', '测试场景', '上线场景', '批次管理')
    ORDER BY category
  `);

  console.log(`📊 需要修复字段设计的规则: ${rulesToFix.length}条`);

  let fixedCount = 0;

  for (const rule of rulesToFix) {
    const design = standardFieldDesigns[rule.category];
    if (design) {
      try {
        // 构建新的SQL查询
        let newSQL = design.sqlTemplate;

        // 根据规则名称添加特定的WHERE条件
        const whereConditions = generateWhereConditions(rule.intent_name);
        if (whereConditions) {
          newSQL += ` WHERE ${whereConditions}`;
        }

        newSQL += ` ORDER BY ${getOrderByClause(rule.category)}`;

        // 更新规则
        await connection.execute(`
          UPDATE nlp_intent_rules
          SET action_target = ?
          WHERE id = ?
        `, [newSQL, rule.id]);

        fixedCount++;

        if (fixedCount <= 3) {
          console.log(`✅ ${rule.intent_name} (${rule.category})`);
          console.log(`   字段: ${design.fields.join(', ')}`);
        }

      } catch (error) {
        console.log(`❌ ${rule.intent_name}: 修复失败 - ${error.message}`);
      }
    }
  }

  console.log(`\n📊 字段设计修复完成: ${fixedCount}/${rulesToFix.length}`);
}

/**
 * 根据规则名称生成WHERE条件
 */
function generateWhereConditions(intentName) {
  const name = intentName.toLowerCase();

  // 供应商相关
  if (name.includes('聚龙')) return "supplier_name = '聚龙'";
  if (name.includes('boe')) return "supplier_name = 'BOE'";
  if (name.includes('天马')) return "supplier_name = '天马'";
  if (name.includes('歌尔')) return "supplier_name = '歌尔'";
  if (name.includes('欣冠')) return "supplier_name = '欣冠'";

  // 物料相关
  if (name.includes('电池')) return "material_name LIKE '%电池%'";
  if (name.includes('显示屏')) return "material_name LIKE '%显示屏%'";
  if (name.includes('听筒')) return "material_name LIKE '%听筒%'";
  if (name.includes('卡托')) return "material_name LIKE '%卡托%'";

  // 状态相关
  if (name.includes('风险')) return "status = '风险'";
  if (name.includes('正常')) return "status = '正常'";
  if (name.includes('ng') || name.includes('不合格')) return "test_result = 'NG'";
  if (name.includes('ok') || name.includes('合格')) return "test_result = 'OK'";

  return null;
}

/**
 * 获取排序子句
 */
function getOrderByClause(category) {
  switch (category) {
    case '库存场景': return 'inbound_time DESC';
    case '测试场景': return 'test_date DESC';
    case '上线场景': return 'inspection_date DESC';
    case '批次管理': return 'batch_code DESC';
    default: return 'id DESC';
  }
}

// 执行修复
fixRulesAndPresentation();
