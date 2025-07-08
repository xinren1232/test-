/**
 * 更新数据库结构和NLP规则
 * 基于前端实际字段需求进行优化
 */

const mysql = require('mysql2/promise');
const fs = require('fs');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function updateDatabaseAndRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔄 开始更新数据库结构和NLP规则...');
    
    // 1. 检查当前表结构
    console.log('\n📋 检查当前表结构...');
    
    // 检查inventory表是否需要添加字段
    const [inventoryFields] = await connection.execute('DESCRIBE inventory');
    const inventoryFieldNames = inventoryFields.map(f => f.Field);
    
    console.log('当前inventory表字段:', inventoryFieldNames.join(', '));
    
    // 添加缺失的字段到inventory表
    const requiredInventoryFields = [
      { name: 'factory', type: 'VARCHAR(50)', comment: '工厂' },
      { name: 'warehouse', type: 'VARCHAR(50)', comment: '仓库' },
      { name: 'expiry_time', type: 'DATETIME', comment: '到期时间' }
    ];
    
    for (const field of requiredInventoryFields) {
      if (!inventoryFieldNames.includes(field.name)) {
        console.log(`添加字段 inventory.${field.name}...`);
        await connection.execute(
          `ALTER TABLE inventory ADD COLUMN ${field.name} ${field.type} COMMENT '${field.comment}'`
        );
      }
    }
    
    // 检查lab_tests表是否需要添加字段
    const [labTestsFields] = await connection.execute('DESCRIBE lab_tests');
    const labTestsFieldNames = labTestsFields.map(f => f.Field);
    
    console.log('当前lab_tests表字段:', labTestsFieldNames.join(', '));
    
    // 添加缺失的字段到lab_tests表
    const requiredLabTestsFields = [
      { name: 'project', type: 'VARCHAR(100)', comment: '项目' },
      { name: 'baseline', type: 'VARCHAR(100)', comment: '基线' },
      { name: 'quantity', type: 'INT', comment: '数量' }
    ];
    
    for (const field of requiredLabTestsFields) {
      if (!labTestsFieldNames.includes(field.name)) {
        console.log(`添加字段 lab_tests.${field.name}...`);
        await connection.execute(
          `ALTER TABLE lab_tests ADD COLUMN ${field.name} ${field.type} COMMENT '${field.comment}'`
        );
      }
    }
    
    // 2. 更新现有数据以匹配前端字段需求
    console.log('\n🔄 更新现有数据...');
    
    // 为inventory表添加示例数据
    await connection.execute(`
      UPDATE inventory SET 
        factory = CASE 
          WHEN storage_location LIKE '%深圳%' THEN '深圳工厂'
          WHEN storage_location LIKE '%宜宾%' THEN '宜宾工厂'
          WHEN storage_location LIKE '%上海%' THEN '上海工厂'
          ELSE '深圳工厂'
        END,
        warehouse = CASE 
          WHEN storage_location LIKE '%A%' THEN 'A区仓库'
          WHEN storage_location LIKE '%B%' THEN 'B区仓库'
          WHEN storage_location LIKE '%C%' THEN 'C区仓库'
          ELSE 'A区仓库'
        END,
        expiry_time = DATE_ADD(inbound_time, INTERVAL 365 DAY)
      WHERE factory IS NULL OR warehouse IS NULL OR expiry_time IS NULL
    `);
    
    // 为lab_tests表添加示例数据
    await connection.execute(`
      UPDATE lab_tests SET 
        project = CASE 
          WHEN material_name LIKE '%电池%' THEN 'Project-Battery-2024'
          WHEN material_name LIKE '%电容%' THEN 'Project-Capacitor-2024'
          WHEN material_name LIKE '%电芯%' THEN 'Project-Cell-2024'
          ELSE 'Project-General-2024'
        END,
        baseline = CASE 
          WHEN test_result = 'PASS' THEN 'Baseline-V1.0'
          WHEN test_result = 'FAIL' THEN 'Baseline-V0.9'
          ELSE 'Baseline-V1.0'
        END,
        quantity = FLOOR(1 + RAND() * 100)
      WHERE project IS NULL OR baseline IS NULL OR quantity IS NULL
    `);
    
    // 3. 更新NLP规则
    console.log('\n📝 更新NLP规则...');
    
    // 删除现有规则
    await connection.execute('DELETE FROM nlp_intent_rules');
    
    // 插入优化的规则
    const optimizedRules = [
      {
        intent_name: '测试结果统计',
        description: '统计测试结果分布情况，显示OK/NG次数',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          project as 项目,
          baseline as 基线,
          material_type as 物料类型,
          defect_desc as 不合格描述,
          COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) as OK次数,
          COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as NG次数,
          COUNT(*) as 总测试次数
        FROM lab_tests 
        WHERE test_result IN ('PASS', 'FAIL')
        GROUP BY project, baseline, material_type, defect_desc
        ORDER BY NG次数 DESC, OK次数 DESC
        LIMIT 10`,
        parameters: JSON.stringify([{"name":"test_type","type":"string","required":false,"description":"测试类型筛选"}]),
        trigger_words: JSON.stringify(["测试结果", "统计", "OK", "NG", "合格率", "不合格率"]),
        synonyms: JSON.stringify({"测试结果": ["检测结果", "测试状态"], "统计": ["分析", "汇总"], "OK": ["合格", "通过", "PASS"], "NG": ["不合格", "失败", "FAIL"]}),
        example_query: '统计测试结果分布情况',
        priority: 10
      },
      {
        intent_name: 'NG测试结果查询',
        description: '查询测试失败的记录，显示NG次数而非物料数量',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          test_id as 测试编号,
          DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
          project as 项目,
          baseline as 基线,
          material_type as 物料类型,
          COUNT(*) as NG次数,
          material_name as 物料名称,
          supplier_name as 供应商,
          defect_desc as 不合格描述,
          '' as 备注
        FROM lab_tests 
        WHERE test_result = 'FAIL'
        GROUP BY test_id, test_date, project, baseline, material_type, material_name, supplier_name, defect_desc
        ORDER BY test_date DESC, NG次数 DESC
        LIMIT 10`,
        parameters: JSON.stringify([{"name":"date_range","type":"string","required":false,"description":"日期范围"}]),
        trigger_words: JSON.stringify(["NG", "不合格", "失败", "测试失败", "不良品"]),
        synonyms: JSON.stringify({"NG": ["不合格", "失败", "FAIL"], "测试": ["检测", "检验"]}),
        example_query: '查询NG测试结果',
        priority: 9
      },
      {
        intent_name: '库存查询',
        description: '查询库存信息，按工厂、仓库、物料类型等筛选',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          factory as 工厂,
          warehouse as 仓库,
          material_type as 物料类型,
          supplier_name as 供应商名称,
          supplier_code as 供应商,
          SUM(quantity) as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
          DATE_FORMAT(expiry_time, '%Y-%m-%d') as 到期时间,
          '' as 备注
        FROM inventory 
        WHERE 1=1
        GROUP BY factory, warehouse, material_type, supplier_name, supplier_code, status, inbound_time, expiry_time
        ORDER BY 数量 DESC
        LIMIT 10`,
        parameters: JSON.stringify([{"name":"factory","type":"string","required":false,"description":"工厂名称"}]),
        trigger_words: JSON.stringify(["库存", "查询", "工厂", "仓库", "物料", "供应商"]),
        synonyms: JSON.stringify({"库存": ["存货", "物料库存"], "查询": ["查找", "搜索"], "工厂": ["厂区", "生产基地"]}),
        example_query: '查询库存情况',
        priority: 8
      }
    ];
    
    for (const rule of optimizedRules) {
      await connection.execute(
        `INSERT INTO nlp_intent_rules 
         (intent_name, description, action_type, action_target, parameters, trigger_words, synonyms, example_query, priority, status, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
        [
          rule.intent_name,
          rule.description,
          rule.action_type,
          rule.action_target,
          rule.parameters,
          rule.trigger_words,
          rule.synonyms,
          rule.example_query,
          rule.priority
        ]
      );
      console.log(`✅ 插入规则: ${rule.intent_name}`);
    }
    
    // 4. 验证更新结果
    console.log('\n✅ 验证更新结果...');
    
    const [updatedRules] = await connection.execute(
      'SELECT intent_name, description FROM nlp_intent_rules ORDER BY priority DESC'
    );
    
    console.log('更新后的NLP规则:');
    updatedRules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name} - ${rule.description}`);
    });
    
    console.log('\n🎉 数据库结构和NLP规则更新完成！');
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
  } finally {
    await connection.end();
  }
}

updateDatabaseAndRules().catch(console.error);
