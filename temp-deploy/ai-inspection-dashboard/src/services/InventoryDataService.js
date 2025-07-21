import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { generateUUID } from '../utils/common';
import { getAllMaterials } from '../data/MaterialSupplierMap';
import { unifiedDataService } from './UnifiedDataService';

/**
 * 库存数据服务
 */
export default class InventoryDataService {
  constructor() {
    this.isUpdating = ref(false);
    this.lastUpdateTime = ref('');
  }
  
  /**
   * 创建单个库存数据项
   * @param {Object} data 数据项
   * @returns {Object} 创建的数据项
   */
  createInventoryItem(data) {
    return {
      id: generateUUID(),
      material_id: data.materialCode,
      material_name: data.materialName,
      material_type: data.category,
      batch_no: data.batchNo,
      supplier: data.supplier,
      quantity: data.quantity || Math.floor(Math.random() * 1000) + 100,
      unit: data.unit || '个',
      warehouse: data.warehouse || '中央仓库',
      location: data.location || 'A区-' + Math.floor(Math.random() * 50 + 1) + '货架',
      status: data.status || '正常',
      quality: data.quality || '合格',
      arrival_date: data.arrivalDate || new Date().toISOString(),
      expiry_date: data.expiryDate,
      inspection_date: data.inspectionDate,
      remark: data.remark || '',
      created_at: new Date().toISOString(),
      project_id: data.project_id,
      project_name: data.project_name,
      baseline_id: data.baseline_id,
      baseline_name: data.baseline_name
    };
  }
  
  /**
   * 保存库存数据
   * @param {Array} data 数据
   * @param {boolean} clearExisting 是否清除现有数据
   * @returns {boolean} 是否成功
   */
  saveInventoryData(data, clearExisting = false) {
    try {
      // 获取现有数据
      let existingData = [];
      if (!clearExisting) {
        existingData = JSON.parse(localStorage.getItem('inventory_data') || '[]');
      }
      
      // 合并数据
      const mergedData = [...existingData, ...data];
      
      // 保存到本地存储
      localStorage.setItem('inventory_data', JSON.stringify(mergedData));
      
      return true;
    } catch (error) {
      console.error('保存库存数据失败:', error);
      return false;
    }
  }
  
  /**
   * 批量创建库存数据
   * @param {number} count 创建数量
   * @param {boolean} clearExisting 是否清除现有数据
   * @param {Object} options 额外选项，包括项目数据和基线数据
   * @returns {Array} 创建的数据
   */
  createBatchInventoryData(count = 20, clearExisting = false, options = {}) {
    if (this.isUpdating.value) {
      ElMessage.warning('数据更新正在进行中，请稍后再试');
      return [];
    }
    
    try {
      this.isUpdating.value = true;
      console.log(`开始生成${count}条库存数据...`);
      
      const inventoryItems = [];
      
      // 从物料供应商映射中获取数据
      const allMaterials = getAllMaterials();
      if (!allMaterials || allMaterials.length === 0) {
        throw new Error('无法获取物料数据');
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
      
      // 仓库列表
      const warehouses = ['中央仓库', '东区仓库', '西区仓库', '北区仓库', '南区仓库'];
      
      // 生成数据
      for (let i = 0; i < count; i++) {
        // 从物料-供应商映射中选择
        const materialInfo = allMaterials[i % allMaterials.length];
        const materialName = materialInfo.name;
        const category = materialInfo.category;
        
        // 生成物料编码
        const materialCode = `${materialInfo.code_prefix}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        
        // 获取对应的供应商
        const suppliersList = materialInfo.suppliers || [];
        const supplier = suppliersList.length > 0 
          ? suppliersList[Math.floor(Math.random() * suppliersList.length)] 
          : '未知供应商';
        
        // 生成批次号
        const today = new Date();
        const batchNo = `${materialInfo.code_prefix}B-${today.getFullYear().toString().substr(2)}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        
        // 随机选择一个项目和基线
        const selectedProject = updatedProjectData.length > 0 
          ? updatedProjectData[Math.floor(Math.random() * updatedProjectData.length)]
          : null;
          
        const projectId = selectedProject ? selectedProject.project_id : `X${1000 + Math.floor(Math.random() * 9000)}`;
        const projectName = selectedProject ? selectedProject.project_name : `项目${projectId}`;
        
        // 如果项目有关联的基线，使用该基线，否则随机选择一个
        const baselineId = selectedProject ? selectedProject.baseline_id : 
          (updatedBaselineData.length > 0 ? updatedBaselineData[Math.floor(Math.random() * updatedBaselineData.length)].baseline_id : `I${1000 + Math.floor(Math.random() * 9000)}`);
        
        const baselineName = selectedProject ? selectedProject.baseline_name :
          (updatedBaselineData.find(b => b.baseline_id === baselineId)?.baseline_name || `基线设计${baselineId}`);
        
        // 随机生成到货日期（过去30天内）
        const arrivalDate = new Date();
        arrivalDate.setDate(arrivalDate.getDate() - Math.floor(Math.random() * 30));
        
        // 随机生成过期日期（未来1-2年）
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + Math.floor(Math.random() * 2) + 1);
        
        // 随机生成检验日期（到货后1-3天）
        const inspectionDate = new Date(arrivalDate.getTime());
        inspectionDate.setDate(inspectionDate.getDate() + Math.floor(Math.random() * 3) + 1);
        
        // 随机选择仓库
        const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
        
        // 随机生成库位
        const location = `${warehouse.charAt(0)}区-${Math.floor(Math.random() * 50) + 1}货架-${Math.floor(Math.random() * 10) + 1}层`;
        
        // 随机生成数量
        const quantity = Math.floor(Math.random() * 1000) + 100;
        
        // 随机生成质量状态
        const quality = Math.random() > 0.15 ? '合格' : '待检';
        
        // 创建库存数据项
        const inventoryItem = this.createInventoryItem({
          materialCode,
          materialName,
          category,
          batchNo,
          supplier,
          quantity,
          unit: materialInfo.unit || '个',
          warehouse,
          location,
          status: '正常',
          quality,
          arrivalDate: arrivalDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
          inspectionDate: inspectionDate.toISOString(),
          // 添加项目ID和项目名称
          project_id: projectId,
          project_name: projectName,
          // 添加基线信息
          baseline_id: baselineId,
          baseline_name: baselineName
        });
        
        inventoryItems.push(inventoryItem);
      }
      
      // 保存数据
      const saveResult = this.saveInventoryData(inventoryItems, clearExisting);
      
      if (saveResult) {
        console.log(`成功生成${inventoryItems.length}条库存数据`);
        this.lastUpdateTime.value = new Date().toLocaleString();
        ElMessage.success(`成功生成${inventoryItems.length}条库存数据`);
      } else {
        console.error('保存库存数据失败');
        ElMessage.error('保存库存数据失败');
      }
      
      this.isUpdating.value = false;
      return inventoryItems;
    } catch (error) {
      console.error('生成库存数据失败:', error);
      ElMessage.error(`生成库存数据失败: ${error.message}`);
      this.isUpdating.value = false;
      return [];
    }
  }
} 