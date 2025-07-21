/**
 * 图表初始化帮助工具
 * 用于解决echarts初始化问题，特别是getAxis相关错误
 */

/**
 * 安全初始化echarts图表
 * @param {HTMLElement} container DOM容器
 * @param {Object} options 图表选项
 * @param {Number} retryCount 重试次数
 * @param {Number} delayMs 延迟毫秒数
 * @returns {Promise<echarts.ECharts|null>} 图表实例或null
 */
export async function safeInitChart(container, options, retryCount = 3, delayMs = 100) {
  let chart = null;
  let attempts = 0;
  
  const tryInit = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          if (!container) {
            console.warn('图表容器不存在，无法初始化图表');
            resolve(null);
            return;
          }
          
          // 确保echarts已经加载
          if (!window.echarts) {
            console.error('echarts未加载: 无法初始化图表');
            console.log(`echarts加载尝试 ${attempts+1}/${retryCount}`);
            resolve(null);
            return;
          }
          
          // 确保容器尺寸合理
          if (container.offsetWidth <= 0 || container.offsetHeight <= 0) {
            console.warn(`图表容器尺寸为0，设置默认尺寸: ${attempts+1}/${retryCount} 尝试`);
            container.style.width = '100%';
            container.style.minHeight = '300px';
            container.style.height = '300px';
          }
          
          // 初始化图表
          const chart = window.echarts.init(container);
          
          // 防止getAxis错误：确保options中的数据有效
          const safeOptions = validateAndFixOptions(options);
          chart.setOption(safeOptions);
          
          console.log('图表初始化成功');
          resolve(chart);
        } catch (error) {
          console.error('图表初始化失败:', error);
          resolve(null);
        }
      }, delayMs * (attempts + 1)); // 递增延迟时间
    });
  };
  
  // 尝试多次初始化
  while (attempts < retryCount && !chart) {
    attempts++;
    console.log(`图表初始化尝试 ${attempts}/${retryCount}`);
    chart = await tryInit();
    if (!chart) {
      console.warn(`echarts未加载: 无法初始化图表 ${attempts}/${retryCount} 失败，将重试...`);
    }
  }
  
  // 如果最终初始化失败，创建一个失败提示
  if (!chart && container) {
    try {
      // 添加失败提示
      const message = document.createElement('div');
      message.style.padding = '20px';
      message.style.textAlign = 'center';
      message.style.color = '#F56C6C';
      message.style.border = '1px solid #F56C6C';
      message.style.borderRadius = '4px';
      message.style.margin = '10px 0';
      message.innerHTML = '图表加载失败，请刷新页面重试';
      
      // 清空容器并添加错误消息
      container.innerHTML = '';
      container.appendChild(message);
    } catch (err) {
      console.error('添加图表错误消息失败:', err);
    }
  }
  
  return chart;
}

/**
 * 验证和修复图表选项，防止getAxis错误
 * @param {Object} options 原始图表选项
 * @returns {Object} 修正后的图表选项
 */
function validateAndFixOptions(options) {
  // 创建选项的深拷贝，避免修改原始对象
  const safeOptions = JSON.parse(JSON.stringify(options));
  
  try {
    // 处理标记线相关选项，防止getAxis undefined错误
    if (safeOptions.series) {
      safeOptions.series = safeOptions.series.map(series => {
        // 如果有markLine选项但没有data，添加空数组防止错误
        if (series.markLine && !series.markLine.data) {
          series.markLine.data = [];
        }
        
        // 如果有markPoint选项但没有data，添加空数组防止错误
        if (series.markPoint && !series.markPoint.data) {
          series.markPoint.data = [];
        }
        
        return series;
      });
    }
    
    // 确保轴配置有效（避免getAxis错误）
    ['xAxis', 'yAxis'].forEach(axisType => {
      if (safeOptions[axisType]) {
        // 如果是数组形式
        if (Array.isArray(safeOptions[axisType])) {
          safeOptions[axisType] = safeOptions[axisType].map(axis => {
            // 确保data存在
            if (axis.type === 'category' && !axis.data) {
              axis.data = [];
            }
            return axis;
          });
        } 
        // 如果是对象形式
        else if (typeof safeOptions[axisType] === 'object') {
          if (safeOptions[axisType].type === 'category' && !safeOptions[axisType].data) {
            safeOptions[axisType].data = [];
          }
        }
      }
    });
  } catch (err) {
    console.warn('图表选项验证修复过程中出错:', err);
  }
  
  return safeOptions;
}

/**
 * 安全销毁图表实例
 * @param {echarts.ECharts} chart 图表实例
 */
export function safeDisposeChart(chart) {
  if (!chart) return;
  
  try {
    chart.dispose();
  } catch (error) {
    console.error('销毁图表实例失败:', error);
  }
}

/**
 * 设置图表自动调整大小
 * @param {echarts.ECharts} chart 图表实例
 * @param {HTMLElement} container 图表容器
 */
export function setupChartResize(chart, container) {
  if (!chart) return;
  
  const resizeHandler = () => {
    if (chart && container) {
      try {
        chart.resize();
      } catch (error) {
        console.error('调整图表大小失败:', error);
      }
    }
  };
  
  // 移除可能存在的旧事件监听器
  window.removeEventListener('resize', resizeHandler);
  // 添加新的事件监听器
  window.addEventListener('resize', resizeHandler);
  
  // 返回清理函数
  return () => {
    window.removeEventListener('resize', resizeHandler);
  };
}

export default {
  safeInitChart,
  setupChartResize,
  safeDisposeChart
}; 