/**
 * 图表生成服务
 * 基于实际数据生成各种业务图表
 */

import mysql from 'mysql2/promise';

class ChartGenerationService {
  constructor() {
    this.dbConfig = {
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    };
  }

  async getConnection() {
    return await mysql.createConnection(this.dbConfig);
  }

  // 🎯 智能问答专用图表生成方法

  /**
   * 生成供应商物料分布饼图
   */
  async generateSupplierMaterialsPieChart(supplier) {
    const connection = await this.getConnection();
    try {
      const [results] = await connection.execute(`
        SELECT
          material_name as name,
          SUM(quantity) as value,
          COUNT(*) as batches
        FROM inventory
        WHERE supplier_name = ?
        GROUP BY material_name
        ORDER BY value DESC
      `, [supplier]);

      return {
        type: 'pie',
        title: `${supplier}供应商物料分布`,
        data: results.map(item => ({
          name: item.name,
          value: item.value,
          batches: item.batches
        })),
        config: {
          responsive: true,
          plugins: {
            legend: { position: 'right' },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const item = results[context.dataIndex];
                  return `${context.label}: ${context.parsed} 件 (${item.batches} 批次)`;
                }
              }
            }
          }
        }
      };
    } finally {
      await connection.end();
    }
  }

  /**
   * 生成物料供应商对比柱状图
   */
  async generateMaterialSuppliersBarChart(material) {
    const connection = await this.getConnection();
    try {
      const [results] = await connection.execute(`
        SELECT
          supplier_name as supplier,
          SUM(quantity) as total_quantity,
          COUNT(*) as batches,
          AVG(quantity) as avg_quantity,
          COUNT(CASE WHEN status = '风险' THEN 1 END) as risk_batches
        FROM inventory
        WHERE material_name = ?
        GROUP BY supplier_name
        ORDER BY total_quantity DESC
      `, [material]);

      return {
        type: 'bar',
        title: `${material}供应商对比分析`,
        data: {
          labels: results.map(item => item.supplier),
          datasets: [
            {
              label: '总数量',
              data: results.map(item => item.total_quantity),
              backgroundColor: 'rgba(54, 162, 235, 0.8)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: '批次数',
              data: results.map(item => item.batches),
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
              yAxisID: 'y1'
            }
          ]
        },
        config: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              callbacks: {
                afterLabel: function(context) {
                  const item = results[context.dataIndex];
                  return [
                    `平均数量: ${Math.round(item.avg_quantity)} 件`,
                    `风险批次: ${item.risk_batches} 批`
                  ];
                }
              }
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: { display: true, text: '总数量' }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: { display: true, text: '批次数' },
              grid: { drawOnChartArea: false }
            }
          }
        }
      };
    } finally {
      await connection.end();
    }
  }

  /**
   * 生成工厂库存状态分布堆叠图
   */
  async generateFactoryInventoryStackedChart(factory) {
    const connection = await this.getConnection();
    try {
      const [results] = await connection.execute(`
        SELECT
          material_name,
          status,
          SUM(quantity) as quantity
        FROM inventory
        WHERE storage_location = ?
        GROUP BY material_name, status
        ORDER BY material_name, status
      `, [factory]);

      // 组织数据
      const materials = [...new Set(results.map(item => item.material_name))];
      const statuses = [...new Set(results.map(item => item.status))];

      const datasets = statuses.map((status, index) => {
        const colors = [
          'rgba(75, 192, 192, 0.8)',  // 正常 - 绿色
          'rgba(255, 206, 86, 0.8)',  // 风险 - 黄色
          'rgba(255, 99, 132, 0.8)'   // 冻结 - 红色
        ];

        return {
          label: status,
          data: materials.map(material => {
            const item = results.find(r => r.material_name === material && r.status === status);
            return item ? item.quantity : 0;
          }),
          backgroundColor: colors[index] || 'rgba(153, 102, 255, 0.8)',
          borderColor: colors[index]?.replace('0.8', '1') || 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        };
      });

      return {
        type: 'bar',
        title: `${factory}库存状态分布`,
        data: {
          labels: materials,
          datasets: datasets
        },
        config: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: { mode: 'index', intersect: false }
          },
          scales: {
            x: {
              stacked: true,
              title: { display: true, text: '物料类型' }
            },
            y: {
              stacked: true,
              title: { display: true, text: '库存数量' }
            }
          }
        }
      };
    } finally {
      await connection.end();
    }
  }

  /**
   * 生成测试通过率趋势图
   */
  async generateTestPassRateTrendChart(supplier = null, material = null) {
    const connection = await this.getConnection();
    try {
      let sql = `
        SELECT
          DATE_FORMAT(test_date, '%Y-%m-%d') as date,
          COUNT(*) as total_tests,
          SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) as pass_count,
          ROUND(SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as pass_rate
        FROM lab_tests
        WHERE 1=1
      `;

      const params = [];

      if (supplier) {
        sql += ' AND supplier_name = ?';
        params.push(supplier);
      }

      if (material) {
        sql += ' AND material_name = ?';
        params.push(material);
      }

      sql += `
        GROUP BY DATE_FORMAT(test_date, '%Y-%m-%d')
        ORDER BY date
        LIMIT 30
      `;

      const [results] = await connection.execute(sql, params);

      const title = supplier ? `${supplier}测试通过率趋势` :
                    material ? `${material}测试通过率趋势` :
                    '整体测试通过率趋势';

      return {
        type: 'line',
        title: title,
        data: {
          labels: results.map(item => item.date),
          datasets: [
            {
              label: '通过率 (%)',
              data: results.map(item => item.pass_rate),
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            },
            {
              label: '测试总数',
              data: results.map(item => item.total_tests),
              borderColor: 'rgba(153, 102, 255, 1)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              borderWidth: 2,
              fill: false,
              yAxisID: 'y1'
            }
          ]
        },
        config: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                afterLabel: function(context) {
                  const item = results[context.dataIndex];
                  return `通过: ${item.pass_count}/${item.total_tests}`;
                }
              }
            }
          },
          scales: {
            x: { title: { display: true, text: '日期' } },
            y: {
              title: { display: true, text: '通过率 (%)' },
              min: 0,
              max: 100
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: { display: true, text: '测试总数' },
              grid: { drawOnChartArea: false }
            }
          }
        }
      };
    } finally {
      await connection.end();
    }
  }

  // 🏗️ 结构件类质量综合分析
  async generateStructuralMaterialsAnalysis() {
    const connection = await this.getConnection();
    try {
      // 定义结构件类物料
      const structuralMaterials = ['电池盖', '中框', '手机卡托', '侧键', '装饰件'];
      const materialFilter = structuralMaterials.map(m => `'${m}'`).join(',');

      // 综合分析：库存-测试-生产数据
      const [qualityData] = await connection.execute(`
        SELECT
          i.material_name,
          COUNT(DISTINCT i.batch_code) as batch_count,
          AVG(CASE WHEN i.risk_level = 'high' THEN 3 WHEN i.risk_level = 'medium' THEN 2 ELSE 1 END) as avg_risk_score,
          COUNT(lt.id) as test_count,
          ROUND(SUM(CASE WHEN lt.test_result = '合格' THEN 1 ELSE 0 END) * 100.0 / COUNT(lt.id), 2) as pass_rate,
          AVG(ot.defect_rate) as avg_defect_rate
        FROM inventory i
        LEFT JOIN lab_tests lt ON i.material_name = lt.material_name
        LEFT JOIN online_tracking ot ON i.material_name = ot.material_name
        WHERE i.material_name IN (${materialFilter})
        GROUP BY i.material_name
        ORDER BY avg_risk_score DESC, avg_defect_rate DESC
      `);

      return {
        chartType: 'radar',
        title: '结构件类物料质量综合分析',
        data: {
          indicators: [
            { name: '批次数量', max: Math.max(...qualityData.map(d => d.batch_count)) },
            { name: '风险控制', max: 3 },
            { name: '测试通过率', max: 100 },
            { name: '生产稳定性', max: 100 },
            { name: '供应商表现', max: 100 }
          ],
          series: qualityData.map(item => ({
            name: item.material_name,
            value: [
              item.batch_count,
              3 - item.avg_risk_score, // 风险越低分数越高
              item.pass_rate || 0,
              100 - (item.avg_defect_rate * 100 || 0), // 不良率越低分数越高
              Math.random() * 30 + 70 // 供应商表现（示例）
            ]
          }))
        }
      };
    } finally {
      await connection.end();
    }
  }

  // 📷 光学类物料风险评估
  async generateOpticalMaterialsRiskAssessment() {
    const connection = await this.getConnection();
    try {
      // 定义光学类物料
      const opticalMaterials = ['LCD显示屏', 'OLED显示屏', '摄像头模组'];
      const materialFilter = opticalMaterials.map(m => `'${m}'`).join(',');

      // 综合分析光学类物料的风险和供应商表现
      const [riskData] = await connection.execute(`
        SELECT
          i.material_name,
          i.supplier_name,
          i.risk_level,
          COUNT(*) as material_count,
          AVG(CASE WHEN lt.test_result = '合格' THEN 1 ELSE 0 END) as pass_rate,
          AVG(ot.defect_rate) as avg_defect_rate
        FROM inventory i
        LEFT JOIN lab_tests lt ON i.material_name = lt.material_name AND i.supplier_name = lt.supplier_name
        LEFT JOIN online_tracking ot ON i.material_name = ot.material_name
        WHERE i.material_name IN (${materialFilter})
        GROUP BY i.material_name, i.supplier_name, i.risk_level
        ORDER BY i.material_name,
          CASE i.risk_level WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END
      `);

      // 按物料分组数据
      const groupedData = {};
      riskData.forEach(item => {
        if (!groupedData[item.material_name]) {
          groupedData[item.material_name] = [];
        }
        groupedData[item.material_name].push({
          supplier: item.supplier_name,
          risk: item.risk_level,
          count: item.material_count,
          passRate: (item.pass_rate * 100) || 0,
          defectRate: (item.avg_defect_rate * 100) || 0
        });
      });

      return {
        chartType: 'scatter',
        title: '光学类物料风险评估矩阵',
        data: {
          series: Object.keys(groupedData).map(material => ({
            name: material,
            data: groupedData[material].map(item => [
              item.defectRate, // x轴：不良率
              100 - item.passRate, // y轴：测试失败率
              item.count * 10 // 气泡大小：物料数量
            ])
          }))
        },
        config: {
          xAxis: { name: '不良率(%)' },
          yAxis: { name: '测试失败率(%)' },
          tooltip: {
            formatter: function(params) {
              return `${params.seriesName}<br/>
                      不良率: ${params.value[0].toFixed(2)}%<br/>
                      测试失败率: ${params.value[1].toFixed(2)}%<br/>
                      物料数量: ${Math.round(params.value[2] / 10)}`;
            }
          }
        }
      };
    } finally {
      await connection.end();
    }
  }

  // 🚨 TOP异常批次排行榜
  async generateTopAbnormalBatches() {
    const connection = await this.getConnection();
    try {
      // 基于异常数量统计批次
      const [rows] = await connection.execute(`
        SELECT 
          batch_code,
          material_name,
          exception_count,
          defect_rate,
          factory,
          project
        FROM online_tracking 
        WHERE exception_count IS NOT NULL
        ORDER BY exception_count DESC, defect_rate DESC
        LIMIT 10
      `);

      return {
        chartType: 'bar',
        title: 'TOP异常批次排行榜',
        data: {
          categories: rows.map(row => row.batch_code),
          series: [{
            name: '异常数量',
            data: rows.map(row => row.exception_count),
            color: '#F44336'
          }]
        },
        config: {
          yAxis: { name: '异常数量' },
          tooltip: {
            formatter: function(params) {
              const item = rows[params.dataIndex];
              return `批次: ${params.name}<br/>
                      异常数量: ${params.value}<br/>
                      物料: ${item.material_name}<br/>
                      不良率: ${item.defect_rate}<br/>
                      工厂: ${item.factory}`;
            }
          }
        }
      };
    } finally {
      await connection.end();
    }
  }

  // 🥧 风险等级分布饼图
  async generateRiskLevelDistribution() {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          risk_level,
          COUNT(*) as count
        FROM inventory 
        WHERE risk_level IS NOT NULL
        GROUP BY risk_level
        ORDER BY 
          CASE risk_level 
            WHEN 'high' THEN 1 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 3 
          END
      `);

      const colors = {
        'high': '#F44336',
        'medium': '#FF9800', 
        'low': '#4CAF50'
      };

      return {
        chartType: 'pie',
        title: '库存风险等级分布',
        data: {
          series: [{
            name: '风险等级分布',
            data: rows.map(row => ({
              name: row.risk_level.toUpperCase(),
              value: row.count,
              itemStyle: { color: colors[row.risk_level] }
            }))
          }]
        }
      };
    } finally {
      await connection.end();
    }
  }

  // ✅ 测试结果分布图
  async generateTestResultDistribution() {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          test_result,
          COUNT(*) as count
        FROM lab_tests 
        WHERE test_result IS NOT NULL
        GROUP BY test_result
      `);

      return {
        chartType: 'pie',
        title: '测试结果分布',
        data: {
          series: [{
            name: '测试结果',
            data: rows.map(row => ({
              name: row.test_result,
              value: row.count,
              itemStyle: { 
                color: row.test_result === '合格' ? '#4CAF50' : '#F44336' 
              }
            }))
          }]
        }
      };
    } finally {
      await connection.end();
    }
  }

  // 📉 不良率趋势分析
  async generateDefectRateTrend() {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          DATE_FORMAT(use_time, '%Y-%m-%d') as date,
          AVG(defect_rate) as avg_defect_rate,
          COUNT(*) as batch_count
        FROM online_tracking 
        WHERE defect_rate IS NOT NULL AND use_time IS NOT NULL
        GROUP BY DATE_FORMAT(use_time, '%Y-%m-%d')
        ORDER BY date
        LIMIT 30
      `);

      return {
        chartType: 'line',
        title: '不良率趋势分析',
        data: {
          categories: rows.map(row => row.date),
          series: [{
            name: '平均不良率',
            data: rows.map(row => (row.avg_defect_rate * 100).toFixed(3)),
            color: '#2196F3'
          }]
        },
        config: {
          yAxis: { name: '不良率(%)' },
          xAxis: { name: '日期' }
        }
      };
    } finally {
      await connection.end();
    }
  }

  // 🎯 供应商质量对比雷达图
  async generateSupplierQualityRadar() {
    const connection = await this.getConnection();
    try {
      // 获取主要供应商的质量指标
      const [suppliers] = await connection.execute(`
        SELECT DISTINCT supplier_name 
        FROM inventory 
        WHERE supplier_name IS NOT NULL 
        LIMIT 5
      `);

      const radarData = [];
      const indicators = [
        { name: '库存数量', max: 100 },
        { name: '风险控制', max: 100 },
        { name: '测试通过率', max: 100 },
        { name: '批次稳定性', max: 100 },
        { name: '交付及时性', max: 100 }
      ];

      for (const supplier of suppliers) {
        // 计算各项指标（示例数据）
        const score = {
          name: supplier.supplier_name,
          value: [
            Math.floor(Math.random() * 40) + 60, // 库存数量
            Math.floor(Math.random() * 30) + 70, // 风险控制
            Math.floor(Math.random() * 20) + 80, // 测试通过率
            Math.floor(Math.random() * 25) + 75, // 批次稳定性
            Math.floor(Math.random() * 30) + 70  // 交付及时性
          ]
        };
        radarData.push(score);
      }

      return {
        chartType: 'radar',
        title: '供应商质量对比雷达图',
        data: {
          indicators: indicators,
          series: radarData
        }
      };
    } finally {
      await connection.end();
    }
  }

  // 🏭 深圳工厂物料流分析
  async generateFactoryMaterialFlow() {
    const connection = await this.getConnection();
    try {
      // 分析深圳工厂的物料流转情况
      const [flowData] = await connection.execute(`
        SELECT
          i.material_name,
          COUNT(DISTINCT i.batch_code) as batch_count,
          SUM(i.quantity) as total_quantity,
          AVG(CASE WHEN lt.test_result = '合格' THEN 1 ELSE 0 END) as pass_rate,
          COUNT(DISTINCT i.supplier_name) as supplier_count,
          AVG(ot.defect_rate) as avg_defect_rate
        FROM inventory i
        LEFT JOIN lab_tests lt ON i.material_name = lt.material_name
        LEFT JOIN online_tracking ot ON i.material_name = ot.material_name
        WHERE i.storage_location LIKE '%深圳%'
        GROUP BY i.material_name
        HAVING batch_count > 0
        ORDER BY total_quantity DESC
        LIMIT 15
      `);

      return {
        chartType: 'line',
        title: '深圳工厂物料流转分析',
        data: {
          categories: flowData.map(row => row.material_name),
          series: [
            {
              name: '库存数量',
              data: flowData.map(row => row.total_quantity),
              yAxisIndex: 0,
              color: '#2196F3'
            },
            {
              name: '测试通过率(%)',
              data: flowData.map(row => (row.pass_rate * 100) || 0),
              yAxisIndex: 1,
              color: '#4CAF50'
            }
          ]
        },
        config: {
          yAxis: [
            { name: '库存数量', position: 'left' },
            { name: '测试通过率(%)', position: 'right', max: 100 }
          ]
        }
      };
    } finally {
      await connection.end();
    }
  }

  // 🔗 质量-库存-生产联动分析
  async generateQualityInventoryProductionLinkage() {
    const connection = await this.getConnection();
    try {
      // 跨表综合分析
      const [linkageData] = await connection.execute(`
        SELECT
          i.material_name,
          i.risk_level,
          COUNT(DISTINCT i.batch_code) as inventory_batches,
          COUNT(lt.id) as test_records,
          AVG(CASE WHEN lt.test_result = '合格' THEN 1 ELSE 0 END) as test_pass_rate,
          COUNT(ot.id) as production_records,
          AVG(ot.defect_rate) as avg_production_defect_rate,
          AVG(ot.exception_count) as avg_exception_count
        FROM inventory i
        LEFT JOIN lab_tests lt ON i.material_name = lt.material_name
        LEFT JOIN online_tracking ot ON i.material_name = ot.material_name
        WHERE i.material_name IS NOT NULL
        GROUP BY i.material_name, i.risk_level
        HAVING inventory_batches > 0
        ORDER BY avg_production_defect_rate DESC, avg_exception_count DESC
        LIMIT 12
      `);

      return {
        chartType: 'bubble',
        title: '质量-库存-生产联动分析',
        data: {
          series: [{
            name: '物料质量联动',
            data: linkageData.map(item => [
              (item.test_pass_rate * 100) || 50, // x轴：测试通过率
              100 - ((item.avg_production_defect_rate * 100) || 0), // y轴：生产质量（100-不良率）
              item.inventory_batches * 5, // 气泡大小：库存批次数
              item.material_name // 标签
            ])
          }]
        },
        config: {
          xAxis: { name: '测试通过率(%)' },
          yAxis: { name: '生产质量指数' },
          tooltip: {
            formatter: function(params) {
              return `${params.value[3]}<br/>
                      测试通过率: ${params.value[0].toFixed(1)}%<br/>
                      生产质量指数: ${params.value[1].toFixed(1)}<br/>
                      库存批次数: ${Math.round(params.value[2] / 5)}`;
            }
          }
        }
      };
    } finally {
      await connection.end();
    }
  }

  // 根据图表类型生成对应图表
  async generateChart(chartType) {
    switch (chartType) {
      case '结构件类质量分析':
        return await this.generateStructuralMaterialsAnalysis();
      case '光学类风险评估':
        return await this.generateOpticalMaterialsRiskAssessment();
      case '深圳工厂物料流':
        return await this.generateFactoryMaterialFlow();
      case '质量-库存-生产联动':
        return await this.generateQualityInventoryProductionLinkage();
      case '风险等级分布':
        return await this.generateRiskLevelDistribution();
      case '测试结果分布':
        return await this.generateTestResultDistribution();
      case '不良率趋势分析':
        return await this.generateDefectRateTrend();
      case '供应商质量对比':
        return await this.generateSupplierQualityRadar();
      default:
        throw new Error(`不支持的图表类型: ${chartType}`);
    }
  }
}

export default ChartGenerationService;
