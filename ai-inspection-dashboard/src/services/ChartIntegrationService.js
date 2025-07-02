/**
 * 图表集成服务
 * 复用现有页面的图表组件和配置
 */

// 导入现有的图表工具
import * as echarts from 'echarts/core';
import { 
  LineChart, BarChart, PieChart, RadarChart, ScatterChart 
} from 'echarts/charts';
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  DatasetComponent, TransformComponent, RadarComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

// 注册echarts组件
echarts.use([
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  DatasetComponent, TransformComponent, LineChart, BarChart, PieChart,
  RadarChart, ScatterChart, RadarComponent,
  LabelLayout, UniversalTransition, CanvasRenderer
]);

class ChartIntegrationService {
  
  /**
   * 生成库存分布饼图 (复用库存页面的图表配置)
   */
  generateInventoryDistributionChart(data) {
    // 处理数据
    const statusData = this.processInventoryStatusData(data);
    
    return {
      chartType: 'pie',
      chartTitle: '库存状态分布',
      chartDescription: '显示当前库存各状态的分布情况',
      chartData: {
        title: {
          text: '库存状态分布',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: statusData.map(item => item.name)
        },
        series: [
          {
            name: '库存状态',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {c} ({d}%)'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            data: statusData
          }
        ]
      }
    };
  }

  /**
   * 生成质量趋势折线图 (复用库存页面的趋势图配置)
   */
  generateQualityTrendChart(data) {
    const trendData = this.processQualityTrendData(data);
    
    return {
      chartType: 'line',
      chartTitle: '质量趋势分析',
      chartDescription: '显示最近6个月的质量变化趋势',
      chartData: {
        title: {
          text: '质量趋势分析',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['合格率', '检测数量'],
          bottom: 10
        },
        xAxis: {
          type: 'category',
          data: trendData.categories,
          axisLabel: {
            rotate: 0
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '合格率(%)',
            position: 'left',
            axisLabel: {
              formatter: '{value}%'
            }
          },
          {
            type: 'value',
            name: '检测数量',
            position: 'right'
          }
        ],
        series: trendData.series
      }
    };
  }

  /**
   * 生成供应商对比雷达图
   */
  generateSupplierComparisonChart(data) {
    const radarData = this.processSupplierComparisonData(data);
    
    return {
      chartType: 'radar',
      chartTitle: '供应商综合对比',
      chartDescription: '从质量、交付、成本等维度对比供应商表现',
      chartData: {
        title: {
          text: '供应商综合对比',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          data: radarData.series.map(s => s.name),
          bottom: 10
        },
        radar: {
          indicator: radarData.indicators,
          radius: '70%'
        },
        series: [
          {
            type: 'radar',
            data: radarData.series
          }
        ]
      }
    };
  }

  /**
   * 生成工厂对比柱状图 (复用现有的柱状图配置)
   */
  generateFactoryComparisonChart(data) {
    const factoryData = this.processFactoryComparisonData(data);
    
    return {
      chartType: 'bar',
      chartTitle: '工厂不合格率对比',
      chartDescription: '对比各工厂的不合格率情况',
      chartData: {
        title: {
          text: '工厂不合格率对比',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: factoryData.categories,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: '不合格率(%)',
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [
          {
            name: '不合格率',
            type: 'bar',
            data: factoryData.data,
            itemStyle: {
              color: function(params) {
                // 根据数值设置颜色
                const value = params.value;
                if (value > 5) return '#f56c6c';
                if (value > 3) return '#e6a23c';
                return '#67c23a';
              }
            }
          }
        ]
      }
    };
  }

  /**
   * 处理库存状态数据
   */
  processInventoryStatusData(data) {
    const statusCount = {
      '正常': 0,
      '风险': 0,
      '冻结': 0
    };

    if (data && data.inventory) {
      data.inventory.forEach(item => {
        if (statusCount.hasOwnProperty(item.status)) {
          statusCount[item.status]++;
        }
      });
    }

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
      itemStyle: {
        color: status === '正常' ? '#67c23a' : 
               status === '风险' ? '#e6a23c' : '#f56c6c'
      }
    }));
  }

  /**
   * 处理质量趋势数据
   */
  processQualityTrendData(data) {
    // 生成最近6个月的模拟数据
    const months = [];
    const passRates = [];
    const testCounts = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toLocaleDateString('zh-CN', { month: 'short' }));
      
      // 模拟数据，实际应该从真实数据计算
      passRates.push(95.2 + Math.random() * 3);
      testCounts.push(150 + Math.floor(Math.random() * 50));
    }

    return {
      categories: months,
      series: [
        {
          name: '合格率',
          type: 'line',
          yAxisIndex: 0,
          data: passRates,
          smooth: true,
          itemStyle: { color: '#409eff' }
        },
        {
          name: '检测数量',
          type: 'bar',
          yAxisIndex: 1,
          data: testCounts,
          itemStyle: { color: '#67c23a' }
        }
      ]
    };
  }

  /**
   * 处理供应商对比数据
   */
  processSupplierComparisonData(data) {
    const suppliers = ['BOE', '聚龙', '宁德时代'];
    const indicators = [
      { name: '质量评分', max: 100 },
      { name: '交付及时率', max: 100 },
      { name: '成本控制', max: 100 },
      { name: '服务质量', max: 100 },
      { name: '创新能力', max: 100 }
    ];

    const series = suppliers.map(supplier => ({
      name: supplier,
      value: [
        85 + Math.random() * 10,  // 质量评分
        80 + Math.random() * 15,  // 交付及时率
        75 + Math.random() * 20,  // 成本控制
        82 + Math.random() * 12,  // 服务质量
        70 + Math.random() * 25   // 创新能力
      ]
    }));

    return { indicators, series };
  }

  /**
   * 处理工厂对比数据
   */
  processFactoryComparisonData(data) {
    const factories = ['深圳工厂', '上海工厂', '北京工厂', '广州工厂'];
    const defectRates = factories.map(() => Math.random() * 6);

    return {
      categories: factories,
      data: defectRates
    };
  }

  /**
   * 根据查询类型生成对应图表
   */
  generateChartByQuery(query, data) {
    if (query.includes('趋势') || query.includes('变化')) {
      return this.generateQualityTrendChart(data);
    } else if (query.includes('分布') || query.includes('状态')) {
      return this.generateInventoryDistributionChart(data);
    } else if (query.includes('供应商') && query.includes('对比')) {
      return this.generateSupplierComparisonChart(data);
    } else if (query.includes('工厂') && query.includes('对比')) {
      return this.generateFactoryComparisonChart(data);
    } else {
      // 默认返回库存分布图
      return this.generateInventoryDistributionChart(data);
    }
  }
}

export default new ChartIntegrationService();
