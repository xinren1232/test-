import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { generateUUID } from '../utils/common';
import { getAllMaterials } from '../data/MaterialSupplierMap';
import { LAB_TEST_PARAMETERS } from '../data/TestParameters';
import unifiedDataService from './UnifiedDataService';

/**
 * 实验室测试数据服务
 */
export default class LabTestDataService {
  constructor() {
    this.isUpdating = ref(false);
    this.lastUpdateTime = ref('');
  }
  
  /**
   * 创建单个实验室测试数据项
   * @param {Object} data 数据项
   * @returns {Object} 创建的数据项
   */
  createLabTestItem(data) {
    return {
      id: generateUUID(),
      material_id: data.materialCode,
      material_name: data.materialName,
      material_type: data.category,
      batch_no: data.batchNo,
      supplier: data.supplier,
      test_date: data.testDate,
      test_results: data.testResults || {},
      test_conclusion: data.testConclusion || '合格',
      tester: data.tester || '未知',
      remarks: data.remarks || '',
      created_at: new Date().toISOString(),
      project_id: data.project_id,
      project_name: data.project_name,
      baseline_id: data.baseline_id,
      baseline_name: data.baseline_name,
      factory: data.factory || '',
      factoryCode: data.factoryCode || '',
      test_type: data.testType || '',
    };
  }
  
  /**
   * 保存实验室测试数据
   * @param {Array} data 数据
   * @param {boolean} clearExisting 是否清除现有数据
   * @returns {boolean} 是否成功
   */
  saveLabTestData(data, clearExisting = false) {
    try {
      // 获取现有数据
      let existingData = [];
      if (!clearExisting) {
        existingData = JSON.parse(localStorage.getItem('lab_test_data') || '[]');
      }
      
      // 合并数据
      const mergedData = [...existingData, ...data];
      
      // 保存到本地存储
      localStorage.setItem('lab_test_data', JSON.stringify(mergedData));
      
      return true;
    } catch (error) {
      console.error('保存实验室测试数据失败:', error);
      return false;
    }
  }
  
  /**
   * 批量创建实验室测试数据
   * @param {number} count 创建数量
   * @param {boolean} clearExisting 是否清除现有数据
   * @param {Object} options 额外选项，包括项目数据和基线数据
   * @returns {Array} 创建的数据
   */
  createBatchLabTestData(count = 20, clearExisting = false, options = {}) {
    if (this.isUpdating.value) {
      ElMessage.warning('数据更新正在进行中，请稍后再试');
      return [];
    }
    
    try {
      this.isUpdating.value = true;
      console.log(`开始生成${count}条实验室测试数据...`);
      
      const labTestItems = [];
      
      // 从物料供应商映射中获取数据
      const allMaterials = getAllMaterials();
      if (!allMaterials || allMaterials.length === 0) {
        throw new Error('无法获取物料数据');
      }
      
      // 获取系统中已有的库存数据作为参考（如有）
      const inventoryData = options.inventoryData || unifiedDataService.getInventoryData();
      
      if (!inventoryData || inventoryData.length === 0) {
        console.warn('未找到库存数据，将使用随机生成的物料数据');
      }
      
      // 获取项目数据和基线数据
      const projectData = options.projectData || JSON.parse(localStorage.getItem('project_data') || '[]');
      const baselineData = options.baselineData || JSON.parse(localStorage.getItem('baseline_data') || '[]');
      
      // 如果没有基线数据，创建一些默认基线
      let updatedBaselineData = [...baselineData];
      if (updatedBaselineData.length === 0) {
        for (let i = 0; i < 5; i++) {
          const baselineId = `I${1000 + Math.floor(Math.random() * 9000)}`;
          updatedBaselineData.push({
            baseline_id: baselineId,
            baseline_name: `基线设计${baselineId}`,
            baseline_version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
            design_date: new Date().toISOString().split('T')[0],
            status: '活跃'
          });
        }
        // 保存基线数据
        localStorage.setItem('baseline_data', JSON.stringify(updatedBaselineData));
        console.log('已创建默认基线数据:', updatedBaselineData);
      }
      
      // 如果没有项目数据，创建一些默认项目
      let updatedProjectData = [...projectData];
      if (updatedProjectData.length === 0) {
        updatedBaselineData.forEach(baseline => {
          const projectCount = Math.floor(Math.random() * 2) + 5; // 5-6个项目
          for (let i = 0; i < projectCount; i++) {
            const projectId = `X${1000 + Math.floor(Math.random() * 9000)}`;
            updatedProjectData.push({
              project_id: projectId,
              project_name: `项目${projectId}`,
              baseline_id: baseline.baseline_id,
              baseline_name: baseline.baseline_name,
              start_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: Math.random() > 0.2 ? '进行中' : '已完成'
            });
          }
        });
        // 保存项目数据
        localStorage.setItem('project_data', JSON.stringify(updatedProjectData));
        console.log('已创建默认项目数据:', updatedProjectData);
      }
      
      // 测试状态
      const testStatuses = ['合格', '不合格', '待复检'];
      
      // 测试类型
      const testTypes = ['IQC', 'IPQC', 'FQC', 'OQC', '可靠性测试', '性能测试', '安全测试'];
      
      // 测试人员
      const testers = ['张工', '李工', '王工', '赵工', '刘工'];
      
      // 生成数据
      for (let i = 0; i < count; i++) {
        let materialInfo, supplier, materialCode, materialName, category, batchNo;
        let projectId, projectName, baselineId, baselineName;
        let factory, factoryCode;
        
        // 优先使用库存数据
        if (inventoryData && inventoryData.length > 0) {
          // 如果存在库存数据，使用相同的物料信息保持一致性
          const inventoryItem = inventoryData[i % inventoryData.length];
          
          // 确保所有必要的字段都存在，使用字段名称的多种可能形式
          materialCode = inventoryItem.materialCode || inventoryItem.material_id || inventoryItem.material_code || `MT${String(i+1).padStart(6, '0')}`;
          materialName = inventoryItem.materialName || inventoryItem.material_name || `未知物料-${i+1}`;
          category = inventoryItem.category || inventoryItem.material_type || '其他';
          supplier = inventoryItem.supplier || '未知供应商';
          batchNo = inventoryItem.batchNo || inventoryItem.batch_no || `BT${new Date().getTime().toString().substr(-8)}`;
          projectId = inventoryItem.project_id || '';
          projectName = inventoryItem.project_name || '';
          baselineId = inventoryItem.baseline_id || '';
          baselineName = inventoryItem.baseline_name || '';
          factory = inventoryItem.factory || '';
          factoryCode = inventoryItem.factoryCode || '';
          
          // 打印调试信息
          console.log(`使用库存物料数据: ${materialCode} - ${materialName}`);
        } else {
          // 否则从物料-供应商映射中选择
          materialInfo = allMaterials[i % allMaterials.length];
          materialName = materialInfo.name;
          category = materialInfo.category;
          
          // 生成物料编码
          materialCode = `${materialInfo.code_prefix}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
          
          // 获取对应的供应商
          const suppliersList = materialInfo.suppliers || [];
          supplier = suppliersList.length > 0 
            ? suppliersList[Math.floor(Math.random() * suppliersList.length)] 
            : '未知供应商';
          
          // 随机选择一个项目
          const selectedProject = updatedProjectData.length > 0 
            ? updatedProjectData[Math.floor(Math.random() * updatedProjectData.length)]
            : null;
            
          projectId = selectedProject ? selectedProject.project_id : `X${1000 + Math.floor(Math.random() * 9000)}`;
          projectName = selectedProject ? selectedProject.project_name : `项目${projectId}`;
          
          // 如果项目有关联的基线，使用该基线，否则随机选择一个
          baselineId = selectedProject ? selectedProject.baseline_id : 
            (updatedBaselineData.length > 0 ? updatedBaselineData[Math.floor(Math.random() * updatedBaselineData.length)].baseline_id : `I${1000 + Math.floor(Math.random() * 9000)}`);
          
          baselineName = selectedProject ? selectedProject.baseline_name :
            (updatedBaselineData.find(b => b.baseline_id === baselineId)?.baseline_name || `基线设计${baselineId}`);
          
          // 随机选择工厂
          const factories = ['上海工厂', '深圳工厂', '北京工厂', '广州工厂', '成都工厂'];
          const factoryCodes = {'上海工厂': 'SH', '深圳工厂': 'SZ', '北京工厂': 'BJ', '广州工厂': 'GZ', '成都工厂': 'CD'};
          factory = factories[Math.floor(Math.random() * factories.length)];
          factoryCode = factoryCodes[factory] || 'XX';
          
          // 生成批次号
          const today = new Date();
          batchNo = `${materialInfo.code_prefix}${factoryCode}-${today.getFullYear().toString().substr(2)}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
          
          // 打印调试信息
          console.log(`使用生成的物料数据: ${materialCode} - ${materialName}`);
        }
        
        // 随机生成测试日期（过去30天内）
        const testDate = new Date();
        testDate.setDate(testDate.getDate() - Math.floor(Math.random() * 30));
        
        // 随机生成测试结果
        const testResults = {};
        const testParameters = LAB_TEST_PARAMETERS[category] || LAB_TEST_PARAMETERS['default'];
        
        testParameters.forEach(param => {
          const min = param.min || 0;
          const max = param.max || 100;
          const value = Math.round((min + Math.random() * (max - min)) * 100) / 100;
          testResults[param.name] = value;
        });
        
        // 随机测试结论
        const testConclusion = testStatuses[Math.floor(Math.random() * testStatuses.length)];
        
        // 随机测试类型
        const testType = testTypes[Math.floor(Math.random() * testTypes.length)];
        
        // 随机测试人员
        const tester = testers[Math.floor(Math.random() * testers.length)];
        
        // 创建测试数据项
        const labTestItem = this.createLabTestItem({
          materialCode,
          materialName,
          category,
          batchNo,
          supplier,
          testDate: testDate.toISOString(),
          testResults,
          testConclusion,
          testType,
          tester,
          factory,
          factoryCode,
          // 添加项目ID和项目名称
          project_id: projectId,
          project_name: projectName,
          // 添加基线信息
          baseline_id: baselineId,
          baseline_name: baselineName,
          // 备注
          remarks: testConclusion === '合格' ? '测试通过' : (testConclusion === '不合格' ? '未达标准' : '需要复检')
        });
        
        labTestItems.push(labTestItem);
      }
      
      // 保存数据
      const saveResult = this.saveLabTestData(labTestItems, clearExisting);
      
      if (saveResult) {
        console.log(`成功生成${labTestItems.length}条实验室测试数据`);
        this.lastUpdateTime.value = new Date().toLocaleString();
        this.isUpdating.value = false;
        return labTestItems;
      } else {
        throw new Error('保存实验室测试数据失败');
      }
    } catch (error) {
      console.error('生成实验室测试数据失败:', error);
      this.isUpdating.value = false;
      return [];
    }
  }
  
  /**
   * 获取实验室测试数据
   * @returns {Array} 测试数据
   */
  getLabTestData() {
    try {
      // 首先尝试从统一数据服务获取
      const unifiedData = unifiedDataService.getLabData();
      if (unifiedData && unifiedData.length > 0) {
        console.log(`从统一数据服务获取到${unifiedData.length}条测试数据`);
        
        // 添加调试日志，检查关键字段
        if (unifiedData.length > 0) {
          const sample = unifiedData[0];
          console.log('测试数据样本:', {
            id: sample.id,
            materialCode: sample.materialCode || sample.material_id,
            testItem: sample.testItem,
            defectRate: sample.defectRate,
            result: sample.result || sample.test_conclusion
          });
          
          // 检查不良率字段
          const defectRates = unifiedData.map(item => item.defectRate).filter(rate => rate !== undefined);
          console.log('不良率数据统计:', {
            count: defectRates.length,
            min: defectRates.length > 0 ? Math.min(...defectRates) : 'N/A',
            max: defectRates.length > 0 ? Math.max(...defectRates) : 'N/A',
            avg: defectRates.length > 0 ? defectRates.reduce((sum, rate) => sum + rate, 0) / defectRates.length : 'N/A'
          });
        }
        
        return unifiedData;
      }
      
      // 如果统一数据服务没有数据，尝试从本地存储获取
      const labData = JSON.parse(localStorage.getItem('lab_test_data') || '[]');
      console.log(`从本地存储获取到${labData.length}条测试数据`);
      
      // 添加调试日志，检查本地存储数据的关键字段
      if (labData.length > 0) {
        const sample = labData[0];
        console.log('本地存储测试数据样本:', {
          id: sample.id,
          materialCode: sample.materialCode || sample.material_id,
          testItem: sample.testItem,
          defectRate: sample.defectRate,
          result: sample.result || sample.test_conclusion
        });
      }
      
      return labData;
    } catch (error) {
      console.error('获取实验室测试数据失败:', error);
      return [];
    }
  }
} 