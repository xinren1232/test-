/**
 * 系统数据更新服务
 * 集中管理所有数据生成和更新操作
 */

import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import unifiedDataService from './UnifiedDataService.js';
import projectBaselineService from './ProjectBaselineService.js';
import { STORAGE_KEYS, FIELD_MAPPINGS } from './UnifiedDataDefinition.js';
import {
  getAllMaterials, 
  getRandomSupplierForMaterial,
  getSuppliersForMaterial
} from '../data/MaterialSupplierMap.js';
import {
  calculateShelfLife,
  calculateExpiryDate as materialCalculateExpiryDate
} from '../data/MaterialShelfLifeRules.js';
import { debugLocalStorage } from '../utils/debug.js';
import { v4 as uuidv4 } from 'uuid';
import { 
  getMaterialCode, 
  initializeMaterialCodeMap, 
  getMaterialInfoByCode,
  isCodeMapInitialized
} from '../data/MaterialCodeMap.js';
import batchManager from './BatchManager.js';
import api from '../api/ApiClient.js';

// 项目-基线映射关系（遵循规则文档中的要求）
// 兼容性保留，实际使用时应通过ProjectBaselineService获取
export const PROJECT_BASELINE_MAP = {
  "X6827": "I6789",
  "S665LN": "I6789",
  "KI4K": "I6789",
  "X6828": "I6789",
  "X6831": "I6788",
  "KI5K": "I6788", 
  "KI3K": "I6788",
  "S662LN": "I6787",
  "S663LN": "I6787",
  "S664LN": "I6787"
};

// 物料不良现象映射表
export const MATERIAL_DEFECT_MAP = {
  // 结构件类
  "电池盖": ["划伤", "变形", "破裂", "起鼓", "色差", "尺寸异常"],
  "中框": ["变形", "破裂", "掉漆", "尺寸异常"],
  "手机卡托": ["注塑不良", "尺寸异常", "断裂", "毛刺"],
  "侧键": ["脱落", "卡键", "尺寸异常", "松动"],
  "装饰件": ["掉色", "偏位", "脱落"],
  
  // 显示与光学类
  "LCD显示屏": ["漏光", "暗点", "偏色", "亮晶"],
  "OLED显示屏": ["闪屏", "mura", "亮点", "亮线"],
  "摄像头(CAM)": ["刮花", "底座破裂", "脏污", "无法拍照"],
  
  // 电池与充电类
  "电池": ["起鼓", "鼓包", "漏液", "电压不稳定"],
  "充电器": ["无法充电", "外壳破裂", "输出功率异常", "发热异常"],
  
  // 声学与音频类
  "喇叭": ["无声", "杂音", "音量小", "破裂"],
  "听筒": ["无声", "杂音", "音量小", "破裂"],
  
  // 包装与辅料类
  "保护套": ["尺寸偏差", "发黄", "开孔错位", "模具压痕"],
  "标签": ["脱落", "错印", "logo错误", "尺寸异常"],
  "包装盒": ["破损", "logo错误", "错印"]
};

// 缓存每种物料的不良率，确保同一物料的不良率一致
// 注意：由于我们修改了getDefectRateForMaterial方法，现在每次调用都会生成唯一的不良率
// 所以这个Map主要用于批次内部的一致性，而不是跨批次的一致性
const materialDefectRateMap = new Map();

// 数据匹配规则常量定义
export const DATA_RULES = {
  // 项目-基线关系规则
  PROJECT_BASELINE_RULES: {
    'I6789': ['X6827', 'S665LN', 'KI4K', 'X6828'],
    'I6788': ['X6831', 'KI5K', 'KI3K'],
    'I6787': ['S662LN', 'S663LN', 'S664LN']
  },
  
  // 工厂-仓库关系规则
  FACTORY_WAREHOUSE_RULES: {
    '重庆工厂': ['重庆库存', '中央库存'], // 重庆工厂可以使用重庆库存或中央库存
    '深圳工厂': '深圳库存', // 修改为深圳库存
    '南昌工厂': '中央库存', // 修改为中央库存
    '宜宾工厂': '中央库存'  // 修改为中央库存
  },
  
  // 批次号规则
  BATCH_NO_RULES: {
    MIN: 100000,
    MAX: 999999,
    FORMAT: '6位数字，范围100000-999999'
  },
  
  // 物料编码规则
  MATERIAL_CODE_RULES: {
    PREFIX: 'M',
    DIGIT_MIN: 4,
    DIGIT_MAX: 6,
    FORMAT: 'M+4-6位数字'
  },
  
  // 测试记录规则
  TEST_RECORD_RULES: {
    MIN_PER_BATCH: 5,
    MAX_PER_BATCH: 8,
    PASS_RATE: 0.92, // 92%合格率
    FORMAT: '每个物料批次需要5-8条历史测试记录'
  },
  
  // 全局禁止行为
  GLOBAL_PROHIBITIONS: [
    '同项目后不同项目ID不能出现相同物料批次',
    '相同物料+相同批次在不同项目中出现不同供应商',
    '日期范围在2024-01-01至2025-05-31范围'
  ],
  
  // 库存页面禁止
  INVENTORY_PROHIBITIONS: [
    '同工厂的同物料必须使用同一批次',
    '重庆工厂不使用深圳库存',
    '状态分布需满足正常70%/风险20%/冻结10%±5%'
  ],
  
  // 测试页面禁止
  TEST_PROHIBITIONS: [
    '合格记录中出现缺陷描述',
    '测试合格率需要大于90%±2%',
    '物料批次测试记录少于5条'
  ],
  
  // 上线页面禁止
  ONLINE_PROHIBITIONS: [
    '缺陷率超过5%的记录出现正常描述',
    '不良率分布需满足5%,80%±5%,20%±5%',
    '物料批次上线记录少于5条',
    '工厂信息与合库信息不一致'
  ]
};

/**
 * 系统数据更新服务
 * 负责更新模拟数据
 */
class SystemDataUpdater {
  constructor() {
    // 初始化更新时间
    this.lastUpdateTime = ref(null);
    
    // 初始化更新状态标志
    this.isUpdating = ref(false);
    
    // 初始化物料编码映射，确保物料编码一致性
    this.ensureCodeMapInitialized();
  }
  
  /**
   * 优化：推送数据到AI助手后端 - 增强数据同步可靠性
   */
  async pushDataToAssistant() {
    console.log('🚀 开始推送数据到AI助手服务...');

    try {
      // 1. 数据准备和验证
      const dataToPush = await this.prepareDataForSync();
      if (!dataToPush) {
        throw new Error('数据准备失败，无有效数据可同步');
      }

      // 2. 数据完整性检查
      const integrityCheck = this.validateDataIntegrity(dataToPush);
      if (!integrityCheck.valid) {
        console.warn('⚠️ 数据完整性检查失败:', integrityCheck.errors);
        // 继续推送，但记录警告
      }

      // 3. 推送数据并验证
      const syncResult = await this.performDataSync(dataToPush);

      // 4. 后端数据验证
      const verificationResult = await this.verifyBackendData(dataToPush);

      if (syncResult.success && verificationResult.verified) {
        console.log('✅ 数据同步成功并验证通过');
        ElMessage.success(`问答助手数据已同步！(库存:${dataToPush.inventory.length}, 检验:${dataToPush.inspection.length}, 生产:${dataToPush.production.length})`);
        return { success: true, verified: true };
      } else {
        throw new Error(`数据同步验证失败: ${verificationResult.message || '未知错误'}`);
      }

    } catch (error) {
      console.error('❌ 数据同步失败:', error);
      ElMessage.error(`问答助手数据同步失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 准备同步数据
   */
  async prepareDataForSync() {
    const inventory = unifiedDataService.getInventoryData();
    const inspection = unifiedDataService.getLabData();
    const production = unifiedDataService.getOnlineData();

    // 数据清理和标准化
    const cleanedData = {
      inventory: this.cleanInventoryData(inventory),
      inspection: this.cleanInspectionData(inspection),
      production: this.cleanProductionData(production)
    };

    console.log(`📊 准备同步数据: 库存 ${cleanedData.inventory.length} 条, 检验 ${cleanedData.inspection.length} 条, 生产 ${cleanedData.production.length} 条`);

    return cleanedData;
  }

  /**
   * 清理库存数据
   */
  cleanInventoryData(data) {
    if (!Array.isArray(data)) return [];

    return data.map(item => ({
      id: item.id,
      materialName: item.materialName,
      materialCode: item.materialCode,
      batchNo: item.batchNo,
      supplier: item.supplier,
      quantity: item.quantity,
      status: item.status,
      warehouse: item.warehouse,
      factory: item.factory,
      projectId: item.projectId,
      baselineId: item.baselineId,
      inboundTime: item.inboundTime,
      lastUpdateTime: item.lastUpdateTime
    }));
  }

  /**
   * 清理检验数据
   */
  cleanInspectionData(data) {
    if (!Array.isArray(data)) return [];

    return data.map(item => ({
      id: item.id,
      materialName: item.materialName || item.material_name,
      batchNo: item.batchNo || item.batch_no,
      supplier: item.supplier,
      testResult: item.testResult || item.test_result,
      testDate: item.testDate || item.test_date,
      projectId: item.projectId || item.project_id,
      defectDescription: item.defectDescription || item.defect_description
    }));
  }

  /**
   * 清理生产数据
   */
  cleanProductionData(data) {
    if (!Array.isArray(data)) return [];

    return data.map(item => ({
      id: item.id,
      materialName: item.materialName,
      materialCode: item.materialCode,
      batchNo: item.batchNo,
      supplier: item.supplier,
      factory: item.factory,
      onlineTime: item.onlineTime || item.useTime,
      defectRate: item.defectRate || item.defect_rate,
      defect: item.defect,
      projectId: item.projectId || item.project_id,
      baselineId: item.baselineId || item.baseline_id
    }));
  }

  /**
   * 验证数据完整性
   */
  validateDataIntegrity(data) {
    const errors = [];

    // 检查数据结构
    if (!data || typeof data !== 'object') {
      errors.push('数据不是有效对象');
      return { valid: false, errors };
    }

    // 检查必要字段
    const requiredFields = ['inventory', 'inspection', 'production'];
    for (const field of requiredFields) {
      if (!Array.isArray(data[field])) {
        errors.push(`${field} 不是有效数组`);
      }
    }

    // 检查数据内容
    if (data.inventory && data.inventory.length > 0) {
      const sample = data.inventory[0];
      const requiredInventoryFields = ['materialName', 'batchNo', 'supplier'];
      for (const field of requiredInventoryFields) {
        if (!sample[field]) {
          errors.push(`库存数据缺少必要字段: ${field}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * 执行数据同步
   */
  async performDataSync(dataToPush) {
    console.log('📤 执行数据同步...');

    // 计算数据大小
    const dataSize = JSON.stringify(dataToPush).length;
    console.log(`📊 数据大小: ${(dataSize / 1024 / 1024).toFixed(2)} MB`);

    // 如果数据过大，使用分批推送
    if (dataSize > 10 * 1024 * 1024) { // 超过10MB
      console.log('📦 数据过大，使用分批推送...');
      return await this.performBatchSync(dataToPush);
    }

    // 标准同步
    try {
      const result = await api.post('/assistant/update-data', dataToPush, {
        headers: {
          'X-Sync-Timestamp': new Date().toISOString(),
          'X-Data-Version': this.generateDataVersion(dataToPush)
        },
        timeout: 60000 // 60秒超时
      });

      console.log('✅ 标准同步成功:', result);
      return result;
    } catch (error) {
      console.log('⚠️ 标准同步失败，尝试直接连接:', error.message);
      return await this.performDirectSync(dataToPush);
    }
  }

  /**
   * 直接连接后端同步
   */
  async performDirectSync(dataToPush) {
    try {
      console.log('🔗 使用直接后端连接...');

      // 使用AbortController来处理超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时

      const response = await fetch('http://localhost:3001/api/assistant/update-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sync-Timestamp': new Date().toISOString(),
          'X-Data-Version': this.generateDataVersion(dataToPush)
        },
        body: JSON.stringify(dataToPush),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ 直接同步成功:', result);
      return { success: true, ...result };

    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ 直接同步超时');
        throw new Error('请求超时，请检查网络连接或后端服务状态');
      }
      console.error('❌ 直接同步失败:', error);
      throw error;
    }
  }

  /**
   * 分批同步大数据
   */
  async performBatchSync(dataToPush) {
    console.log('📦 开始分批同步...');

    const batchSize = 100; // 每批100条记录
    const results = [];

    // 分批同步库存数据
    if (dataToPush.inventory.length > 0) {
      const inventoryBatches = this.chunkArray(dataToPush.inventory, batchSize);
      for (let i = 0; i < inventoryBatches.length; i++) {
        const batch = inventoryBatches[i];
        console.log(`📦 同步库存批次 ${i + 1}/${inventoryBatches.length}: ${batch.length} 条记录`);

        const response = await fetch('/api/assistant/update-data-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'inventory', data: batch })
        });

        if (response.ok) {
          results.push(await response.json());
        }
      }
    }

    // 分批同步检验数据
    if (dataToPush.inspection.length > 0) {
      const inspectionBatches = this.chunkArray(dataToPush.inspection, batchSize);
      for (let i = 0; i < inspectionBatches.length; i++) {
        const batch = inspectionBatches[i];
        console.log(`📦 同步检验批次 ${i + 1}/${inspectionBatches.length}: ${batch.length} 条记录`);

        const response = await fetch('/api/assistant/update-data-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'inspection', data: batch })
        });

        if (response.ok) {
          results.push(await response.json());
        }
      }
    }

    // 分批同步生产数据
    if (dataToPush.production.length > 0) {
      const productionBatches = this.chunkArray(dataToPush.production, batchSize);
      for (let i = 0; i < productionBatches.length; i++) {
        const batch = productionBatches[i];
        console.log(`📦 同步生产批次 ${i + 1}/${productionBatches.length}: ${batch.length} 条记录`);

        const response = await fetch('/api/assistant/update-data-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'production', data: batch })
        });

        if (response.ok) {
          results.push(await response.json());
        }
      }
    }

    console.log('✅ 分批同步完成');
    return { success: true, batchResults: results };
  }

  /**
   * 验证后端数据
   */
  async verifyBackendData(expectedData) {
    try {
      console.log('🔍 验证后端数据...');
      console.log('📊 期望数据量:', {
        inventory: expectedData.inventory.length,
        inspection: expectedData.inspection.length,
        production: expectedData.production.length
      });

      // 直接调用数据库验证端点，而不是内存验证
      const response = await fetch('http://localhost:3001/api/assistant/verify-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expectedCounts: {
            inventory: expectedData.inventory.length,
            inspection: expectedData.inspection.length,
            production: expectedData.production.length
          }
        })
      });

      if (!response.ok) {
        throw new Error(`验证请求失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🔍 后端数据验证结果:', result);

      // 如果验证失败，提供详细信息
      if (!result.verified) {
        console.error('❌ 数据验证详情:', result.checks);
      }

      return result;
    } catch (error) {
      console.error('❌ 后端数据验证失败:', error);
      return { verified: false, message: error.message };
    }
  }

  /**
   * 生成数据版本号
   */
  generateDataVersion(data) {
    const timestamp = Date.now();
    const dataHash = this.simpleHash(JSON.stringify(data));
    return `${timestamp}-${dataHash}`;
  }

  /**
   * 简单哈希函数
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 数组分块工具函数
   */
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * 确保物料编码映射已初始化
   */
  async ensureCodeMapInitialized() {
    if (!isCodeMapInitialized()) {
      console.log('初始化物料编码映射...');
      await initializeMaterialCodeMap();
    }
  }

  /**
   * 更新上线数据
   * @param {Object} options 选项
   * @returns {Promise<Object>} 更新结果
   */
  async updateOnlineData(options = {}) {
    try {
      console.log('开始生成上线数据...');
      
      // 获取选项
      const clearExisting = options.clearExisting || false;
      const count = options.count || 50;
      const ensureAllProjects = options.ensureAllProjects || false;
      
      // 确保批次管理器已初始化
      if (!batchManager.initialized) {
        batchManager.initialize();
      }
      
      // 获取现有数据
      let existingData = unifiedDataService.getOnlineData();
      
      // 如果需要清除现有数据，则清空
      if (clearExisting) {
        existingData = [];
      }
      
      // 生成数据
      const onlineData = [...existingData];
      
      // 获取当前的库存数据，以复用批次
      const inventoryData = unifiedDataService.getInventoryData();
      if (!inventoryData || inventoryData.length === 0) {
        console.warn('没有找到库存数据，无法生成上线数据');
        throw new Error('缺少库存数据，请先生成库存数据');
      }
      
      // 获取测试数据，以获取项目-基线关系
      const labData = unifiedDataService.getLabData();
      if (!labData || labData.length === 0) {
        console.warn('没有找到测试数据，将使用默认项目-基线关系');
        // 不自动生成测试数据，使用默认配置继续
      }
      
      // 从测试数据中提取批次-项目映射关系
      const batchProjectMap = new Map();
      
      // 从测试数据中提取批次-项目关系
      const testData = unifiedDataService.getLabData();
      for (const test of testData) {
        const projectId = test.projectId || test.project_id;
        const batchNo = test.batchNo || test.batch_no;
        
        if (projectId && batchNo) {
          batchProjectMap.set(batchNo, projectId);
        }
      }
      
      console.log(`从测试数据中提取的批次-项目映射: ${batchProjectMap.size}个批次`);
      
      // 确保所有10个项目都有数据
      const requiredProjects = [
        "X6827", "S665LN", "KI4K", "X6828", 
        "X6831", "KI5K", "KI3K", 
        "S662LN", "S663LN", "S664LN"
      ];
      
      if (ensureAllProjects) {
        // 确保所有10个项目都有数据
        // 计算每个项目需要生成的记录数
        const countPerProject = Math.max(2, Math.floor(count / requiredProjects.length));
        
        // 为每个项目查找对应的批次
        for (const projectId of requiredProjects) {
          // 查找项目对应的批次
          const projectBatches = [];
          for (const [batchNo, batchProjectId] of batchProjectMap.entries()) {
            if (batchProjectId === projectId) {
              // 查找批次对应的库存记录
              const batchInventory = inventoryData.find(inv => inv.batchNo === batchNo);
              if (batchInventory) {
                projectBatches.push(batchInventory);
              }
            }
          }
          
          // 如果没有找到项目对应的批次，随机分配一些批次
          if (projectBatches.length === 0) {
            console.warn(`项目 ${projectId} 没有关联的批次，随机分配批次`);
            
            // 随机选择一些批次
            const randomBatchCount = Math.floor(Math.random() * 3) + 1; // 1-3个批次
            for (let i = 0; i < randomBatchCount; i++) {
              const randomInventoryIndex = Math.floor(Math.random() * inventoryData.length);
              const randomInventory = inventoryData[randomInventoryIndex];
              projectBatches.push(randomInventory);
              
              // 更新批次-项目映射
              batchProjectMap.set(randomInventory.batchNo, projectId);
            }
          }
          
          // 为每个批次生成上线记录
          for (const batch of projectBatches) {
            const materialName = batch.materialName;
            const batchNo = batch.batchNo;
            const supplier = batch.supplier;
            
            // 获取物料编码
            const materialCode = this.generateMaterialCode(materialName, supplier);
        
        // 获取关联的基线
            const baseline = this.getBaselineByProject(projectId);
        const baselineId = baseline ? baseline.baseline_id : '';
        const baselineName = baseline ? baseline.baseline_name : '';
        
            // 获取不良率
            const defectRate = this.getDefectRateForMaterial(materialName, batchNo);
            
            // 为每个批次生成countPerProject条记录
            for (let i = 0; i < countPerProject; i++) {
              // 根据不良率决定状态和不良现象
              let finalStatus = '良好';
              let defect = '';
              
              // 只有当不良率大于0时，才可能生成不良记录
              if (defectRate > 0) {
                // 增加不良概率，确保更多记录显示为不良
                const defectProbability = Math.max(0.5, defectRate / 100);
                const isDefective = Math.random() < defectProbability;
                
                if (isDefective) {
                  finalStatus = '不良';
                }
                
                // 只要有不良率，就生成不良现象
                const defectTypes = this.getDefectsByMaterial(materialName);
                if (defectTypes.length > 0) {
                  // 随机选择1-2个不良现象
                  const defectCount = Math.floor(Math.random() * 2) + 1;
                  const selectedDefects = [];
                  
                  for (let j = 0; j < defectCount; j++) {
                    const randomDefect = defectTypes[Math.floor(Math.random() * defectTypes.length)];
                    if (!selectedDefects.includes(randomDefect)) {
                      selectedDefects.push(randomDefect);
                    }
                  }
                  
                  defect = selectedDefects.join('，');
                } else {
                  defect = '未知不良';
                }
              }
              
              // 随机选择工厂，但确保与库存批次的工厂一致
              const factory = batch.factory || this.getRandomFactory();
              
              // 生成上线记录
              const onlineRecord = {
                id: this.generateId(),
                materialName,
                materialCode,
                batchNo,
                supplier,
                projectName: `${projectId}项目`,
                projectId: projectId,
                baselineId: baselineId,
                baselineName: baselineName,
                onlineTime: this.generateRandomTime(),
                onlineStatus: finalStatus,
                defectRate: defectRate.toFixed(1),
                defect: defect,
                inspectionDate: this.generateRandomTime(30),
                factory: factory,
                inspector: `检验员${Math.floor(Math.random() * 10) + 1}`,
                status: finalStatus
              };
              
              onlineData.push(onlineRecord);
            }
          }
        }
      } else {
        // 原有的随机生成逻辑，但使用库存中的批次
        const batchesToUse = [];
        
        // 随机选择一些批次
        const batchCount = Math.min(count, inventoryData.length);
        
        // 创建批次索引数组
        const batchIndices = Array.from({ length: inventoryData.length }, (_, i) => i);
        
        // 随机打乱索引数组
        for (let i = batchIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [batchIndices[i], batchIndices[j]] = [batchIndices[j], batchIndices[i]];
        }
        
        // 选择前batchCount个批次
        for (let i = 0; i < batchCount; i++) {
          batchesToUse.push(inventoryData[batchIndices[i]]);
        }
        
        // 为每个批次生成上线记录
        for (const batch of batchesToUse) {
          const materialName = batch.materialName;
          const batchNo = batch.batchNo;
          const supplier = batch.supplier;
          
          // 获取物料编码
          const materialCode = this.generateMaterialCode(materialName, supplier);
          
          // 获取批次对应的项目
          let projectId = batchProjectMap.get(batchNo);
          
          // 如果没有找到对应的项目，随机分配一个
          if (!projectId) {
            projectId = requiredProjects[Math.floor(Math.random() * requiredProjects.length)];
          }
          
          // 获取关联的基线
          const baseline = this.getBaselineByProject(projectId);
          const baselineId = baseline ? baseline.baseline_id : '';
          const baselineName = baseline ? baseline.baseline_name : '';
          
          // 获取不良率
          const defectRate = this.getDefectRateForMaterial(materialName, batchNo);
          
          // 根据不良率决定状态和不良现象
          let finalStatus = '良好';
          let defect = '';
          
          // 只有当不良率大于0时，才可能生成不良记录
          if (defectRate > 0) {
            // 增加不良概率，确保更多记录显示为不良
            const defectProbability = Math.max(0.5, defectRate / 100);
            const isDefective = Math.random() < defectProbability;
            
            if (isDefective) {
              finalStatus = '不良';
            }
            
            // 只要有不良率，就生成不良现象
            const defectTypes = this.getDefectsByMaterial(materialName);
            if (defectTypes.length > 0) {
              // 随机选择1-2个不良现象
              const defectCount = Math.floor(Math.random() * 2) + 1;
              const selectedDefects = [];
              
              for (let j = 0; j < defectCount; j++) {
                const randomDefect = defectTypes[Math.floor(Math.random() * defectTypes.length)];
                if (!selectedDefects.includes(randomDefect)) {
                  selectedDefects.push(randomDefect);
                }
              }
              
              defect = selectedDefects.join('，');
            } else {
              defect = '未知不良';
            }
          }
          
          // 随机选择工厂，但确保与库存批次的工厂一致
          const factory = batch.factory || this.getRandomFactory();
          
          // 生成上线记录
        const onlineRecord = {
            id: this.generateId(),
            materialName,
            materialCode,
            batchNo,
          supplier,
            projectName: `${projectId}项目`,
            projectId: projectId,
            baselineId: baselineId,
            baselineName: baselineName,
            onlineTime: this.generateRandomTime(),
            onlineStatus: finalStatus,
            defectRate: defectRate.toFixed(1),
            defect: defect,
            inspectionDate: this.generateRandomTime(30),
            factory: factory,
            inspector: `检验员${Math.floor(Math.random() * 10) + 1}`,
            status: finalStatus
        };
        
        onlineData.push(onlineRecord);
        }
      }
      
      // 保存数据
      unifiedDataService.saveOnlineData(onlineData);
    
    return {
        success: true,
        message: `成功生成 ${onlineData.length - existingData.length} 条上线数据`,
        data: onlineData
      };
    } catch (error) {
      console.error('生成上线数据失败:', error);
      return { success: false, message: `生成上线数据失败: ${error.message}` };
    }
  }
  
  /**
   * 获取物料的不良现象
   * @param {string} materialName 物料名称
   * @returns {Array} 不良现象数组
   */
  getDefectsByMaterial(materialName) {
    // 尝试精确匹配
    if (MATERIAL_DEFECT_MAP[materialName]) {
      const defects = MATERIAL_DEFECT_MAP[materialName];
      // 随机选择1-3个不良现象
      const count = Math.floor(1 + Math.random() * 3);
      const selectedDefects = [];
      
      for (let i = 0; i < count; i++) {
        const defect = defects[Math.floor(Math.random() * defects.length)];
        if (!selectedDefects.includes(defect)) {
          selectedDefects.push(defect);
        }
      }
      
      return selectedDefects;
    }
    
    // 尝试部分匹配
    for (const [key, defects] of Object.entries(MATERIAL_DEFECT_MAP)) {
      if (materialName.includes(key) || key.includes(materialName)) {
        const count = Math.floor(1 + Math.random() * 2);
        const selectedDefects = [];
        
        for (let i = 0; i < count; i++) {
          const defect = defects[Math.floor(Math.random() * defects.length)];
          if (!selectedDefects.includes(defect)) {
            selectedDefects.push(defect);
          }
        }
        
        return selectedDefects;
      }
    }
    
    // 如果没有匹配，返回通用不良现象
    const genericDefects = ["外观不良", "尺寸超差", "材质问题", "标识错误"];
    const count = Math.floor(1 + Math.random() * 2);
    const selectedDefects = [];
    
    for (let i = 0; i < count; i++) {
      const defect = genericDefects[Math.floor(Math.random() * genericDefects.length)];
      if (!selectedDefects.includes(defect)) {
        selectedDefects.push(defect);
      }
    }
    
    return selectedDefects;
  }
  
  /**
   * 获取物料的不良率
   * @param {string} materialName 物料名称
   * @param {string} batchNo 批次号（为了兼容旧代码，但不再使用）
   * @returns {number} 不良率
   */
  getDefectRateForMaterial(materialName, batchNo = null) {
    // 按物料名称缓存不良率，不再使用批次
    const key = materialName;
    
    // 关键问题：materialDefectRateMap.clear()方法执行后，缓存被清空，
    // 但是对于同一个materialName，只会生成一次不良率，导致所有批次使用相同的不良率
    // 解决方案：添加随机数来确保每次生成不同的不良率
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const uniqueKey = `${key}_${randomSuffix}`;
    
    // 生成新的不良率
    let defectRate;
    
    // 修改分布：确保有一定比例的物料不良率为0（正常物料）
    const rand = Math.random();
    
    // 30%的物料不良率为0（完全正常）
    if (rand < 0.3) {
      defectRate = 0;
    } 
    // 60%的物料不良率在0.1%-5%之间（轻微不良）
    else if (rand < 0.9) { // 0.3 + 0.6 = 0.9
      defectRate = Math.random() * 4.9 + 0.1; // 0.1% - 5%
    } 
    // 10%的物料不良率≥5%（严重不良）
    else {
      defectRate = Math.random() * 10 + 5; // 5% - 15%
    }
    
    // 保留一位小数
    defectRate = parseFloat(defectRate.toFixed(1));
    
    // 缓存结果 - 仅用于批次内一致性，不再跨批次使用
    materialDefectRateMap.set(uniqueKey, defectRate);
    console.log(`物料[${materialName}]不良率: ${defectRate}%`);
    
    return defectRate;
  }
  
  /**
   * 获取物料的不良率（兼容旧方法名）
   * @param {string} materialName 物料名称
   * @param {string} batchNo 批次号（不再使用）
   * @returns {number} 不良率
   */
  getDefectRateForBatch(materialName, batchNo) {
    return this.getDefectRateForMaterial(materialName, batchNo);
  }
  
  /**
   * 生成物料编码
   * @param {string} materialName 物料名称
   * @param {string} supplier 供应商名称
   * @returns {string} 物料编码
   */
  generateMaterialCode(materialName, supplier) {
    // 使用MaterialCodeMap确保物料编码一致性
    return getMaterialCode(materialName, supplier);
  }
  
  /**
   * 生成批次号
   * @returns {number} 批次号
   */
  generateBatchNo() {
    // 格式: 6位数字 (100000-999999)
    return Math.floor(Math.random() * (DATA_RULES.BATCH_NO_RULES.MAX - DATA_RULES.BATCH_NO_RULES.MIN + 1)) + DATA_RULES.BATCH_NO_RULES.MIN;
  }
  
  /**
   * 生成随机时间
   * @param {number} daysBack 往前推多少天
   * @returns {string} ISO格式的时间字符串
   */
  generateRandomTime(daysBack = 7) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    return date.toISOString();
  }

  /**
   * 生成实验室测试数据
   * @param {number} count 生成数量（已弃用，现在固定生成135个批次 x 3条记录/批次 = 405条数据）
   * @param {boolean} clearExisting 是否清除现有数据
   * @param {Object} options 选项
   * @returns {Promise<Object>} 生成结果
   */
  async generateLabData(count = 405, clearExisting = false, options = {}) {
    try {
      console.log('开始生成实验室测试数据...');
      
      // 确保批次管理器已初始化
      if (!batchManager.initialized) {
        batchManager.initialize();
      }
      
      // 获取现有数据
      let existingData = unifiedDataService.getLabData();
      
      // 如果需要清除现有数据，则清空
      if (clearExisting) {
        existingData = [];
      }
      
      // 生成数据
      const labData = [...existingData];
      
      // 检查是否为最小模式
      const minimalMode = options.minimalMode || false;
      const recordsPerBatch = options.recordsPerBatch || 3; // 默认每个批次3条测试记录
      
      if (minimalMode) {
        console.log(`紧急最小模式：每个批次 × ${recordsPerBatch}条测试记录`);
      } else {
        console.log(`按照规则生成测试数据: 每个批次 × 3条测试记录`);
      }
      
      // 获取当前的库存数据，以复用批次
      const inventoryData = unifiedDataService.getInventoryData();
      if (!inventoryData || inventoryData.length === 0) {
        console.warn('没有找到库存数据，无法生成测试数据');
        throw new Error('缺少库存数据，请先在"管理工具"中生成库存数据');
      }
      
      // 使用最新的库存数据
      const inventoryBatches = unifiedDataService.getInventoryData();
      console.log(`找到${inventoryBatches.length}条库存数据作为批次基础`);
      
      // 确保所有10个项目都有数据
      const requiredProjects = [
        "X6827", "S665LN", "KI4K", "X6828", 
        "X6831", "KI5K", "KI3K", 
        "S662LN", "S663LN", "S664LN"
      ];
      
      // 为项目-基线关系初始化映射
      const projectBaselineMapping = {};
      requiredProjects.forEach(projectId => {
        const baseline = this.getBaselineByProject(projectId);
        if (baseline) {
          projectBaselineMapping[projectId] = baseline.baseline_id;
        }
      });
      
      console.log('项目-基线映射关系:', projectBaselineMapping);
      
      // 为每个库存批次生成固定的测试记录
      let batchCount = 0;
      let totalRecords = 0;
      
      // 创建批次到项目的映射，确保同一批次在不同测试记录中使用相同的项目
      const batchProjectMap = new Map();
      
      // 首先为每个批次分配一个项目
      for (const batch of inventoryBatches) {
        const batchNo = batch.batchNo;
        
        // 如果批次已经分配了项目，则跳过
        if (batchProjectMap.has(batchNo)) {
          continue;
        }
        
        // 随机选择一个项目
        const projectId = requiredProjects[Math.floor(Math.random() * requiredProjects.length)];
        batchProjectMap.set(batchNo, projectId);
      }
      
      // 然后为每个批次生成测试记录
      for (const batch of inventoryBatches) {
        batchCount++;
        const materialName = batch.materialName;
        const batchNo = batch.batchNo;
        const materialType = batch.materialType || '电子元件';
        const supplier = batch.supplier;
        
        // 使用批次对应的项目
        const projectId = batchProjectMap.get(batchNo);
        
        // 生成测试记录
        const testRecords = this.generateTestRecords(
          materialName, 
          batchNo, 
          materialType, 
          supplier, 
          projectId, 
          recordsPerBatch
        );
        
        // 添加到数据中
        labData.push(...testRecords);
        totalRecords += testRecords.length;
      }
      
      console.log(`总共生成了${totalRecords}条测试记录，涉及${batchCount}个批次`);
      
      // 保存数据
      unifiedDataService.saveLabData(labData);
      
      return {
        success: true,
        message: `成功生成 ${labData.length - existingData.length} 条实验室测试数据`,
        data: labData
      };
      } catch (error) {
      console.error('生成实验室测试数据失败:', error);
      return { success: false, message: `生成实验室测试数据失败: ${error.message}` };
    }
  }

  /**
   * 生成工厂上线数据
   * @param {number} count 生成数量（已弃用，现在固定生成135个批次 x 8条记录/批次 = 1080条数据）
   * @param {boolean} clearExisting 是否清除现有数据
   * @param {Object} options 选项
   * @returns {Promise<Object>} 生成结果
   */
  async generateFactoryData(count = 1080, clearExisting = false, options = {}) {
    try {
      console.log('开始生成工厂上线数据...');
      
      // 检查存储空间，如果空间不足则自动精简生成的数据量
      const storageInfo = await this.checkStorageQuota(1500); // 预估1.5MB
      console.log('存储空间检查结果:', storageInfo);
      
      // 获取现有数据
      let existingData = unifiedDataService.getOnlineData();
      
      // 如果需要清除现有数据，则清空
      if (clearExisting) {
        existingData = [];
      }
      
      // 生成数据
      const factoryData = [...existingData];
      
      // 检查是否为最小模式
      const minimalMode = options.minimalMode || false;
      const recordsPerBatch = options.recordsPerBatch || 8; // 默认每个批次8条上线记录
      
      if (minimalMode) {
        console.log(`紧急最小模式：每个批次 × ${recordsPerBatch}条上线记录`);
      } else {
        console.log(`按照规则生成上线数据: 每个批次 × 8条上线记录`);
      }
      
      // 获取当前的库存数据，以复用批次
      const inventoryData = unifiedDataService.getInventoryData();
      if (!inventoryData || inventoryData.length === 0) {
        console.warn('没有找到库存数据，无法生成上线数据');
        throw new Error('缺少库存数据，请先生成库存数据');
      }
      
      // 获取测试数据，以获取项目-基线关系
      const labData = unifiedDataService.getLabData();
      if (!labData || labData.length === 0) {
        console.warn('没有找到测试数据，将使用默认项目-基线关系');
        // 不自动生成测试数据，使用默认配置继续
      }
      
      // 从测试数据中提取批次-项目映射关系
      const batchProjectMap = new Map();
      
      // 从测试数据中提取批次-项目关系
      const testData = unifiedDataService.getLabData();
      for (const test of testData) {
        const projectId = test.projectId || test.project_id;
        const batchNo = test.batchNo || test.batch_no;
        
        if (projectId && batchNo) {
          batchProjectMap.set(batchNo, projectId);
        }
      }
      
      console.log(`从测试数据中提取的批次-项目映射: ${batchProjectMap.size}个批次`);
      
      // 确保所有10个项目都有数据
      const requiredProjects = [
        "X6827", "S665LN", "KI4K", "X6828", 
        "X6831", "KI5K", "KI3K", 
        "S662LN", "S663LN", "S664LN"
      ];
      
      // 为每个批次生成固定的上线记录
      let batchCount = 0;
      let totalRecords = 0;
      
      // 为每个库存批次生成上线数据
      for (const batch of inventoryData) {
        batchCount++;
        const materialName = batch.materialName;
        const batchNo = batch.batchNo;
        const supplier = batch.supplier;
        
        // 获取物料编码
        const materialCode = this.generateMaterialCode(materialName, supplier);
        
        // 获取批次对应的项目
        let projectId = batchProjectMap.get(batchNo);
        
        // 如果没有找到对应的项目，随机分配一个
        if (!projectId) {
          projectId = requiredProjects[Math.floor(Math.random() * requiredProjects.length)];
          console.warn(`批次 ${batchNo} 没有对应的项目，随机分配项目 ${projectId}`);
        }
        
        // 获取关联的基线
        const baseline = this.getBaselineByProject(projectId);
        const baselineId = baseline ? baseline.baseline_id : '';
        const baselineName = baseline ? baseline.baseline_name : '';
        
        // 获取不良率 - 确保同一批次的不良率一致
        const defectRate = this.getDefectRateForMaterial(materialName, batchNo);
        
        // 为每个批次生成8条上线记录
        for (let i = 0; i < 8; i++) {
          // 在循环内部为每一条记录独立生成不良率和不良现象
          const recordDefectRate = this.getDefectRateForMaterial(materialName);
          const defects = recordDefectRate > 0 ? this.getDefectsByMaterial(materialName) : [];

          const onlineTime = this.generateRandomDate(30); // 为每条记录生成独立的上线时间

          const onlineRecord = {
            id: this.generateId('ONLINE'),
            materialName,
            materialCode: this.generateMaterialCode(materialName, supplier),
            batchNo,
            supplier,
            factory: this.getRandomFactory(),
            line: `产线0${(i % 4) + 1}`,
            useTime: onlineTime, // 兼容旧字段
            onlineTime: onlineTime, // 确保新字段存在
            defectRate: recordDefectRate,
            defect_rate: recordDefectRate, // 兼容旧字段
            defect: defects.join(', '),
            project_id: projectId,
            projectId: projectId, // 兼容旧字段
            project_name: `${projectId}项目`,
            baseline_id: baselineId,
            baseline_name: baselineName,
            timestamp: new Date().toISOString()
          };
          factoryData.push(onlineRecord);
        }
      }
      
      console.log(`新生成了 ${factoryData.length - existingData.length} 条工厂上线数据。`);
      
      // 保存数据
      unifiedDataService.saveOnlineData(factoryData);
      
      return {
        success: true,
        message: `成功生成 ${factoryData.length - existingData.length} 条工厂上线数据`,
        data: factoryData
      };
    } catch (error) {
      console.error('生成工厂上线数据失败:', error);
      return { success: false, message: `生成工厂上线数据失败: ${error.message}` };
    }
  }

  /**
   * 生成库存数据
   * @param {number} count 生成数量（已弃用，现在固定生成15种物料 × 3个供应商 × 3个批次 = 135条数据）
   * @param {boolean} clearExisting 是否清除现有数据
   * @param {Object} options 选项
   * @returns {Promise<Object>} 生成结果
   */
  async generateInventoryData(count = 135, clearExisting = false, options = {}) {
      try {
    console.log('开始生成库存数据...');
    
    // 确保批次管理器已初始化
    if (!batchManager.initialized) {
      batchManager.initialize();
    }
    
    // 获取现有数据
    let existingData = unifiedDataService.getInventoryData();
    
    // 如果需要清除现有数据，则清空
    if (clearExisting) {
      existingData = [];
    }
    
    // 生成数据
      const inventoryData = [...existingData];
      
      // 获取所有15种物料
      const allMaterials = getAllMaterials();
      if (allMaterials.length < 15) {
        console.warn(`物料数量不足15种，当前只有${allMaterials.length}种，将使用可用的所有物料`);
      }
      
      // 检查是否为最小模式
      const minimalMode = options.minimalMode || false;
      const suppliersPerMaterial = options.suppliersPerMaterial || 3; // 默认每种物料3个供应商
      const batchesPerSupplier = options.batchesPerSupplier || 3; // 默认每个供应商3个批次
      
      if (minimalMode) {
        console.log(`紧急最小模式：每种物料 × ${suppliersPerMaterial}个供应商 × ${batchesPerSupplier}个批次`);
      } else {
        console.log(`按照规则生成库存数据: 15种物料 × 3个供应商 × 3个批次 = 135条记录`);
      }
      
      // 工厂列表
      const factories = ['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂'];
      
      // 仓库列表
      const warehouses = ['中央库存', '重庆库存', '深圳库存'];
      
      // 项目列表
      const projects = projectBaselineService.getProjectData().map(p => p.project_id);
      
      // 基线列表
      const baselines = projectBaselineService.getBaselineData().map(b => b.baseline_id);
      
      // 创建物料-供应商组合
      const materialSupplierPairs = [];
      
      // 确保使用足够的物料来生成132条记录
      const materialsToUse = allMaterials.slice(0, Math.min(15, allMaterials.length));
      
      // 为每种物料分配供应商
      for (const material of materialsToUse) {
        // 获取物料的供应商列表
        const suppliers = getSuppliersForMaterial(material.name);
        
        // 确保每个物料至少有足够的供应商
        if (suppliers.length < suppliersPerMaterial) {
          console.warn(`物料 ${material.name} 的供应商不足${suppliersPerMaterial}个，当前只有${suppliers.length}个，将使用可用的所有供应商`);
        }
        
        // 使用指定数量的供应商
        const suppliersToUse = suppliers.slice(0, suppliersPerMaterial);
        
        // 创建物料-供应商组合
        for (const supplier of suppliersToUse) {
          materialSupplierPairs.push({
            materialName: material.name,
            supplier: supplier,
            materialType: material.category || '未知类型'
          });
        }
      }
      
      console.log(`创建了${materialSupplierPairs.length}个物料-供应商组合`);
      
      // 生成批次号映射，确保每个物料-供应商组合有固定的批次号
      const batchNoMap = new Map();
      
      // 为每个物料-供应商组合生成批次
      for (const pair of materialSupplierPairs) {
        // 为每个组合生成指定数量的固定批次号
        const key = `${pair.materialName}_${pair.supplier}`;
        const batchNos = [];
        
        // 生成不同的批次号
        for (let i = 0; i < batchesPerSupplier; i++) {
          let batchNo;
          do {
            batchNo = this.generateBatchNo();
          } while (batchNos.includes(batchNo));
          
          batchNos.push(batchNo);
          
          // 生成物料编码（确保物料编码与物料名称一一对应）
          const materialCode = this.generateMaterialCode(pair.materialName, pair.supplier);
          
          // 随机选择工厂和仓库
        const factory = factories[Math.floor(Math.random() * factories.length)];
        
          // 根据工厂选择合适的仓库
          let warehouse;
          if (factory === '重庆工厂') {
            // 重庆工厂可以使用重庆库存或中央库存
            warehouse = Math.random() < 0.7 ? '重庆库存' : '中央库存';
          } else if (factory === '深圳工厂') {
            // 深圳工厂使用深圳库存
            warehouse = '深圳库存';
          } else {
            // 其他工厂使用中央库存
            warehouse = '中央库存';
          }
          
          // 随机选择项目和基线
          const projectIndex = Math.floor(Math.random() * projects.length);
          const projectId = projects[projectIndex];
          
          // 获取关联的基线
          const baseline = this.getBaselineByProject(projectId);
          const baselineId = baseline ? baseline.baseline_id : '';
          
          // 随机生成库存数量
          const quantity = Math.floor(Math.random() * 1000) + 100;
          
          // 随机分配状态，正常:风险:冻结 = 70%:20%:10%
          let status;
          const statusRand = Math.random();
          if (statusRand < 0.7) {
            status = '正常';
          } else if (statusRand < 0.9) {
            status = '风险';
          } else {
            status = '冻结';
          }
          
          // 生成入库时间和最后更新时间
          const inboundTime = this.generateRandomTime(30);
          const lastUpdateTime = this.generateRandomTime(7);
          
          // 计算到期时间 (入库日期 + 6到18个月)
          const inboundDate = new Date(inboundTime);
          const expiryDate = new Date(inboundDate);
          expiryDate.setMonth(inboundDate.getMonth() + Math.floor(Math.random() * 12) + 6);
          
          // 生成冻结原因（如果状态是冻结）
          let freezeReason = '';
          if (status === '冻结') {
            const reasons = [
              '质量异常，待检验',
              '文档不全，等待补充',
              '供应商资质问题',
              '参数偏差超标',
              '等待工程确认'
            ];
            freezeReason = reasons[Math.floor(Math.random() * reasons.length)];
          }
          
          // 创建库存记录
        const inventoryRecord = {
            id: this.generateId(),
            materialName: pair.materialName,
            materialCode,
            materialType: pair.materialType || '电子元件',
            batchNo,
            supplier: pair.supplier,
            quantity,
            status,
            warehouse,
            factory,
            inboundTime,
            lastUpdateTime,
            projectId,
            baselineId,
          expiryDate: expiryDate.toISOString(),
            freezeReason: freezeReason,
            freezeDate: status === '冻结' ? this.generateRandomTime(10) : null,
            notes: status === '冻结' ? freezeReason : ''
          };
          
          // 添加到库存数据
        inventoryData.push(inventoryRecord);
          
          // 将批次号与物料-供应商关联保存到批次管理器中
          batchManager.addBatchInfo(batchNo, pair.materialName, pair.supplier, materialCode);
      }
      
        // 保存批次号映射
        batchNoMap.set(key, batchNos);
      }
      
      console.log(`总共生成了${inventoryData.length - existingData.length}条库存数据`);
      
      // 保存库存数据
      unifiedDataService.saveInventoryData(inventoryData);
      
      // 返回结果
      return { 
        success: true,
        message: `成功生成${inventoryData.length - existingData.length}条新库存数据`,
        data: inventoryData
      };
    } catch (error) {
      console.error('生成库存数据失败:', error);
      return {
        success: false,
        message: `生成库存数据失败: ${error.message}`,
        error
      };
    }
  }

  /**
   * 检查localStorage存储配额是否足够
   * @param {number} estimatedSize 估计需要的存储空间(KB)
   * @returns {Object} 存储空间状态对象
   */
  async checkStorageQuota(estimatedSize) {
    try {
      // 获取当前已使用的存储空间
      let totalSize = 0;
      let itemCount = 0;
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length * 2 / 1024; // 近似计算KB
          itemCount++;
        }
      }
      
      // 尝试获取最大存储容量（不同浏览器支持不同）
      let maxSize = 5120; // 默认假设5MB
      
      try {
        // 测试最大容量
        if (navigator && navigator.storage && navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate();
          if (estimate && estimate.quota) {
            maxSize = estimate.quota / 1024; // 转换为KB
          }
        }
      } catch (e) {
        console.warn('无法获取存储配额信息，使用默认估计值', e);
      }
      
      // 保守估计，留出一定安全边界
      const safeMaxSize = Math.min(maxSize, 4000); // 最大4MB
      const usedSize = totalSize;
      const availableSize = Math.max(0, safeMaxSize - usedSize);
      
      console.log(`存储信息: 已使用=${usedSize.toFixed(2)}KB, 可用=${availableSize.toFixed(2)}KB, 估计最大=${safeMaxSize}KB, 项目数=${itemCount}`);
      console.log(`当前localStorage使用率: ${(usedSize / safeMaxSize * 100).toFixed(2)}%, 预计需要: ${estimatedSize}KB`);
      
      // 如果预计总大小超过限制的80%，返回false
      const hasEnoughSpace = (usedSize + estimatedSize) < (safeMaxSize * 0.8);
      const almostFull = (usedSize / safeMaxSize) > 0.7; // 已使用超过70%
      
      // 如果空间不足，尝试清理部分非关键数据
      if (!hasEnoughSpace || almostFull) {
        console.warn('存储空间紧张，尝试清理部分非关键数据...');
        
        // 清理可能的备份数据
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key) && 
              (key.includes('_backup') || 
               key.includes('_log') || 
               key.includes('_temp') || 
               key.includes('_old'))) {
            console.log(`清理非关键数据: ${key}`);
            localStorage.removeItem(key);
          }
        }
        
        // 重新计算存储空间
        let newTotalSize = 0;
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            newTotalSize += localStorage[key].length * 2 / 1024;
          }
        }
        
        const newAvailableSize = Math.max(0, safeMaxSize - newTotalSize);
        console.log(`清理后: 已使用=${newTotalSize.toFixed(2)}KB, 可用=${newAvailableSize.toFixed(2)}KB`);
        
        // 更新返回结果
        return {
          hasSpace: (newTotalSize + estimatedSize) < (safeMaxSize * 0.8),
          usedKB: parseFloat(newTotalSize.toFixed(2)),
          requiredKB: estimatedSize,
          availableKB: parseFloat(newAvailableSize.toFixed(2)),
          maxSizeKB: safeMaxSize,
          clearedSpace: true
        };
      }
      
      return {
        hasSpace: hasEnoughSpace,
        usedKB: parseFloat(usedSize.toFixed(2)),
        requiredKB: estimatedSize,
        availableKB: parseFloat(availableSize.toFixed(2)),
        maxSizeKB: safeMaxSize,
        clearedSpace: false
      };
        } catch (error) {
      console.error('检查存储配额出错:', error);
      return {
        hasSpace: false,
        usedKB: 0,
        requiredKB: estimatedSize,
        availableKB: 0,
        error: error.message
      };
    }
  }

  /**
   * 更新所有系统数据
   * @param {Object} options 选项
   * @returns {Promise<Object>} 更新结果
   */
  async updateAllSystemData(options = {}) {
    try {
      this.isUpdating.value = true;
      console.log('开始更新所有系统数据...');
      
      // 获取选项
      const clearExisting = options.clearExisting || false;
      
      // 检查存储配额
      const estimatedSize = 1024 * 1024; // 1MB
      const hasQuota = await this.checkStorageQuota(estimatedSize);
      if (!hasQuota) {
          return { 
            success: false, 
          message: '存储空间不足，无法生成完整数据。请尝试清理旧数据或使用紧急数据模式。' 
        };
      }
      
      // 生成库存数据 - 固定生成132条记录
      console.log('开始生成库存数据...');
      const inventoryResult = await this.generateInventoryData(132, clearExisting);
      if (!inventoryResult.success) {
        throw new Error(`生成库存数据失败: ${inventoryResult.message}`);
      }
      
      // 生成实验室测试数据 - 固定生成396条记录
      console.log('开始生成实验室测试数据...');
      const labResult = await this.generateLabData(405, clearExisting);
      if (!labResult.success) {
        throw new Error(`生成实验室测试数据失败: ${labResult.message}`);
      }
      
      // 生成工厂上线数据 - 固定生成1056条记录
      console.log('开始生成工厂上线数据...');
      const factoryResult = await this.generateFactoryData(1080, clearExisting);
      if (!factoryResult.success) {
        throw new Error(`生成工厂上线数据失败: ${factoryResult.message}`);
      }
      
      // 更新最后更新时间
      this.lastUpdateTime.value = new Date().toLocaleString();
      
      // 触发数据更新事件
      this.isUpdating.value = false;
      
      // 3. 在数据生成成功后，调用推送函数
      await this.pushDataToAssistant();

      return { 
        success: true,
        message: '所有系统数据已成功更新',
        data: {
          inventory: inventoryResult.data || [],
          lab: labResult.data || [],
          factory: factoryResult.data || []
        }
      };
    } catch (error) {
      console.error('更新所有系统数据失败:', error);
      return { success: false, message: `更新所有系统数据失败: ${error.message}` };
    } finally {
      this.isUpdating.value = false;
    }
  }

  /**
   * 集成历史数据
   * 将老系统中的数据迁移到新的统一数据服务中
   * @returns {Promise<boolean>} 是否成功
   */
  async integrateHistoricalData() {
    try {
      console.log('开始集成历史数据...');
      
      // 执行数据迁移
      const result = unifiedDataService.migrateOldData();
      
      return result;
    } catch (error) {
      console.error('集成历史数据失败:', error);
      return false;
    }
  }

  /**
   * 检查项目和基线是否符合规则
   * @param {string} projectId 项目ID
   * @param {string} baselineId 基线ID
   * @returns {boolean} 是否符合规则
   */
  checkProjectBaselineRule(projectId, baselineId) {
    // 根据规则检查项目和基线的关系
    const validRelations = DATA_RULES.PROJECT_BASELINE_RULES;
    return validRelations[baselineId] && validRelations[baselineId].includes(projectId);
  }

  /**
   * 检查物料和供应商是否符合规则
   * @param {string} materialName 物料名称
   * @param {string} supplier 供应商
   * @returns {boolean} 是否符合规则
   */
  checkMaterialSupplierRule(materialName, supplier) {
    // 根据规则检查物料和供应商的关系
    const materialSuppliers = getSuppliersForMaterial(materialName);
    return materialSuppliers.includes(supplier);
  }

  /**
   * 检查工厂和仓库是否符合规则
   * @param {string} factory 工厂
   * @param {string} warehouse 仓库
   * @returns {boolean} 是否符合规则
   */
  checkFactoryWarehouseRule(factory, warehouse) {
    // 根据规则检查工厂和仓库的关系
    const expectedWarehouse = DATA_RULES.FACTORY_WAREHOUSE_RULES[factory];
    if (!expectedWarehouse) return false;
    
    // 支持数组或字符串类型的仓库规则
    if (Array.isArray(expectedWarehouse)) {
      return expectedWarehouse.includes(warehouse);
    } else {
      return warehouse === expectedWarehouse;
    }
  }

  /**
   * 获取有效的测试记录数量
   * @returns {number} 测试记录数量
   */
  getValidTestRecordsCount() {
    // 每个批次5-8条测试记录
    return Math.floor(Math.random() * (DATA_RULES.TEST_RECORD_RULES.MAX_PER_BATCH - DATA_RULES.TEST_RECORD_RULES.MIN_PER_BATCH + 1)) + DATA_RULES.TEST_RECORD_RULES.MIN_PER_BATCH;
  }

  /**
   * 生成测试记录
   * @param {string} materialName 物料名称
   * @param {string} batchNo 批次号
   * @param {string} materialType 物料类型
   * @param {string} supplier 供应商
   * @param {string} projectId 项目ID
   * @param {number} count 记录数量，默认为3
   * @returns {Array} 测试记录数组
   */
  generateTestRecords(materialName, batchNo, materialType, supplier, projectId, count = 3) {
    const records = [];
    
    for (let i = 0; i < count; i++) {
      // 使用规则中定义的通过率
      const isPass = Math.random() < DATA_RULES.TEST_RECORD_RULES.PASS_RATE;
      
      const record = {
        id: this.generateId(),
        material_name: materialName,
        materialName: materialName,
        material_type: materialType,
        materialType: materialType,
        batch_no: batchNo,
        batchNo: batchNo,
        supplier: supplier,
        test_date: this.generateRandomDate(),
        testDate: this.generateRandomDate(),
        test_result: isPass ? 'PASS' : 'FAIL',
        testResult: isPass ? 'PASS' : 'FAIL',
        defect_description: isPass ? '' : this.getRandomDefectDescription(),
        defectDescription: isPass ? '' : this.getRandomDefectDescription(),
        project_id: projectId,
        projectId: projectId
      };
      
      records.push(record);
    }
    
    return records;
  }

  /**
   * 生成随机日期
   * @param {number} daysBack 往前推多少天
   * @returns {string} ISO格式的日期字符串
   */
  generateRandomDate(daysBack = 30) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    return date.toISOString();
  }

  /**
   * 生成唯一ID
   * @returns {string} 唯一ID
   */
  generateId() {
    return uuidv4();
  }

  /**
   * 获取随机缺陷描述
   * @returns {string} 随机缺陷描述
   */
  getRandomDefectDescription() {
    const defects = [
      "外观不良", "尺寸超差", "材质问题", "标识错误", 
      "划伤", "变形", "破裂", "起鼓", "色差", 
      "焊点虚焊", "元件缺失", "短路", "开路"
    ];
    return defects[Math.floor(Math.random() * defects.length)];
  }

  /**
   * 获取随机物料
   * @returns {Object} 随机物料对象
   */
  getRandomMaterial() {
    const allMaterials = getAllMaterials();
    if (!allMaterials || allMaterials.length === 0) {
      return { name: '未知物料', type: '未分类' };
    }
    return allMaterials[Math.floor(Math.random() * allMaterials.length)];
  }

  /**
   * 获取随机项目
   * @returns {Object} 随机项目对象
   */
  getRandomProject() {
    const projects = projectBaselineService.getProjectData();
    if (!projects || projects.length === 0) {
      return { id: 'P0001', name: '未知项目' };
    }
    return projects[Math.floor(Math.random() * projects.length)];
  }

  /**
   * 获取随机基线
   * @param {string} projectId 项目ID
   * @returns {Object} 随机基线对象
   */
  getRandomBaseline(projectId) {
    // 尝试获取与项目关联的基线
    const baseline = projectBaselineService.getBaselineByProject(projectId);
    if (baseline) {
      return baseline;
    }
    
    // 如果没有关联基线，随机选择一个
    const baselines = projectBaselineService.getBaselineData();
    if (!baselines || baselines.length === 0) {
      return { id: 'B0001', name: '未知基线' };
    }
    return baselines[Math.floor(Math.random() * baselines.length)];
  }

  /**
   * 获取随机工厂
   * @returns {string} 随机工厂名称
   */
  getRandomFactory() {
    const factories = ['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂'];
    return factories[Math.floor(Math.random() * factories.length)];
  }

  /**
   * 紧急数据生成 - 只生成最小必要的数据集
   * 用于解决存储空间不足的情况
   * @returns {Promise<Object>} 结果对象
   */
  async generateEmergencyData() {
    try {
      this.isUpdating.value = true;
      console.log('开始生成紧急最小数据集...');
      
      // 先清理所有现有数据
      unifiedDataService.clearAllData();
      
      // 生成最小数据集
      // 库存数据：每种物料1个供应商1个批次，共15条
      // 实验室数据：每个批次1条测试记录，共15条
      // 工厂数据：每个批次1条上线记录，共15条
      
      // 生成库存数据
      const inventoryResult = await this.generateInventoryData(15, true, {
        minimalMode: true,  // 最小模式：每种物料只生成1个供应商1个批次
        suppliersPerMaterial: 1,
        batchesPerSupplier: 1
      });
      
      if (!inventoryResult.success) {
        throw new Error('生成库存数据失败');
      }
      
      // 生成实验室数据
      const labResult = await this.generateLabData(15, true, {
        minimalMode: true,  // 最小模式：每个批次只生成1条测试记录
        recordsPerBatch: 1
      });
      
      if (!labResult.success) {
        throw new Error('生成实验室数据失败');
      }
      
      // 生成工厂数据
      const factoryResult = await this.generateFactoryData(15, true, {
        minimalMode: true,  // 最小模式：每个批次只生成1条上线记录
        recordsPerBatch: 1
      });
      
      if (!factoryResult.success) {
        throw new Error('生成工厂数据失败');
      }
      
      // 更新最后更新时间
      this.lastUpdateTime.value = new Date().toLocaleString();
      
      return {
        success: true,
        message: '紧急最小数据集生成成功',
        data: {
          inventory: inventoryResult.data || [],
          lab: labResult.data || [],
          factory: factoryResult.data || []
        }
      };
    } catch (error) {
      console.error('生成紧急数据失败:', error);
      return { success: false, message: `生成紧急数据失败: ${error.message}` };
    } finally {
      this.isUpdating.value = false;
    }
  }

  /**
   * 根据物料编码获取物料信息
   * @param {string} materialCode 物料编码
   * @returns {Object|null} 物料信息对象，包含materialName和supplier
   */
  getMaterialInfoByCode(materialCode) {
    return getMaterialInfoByCode(materialCode);
  }

  /**
   * 获取项目对应的基线
   * @param {string} projectId 项目ID
   * @returns {Object} 基线对象
   */
  getBaselineByProject(projectId) {
    // 使用项目-基线映射关系获取对应的基线
    // 根据图片中的表格定义映射关系
    const PROJECT_BASELINE_MAP = {
      "X6827": "I6789",
      "S665LN": "I6789",
      "KI4K": "I6789",
      "X6828": "I6789",
      "X6831": "I6788",
      "KI5K": "I6788", 
      "KI3K": "I6788",
      "S662LN": "I6787",
      "S663LN": "I6787",
      "S664LN": "I6787"
    };
    
    const baselineId = PROJECT_BASELINE_MAP[projectId];
    if (!baselineId) {
      console.warn(`未找到项目 ${projectId} 对应的基线，使用ProjectBaselineService尝试查找`);
      return projectBaselineService.getBaselineByProject(projectId);
    }
    
    // 获取基线数据
    const baselines = projectBaselineService.getBaselineData();
    const baseline = baselines.find(b => b.baseline_id === baselineId);
    
    if (!baseline) {
      console.warn(`未找到基线ID ${baselineId} 对应的基线数据，返回默认值`);
      return { baseline_id: baselineId, baseline_name: `${baselineId}基线` };
    }
    
    return baseline;
  }
}

// 创建单例实例
const systemDataUpdater = new SystemDataUpdater();

export default systemDataUpdater;