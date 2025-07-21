/**
 * 物料质量报告路由
 */
import express from 'express';
import materialQualityReportController from '../controllers/materialQualityReportController.js';

const router = express.Router();

/**
 * @swagger
 * /api/material-quality-report/core-metrics:
 *   get:
 *     summary: 获取核心指标概览
 *     tags: [物料质量报告]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *     responses:
 *       200:
 *         description: 成功获取核心指标
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 */
router.get('/core-metrics', materialQualityReportController.getCoreMetrics);

/**
 * @swagger
 * /api/material-quality-report/quality-trends:
 *   get:
 *     summary: 获取质量趋势数据
 *     tags: [物料质量报告]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *         description: 时间周期
 *     responses:
 *       200:
 *         description: 成功获取质量趋势
 */
router.get('/quality-trends', materialQualityReportController.getQualityTrends);

/**
 * @swagger
 * /api/material-quality-report/category-analysis:
 *   get:
 *     summary: 获取物料分类分析
 *     tags: [物料质量报告]
 *     responses:
 *       200:
 *         description: 成功获取分类分析
 */
router.get('/category-analysis', materialQualityReportController.getCategoryAnalysis);

/**
 * @swagger
 * /api/material-quality-report/supplier-analysis:
 *   get:
 *     summary: 获取供应商分析
 *     tags: [物料质量报告]
 *     responses:
 *       200:
 *         description: 成功获取供应商分析
 */
router.get('/supplier-analysis', materialQualityReportController.getSupplierAnalysis);

/**
 * @swagger
 * /api/material-quality-report/exception-analysis:
 *   get:
 *     summary: 获取异常分析
 *     tags: [物料质量报告]
 *     responses:
 *       200:
 *         description: 成功获取异常分析
 */
router.get('/exception-analysis', materialQualityReportController.getExceptionAnalysis);

/**
 * @swagger
 * /api/material-quality-report/detailed-data:
 *   get:
 *     summary: 获取详细数据表格
 *     tags: [物料质量报告]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: 每页大小
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 物料分类
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: 排序方向
 *     responses:
 *       200:
 *         description: 成功获取详细数据
 */
router.get('/detailed-data', materialQualityReportController.getDetailedData);

/**
 * @swagger
 * /api/material-quality-report/full-report:
 *   get:
 *     summary: 获取完整报告数据
 *     tags: [物料质量报告]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *         description: 时间周期
 *     responses:
 *       200:
 *         description: 成功获取完整报告
 */
router.get('/full-report', materialQualityReportController.getFullReport);

/**
 * @swagger
 * /api/material-quality-report/export:
 *   get:
 *     summary: 导出报告
 *     tags: [物料质量报告]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, excel, pdf]
 *         description: 导出格式
 *     responses:
 *       200:
 *         description: 成功导出报告
 */
router.get('/export', materialQualityReportController.exportReport);

/**
 * @swagger
 * /api/material-quality-report/config:
 *   get:
 *     summary: 获取报告配置
 *     tags: [物料质量报告]
 *     responses:
 *       200:
 *         description: 成功获取报告配置
 */
router.get('/config', materialQualityReportController.getReportConfig);

export default router;
