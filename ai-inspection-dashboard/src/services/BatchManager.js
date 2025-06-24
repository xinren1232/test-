/**
 * 批次管理器
 * 负责管理物料批次的一致性和映射关系
 */

import { v4 as uuidv4 } from 'uuid';
import { getAllMaterials, getSuppliersForMaterial } from '../data/MaterialSupplierMap.js';

class BatchManager {
  constructor() {
    // 初始化状态标志
    this.initialized = false;
    
    // 批次映射：key是物料名称+供应商，value是对应的批次信息数组
    this.batchMappings = new Map();
    
    // 物料编码映射：key是物料名称+供应商，value是对应的物料编码
    this.materialCodeMappings = new Map();

    // 每个物料-供应商组合生成的批次数量
    this.BATCHES_PER_COMBINATION = 3;

    // 保存所有批次的数组，用于批量获取
    this.allBatches = [];
  }

  /**
   * 初始化批次管理器
   * 预先为所有物料-供应商组合生成固定批次
   */
  initialize() {
    console.log('初始化批次管理器...');

    // 获取所有物料
    const allMaterials = getAllMaterials();
    
    console.log(`物料总数: ${allMaterials.length}`);
    
    // 记录每种物料的供应商数量
    const materialStats = {};
    let totalCombinations = 0;
    
    // 为每个物料-供应商组合生成固定批次
    allMaterials.forEach(material => {
      const materialName = material.name;
      const suppliers = material.suppliers || [];
      
      materialStats[materialName] = suppliers.length;
      totalCombinations += suppliers.length;
      
      console.log(`物料 [${materialName}] 有 ${suppliers.length} 个供应商`);
      
      suppliers.forEach(supplier => {
        const key = `${materialName}_${supplier}`;
        const batches = [];
        
        // 生成固定数量的批次
        for (let i = 0; i < this.BATCHES_PER_COMBINATION; i++) {
          const batchNo = this.generateConsistentBatchNo(materialName, supplier, i);
          const materialCode = this.generateConsistentMaterialCode(materialName, supplier);
          
          const batch = {
            batchNo,
            materialCode,
            materialName,
            supplier,
            createdAt: new Date().toISOString(),
            index: i
          };
          
          batches.push(batch);
          this.allBatches.push(batch);
        }
        
        // 保存批次映射
        this.batchMappings.set(key, batches);
        this.materialCodeMappings.set(key, this.generateConsistentMaterialCode(materialName, supplier));
      });
    });
    
    console.log(`物料-供应商组合总数: ${totalCombinations}`);
    console.log(`批次管理器初始化完成，共生成${this.allBatches.length}个批次`);
    console.log(`每个物料-供应商组合的批次数: ${this.BATCHES_PER_COMBINATION}`);
    console.log(`理论总批次数: ${totalCombinations * this.BATCHES_PER_COMBINATION}`);
    
    this.initialized = true;
    
    return this.getAllBatchCount();
  }

  /**
   * 获取总批次数量
   * @returns {number} 总批次数量
   */
  getAllBatchCount() {
    return this.allBatches.length;
  }

  /**
   * 获取所有批次
   * @returns {Array} 所有批次的数组
   */
  getAllBatches() {
    return this.allBatches;
  }

  /**
   * 获取特定物料-供应商组合的所有批次
   * @param {string} materialName 物料名称
   * @param {string} supplier 供应商
   * @returns {Array} 批次数组
   */
  getBatchesForMaterialAndSupplier(materialName, supplier) {
    const key = `${materialName}_${supplier}`;
    return this.batchMappings.get(key) || [];
  }

  /**
   * 获取批次映射
   * @param {string} projectId 项目ID (可选)
   * @param {string} materialName 物料名称
   * @param {string} supplier 供应商
   * @param {number} index 批次索引 (可选，默认随机选择)
   * @returns {Object} 批次映射对象，包含batchNo和materialCode
   */
  getBatchMapping(projectId, materialName, supplier, index = null) {
    const key = `${materialName}_${supplier}`;
    
    // 如果已经存在该物料+供应商的批次映射，则返回指定索引或随机一个
    if (this.batchMappings.has(key)) {
      const batches = this.batchMappings.get(key);
      if (batches && batches.length > 0) {
        // 如果指定了索引，返回对应索引的批次
        if (index !== null && index >= 0 && index < batches.length) {
          return batches[index];
        }
        // 否则随机选择一个批次
        return batches[Math.floor(Math.random() * batches.length)];
      }
    }
    
    // 如果没有找到批次映射，创建一个新的（应该不会发生，因为initialize已经创建了所有组合）
    console.warn(`未找到物料${materialName}和供应商${supplier}的批次映射，创建新批次`);
    const batchNo = this.generateConsistentBatchNo(materialName, supplier, 0);
    const materialCode = this.generateConsistentMaterialCode(materialName, supplier);
    
    // 创建批次映射对象
    const mapping = {
      batchNo,
      materialCode,
      projectId,
      materialName,
      supplier,
      createdAt: new Date().toISOString()
    };
    
    // 保存映射
    const batches = [mapping];
    this.batchMappings.set(key, batches);
    this.materialCodeMappings.set(key, materialCode);
    this.allBatches.push(mapping);
    
    return mapping;
  }

  /**
   * 生成一致性的批次号
   * @param {string} materialName 物料名称
   * @param {string} supplier 供应商
   * @param {number} index 批次索引
   * @returns {string} 批次号
   */
  generateConsistentBatchNo(materialName, supplier, index) {
    // 使用固定规则生成批次号
    // 物料的前两个字符 + 供应商首字符 + 索引 + 随机3位数
    const materialPrefix = this.getChineseFirstLetters(materialName).substring(0, 2).toUpperCase();
    const supplierPrefix = this.getChineseFirstLetters(supplier).substring(0, 1).toUpperCase();
    const randomPart = (100 + Math.floor(Math.random() * 900)).toString();
    
    return `${materialPrefix}${supplierPrefix}${index + 1}${randomPart}`;
  }

  /**
   * 生成一致性的物料编码
   * @param {string} materialName 物料名称
   * @param {string} supplier 供应商
   * @returns {string} 物料编码
   */
  generateConsistentMaterialCode(materialName, supplier) {
    // 查找物料的code_prefix
    const materials = getAllMaterials();
    const material = materials.find(m => m.name === materialName);
    let prefix = 'M';
    if (material && material.code_prefix) {
      prefix = material.code_prefix;
    }
    
    // 供应商首字母
    const supplierPrefix = this.getChineseFirstLetters(supplier).substring(0, 1).toUpperCase();
    
    // 生成一个一致的数字部分
    const materialHash = this.simpleStringHash(materialName) % 1000;
    const supplierHash = this.simpleStringHash(supplier) % 100;
    
    return `${prefix}-${supplierPrefix}${materialHash}${supplierHash}`;
  }

  /**
   * 获取中文字符串的首字母
   * @param {string} str 中文字符串
   * @returns {string} 首字母
   */
  getChineseFirstLetters(str) {
    // 简化处理，直接返回前两个字符的拼音模拟
    // 在实际应用中，可以使用拼音库获取准确的拼音首字母
    const pinyinMap = {
      '电': 'D', '池': 'C', '盖': 'G', '中': 'Z', '框': 'K', '手': 'S', '机': 'J', '卡': 'K', '托': 'T',
      '侧': 'C', '键': 'J', '装': 'Z', '饰': 'S', '件': 'J', 'L': 'L', 'C': 'C', 'D': 'D', '显': 'X',
      '示': 'S', '屏': 'P', 'O': 'O', 'L': 'L', 'E': 'E', '摄': 'S', '像': 'X', '头': 'T', '充': 'C',
      '电': 'D', '器': 'Q', '喇': 'L', '叭': 'B', '听': 'T', '筒': 'T', '保': 'B', '护': 'H', '套': 'T',
      '标': 'B', '签': 'Q', '包': 'B', '装': 'Z', '盒': 'H', '聚': 'J', '龙': 'L', '欣': 'X', '冠': 'G',
      '广': 'G', '正': 'Z', '天': 'T', '马': 'M', 'B': 'B', 'O': 'O', 'E': 'E', '华': 'H', '星': 'X',
      '盛': 'S', '泰': 'T', '实': 'S', '深': 'S', '奥': 'A', '百': 'B', '佳': 'J', '达': 'D', '奥': 'A',
      '海': 'H', '辉': 'H', '阳': 'Y', '理': 'L', '威': 'W', '风': 'F', '华': 'H', '维': 'W', '科': 'K',
      '东': 'D', '声': 'S', '瑞': 'R', '歌': 'G', '尔': 'E', '丽': 'L', '德': 'D', '宝': 'B', '怡': 'Y',
      '同': 'T', '富': 'F', '群': 'Q'
    };
    
    let result = '';
    for (let i = 0; i < str.length && i < 4; i++) {
      const char = str[i];
      result += pinyinMap[char] || char;
    }
    
    return result;
  }

  /**
   * 简单的字符串哈希函数
   * @param {string} str 字符串
   * @returns {number} 哈希值
   */
  simpleStringHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash);
  }

  /**
   * 添加批次信息
   * @param {string} batchNo 批次号
   * @param {string} materialName 物料名称
   * @param {string} supplier 供应商
   * @param {string} materialCode 物料编码
   * @returns {Object} 添加的批次信息
   */
  addBatchInfo(batchNo, materialName, supplier, materialCode) {
    const key = `${materialName}_${supplier}`;
    
    // 创建批次信息对象
    const batchInfo = {
      batchNo,
      materialCode,
      materialName,
      supplier,
      createdAt: new Date().toISOString()
    };
    
    // 如果批次映射中不存在该key，则创建一个新数组
    if (!this.batchMappings.has(key)) {
      this.batchMappings.set(key, []);
    }
    
    // 检查是否已存在相同批次号
    const batches = this.batchMappings.get(key);
    const existingBatch = batches.find(b => b.batchNo === batchNo);
    
    if (!existingBatch) {
      // 如果不存在，添加到批次数组中
      batches.push(batchInfo);
      this.allBatches.push(batchInfo);
      
      // 更新物料编码映射
      this.materialCodeMappings.set(key, materialCode);
      
      console.log(`添加批次信息: 批次号=${batchNo}, 物料=${materialName}, 供应商=${supplier}, 物料编码=${materialCode}`);
    } else {
      console.log(`批次号 ${batchNo} 已存在，不重复添加`);
    }
    
    return batchInfo;
  }
}

// 创建并导出单例实例
const batchManager = new BatchManager();
export default batchManager; 