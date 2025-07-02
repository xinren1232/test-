/**
 * 数据服务 - 统一数据访问接口
 */

class DataService {
  constructor() {
    this.initialized = false;
    this.data = {
      inventory: [],
      inspection: [],
      production: [],
      batch: []
    };
    this.init();
  }

  /**
   * 初始化数据服务
   */
  init() {
    console.log('📊 数据服务初始化...');
    this.loadDataFromLocalStorage();
    this.initialized = true;
    console.log('✅ 数据服务初始化完成');
  }

  /**
   * 从localStorage加载数据
   */
  loadDataFromLocalStorage() {
    try {
      // 加载库存数据
      const inventoryData = localStorage.getItem('unified_inventory_data') || 
                           localStorage.getItem('inventory_data');
      if (inventoryData) {
        this.data.inventory = JSON.parse(inventoryData);
        console.log(`📦 加载库存数据: ${this.data.inventory.length} 条记录`);
      }

      // 加载测试数据
      const labData = localStorage.getItem('unified_lab_data') || 
                     localStorage.getItem('lab_data');
      if (labData) {
        this.data.inspection = JSON.parse(labData);
        console.log(`🔍 加载测试数据: ${this.data.inspection.length} 条记录`);
      }

      // 加载生产数据
      const factoryData = localStorage.getItem('unified_factory_data') || 
                         localStorage.getItem('factory_data');
      if (factoryData) {
        this.data.production = JSON.parse(factoryData);
        console.log(`🏭 加载生产数据: ${this.data.production.length} 条记录`);
      }

      // 加载批次数据
      const batchData = localStorage.getItem('batch_data');
      if (batchData) {
        this.data.batch = JSON.parse(batchData);
        console.log(`📋 加载批次数据: ${this.data.batch.length} 条记录`);
      }

    } catch (error) {
      console.error('❌ 加载localStorage数据失败:', error);
      this.generateMockData();
    }
  }

  /**
   * 生成模拟数据（当localStorage为空时）
   */
  generateMockData() {
    console.log('🔧 生成模拟数据...');
    
    // 模拟库存数据
    this.data.inventory = [
      {
        id: 'INV001',
        materialName: '液晶显示屏',
        materialCode: 'LCD-001',
        supplier: 'BOE',
        quantity: 150,
        status: '正常',
        factory: '深圳工厂',
        warehouse: 'A区',
        inboundDate: '2024-01-15',
        expiryDate: '2024-12-31'
      },
      {
        id: 'INV002',
        materialName: '触控芯片',
        materialCode: 'CHIP-002',
        supplier: '华星光电',
        quantity: 80,
        status: '风险',
        factory: '上海工厂',
        warehouse: 'B区',
        inboundDate: '2024-01-10',
        expiryDate: '2024-06-30'
      }
    ];

    // 模拟测试数据
    this.data.inspection = [
      {
        id: 'TEST001',
        testDate: '2024-01-20',
        materialCode: 'LCD-001',
        materialName: '液晶显示屏',
        supplier: 'BOE',
        batchCode: 'B001',
        testResult: 'PASS',
        defectType: '',
        factory: '深圳工厂'
      },
      {
        id: 'TEST002',
        testDate: '2024-01-21',
        materialCode: 'CHIP-002',
        materialName: '触控芯片',
        supplier: '华星光电',
        batchCode: 'B002',
        testResult: 'FAIL',
        defectType: '功能异常',
        factory: '上海工厂'
      }
    ];

    // 模拟生产数据
    this.data.production = [
      {
        id: 'PROD001',
        factory: '深圳工厂',
        baseline: 'BL001',
        project: 'P001',
        materialCode: 'LCD-001',
        materialName: '液晶显示屏',
        supplier: 'BOE',
        batchCode: 'B001',
        defectRate: 2.1,
        defectType: '外观缺陷'
      },
      {
        id: 'PROD002',
        factory: '上海工厂',
        baseline: 'BL002',
        project: 'P002',
        materialCode: 'CHIP-002',
        materialName: '触控芯片',
        supplier: '华星光电',
        batchCode: 'B002',
        defectRate: 5.3,
        defectType: '功能异常'
      }
    ];

    console.log('✅ 模拟数据生成完成');
  }

  /**
   * 获取所有库存数据
   */
  getInventoryData() {
    return this.data.inventory || [];
  }

  /**
   * 获取所有测试数据
   */
  getInspectionData() {
    return this.data.inspection || [];
  }

  /**
   * 获取所有生产数据
   */
  getProductionData() {
    return this.data.production || [];
  }

  /**
   * 获取所有批次数据
   */
  getBatchData() {
    return this.data.batch || [];
  }

  /**
   * 根据工厂筛选库存数据
   */
  getInventoryByFactory(factory) {
    return this.data.inventory.filter(item => 
      item.factory && item.factory.includes(factory)
    );
  }

  /**
   * 根据供应商筛选数据
   */
  getDataBySupplier(supplier) {
    return {
      inventory: this.data.inventory.filter(item => 
        item.supplier && item.supplier.includes(supplier)
      ),
      inspection: this.data.inspection.filter(item => 
        item.supplier && item.supplier.includes(supplier)
      ),
      production: this.data.production.filter(item => 
        item.supplier && item.supplier.includes(supplier)
      )
    };
  }

  /**
   * 获取质量统计数据
   */
  getQualityStats() {
    const inspectionData = this.getInspectionData();
    const productionData = this.getProductionData();
    
    const totalTests = inspectionData.length;
    const passedTests = inspectionData.filter(item => item.testResult === 'PASS').length;
    const passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;
    
    const avgDefectRate = productionData.length > 0 
      ? (productionData.reduce((sum, item) => sum + (item.defectRate || 0), 0) / productionData.length).toFixed(1)
      : 0;

    return {
      totalTests,
      passedTests,
      passRate,
      avgDefectRate,
      totalProduction: productionData.length
    };
  }

  /**
   * 获取库存状态统计
   */
  getInventoryStats() {
    const inventoryData = this.getInventoryData();
    const total = inventoryData.length;
    const normal = inventoryData.filter(item => item.status === '正常').length;
    const risk = inventoryData.filter(item => item.status === '风险').length;
    const frozen = inventoryData.filter(item => item.status === '冻结').length;

    return {
      total,
      normal,
      risk,
      frozen,
      normalRate: total > 0 ? (normal / total * 100).toFixed(1) : 0
    };
  }

  /**
   * 获取供应商列表
   */
  getSuppliers() {
    const suppliers = new Set();
    
    this.data.inventory.forEach(item => {
      if (item.supplier) suppliers.add(item.supplier);
    });
    
    this.data.inspection.forEach(item => {
      if (item.supplier) suppliers.add(item.supplier);
    });
    
    this.data.production.forEach(item => {
      if (item.supplier) suppliers.add(item.supplier);
    });

    return Array.from(suppliers);
  }

  /**
   * 获取工厂列表
   */
  getFactories() {
    const factories = new Set();
    
    this.data.inventory.forEach(item => {
      if (item.factory) factories.add(item.factory);
    });
    
    this.data.inspection.forEach(item => {
      if (item.factory) factories.add(item.factory);
    });
    
    this.data.production.forEach(item => {
      if (item.factory) factories.add(item.factory);
    });

    return Array.from(factories);
  }

  /**
   * 获取数据概览
   */
  getDataOverview() {
    return {
      inventory: this.data.inventory.length,
      inspection: this.data.inspection.length,
      production: this.data.production.length,
      batch: this.data.batch.length,
      suppliers: this.getSuppliers().length,
      factories: this.getFactories().length
    };
  }

  /**
   * 刷新数据（重新从localStorage加载）
   */
  refreshData() {
    console.log('🔄 刷新数据...');
    this.loadDataFromLocalStorage();
    console.log('✅ 数据刷新完成');
  }
}

// 创建数据服务实例
export const dataService = new DataService();

// 导出默认实例
export default dataService;
