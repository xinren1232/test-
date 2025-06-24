/**
 * 项目数据定义
 * 包含项目基线映射关系
 */

// 项目-基线映射
export const projectBaselines = {
  "PJ001": "BL001",
  "PJ002": "BL001",
  "PJ003": "BL002",
  "PJ004": "BL002",
  "PJ005": "BL003",
  "PJ006": "BL003",
  "PJ007": "BL004",
  "PJ008": "BL004",
  "PJ009": "BL005",
  "PJ010": "BL005"
};

// 项目名称映射
export const projectNames = {
  "PJ001": "智能手机电路项目",
  "PJ002": "平板电脑电路项目",
  "PJ003": "手机结构件项目",
  "PJ004": "平板结构件项目",
  "PJ005": "手机屏幕项目",
  "PJ006": "平板屏幕项目",
  "PJ007": "手机摄像头项目",
  "PJ008": "手机指纹模组项目",
  "PJ009": "手机连接器项目",
  "PJ010": "平板连接器项目"
};

// 基线名称映射
export const baselineNames = {
  "BL001": "电子元件基线",
  "BL002": "结构件基线",
  "BL003": "晶片类基线",
  "BL004": "CAM/FP/电声组件基线",
  "BL005": "连接器基线"
};

// 项目工厂映射
export const projectFactories = {
  "PJ001": "重庆工厂",
  "PJ002": "深圳工厂",
  "PJ003": "南昌工厂",
  "PJ004": "宜宾工厂",
  "PJ005": "重庆工厂",
  "PJ006": "深圳工厂",
  "PJ007": "南昌工厂",
  "PJ008": "宜宾工厂",
  "PJ009": "重庆工厂",
  "PJ010": "深圳工厂"
};

// 项目物料映射
export const projectMaterials = {
  "PJ001": ["PCB主板", "贴片电阻", "贴片电容", "贴片IC"],
  "PJ002": ["PCB主板", "贴片电阻", "贴片电容", "贴片IC"],
  "PJ003": ["手机壳料-后盖", "手机壳料-中框", "手机卡托", "侧键"],
  "PJ004": ["手机壳料-后盖", "手机壳料-中框", "装饰件"],
  "PJ005": ["LCD屏幕", "OLED屏幕"],
  "PJ006": ["LCD屏幕", "OLED屏幕"],
  "PJ007": ["CAM摄像头模组"],
  "PJ008": ["FP指纹模组"],
  "PJ009": ["连接器", "五金小件"],
  "PJ010": ["连接器", "五金小件"]
};

/**
 * 获取所有项目
 * @returns {Array} 项目ID数组
 */
export function getAllProjects() {
  return Object.keys(projectBaselines);
}

/**
 * 获取所有基线
 * @returns {Array} 基线ID数组
 */
export function getAllBaselines() {
  return [...new Set(Object.values(projectBaselines))];
}

/**
 * 获取项目对应的基线
 * @param {string} projectId 项目ID
 * @returns {string|undefined} 基线ID
 */
export function getBaselineForProject(projectId) {
  return projectBaselines[projectId];
}

/**
 * 获取基线下的所有项目
 * @param {string} baselineId 基线ID
 * @returns {Array} 项目ID数组
 */
export function getProjectsForBaseline(baselineId) {
  return Object.entries(projectBaselines)
    .filter(([_, baseline]) => baseline === baselineId)
    .map(([project, _]) => project);
}

/**
 * 获取项目名称
 * @param {string} projectId 项目ID
 * @returns {string} 项目名称
 */
export function getProjectName(projectId) {
  return projectNames[projectId] || projectId;
}

/**
 * 获取基线名称
 * @param {string} baselineId 基线ID
 * @returns {string} 基线名称
 */
export function getBaselineName(baselineId) {
  return baselineNames[baselineId] || baselineId;
}

/**
 * 获取项目所属工厂
 * @param {string} projectId 项目ID
 * @returns {string} 工厂名称
 */
export function getProjectFactory(projectId) {
  return projectFactories[projectId] || '未知工厂';
}

/**
 * 获取特定工厂的所有项目
 * @param {string} factory 工厂名称
 * @returns {Array} 项目ID数组
 */
export function getProjectsByFactory(factory) {
  return Object.entries(projectFactories)
    .filter(([_, factoryName]) => factoryName === factory)
    .map(([project, _]) => project);
}

/**
 * 获取项目关联的物料列表
 * @param {string} projectId 项目ID
 * @returns {Array} 物料名称数组
 */
export function getMaterialsByProject(projectId) {
  return projectMaterials[projectId] || [];
}

/**
 * 获取使用特定物料的所有项目
 * @param {string} materialName 物料名称
 * @returns {Array} 项目ID数组
 */
export function getProjectsByMaterial(materialName) {
  const result = [];
  for (const [projectId, materials] of Object.entries(projectMaterials)) {
    if (materials.includes(materialName)) {
      result.push(projectId);
    }
  }
  return result;
}

export default {
  projectBaselines,
  projectNames,
  baselineNames,
  projectFactories,
  projectMaterials,
  getAllProjects,
  getAllBaselines,
  getBaselineForProject,
  getProjectsForBaseline,
  getProjectName,
  getBaselineName,
  getProjectFactory,
  getProjectsByFactory,
  getMaterialsByProject,
  getProjectsByMaterial
}; 