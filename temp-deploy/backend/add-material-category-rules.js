import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 物料大类规则定义 - 完整版（所有5个大类）
const MATERIAL_CATEGORY_RULES_ALL = [
  
  // ===== 结构件类规则 =====
  
  {
    intent_name: '结构件类库存查询',
    description: '查询结构件类物料的库存信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  SUBSTRING_INDEX(storage_location, '-', 1) as 工厂,
  SUBSTRING_INDEX(storage_location, '-', -1) as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
WHERE material_name IN ('电池盖', '手机卡托', '侧键', '装饰件')
   OR supplier_name IN ('聚龙', '欣旺', '广正')
ORDER BY inbound_time DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['结构件库存', '结构件查询', '电池盖', '手机卡托', '侧键', '装饰件', '聚龙', '欣旺', '广正']),
    synonyms: JSON.stringify({
      '结构件': ['电池盖', '手机卡托', '侧键', '装饰件'],
      '库存': ['存货', '仓储'],
      '查询': ['查找', '搜索']
    }),
    example_query: '查询结构件类库存',
    category: '物料大类查询',
    priority: 8
  },
  
  {
    intent_name: '结构件类上线情况查询',
    description: '查询结构件类物料的上线跟踪信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  factory as 工厂,
  project as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 本周异常,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking 
WHERE material_name IN ('电池盖', '手机卡托', '侧键', '装饰件')
   OR supplier_name IN ('聚龙', '欣旺', '广正')
ORDER BY inspection_date DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['结构件上线', '结构件跟踪', '电池盖上线', '装饰件上线']),
    synonyms: JSON.stringify({
      '结构件': ['电池盖', '手机卡托', '侧键', '装饰件'],
      '上线': ['在线', '生产'],
      '跟踪': ['追踪', '监控']
    }),
    example_query: '查询结构件类上线情况',
    category: '物料大类查询',
    priority: 8
  },
  
  {
    intent_name: '结构件类测试情况查询',
    description: '查询结构件类物料的测试结果信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '未指定') as 项目,
  COALESCE(baseline_id, '未指定') as 基线,
  material_code as 物料编码,
  COUNT(*) OVER (PARTITION BY material_name, supplier_name) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests 
WHERE material_name IN ('电池盖', '手机卡托', '侧键', '装饰件')
   OR supplier_name IN ('聚龙', '欣旺', '广正')
ORDER BY test_date DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['结构件测试', '结构件检测', '电池盖测试', '装饰件测试']),
    synonyms: JSON.stringify({
      '结构件': ['电池盖', '手机卡托', '侧键', '装饰件'],
      '测试': ['检测', '检验'],
      '结果': ['数据', '报告']
    }),
    example_query: '查询结构件类测试情况',
    category: '物料大类查询',
    priority: 8
  },
  
  // ===== 光学类规则 =====
  
  {
    intent_name: '光学类库存查询',
    description: '查询光学类物料的库存信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  SUBSTRING_INDEX(storage_location, '-', 1) as 工厂,
  SUBSTRING_INDEX(storage_location, '-', -1) as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
WHERE material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头', '显示屏')
   OR supplier_name IN ('帝晶', '天马', 'BOE', '华星', '盖泰', '天实', '深奥')
ORDER BY inbound_time DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['光学类库存', '光学查询', '显示屏', '摄像头', '天马', 'BOE', '华星']),
    synonyms: JSON.stringify({
      '光学': ['显示屏', '摄像头', 'LCD', 'OLED'],
      '库存': ['存货', '仓储'],
      '查询': ['查找', '搜索']
    }),
    example_query: '查询光学类库存',
    category: '物料大类查询',
    priority: 8
  },
  
  {
    intent_name: '光学类上线情况查询',
    description: '查询光学类物料的上线跟踪信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  factory as 工厂,
  project as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 本周异常,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking 
WHERE material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头', '显示屏')
   OR supplier_name IN ('帝晶', '天马', 'BOE', '华星', '盖泰', '天实', '深奥')
ORDER BY inspection_date DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['光学类上线', '光学跟踪', '显示屏上线', '摄像头上线']),
    synonyms: JSON.stringify({
      '光学': ['显示屏', '摄像头', 'LCD', 'OLED'],
      '上线': ['在线', '生产'],
      '跟踪': ['追踪', '监控']
    }),
    example_query: '查询光学类上线情况',
    category: '物料大类查询',
    priority: 8
  },
  
  {
    intent_name: '光学类测试情况查询',
    description: '查询光学类物料的测试结果信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '未指定') as 项目,
  COALESCE(baseline_id, '未指定') as 基线,
  material_code as 物料编码,
  COUNT(*) OVER (PARTITION BY material_name, supplier_name) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests 
WHERE material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头', '显示屏')
   OR supplier_name IN ('帝晶', '天马', 'BOE', '华星', '盖泰', '天实', '深奥')
ORDER BY test_date DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['光学类测试', '光学检测', '显示屏测试', '摄像头测试']),
    synonyms: JSON.stringify({
      '光学': ['显示屏', '摄像头', 'LCD', 'OLED'],
      '测试': ['检测', '检验'],
      '结果': ['数据', '报告']
    }),
    example_query: '查询光学类测试情况',
    category: '物料大类查询',
    priority: 8
  },

  // ===== 充电类规则 =====

  {
    intent_name: '充电类库存查询',
    description: '查询充电类物料的库存信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  SUBSTRING_INDEX(storage_location, '-', 1) as 工厂,
  SUBSTRING_INDEX(storage_location, '-', -1) as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE material_name IN ('电池', '充电器', '锂电池')
   OR supplier_name IN ('奥海', '辰阳', '锂威', '风华', '维科')
ORDER BY inbound_time DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['充电类库存', '充电查询', '电池', '充电器', '奥海', '锂威']),
    synonyms: JSON.stringify({
      '充电': ['电池', '充电器', '锂电池'],
      '库存': ['存货', '仓储'],
      '查询': ['查找', '搜索']
    }),
    example_query: '查询充电类库存',
    category: '物料大类查询',
    priority: 8
  },

  {
    intent_name: '充电类上线情况查询',
    description: '查询充电类物料的上线跟踪信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  factory as 工厂,
  project as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 本周异常,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
WHERE material_name IN ('电池', '充电器', '锂电池')
   OR supplier_name IN ('奥海', '辰阳', '锂威', '风华', '维科')
ORDER BY inspection_date DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['充电类上线', '充电跟踪', '电池上线', '充电器上线']),
    synonyms: JSON.stringify({
      '充电': ['电池', '充电器', '锂电池'],
      '上线': ['在线', '生产'],
      '跟踪': ['追踪', '监控']
    }),
    example_query: '查询充电类上线情况',
    category: '物料大类查询',
    priority: 8
  },

  {
    intent_name: '充电类测试情况查询',
    description: '查询充电类物料的测试结果信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '未指定') as 项目,
  COALESCE(baseline_id, '未指定') as 基线,
  material_code as 物料编码,
  COUNT(*) OVER (PARTITION BY material_name, supplier_name) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests
WHERE material_name IN ('电池', '充电器', '锂电池')
   OR supplier_name IN ('奥海', '辰阳', '锂威', '风华', '维科')
ORDER BY test_date DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['充电类测试', '充电检测', '电池测试', '充电器测试']),
    synonyms: JSON.stringify({
      '充电': ['电池', '充电器', '锂电池'],
      '测试': ['检测', '检验'],
      '结果': ['数据', '报告']
    }),
    example_query: '查询充电类测试情况',
    category: '物料大类查询',
    priority: 8
  },

  // ===== 声学类规则 =====

  {
    intent_name: '声学类库存查询',
    description: '查询声学类物料的库存信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  SUBSTRING_INDEX(storage_location, '-', 1) as 工厂,
  SUBSTRING_INDEX(storage_location, '-', -1) as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE material_name IN ('喇叭', '听筒')
   OR supplier_name IN ('东声', '豪声', '歌尔')
ORDER BY inbound_time DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['声学类库存', '声学查询', '喇叭', '听筒', '东声', '豪声', '歌尔']),
    synonyms: JSON.stringify({
      '声学': ['喇叭', '听筒'],
      '库存': ['存货', '仓储'],
      '查询': ['查找', '搜索']
    }),
    example_query: '查询声学类库存',
    category: '物料大类查询',
    priority: 8
  },

  {
    intent_name: '声学类上线情况查询',
    description: '查询声学类物料的上线跟踪信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  factory as 工厂,
  project as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 本周异常,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
WHERE material_name IN ('喇叭', '听筒')
   OR supplier_name IN ('东声', '豪声', '歌尔')
ORDER BY inspection_date DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['声学类上线', '声学跟踪', '喇叭上线', '听筒上线']),
    synonyms: JSON.stringify({
      '声学': ['喇叭', '听筒'],
      '上线': ['在线', '生产'],
      '跟踪': ['追踪', '监控']
    }),
    example_query: '查询声学类上线情况',
    category: '物料大类查询',
    priority: 8
  },

  {
    intent_name: '声学类测试情况查询',
    description: '查询声学类物料的测试结果信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '未指定') as 项目,
  COALESCE(baseline_id, '未指定') as 基线,
  material_code as 物料编码,
  COUNT(*) OVER (PARTITION BY material_name, supplier_name) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests
WHERE material_name IN ('喇叭', '听筒')
   OR supplier_name IN ('东声', '豪声', '歌尔')
ORDER BY test_date DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['声学类测试', '声学检测', '喇叭测试', '听筒测试']),
    synonyms: JSON.stringify({
      '声学': ['喇叭', '听筒'],
      '测试': ['检测', '检验'],
      '结果': ['数据', '报告']
    }),
    example_query: '查询声学类测试情况',
    category: '物料大类查询',
    priority: 8
  },

  // ===== 包装类规则 =====

  {
    intent_name: '包装类库存查询',
    description: '查询包装类物料的库存信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  SUBSTRING_INDEX(storage_location, '-', 1) as 工厂,
  SUBSTRING_INDEX(storage_location, '-', -1) as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE material_name IN ('保护套', '标签', '包装盒')
   OR supplier_name IN ('丽德宝', '裕同', '富群')
ORDER BY inbound_time DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['包装类库存', '包装查询', '保护套', '标签', '包装盒', '丽德宝', '裕同', '富群']),
    synonyms: JSON.stringify({
      '包装': ['保护套', '标签', '包装盒'],
      '库存': ['存货', '仓储'],
      '查询': ['查找', '搜索']
    }),
    example_query: '查询包装类库存',
    category: '物料大类查询',
    priority: 8
  },

  {
    intent_name: '包装类上线情况查询',
    description: '查询包装类物料的上线跟踪信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  factory as 工厂,
  project as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 本周异常,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
WHERE material_name IN ('保护套', '标签', '包装盒')
   OR supplier_name IN ('丽德宝', '裕同', '富群')
ORDER BY inspection_date DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['包装类上线', '包装跟踪', '保护套上线', '包装盒上线']),
    synonyms: JSON.stringify({
      '包装': ['保护套', '标签', '包装盒'],
      '上线': ['在线', '生产'],
      '跟踪': ['追踪', '监控']
    }),
    example_query: '查询包装类上线情况',
    category: '物料大类查询',
    priority: 8
  },

  {
    intent_name: '包装类测试情况查询',
    description: '查询包装类物料的测试结果信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '未指定') as 项目,
  COALESCE(baseline_id, '未指定') as 基线,
  material_code as 物料编码,
  COUNT(*) OVER (PARTITION BY material_name, supplier_name) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests
WHERE material_name IN ('保护套', '标签', '包装盒')
   OR supplier_name IN ('丽德宝', '裕同', '富群')
ORDER BY test_date DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['包装类测试', '包装检测', '保护套测试', '包装盒测试']),
    synonyms: JSON.stringify({
      '包装': ['保护套', '标签', '包装盒'],
      '测试': ['检测', '检验'],
      '结果': ['数据', '报告']
    }),
    example_query: '查询包装类测试情况',
    category: '物料大类查询',
    priority: 8
  }
];

async function addMaterialCategoryRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔄 开始添加物料大类查询规则（完整版）...\n');
    
    // 检查当前规则数量
    const [currentRules] = await connection.execute(
      'SELECT COUNT(*) as count FROM nlp_intent_rules'
    );
    console.log(`当前规则数量: ${currentRules[0].count}条`);
    
    // 插入物料大类规则
    console.log('\n🚀 插入物料大类规则...');
    
    for (const rule of MATERIAL_CATEGORY_RULES_ALL) {
      // 检查是否已存在同名规则
      const [existing] = await connection.execute(
        'SELECT id FROM nlp_intent_rules WHERE intent_name = ?',
        [rule.intent_name]
      );
      
      if (existing.length > 0) {
        // 更新现有规则
        await connection.execute(`
          UPDATE nlp_intent_rules SET
            description = ?,
            action_type = ?,
            action_target = ?,
            parameters = ?,
            trigger_words = ?,
            synonyms = ?,
            example_query = ?,
            category = ?,
            priority = ?,
            status = 'active',
            updated_at = NOW()
          WHERE intent_name = ?
        `, [
          rule.description,
          rule.action_type,
          rule.action_target,
          rule.parameters,
          rule.trigger_words,
          rule.synonyms,
          rule.example_query,
          rule.category,
          rule.priority,
          rule.intent_name
        ]);
        console.log(`✅ 更新规则: ${rule.intent_name}`);
      } else {
        // 插入新规则
        await connection.execute(`
          INSERT INTO nlp_intent_rules (
            intent_name, description, action_type, action_target,
            parameters, trigger_words, synonyms, example_query,
            category, priority, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
        `, [
          rule.intent_name,
          rule.description,
          rule.action_type,
          rule.action_target,
          rule.parameters,
          rule.trigger_words,
          rule.synonyms,
          rule.example_query,
          rule.category,
          rule.priority
        ]);
        console.log(`✅ 新增规则: ${rule.intent_name}`);
      }
    }
    
    // 验证创建结果
    console.log('\n📊 验证创建结果...');
    const [updatedRules] = await connection.execute(
      'SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = "active"'
    );
    console.log(`活跃规则数量: ${updatedRules[0].count}条`);
    
    // 显示物料大类规则列表
    const [categoryRules] = await connection.execute(`
      SELECT intent_name, category, priority 
      FROM nlp_intent_rules 
      WHERE category = '物料大类查询'
      ORDER BY intent_name
    `);
    
    console.log('\n🎯 物料大类规则列表:');
    categoryRules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name} (优先级: ${rule.priority})`);
    });
    
    console.log('\n✅ 物料大类规则（完整版）创建完成！');
    console.log('📝 已创建5个物料大类的库存、上线、测试规则');
    console.log('🏷️ 包含：结构件类、光学类、充电类、声学类、包装类');
    
  } catch (error) {
    console.error('❌ 创建失败:', error);
  } finally {
    await connection.end();
  }
}

addMaterialCategoryRules().catch(console.error);
