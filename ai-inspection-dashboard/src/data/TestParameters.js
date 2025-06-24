/**
 * 实验室测试参数定义
 * 符合数据规则文档的测试参数配置
 */
export const LAB_TEST_PARAMETERS = {
  // 电子元件
  '电子元件': [
    { name: '电阻值', unit: 'Ω', min: 0, max: 1000, standard: '500±10%' },
    { name: '电容值', unit: 'μF', min: 0, max: 100, standard: '50±5%' },
    { name: '漏电流', unit: 'mA', min: 0, max: 10, standard: '<5' },
    { name: '耐压值', unit: 'V', min: 100, max: 1000, standard: '>500' },
    { name: '温度系数', unit: 'ppm/°C', min: -100, max: 100, standard: '±50' }
  ],
  
  // 结构件
  '结构件': [
    { name: '硬度', unit: 'HRC', min: 20, max: 65, standard: '45±5' },
    { name: '抗拉强度', unit: 'MPa', min: 200, max: 800, standard: '500±50' },
    { name: '延伸率', unit: '%', min: 5, max: 40, standard: '>15' },
    { name: '表面粗糙度', unit: 'μm', min: 0.1, max: 6.3, standard: '<3.2' },
    { name: '尺寸精度', unit: 'mm', min: -0.1, max: 0.1, standard: '±0.05' }
  ],
  
  // 晶片类
  '晶片类': [
    { name: '亮度', unit: 'nit', min: 200, max: 1000, standard: '>400' },
    { name: '对比度', unit: ':1', min: 800, max: 5000, standard: '>1500:1' },
    { name: '色域覆盖', unit: '%', min: 70, max: 100, standard: '>85%' },
    { name: '响应时间', unit: 'ms', min: 1, max: 20, standard: '<10' },
    { name: '视角', unit: '°', min: 160, max: 180, standard: '≥178' }
  ],
  
  // CAM/FP/电声组件
  'CAM/FP/电声组件': [
    { name: '像素密度', unit: 'MP', min: 2, max: 64, standard: '≥12' },
    { name: '识别准确率', unit: '%', min: 90, max: 100, standard: '≥98' },
    { name: '音频响应', unit: 'Hz', min: 20, max: 20000, standard: '20-20000' },
    { name: '灵敏度', unit: 'dB', min: -60, max: -30, standard: '≥-45' },
    { name: '失真度', unit: '%', min: 0, max: 10, standard: '<3' }
  ],
  
  // 连接器
  '连接器': [
    { name: '接触电阻', unit: 'mΩ', min: 10, max: 100, standard: '<50' },
    { name: '绝缘电阻', unit: 'MΩ', min: 100, max: 10000, standard: '>500' },
    { name: '插拔力', unit: 'N', min: 5, max: 50, standard: '20±5' },
    { name: '耐久性', unit: '次', min: 5000, max: 50000, standard: '>10000' },
    { name: '耐电压', unit: 'V', min: 100, max: 1000, standard: '>500' }
  ],
  
  // 电池/电源
  '电池/电源': [
    { name: '容量', unit: 'mAh', min: 1000, max: 5000, standard: '标称±5%' },
    { name: '内阻', unit: 'mΩ', min: 10, max: 100, standard: '<50' },
    { name: '循环寿命', unit: '次', min: 300, max: 1000, standard: '>500' },
    { name: '充电效率', unit: '%', min: 80, max: 99, standard: '>90' },
    { name: '输出电压稳定性', unit: '%', min: 0, max: 5, standard: '<2' }
  ],
  
  // 辅料/包材
  '辅料/包材': [
    { name: '抗压强度', unit: 'kg', min: 10, max: 100, standard: '>30' },
    { name: '粘合强度', unit: 'N/cm', min: 1, max: 20, standard: '>5' },
    { name: '耐磨性', unit: '次', min: 100, max: 1000, standard: '>300' },
    { name: '印刷色差', unit: 'ΔE', min: 0, max: 5, standard: '<2' },
    { name: '环保指标', unit: 'ppm', min: 0, max: 1000, standard: '符合RoHS' }
  ],
  
  // 默认参数
  'default': [
    { name: '参数1', unit: '', min: 0, max: 100, standard: '50±10%' },
    { name: '参数2', unit: '', min: 0, max: 100, standard: '50±10%' },
    { name: '参数3', unit: '', min: 0, max: 100, standard: '50±10%' },
    { name: '参数4', unit: '', min: 0, max: 100, standard: '50±10%' },
    { name: '参数5', unit: '', min: 0, max: 100, standard: '50±10%' }
  ]
};

/**
 * 获取测试参数配置
 * @param {string} category 物料类别
 * @returns {Array} 测试参数数组
 */
export function getTestParameters(category) {
  return LAB_TEST_PARAMETERS[category] || LAB_TEST_PARAMETERS['default'];
}

/**
 * 验证测试值是否在范围内
 * @param {Object} parameter 参数对象
 * @param {number} value 测试值
 * @returns {boolean} 是否在范围内
 */
export function validateTestValue(parameter, value) {
  if (!parameter || value === undefined || value === null) return false;
  return value >= parameter.min && value <= parameter.max;
}

/**
 * 获取测试结果评级
 * @param {Object} parameter 参数对象
 * @param {number} value 测试值
 * @returns {string} 评级 (优/良/合格/不合格)
 */
export function getTestGrade(parameter, value) {
  if (!validateTestValue(parameter, value)) return '不合格';
  
  const range = parameter.max - parameter.min;
  const midPoint = parameter.min + range / 2;
  const deviation = Math.abs(value - midPoint) / (range / 2);
  
  if (deviation <= 0.2) return '优';
  if (deviation <= 0.5) return '良';
  return '合格';
}

/**
 * 获取测试结果状态
 * @param {Object} parameter 参数对象
 * @param {number} value 测试值
 * @returns {Object} 状态对象 {code, label, type}
 */
export function getTestStatus(parameter, value) {
  if (!validateTestValue(parameter, value)) {
    return { code: 'fail', label: '不合格', type: 'danger' };
  }
  
  const grade = getTestGrade(parameter, value);
  
  switch (grade) {
    case '优':
      return { code: 'excellent', label: '优', type: 'success' };
    case '良':
      return { code: 'good', label: '良', type: 'success' };
    case '合格':
      return { code: 'pass', label: '合格', type: 'warning' };
    default:
      return { code: 'fail', label: '不合格', type: 'danger' };
  }
}

/**
 * 生成随机测试值
 * @param {Object} parameter 参数对象
 * @param {number} qualityFactor 质量因子(0-1)，越高质量越好
 * @returns {number} 随机测试值
 */
export function generateRandomTestValue(parameter, qualityFactor = 0.8) {
  if (!parameter) return 0;
  
  const range = parameter.max - parameter.min;
  const midPoint = parameter.min + range / 2;
  
  // 质量因子越高，值越接近中点
  const maxDeviation = range / 2 * (1 - qualityFactor);
  const deviation = (Math.random() * 2 - 1) * maxDeviation;
  
  let value = midPoint + deviation;
  
  // 确保值在范围内
  value = Math.max(parameter.min, Math.min(parameter.max, value));
  
  // 根据单位进行取整或保留小数
  if (['次', 'MP'].includes(parameter.unit)) {
    return Math.round(value);
  } else if (['mΩ', 'MΩ', 'Hz', 'V'].includes(parameter.unit)) {
    return Math.round(value * 10) / 10;
  } else {
    return Math.round(value * 100) / 100;
  }
}

export default {
  LAB_TEST_PARAMETERS,
  getTestParameters,
  validateTestValue,
  getTestGrade,
  getTestStatus,
  generateRandomTestValue
}; 