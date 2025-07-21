/**
 * 项目-基线映射数据
 * 定义项目与基线的绑定关系
 */

// 基线定义
export const baselines = [
  {
    baseline_id: 'I6789',
    baseline_name: 'I6789基线',
    baseline_version: 'v1.0',
    design_date: '2024-01-15',
    design_owner: '张工',
    description: '通用测试基线I6789',
    status: '活跃'
  },
  {
    baseline_id: 'I6788',
    baseline_name: 'I6788基线',
    baseline_version: 'v1.0',
    design_date: '2024-02-20',
    design_owner: '李工',
    description: '通用测试基线I6788',
    status: '活跃'
  },
  {
    baseline_id: 'I6787',
    baseline_name: 'I6787基线',
    baseline_version: 'v1.0',
    design_date: '2024-03-10',
    design_owner: '王工',
    description: '通用测试基线I6787',
    status: '活跃'
  }
];

// 项目定义
export const projects = [
  {
    project_id: 'X6827',
    project_name: 'X6827项目',
    baseline_id: 'I6789', // 关联到I6789基线
    creation_date: '2024-01-20',
    owner: '张工',
    status: '活跃',
    factory: '重庆工厂'
  },
  {
    project_id: 'S665LN',
    project_name: 'S665LN项目',
    baseline_id: 'I6789', // 关联到I6789基线
    creation_date: '2024-01-25',
    owner: '李工',
    status: '活跃',
    factory: '深圳工厂'
  },
  {
    project_id: 'KI4K',
    project_name: 'KI4K项目',
    baseline_id: 'I6789', // 关联到I6789基线
    creation_date: '2024-02-28',
    owner: '王工',
    status: '活跃',
    factory: '南昌工厂'
  },
  {
    project_id: 'X6828',
    project_name: 'X6828项目',
    baseline_id: 'I6789', // 关联到I6789基线
    creation_date: '2024-03-05',
    owner: '赵工',
    status: '活跃',
    factory: '宜宾工厂'
  },
  {
    project_id: 'X6831',
    project_name: 'X6831项目',
    baseline_id: 'I6788', // 关联到I6788基线
    creation_date: '2024-03-15',
    owner: '孙工',
    status: '活跃',
    factory: '重庆工厂'
  },
  {
    project_id: 'KI5K',
    project_name: 'KI5K项目',
    baseline_id: 'I6788', // 关联到I6788基线
    creation_date: '2024-03-20',
    owner: '钱工',
    status: '活跃',
    factory: '深圳工厂'
  },
  {
    project_id: 'S662LN',
    project_name: 'S662LN项目',
    baseline_id: 'I6787', // 关联到I6787基线
    creation_date: '2024-04-10',
    owner: '周工',
    status: '活跃',
    factory: '南昌工厂'
  },
  {
    project_id: 'S663LN',
    project_name: 'S663LN项目',
    baseline_id: 'I6787', // 关联到I6787基线
    creation_date: '2024-04-15',
    owner: '吴工',
    status: '活跃',
    factory: '宜宾工厂'
  },
  {
    project_id: 'S664LN',
    project_name: 'S664LN项目',
    baseline_id: 'I6787', // 关联到I6787基线
    creation_date: '2024-05-20',
    owner: '郑工',
    status: '活跃',
    factory: '重庆工厂'
  }
];

// 项目物料关联表
export const projectMaterials = {
  'X6827': ['电池盖', '中框', '手机卡托', '侧键'],
  'S665LN': ['电池盖', '中框', '手机卡托', 'OLED显示屏'],
  'KI4K': ['电池', '电池盖', '喇叭', '听筒'],
  'X6828': ['电池盖', '中框', '手机卡托', '侧键'],
  'X6831': ['摄像头(CAM)', 'LCD显示屏', '标签'],
  'KI5K': ['LCD显示屏', 'OLED显示屏', '充电器'],
  'S662LN': ['摄像头(CAM)', '标签', '保护套'],
  'S663LN': ['电池盖', '装饰件', '包装盒'],
  'S664LN': ['中框', '侧键', '包装盒']
};

/**
 * 获取项目与基线的关系映射
 * @returns {Map} 项目ID到基线ID的映射
 */
export function getProjectBaselineMap() {
  const map = new Map();
  projects.forEach(project => {
    map.set(project.project_id, project.baseline_id);
  });
  return map;
}

/**
 * 获取基线下的所有项目
 * @param {string} baselineId 基线ID
 * @returns {Array} 项目数组
 */
export function getProjectsByBaseline(baselineId) {
  return projects.filter(project => project.baseline_id === baselineId);
}

/**
 * 获取项目对应的基线
 * @param {string} projectId 项目ID
 * @returns {Object|null} 基线对象或null
 */
export function getBaselineByProject(projectId) {
  const project = projects.find(p => p.project_id === projectId);
  if (!project) return null;
  
  return baselines.find(b => b.baseline_id === project.baseline_id);
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

/**
 * 获取特定工厂的所有项目
 * @param {string} factory 工厂名称
 * @returns {Array} 项目数组
 */
export function getProjectsByFactory(factory) {
  return projects.filter(project => project.factory === factory);
}

/**
 * 初始化项目基线关系到localStorage
 */
export function initializeProjectBaselineRelations() {
  try {
    const map = getProjectBaselineMap();
    const relations = Array.from(map.entries());
    localStorage.setItem('project_baseline_relation', JSON.stringify(relations));
    localStorage.setItem('baseline_data', JSON.stringify(baselines));
    localStorage.setItem('project_material_relation', JSON.stringify(projectMaterials));
    return true;
  } catch (error) {
    console.error('初始化项目基线关系失败:', error);
    return false;
  }
}

export default {
  baselines,
  projects,
  projectMaterials,
  getProjectBaselineMap,
  getProjectsByBaseline,
  getBaselineByProject,
  getMaterialsByProject,
  getProjectsByMaterial,
  getProjectsByFactory,
  initializeProjectBaselineRelations
}; 