/**
 * 系统数据更新脚本
 * 使用数据生成器创建新的数据集并更新系统
 */

import DataUpdateService from '../services/DataUpdateService.js';
import { ElMessage } from 'element-plus';
import materialSupplierMapping from './material_supplier_mapping.js';

/**
 * 更新库存数据
 * @param {Object} options 选项
 * @returns {Promise<boolean>} 是否成功
 */
export async function updateInventoryData(options = {}) {
  try {
    // 使用material_supplier_mapping.js中的物料-供应商映射规则
    const allMaterials = [];
    
    // 获取所有物料类别
    const categories = Object.keys(materialSupplierMapping);
    
    // 从每个类别中收集物料信息
    for (const categoryKey of categories) {
      const category = materialSupplierMapping[categoryKey];
      for (const material of category.materials) {
        allMaterials.push({
          ...material,
          categoryKey,
          category: category.category
        });
      }
    }
    
    // 根据配置生成库存数据
    const count = options.count || 200;
    const clearExisting = options.clearExisting !== false;
    const useDistribution = options.useDistribution !== false;
    const inventoryItems = [];
    
    // 使用物料类别分布比例
    if (useDistribution) {
      // 定义不同类别的物料分布比例
      const distribution = {
        "structural-mass": 0.35,    // 结构件-量产管理组
        "electronic-patch": 0.25,   // 电子贴片料
        "screen": 0.15,             // 屏物料组
        "misc": 0.25                // 杂项物料组
      };
      
      // 根据分布比例生成不同类别的库存数据
      for (const categoryKey in distribution) {
        if (!materialSupplierMapping[categoryKey]) continue;
        
        const categoryMaterials = allMaterials.filter(m => m.categoryKey === categoryKey);
        if (categoryMaterials.length === 0) continue;
        
        const categoryCount = Math.floor(count * distribution[categoryKey]);
        
        for (let i = 0; i < categoryCount; i++) {
          // 从当前类别中选择一个随机物料
          const materialIndex = i % categoryMaterials.length;
          const material = categoryMaterials[materialIndex];
          
          // 为该物料选择一个合法的供应商
          const supplier = material.suppliers[Math.floor(Math.random() * material.suppliers.length)];
          
          // 生成库存项数据
          const item = generateInventoryItemFromMaterial(material, supplier);
          inventoryItems.push(item);
        }
      }
    } else {
      // 均匀分布所有物料
      for (let i = 0; i < count; i++) {
        const materialIndex = i % allMaterials.length;
        const material = allMaterials[materialIndex];
        
        // 为该物料选择一个合法的供应商
        const supplier = material.suppliers[Math.floor(Math.random() * material.suppliers.length)];
        
        // 生成库存项数据
        const item = generateInventoryItemFromMaterial(material, supplier);
        inventoryItems.push(item);
      }
    }
    
    // 保存库存数据
    const existingData = clearExisting ? [] : JSON.parse(localStorage.getItem('inventory_data') || '[]');
    const newData = [...existingData, ...inventoryItems];
    localStorage.setItem('inventory_data', JSON.stringify(newData));
    
    console.log(`已生成${inventoryItems.length}条库存数据`);
    return true;
  } catch (error) {
    console.error('更新库存数据失败:', error);
    return false;
  }
}

/**
 * 根据物料和供应商信息生成单个库存项
 * @param {Object} material 物料信息
 * @param {string} supplier 供应商名称
 * @returns {Object} 库存项数据
 */
function generateInventoryItemFromMaterial(material, supplier) {
  // 获取随机工厂
  const factories = ['上海工厂', '深圳工厂', '北京工厂', '广州工厂', '武汉工厂', '郑州工厂', '成都工厂'];
  const factory = factories[Math.floor(Math.random() * factories.length)];
  
  // 获取随机仓库
  const warehouses = ['主仓库', '原材料仓', '半成品仓', '成品仓'];
  const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
  
  // 生成批次号
  const today = new Date();
  const productionDate = new Date(today);
  productionDate.setDate(today.getDate() - Math.floor(Math.random() * 90));
  
  const batchNumber = generateBatchNumber(
    material.code_prefix,
    factory.substr(0, 1),
    productionDate
  );
  
  // 生成物料编码
  const materialCode = `${material.code_prefix}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  
  // 生成状态
  const status = generateStatusByRisk(material.risk_level);
  
  // 生成随机库位
  const locationPrefix = warehouse === '主仓库' ? 'A' : 
                        warehouse === '原材料仓' ? 'R' : 
                        warehouse === '半成品仓' ? 'S' : 
                        warehouse === '成品仓' ? 'F' : 'X';
  const areaNum = Math.floor(Math.random() * 5) + 1;
  const locNum = Math.floor(Math.random() * 30) + 1;
  const location = `${locationPrefix}区-${areaNum.toString().padStart(2, '0')}-${locNum.toString().padStart(2, '0')}`;
  
  // 生成数量
  let quantity;
  if (material.unit === '个' || material.unit === '片') {
    quantity = Math.floor(Math.random() * 5000) + 100;
  } else {
    quantity = Math.floor(Math.random() * 500) + 50;
  }
  
  // 生成保质期
  const expiryDate = new Date(today);
  if (material.shelf_life_months) {
    // 大部分正常，少部分临期或过期
    const rand = Math.random();
    if (rand < 0.05) {
      // 已过期
      expiryDate.setMonth(expiryDate.getMonth() - Math.floor(Math.random() * 3));
    } else if (rand < 0.15) {
      // 临期
      expiryDate.setMonth(expiryDate.getMonth() + Math.floor(Math.random() * 2) + 1);
    } else {
      // 正常
      expiryDate.setMonth(expiryDate.getMonth() + Math.floor(Math.random() * (material.shelf_life_months - 3)) + 3);
    }
  } else {
    // 默认一年
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  }
  
  // 生成库存项
  return {
    id: `INV${Math.floor(Math.random() * 1000000)}`,
    batchNo: batchNumber,
    materialCode,
    materialName: material.name,
    category: material.category,
    factory,
    warehouse,
    location,
    quantity,
    unit: material.unit,
    supplier,
    status,
    quality: generateQualityStatus(status, material.risk_level),
    inspectionDate: formatDate(new Date(productionDate.getTime() + Math.random() * (today - productionDate))),
    shelfLife: expiryDate.toISOString().split('T')[0],
    risk_level: material.risk_level,
    last_updated: formatDate(new Date()),
    freeze_reason: status === '冻结' ? generateFreezeReason() : null,
    remarks: ''
  };
}

/**
 * 生成批次号
 * @param {string} prefix 物料前缀
 * @param {string} factoryCode 工厂代码
 * @param {Date} date 生产日期
 * @returns {string} 批次号
 */
function generateBatchNumber(prefix, factoryCode, date) {
  const year = date.getFullYear().toString().substr(2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${prefix}-${factoryCode}${year}${month}${day}-${random}`;
}

/**
 * 根据风险等级生成状态
 * @param {string} riskLevel 风险等级
 * @returns {string} 状态
 */
function generateStatusByRisk(riskLevel) {
  const rand = Math.random();
  
  if (riskLevel === '高') {
    if (rand < 0.15) return '冻结';
    if (rand < 0.40) return '风险';
    return '正常';
  } else if (riskLevel === '中') {
    if (rand < 0.08) return '冻结';
    if (rand < 0.25) return '风险';
    return '正常';
  } else {
    if (rand < 0.03) return '冻结';
    if (rand < 0.15) return '风险';
    return '正常';
  }
}

/**
 * 根据状态生成质量状态
 * @param {string} status 物料状态
 * @param {string} riskLevel 风险等级
 * @returns {string} 质量状态
 */
function generateQualityStatus(status, riskLevel) {
  if (status === '冻结') {
    return Math.random() < 0.7 ? '不合格' : '待检验';
  } else if (status === '风险') {
    const rand = Math.random();
    if (riskLevel === '高') {
      if (rand < 0.4) return '不合格';
      if (rand < 0.7) return '风险物料(来料)';
      return '待复检';
    } else {
      if (rand < 0.3) return '不合格';
      if (rand < 0.6) return '风险物料(来料)';
      return '待复检';
    }
  } else {
    return Math.random() < 0.95 ? '合格' : '待检验';
  }
}

/**
 * 生成冻结原因
 * @returns {string} 冻结原因
 */
function generateFreezeReason() {
  const reasonCategories = [
    '质量问题-不良率超标',
    '质量问题-安规不合格',
    '质量问题-外观不良',
    '供应商问题-供应商资质审核不通过',
    '供应商问题-批次混乱',
    '技术参数-材料参数偏差',
    '技术参数-性能不稳定',
    '包装问题-包装破损',
    '其他-文档不全'
  ];
  
  return reasonCategories[Math.floor(Math.random() * reasonCategories.length)];
}

/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的日期字符串 YYYY-MM-DD
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * 更新测试跟踪数据
 * @param {Object} options 选项
 * @returns {Promise<boolean>} 是否成功
 */
export async function updateLabData(options = {}) {
  try {
    // 从库存数据中提取部分数据作为测试数据
    const inventoryItems = DataUpdateService.getExistingInventoryData();
    const testCount = options.count || 150;
    
    // 选择随机物料作为测试样本
    const testItems = [];
    const selectedItems = new Set();
    
    while (testItems.length < testCount && selectedItems.size < inventoryItems.length) {
      const idx = Math.floor(Math.random() * inventoryItems.length);
      
      if (!selectedItems.has(idx)) {
        selectedItems.add(idx);
        const item = inventoryItems[idx];
        
        // 创建测试项
        const testItem = {
          id: `TEST${Math.floor(Math.random() * 1000000)}`,
          batchNo: item.batchNo,
          materialCode: item.materialCode,
          materialName: item.materialName,
          category: item.category,
          supplier: item.supplier,
          factory: item.factory,
          quantity: Math.floor(item.quantity * (Math.random() * 0.4 + 0.1)), // 取10%-50%的数量作为测试样本
          unit: item.unit,
          risk_level: item.risk_level,
          test_status: generateTestStatus(item.risk_level),
          test_items: generateTestItems(item.category, item.risk_level),
          test_start_time: generateRandomTime(30), // 近30天内的随机时间
          test_end_time: null, // 根据测试状态可能为空
          test_result: null, // 根据测试状态可能为空
          test_engineer: generateRandomEngineer(),
          notes: '',
          created_at: new Date().toISOString()
        };
        
        // 如果测试已完成，添加结束时间和结果
        if (testItem.test_status === '已完成') {
          testItem.test_end_time = generateRandomTime(5, new Date(testItem.test_start_time));
          testItem.test_result = generateTestResult(item.risk_level);
          
          if (testItem.test_result === '不合格') {
            testItem.notes = `${testItem.test_items[Math.floor(Math.random() * testItem.test_items.length)]}测试不通过`;
          }
        } else if (testItem.test_status === '测试中') {
          // 测试中的项目设置一个预计完成时间
          testItem.estimated_end_time = generateRandomTime(-3, new Date(testItem.test_start_time)); // 未来3天内
        }
        
        testItems.push(testItem);
      }
    }
    
    // 保存测试数据
    localStorage.setItem('lab_test_data', JSON.stringify(testItems));
    
    return true;
  } catch (error) {
    console.error('更新测试数据失败:', error);
    return false;
  }
}

/**
 * 更新上线跟踪数据
 * @param {Object} options 选项
 * @returns {Promise<boolean>} 是否成功
 */
export async function updateFactoryData(options = {}) {
  try {
    // 获取库存数据和测试数据
    const inventoryItems = DataUpdateService.getExistingInventoryData();
    const testData = JSON.parse(localStorage.getItem('lab_test_data') || '[]');
    
    // 筛选出测试合格的物料
    const qualifiedItems = testData.filter(item => item.test_result === '合格');
    
    // 创建生产线数据
    const productionLines = [
      { id: 'LINE001', name: 'A线-手机组装', capacity: 5000, current_load: 0 },
      { id: 'LINE002', name: 'B线-平板组装', capacity: 3000, current_load: 0 },
      { id: 'LINE003', name: 'C线-笔记本组装', capacity: 2000, current_load: 0 },
      { id: 'LINE004', name: 'D线-配件组装', capacity: 8000, current_load: 0 }
    ];
    
    // 创建上线数据
    const factoryCount = options.count || 120;
    const factoryItems = [];
    
    for (let i = 0; i < factoryCount; i++) {
      // 选择一个测试合格的物料或随机库存物料
      let sourceItem;
      
      if (qualifiedItems.length > 0 && Math.random() < 0.7) {
        sourceItem = qualifiedItems[Math.floor(Math.random() * qualifiedItems.length)];
      } else {
        sourceItem = inventoryItems[Math.floor(Math.random() * inventoryItems.length)];
      }
      
      // 选择一个生产线
      const line = productionLines[Math.floor(Math.random() * productionLines.length)];
      
      // 计算上线数量
      const quantity = Math.floor(sourceItem.quantity * (Math.random() * 0.5 + 0.3)); // 30%-80%的数量上线
      
      // 更新生产线负载
      line.current_load += quantity;
      
      // 创建上线项
      const factoryItem = {
        id: `PROD${Math.floor(Math.random() * 1000000)}`,
        batchNo: sourceItem.batchNo,
        materialCode: sourceItem.materialCode,
        materialName: sourceItem.materialName,
        category: sourceItem.category,
        supplier: sourceItem.supplier,
        production_line: line.id,
        line_name: line.name,
        quantity: quantity,
        unit: sourceItem.unit,
        risk_level: sourceItem.risk_level,
        production_status: generateProductionStatus(),
        online_time: generateRandomTime(15), // 近15天内的随机时间
        scheduled_completion_time: generateRandomTime(-10, new Date()), // 未来10天内
        efficiency: generateEfficiency(sourceItem.risk_level),
        defect_rate: generateDefectRate(sourceItem.risk_level),
        has_alerts: Math.random() < 0.15, // 15%的概率有告警
        alert_message: '',
        created_at: new Date().toISOString()
      };
      
      // 如果有告警，生成告警消息
      if (factoryItem.has_alerts) {
        const alertTypes = ['质量异常', '效率下降', '设备故障', '物料不足'];
        factoryItem.alert_message = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        factoryItem.alert_level = Math.random() < 0.3 ? '严重' : '一般';
      }
      
      factoryItems.push(factoryItem);
    }
    
    // 保存上线数据和生产线数据
    localStorage.setItem('factory_data', JSON.stringify(factoryItems));
    localStorage.setItem('production_lines', JSON.stringify(productionLines));
    
    return true;
  } catch (error) {
    console.error('更新上线数据失败:', error);
    return false;
  }
}

/**
 * 生成测试状态
 * @param {string} riskLevel 风险等级
 * @returns {string} 测试状态
 */
function generateTestStatus(riskLevel) {
  const rand = Math.random();
  
  if (riskLevel === '高') {
    if (rand < 0.6) return '已完成';
    if (rand < 0.9) return '测试中';
    return '待测试';
  } else if (riskLevel === '中') {
    if (rand < 0.5) return '已完成';
    if (rand < 0.8) return '测试中';
    return '待测试';
  } else {
    if (rand < 0.4) return '已完成';
    if (rand < 0.7) return '测试中';
    return '待测试';
  }
}

/**
 * 生成测试项目
 * @param {string} category 物料类别
 * @param {string} riskLevel 风险等级
 * @returns {Array} 测试项目列表
 */
function generateTestItems(category, riskLevel) {
  const baseItems = {
    '结构件': ['抗压测试', '抗弯测试', '抗扭测试', '表面硬度', '尺寸精度'],
    '电子贴片料': ['电阻测试', '电压测试', '电流测试', '温度特性', '焊接性能'],
    '屏幕': ['显示质量', '触控灵敏度', '亮度测试', '颜色校准', '视角测试'],
    '杂项物料': ['基础功能测试', '耐用性测试', '环境适应性', '可靠性测试']
  };
  
  // 根据物料类别选择基础测试项
  const categoryKey = category.includes('结构') ? '结构件' : 
                     category.includes('电子') ? '电子贴片料' :
                     category.includes('屏幕') ? '屏幕' : '杂项物料';
  
  const items = [...baseItems[categoryKey]];
  
  // 高风险物料增加额外测试项
  if (riskLevel === '高') {
    items.push('加速老化测试', '极限条件测试');
  } else if (riskLevel === '中') {
    items.push('加速老化测试');
  }
  
  // 随机选择3-5个测试项
  const count = Math.floor(Math.random() * 3) + 3; // 3-5个
  const result = [];
  
  while (result.length < count && items.length > 0) {
    const idx = Math.floor(Math.random() * items.length);
    result.push(items[idx]);
    items.splice(idx, 1);
  }
  
  return result;
}

/**
 * 生成测试结果
 * @param {string} riskLevel 风险等级
 * @returns {string} 测试结果
 */
function generateTestResult(riskLevel) {
  const rand = Math.random();
  
  if (riskLevel === '高') {
    if (rand < 0.7) return '合格';
    return '不合格';
  } else if (riskLevel === '中') {
    if (rand < 0.85) return '合格';
    return '不合格';
  } else {
    if (rand < 0.95) return '合格';
    return '不合格';
  }
}

/**
 * 生成随机时间
 * @param {number} dayRange 天数范围，负数表示未来
 * @param {Date} startDate 起始日期，默认为当前日期
 * @returns {string} ISO日期字符串
 */
function generateRandomTime(dayRange, startDate = new Date()) {
  const date = new Date(startDate);
  const sign = dayRange >= 0 ? -1 : 1; // 正数表示过去，负数表示未来
  const absDayRange = Math.abs(dayRange);
  
  // 随机天数
  const days = Math.floor(Math.random() * absDayRange);
  date.setDate(date.getDate() + sign * days);
  
  // 随机时间
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  date.setSeconds(Math.floor(Math.random() * 60));
  
  return date.toISOString();
}

/**
 * 生成随机工程师
 * @returns {string} 工程师姓名
 */
function generateRandomEngineer() {
  const engineers = ['张工', '李工', '王工', '赵工', '刘工', '陈工', '杨工', '黄工', '吴工', '周工'];
  return engineers[Math.floor(Math.random() * engineers.length)];
}

/**
 * 生成生产状态
 * @returns {string} 生产状态
 */
function generateProductionStatus() {
  const statuses = ['准备中', '生产中', '已完成', '暂停'];
  const weights = [0.15, 0.5, 0.3, 0.05]; // 权重
  
  const rand = Math.random();
  let cumulativeWeight = 0;
  
  for (let i = 0; i < statuses.length; i++) {
    cumulativeWeight += weights[i];
    if (rand < cumulativeWeight) {
      return statuses[i];
    }
  }
  
  return statuses[0];
}

/**
 * 生成生产效率
 * @param {string} riskLevel 风险等级
 * @returns {number} 效率百分比
 */
function generateEfficiency(riskLevel) {
  let base = 0;
  
  if (riskLevel === '高') {
    base = 75 + Math.floor(Math.random() * 15); // 75-90%
  } else if (riskLevel === '中') {
    base = 80 + Math.floor(Math.random() * 15); // 80-95%
  } else {
    base = 85 + Math.floor(Math.random() * 13); // 85-98%
  }
  
  return base;
}

/**
 * 生成不良率
 * @param {string} riskLevel 风险等级
 * @returns {number} 不良率百分比
 */
function generateDefectRate(riskLevel) {
  let base = 0;
  
  if (riskLevel === '高') {
    base = 3 + Math.random() * 7; // 3-10%
  } else if (riskLevel === '中') {
    base = 1 + Math.random() * 4; // 1-5%
  } else {
    base = 0.5 + Math.random() * 1.5; // 0.5-2%
  }
  
  return parseFloat(base.toFixed(2));
}

/**
 * 更新所有系统数据
 * @param {Object} options 选项
 * @returns {Promise<Object>} 更新结果
 */
export async function updateAllSystemData(options = {}) {
  const results = {
    inventory: false,
    lab: false,
    factory: false
  };
  
  // 更新库存数据
  ElMessage.info('正在更新库存数据...');
  results.inventory = await updateInventoryData(options);
  
  if (results.inventory) {
    ElMessage.success('库存数据更新成功');
    
    // 更新测试数据
    ElMessage.info('正在更新测试数据...');
    results.lab = await updateLabData(options);
    
    if (results.lab) {
      ElMessage.success('测试数据更新成功');
      
      // 更新上线数据
      ElMessage.info('正在更新上线数据...');
      results.factory = await updateFactoryData(options);
      
      if (results.factory) {
        ElMessage.success('上线数据更新成功');
      } else {
        ElMessage.error('更新上线数据失败');
      }
    } else {
      ElMessage.error('更新测试数据失败');
    }
  } else {
    ElMessage.error('更新库存数据失败');
  }
  
  return results;
}

export default {
  updateInventoryData,
  updateLabData,
  updateFactoryData,
  updateAllSystemData
}; 