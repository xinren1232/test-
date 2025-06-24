/**
 * 实验室服务
 * 提供测试数据管理、检验结果分析、批次质量评估等功能
 */
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import inventoryService from './InventoryService';

// 检验类型常量
export const TEST_TYPES = {
  INCOMING: 'incoming',    // 来料检验
  PROCESS: 'process',      // 过程检验  
  OUTGOING: 'outgoing',    // 成品检验
  STABILITY: 'stability',  // 稳定性测试
  SPECIAL: 'special'       // 特殊检验
};

// 测试结果常量
export const TEST_RESULTS = {
  PASS: 'pass',           // 合格
  FAIL: 'fail',           // 不合格
  WARNING: 'warning',     // 警告
  PENDING: 'pending',     // 待定
  NA: 'na'                // 不适用
};

// 检验方法常量
export const TEST_METHODS = {
  VISUAL: 'visual',        // 外观检查
  PHYSICAL: 'physical',    // 物理性能
  CHEMICAL: 'chemical',    // 化学性能
  MECHANICAL: 'mechanical', // 机械性能
  THERMAL: 'thermal',      // 热学性能
  ELECTRICAL: 'electrical', // 电学性能
  OPTICAL: 'optical'       // 光学性能
};

// 检验级别常量
export const TEST_LEVELS = {
  ROUTINE: 'routine',      // 常规检验
  ENHANCED: 'enhanced',    // 强化检验
  REDUCED: 'reduced',      // 简化检验
  COMPREHENSIVE: 'comprehensive' // 全面检验
};

class LaboratoryService {
  constructor() {
    this.testRecords = ref([]);
    this.testItems = ref([]);
    this.testMethods = ref([]);
    this.initialized = false;
    
    // 检验人员列表
    this.inspectors = [
      { id: 'INS001', name: '张工', department: '质量部', level: '高级', qualification: '国家认证工程师', speciality: '物理性能测试', experience: '10年' },
      { id: 'INS002', name: '李工', department: '质量部', level: '中级', qualification: '企业认证工程师', speciality: '化学性能测试', experience: '5年' },
      { id: 'INS003', name: '王工', department: '实验室', level: '高级', qualification: '国家认证工程师', speciality: '机械性能测试', experience: '12年' },
      { id: 'INS004', name: '赵工', department: '实验室', level: '中级', qualification: '企业认证工程师', speciality: '外观检验', experience: '4年' },
      { id: 'INS005', name: '钱工', department: '研发部', level: '高级', qualification: '研发工程师', speciality: '性能评估', experience: '8年' },
      { id: 'INS006', name: '孙工', department: '质量部', level: '高级', qualification: '国际认证工程师', speciality: '热性能测试', experience: '15年' },
      { id: 'INS007', name: '周工', department: '研发部', level: '中级', qualification: '材料工程师', speciality: '新材料测试', experience: '6年' },
      { id: 'INS008', name: '吴工', department: '实验室', level: '初级', qualification: '助理工程师', speciality: '常规检测', experience: '2年' },
      { id: 'INS009', name: '郑工', department: '质量部', level: '中级', qualification: '质量工程师', speciality: '包装材料测试', experience: '7年' },
      { id: 'INS010', name: '陈工', department: '实验室', level: '高级', qualification: '实验室主管', speciality: '综合测试', experience: '14年' }
    ];
    
    // 设备列表
    this.equipment = [
      { id: 'EQP001', name: '万能材料试验机', model: 'UT-5000', brand: '冠测', calibrationDate: '2023-05-10', nextCalibrationDate: '2024-05-10', accuracy: '±0.5%', range: '0-5000N', status: '正常' },
      { id: 'EQP002', name: '红外光谱仪', model: 'IR-8000', brand: '安捷伦', calibrationDate: '2023-06-15', nextCalibrationDate: '2024-06-15', accuracy: '±2cm-1', range: '400-4000cm-1', status: '正常' },
      { id: 'EQP003', name: '高效液相色谱仪', model: 'HPLC-3500', brand: '岛津', calibrationDate: '2023-07-20', nextCalibrationDate: '2024-07-20', accuracy: '±0.1%', range: 'N/A', status: '正常' },
      { id: 'EQP004', name: '电子万能试验机', model: 'UTM-2000', brand: '新时代', calibrationDate: '2023-08-05', nextCalibrationDate: '2024-08-05', accuracy: '±1%', range: '0-2000N', status: '正常' },
      { id: 'EQP005', name: '热失重分析仪', model: 'TGA-600', brand: '珀金埃尔默', calibrationDate: '2023-09-10', nextCalibrationDate: '2024-09-10', accuracy: '±0.1°C', range: '25-600°C', status: '正常' },
      { id: 'EQP006', name: '示差扫描量热仪', model: 'DSC-3000', brand: '美国TA', calibrationDate: '2023-10-15', nextCalibrationDate: '2024-10-15', accuracy: '±0.1°C', range: '-150-600°C', status: '正常' },
      { id: 'EQP007', name: '氧指数测试仪', model: 'OI-2000', brand: '泰思特', calibrationDate: '2023-11-20', nextCalibrationDate: '2024-11-20', accuracy: '±0.2%', range: '0-100%', status: '正常' },
      { id: 'EQP008', name: '密度计', model: 'DEN-1000', brand: '梅特勒', calibrationDate: '2023-12-05', nextCalibrationDate: '2024-12-05', accuracy: '±0.0001g/cm³', range: '0-3g/cm³', status: '正常' },
      { id: 'EQP009', name: '熔融指数仪', model: 'MFI-2000', brand: '戈埃尔特', calibrationDate: '2024-01-10', nextCalibrationDate: '2025-01-10', accuracy: '±0.1g/10min', range: '0.1-100g/10min', status: '正常' },
      { id: 'EQP010', name: '冲击试验机', model: 'IT-500', brand: '天工试验', calibrationDate: '2024-02-15', nextCalibrationDate: '2025-02-15', accuracy: '±0.5J', range: '0-50J', status: '正常' },
      { id: 'EQP011', name: '紫外分光光度计', model: 'UV-2600', brand: '岛津', calibrationDate: '2024-03-20', nextCalibrationDate: '2025-03-20', accuracy: '±0.002A', range: '190-900nm', status: '正常' },
      { id: 'EQP012', name: '红外热像仪', model: 'IR-500', brand: 'FLIR', calibrationDate: '2024-04-05', nextCalibrationDate: '2025-04-05', accuracy: '±2°C', range: '-20-500°C', status: '维修中' },
      { id: 'EQP013', name: '维卡软化点测试仪', model: 'VST-1000', brand: '戈埃尔特', calibrationDate: '2023-10-25', nextCalibrationDate: '2024-10-25', accuracy: '±0.5°C', range: '30-200°C', status: '正常' },
      { id: 'EQP014', name: '雾度计', model: 'HZ-300', brand: '爱色丽', calibrationDate: '2023-11-15', nextCalibrationDate: '2024-11-15', accuracy: '±0.1%', range: '0-100%', status: '正常' },
      { id: 'EQP015', name: '摩擦系数测试仪', model: 'COF-2000', brand: '天工试验', calibrationDate: '2024-01-25', nextCalibrationDate: '2025-01-25', accuracy: '±0.01', range: '0-2', status: '正常' }
    ];
    
    // 测试方法
    this.testMethods = ref([]);
  }

  /**
   * 初始化实验室服务
   */
  async initialize() {
    if (this.initialized) return true;
    
    try {
      // 加载测试方法
      this._loadTestMethods();
      
      // 加载测试项目
      this._loadTestItems();
      
      // 加载测试记录
      const storedRecords = localStorage.getItem('test_records');
      if (storedRecords) {
        this.testRecords.value = JSON.parse(storedRecords);
      }
    
    this.initialized = true;
    return true;
        } catch (error) {
      console.error('初始化实验室服务失败:', error);
      return false;
    }
  }
  
  /**
   * 加载测试方法
   */
  _loadTestMethods() {
    this.testMethods.value = [
      {
        id: 'TM-001',
        name: '物理性能测试',
        description: '测量物料的硬度、强度、弹性等物理特性',
        category: '物理测试'
      },
      {
        id: 'TM-002',
        name: '化学成分分析',
        description: '分析物料的化学组成和杂质含量',
        category: '化学测试'
      },
      {
        id: 'TM-003',
        name: '高温性能测试',
        description: '测试物料在高温环境下的性能和稳定性',
        category: '环境测试'
      },
      {
        id: 'TM-004',
        name: '燃烧特性测试',
        description: '测试物料的燃烧特性和阻燃性能',
        category: '安全测试'
      },
      {
        id: 'TM-005',
        name: '耐候性测试',
        description: '测试物料对紫外线、湿度等环境因素的耐受性',
        category: '环境测试'
      }
    ];
  }
  
  /**
   * 加载测试项目
   */
  _loadTestItems() {
    this.testItems.value = [
      {
        id: 'TI-001',
        name: '熔点测试',
        methodId: 'TM-001',
        unit: '℃',
        normalRange: '120-130'
      },
      {
        id: 'TI-002',
        name: '拉伸强度',
        methodId: 'TM-001',
        unit: 'MPa',
        normalRange: '25-35'
      },
      {
        id: 'TI-003',
        name: '杂质含量',
        methodId: 'TM-002',
        unit: '%',
        normalRange: '≤0.5'
      },
      {
        id: 'TI-004',
        name: '耐热性',
        methodId: 'TM-003',
        unit: 'h',
        normalRange: '≥48'
      },
      {
        id: 'TI-005',
        name: '阻燃等级',
        methodId: 'TM-004',
        unit: '',
        normalRange: 'V-0'
      },
      {
        id: 'TI-006',
        name: '抗紫外线性能',
        methodId: 'TM-005',
        unit: 'h',
        normalRange: '≥1000'
      }
    ];
  }
  
  /**
   * 获取所有测试记录
   */
  getAllTestRecords() {
    return this.testRecords.value;
  }
  
  /**
   * 获取测试方法
   */
  getTestMethods() {
    return this.testMethods.value;
  }
  
  /**
   * 获取测试项目
   */
  getTestItems() {
    return this.testItems.value;
  }
  
  /**
   * 根据ID获取测试记录
   */
  getTestRecordById(id) {
    return this.testRecords.value.find(record => record.id === id);
  }
  
  /**
   * 根据批次号获取测试记录
   */
  getTestRecordsByBatchNo(batchNo) {
    return this.testRecords.value.filter(record => record.batchNo === batchNo);
  }
  
  /**
   * 添加测试记录
   */
  addTestRecord(record) {
    // 确保有ID
    if (!record.id) {
      record.id = `TR-${Date.now()}`;
    }
    
    // 添加创建时间
    if (!record.createdAt) {
      record.createdAt = new Date().toISOString();
    }
    
    // 如果没有指定测试状态，设为待定
    if (!record.status) {
      record.status = TEST_RESULTS.PENDING;
    }
    
    // 检查批次是否存在
    if (record.batchNo) {
      const inventoryItem = inventoryService.getItemByBatchNo(record.batchNo);
      if (!inventoryItem) {
        ElMessage.warning(`批次 ${record.batchNo} 不存在于库存系统中，请先添加库存记录。`);
      }
    }
    
    this.testRecords.value.push(record);
    this._saveRecordsToStorage();
    
    return record;
  }

  /**
   * 更新测试记录
   */
  updateTestRecord(id, updates) {
    const index = this.testRecords.value.findIndex(record => record.id === id);
    if (index === -1) {
      throw new Error(`未找到ID为 ${id} 的测试记录`);
    }
    
    this.testRecords.value[index] = {
      ...this.testRecords.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this._saveRecordsToStorage();
    return this.testRecords.value[index];
  }
  
  /**
   * 完成测试记录
   */
  completeTestRecord(id, result, remarks) {
    return this.updateTestRecord(id, {
      status: result,
      completedAt: new Date().toISOString(),
      remarks
    });
  }
  
  /**
   * 批量更新测试记录
   */
  bulkUpdateTestRecords(updates) {
    if (!Array.isArray(updates)) {
      throw new Error('更新必须是数组格式');
    }
    
    const updatedRecords = [];
    
    updates.forEach(update => {
      try {
        const updatedRecord = this.updateTestRecord(update.id, update.changes);
        updatedRecords.push(updatedRecord);
      } catch (error) {
        console.error(`更新测试记录 ${update.id} 失败:`, error);
      }
    });
    
    return updatedRecords;
  }
  
  /**
   * 根据批次号分析测试结果
   * @param {string} batchNo - 批次号
   * @returns {Object} - 分析结果
   */
  analyzeTestResultsByBatchNo(batchNo) {
    const records = this.getTestRecordsByBatchNo(batchNo);
    
    if (records.length === 0) {
      return {
        batchNo,
        totalTests: 0,
        status: 'unknown',
        message: '没有找到相关测试记录'
      };
    }
    
    const totalTests = records.length;
    const passedTests = records.filter(r => r.status === TEST_RESULTS.PASS).length;
    const failedTests = records.filter(r => r.status === TEST_RESULTS.FAIL).length;
    const warningTests = records.filter(r => r.status === TEST_RESULTS.WARNING).length;
    const pendingTests = records.filter(r => r.status === TEST_RESULTS.PENDING).length;
    
    let status = 'normal';
    let message = '测试通过';
    
    if (failedTests > 0) {
      status = 'critical';
      message = `${failedTests}项测试不合格，建议冻结物料`;
    } else if (warningTests > 0) {
      status = 'warning';
      message = `${warningTests}项测试有警告，建议关注`;
    } else if (pendingTests > 0) {
      status = 'pending';
      message = `还有${pendingTests}项测试未完成`;
    }
    
    return {
      batchNo,
      totalTests,
      passedTests,
      failedTests,
      warningTests,
      pendingTests,
      completionRate: totalTests > 0 ? ((totalTests - pendingTests) / totalTests * 100).toFixed(1) : '0',
      passRate: (totalTests - pendingTests) > 0 ? (passedTests / (totalTests - pendingTests) * 100).toFixed(1) : '0',
      status,
      message
    };
  }
  
  /**
   * 将测试记录保存到本地存储
   */
  _saveRecordsToStorage() {
    localStorage.setItem('test_records', JSON.stringify(this.testRecords.value));
  }
}

// 创建单例
const laboratoryService = new LaboratoryService();
export default laboratoryService; 