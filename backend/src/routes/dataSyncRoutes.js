/**
 * 数据同步路由
 * 处理前端localStorage数据同步到后端
 */

import express from 'express';
import { logger } from '../utils/logger.js';
import { 
  syncFrontendData, 
  getMemoryData, 
  isDataSynced, 
  getDataStats,
  initializeDataSync 
} from '../services/DataSyncService.js';

const router = express.Router();

/**
 * POST /api/data-sync/sync
 * 同步前端数据到后端
 */
router.post('/sync', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        message: '缺少数据参数'
      });
    }
    
    logger.info('接收到前端数据同步请求');
    
    // 验证数据格式
    const expectedKeys = ['inventory', 'inspection', 'production'];
    const hasValidData = expectedKeys.some(key => 
      data[key] && Array.isArray(data[key]) && data[key].length > 0
    );
    
    if (!hasValidData) {
      return res.status(400).json({
        success: false,
        message: '数据格式无效，需要包含inventory、inspection或production数组'
      });
    }
    
    // 执行数据同步
    const result = await syncFrontendData(data);
    
    if (result.success) {
      logger.info('数据同步成功', result.data);
      res.json(result);
    } else {
      logger.error('数据同步失败', result.message);
      res.status(500).json(result);
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
 * GET /api/data-sync/status
 * 获取数据同步状态
 */
router.get('/status', async (req, res) => {
  try {
    const stats = getDataStats();
    const synced = isDataSynced();
    
    res.json({
      success: true,
      data: {
        synced,
        stats,
        message: synced ? '数据已同步' : '数据未同步'
      }
    });
    
  } catch (error) {
    logger.error('获取同步状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取同步状态失败: ' + error.message
    });
  }
});

/**
 * GET /api/data-sync/data
 * 获取内存中的数据
 */
router.get('/data', async (req, res) => {
  try {
    const memoryData = getMemoryData();
    
    res.json({
      success: true,
      data: memoryData
    });
    
  } catch (error) {
    logger.error('获取内存数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取内存数据失败: ' + error.message
    });
  }
});

/**
 * POST /api/data-sync/init
 * 初始化数据同步服务
 */
router.post('/init', async (req, res) => {
  try {
    await initializeDataSync();
    
    res.json({
      success: true,
      message: '数据同步服务初始化完成'
    });
    
  } catch (error) {
    logger.error('初始化数据同步服务失败:', error);
    res.status(500).json({
      success: false,
      message: '初始化失败: ' + error.message
    });
  }
});

/**
 * DELETE /api/data-sync/clear
 * 清空内存数据
 */
router.delete('/clear', async (req, res) => {
  try {
    // 清空内存数据的逻辑
    const result = await syncFrontendData({
      inventory: [],
      inspection: [],
      production: []
    });
    
    res.json({
      success: true,
      message: '内存数据已清空'
    });
    
  } catch (error) {
    logger.error('清空内存数据失败:', error);
    res.status(500).json({
      success: false,
      message: '清空数据失败: ' + error.message
    });
  }
});

export default router;
