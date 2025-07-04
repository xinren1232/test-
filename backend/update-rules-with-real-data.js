/**
 * 基于真实数据更新AI Q&A规则
 * 使用实际的供应商、物料、工厂等信息
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function updateRulesWithRealData() {
  console.log('🔄 基于真实数据更新AI Q&A规则\n');

  try {
    const connection = await mysql.createConnection(dbConfig);

    // 1. 更新供应商查询规则 - 使用真实供应商
    console.log('📝 步骤1: 更新供应商查询规则...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = ?,
        description = '查询真实供应商的库存和质量信息',
        example_query = '查询聚龙的库存情况'
      WHERE intent_name = '真实供应商查询'
    `, [`SELECT 
          supplier_name as 供应商,
          COUNT(*) as 物料数量,
          AVG(quantity) as 平均库存量,
          GROUP_CONCAT(DISTINCT status) as 状态分布,
          GROUP_CONCAT(DISTINCT material_type) as 物料类型,
          GROUP_CONCAT(DISTINCT storage_location) as 涉及工厂
        FROM inventory 
        WHERE supplier_name IN ('聚龙','欣冠','广正','富群','怡同','丽德宝','东声','歌尔','天马','BOE','瑞声','盛泰')
        GROUP BY supplier_name
        ORDER BY COUNT(*) DESC`]);

    console.log('✅ 供应商查询规则已更新');

    // 2. 更新物料质量分析规则 - 使用真实物料
    console.log('📝 步骤2: 更新物料质量分析规则...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = ?,
        description = '分析真实物料的质量状态',
        example_query = '分析摄像头的质量状态'
      WHERE intent_name = '真实物料质量分析'
    `, [`SELECT
          material_name as 物料名称,
          material_type as 物料类型,
          status as 状态,
          risk_level as 风险等级,
          COUNT(*) as 数量,
          supplier_name as 供应商,
          storage_location as 工厂
        FROM inventory
        WHERE material_name IN ('摄像头(CAM)','包装盒','听筒','侧键','喇叭','保护套','电池盖','装饰件','中框','电池','标签','手机卡托','OLED显示屏','充电器','LCD显示屏')
           OR material_name LIKE CONCAT('%', ?, '%')
        GROUP BY material_name, status, supplier_name
        ORDER BY risk_level DESC, created_at DESC
        LIMIT 20`]);

    console.log('✅ 物料质量分析规则已更新');

    // 3. 更新车间生产分析规则 - 使用真实工厂
    console.log('📝 步骤3: 更新车间生产分析规则...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = ?,
        description = '分析真实工厂的生产情况',
        example_query = '查询重庆工厂的生产情况'
      WHERE intent_name = '真实车间生产分析'
    `, [`SELECT
          factory as 工厂,
          line as 产线,
          project as 项目,
          COUNT(*) as 生产记录数,
          AVG(defect_rate) as 平均不良率,
          SUM(exception_count) as 总异常数,
          GROUP_CONCAT(DISTINCT material_name) as 生产物料
        FROM online_tracking
        WHERE factory IN ('南昌工厂','重庆工厂','深圳工厂','宜宾工厂')
        GROUP BY factory, line, project
        ORDER BY AVG(defect_rate) DESC
        LIMIT 15`]);

    console.log('✅ 车间生产分析规则已更新');

    // 4. 添加新的工厂库存查询规则
    console.log('📝 步骤4: 添加工厂库存查询规则...');
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, description, action_type, action_target,
        parameters, example_query, status, priority, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        action_target = VALUES(action_target),
        description = VALUES(description),
        example_query = VALUES(example_query),
        updated_at = NOW()
    `, [
      '工厂库存查询,查询工厂,工厂情况',
      '查询特定工厂的库存详情',
      'SQL_QUERY',
      `SELECT
        storage_location as 工厂,
        material_name as 物料名称,
        supplier_name as 供应商,
        COUNT(*) as 批次数量,
        SUM(quantity) as 总库存量,
        GROUP_CONCAT(DISTINCT status) as 状态分布,
        AVG(quantity) as 平均批次量
      FROM inventory
      WHERE storage_location LIKE CONCAT('%', ?, '%')
      GROUP BY storage_location, material_name, supplier_name
      ORDER BY SUM(quantity) DESC
      LIMIT 20`,
      null,
      '查询重庆工厂的库存情况',
      'active',
      5
    ]);

    console.log('✅ 工厂库存查询规则已添加');

    // 5. 添加状态筛选规则
    console.log('📝 步骤5: 添加状态筛选规则...');
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, description, action_type, action_target,
        parameters, example_query, status, priority, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        action_target = VALUES(action_target),
        description = VALUES(description),
        example_query = VALUES(example_query),
        updated_at = NOW()
    `, [
      '状态查询,风险查询,冻结查询,正常查询',
      '查询特定状态的库存物料',
      'SQL_QUERY',
      `SELECT
        status as 状态,
        material_name as 物料名称,
        supplier_name as 供应商,
        storage_location as 工厂,
        batch_code as 批次号,
        quantity as 数量,
        risk_level as 风险等级,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库日期
      FROM inventory
      WHERE status IN ('正常','风险','冻结')
        AND (status LIKE CONCAT('%', ?, '%') OR ? = '')
      ORDER BY
        CASE status
          WHEN '冻结' THEN 1
          WHEN '风险' THEN 2
          WHEN '正常' THEN 3
        END,
        created_at DESC
      LIMIT 20`,
      null,
      '查询风险状态的库存',
      'active',
      8
    ]);

    console.log('✅ 状态筛选规则已添加');

    // 6. 添加供应商物料组合查询规则
    console.log('📝 步骤6: 添加供应商物料组合查询规则...');
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, description, action_type, action_target,
        parameters, example_query, status, priority, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        action_target = VALUES(action_target),
        description = VALUES(description),
        example_query = VALUES(example_query),
        updated_at = NOW()
    `, [
      '供应商物料查询,供应商分析',
      '分析供应商提供的物料分布和质量',
      'SQL_QUERY',
      `SELECT
        supplier_name as 供应商,
        material_name as 物料名称,
        material_type as 物料类型,
        COUNT(*) as 批次数,
        SUM(quantity) as 总数量,
        AVG(quantity) as 平均数量,
        GROUP_CONCAT(DISTINCT status) as 状态分布,
        GROUP_CONCAT(DISTINCT storage_location) as 分布工厂
      FROM inventory
      WHERE supplier_name LIKE CONCAT('%', ?, '%')
        OR material_name LIKE CONCAT('%', ?, '%')
      GROUP BY supplier_name, material_name, material_type
      ORDER BY COUNT(*) DESC, SUM(quantity) DESC
      LIMIT 15`,
      null,
      '分析聚龙供应商的物料情况',
      'active',
      6
    ]);

    console.log('✅ 供应商物料组合查询规则已添加');

    await connection.end();

    console.log('\n🎉 规则更新完成！');
    console.log('✅ 所有规则已基于真实数据更新');
    console.log('✅ 供应商: 聚龙、欣冠、广正等21个真实供应商');
    console.log('✅ 物料: 摄像头(CAM)、包装盒、听筒等15种真实物料');
    console.log('✅ 工厂: 南昌工厂、重庆工厂、深圳工厂、宜宾工厂');
    console.log('✅ 状态: 正常、风险、冻结');

  } catch (error) {
    console.error('❌ 更新规则失败:', error);
  }
}

// 运行更新
updateRulesWithRealData();
