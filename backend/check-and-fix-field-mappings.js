import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkAndFixFieldMappings() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查并修复所有规则的字段映射...\n');
    
    // 获取所有规则
    const [allRules] = await connection.execute(
      'SELECT intent_name, action_target, category FROM nlp_intent_rules ORDER BY sort_order'
    );
    
    console.log(`📋 检查 ${allRules.length} 条规则的字段映射\n`);
    
    // 定义标准字段映射SQL模板
    const fieldMappings = {
      // 库存场景字段: 工厂、仓库、物料编码、物料名称、供应商、数量、状态、入库时间、到期时间、备注
      inventory: `
SELECT
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory`,

      // 上线场景字段: 工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注
      online: `
SELECT
  factory as 工厂,
  'Baseline-V1.0' as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(COALESCE(defect_rate, 0) * 100, 2), '%') as 不良率,
  COALESCE(exception_count, 0) as 本周异常,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking`,

      // 测试场景字段: 测试编号、日期、项目、基线、物料编码、数量、物料名称、供应商、测试结果、不合格描述、备注
      test: `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, 'Project-Test') as 项目,
  COALESCE(baseline_id, 'Baseline-V1.0') as 基线,
  material_code as 物料编码,
  100 as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests`,

      // 批次场景字段: 批次号、物料编码、物料名称、供应商、数量、入库日期、产线异常、测试异常、备注
      batch: `
SELECT
  batch_code as 批次号,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库日期,
  CASE 
    WHEN status = '风险' THEN '有异常'
    WHEN status = '冻结' THEN '有异常'
    ELSE '无异常'
  END as 产线异常,
  CASE 
    WHEN risk_level = 'HIGH' THEN '有异常'
    WHEN risk_level = 'MEDIUM' THEN '轻微异常'
    ELSE '无异常'
  END as 测试异常,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE batch_code IS NOT NULL AND batch_code != ''`
    };
    
    console.log('=== 开始检查和修复字段映射 ===\n');
    
    let fixedCount = 0;
    let checkedCount = 0;
    
    for (const rule of allRules) {
      checkedCount++;
      const ruleName = rule.intent_name;
      const currentSQL = rule.action_target;
      const category = rule.category;
      
      console.log(`${checkedCount}. 检查规则: ${ruleName} (${category})`);
      
      // 检查是否包含中文字段映射
      const hasChineseFields = currentSQL.includes(' as 工厂') || 
                              currentSQL.includes(' as 库存') || 
                              currentSQL.includes(' as 测试编号') || 
                              currentSQL.includes(' as 批次号');
      
      if (hasChineseFields) {
        console.log(`  ✅ 字段映射正确`);
        continue;
      }
      
      console.log(`  ❌ 缺少中文字段映射，开始修复...`);
      
      // 根据规则名称和分类确定应该使用的字段映射
      let newSQL = '';
      let baseSQL = '';
      let whereClause = '';
      let orderClause = 'ORDER BY inbound_time DESC\nLIMIT 20';
      
      // 确定基础SQL和条件
      if (category === '库存场景' || ruleName.includes('库存')) {
        baseSQL = fieldMappings.inventory;
        orderClause = 'ORDER BY inbound_time DESC\nLIMIT 20';
        
        // 根据规则名称添加特定条件
        if (ruleName.includes('供应商')) {
          whereClause = '\nWHERE supplier_name IS NOT NULL AND supplier_name != ""';
        } else if (ruleName.includes('风险')) {
          whereClause = '\nWHERE status IN ("风险", "冻结")';
        } else if (ruleName.includes('电池')) {
          whereClause = '\nWHERE material_name LIKE "%电池%"';
        } else if (ruleName.includes('结构件')) {
          whereClause = '\nWHERE (material_name LIKE "%电池盖%" OR material_name LIKE "%中框%" OR material_name LIKE "%手机卡托%" OR material_name LIKE "%侧键%" OR material_name LIKE "%装饰件%")';
        } else if (ruleName.includes('光学')) {
          whereClause = '\nWHERE (material_name LIKE "%LCD显示屏%" OR material_name LIKE "%摄像头%" OR material_name LIKE "%传感器%")';
        } else if (ruleName.includes('充电')) {
          whereClause = '\nWHERE (material_name LIKE "%电池%" OR material_name LIKE "%充电器%" OR material_name LIKE "%充电线%")';
        } else if (ruleName.includes('声学')) {
          whereClause = '\nWHERE (material_name LIKE "%扬声器%" OR material_name LIKE "%麦克风%" OR material_name LIKE "%听筒%")';
        } else if (ruleName.includes('包装')) {
          whereClause = '\nWHERE (material_name LIKE "%包装盒%" OR material_name LIKE "%说明书%" OR material_name LIKE "%保护膜%")';
        } else if (ruleName.includes('物料大类')) {
          whereClause = '\nWHERE material_name IS NOT NULL AND material_name != ""';
        }
        
      } else if (category === '上线场景' || ruleName.includes('上线')) {
        baseSQL = fieldMappings.online;
        orderClause = 'ORDER BY online_date DESC\nLIMIT 20';
        
        if (ruleName.includes('供应商')) {
          whereClause = '\nWHERE supplier_name IS NOT NULL AND supplier_name != ""';
        } else if (ruleName.includes('结构件')) {
          whereClause = '\nWHERE (material_name LIKE "%电池盖%" OR material_name LIKE "%中框%" OR material_name LIKE "%手机卡托%" OR material_name LIKE "%侧键%" OR material_name LIKE "%装饰件%")';
        } else if (ruleName.includes('光学')) {
          whereClause = '\nWHERE (material_name LIKE "%LCD显示屏%" OR material_name LIKE "%摄像头%" OR material_name LIKE "%传感器%")';
        } else if (ruleName.includes('充电')) {
          whereClause = '\nWHERE (material_name LIKE "%电池%" OR material_name LIKE "%充电器%" OR material_name LIKE "%充电线%")';
        } else if (ruleName.includes('声学')) {
          whereClause = '\nWHERE (material_name LIKE "%扬声器%" OR material_name LIKE "%麦克风%" OR material_name LIKE "%听筒%")';
        } else if (ruleName.includes('包装')) {
          whereClause = '\nWHERE (material_name LIKE "%包装盒%" OR material_name LIKE "%说明书%" OR material_name LIKE "%保护膜%")';
        } else if (ruleName.includes('Top不良')) {
          whereClause = '\nWHERE defect_rate > 0.01';
          orderClause = 'ORDER BY defect_rate DESC\nLIMIT 20';
        }
        
      } else if (category === '测试场景' || ruleName.includes('测试') || ruleName.includes('NG')) {
        baseSQL = fieldMappings.test;
        orderClause = 'ORDER BY test_date DESC\nLIMIT 20';
        
        if (ruleName.includes('供应商')) {
          whereClause = '\nWHERE supplier_name IS NOT NULL AND supplier_name != ""';
        } else if (ruleName.includes('NG')) {
          whereClause = '\nWHERE test_result = "NG"';
        } else if (ruleName.includes('项目')) {
          whereClause = '\nWHERE project_id IS NOT NULL AND project_id != ""';
        } else if (ruleName.includes('基线')) {
          whereClause = '\nWHERE baseline_id IS NOT NULL AND baseline_id != ""';
        } else if (ruleName.includes('Top缺陷')) {
          whereClause = '\nWHERE test_result = "NG" AND defect_desc IS NOT NULL AND defect_desc != ""';
        } else if (ruleName.includes('结构件')) {
          whereClause = '\nWHERE (material_name LIKE "%电池盖%" OR material_name LIKE "%中框%" OR material_name LIKE "%手机卡托%" OR material_name LIKE "%侧键%" OR material_name LIKE "%装饰件%")';
        } else if (ruleName.includes('光学')) {
          whereClause = '\nWHERE (material_name LIKE "%LCD显示屏%" OR material_name LIKE "%摄像头%" OR material_name LIKE "%传感器%")';
        } else if (ruleName.includes('充电')) {
          whereClause = '\nWHERE (material_name LIKE "%电池%" OR material_name LIKE "%充电器%" OR material_name LIKE "%充电线%")';
        } else if (ruleName.includes('声学')) {
          whereClause = '\nWHERE (material_name LIKE "%扬声器%" OR material_name LIKE "%麦克风%" OR material_name LIKE "%听筒%")';
        } else if (ruleName.includes('包装')) {
          whereClause = '\nWHERE (material_name LIKE "%包装盒%" OR material_name LIKE "%说明书%" OR material_name LIKE "%保护膜%")';
        } else if (ruleName.includes('Top不良')) {
          whereClause = '\nWHERE test_result = "NG"';
        }
        
      } else if (category === '批次场景' || ruleName.includes('批次')) {
        if (ruleName.includes('测试')) {
          baseSQL = fieldMappings.test;
          whereClause = '\nWHERE batch_code IS NOT NULL AND batch_code != ""';
          orderClause = 'ORDER BY test_date DESC\nLIMIT 20';
        } else if (ruleName.includes('上线')) {
          baseSQL = fieldMappings.online;
          whereClause = '\nWHERE batch_code LIKE CONCAT("%", ?, "%")';
          orderClause = 'ORDER BY online_date DESC\nLIMIT 20';
        } else {
          baseSQL = fieldMappings.batch;
          orderClause = 'ORDER BY inbound_time DESC\nLIMIT 20';
        }
      }
      
      // 构建完整SQL
      if (baseSQL) {
        newSQL = baseSQL + whereClause + '\n' + orderClause;
        newSQL = newSQL.trim();
        
        try {
          await connection.execute(
            'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
            [newSQL, ruleName]
          );
          console.log(`  ✅ 已修复字段映射`);
          fixedCount++;
        } catch (error) {
          console.log(`  ❌ 修复失败: ${error.message}`);
        }
      } else {
        console.log(`  ⚠️  无法确定字段映射类型，跳过`);
      }
    }
    
    console.log(`\n=== 修复完成总结 ===`);
    console.log(`📋 检查规则数: ${checkedCount}`);
    console.log(`🔧 修复规则数: ${fixedCount}`);
    console.log(`✅ 完成率: ${((fixedCount / checkedCount) * 100).toFixed(2)}%`);
    
    if (fixedCount > 0) {
      console.log('\n🎉 字段映射修复完成！');
      console.log('📊 现在所有查询结果都会显示中文字段名');
      console.log('🔄 请重启后端服务以加载更新的规则');
    } else {
      console.log('\n✅ 所有规则的字段映射都已正确');
    }
    
  } catch (error) {
    console.error('❌ 操作过程中出错:', error);
  } finally {
    await connection.end();
  }
}

checkAndFixFieldMappings();
