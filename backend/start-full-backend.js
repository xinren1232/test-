/**
 * 完整后端启动脚本
 * 包含数据库连接、规则加载等完整功能
 */
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dbConfig from './src/config/db.config.js';

const app = express();
const PORT = 3001;

console.log('🚀 启动完整IQE后端服务...');

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

console.log('📦 中间件配置完成');

// 数据库连接池
let dbPool = null;

async function initializeDatabase() {
  try {
    console.log('🔄 初始化数据库连接...');
    console.log('📊 数据库配置:', {
      host: dbConfig.host,
      user: dbConfig.username,
      database: dbConfig.database
    });

    dbPool = mysql.createPool({
      host: dbConfig.host,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 测试连接
    const connection = await dbPool.getConnection();
    await connection.execute('SELECT 1');
    connection.release();

    console.log('✅ 数据库连接成功');

    // 创建缺失的表
    await createMissingTables();

    return dbPool;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    throw error;
  }
}

// 创建缺失的数据库表
async function createMissingTables() {
  try {
    console.log('🔧 检查并创建缺失的数据库表...');

    // 创建生产跟踪表
    await dbPool.execute(`
      CREATE TABLE IF NOT EXISTS production_tracking (
        id VARCHAR(50) PRIMARY KEY,
        test_id VARCHAR(50),
        test_date DATE,
        project VARCHAR(50),
        baseline VARCHAR(50),
        material_code VARCHAR(50),
        quantity INT DEFAULT 1,
        material_name VARCHAR(100),
        supplier_name VARCHAR(100),
        defect_desc TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 创建批次管理表
    await dbPool.execute(`
      CREATE TABLE IF NOT EXISTS batch_management (
        id VARCHAR(50) PRIMARY KEY,
        batch_code VARCHAR(50) UNIQUE,
        material_code VARCHAR(50),
        material_name VARCHAR(100),
        supplier_name VARCHAR(100),
        quantity INT DEFAULT 1,
        entry_date DATE,
        production_exception TEXT,
        test_exception TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ 数据库表检查完成');
  } catch (error) {
    console.error('❌ 创建数据库表失败:', error.message);
    // 不抛出错误，允许服务继续启动
  }
}

// 基本API路由
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '完整后端服务运行正常',
    database: dbPool ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 调试端点：检查lab_tests表实际数据
app.get('/api/debug/lab_tests', async (req, res) => {
  try {
    console.log('🔍 调试lab_tests表数据...');

    // 1. 检查表结构
    const [columns] = await dbPool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'iqe_inspection' AND TABLE_NAME = 'lab_tests'
      ORDER BY ORDINAL_POSITION
    `);

    // 2. 查询前5条实际数据
    const [records] = await dbPool.execute('SELECT * FROM lab_tests LIMIT 5');

    // 3. 统计空值情况
    const [nullStats] = await dbPool.execute(`
      SELECT
        SUM(CASE WHEN material_code IS NULL OR material_code = '' THEN 1 ELSE 0 END) as material_code_null,
        SUM(CASE WHEN material_name IS NULL OR material_name = '' THEN 1 ELSE 0 END) as material_name_null,
        SUM(CASE WHEN supplier_name IS NULL OR supplier_name = '' THEN 1 ELSE 0 END) as supplier_name_null,
        COUNT(*) as total_records
      FROM lab_tests
    `);

    res.json({
      success: true,
      tableStructure: columns,
      sampleData: records,
      nullStatistics: nullStats[0],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 调试lab_tests表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 调试端点：检查inventory表实际数据
app.get('/api/debug/inventory', async (req, res) => {
  try {
    console.log('🔍 调试inventory表数据...');

    // 1. 检查表结构
    const [columns] = await dbPool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'iqe_inspection' AND TABLE_NAME = 'inventory'
      ORDER BY ORDINAL_POSITION
    `);

    // 2. 查询前5条实际数据
    const [records] = await dbPool.execute('SELECT * FROM inventory LIMIT 5');

    // 3. 统计空值情况
    const [nullStats] = await dbPool.execute(`
      SELECT
        SUM(CASE WHEN material_code IS NULL OR material_code = '' THEN 1 ELSE 0 END) as material_code_null,
        SUM(CASE WHEN material_name IS NULL OR material_name = '' THEN 1 ELSE 0 END) as material_name_null,
        SUM(CASE WHEN supplier_name IS NULL OR supplier_name = '' THEN 1 ELSE 0 END) as supplier_name_null,
        COUNT(*) as total_records
      FROM inventory
    `);

    res.json({
      success: true,
      tableStructure: columns,
      sampleData: records,
      nullStatistics: nullStats[0],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 调试inventory表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 数据库测试API
app.get('/api/db-test', async (req, res) => {
  try {
    if (!dbPool) {
      return res.status(500).json({ error: '数据库未连接' });
    }

    const [rows] = await dbPool.execute('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?', [dbConfig.database]);
    res.json({
      success: true,
      message: '数据库连接正常',
      tableCount: rows[0].count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 数据库执行API
app.post('/api/db-execute', async (req, res) => {
  try {
    if (!dbPool) {
      return res.status(500).json({ error: '数据库未连接' });
    }

    const { sql } = req.body;
    if (!sql) {
      return res.status(400).json({ error: 'SQL语句不能为空' });
    }

    console.log('🔧 执行SQL:', sql);
    const [result] = await dbPool.execute(sql);

    res.json({
      success: true,
      message: 'SQL执行成功',
      result: result,
      affectedRows: result.affectedRows || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('SQL执行失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 更新规则API
app.put('/api/rules/:id', async (req, res) => {
  try {
    const ruleId = req.params.id;
    const { action_target } = req.body;

    console.log(`🔧 更新规则 ${ruleId}...`);

    if (!action_target) {
      return res.status(400).json({
        success: false,
        message: 'action_target 字段是必需的'
      });
    }

    // 更新规则
    const [result] = await dbPool.execute(
      'UPDATE nlp_intent_rules SET action_target = ? WHERE id = ?',
      [action_target, ruleId]
    );

    if (result.affectedRows > 0) {
      console.log(`✅ 规则 ${ruleId} 更新成功`);
      res.json({
        success: true,
        message: '规则更新成功',
        ruleId: ruleId
      });
    } else {
      console.log(`❌ 规则 ${ruleId} 不存在`);
      res.status(404).json({
        success: false,
        message: '规则不存在'
      });
    }

  } catch (error) {
    console.error('❌ 更新规则失败:', error);
    res.status(500).json({
      success: false,
      message: '更新规则失败',
      error: error.message
    });
  }
});

// 规则库API
app.get('/api/rules', async (req, res) => {
  try {
    if (!dbPool) {
      return res.status(500).json({ error: '数据库未连接' });
    }

    const [rows] = await dbPool.execute(`
      SELECT
        id,
        intent_name,
        description,
        action_type,
        action_target,
        parameters,
        trigger_words,
        synonyms,
        example_query,
        category,
        priority,
        sort_order,
        status,
        created_at,
        updated_at
      FROM nlp_intent_rules
      WHERE status = 'active'
      ORDER BY priority ASC, sort_order ASC, id ASC
    `);

    res.json({
      success: true,
      data: rows,  // 修改为data字段以匹配前端期望
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 智能问答API
app.post('/api/intelligent-qa/ask', async (req, res) => {
  try {
    const { question } = req.body;
    console.log('🤖 收到问答请求:', question);

    // 这里应该调用完整的智能问答系统
    // 暂时返回简单响应
    res.json({
      success: true,
      reply: `您问的是: "${question}"。后端服务正在处理中...`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// AI助手查询API
app.post('/api/assistant/query', async (req, res) => {
  try {
    if (!dbPool) {
      return res.status(500).json({
        success: false,
        error: '数据库未连接'
      });
    }

    const { query, question, scenario, analysisMode } = req.body;
    const queryText = query || question;

    console.log('🤖 AI助手收到查询:', queryText);

    if (!queryText) {
      return res.status(400).json({
        success: false,
        error: '查询文本不能为空'
      });
    }

    // 简单的规则匹配逻辑
    const [rules] = await dbPool.execute(`
      SELECT id, intent_name, description, action_target, trigger_words, category, priority
      FROM nlp_intent_rules
      WHERE status = 'active'
      ORDER BY priority DESC, id ASC
    `);

    let matchedRule = null;
    let maxScore = 0;

    // 查找最匹配的规则
    for (const rule of rules) {
      let score = 0;

      // 检查触发词匹配 - 修复：触发词是逗号分隔的字符串，不是JSON
      if (rule.trigger_words && typeof rule.trigger_words === 'string') {
        const triggerWords = rule.trigger_words.split(',').map(word => word.trim());
        for (const word of triggerWords) {
          if (word && queryText.includes(word)) {
            score += 10;
          }
        }
      }

      // 检查规则名称匹配
      const ruleName = rule.intent_name.replace('查询', '').replace('信息', '');
      if (queryText.includes(ruleName)) {
        score += 5;
      }

      // 检查描述匹配
      if (rule.description) {
        const descWords = rule.description.split(/[，。、\s]+/);
        for (const word of descWords) {
          if (word.length > 1 && queryText.includes(word)) {
            score += 3;
          }
        }
      }

      // 检查分类匹配
      if (rule.category && queryText.includes(rule.category.replace('场景', ''))) {
        score += 2;
      }

      if (score > maxScore) {
        maxScore = score;
        matchedRule = rule;
      }
    }

    console.log(`🎯 规则匹配结果: ${matchedRule ? matchedRule.intent_name : '无匹配'} (得分: ${maxScore})`);

    if (!matchedRule) {
      console.log('❌ 未找到匹配规则，可用规则数量:', rules.length);
      return res.json({
        success: true,
        reply: '抱歉，我无法理解您的查询。请尝试使用更具体的关键词，如"库存"、"测试"、"供应商"等。',
        data: {
          matchedRule: null,
          tableData: []
        }
      });
    }

    try {
      // 执行匹配规则的SQL查询
      console.log('📝 执行SQL查询:', matchedRule.action_target.substring(0, 200) + '...');
      const [results] = await dbPool.execute(matchedRule.action_target);
      console.log('✅ SQL查询成功，返回记录数:', results.length);

      // 格式化响应
      const reply = `**查询结果**\n\n根据您的查询"${queryText}"，我找到了相关信息：\n\n` +
                   `📊 **数据统计**: 共找到 ${results.length} 条记录\n` +
                   `🎯 **匹配规则**: ${matchedRule.intent_name}\n` +
                   `📋 **数据类型**: ${matchedRule.category || '通用查询'}\n\n` +
                   (results.length > 0 ? '详细数据请查看下方表格。' : '暂无相关数据。');

      res.json({
        success: true,
        reply: reply,
        data: {
          matchedRule: {
            id: matchedRule.id,
            name: matchedRule.intent_name,
            description: matchedRule.description,
            category: matchedRule.category
          },
          tableData: results,
          resultCount: results.length,
          fields: results.length > 0 ? Object.keys(results[0]) : []
        }
      });

    } catch (sqlError) {
      console.error('SQL执行错误:', sqlError);
      res.json({
        success: false,
        error: `查询执行失败: ${sqlError.message}`,
        data: {
          matchedRule: {
            id: matchedRule.id,
            name: matchedRule.intent_name,
            description: matchedRule.description
          },
          tableData: []
        }
      });
    }

  } catch (error) {
    console.error('AI助手查询错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 规则测试API
app.post('/api/rules/test/:id', async (req, res) => {
  try {
    if (!dbPool) {
      return res.status(500).json({ error: '数据库未连接' });
    }

    const ruleId = req.params.id;
    const [rows] = await dbPool.execute(
      'SELECT * FROM nlp_intent_rules WHERE id = ? AND status = "active"',
      [ruleId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '规则不存在或已禁用'
      });
    }

    const rule = rows[0];

    try {
      // 执行规则的SQL查询
      const [results] = await dbPool.execute(rule.action_target);

      res.json({
        success: true,
        data: {
          ruleName: rule.intent_name,
          resultCount: results.length,
          sampleData: results.slice(0, 3), // 返回前3条作为示例
          fields: results.length > 0 ? Object.keys(results[0]) : []
        }
      });
    } catch (sqlError) {
      res.json({
        success: false,
        data: {
          ruleName: rule.intent_name,
          error: sqlError.message
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 数据同步API - 标准同步
app.post('/api/assistant/update-data', async (req, res) => {
  try {
    if (!dbPool) {
      return res.status(500).json({
        success: false,
        error: '数据库未连接'
      });
    }

    const { inventory, inspection, production, batches } = req.body;
    console.log('📥 收到数据同步请求:', {
      inventory: inventory?.length || 0,
      inspection: inspection?.length || 0,
      production: production?.length || 0,
      batches: batches?.length || 0
    });

    // 清空现有数据以避免重复累积
    console.log('🧹 清空现有数据...');
    try {
      // 无论是否有新数据，都清空相关表以确保数据一致性
      await dbPool.execute('DELETE FROM inventory');
      console.log('✅ 清空inventory表');

      await dbPool.execute('DELETE FROM lab_tests');
      console.log('✅ 清空lab_tests表');

      await dbPool.execute('DELETE FROM production_tracking');
      console.log('✅ 清空production_tracking表');

      await dbPool.execute('DELETE FROM batch_management');
      console.log('✅ 清空batch_management表');
    } catch (clearError) {
      console.warn('⚠️ 清空数据时出现警告:', clearError.message);
      // 继续执行，不中断同步过程
    }

    let syncResults = {
      inventory: 0,
      inspection: 0,
      production: 0,
      batches: 0,
      errors: []
    };

    // 同步库存数据
    if (inventory && inventory.length > 0) {
      try {
        for (const item of inventory) {
          await dbPool.execute(`
            INSERT INTO inventory (
              id, batch_code, material_code, material_name, material_type, supplier_name,
              quantity, status, inbound_time, storage_location, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            `INV-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            item.batch_number || `BATCH-${Date.now()}`,
            item.material_code || item.materialCode || '',
            item.material_name || item.materialName || '',
            item.material_type || item.materialType || '未知类型',
            item.supplier || item.supplier_name || '',
            item.quantity || 0,
            item.status || '正常',
            item.storage_date || new Date().toISOString().split('T')[0],
            item.warehouse || '默认仓库',
            item.remarks || ''
          ]);
        }
        syncResults.inventory = inventory.length;
        console.log(`✅ 库存数据同步完成: ${inventory.length} 条`);
      } catch (error) {
        console.error('❌ 库存数据同步失败:', error);
        syncResults.errors.push(`库存数据同步失败: ${error.message}`);
      }
    }

    // 同步检验数据
    if (inspection && inspection.length > 0) {
      try {
        for (const item of inspection) {
          await dbPool.execute(`
            INSERT INTO lab_tests (
              id, test_id, test_date, project_id, baseline_id, material_code,
              quantity, material_name, supplier_name, test_result, defect_desc, notes, batch_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            `TEST-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            item.test_id || `TEST-${Date.now()}`,
            item.test_date || new Date().toISOString().split('T')[0],
            item.project || item.projectId || item.project_id || '',
            item.baseline || item.baselineId || item.baseline_id || '',
            item.material_code || item.materialCode || '',
            item.quantity || 1,
            item.material_name || item.materialName || '',
            item.supplier || item.supplier_name || '',
            item.test_result || item.testResult || '合格',
            item.defect_description || item.defectDescription || item.defect_desc || '',
            item.remarks || item.notes || '',
            item.batch_code || `BATCH-${Date.now()}`
          ]);
        }
        syncResults.inspection = inspection.length;
        console.log(`✅ 检验数据同步完成: ${inspection.length} 条`);
      } catch (error) {
        console.error('❌ 检验数据同步失败:', error);
        syncResults.errors.push(`检验数据同步失败: ${error.message}`);
      }
    }

    // 同步生产数据
    if (production && production.length > 0) {
      try {
        for (const item of production) {
          await dbPool.execute(`
            INSERT INTO production_tracking (
              id, test_id, test_date, project, baseline, material_code,
              quantity, material_name, supplier_name, defect_desc, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            `PROD-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            item.test_id || `PROD-${Date.now()}`,
            item.inspection_date || new Date().toISOString().split('T')[0],
            item.project || '',
            item.baseline || '',
            item.material_code || item.materialCode || '',
            item.quantity || 1,
            item.material_name || item.materialName || '',
            item.supplier || item.supplier_name || '',
            item.defect_phenomenon || item.defectPhenomenon || '',
            item.remarks || item.notes || ''
          ]);
        }
        syncResults.production = production.length;
        console.log(`✅ 生产数据同步完成: ${production.length} 条`);
      } catch (error) {
        console.error('❌ 生产数据同步失败:', error);
        syncResults.errors.push(`生产数据同步失败: ${error.message}`);
      }
    }

    // 同步批次数据
    if (batches && batches.length > 0) {
      try {
        for (const item of batches) {
          await dbPool.execute(`
            INSERT INTO batch_tracking (
              batch_code, material_code, material_name, supplier_name,
              quantity, storage_date, production_exception, test_exception, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              material_name = VALUES(material_name),
              supplier_name = VALUES(supplier_name),
              quantity = VALUES(quantity),
              storage_date = VALUES(storage_date),
              production_exception = VALUES(production_exception),
              test_exception = VALUES(test_exception),
              notes = VALUES(notes)
          `, [
            item.batch_number, item.material_code, item.material_name,
            item.supplier, item.quantity, item.storage_date,
            item.production_exception, item.test_exception, item.remarks
          ]);
        }
        syncResults.batches = batches.length;
        console.log(`✅ 批次数据同步完成: ${batches.length} 条`);
      } catch (error) {
        console.error('❌ 批次数据同步失败:', error);
        syncResults.errors.push(`批次数据同步失败: ${error.message}`);
      }
    }

    res.json({
      success: syncResults.errors.length === 0,
      message: '数据同步完成',
      results: syncResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 数据同步API错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 数据同步API - 批量同步
app.post('/api/assistant/update-data-batch', async (req, res) => {
  try {
    if (!dbPool) {
      return res.status(500).json({
        success: false,
        error: '数据库未连接'
      });
    }

    const { type, data } = req.body;
    console.log(`📦 收到批量同步请求: ${type}, 数据量: ${data?.length || 0}`);

    if (!type || !data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: '无效的批量同步请求'
      });
    }

    let syncCount = 0;
    let errors = [];

    try {
      if (type === 'inventory') {
        for (const item of data) {
          await dbPool.execute(`
            INSERT INTO inventory (
              id, batch_code, material_code, material_name, material_type, supplier_name,
              quantity, status, inbound_time, storage_location, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              quantity = VALUES(quantity),
              status = VALUES(status),
              inbound_time = VALUES(inbound_time),
              storage_location = VALUES(storage_location),
              notes = VALUES(notes)
          `, [
            `INV-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            item.batch_number || `BATCH-${Date.now()}`,
            item.material_code || '',
            item.material_name || '',
            item.material_type || '未知类型',
            item.supplier || '',
            item.quantity || 0,
            item.status || '正常',
            item.storage_date || new Date().toISOString().split('T')[0],
            item.warehouse || '默认仓库',
            item.remarks || ''
          ]);
          syncCount++;
        }
      } else if (type === 'inspection') {
        for (const item of data) {
          await dbPool.execute(`
            INSERT INTO lab_tests (
              id, test_id, test_date, project_id, baseline_id, material_code,
              quantity, material_name, supplier_name, test_result, defect_desc, notes, batch_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              test_date = VALUES(test_date),
              project_id = VALUES(project_id),
              baseline_id = VALUES(baseline_id),
              quantity = VALUES(quantity),
              material_name = VALUES(material_name),
              supplier_name = VALUES(supplier_name),
              test_result = VALUES(test_result),
              defect_desc = VALUES(defect_desc),
              notes = VALUES(notes),
              batch_code = VALUES(batch_code)
          `, [
            `TEST-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            item.test_id || `TEST-${Date.now()}`,
            item.test_date || new Date().toISOString().split('T')[0],
            item.project || '',
            item.baseline || '',
            item.material_code || '',
            item.quantity || 1,
            item.material_name || '',
            item.supplier || '',
            item.test_result || '合格',
            item.defect_description || '',
            item.remarks || '',
            item.batch_code || `BATCH-${Date.now()}`
          ]);
          syncCount++;
        }
      } else if (type === 'production') {
        for (const item of data) {
          await dbPool.execute(`
            INSERT INTO production_tracking (
              id, test_id, test_date, project, baseline, material_code,
              quantity, material_name, supplier_name, defect_desc, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              test_date = VALUES(test_date),
              project = VALUES(project),
              baseline = VALUES(baseline),
              quantity = VALUES(quantity),
              material_name = VALUES(material_name),
              supplier_name = VALUES(supplier_name),
              defect_desc = VALUES(defect_desc),
              notes = VALUES(notes)
          `, [
            `PROD-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            item.test_id || `PROD-${Date.now()}`,
            item.inspection_date || new Date().toISOString().split('T')[0],
            item.project || '',
            item.baseline || '',
            item.material_code || '',
            item.quantity || 1,
            item.material_name || '',
            item.supplier || '',
            item.defect_phenomenon || '',
            item.remarks || ''
          ]);
          syncCount++;
        }
      }

      console.log(`✅ ${type} 批量同步完成: ${syncCount} 条`);

      res.json({
        success: true,
        message: `${type} 批量同步完成`,
        syncCount: syncCount,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ ${type} 批量同步失败:`, error);
      res.json({
        success: false,
        error: error.message,
        syncCount: syncCount
      });
    }

  } catch (error) {
    console.error('❌ 批量同步API错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 数据验证API
app.post('/api/assistant/verify-data', async (req, res) => {
  try {
    console.log('📋 收到数据验证请求');

    const verificationResults = {
      inventory: 0,
      inspection: 0,
      production: 0,
      batches: 0,
      total: 0
    };

    // 查询各表的数据量
    try {
      const [inventoryResult] = await dbPool.execute('SELECT COUNT(*) as count FROM inventory');
      verificationResults.inventory = inventoryResult[0].count;
    } catch (error) {
      console.error('查询inventory表失败:', error);
    }

    try {
      const [inspectionResult] = await dbPool.execute('SELECT COUNT(*) as count FROM lab_tests');
      verificationResults.inspection = inspectionResult[0].count;
    } catch (error) {
      console.error('查询lab_tests表失败:', error);
    }

    try {
      const [productionResult] = await dbPool.execute('SELECT COUNT(*) as count FROM production_tracking');
      verificationResults.production = productionResult[0].count;
    } catch (error) {
      console.error('查询production_tracking表失败:', error);
    }

    try {
      const [batchesResult] = await dbPool.execute('SELECT COUNT(*) as count FROM batch_management');
      verificationResults.batches = batchesResult[0].count;
    } catch (error) {
      console.error('查询batch_management表失败:', error);
    }

    verificationResults.total = verificationResults.inventory + verificationResults.inspection +
                               verificationResults.production + verificationResults.batches;

    console.log('✅ 数据验证完成:', verificationResults);

    // 检查是否有期望的数据量（从请求体中获取）
    const { expectedCounts } = req.body || {};
    let verified = true;
    let checks = {};

    if (expectedCounts) {
      checks = {
        inventory: {
          expected: expectedCounts.inventory || 0,
          actual: verificationResults.inventory,
          match: verificationResults.inventory >= (expectedCounts.inventory || 0)
        },
        inspection: {
          expected: expectedCounts.inspection || 0,
          actual: verificationResults.inspection,
          match: verificationResults.inspection >= (expectedCounts.inspection || 0)
        },
        production: {
          expected: expectedCounts.production || 0,
          actual: verificationResults.production,
          match: verificationResults.production >= (expectedCounts.production || 0)
        }
      };

      // 如果任何一个检查失败，则验证失败
      verified = Object.values(checks).every(check => check.match);
    }

    res.json({
      success: true,
      verified: verified,
      message: verified ? '数据验证通过' : '数据验证未通过',
      data: verificationResults,
      checks: checks,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 数据验证API错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 数据状态API
app.get('/api/data/status', async (req, res) => {
  try {
    console.log('📊 收到数据状态查询请求');

    // 查询各表的数据量
    const status = {
      inventory: 0,
      inspection: 0,
      production: 0,
      batches: 0,
      lastUpdate: new Date().toISOString()
    };

    try {
      const [inventoryResult] = await dbPool.execute('SELECT COUNT(*) as count FROM inventory');
      status.inventory = inventoryResult[0].count;
    } catch (error) {
      console.log('库存表查询失败:', error.message);
    }

    try {
      const [inspectionResult] = await dbPool.execute('SELECT COUNT(*) as count FROM inspection_records');
      status.inspection = inspectionResult[0].count;
    } catch (error) {
      console.log('检验表查询失败:', error.message);
    }

    try {
      const [productionResult] = await dbPool.execute('SELECT COUNT(*) as count FROM production_tracking');
      status.production = productionResult[0].count;
    } catch (error) {
      console.log('生产表查询失败:', error.message);
    }

    try {
      const [batchResult] = await dbPool.execute('SELECT COUNT(*) as count FROM batch_management');
      status.batches = batchResult[0].count;
    } catch (error) {
      console.log('批次表查询失败:', error.message);
    }

    status.total = status.inventory + status.inspection + status.production + status.batches;

    console.log('✅ 数据状态查询完成:', status);

    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 数据状态查询API错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 物料编码映射API
app.get('/api/material-code-mappings', async (req, res) => {
  try {
    console.log('📋 收到物料编码映射查询请求');

    // 返回示例物料编码映射数据
    const mappings = [
      {
        material_code: 'BAT-S1001',
        material_name: '锂电池',
        supplier_name: '深圳电池厂',
        code_prefix: 'BAT',
        category: '电池类',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        material_code: 'MEM-H2001',
        material_name: '内存条',
        supplier_name: '华为供应商',
        code_prefix: 'MEM',
        category: '存储类',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        material_code: 'SCR-S3001',
        material_name: '显示屏',
        supplier_name: '深圳显示厂',
        code_prefix: 'SCR',
        category: '光学类',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    console.log(`✅ 返回物料编码映射数据: ${mappings.length} 条`);

    res.json(mappings);

  } catch (error) {
    console.error('❌ 物料编码映射查询API错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/material-code-mappings', async (req, res) => {
  try {
    console.log('📝 收到物料编码映射保存请求:', req.body);

    // 模拟保存操作
    const mapping = {
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('✅ 物料编码映射保存成功');

    res.json({
      success: true,
      message: '物料编码映射保存成功',
      data: mapping
    });

  } catch (error) {
    console.error('❌ 物料编码映射保存API错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 数据生成API
app.post('/api/assistant/generate-real-data', async (req, res) => {
  try {
    console.log('🎲 收到数据生成请求');

    // 生成示例数据
    const generatedData = {
      inventory: [
        {
          material_code: `MAT-${Date.now()}-001`,
          material_name: '生成测试物料',
          material_type: '电子元件',
          supplier: '测试供应商',
          quantity: 100,
          status: '正常',
          storage_date: new Date().toISOString().split('T')[0],
          warehouse: '默认仓库',
          batch_number: `BATCH-${Date.now()}`,
          remarks: '自动生成的测试数据'
        }
      ],
      inspection: [
        {
          test_id: `TEST-${Date.now()}-001`,
          test_date: new Date().toISOString().split('T')[0],
          project: '测试项目',
          baseline: '测试基线',
          material_code: `MAT-${Date.now()}-001`,
          quantity: 1,
          material_name: '生成测试物料',
          supplier: '测试供应商',
          test_result: '合格',
          defect_description: '',
          remarks: '自动生成的检验数据'
        }
      ],
      production: [
        {
          test_id: `PROD-${Date.now()}-001`,
          inspection_date: new Date().toISOString().split('T')[0],
          project: '测试项目',
          baseline: '测试基线',
          material_code: `MAT-${Date.now()}-001`,
          quantity: 1,
          material_name: '生成测试物料',
          supplier: '测试供应商',
          defect_phenomenon: '',
          remarks: '自动生成的生产数据'
        }
      ]
    };

    console.log('✅ 数据生成完成');

    res.json({
      success: true,
      message: '数据生成完成',
      data: generatedData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 数据生成API错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 404错误处理中间件
app.use('*', (req, res) => {
  console.log(`❌ 404错误 - 未找到路由: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: `API端点不存在: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /health',
      'GET /api/db-test',
      'GET /api/rules',
      'GET /api/material-code-mappings',
      'POST /api/material-code-mappings',
      'POST /api/assistant/query',
      'POST /api/assistant/update-data',
      'POST /api/assistant/update-data-batch',
      'POST /api/assistant/verify-data',
      'POST /api/assistant/generate-real-data'
    ]
  });
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
  console.error('❌ 全局错误处理:', error);
  res.status(500).json({
    success: false,
    error: error.message || '服务器内部错误',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
async function startServer() {
  try {
    // 1. 初始化数据库
    await initializeDatabase();
    
    // 2. 启动Express服务器
    app.listen(PORT, () => {
      console.log(`✅ 完整后端服务已启动，端口: ${PORT}`);
      console.log(`🔗 健康检查: http://localhost:${PORT}/health`);
      console.log(`🔗 数据库测试: http://localhost:${PORT}/api/db-test`);
      console.log(`🔗 规则库测试: http://localhost:${PORT}/api/rules`);
    });
  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
}

startServer();
