import { Router } from 'express';
import { getMaterialCodeMappings, updateMaterialCodeMappings } from '../services/materialCodeMapService.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * @swagger
 * /material-code-mappings:
 *   get:
 *     summary: 获取物料代码映射
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: 成功获取物料代码映射
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/', async (req, res, next) => {
  try {
    const mappings = await getMaterialCodeMappings();
    res.json(mappings);
  } catch (error) {
    logger.error('获取物料代码映射失败:', error);
    next(error);
  }
});

/**
 * @swagger
 * /material-code-mappings:
 *   post:
 *     summary: 更新物料代码映射
 *     tags: [Data]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 成功更新物料代码映射
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/', async (req, res, next) => {
  try {
    const newMappings = req.body;
    await updateMaterialCodeMappings(newMappings);
    res.json({ message: '物料代码映射更新成功' });
  } catch (error) {
    logger.error('更新物料代码映射失败:', error);
    next(error);
  }
});

export { router as default }; 