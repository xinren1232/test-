/**
 * 数据库服务器 - 处理前端数据同步和AI查询
 */

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '数据库服务器正常运行',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// 数据更新接口 - 将前端数据同步到数据库
app.post('/api/assistant/update-data', async (req, res) => {
  console.log('=== 收到前端数据推送请求 ===');
  console.log('请求时间:', new Date().toISOString());

  let dbConnection;
  try {
    // 验证请求体
    if (!req.body) {
      throw new Error('请求体为空');
    }

    // 连接数据库
    console.log('正在连接数据库...');
    dbConnection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');

    // 记录请求体大小
    const requestSize = JSON.stringify(req.body).length;
    console.log(`请求体大小: ${(requestSize / 1024).toFixed(2)} KB`);

    // 兼容不同的数据格式 - 支持 lab 和 inspection
    const { inventory, lab, inspection, production, metadata } = req.body || {};
    const actualInspection = inspection || lab || [];

    const inventoryCount = inventory ? inventory.length : 0;
    const inspectionCount = actualInspection ? actualInspection.length : 0;
    const productionCount = production ? production.length : 0;

    console.log(`前端推送数据: 库存${inventoryCount}条, 检验${inspectionCount}条, 生产${productionCount}条`);
    console.log('元数据:', metadata);

    // 验证数据格式 - 使用默认空数组避免错误
    const safeInventory = Array.isArray(inventory) ? inventory : [];
    const safeInspection = Array.isArray(actualInspection) ? actualInspection : [];
    const safeProduction = Array.isArray(production) ? production : [];

    let syncedCounts = { inventory: 0, inspection: 0, production: 0 };

    // 同步库存数据到数据库
    if (safeInventory.length > 0) {
      console.log('开始同步库存数据到数据库...');

      // 清空现有数据
      await dbConnection.query('DELETE FROM inventory');

      // 插入新数据
      for (const item of safeInventory) {
        // 处理日期格式 - 将 ISO 字符串转换为 MySQL 格式
        let inboundTime = item.inbound_time || item.inspectionDate || new Date();
        if (typeof inboundTime === 'string') {
          inboundTime = new Date(inboundTime).toISOString().slice(0, 19).replace('T', ' ');
        } else if (inboundTime instanceof Date) {
          inboundTime = inboundTime.toISOString().slice(0, 19).replace('T', ' ');
        }

        // 增强字段映射逻辑 - 支持前端生成的数据结构
        const mappedItem = {
          id: item.id || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          batch_code: item.batch_code || item.batchNo || item.batchCode || `BATCH-${Date.now()}`,
          material_code: item.material_code || item.materialCode || `MAT-${Date.now()}`,
          material_name: item.material_name || item.materialName || '未知物料',
          material_type: item.material_type || item.materialType || item.category || '通用',
          supplier_name: item.supplier_name || item.supplier || '未知供应商',
          quantity: item.quantity || 0,
          inbound_time: inboundTime,
          storage_location: item.storage_location || item.factory || item.warehouse || '默认仓库',
          status: item.status || '正常',
          risk_level: item.risk_level || 'low',
          inspector: item.inspector || '系统',
          notes: item.notes || item.freezeReason || ''
        };

        console.log(`插入库存记录: ${mappedItem.material_name} - ${mappedItem.supplier_name} - ${mappedItem.batch_code}`);

        await dbConnection.query(`
          INSERT INTO inventory (
            id, batch_code, material_code, material_name, material_type,
            supplier_name, quantity, inbound_time, storage_location,
            status, risk_level, inspector, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            batch_code = VALUES(batch_code),
            material_code = VALUES(material_code),
            material_name = VALUES(material_name),
            material_type = VALUES(material_type),
            supplier_name = VALUES(supplier_name),
            quantity = VALUES(quantity),
            inbound_time = VALUES(inbound_time),
            storage_location = VALUES(storage_location),
            status = VALUES(status),
            risk_level = VALUES(risk_level),
            inspector = VALUES(inspector),
            notes = VALUES(notes)
        `, [
          mappedItem.id,
          mappedItem.batch_code,
          mappedItem.material_code,
          mappedItem.material_name,
          mappedItem.material_type,
          mappedItem.supplier_name,
          mappedItem.quantity,
          mappedItem.inbound_time,
          mappedItem.storage_location,
          mappedItem.status,
          mappedItem.risk_level,
          mappedItem.inspector,
          mappedItem.notes
        ]);
      }
      syncedCounts.inventory = safeInventory.length;
      console.log(`✅ 同步了 ${inventory.length} 条库存数据`);
    }

    // 同步测试数据到数据库
    if (safeInspection.length > 0) {
      console.log('开始同步测试数据到数据库...');

      await dbConnection.query('DELETE FROM lab_tests');

      for (const item of safeInspection) {
        // 处理日期格式
        let testDate = item.test_date || item.testTime || item.inspectionDate || new Date();
        if (typeof testDate === 'string') {
          testDate = new Date(testDate).toISOString().slice(0, 19).replace('T', ' ');
        } else if (testDate instanceof Date) {
          testDate = testDate.toISOString().slice(0, 19).replace('T', ' ');
        }

        await dbConnection.query(`
          INSERT INTO lab_tests (
            id, test_id, batch_code, material_code, material_name,
            supplier_name, test_date, test_item, test_result,
            conclusion, defect_desc, tester, reviewer
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            test_id = VALUES(test_id),
            batch_code = VALUES(batch_code),
            material_code = VALUES(material_code),
            material_name = VALUES(material_name),
            supplier_name = VALUES(supplier_name),
            test_date = VALUES(test_date),
            test_item = VALUES(test_item),
            test_result = VALUES(test_result),
            conclusion = VALUES(conclusion),
            defect_desc = VALUES(defect_desc),
            tester = VALUES(tester),
            reviewer = VALUES(reviewer)
        `, [
          item.id || `LAB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          item.test_id || item.id || `TEST-${Date.now()}`,
          item.batch_code || item.batchNo || `BATCH-${Date.now()}`,
          item.material_code || item.materialCode || `MAT-${Date.now()}`,
          item.material_name || item.materialName || '未知物料',
          item.supplier_name || item.supplier || '未知供应商',
          testDate,
          item.test_item || item.inspection_type || '常规检测',
          item.test_result || item.testResult || item.status || 'OK',
          item.conclusion || item.testResult || item.status || '合格',
          item.defect_desc || item.issue_description || '',
          item.tester || item.inspector || '系统',
          item.reviewer || item.inspector || '系统'
        ]);
      }
      syncedCounts.inspection = safeInspection.length;
      console.log(`✅ 同步了 ${safeInspection.length} 条测试数据`);
    }

    // 同步生产数据到数据库
    if (safeProduction.length > 0) {
      console.log('开始同步生产数据到数据库...');

      await dbConnection.query('DELETE FROM online_tracking');

      for (const item of safeProduction) {
        // 处理日期格式
        let onlineDate = item.online_date || item.onlineTime || item.useTime || new Date();
        if (typeof onlineDate === 'string') {
          onlineDate = new Date(onlineDate).toISOString().slice(0, 19).replace('T', ' ');
        } else if (onlineDate instanceof Date) {
          onlineDate = onlineDate.toISOString().slice(0, 19).replace('T', ' ');
        }

        let useTime = item.use_time || item.useTime || item.onlineTime || new Date();
        if (typeof useTime === 'string') {
          useTime = new Date(useTime).toISOString().slice(0, 19).replace('T', ' ');
        } else if (useTime instanceof Date) {
          useTime = useTime.toISOString().slice(0, 19).replace('T', ' ');
        }

        // 处理 defect_rate - 确保在 DECIMAL(5,4) 范围内
        let defectRate = parseFloat(item.defect_rate || item.defectRate || 0);
        if (isNaN(defectRate)) defectRate = 0;
        if (defectRate > 9.9999) defectRate = 9.9999;
        if (defectRate < -9.9999) defectRate = -9.9999;

        await dbConnection.query(`
          INSERT INTO online_tracking (
            id, batch_code, material_code, material_name,
            supplier_name, online_date, use_time, factory,
            workshop, line, project, defect_rate,
            exception_count, operator
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            batch_code = VALUES(batch_code),
            material_code = VALUES(material_code),
            material_name = VALUES(material_name),
            supplier_name = VALUES(supplier_name),
            online_date = VALUES(online_date),
            use_time = VALUES(use_time),
            factory = VALUES(factory),
            workshop = VALUES(workshop),
            line = VALUES(line),
            project = VALUES(project),
            defect_rate = VALUES(defect_rate),
            exception_count = VALUES(exception_count),
            operator = VALUES(operator)
        `, [
          item.id || `PROD-${Date.now()}`,
          item.batch_code || item.batchNo || `BATCH-${Date.now()}`,
          item.material_code || item.materialCode || `MAT-${Date.now()}`,
          item.material_name || item.materialName || '未知物料',
          item.supplier_name || item.supplier || '未知供应商',
          onlineDate,
          useTime,
          item.factory || '工厂',
          item.workshop || '车间',
          item.line || '产线',
          item.project || item.projectName || 'PROJECT_GENERAL',
          defectRate,
          parseInt(item.exception_count || 0),
          item.operator || item.inspector || '系统'
        ]);
      }
      syncedCounts.production = safeProduction.length;
      console.log(`✅ 同步了 ${safeProduction.length} 条生产数据`);
    }

    await dbConnection.end();

    // 返回成功响应
    res.json({
      success: true,
      message: '数据已成功同步到数据库',
      synced: syncedCounts,
      dataSize: `${(requestSize / 1024).toFixed(2)} KB`,
      note: '前端数据已写入数据库，AI查询将使用最新数据',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('=== 数据同步失败 ===');
    console.error('错误时间:', new Date().toISOString());
    console.error('错误类型:', error.constructor.name);
    console.error('❌ 数据同步失败:', error);
    console.error('错误堆栈:', error.stack);

    if (dbConnection) {
      try {
        await dbConnection.end();
        console.log('数据库连接已关闭');
      } catch (closeError) {
        console.error('关闭数据库连接失败:', closeError);
      }
    }

    res.status(500).json({
      success: false,
      error: '数据同步失败',
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      timestamp: new Date().toISOString(),
      note: '请检查数据格式和数据库连接'
    });
  }
});

// AI查询端点
app.post('/api/assistant/query', async (req, res) => {
  const { query } = req.body;

  console.log(`🔍 收到AI查询: "${query}"`);

  let dbConnection;
  try {
    // 创建数据库连接
    dbConnection = await mysql.createConnection(dbConfig);

    // 简单的规则匹配测试
    let response = await processSimpleQuery(query, dbConnection);

    console.log(`✅ 返回结果: ${response.substring(0, 100)}...`);

    res.json({
      reply: response,
      source: 'database-service',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 处理查询失败:', error);
    res.status(500).json({
      error: '处理查询失败',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    // 关闭数据库连接
    if (dbConnection) {
      await dbConnection.end();
    }
  }
});

// 数据验证端点
app.post('/api/assistant/verify-data', async (req, res) => {
  console.log('🔍 收到数据验证请求');

  let dbConnection;
  try {
    // 创建数据库连接
    dbConnection = await mysql.createConnection(dbConfig);

    const { expectedCounts } = req.body;
    console.log('📊 期望的数据计数:', expectedCounts);

    // 查询实际数据库中的记录数
    const [inventoryCount] = await dbConnection.execute('SELECT COUNT(*) as count FROM inventory');
    const [labTestsCount] = await dbConnection.execute('SELECT COUNT(*) as count FROM lab_tests');
    const [onlineTrackingCount] = await dbConnection.execute('SELECT COUNT(*) as count FROM online_tracking');

    const actualCounts = {
      inventory: inventoryCount[0].count,
      inspection: labTestsCount[0].count,
      production: onlineTrackingCount[0].count
    };

    console.log('📊 实际数据库计数:', actualCounts);

    // 验证数据计数是否匹配
    const verification = {
      verified: true,
      expectedCounts,
      actualCounts,
      checks: {
        inventory: {
          expected: expectedCounts.inventory,
          actual: actualCounts.inventory,
          match: expectedCounts.inventory === actualCounts.inventory
        },
        inspection: {
          expected: expectedCounts.inspection,
          actual: actualCounts.inspection,
          match: expectedCounts.inspection === actualCounts.inspection
        },
        production: {
          expected: expectedCounts.production,
          actual: actualCounts.production,
          match: expectedCounts.production === actualCounts.production
        }
      },
      timestamp: new Date().toISOString()
    };

    // 总体验证结果
    verification.verified = verification.checks.inventory.match &&
                           verification.checks.inspection.match &&
                           verification.checks.production.match;

    verification.message = verification.verified ?
      '✅ 数据验证成功，所有数据计数匹配' :
      '❌ 数据验证失败，存在数据计数不匹配';

    console.log('🔍 数据验证结果:', verification);

    res.json(verification);
  } catch (error) {
    console.error('❌ 数据验证失败:', error);
    res.status(500).json({
      verified: false,
      error: error.message,
      message: '数据验证过程中发生错误',
      timestamp: new Date().toISOString()
    });
  } finally {
    // 关闭数据库连接
    if (dbConnection) {
      await dbConnection.end();
    }
  }
});

// 智能查询处理函数
async function processSimpleQuery(query, connection) {
  try {
    console.log(`🔍 分析查询: "${query}"`);

    // 提取查询中的关键信息
    const queryInfo = analyzeQuery(query);
    console.log('📋 查询分析结果:', queryInfo);

    // 根据查询类型执行相应的查询
    if (queryInfo.type === 'inventory') {
      return await handleInventoryQuery(query, queryInfo, connection);
    } else if (queryInfo.type === 'test') {
      return await handleTestQuery(query, queryInfo, connection);
    } else if (queryInfo.type === 'production') {
      return await handleProductionQuery(query, queryInfo, connection);
    } else {
      return await handleGeneralQuery(query, connection);
    }

  } catch (error) {
    console.error('查询处理错误:', error);
    return `❌ 查询处理失败：${error.message}`;
  }
}

// 基于真实数据结构的智能查询分析函数
function analyzeQuery(query) {
  console.log(`🔍 分析查询: "${query}"`);

  const analysis = {
    type: 'general',
    keywords: [],
    filters: {},
    limit: 10
  };

  // 先进行实体提取，然后根据实体确定查询类型
  let hasInventoryEntity = false;

  // 提取批次信息 - 支持6位数字批次号格式
  const batchPatterns = [
    /批次[：:]?\s*([0-9]{6})/,           // 标准6位数字批次号
    /批次[：:]?\s*([A-Za-z0-9\-]+)/,     // 其他格式批次号
    /([0-9]{6})(?=的|批次|物料)/,        // 直接的6位数字
    /TEST-([0-9]+)/                      // 测试批次格式
  ];

  for (const pattern of batchPatterns) {
    const batchMatch = query.match(pattern);
    if (batchMatch) {
      analysis.filters.batch = batchMatch[1];
      analysis.keywords.push(batchMatch[1]);
      console.log(`📦 批次匹配成功: "${batchMatch[1]}"`);
      break;
    }
  }

  // 先提取工厂信息 - 基于真实工厂名称（优先级最高）
  const factoryPatterns = [
    /(重庆工厂|深圳工厂|南昌工厂|宜宾工厂)/,  // 真实工厂名称
    /(测试工厂)/,                           // 测试工厂
    /([A-Za-z\u4e00-\u9fa5]+工厂)/          // 通用工厂模式
  ];

  for (const pattern of factoryPatterns) {
    const factoryMatch = query.match(pattern);
    if (factoryMatch) {
      console.log(`🏭 工厂匹配成功: "${factoryMatch[1]}" (模式: ${pattern})`);
      analysis.filters.factory = factoryMatch[1];
      analysis.keywords.push(factoryMatch[1]);
      hasInventoryEntity = true;
      break;
    }
  }

  // 提取供应商信息 - 基于真实供应商名称模式（避免与工厂冲突）
  if (!analysis.filters.factory) { // 只有在没有匹配到工厂时才匹配供应商
    const supplierPatterns = [
      // 真实供应商名称模式（基于material_supplier_mapping.js）
      /(歌尔股份|蓝思科技|比亚迪电子|领益智造|通达集团|安洁科技)/,
      /(舜宇光学|大立光电|欧菲光|丘钛科技|信利光电)/,
      /(宁德时代|比亚迪|欣旺达|德赛电池|ATL)/,
      /(瑞声科技|AAC|美律实业|豪威科技)/,
      /(立讯精密|富士康|和硕|广达|仁宝)/,
      // 通用模式
      /([A-Za-z\u4e00-\u9fa5]+(?:电子|科技|集团|公司|有限公司|股份|光学|精密|制造))/,
      /([A-Za-z\u4e00-\u9fa5]*供应商[A-Za-z0-9]*)/,
      /(测试供应商[A-Za-z0-9]*)/
    ];

    for (const pattern of supplierPatterns) {
      const supplierMatch = query.match(pattern);
      if (supplierMatch) {
        console.log(`🎯 供应商匹配成功: "${supplierMatch[1]}" (模式: ${pattern})`);
        analysis.filters.supplier = supplierMatch[1];
        analysis.keywords.push(supplierMatch[1]);
        hasInventoryEntity = true;
        break;
      }
    }
  }

  // 如果既没有工厂也没有供应商，尝试通用的"查询XXX的"模式
  if (!analysis.filters.factory && !analysis.filters.supplier) {
    const generalPatterns = [
      /查询([A-Za-z\u4e00-\u9fa5]+)的(?:物料|库存)/,
      /([A-Za-z\u4e00-\u9fa5]+)(?=有什么|的物料)/
    ];

    for (const pattern of generalPatterns) {
      const generalMatch = query.match(pattern);
      if (generalMatch) {
        const matchedText = generalMatch[1];
        // 判断是供应商还是工厂
        if (matchedText.includes('工厂')) {
          console.log(`🏭 工厂匹配成功: "${matchedText}" (通用模式)`);
          analysis.filters.factory = matchedText;
          analysis.keywords.push(matchedText);
        } else {
          console.log(`🎯 供应商匹配成功: "${matchedText}" (通用模式)`);
          analysis.filters.supplier = matchedText;
          analysis.keywords.push(matchedText);
        }
        break;
      }
    }
  }

  // 提取物料信息 - 基于真实物料名称模式（优化后）
  const materialPatterns = [
    // 结构件类 - 精确匹配
    /(手机壳料-后盖|手机壳料-中框|手机卡托|侧键|五金小件|装饰件|保护套|硅胶套|后摄镜片)/,
    // 显示与光学类 - 精确匹配
    /(LCD显示屏|OLED显示屏|摄像头|触摸屏|保护玻璃|镜头模组)/,
    // 电子贴片料 - 精确匹配
    /(PCB主板|芯片|电容|电阻|电感|连接器|天线|传感器)/,
    // 电池与充电类 - 精确匹配
    /(电池|充电器|充电线|无线充电器)/,
    // 声学与音频类 - 精确匹配
    /(喇叭|听筒|麦克风|音频芯片)/,
    // 包装与辅料类 - 精确匹配
    /(包装盒|标签|说明书|保修卡|辅料类)/,
    // 通用模式 - 只在没有其他匹配时使用
    /(?:查询|显示|获取)?\s*([A-Za-z\u4e00-\u9fa5\-]+)(?:物料|的库存|信息)/
  ];

  // 先检查是否有精确的物料名称匹配
  let materialFound = false;
  for (let i = 0; i < materialPatterns.length - 1; i++) { // 排除最后一个通用模式
    const pattern = materialPatterns[i];
    const materialMatch = query.match(pattern);
    if (materialMatch) {
      console.log(`🔧 物料匹配成功: "${materialMatch[1]}" (精确匹配)`);
      analysis.filters.material = materialMatch[1];
      analysis.keywords.push(materialMatch[1]);
      hasInventoryEntity = true;
      materialFound = true;
      break;
    }
  }

  // 如果没有精确匹配，且查询明确包含物料相关词汇，则使用通用模式
  if (!materialFound && (query.includes('物料') || query.includes('库存'))) {
    const generalPattern = materialPatterns[materialPatterns.length - 1];
    const materialMatch = query.match(generalPattern);
    if (materialMatch && !analysis.filters.supplier && !analysis.filters.factory) {
      // 只有在没有匹配到供应商和工厂时才使用通用物料匹配
      console.log(`🔧 物料匹配成功: "${materialMatch[1]}" (通用匹配)`);
      analysis.filters.material = materialMatch[1];
      analysis.keywords.push(materialMatch[1]);
      hasInventoryEntity = true;
    }
  }

  // 提取状态信息 - 基于真实状态值
  if (query.includes('风险') || query.includes('异常')) {
    analysis.filters.status = '风险';
    hasInventoryEntity = true;
  }
  if (query.includes('正常')) {
    analysis.filters.status = '正常';
    hasInventoryEntity = true;
  }
  if (query.includes('冻结')) {
    analysis.filters.status = '冻结';
    hasInventoryEntity = true;
  }

  // 提取测试结果 - 基于真实测试结果值
  if (query.includes('合格') || query.includes('PASS') || query.includes('OK')) {
    analysis.filters.testResult = 'PASS';
  }
  if (query.includes('不合格') || query.includes('FAIL') || query.includes('NG')) {
    analysis.filters.testResult = 'FAIL';
  }

  // 根据实体和关键词确定查询类型
  if (analysis.filters.supplier || analysis.filters.factory || analysis.filters.material ||
      analysis.filters.status || hasInventoryEntity ||
      query.includes('库存') || query.includes('物料') || query.includes('批次') || query.includes('供应商')) {
    analysis.type = 'inventory';
  } else if (query.includes('测试') || query.includes('检验') || query.includes('实验') || query.includes('合格') || query.includes('不合格')) {
    analysis.type = 'test';
  } else if (query.includes('生产') || query.includes('在线') || query.includes('产线') || query.includes('不良率')) {
    analysis.type = 'production';
  }

  console.log('📋 查询分析结果:', analysis);
  return analysis;
}

// 处理库存查询
async function handleInventoryQuery(query, queryInfo, connection) {
  let whereConditions = [];
  let params = [];

  console.log('🔍 处理库存查询，分析结果:', queryInfo);

  // 构建WHERE条件 - 基于真实数据库字段
  if (queryInfo.filters.supplier) {
    whereConditions.push('supplier_name LIKE ?');
    params.push(`%${queryInfo.filters.supplier}%`);
    console.log(`📝 添加供应商条件: ${queryInfo.filters.supplier}`);
  }

  if (queryInfo.filters.factory) {
    whereConditions.push('storage_location LIKE ?');
    params.push(`%${queryInfo.filters.factory}%`);
    console.log(`📝 添加工厂条件: ${queryInfo.filters.factory}`);
  }

  if (queryInfo.filters.material) {
    whereConditions.push('(material_name LIKE ? OR material_code LIKE ?)');
    params.push(`%${queryInfo.filters.material}%`, `%${queryInfo.filters.material}%`);
    console.log(`📝 添加物料条件: ${queryInfo.filters.material}`);
  }

  if (queryInfo.filters.batch) {
    whereConditions.push('batch_code LIKE ?');
    params.push(`%${queryInfo.filters.batch}%`);
    console.log(`📝 添加批次条件: ${queryInfo.filters.batch}`);
  }

  if (queryInfo.filters.status) {
    whereConditions.push('status = ?');
    params.push(queryInfo.filters.status);
    console.log(`📝 添加状态条件: ${queryInfo.filters.status}`);
  }

  if (queryInfo.filters.riskLevel) {
    whereConditions.push('risk_level = ?');
    params.push(queryInfo.filters.riskLevel);
    console.log(`📝 添加风险等级条件: ${queryInfo.filters.riskLevel}`);
  }

  const whereClause = whereConditions.length > 0 ?
    'WHERE ' + whereConditions.join(' AND ') : '';

  const sql = `
    SELECT
      material_code as 物料编码,
      material_name as 物料名称,
      batch_code as 批次号,
      supplier_name as 供应商,
      quantity as 数量,
      storage_location as 工厂,
      status as 状态
    FROM inventory
    ${whereClause}
    ORDER BY inbound_time DESC
    LIMIT ${queryInfo.limit}
  `;

  console.log('📊 执行库存查询SQL:', sql);
  console.log('📊 查询参数:', params);

  const [rows] = await connection.execute(sql, params);

  if (rows.length > 0) {
    let result = `📦 查询到 ${rows.length} 条库存记录：\n\n`;
    rows.forEach((row, index) => {
      result += `${index + 1}. ${row.物料名称} (${row.物料编码})\n`;
      result += `   批次: ${row.批次号} | 供应商: ${row.供应商}\n`;
      result += `   数量: ${row.数量} | 工厂: ${row.工厂}\n`;
      result += `   状态: ${row.状态}\n\n`;
    });
    return result;
  } else {
    return `📦 未找到符合条件的库存记录。\n查询条件: ${query}`;
  }
}

// 处理测试查询
async function handleTestQuery(query, queryInfo, connection) {
  let whereConditions = [];
  let params = [];

  if (queryInfo.filters.testResult) {
    whereConditions.push('test_result = ?');
    params.push(queryInfo.filters.testResult);
  }

  if (queryInfo.filters.supplier) {
    whereConditions.push('supplier_name LIKE ?');
    params.push(`%${queryInfo.filters.supplier}%`);
  }

  const whereClause = whereConditions.length > 0 ?
    'WHERE ' + whereConditions.join(' AND ') : '';

  const sql = `
    SELECT
      material_code as 物料编码,
      material_name as 物料名称,
      batch_code as 批次号,
      supplier_name as 供应商,
      test_item as 测试类型,
      test_result as 测试结果,
      conclusion as 结论,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 测试日期,
      tester as 测试员
    FROM lab_tests
    ${whereClause}
    ORDER BY test_date DESC
    LIMIT ${queryInfo.limit}
  `;

  console.log('📊 执行测试查询SQL:', sql);
  console.log('📊 查询参数:', params);

  const [rows] = await connection.execute(sql, params);

  if (rows.length > 0) {
    let result = `🧪 查询到 ${rows.length} 条测试记录：\n\n`;
    rows.forEach((row, index) => {
      result += `${index + 1}. ${row.物料名称} (${row.物料编码})\n`;
      result += `   批次: ${row.批次号} | 供应商: ${row.供应商}\n`;
      result += `   测试类型: ${row.测试类型} | 结果: ${row.测试结果}\n`;
      result += `   结论: ${row.结论} | 测试日期: ${row.测试日期}\n`;
      result += `   测试员: ${row.测试员}\n\n`;
    });
    return result;
  } else {
    return `🧪 未找到符合条件的测试记录。\n查询条件: ${query}`;
  }
}

// 处理生产查询
async function handleProductionQuery(query, queryInfo, connection) {
  const sql = `
    SELECT
      material_code as 物料编码,
      material_name as 物料名称,
      batch_code as 批次号,
      supplier_name as 供应商,
      factory as 工厂,
      project as 项目,
      defect_rate as 不良率,
      DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期
    FROM online_tracking
    ORDER BY online_date DESC
    LIMIT ${queryInfo.limit}
  `;

  const [rows] = await connection.execute(sql);

  if (rows.length > 0) {
    let result = `🏭 查询到 ${rows.length} 条生产记录：\n\n`;
    rows.forEach((row, index) => {
      result += `${index + 1}. ${row.物料名称} (${row.物料编码})\n`;
      result += `   批次: ${row.批次号} | 供应商: ${row.供应商}\n`;
      result += `   工厂: ${row.工厂} | 项目: ${row.项目}\n`;
      result += `   不良率: ${row.不良率}% | 上线日期: ${row.上线日期}\n\n`;
    });
    return result;
  } else {
    return `🏭 未找到生产记录。`;
  }
}

// 处理通用查询
async function handleGeneralQuery(query, connection) {
  return `🤖 AI助手收到您的查询："${query}"\n\n` +
         `✅ 服务状态：正常运行\n` +
         `📊 数据库连接：成功\n` +
         `🔍 查询处理：完成\n\n` +
         `💡 提示：您可以询问关于库存、物料、测试、检验等相关问题。\n` +
         `💡 例如："查询泰科电子的物料"、"查询正常状态库存"、"查询测试不合格的记录"`;
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 数据库服务器启动成功，端口: ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🔄 数据同步: http://localhost:${PORT}/api/assistant/update-data`);
  console.log(`🤖 AI查询: http://localhost:${PORT}/api/assistant/query`);
  console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
}).on('error', (err) => {
  console.error('❌ 服务器启动失败:', err);
});
