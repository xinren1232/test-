/**
 * 数据生成器
 * 用于生成符合业务场景的模拟数据，包括库存、质检结果和生产线数据
 */

// ⚠️ 修复：使用正确的数据源 MaterialSupplierMap.js
import {
  getAllMaterials,
  getRandomSupplierForMaterial,
  getSuppliersForMaterial
} from './MaterialSupplierMap.js';

// 工厂列表 - 更新为与数据规则文档一致
const FACTORIES = ['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂'];

// 仓库列表 - 更新为与数据规则文档一致
const WAREHOUSES = ['中央库存', '重庆库存', '深圳库存'];

// 物料状态 - 保持不变
const MATERIAL_STATUSES = ['正常', '风险', '冻结'];

// 物料状态分布权重 - 新增，符合数据规则要求
const MATERIAL_STATUS_WEIGHTS = {
  '正常': 0.7,
  '风险': 0.2,
  '冻结': 0.1
};

// 质量状态
const QUALITY_STATUSES = ['合格', '待检', '不合格', '风险物料(来料)', '风险物料(实验室)', '风险物料(产线)'];

// 冻结原因
const FREEZE_REASONS = {
  '质量问题': ['不良率超标', '安规不合格', '外观不良', '性能测试异常'],
  '供应商问题': ['供应商资质审核不通过', '批次混乱', '交期延误'],
  '技术参数': ['材料参数偏差', '性能不稳定', '兼容性问题'],
  '包装问题': ['包装破损', '标签错误', '防护不足'],
  '其他': ['文档不全', '内部流程问题', '未知原因']
};

// 解决方案
const SOLUTIONS = ['退回处理', '现场返工', '工艺调整', '特采放行', '降级使用', '自然降解'];

// 已使用的批次号记录，用于确保批次号全局唯一
const usedBatchNumbers = new Set();

/**
 * 生成批次号 - 更新为符合数据规则要求的6位数字格式
 * @returns {string} 批次号 (100000-999999范围内的6位数字)
 */
function generateBatchCode() {
  let batchCode;
  do {
    batchCode = (Math.floor(Math.random() * 900000) + 100000).toString();
  } while (usedBatchNumbers.has(batchCode));
  
  usedBatchNumbers.add(batchCode);
  return batchCode;
}

/**
 * 随机选择数组中的一个元素
 * @param {Array} array - 输入数组
 * @returns {any} 随机选择的元素
 */
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 基于权重随机选择
 * @param {Object} weights - 键值对，值为权重
 * @returns {string} 根据权重随机选择的键
 */
function weightedRandomChoice(weights) {
  const options = Object.keys(weights);
  const weightValues = Object.values(weights);
  const totalWeight = weightValues.reduce((a, b) => a + b, 0);
  
  let random = Math.random() * totalWeight;
  for (let i = 0; i < options.length; i++) {
    random -= weightValues[i];
    if (random <= 0) {
      return options[i];
    }
  }
  
  return options[0]; // 默认返回第一个选项
}

/**
 * 生成随机日期 - 更新为符合规则的日期范围(2024-01-01至2025-05-31)
 * @param {number} startDays - 开始日期（相对于基准日期的天数）
 * @param {number} endDays - 结束日期（相对于基准日期的天数）
 * @returns {Date} 随机日期
 */
function randomDate(startDays = 0, endDays = 515) {
  // 基准日期为2024-01-01
  const baseDate = new Date(2024, 0, 1); 
  
  const start = new Date(baseDate);
  start.setDate(baseDate.getDate() + startDays);
  
  const end = new Date(baseDate);
  end.setDate(baseDate.getDate() + Math.min(endDays, 515)); // 最大不超过2025-05-31
  
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * 格式化日期为本地字符串
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * 格式化日期为YYYY-MM-DD格式
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDateYMD(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 生成随机库位 - 调整为适应新的仓库命名
 * @param {string} warehouse - 仓库名称
 * @returns {string} 库位
 */
function generateLocation(warehouse) {
  const prefix = warehouse === '中央库存' ? 'C' : 
                warehouse === '重庆库存' ? 'Q' : 
                warehouse === '深圳库存' ? 'S' : 'X';
  
  const areaIndex = Math.floor(Math.random() * 5) + 1;
  const locationIndex = Math.floor(Math.random() * 30) + 1;
  
  return `${prefix}区-${String(areaIndex).padStart(2, '0')}-${String(locationIndex).padStart(2, '0')}`;
}

/**
 * 生成物料状态 - 更新为使用固定权重
 * @returns {string} 物料状态
 */
function generateMaterialStatus() {
  return weightedRandomChoice(MATERIAL_STATUS_WEIGHTS);
}

/**
 * 根据物料状态生成质量状态
 * @param {string} materialStatus - 物料状态
 * @returns {string} 质量状态
 */
function generateQualityStatus(materialStatus) {
  const rand = Math.random();
  
  if (materialStatus === '冻结') {
    if (rand < 0.6) return '不合格';
    return randomChoice(['风险物料(来料)', '风险物料(实验室)', '风险物料(产线)']);
  } else if (materialStatus === '风险') {
    if (rand < 0.3) return '待检';
    if (rand < 0.7) return randomChoice(['风险物料(来料)', '风险物料(实验室)', '风险物料(产线)']);
    return '合格';
  } else {
    if (rand < 0.05) return '待检';
    if (rand < 0.1) return randomChoice(['风险物料(来料)', '风险物料(实验室)', '风险物料(产线)']);
    return '合格';
  }
}

/**
 * 生成检验记录
 * @param {Object} material - 物料信息
 * @param {string} batchCode - 批次号
 * @param {string} qualityStatus - 质量状态
 * @param {Date} inspectionDate - 检验日期
 * @returns {Object} 检验记录
 */
function generateInspectionRecord(material, batchCode, qualityStatus, inspectionDate) {
  const isPassed = qualityStatus === '合格';
  const isRisk = qualityStatus.includes('风险物料');
  const isWaiting = qualityStatus === '待检';
  
  // 选择检验类型
  const inspectionType = isWaiting ? '待检' : 
                         Math.random() < 0.7 ? '常规检验' : 
                         Math.random() < 0.5 ? 'IPQC抽检' : '质量专项检验';
  
  // 生成检验项目结果
  const inspectionItems = material.inspection_items || ["外观", "尺寸"];
  const itemResults = {};
  
  inspectionItems.forEach(item => {
    if (isWaiting) {
      itemResults[item] = {
        status: '待检',
        value: null,
        standard: `${item}标准规范`,
        remark: null
      };
    } else if (!isPassed && Math.random() < 0.7) {
      // 不合格项
      itemResults[item] = {
        status: '不合格',
        value: `${Math.floor(Math.random() * 100)}`,
        standard: `${item}标准规范`,
        remark: `${item}不符合要求`
      };
    } else if (isRisk && Math.random() < 0.5) {
      // 风险项
      itemResults[item] = {
        status: '风险',
        value: `${Math.floor(Math.random() * 100)}`,
        standard: `${item}标准规范`,
        remark: `${item}接近临界值`
      };
    } else {
      // 合格项
      itemResults[item] = {
        status: '合格',
        value: `${Math.floor(Math.random() * 100)}`,
        standard: `${item}标准规范`,
        remark: null
      };
    }
  });
  
  // 生成问题描述和处理建议
  let issue = null;
  let suggestion = null;
  let conclusion = '测试通过';
  
  if (!isPassed) {
    const issueCategory = randomChoice(Object.keys(FREEZE_REASONS));
    const issueDetail = randomChoice(FREEZE_REASONS[issueCategory]);
    issue = `${issueCategory}-${issueDetail}`;
    suggestion = randomChoice(SOLUTIONS);
    conclusion = `不合格: ${issue}`;
  } else if (isRisk) {
    const issueCategory = randomChoice(Object.keys(FREEZE_REASONS));
    const issueDetail = randomChoice(FREEZE_REASONS[issueCategory]);
    issue = `轻微${issueCategory}-${issueDetail}`;
    suggestion = randomChoice(SOLUTIONS);
    conclusion = `存在风险: ${issue}`;
  }
  
  return {
    id: `INS${Math.floor(Math.random() * 1000000)}`,
    batch_code: batchCode,
    material_code: material.code_prefix + Math.floor(Math.random() * 10000).toString().padStart(6, '0'),
    material_name: material.name,
    inspection_type: inspectionType,
    inspection_date: formatDate(inspectionDate),
    inspector: randomChoice(['张工', '李工', '王工', '赵工', '刘工']),
    status: isWaiting ? '待检' : isPassed && !isRisk ? '合格' : isRisk ? '风险' : '不合格',
    items: itemResults,
    issue_description: issue,
    suggestion: suggestion,
    conclusion: conclusion,
    department: randomChoice(['IQC', 'IPQC', 'QA', 'FQC']),
    location: randomChoice(['实验室', '生产线', '入库检验区', '现场']),
  };
}

/**
 * 生成物料库存数据
 * @param {number} count - 生成数量
 * @returns {Array} 库存数据数组
 */
export function generateInventoryData(count = 100) {
  const allMaterials = getAllMaterials();
  const result = [];
  
  for (let i = 0; i < count; i++) {
    // 随机选择物料
    const material = randomChoice(allMaterials);
    
    // 随机选择供应商
    const supplier = getRandomSupplierForMaterial(material.name);
    
    // 随机选择工厂和仓库
    const factory = randomChoice(FACTORIES);
    const factoryPrefix = factory.charAt(0);
    const warehouse = randomChoice(WAREHOUSES);
    const location = generateLocation(warehouse);
    
    // 生成批次号
    const materialPrefix = material.name.substring(0, 2);
    const batchCode = generateBatchCode();
    
    // 生成物料状态和质量状态
    const status = generateMaterialStatus();
    const quality = generateQualityStatus(status);
    
    // 生成检验日期
    const inspectionDate = randomDate(1, 30);
    
    // 生成保质期
    let shelfLife = null;
    if (material.shelf_life_months) {
      const shelfDate = new Date();
      
      // 大部分正常，少部分临期或过期
      const rand = Math.random();
      if (rand < 0.05) {
        // 已过期
        shelfDate.setMonth(shelfDate.getMonth() - Math.floor(Math.random() * 3));
      } else if (rand < 0.15) {
        // 临期
        shelfDate.setMonth(shelfDate.getMonth() + Math.floor(Math.random() * 2) + 1);
      } else {
        // 正常
        shelfDate.setMonth(shelfDate.getMonth() + Math.floor(Math.random() * (material.shelf_life_months - 3)) + 3);
      }
      
      shelfLife = shelfDate.toLocaleDateString();
    }
    
    // 生成数量
    let quantity;
    if (material.unit === '个' || material.unit === '片') {
      quantity = Math.floor(Math.random() * 5000) + 100;
    } else {
      quantity = Math.floor(Math.random() * 500) + 50;
    }
    
    // 生成库存记录
    const inventoryItem = {
      id: i + 1,
      batch_code: batchCode,
      material_code: material.code_prefix + Math.floor(Math.random() * 10000).toString().padStart(6, '0'),
      material_name: material.name,
      category: material.category,
      factory,
      warehouse,
      location,
      quantity,
      unit: material.unit,
      supplier: supplier,
      status,
      quality,
      inspectionDate: formatDate(inspectionDate),
      shelfLife,
      risk_level: material.risk_level,
      last_updated: formatDate(new Date()),
      freeze_reason: status === '冻结' ? 
                      `${randomChoice(Object.keys(FREEZE_REASONS))}-${randomChoice(FREEZE_REASONS[randomChoice(Object.keys(FREEZE_REASONS))])}` : 
                      null,
      freeze_date: status === '冻结' ? formatDate(randomDate(1, 15)) : null,
      frozen_by: status === '冻结' ? randomChoice(['系统', '张经理', '李经理', '王经理', '质量部']) : null
    };
    
    result.push(inventoryItem);
  }
  
  return result;
}

/**
 * 生成检验记录数据
 * @param {Array} inventoryData - 库存数据
 * @param {number} extraCount - 额外生成的检验记录数量
 * @returns {Array} 检验记录数组
 */
export function generateInspectionData(inventoryData, extraCount = 50) {
  const result = [];
  
  // 为每个库存项生成对应的检验记录 - 确保每个批次有3-5条记录
  const batchRecordCount = {}; // 记录每个批次的测试记录数量
  
  inventoryData.forEach(item => {
    const material = getMaterialInfo(item.material_name);
    if (!material) return;
    
    // 确保每个批次有3-5条测试记录
    const recordCount = Math.floor(Math.random() * 3) + 3; // 3-5条记录
    batchRecordCount[item.batch_code] = recordCount;
    
    // 获取入库日期，确保测试日期晚于入库日期
    const receiveDate = new Date(item.inspectionDate.split(' ')[0]);
    
    for (let i = 0; i < recordCount; i++) {
      // 测试日期必须晚于入库日期
      const testDate = new Date(receiveDate);
      testDate.setDate(testDate.getDate() + Math.floor(Math.random() * 60) + 1); // 入库后1-60天内
      
      // 选择项目和基线ID (确保符合数据规则文档)
      const projectIds = ["X6827", "S665LN", "KI4K", "X6828", "X6831", "KI5K", "S662LN", "S663LN", "S664LN"];
      const projectId = randomChoice(projectIds);
      
      // 根据项目ID确定基线ID (确保一致性)
      let baselineId;
      if (["X6827", "S665LN", "KI4K", "X6828"].includes(projectId)) {
        baselineId = "I6789";
      } else if (["X6831", "KI5K"].includes(projectId)) {
        baselineId = "I6788";
      } else {
        baselineId = "I6787";
      }
      
      // 测试类型 (新品测试/量产例行，各占50%)
      const testItem = Math.random() < 0.5 ? "新品测试" : "量产例行";
      
      // 测试结果 (合格90%, 不合格10%)
      const isPass = Math.random() < 0.9;
      const testOutcome = isPass ? "合格" : "不合格";
      
      // 不合格时必须包含1-2个缺陷类型，合格时禁止出现缺陷描述
      let defect = "";
      if (!isPass) {
        // 获取物料对应的缺陷类型
        const materialDefects = {
          "电池盖": ["划伤", "掉漆", "起翘", "色差"],
          "中框": ["变形", "破裂", "掉漆", "尺寸异常"],
          "手机卡托": ["注塑不良", "尺寸异常", "断裂", "毛刺"],
          "侧键": ["脱落", "卡键", "尺寸异常", "松动"],
          "装饰件": ["掉色", "偏位", "脱落", "掉色"],
          "LCD显示屏": ["漏光", "暗点", "花屏", "偏色"],
          "OLED显示屏": ["闪屏", "mura", "亮点", "亮线"],
          "摄像头模组": ["刮花", "底座破裂", "脏污", "无法拍照"],
          "电池": ["起鼓", "松动", "漏液", "电压不稳定"],
          "充电器": ["无法充电", "外壳破裂", "输出功率异常", "发热异常"],
          "扬声器": ["无声", "杂音", "音量小", "破裂"],
          "听筒": ["无声", "杂音", "音量小", "破裂"],
          "保护套": ["尺寸偏差", "发黄", "开孔错位", "模具压痕"],
          "标签": ["脱落", "错印", "logo错误", "尺寸异常"],
          "包装盒": ["破损", "logo错误", "错印", "尺寸异常"]
        };
        
        const availableDefects = materialDefects[item.material_name] || ["缺陷1", "缺陷2", "缺陷3", "缺陷4"];
        const defectCount = Math.random() < 0.5 ? 1 : 2; // 1-2个缺陷
        
        if (defectCount === 1) {
          defect = randomChoice(availableDefects);
        } else {
          // 随机选择两个不同的缺陷
          const firstDefect = randomChoice(availableDefects);
          let secondDefect;
          do {
            secondDefect = randomChoice(availableDefects);
          } while (secondDefect === firstDefect);
          
          defect = `${firstDefect},${secondDefect}`;
        }
      }
      
      // 生成测试记录ID
      const batchPrefix = item.batch_code.substring(0, 4);
      const randomSuffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const testId = `TEST-${item.material_code}-${batchPrefix}-${randomSuffix}`;
      
      // 创建测试记录
      const testRecord = {
        id: testId,
        testDate: formatDateYMD(testDate),
        projectId,
        baselineId,
        material_code: item.material_code,
        material_name: item.material_name,
        batch_code: item.batch_code,
        supplier: item.supplier,
        testItem,
        result: testOutcome,
        defect
      };
      
      result.push(testRecord);
    }
  });
  
  // 排序测试记录
  result.sort((a, b) => new Date(b.testDate) - new Date(a.testDate));
  
  return result;
}

/**
 * 生成生产线数据
 * @param {Array} inventoryData - 库存数据
 * @param {Array} testData - 测试数据
 * @returns {Array} 生产线数据数组
 */
export function generateProductionData(inventoryData, testData) {
  const result = [];
  
  // 记录每个批次的上线记录数量，确保有5-8条记录
  const batchRecordCount = {};
  
  // 为每个库存项生成上线记录
  inventoryData.forEach(item => {
    // 确保每个批次有5-8条上线记录
    const recordCount = Math.floor(Math.random() * 4) + 5; // 5-8条记录
    batchRecordCount[item.batch_code] = recordCount;
    
    // 找出该批次的最新测试记录，确保上线检验日期晚于测试日期
    let latestTestDate = null;
    testData.forEach(test => {
      if (test.batch_code === item.batch_code) {
        const testDate = new Date(test.testDate);
        if (!latestTestDate || testDate > latestTestDate) {
          latestTestDate = testDate;
        }
      }
    });
    
    // 如果没有测试记录，使用入库日期
    if (!latestTestDate) {
      latestTestDate = new Date(item.inspectionDate.split(' ')[0]);
    }
    
    // 生成多条上线记录
    for (let i = 0; i < recordCount; i++) {
      // 确保工厂与仓库中的工厂一致
      const factory = item.factory;
      
      // 生产线
      const productionLine = randomChoice(["01线", "02线", "03线", "04线"]);
      
      // 选择项目和基线ID (确保符合数据规则文档)
      const projectIds = ["X6827", "S665LN", "KI4K", "X6828", "X6831", "KI5K", "S662LN", "S663LN", "S664LN"];
      const projectId = randomChoice(projectIds);
      
      // 根据项目ID确定基线ID (确保一致性)
      let baselineId;
      if (["X6827", "S665LN", "KI4K", "X6828"].includes(projectId)) {
        baselineId = "I6789";
      } else if (["X6831", "KI5K"].includes(projectId)) {
        baselineId = "I6788";
      } else {
        baselineId = "I6787";
      }
      
      // 上线检验日期必须晚于测试日期
      const inspectionDate = new Date(latestTestDate);
      inspectionDate.setDate(inspectionDate.getDate() + Math.floor(Math.random() * 30) + 1); // 测试后1-30天内
      
      // 不良率 (80%在0-5%之间，20%在5-10%之间)
      let defectRate;
      if (Math.random() < 0.8) {
        defectRate = (Math.random() * 5.0).toFixed(1) + '%'; // 0.0%-5.0%
      } else {
        defectRate = (5.0 + Math.random() * 5.0).toFixed(1) + '%'; // 5.0%-10.0%
      }
      
      // 不良现象 (不良率>0.5%时包含1-2个缺陷类型)
      let defect = "";
      if (parseFloat(defectRate) > 0.5) {
        // 获取物料对应的缺陷类型
        const materialDefects = {
          "电池盖": ["划伤", "掉漆", "起翘", "色差"],
          "中框": ["变形", "破裂", "掉漆", "尺寸异常"],
          "手机卡托": ["注塑不良", "尺寸异常", "断裂", "毛刺"],
          "侧键": ["脱落", "卡键", "尺寸异常", "松动"],
          "装饰件": ["掉色", "偏位", "脱落", "掉色"],
          "LCD显示屏": ["漏光", "暗点", "花屏", "偏色"],
          "OLED显示屏": ["闪屏", "mura", "亮点", "亮线"],
          "摄像头模组": ["刮花", "底座破裂", "脏污", "无法拍照"],
          "电池": ["起鼓", "松动", "漏液", "电压不稳定"],
          "充电器": ["无法充电", "外壳破裂", "输出功率异常", "发热异常"],
          "扬声器": ["无声", "杂音", "音量小", "破裂"],
          "听筒": ["无声", "杂音", "音量小", "破裂"],
          "保护套": ["尺寸偏差", "发黄", "开孔错位", "模具压痕"],
          "标签": ["脱落", "错印", "logo错误", "尺寸异常"],
          "包装盒": ["破损", "logo错误", "错印", "尺寸异常"]
        };
        
        const availableDefects = materialDefects[item.material_name] || ["缺陷1", "缺陷2", "缺陷3", "缺陷4"];
        const defectCount = Math.random() < 0.5 ? 1 : 2; // 1-2个缺陷
        
        if (defectCount === 1) {
          defect = randomChoice(availableDefects);
        } else {
          // 随机选择两个不同的缺陷
          const firstDefect = randomChoice(availableDefects);
          let secondDefect;
          do {
            secondDefect = randomChoice(availableDefects);
          } while (secondDefect === firstDefect);
          
          defect = `${firstDefect},${secondDefect}`;
        }
      }
      
      // 创建上线记录
      const record = {
        id: `PROD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      factory,
        productionLine,
        baselineId,
        projectId,
        material_code: item.material_code,
        material_name: item.material_name,
        supplier: item.supplier,
        batch_code: item.batch_code,
        defectRate,
        defect,
        inspectionDate: formatDateYMD(inspectionDate)
      };
      
      result.push(record);
    }
  });
  
  // 排序上线记录
  result.sort((a, b) => new Date(b.inspectionDate) - new Date(a.inspectionDate));
  
  return result;
}

/**
 * 生成完整数据集
 * @returns {Object} 完整数据集
 */
export function generateCompleteDataset() {
  // 数据量符合规则要求 (仓库:200±5%, 测试:540±5%, 上线:1080±5%)
  const inventoryCount = Math.floor(200 * (Math.random() * 0.1 + 0.95)); // 190-210
  const inventoryData = generateInventoryData(inventoryCount);
  
  // 测试数据基于库存数据生成，确保每个批次有3-5条记录
  const testData = generateInspectionData(inventoryData);
  
  // 上线数据基于库存数据生成，确保每个批次有5-8条记录
  const productionData = generateProductionData(inventoryData, testData);
  
  return {
    inventory: inventoryData,
    inspection: testData,
    production: productionData
  };
}

export default {
  generateInventoryData,
  generateInspectionData,
  generateProductionData,
  generateCompleteDataset
}; 