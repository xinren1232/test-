/**
 * 工厂数据修复工具
 * 用于诊断和修复工厂上线跟踪页面的数据显示问题
 */

import { unifiedDataService } from '../services/UnifiedDataService.js';
import { SystemDataUpdater } from '../services/SystemDataUpdater.js';

export class FactoryDataFix {
  constructor() {
    this.dataUpdater = new SystemDataUpdater();
  }

  /**
   * 诊断工厂数据问题
   */
  async diagnose() {
    console.log('🔍 开始诊断工厂数据问题...');
    
    const diagnosis = {
      localStorage: this.checkLocalStorage(),
      dataStructure: this.checkDataStructure(),
      dataContent: this.checkDataContent(),
      recommendations: []
    };

    // 生成修复建议
    if (!diagnosis.localStorage.hasData) {
      diagnosis.recommendations.push('需要重新生成工厂数据');
    }
    
    if (!diagnosis.dataStructure.isValid) {
      diagnosis.recommendations.push('数据结构异常，需要修复字段映射');
    }
    
    if (!diagnosis.dataContent.hasValidMaterials) {
      diagnosis.recommendations.push('数据内容不符合业务要求，需要重新生成');
    }

    console.log('📋 诊断结果:', diagnosis);
    return diagnosis;
  }

  /**
   * 检查localStorage数据
   */
  checkLocalStorage() {
    try {
      const factoryData = localStorage.getItem('unified_factory_data');
      const parsedData = factoryData ? JSON.parse(factoryData) : [];
      
      return {
        hasData: parsedData.length > 0,
        count: parsedData.length,
        rawData: factoryData ? factoryData.substring(0, 200) + '...' : 'null',
        isValidJson: true
      };
    } catch (error) {
      return {
        hasData: false,
        count: 0,
        rawData: 'Invalid JSON',
        isValidJson: false,
        error: error.message
      };
    }
  }

  /**
   * 检查数据结构
   */
  checkDataStructure() {
    try {
      const factoryData = unifiedDataService.getOnlineData();
      
      if (!factoryData || factoryData.length === 0) {
        return {
          isValid: false,
          reason: '没有数据'
        };
      }

      const sample = factoryData[0];
      const requiredFields = [
        'materialName', 'materialCode', 'batchNo', 'supplier', 
        'factory', 'onlineTime', 'defectRate', 'project_id'
      ];

      const missingFields = requiredFields.filter(field => 
        !(field in sample) && 
        !this.hasAlternativeField(sample, field)
      );

      return {
        isValid: missingFields.length === 0,
        missingFields,
        sampleData: sample,
        totalFields: Object.keys(sample).length
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * 检查是否有替代字段
   */
  hasAlternativeField(data, field) {
    const alternatives = {
      'materialName': ['material_name'],
      'materialCode': ['material_code'],
      'batchNo': ['batch_no'],
      'onlineTime': ['useTime', 'online_date'],
      'defectRate': ['defect_rate'],
      'project_id': ['projectId']
    };

    if (alternatives[field]) {
      return alternatives[field].some(alt => alt in data);
    }
    return false;
  }

  /**
   * 检查数据内容
   */
  checkDataContent() {
    try {
      const factoryData = unifiedDataService.getOnlineData();
      
      if (!factoryData || factoryData.length === 0) {
        return {
          hasValidMaterials: false,
          reason: '没有数据'
        };
      }

      // 检查是否包含真实物料
      const realMaterialNames = [
        'LCD显示屏', 'OLED显示屏', '中框', '侧键', '手机卡托',
        '电池盖', '装饰件', '听筒', '喇叭', '摄像头', '电池',
        '充电器', '保护套', '包装盒', '标签'
      ];

      const hasRealMaterials = factoryData.some(item => {
        const name = item.materialName || item.material_name || '';
        return realMaterialNames.some(realName => name.includes(realName));
      });

      // 检查供应商
      const suppliers = [...new Set(factoryData.map(item => item.supplier))];
      const realSuppliers = [
        'BOE', '天马', '华星', '聚龙', '欣冠', '广正', '歌尔', '东声',
        '瑞声', '天实', '深奥', '盛泰', '奥海', '百佳达', '辉阳',
        '理威', '维科', '风华', '丽德宝', '富群', '怡同'
      ];

      const hasRealSuppliers = suppliers.some(supplier => 
        realSuppliers.includes(supplier)
      );

      return {
        hasValidMaterials: hasRealMaterials,
        hasValidSuppliers: hasRealSuppliers,
        materialCount: [...new Set(factoryData.map(item => item.materialName))].length,
        supplierCount: suppliers.length,
        batchCount: [...new Set(factoryData.map(item => item.batchNo))].length,
        sampleMaterials: [...new Set(factoryData.map(item => item.materialName))].slice(0, 5),
        sampleSuppliers: suppliers.slice(0, 5)
      };
    } catch (error) {
      return {
        hasValidMaterials: false,
        error: error.message
      };
    }
  }

  /**
   * 修复工厂数据
   */
  async fix() {
    console.log('🔧 开始修复工厂数据...');
    
    try {
      // 1. 清除现有的异常数据
      localStorage.removeItem('unified_factory_data');
      console.log('✅ 已清除现有数据');

      // 2. 检查依赖数据
      const inventoryData = unifiedDataService.getInventoryData();
      const labData = unifiedDataService.getLabData();

      if (!inventoryData || inventoryData.length === 0) {
        console.log('⚠️ 缺少库存数据，先生成库存数据...');
        const inventoryResult = await this.dataUpdater.generateInventoryData(135, true);
        if (!inventoryResult.success) {
          throw new Error('生成库存数据失败: ' + inventoryResult.message);
        }
      }

      if (!labData || labData.length === 0) {
        console.log('⚠️ 缺少测试数据，先生成测试数据...');
        const labResult = await this.dataUpdater.generateLabData(405, true);
        if (!labResult.success) {
          throw new Error('生成测试数据失败: ' + labResult.message);
        }
      }

      // 3. 重新生成工厂数据
      console.log('🏭 重新生成工厂数据...');
      const factoryResult = await this.dataUpdater.generateFactoryData(1080, true);
      
      if (!factoryResult.success) {
        throw new Error('生成工厂数据失败: ' + factoryResult.message);
      }

      // 4. 验证修复结果
      const verification = await this.verify();
      
      return {
        success: true,
        message: '工厂数据修复成功',
        details: {
          factoryRecords: factoryResult.data?.length || 0,
          verification
        }
      };

    } catch (error) {
      console.error('❌ 修复失败:', error);
      return {
        success: false,
        message: '修复失败: ' + error.message
      };
    }
  }

  /**
   * 验证修复结果
   */
  async verify() {
    console.log('✅ 验证修复结果...');
    
    const factoryData = unifiedDataService.getOnlineData();
    
    if (!factoryData || factoryData.length === 0) {
      return {
        success: false,
        message: '验证失败：没有数据'
      };
    }

    // 检查数据完整性
    const sample = factoryData[0];
    const requiredFields = ['materialName', 'batchNo', 'supplier', 'factory'];
    const hasAllFields = requiredFields.every(field => 
      sample[field] || sample[field.replace(/([A-Z])/g, '_$1').toLowerCase()]
    );

    // 检查数据质量
    const materialCount = [...new Set(factoryData.map(item => item.materialName))].length;
    const supplierCount = [...new Set(factoryData.map(item => item.supplier))].length;

    return {
      success: hasAllFields && materialCount >= 10 && supplierCount >= 15,
      dataCount: factoryData.length,
      materialCount,
      supplierCount,
      hasAllFields,
      sampleData: {
        materialName: sample.materialName,
        supplier: sample.supplier,
        factory: sample.factory,
        batchNo: sample.batchNo
      }
    };
  }

  /**
   * 快速修复（用于页面调用）
   */
  async quickFix() {
    const diagnosis = await this.diagnose();
    
    if (diagnosis.recommendations.length === 0) {
      return { success: true, message: '数据正常，无需修复' };
    }

    return await this.fix();
  }
}

// 导出单例
export const factoryDataFix = new FactoryDataFix();
