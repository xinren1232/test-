/**
 * 数据同步路由
 * 处理前端数据同步相关的API请求
 */
import express from 'express';
import frontendDataService from '../services/frontendDataService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/data/sync
 * 同步前端数据到后端数据库
 */
router.post('/sync', async (req, res) => {
  try {
    logger.info('收到数据同步请求');
    
    const result = await frontendDataService.performFullSync();
    
    if (result.success) {
      logger.info('数据同步成功', result.data);
      res.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      logger.error('数据同步失败', result.message);
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    logger.error('数据同步API错误:', error);
    res.status(500).json({
      success: false,
      message: '数据同步失败: ' + error.message
    });
  }
});

/**
 * POST /api/data/sync-frontend
 * 接收前端发送的localStorage数据并同步
 */
router.post('/sync-frontend', async (req, res) => {
  try {
    const { inventoryData, labData, productionData } = req.body;
    
    if (!inventoryData && !labData && !productionData) {
      return res.status(400).json({
        success: false,
        message: '请提供要同步的数据'
      });
    }
    
    logger.info('收到前端数据同步请求', {
      inventoryCount: inventoryData?.length || 0,
      labCount: labData?.length || 0,
      productionCount: productionData?.length || 0
    });
    
    // 构造数据格式
    const frontendData = {
      inventory: inventoryData || [],
      lab: labData || [],
      production: productionData || []
    };
    
    // 同步到数据库
    await frontendDataService.syncToDatabase(frontendData);
    
    // 更新NLP规则
    await frontendDataService.updateNLPRules();
    
    res.json({
      success: true,
      message: '前端数据同步成功',
      data: {
        inventoryCount: frontendData.inventory.length,
        labCount: frontendData.lab.length,
        productionCount: frontendData.production.length
      }
    });
    
  } catch (error) {
    logger.error('前端数据同步失败:', error);
    res.status(500).json({
      success: false,
      message: '前端数据同步失败: ' + error.message
    });
  }
});

/**
 * GET /api/data/status
 * 获取数据同步状态
 */
router.get('/status', async (req, res) => {
  try {
    const connection = await frontendDataService.connect();
    
    // 获取各表的数据统计
    const [inventoryCount] = await connection.query('SELECT COUNT(*) as count FROM inventory');
    const [labCount] = await connection.query('SELECT COUNT(*) as count FROM lab_tests');
    const [onlineCount] = await connection.query('SELECT COUNT(*) as count FROM online_tracking');
    const [rulesCount] = await connection.query('SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = "active"');
    
    await frontendDataService.disconnect();
    
    res.json({
      success: true,
      data: {
        inventory: inventoryCount[0].count,
        lab: labCount[0].count,
        online: onlineCount[0].count,
        nlpRules: rulesCount[0].count,
        lastSync: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('获取数据状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据状态失败: ' + error.message
    });
  }
});

export default router;
