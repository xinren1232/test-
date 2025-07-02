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
  password: '123456',
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

    // 记录推送的数据量
    const { inventory, inspection, production, metadata } = req.body || {};
    const inventoryCount = inventory ? inventory.length : 0;
    const inspectionCount = inspection ? inspection.length : 0;
    const productionCount = production ? production.length : 0;

    console.log(`前端推送数据: 库存${inventoryCount}条, 检验${inspectionCount}条, 生产${productionCount}条`);
    console.log('元数据:', metadata);

    // 验证数据格式
    if (!Array.isArray(inventory)) {
      throw new Error('inventory 必须是数组');
    }
    if (!Array.isArray(inspection)) {
      throw new Error('inspection 必须是数组');
    }
    if (!Array.isArray(production)) {
      throw new Error('production 必须是数组');
    }

    let syncedCounts = { inventory: 0, inspection: 0, production: 0 };

    // 同步库存数据到数据库
    if (inventory && Array.isArray(inventory) && inventory.length > 0) {
      console.log('开始同步库存数据到数据库...');

      // 清空现有数据
      await dbConnection.query('DELETE FROM inventory');

      // 插入新数据
      for (const item of inventory) {
        // 处理日期格式 - 将 ISO 字符串转换为 MySQL 格式
        let inboundTime = item.inbound_time || item.inspectionDate || new Date();
        if (typeof inboundTime === 'string') {
          inboundTime = new Date(inboundTime).toISOString().slice(0, 19).replace('T', ' ');
        } else if (inboundTime instanceof Date) {
          inboundTime = inboundTime.toISOString().slice(0, 19).replace('T', ' ');
        }

        await dbConnection.query(`
          INSERT INTO inventory (
            id, batch_code, material_code, material_name, material_type,
            supplier_name, quantity, inbound_time, storage_location,
            status, risk_level, inspector, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          item.id || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          item.batch_code || item.batchNo || `BATCH-${Date.now()}`,
          item.material_code || item.materialCode || `MAT-${Date.now()}`,
          item.material_name || item.materialName || '未知物料',
          item.material_type || item.category || '通用',
          item.supplier_name || item.supplier || '未知供应商',
          item.quantity || 0,
          inboundTime,
          item.storage_location || item.factory || item.warehouse || '默认仓库',
          item.status || '正常',
          item.risk_level || 'low',
          item.inspector || '系统',
          item.notes || ''
        ]);
      }
      syncedCounts.inventory = inventory.length;
      console.log(`✅ 同步了 ${inventory.length} 条库存数据`);
    }

    // 同步测试数据到数据库
    if (inspection && Array.isArray(inspection) && inspection.length > 0) {
      console.log('开始同步测试数据到数据库...');

      await dbConnection.query('DELETE FROM lab_tests');

      for (const item of inspection) {
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
      syncedCounts.inspection = inspection.length;
      console.log(`✅ 同步了 ${inspection.length} 条测试数据`);
    }

    // 同步生产数据到数据库
    if (production && Array.isArray(production) && production.length > 0) {
      console.log('开始同步生产数据到数据库...');

      await dbConnection.query('DELETE FROM online_tracking');

      for (const item of production) {
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
      syncedCounts.production = production.length;
      console.log(`✅ 同步了 ${production.length} 条生产数据`);
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

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 数据库服务器启动成功，端口: ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🔄 数据同步: http://localhost:${PORT}/api/assistant/update-data`);
  console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
});
