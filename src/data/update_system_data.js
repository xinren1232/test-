/**
 * 系统数据更新脚本
 * 用于基于当前数据规则批量更新库存、上线和测试三个页面的数据
 */

import DataUpdateService from '../services/DataUpdateService.js';
import { ElMessage } from 'element-plus';

/**
 * 更新库存数据
 * @param {Object} options 选项
 * @returns {Promise<boolean>} 是否成功
 */
export async function updateInventoryData(options = {}) {
  try {
    const result = await DataUpdateService.updateInventoryData({
      count: options.count || 200,
      clearExisting: options.clearExisting !== false,
      saveToPersistent: true,
      useDistribution: options.useDistribution !== false
    });
    
    return !!result;
  } catch (error) {
    console.error('更新库存数据失败:', error);
    return false;
  }
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