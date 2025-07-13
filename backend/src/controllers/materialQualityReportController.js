/**
 * 物料质量报告控制器
 */
import materialQualityReportService from '../services/materialQualityReportServiceSimple.js';
import { logger } from '../utils/logger.js';

class MaterialQualityReportController {
  /**
   * 获取核心指标概览
   */
  async getCoreMetrics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const dateRange = startDate && endDate ? [new Date(startDate), new Date(endDate)] : null;
      
      const metrics = await materialQualityReportService.getCoreMetrics(dateRange);
      
      res.json({
        success: true,
        data: metrics,
        message: '核心指标获取成功'
      });
    } catch (error) {
      logger.error('获取核心指标失败:', error);
      res.status(500).json({
        success: false,
        message: '获取核心指标失败',
        error: error.message
      });
    }
  }

  /**
   * 获取质量趋势数据
   */
  async getQualityTrends(req, res) {
    try {
      const { period = '30d' } = req.query;
      
      const trends = await materialQualityReportService.getQualityTrends(period);
      
      res.json({
        success: true,
        data: trends,
        message: '质量趋势获取成功'
      });
    } catch (error) {
      logger.error('获取质量趋势失败:', error);
      res.status(500).json({
        success: false,
        message: '获取质量趋势失败',
        error: error.message
      });
    }
  }

  /**
   * 获取物料分类分析
   */
  async getCategoryAnalysis(req, res) {
    try {
      const analysis = await materialQualityReportService.getCategoryAnalysis();
      
      res.json({
        success: true,
        data: analysis,
        message: '分类分析获取成功'
      });
    } catch (error) {
      logger.error('获取分类分析失败:', error);
      res.status(500).json({
        success: false,
        message: '获取分类分析失败',
        error: error.message
      });
    }
  }

  /**
   * 获取供应商分析
   */
  async getSupplierAnalysis(req, res) {
    try {
      const analysis = await materialQualityReportService.getSupplierAnalysis();
      
      res.json({
        success: true,
        data: analysis,
        message: '供应商分析获取成功'
      });
    } catch (error) {
      logger.error('获取供应商分析失败:', error);
      res.status(500).json({
        success: false,
        message: '获取供应商分析失败',
        error: error.message
      });
    }
  }

  /**
   * 获取异常分析
   */
  async getExceptionAnalysis(req, res) {
    try {
      const analysis = await materialQualityReportService.getExceptionAnalysis();
      
      res.json({
        success: true,
        data: analysis,
        message: '异常分析获取成功'
      });
    } catch (error) {
      logger.error('获取异常分析失败:', error);
      res.status(500).json({
        success: false,
        message: '获取异常分析失败',
        error: error.message
      });
    }
  }

  /**
   * 获取详细数据表格
   */
  async getDetailedData(req, res) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        pageSize: parseInt(req.query.pageSize) || 20,
        search: req.query.search,
        category: req.query.category,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };
      
      const data = await materialQualityReportService.getDetailedData(filters);
      
      res.json({
        success: true,
        data: data,
        message: '详细数据获取成功'
      });
    } catch (error) {
      logger.error('获取详细数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取详细数据失败',
        error: error.message
      });
    }
  }

  /**
   * 获取完整报告数据
   */
  async getFullReport(req, res) {
    try {
      const { startDate, endDate, period = '30d' } = req.query;
      const dateRange = startDate && endDate ? [new Date(startDate), new Date(endDate)] : null;
      
      // 并行获取所有数据
      const [
        coreMetrics,
        qualityTrends,
        categoryAnalysis,
        supplierAnalysis,
        exceptionAnalysis
      ] = await Promise.all([
        materialQualityReportService.getCoreMetrics(dateRange),
        materialQualityReportService.getQualityTrends(period),
        materialQualityReportService.getCategoryAnalysis(),
        materialQualityReportService.getSupplierAnalysis(),
        materialQualityReportService.getExceptionAnalysis()
      ]);

      const reportData = {
        coreMetrics,
        qualityTrends,
        categoryAnalysis,
        supplierAnalysis,
        exceptionAnalysis,
        generatedAt: new Date().toISOString(),
        period: period,
        dateRange: dateRange
      };
      
      res.json({
        success: true,
        data: reportData,
        message: '完整报告获取成功'
      });
    } catch (error) {
      logger.error('获取完整报告失败:', error);
      res.status(500).json({
        success: false,
        message: '获取完整报告失败',
        error: error.message
      });
    }
  }

  /**
   * 导出报告
   */
  async exportReport(req, res) {
    try {
      const { format = 'json' } = req.query;
      
      // 获取完整报告数据
      const reportData = await this.getFullReportData(req.query);
      
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=material-quality-report-${Date.now()}.json`);
        res.json(reportData);
      } else {
        res.status(400).json({
          success: false,
          message: '不支持的导出格式'
        });
      }
    } catch (error) {
      logger.error('导出报告失败:', error);
      res.status(500).json({
        success: false,
        message: '导出报告失败',
        error: error.message
      });
    }
  }

  /**
   * 获取报告配置
   */
  async getReportConfig(req, res) {
    try {
      const config = {
        categories: [
          { label: '结构件类', value: 'structural' },
          { label: '光学类', value: 'optical' },
          { label: '充电类', value: 'charging' },
          { label: '声学类', value: 'acoustic' },
          { label: '包装类', value: 'packaging' }
        ],
        periods: [
          { label: '近7天', value: '7d' },
          { label: '近30天', value: '30d' },
          { label: '近90天', value: '90d' }
        ],
        riskLevels: [
          { label: '低风险', value: 'low', color: '#67c23a' },
          { label: '中风险', value: 'medium', color: '#e6a23c' },
          { label: '高风险', value: 'high', color: '#f56c6c' }
        ],
        chartColors: {
          primary: '#409eff',
          success: '#67c23a',
          warning: '#e6a23c',
          danger: '#f56c6c',
          info: '#909399'
        }
      };
      
      res.json({
        success: true,
        data: config,
        message: '报告配置获取成功'
      });
    } catch (error) {
      logger.error('获取报告配置失败:', error);
      res.status(500).json({
        success: false,
        message: '获取报告配置失败',
        error: error.message
      });
    }
  }

  // 私有方法
  async getFullReportData(params) {
    const { startDate, endDate, period = '30d' } = params;
    const dateRange = startDate && endDate ? [new Date(startDate), new Date(endDate)] : null;
    
    const [
      coreMetrics,
      qualityTrends,
      categoryAnalysis,
      supplierAnalysis,
      exceptionAnalysis
    ] = await Promise.all([
      materialQualityReportService.getCoreMetrics(dateRange),
      materialQualityReportService.getQualityTrends(period),
      materialQualityReportService.getCategoryAnalysis(),
      materialQualityReportService.getSupplierAnalysis(),
      materialQualityReportService.getExceptionAnalysis()
    ]);

    return {
      coreMetrics,
      qualityTrends,
      categoryAnalysis,
      supplierAnalysis,
      exceptionAnalysis,
      generatedAt: new Date().toISOString(),
      period: period,
      dateRange: dateRange
    };
  }
}

export default new MaterialQualityReportController();
