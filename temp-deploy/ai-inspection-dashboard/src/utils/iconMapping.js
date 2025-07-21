/**
 * 图标映射工具函数
 * 用于根据模块名称获取对应的图标组件
 */
import {
  Document,
  Goods,
  DataAnalysis,
  Monitor,
  OfficeBuilding,
  Operation,
  Setting,
  Warning,
  Check,
  CircleCheck,
  DataBoard,
  Stopwatch
} from '@element-plus/icons-vue';

/**
 * 获取模块对应的图标组件
 * @param {string} moduleName 模块名称
 * @returns {Object} 对应的Icon组件
 */
export function getModuleIcon(moduleName) {
  const iconMap = {
    'inventory': Goods,
    'lab': DataAnalysis,
    'online': Monitor,
    'factory': OfficeBuilding,
    'quality': Operation,
    'settings': Setting,
    'warning': Warning,
    'validation': Check,
    'success': CircleCheck,
    'dashboard': DataBoard,
    'test': Stopwatch,
    'default': Document
  };
  
  return iconMap[moduleName] || iconMap.default;
}

/**
 * 获取规则类型对应的图标
 * @param {string} ruleType 规则类型
 * @returns {Object} 对应的Icon组件
 */
export function getRuleIcon(ruleType) {
  const iconMap = {
    'validation': Check,
    'calculation': DataAnalysis,
    'generation': DataBoard,
    'default': Document
  };
  
  return iconMap[ruleType] || iconMap.default;
}

/**
 * 获取数据操作类型对应的图标
 * @param {string} operationType 操作类型
 * @returns {Object} 对应的Icon组件
 */
export function getOperationIcon(operationType) {
  const iconMap = {
    'create': Document,
    'update': DataBoard,
    'delete': Warning,
    'validate': Check,
    'import': Goods,
    'export': DataAnalysis,
    'default': Operation
  };
  
  return iconMap[operationType] || iconMap.default;
}

export default { getModuleIcon, getRuleIcon, getOperationIcon }; 