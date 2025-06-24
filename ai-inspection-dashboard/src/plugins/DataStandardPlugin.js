/**
 * 数据标准化插件 - 用于初始化并提供数据标准化服务
 */
import DataStandardService from '../services/DataStandardService';
import { LaboratoryDataStandard } from '../services/LaboratoryDataStandard';
import { QualityDataStandard } from '../services/QualityDataStandard';
import { IQEDataService } from '../services/IQEDataService';
import laboratoryService from '../services/LaboratoryService';
import qualityService from '../services/QualityService';

export const DataStandardPlugin = {
  install(app) {
    // 创建服务实例
    const dataStandardService = new DataStandardService();
    const laboratoryDataStandard = new LaboratoryDataStandard();
    const qualityDataStandard = new QualityDataStandard();
    const iqeDataService = new IQEDataService(
      dataStandardService, 
      laboratoryDataStandard, 
      qualityDataStandard
    );
    
    // 创建标准化服务状态
    const standardServices = {
      dataStandard: dataStandardService,
      laboratoryStandard: laboratoryDataStandard,
      qualityStandard: qualityDataStandard,
      iqeData: iqeDataService,
      initialized: false,
      
      // 初始化所有服务
      async initialize() {
        try {
          console.log('开始初始化数据标准化服务...');
          
          // 先初始化基础服务
          await dataStandardService.initialize();
          console.log('基础数据标准化服务初始化完成');
          
          // 初始化实验室和质量服务
          try {
            await laboratoryService.initialize();
            console.log('实验室服务初始化完成');
          } catch (err) {
            console.error('实验室服务初始化失败:', err);
          }

          try {
            await qualityService.initialize();
            console.log('质量服务初始化完成');
          } catch (err) {
            console.error('质量服务初始化失败:', err);
          }
          
          // 初始化对应的标准化服务
          try {
            await laboratoryDataStandard.initialize(laboratoryService);
            console.log('实验室数据标准化初始化完成');
          } catch (err) {
            console.error('实验室数据标准化初始化失败:', err);
          }

          try {
            await qualityDataStandard.initialize(qualityService);
            console.log('质量数据标准化初始化完成');
          } catch (err) {
            console.error('质量数据标准化初始化失败:', err);
          }
          
          // 最后初始化IQE数据服务
          try {
            await iqeDataService.initialize();
            console.log('IQE数据服务初始化完成');
          } catch (err) {
            console.error('IQE数据服务初始化失败:', err);
          }
          
          this.initialized = true;
          console.log('数据标准化服务初始化完成');
          return true;
        } catch (error) {
          console.error('数据标准化服务初始化失败:', error);
          return false;
        }
      },
      
      // 获取标准化数据，用于AI问答系统
      async getStandardizedData() {
        if (!this.initialized) {
          await this.initialize();
        }
        try {
          return iqeDataService.getAllStandardizedData();
        } catch (error) {
          console.error('获取标准化数据失败:', error);
          return { error: '数据获取失败', message: error.message };
        }
      }
    };
    
    // 提供全局访问
    app.provide('standardServices', standardServices);
    
    // 添加到全局属性
    app.config.globalProperties.$standardServices = standardServices;
    
    // 初始化服务
    standardServices.initialize().catch(error => {
      console.error('初始化数据标准化服务失败:', error);
    });
    
    // 注册组件指令
    app.directive('data-standard', {
      mounted(el, binding) {
        // 可以根据需要为元素添加数据标准相关的功能
        const dataType = binding.value;
        if (dataType) {
          el.setAttribute('data-standard-type', dataType);
        }
      }
    });
  }
}; 