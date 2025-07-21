/**
 * 项目基线管理服务
 * 管理项目和基线之间的命名规则和绑定关系
 */

// 导入必要的依赖
import { ref } from 'vue';
import unifiedDataService from './UnifiedDataService.js';
import { 
  baselines as defaultBaselines, 
  projects as defaultProjects,
  projectMaterials,
  getProjectBaselineMap as getDefaultMap,
  initializeProjectBaselineRelations
} from '../data/ProjectBaselineMap.js';

class ProjectBaselineService {
  constructor() {
    // 存储项目和基线的关系
    this.projectBaselineMap = ref(new Map());
    // 存储项目数据
    this.projects = ref([]);
    // 存储基线数据
    this.baselines = ref([]);
    // 基线数据存储键名
    this.BASELINE_STORAGE_KEY = 'baseline_data';
    // 项目与基线关系数据存储键名
    this.RELATION_STORAGE_KEY = 'project_baseline_relation';
    // 项目数据存储键名
    this.PROJECT_STORAGE_KEY = 'project_data';
    // 项目物料关系存储键名
    this.PROJECT_MATERIAL_KEY = 'project_material_relation';
    
    // 初始化服务
    this.initialized = false;
  }

  /**
   * 初始化服务
   * 加载项目和基线关系数据
   */
  async initialize() {
    if (this.initialized) return true;
    
    try {
      await this.loadRelations();
      await this.loadProjectData();
      await this.loadBaselineData();
      
      // 如果没有数据，从默认数据初始化
      if (this.projectBaselineMap.value.size === 0 || 
          this.projects.value.length === 0 || 
          this.baselines.value.length === 0) {
        await this.initializeFromDefault();
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('初始化项目基线服务失败:', error);
      return false;
    }
  }

  /**
   * 从默认数据初始化
   */
  async initializeFromDefault() {
    console.log('从默认数据初始化项目基线关系...');
    // 使用默认数据初始化
    await initializeProjectBaselineRelations();
    // 重新加载数据
    await this.loadRelations();
    await this.loadProjectData();
    await this.loadBaselineData();
    return true;
  }

  /**
   * 加载项目和基线关系数据
   */
  async loadRelations() {
    try {
      const relationData = localStorage.getItem(this.RELATION_STORAGE_KEY);
      if (relationData) {
        // 将存储的关系转换回Map对象
        const relations = JSON.parse(relationData);
        this.projectBaselineMap.value = new Map(relations);
        console.log(`已加载 ${this.projectBaselineMap.value.size} 个项目基线关系`);
      } else {
        // 如果没有存储的关系，从默认数据加载
        this.projectBaselineMap.value = getDefaultMap();
        this.saveRelations();
      }
      return true;
    } catch (error) {
      console.error('加载项目基线关系失败:', error);
      return false;
    }
  }

  /**
   * 加载项目数据
   */
  async loadProjectData() {
    try {
      const projectData = localStorage.getItem(this.PROJECT_STORAGE_KEY);
      if (projectData) {
        this.projects.value = JSON.parse(projectData);
        console.log(`已加载 ${this.projects.value.length} 个项目数据`);
      } else {
        // 如果没有存储的项目数据，从默认数据加载
        this.projects.value = [...defaultProjects];
        this.saveProjectData();
      }
      return true;
    } catch (error) {
      console.error('加载项目数据失败:', error);
      return false;
    }
  }

  /**
   * 加载基线数据
   */
  async loadBaselineData() {
    try {
      const baselineData = localStorage.getItem(this.BASELINE_STORAGE_KEY);
      if (baselineData) {
        this.baselines.value = JSON.parse(baselineData);
        console.log(`已加载 ${this.baselines.value.length} 个基线数据`);
      } else {
        // 如果没有存储的基线数据，从默认数据加载
        this.baselines.value = [...defaultBaselines];
        this.saveBaselineData();
      }
      return true;
    } catch (error) {
      console.error('加载基线数据失败:', error);
      return false;
    }
  }

  /**
   * 保存项目和基线关系到本地存储
   */
  saveRelations() {
    try {
      const relations = Array.from(this.projectBaselineMap.value.entries());
      localStorage.setItem(this.RELATION_STORAGE_KEY, JSON.stringify(relations));
      return true;
    } catch (error) {
      console.error('保存项目基线关系失败:', error);
      return false;
    }
  }

  /**
   * 保存项目数据
   */
  saveProjectData() {
    try {
      localStorage.setItem(this.PROJECT_STORAGE_KEY, JSON.stringify(this.projects.value));
      return true;
    } catch (error) {
      console.error('保存项目数据失败:', error);
      return false;
    }
  }

  /**
   * 保存基线数据
   * @param {Array} data 基线数据（可选）
   * @param {boolean} clearExisting 是否清除现有数据
   * @returns {boolean} 是否成功
   */
  saveBaselineData(data, clearExisting = false) {
    try {
      if (data) {
        if (clearExisting) {
          this.baselines.value = data;
        } else {
          this.baselines.value = [...this.baselines.value, ...data];
        }
      }
      
      localStorage.setItem(this.BASELINE_STORAGE_KEY, JSON.stringify(this.baselines.value));
      return true;
    } catch (error) {
      console.error('保存基线数据失败:', error);
      return false;
    }
  }

  /**
   * 获取基线数据
   * @returns {Array} 基线数据数组
   */
  getBaselineData() {
    return this.baselines.value;
  }

  /**
   * 获取项目数据
   * @returns {Array} 项目数据数组
   */
  getProjectData() {
    return this.projects.value;
  }

  /**
   * 获取项目关联的物料
   * @param {string} projectId 项目ID
   * @returns {Array} 关联的物料数组
   */
  getProjectMaterials(projectId) {
    return projectMaterials[projectId] || [];
  }

  /**
   * 验证项目ID格式
   * @param {string} projectId 项目ID
   * @returns {boolean} 是否有效
   */
  validateProjectId(projectId) {
    // 项目ID格式：X、S或K开头，后面跟随4-5位字符，可以是数字或字母
    const pattern = /^[XSK][0-9A-Z]{4,5}$/;
    return pattern.test(projectId);
  }

  /**
   * 验证基线ID格式
   * @param {string} baselineId 基线ID
   * @returns {boolean} 是否有效
   */
  validateBaselineId(baselineId) {
    // 基线ID格式：I开头，后面跟随4位数字
    const pattern = /^I\d{4}$/;
    return pattern.test(baselineId);
  }

  /**
   * 创建基线
   * @param {string} baselineId 基线ID，如I6789
   * @param {Object} baselineData 基线其他数据
   * @returns {Object} 创建结果
   */
  createBaseline(baselineId, baselineData = {}) {
    // 验证基线ID格式
    if (!this.validateBaselineId(baselineId)) {
      return { success: false, message: '基线ID格式无效，必须为I加4位数字，如I6789' };
    }

    // 检查基线ID是否已存在
    if (this.baselines.value.some(b => b.baseline_id === baselineId)) {
      return { success: false, message: '基线ID已存在' };
    }

    // 创建新基线
    const newBaseline = {
      baseline_id: baselineId,
      baseline_name: baselineData.name || `基线${baselineId}`,
      baseline_version: baselineData.version || 'v1.0',
      design_date: baselineData.date || new Date().toISOString().split('T')[0],
      design_owner: baselineData.owner || '系统管理员',
      description: baselineData.description || `基线${baselineId}的描述`,
      status: baselineData.status || '活跃',
    };

    // 保存基线数据
    this.baselines.value.push(newBaseline);
    this.saveBaselineData();
    
    return { success: true, baseline: newBaseline };
  }

  /**
   * 创建项目并关联到基线
   * @param {string} projectId 项目ID，如X6827
   * @param {string} baselineId 关联的基线ID
   * @param {Object} projectData 项目其他数据
   * @returns {Object} 创建结果
   */
  createProject(projectId, baselineId, projectData = {}) {
    // 验证项目ID格式
    if (!this.validateProjectId(projectId)) {
      return { success: false, message: '项目ID格式无效，必须为X、S或K开头，后面跟随4-5位字符' };
    }

    // 验证基线ID格式并检查基线是否存在
    if (!this.validateBaselineId(baselineId)) {
      return { success: false, message: '基线ID格式无效' };
    }

    const baseline = this.baselines.value.find(b => b.baseline_id === baselineId);
    if (!baseline) {
      return { success: false, message: '指定的基线不存在' };
    }

    // 检查项目是否已存在
    if (this.projects.value.some(p => p.project_id === projectId)) {
      return { success: false, message: '项目ID已存在' };
    }

    // 检查该基线关联的项目数量是否已达上限
    const projectsForBaseline = this.getProjectsByBaseline(baselineId);
    if (projectsForBaseline.length >= 6) {
      return { success: false, message: '该基线已关联6个项目，已达到上限' };
    }

    // 创建项目并关联到基线
    const newProject = {
      project_id: projectId,
      project_name: projectData.name || `项目${projectId}`,
      baseline_id: baselineId,
      creation_date: projectData.date || new Date().toISOString().split('T')[0],
      owner: projectData.owner || '系统管理员',
      status: projectData.status || '活跃',
      factory: projectData.factory || '重庆工厂'
    };

    // 添加到项目列表
    this.projects.value.push(newProject);
    this.saveProjectData();

    // 建立项目与基线的关联
    this.projectBaselineMap.value.set(projectId, baselineId);
    this.saveRelations();

    return { success: true, project: newProject };
  }

  /**
   * 获取基线关联的所有项目
   * @param {string} baselineId 基线ID
   * @returns {Array} 关联的项目数组
   */
  getProjectsByBaseline(baselineId) {
    return this.projects.value.filter(project => project.baseline_id === baselineId);
  }

  /**
   * 获取项目关联的基线
   * @param {string} projectId 项目ID
   * @returns {Object|null} 关联的基线对象，如果不存在则返回null
   */
  getBaselineByProject(projectId) {
    const baselineId = this.projectBaselineMap.value.get(projectId);
    if (!baselineId) return null;
    
    return this.baselines.value.find(b => b.baseline_id === baselineId);
  }
  
  /**
   * 获取项目详情
   * @param {string} projectId 项目ID
   * @returns {Object|null} 项目对象，如果不存在则返回null
   */
  getProject(projectId) {
    return this.projects.value.find(p => p.project_id === projectId) || null;
  }
  
  /**
   * 获取基线详情
   * @param {string} baselineId 基线ID
   * @returns {Object|null} 基线对象，如果不存在则返回null
   */
  getBaseline(baselineId) {
    return this.baselines.value.find(b => b.baseline_id === baselineId) || null;
  }
  
  /**
   * 获取特定工厂的所有项目
   * @param {string} factory 工厂名称
   * @returns {Array} 项目数组
   */
  getProjectsByFactory(factory) {
    return this.projects.value.filter(project => project.factory === factory);
  }
}

// 创建单例实例
const projectBaselineService = new ProjectBaselineService();

export default projectBaselineService; 