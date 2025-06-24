/**
 * IQE数据同步服务
 * 负责前端数据与MySQL数据库的双向同步
 */
import axios from 'axios';
import { ref, reactive } from 'vue';
import inventoryService from './services/InventoryService';
import laboratoryService from './services/LaboratoryService';
import qualityService from './services/QualityService';
import dataStandardService from './services/DataStandardService';
import { UUID } from './utils/common';

class DataSyncService {
  constructor() {
    this.initialized = false;
    this.syncStatus = ref({
      lastSyncTime: null,
      pendingChanges: 0,
      syncInProgress: false,
      lastError: null
    });
    
    // 同步队列
    this.syncQueue = reactive({
      inventory: [],
      laboratory: [],
      quality: []
    });
    
    // API客户端
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
      timeout: 10000
    });
    
    // 添加响应拦截器处理错误
    this.api.interceptors.response.use(
      response => response,
      error => {
        console.error('API请求失败:', error);
        this.syncStatus.value.lastError = error.message;
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * 初始化同步服务
   */
  async initialize() {
    if (this.initialized) return true;
    
    try {
      // 确保各服务已初始化
      await Promise.all([
        inventoryService.initialize(),
        laboratoryService.initialize(),
        qualityService.initialize(),
        dataStandardService.initialize()
      ]);
      
      // 设置自动同步定时器 (每5分钟)
      this.autoSyncInterval = setInterval(() => this.syncAll(), 5 * 60 * 1000);
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('初始化数据同步服务失败:', error);
      this.syncStatus.value.lastError = error.message;
      return false;
    }
  }
  
  /**
   * 获取数据库当前状态
   */
  async fetchDatabaseState() {
    try {
      const [inventoryData, laboratoryData, qualityData] = await Promise.all([
        this.api.get('/inventory'),
        this.api.get('/laboratory-tests'),
        this.api.get('/quality-events')
      ]);
      
      return {
        inventory: inventoryData.data,
        laboratory: laboratoryData.data,
        quality: qualityData.data
      };
    } catch (error) {
      console.error('获取数据库状态失败:', error);
      throw error;
    }
  }
  
  /**
   * 全量同步所有模块数据
   */
  async syncAll() {
    if (this.syncStatus.value.syncInProgress) return false;
    
    this.syncStatus.value.syncInProgress = true;
    
    try {
      await Promise.all([
        this.syncInventoryData(),
        this.syncLaboratoryData(),
        this.syncQualityData()
      ]);
      
      this.syncStatus.value.lastSyncTime = new Date();
      this.syncStatus.value.pendingChanges = 0;
      this.syncStatus.value.syncInProgress = false;
      this.syncStatus.value.lastError = null;
      
      return true;
    } catch (error) {
      console.error('全量同步失败:', error);
      this.syncStatus.value.lastError = error.message;
      this.syncStatus.value.syncInProgress = false;
      return false;
    }
  }
  
  /**
   * 同步库存数据
   */
  async syncInventoryData() {
    const items = inventoryService.getAllItems();
    const dbState = await this.api.get('/inventory');
    const dbItems = dbState.data;
    
    // 创建ID到数据的映射，用于快速查找
    const dbItemMap = dbItems.reduce((map, item) => {
      map[item.batch_no] = item;
      return map;
    }, {});
    
    // 处理每一个前端项目
    for (const item of items) {
      try {
        // 检查是否存在于数据库
        const dbItem = dbItemMap[item.batchNo];
        
        if (dbItem) {
          // 更新现有记录
          await this.api.put(`/inventory/${dbItem.id}`, this.mapInventoryToDb(item));
        } else {
          // 创建新记录
          await this.api.post('/inventory', this.mapInventoryToDb(item));
        }
      } catch (error) {
        console.error(`同步库存项目 ${item.batchNo} 失败:`, error);
        // 将失败项加入同步队列以便稍后重试
        this.syncQueue.inventory.push(item);
      }
    }
    
    // 返回未同步项数量
    return this.syncQueue.inventory.length;
  }
  
  /**
   * 同步实验室数据
   */
  async syncLaboratoryData() {
    const tests = laboratoryService.getAllTests();
    const dbState = await this.api.get('/laboratory-tests');
    const dbTests = dbState.data;
    
    // 创建ID到数据的映射
    const dbTestMap = dbTests.reduce((map, test) => {
      map[test.test_no] = test;
      return map;
    }, {});
    
    // 处理每个测试记录
    for (const test of tests) {
      try {
        // 检查是否存在于数据库
        const dbTest = dbTestMap[test.testNo];
        
        if (dbTest) {
          // 更新现有记录
          await this.api.put(`/laboratory-tests/${dbTest.id}`, this.mapLaboratoryToDb(test));
          
          // 同步测试参数
          if (test.parameters && test.parameters.length) {
            await this.syncTestParameters(dbTest.id, test.parameters);
          }
        } else {
          // 创建新记录
          const newTest = await this.api.post('/laboratory-tests', this.mapLaboratoryToDb(test));
          
          // 同步测试参数
          if (test.parameters && test.parameters.length) {
            await this.syncTestParameters(newTest.data.id, test.parameters);
          }
        }
      } catch (error) {
        console.error(`同步测试记录 ${test.testNo} 失败:`, error);
        this.syncQueue.laboratory.push(test);
      }
    }
    
    return this.syncQueue.laboratory.length;
  }
  
  /**
   * 同步测试参数
   */
  async syncTestParameters(testId, parameters) {
    // 获取现有参数
    const dbParams = await this.api.get(`/test-data-items?test_id=${testId}`);
    const existingParams = dbParams.data;
    
    // 删除多余参数
    for (const param of existingParams) {
      const stillExists = parameters.some(p => p.name === param.parameter);
      if (!stillExists) {
        await this.api.delete(`/test-data-items/${param.id}`);
      }
    }
    
    // 创建或更新参数
    for (const param of parameters) {
      const existingParam = existingParams.find(p => p.parameter === param.name);
      const paramData = {
        test_id: testId,
        parameter: param.name,
        parameter_code: param.code,
        value: param.value,
        unit: param.unit,
        lower_limit: param.lowerLimit,
        upper_limit: param.upperLimit,
        status: param.status,
        type: param.type,
        notes: param.notes
      };
      
      if (existingParam) {
        await this.api.put(`/test-data-items/${existingParam.id}`, paramData);
      } else {
        await this.api.post('/test-data-items', paramData);
      }
    }
  }
  
  /**
   * 同步质量数据
   */
  async syncQualityData() {
    const events = qualityService.getAllEvents();
    const dbState = await this.api.get('/quality-events');
    const dbEvents = dbState.data;
    
    // 创建ID到数据的映射
    const dbEventMap = dbEvents.reduce((map, event) => {
      map[event.id] = event;
      return map;
    }, {});
    
    // 处理每个质量事件
    for (const event of events) {
      try {
        // 使用事件ID或生成一个新的
        const eventId = event.id || UUID.generate();
        
        // 检查是否存在于数据库
        const dbEvent = dbEventMap[eventId];
        
        if (dbEvent) {
          // 更新现有记录
          await this.api.put(`/quality-events/${dbEvent.id}`, this.mapQualityEventToDb(event));
        } else {
          // 创建新记录
          const eventData = this.mapQualityEventToDb(event);
          eventData.id = eventId;
          await this.api.post('/quality-events', eventData);
        }
      } catch (error) {
        console.error(`同步质量事件 ${event.title} 失败:`, error);
        this.syncQueue.quality.push(event);
      }
    }
    
    return this.syncQueue.quality.length;
  }
  
  /**
   * 实时同步单个库存项目
   */
  async syncInventoryItem(item) {
    try {
      // 查找是否存在
      const response = await this.api.get(`/inventory?batch_no=${item.batchNo}`);
      
      if (response.data.length > 0) {
        // 更新
        return this.api.put(`/inventory/${response.data[0].id}`, this.mapInventoryToDb(item));
      } else {
        // 创建
        return this.api.post('/inventory', this.mapInventoryToDb(item));
      }
    } catch (error) {
      console.error(`实时同步库存项目 ${item.batchNo} 失败:`, error);
      this.syncQueue.inventory.push(item);
      throw error;
    }
  }
  
  /**
   * 实时同步单个测试记录
   */
  async syncLaboratoryTest(test) {
    try {
      // 查找是否存在
      const response = await this.api.get(`/laboratory-tests?test_no=${test.testNo}`);
      
      if (response.data.length > 0) {
        // 更新
        await this.api.put(`/laboratory-tests/${response.data[0].id}`, this.mapLaboratoryToDb(test));
        
        // 同步参数
        if (test.parameters && test.parameters.length) {
          await this.syncTestParameters(response.data[0].id, test.parameters);
        }
        
        return response.data[0];
      } else {
        // 创建
        const newTest = await this.api.post('/laboratory-tests', this.mapLaboratoryToDb(test));
        
        // 同步参数
        if (test.parameters && test.parameters.length) {
          await this.syncTestParameters(newTest.data.id, test.parameters);
        }
        
        return newTest.data;
      }
    } catch (error) {
      console.error(`实时同步测试记录 ${test.testNo} 失败:`, error);
      this.syncQueue.laboratory.push(test);
      throw error;
    }
  }
  
  /**
   * 实时同步单个质量事件
   */
  async syncQualityEvent(event) {
    try {
      const eventId = event.id || UUID.generate();
      
      // 查找是否存在
      const response = await this.api.get(`/quality-events?id=${eventId}`);
      
      if (response.data.length > 0) {
        // 更新
        return this.api.put(`/quality-events/${response.data[0].id}`, this.mapQualityEventToDb(event));
      } else {
        // 创建
        const eventData = this.mapQualityEventToDb(event);
        eventData.id = eventId;
        return this.api.post('/quality-events', eventData);
      }
    } catch (error) {
      console.error(`实时同步质量事件 ${event.title} 失败:`, error);
      this.syncQueue.quality.push(event);
      throw error;
    }
  }
  
  /**
   * 将前端库存数据映射为数据库格式
   */
  mapInventoryToDb(item) {
    return {
      batch_no: item.batchNo,
      material_code: item.materialCode,
      material_name: item.materialName,
      category: item.category,
      factory: item.factory,
      location: item.location,
      quantity: item.quantity,
      unit: item.unit,
      supplier: item.supplier,
      status: this.mapStatusToDb(item.status),
      quality: this.mapQualityToDb(item.quality),
      inspection_date: item.inspectionDate,
      incoming_date: new Date(),
      risk_level: item.riskLevel || 'low',
      risk_reason: item.riskReason
    };
  }
  
  /**
   * 将前端测试数据映射为数据库格式
   */
  mapLaboratoryToDb(test) {
    return {
      test_no: test.testNo,
      batch_id: test.batchId,
      material_code: test.materialCode,
      test_type: test.testType,
      method: test.method,
      level: test.level,
      inspector_id: test.inspectorId,
      equipment_id: test.equipmentId,
      result: this.mapTestResultToDb(test.result),
      evaluation_status: this.mapEvaluationStatusToDb(test.evaluationStatus),
      inspection_phase: test.inspectionPhase,
      test_date: test.testDate,
      conclusion: test.conclusion,
      notes: test.notes
    };
  }
  
  /**
   * 将前端质量事件映射为数据库格式
   */
  mapQualityEventToDb(event) {
    return {
      title: event.title,
      type: event.type,
      status: event.status,
      source: event.source,
      risk_level: event.riskLevel,
      standard_risk_level: event.standardRiskLevel,
      exception_type: event.exceptionType,
      related_batch_id: event.relatedBatchId,
      material_code: event.materialCode,
      product: event.product,
      description: event.description,
      root_cause: event.rootCause,
      corrective_actions: event.correctiveActions,
      preventive_actions: event.preventiveActions,
      responsible_person: event.responsiblePerson,
      department: event.department,
      discovery_date: event.discoveryDate,
      due_date: event.dueDate,
      close_date: event.closeDate,
      data_type: 'quality'
    };
  }
  
  /**
   * 状态映射
   */
  mapStatusToDb(status) {
    const statusMap = {
      '正常': 'normal',
      '风险': 'risk',
      '冻结': 'frozen'
    };
    return statusMap[status] || status;
  }
  
  /**
   * 质量状态映射
   */
  mapQualityToDb(quality) {
    const qualityMap = {
      '合格': 'pass',
      '待检': 'pending',
      '不合格': 'fail',
      '风险物料（来料）': 'risk_incoming',
      '风险物料（实验室）': 'risk_lab',
      '风险物料（产线）': 'risk_production'
    };
    return qualityMap[quality] || quality;
  }
  
  /**
   * 测试结果映射
   */
  mapTestResultToDb(result) {
    const resultMap = {
      '通过': 'pass',
      '不通过': 'fail',
      '待定': 'pending',
      '偏差': 'deviation'
    };
    return resultMap[result] || result;
  }
  
  /**
   * 评估状态映射
   */
  mapEvaluationStatusToDb(status) {
    const statusMap = {
      'OK': 'ok',
      'NG': 'ng',
      '待定': 'pending',
      '警告': 'warning',
      '偏差': 'deviation'
    };
    return statusMap[status] || status;
  }
}

// 创建单例
const dataSyncService = new DataSyncService();
export default dataSyncService; 