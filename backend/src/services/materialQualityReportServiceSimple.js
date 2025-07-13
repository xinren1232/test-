/**
 * 物料质量报告服务 - 简化版
 * 提供模拟数据用于演示
 */
import { logger } from '../utils/logger.js';

class MaterialQualityReportService {
  /**
   * 获取核心指标概览
   */
  async getCoreMetrics(dateRange = null) {
    try {
      return {
        totalMaterials: {
          value: 132,
          label: '物料总数',
          trend: { type: 'up', text: '+5.2%', icon: 'ArrowUp' },
          color: '#409eff',
          icon: 'Box'
        },
        qualityRate: {
          value: '95.8%',
          label: '整体合格率',
          trend: { type: 'up', text: '+2.1%', icon: 'ArrowUp' },
          color: '#67c23a',
          icon: 'CircleCheck'
        },
        riskMaterials: {
          value: 8,
          label: '风险物料',
          trend: { type: 'down', text: '-8.3%', icon: 'ArrowDown' },
          color: '#f56c6c',
          icon: 'Warning'
        },
        activeSuppliers: {
          value: 13,
          label: '活跃供应商',
          trend: { type: 'stable', text: '持平', icon: 'Minus' },
          color: '#e6a23c',
          icon: 'OfficeBuilding'
        },
        testVolume: {
          value: 1056,
          label: '测试总量',
          trend: { type: 'up', text: '+12.5%', icon: 'ArrowUp' },
          color: '#909399',
          icon: 'DataAnalysis'
        },
        onlineRate: {
          value: '97.2%',
          label: '上线成功率',
          trend: { type: 'up', text: '+3.7%', icon: 'ArrowUp' },
          color: '#67c23a',
          icon: 'TrendCharts'
        }
      };
    } catch (error) {
      logger.error('获取核心指标失败:', error);
      throw error;
    }
  }

  /**
   * 获取质量趋势数据
   */
  async getQualityTrends(period = '30d') {
    try {
      const days = this.parsePeriod(period);
      const dateRange = this.getDateRange(days);
      
      return {
        qualityTrend: {
          dates: this.generateDateArray(dateRange[0], days),
          qualityRate: this.generateRandomData(days, 92, 98),
          defectRate: this.generateRandomData(days, 1, 5),
          riskRate: this.generateRandomData(days, 2, 8)
        },
        quantityTrend: {
          dates: this.generateDateArray(dateRange[0], days),
          inventory: this.generateRandomData(days, 800, 1200),
          testing: this.generateRandomData(days, 200, 400),
          online: this.generateRandomData(days, 150, 350)
        },
        period: period,
        dateRange: dateRange
      };
    } catch (error) {
      logger.error('获取质量趋势失败:', error);
      throw error;
    }
  }

  /**
   * 获取物料分类分析
   */
  async getCategoryAnalysis() {
    try {
      const categoryData = [
        {
          name: '结构件类',
          count: 45,
          percentage: 34,
          qualityRate: 95.2,
          riskCount: 3,
          color: '#409eff',
          totalQuantity: 15420,
          testCount: 360
        },
        {
          name: '光学类',
          count: 24,
          percentage: 18,
          qualityRate: 97.8,
          riskCount: 1,
          color: '#67c23a',
          totalQuantity: 8960,
          testCount: 192
        },
        {
          name: '充电类',
          count: 18,
          percentage: 14,
          qualityRate: 93.5,
          riskCount: 2,
          color: '#e6a23c',
          totalQuantity: 6780,
          testCount: 144
        },
        {
          name: '声学类',
          count: 8,
          percentage: 6,
          qualityRate: 96.1,
          riskCount: 1,
          color: '#f56c6c',
          totalQuantity: 3240,
          testCount: 64
        },
        {
          name: '包装类',
          count: 5,
          percentage: 4,
          qualityRate: 94.7,
          riskCount: 1,
          color: '#909399',
          totalQuantity: 2100,
          testCount: 40
        }
      ];

      const distributionData = categoryData.map(item => ({
        name: item.name,
        value: item.count,
        itemStyle: { color: item.color }
      }));

      const qualityComparisonData = {
        categories: categoryData.map(item => item.name),
        series: [
          {
            name: '合格率',
            data: categoryData.map(item => item.qualityRate),
            type: 'bar',
            itemStyle: { color: '#67c23a' }
          },
          {
            name: '风险率',
            data: categoryData.map(item => (100 - item.qualityRate).toFixed(1)),
            type: 'bar',
            itemStyle: { color: '#f56c6c' }
          }
        ]
      };

      return {
        categoryStats: categoryData,
        distributionChart: distributionData,
        qualityComparisonChart: qualityComparisonData
      };
    } catch (error) {
      logger.error('获取分类分析失败:', error);
      throw error;
    }
  }

  /**
   * 获取供应商分析
   */
  async getSupplierAnalysis() {
    try {
      const supplierData = [
        { name: '聚龙', qualityRate: 95.2, materialCount: 15, totalQuantity: 4500, riskLevel: '低', onTimeRate: 92, defectRate: 2.1, score: 95 },
        { name: 'BOE', qualityRate: 92.8, materialCount: 12, totalQuantity: 3800, riskLevel: '低', onTimeRate: 88, defectRate: 3.2, score: 92 },
        { name: '天马', qualityRate: 89.5, materialCount: 10, totalQuantity: 3200, riskLevel: '中', onTimeRate: 85, defectRate: 4.1, score: 89 },
        { name: '华星', qualityRate: 87.2, materialCount: 8, totalQuantity: 2900, riskLevel: '中', onTimeRate: 90, defectRate: 3.8, score: 87 },
        { name: '歌尔', qualityRate: 85.6, materialCount: 6, totalQuantity: 2400, riskLevel: '中', onTimeRate: 82, defectRate: 5.2, score: 85 }
      ];

      const rankingData = {
        categories: supplierData.map(item => item.name),
        series: [{
          name: '综合评分',
          data: supplierData.map(item => item.score),
          type: 'bar',
          itemStyle: { color: '#409eff' }
        }]
      };

      const radarData = {
        indicator: [
          { name: '质量率', max: 100 },
          { name: '准时率', max: 100 },
          { name: '响应速度', max: 100 },
          { name: '成本控制', max: 100 },
          { name: '创新能力', max: 100 },
          { name: '服务质量', max: 100 }
        ],
        series: supplierData.slice(0, 3).map(supplier => ({
          name: supplier.name,
          value: [
            supplier.qualityRate,
            supplier.onTimeRate,
            Math.random() * 30 + 70,
            Math.random() * 20 + 75,
            Math.random() * 25 + 70,
            Math.random() * 20 + 80
          ]
        }))
      };

      return {
        supplierStats: supplierData,
        rankingChart: rankingData,
        radarChart: radarData
      };
    } catch (error) {
      logger.error('获取供应商分析失败:', error);
      throw error;
    }
  }

  /**
   * 获取异常分析
   */
  async getExceptionAnalysis() {
    try {
      const alerts = [
        {
          id: 1,
          level: 'high',
          icon: 'Warning',
          title: '供应商BOE质量异常',
          description: 'LCD显示屏批次B2024001检测不合格率超过5%',
          time: '2小时前'
        },
        {
          id: 2,
          level: 'medium',
          icon: 'InfoFilled',
          title: '库存风险预警',
          description: '结构件类物料库存量低于安全线',
          time: '4小时前'
        },
        {
          id: 3,
          level: 'low',
          icon: 'CircleCheck',
          title: '测试完成通知',
          description: '聚龙供应商本周测试任务已完成',
          time: '6小时前'
        }
      ];

      const trendData = {
        dates: this.generateDateArray(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), 14),
        series: [
          {
            name: '高风险',
            data: this.generateRandomData(14, 2, 8),
            color: '#f56c6c'
          },
          {
            name: '中风险',
            data: this.generateRandomData(14, 5, 15),
            color: '#e6a23c'
          },
          {
            name: '低风险',
            data: this.generateRandomData(14, 1, 5),
            color: '#67c23a'
          }
        ]
      };

      return {
        alerts: alerts,
        trendChart: trendData
      };
    } catch (error) {
      logger.error('获取异常分析失败:', error);
      throw error;
    }
  }

  /**
   * 获取详细数据表格
   */
  async getDetailedData(filters = {}) {
    try {
      const { page = 1, pageSize = 20 } = filters;
      
      // 模拟数据
      const mockData = Array.from({ length: 132 }, (_, i) => ({
        materialCode: `MAT-${String(i + 1).padStart(4, '0')}`,
        materialName: ['中框', 'LCD显示屏', '电池', '喇叭', '包装盒'][i % 5],
        category: ['结构件类', '光学类', '充电类', '声学类', '包装类'][i % 5],
        supplier: ['聚龙', 'BOE', '天马', '华星', '歌尔'][i % 5],
        qualityRate: Math.floor(Math.random() * 20) + 80,
        totalQuantity: Math.floor(Math.random() * 1000) + 100,
        riskLevel: ['低', '中', '高'][Math.floor(Math.random() * 3)],
        lastTestDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: ['正常', '风险', '冻结'][Math.floor(Math.random() * 3)]
      }));

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = mockData.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total: mockData.length,
        page: page,
        pageSize: pageSize
      };
    } catch (error) {
      logger.error('获取详细数据失败:', error);
      throw error;
    }
  }

  // 辅助方法
  parsePeriod(period) {
    const periodMap = { '7d': 7, '30d': 30, '90d': 90 };
    return periodMap[period] || 30;
  }

  getDateRange(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return [startDate, endDate];
  }

  generateDateArray(startDate, days) {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }));
    }
    return dates;
  }

  generateRandomData(length, min, max) {
    return Array.from({ length }, () => 
      Math.floor(Math.random() * (max - min + 1)) + min
    );
  }
}

export default new MaterialQualityReportService();
