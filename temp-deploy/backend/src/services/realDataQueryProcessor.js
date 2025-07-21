import mysql from 'mysql2/promise';
import { 
  REAL_SUPPLIERS, 
  REAL_MATERIALS, 
  REAL_FACTORIES,
  extractSupplierFromQuery,
  extractMaterialFromQuery,
  extractFactoryFromQuery
} from '../config/parameterExtractionConfig.js';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

/**
 * 真实数据查询处理器
 * 专门处理针对真实数据的具体查询
 */
class RealDataQueryProcessor {
  constructor() {
    this.connection = null;
  }

  async getConnection() {
    if (!this.connection) {
      this.connection = await mysql.createConnection(dbConfig);
    }
    return this.connection;
  }

  /**
   * 处理用户的真实数据查询
   * @param {string} query - 用户查询
   * @returns {Promise<object>} 查询结果
   */
  async processRealDataQuery(query) {
    console.log(`🔍 处理真实数据查询: "${query}"`);
    
    try {
      // 1. 提取查询参数
      const params = this.extractQueryParameters(query);
      console.log('📊 提取的参数:', params);
      
      // 2. 确定查询类型
      const queryType = this.determineQueryType(query, params);
      console.log('🎯 查询类型:', queryType);
      
      // 3. 执行相应的查询
      const result = await this.executeQuery(queryType, params, query);
      
      return {
        success: true,
        data: result,
        queryType: queryType,
        params: params
      };
      
    } catch (error) {
      console.error('❌ 真实数据查询失败:', error);
      return {
        success: false,
        error: error.message,
        data: `抱歉，查询"${query}"时发生错误。请稍后再试。`
      };
    }
  }

  /**
   * 提取查询参数
   */
  extractQueryParameters(query) {
    const params = {};
    
    // 提取供应商
    const supplier = extractSupplierFromQuery(query);
    if (supplier) {
      params.supplier = supplier;
    }
    
    // 提取物料
    const material = extractMaterialFromQuery(query);
    if (material) {
      params.material = material;
    }
    
    // 提取工厂
    const factory = extractFactoryFromQuery(query);
    if (factory) {
      params.factory = factory;
    }
    
    // 提取状态
    if (query.includes('风险') || query.includes('异常')) {
      params.status = '风险';
    } else if (query.includes('正常') || query.includes('合格')) {
      params.status = '正常';
    } else if (query.includes('冻结') || query.includes('锁定')) {
      params.status = '冻结';
    }
    
    // 提取批次号
    const batchMatch = query.match(/[A-Z]{2}\d{7}|[A-Z0-9]{6,}/);
    if (batchMatch) {
      params.batchNo = batchMatch[0];
    }
    
    return params;
  }

  /**
   * 确定查询类型
   */
  determineQueryType(query, params) {
    const queryLower = query.toLowerCase();
    
    // 供应商相关查询
    if (params.supplier) {
      if (queryLower.includes('库存') || queryLower.includes('物料')) {
        return 'supplier_inventory';
      }
      if (queryLower.includes('测试') || queryLower.includes('检验')) {
        return 'supplier_testing';
      }
      if (queryLower.includes('上线') || queryLower.includes('生产')) {
        return 'supplier_production';
      }
      return 'supplier_overview';
    }
    
    // 物料相关查询
    if (params.material) {
      if (queryLower.includes('供应商')) {
        return 'material_suppliers';
      }
      if (queryLower.includes('库存')) {
        return 'material_inventory';
      }
      if (queryLower.includes('测试') || queryLower.includes('检验')) {
        return 'material_testing';
      }
      return 'material_overview';
    }
    
    // 工厂相关查询
    if (params.factory) {
      if (queryLower.includes('库存')) {
        return 'factory_inventory';
      }
      if (queryLower.includes('供应商')) {
        return 'factory_suppliers';
      }
      return 'factory_overview';
    }
    
    // 状态相关查询
    if (params.status) {
      return 'status_query';
    }
    
    // 批次相关查询
    if (params.batchNo) {
      return 'batch_query';
    }
    
    // 默认查询类型
    if (queryLower.includes('库存')) {
      return 'general_inventory';
    }
    if (queryLower.includes('测试') || queryLower.includes('检验')) {
      return 'general_testing';
    }
    if (queryLower.includes('供应商')) {
      return 'general_suppliers';
    }
    
    return 'general_query';
  }

  /**
   * 执行查询
   */
  async executeQuery(queryType, params, originalQuery) {
    const connection = await this.getConnection();
    
    switch (queryType) {
      case 'supplier_inventory':
        return await this.querySupplierInventory(connection, params);
      
      case 'supplier_testing':
        return await this.querySupplierTesting(connection, params);
      
      case 'material_suppliers':
        return await this.queryMaterialSuppliers(connection, params);
      
      case 'material_inventory':
        return await this.queryMaterialInventory(connection, params);
      
      case 'factory_inventory':
        return await this.queryFactoryInventory(connection, params);
      
      case 'status_query':
        return await this.queryByStatus(connection, params);
      
      case 'batch_query':
        return await this.queryByBatch(connection, params);
      
      case 'general_inventory':
        return await this.queryGeneralInventory(connection, params);
      
      case 'general_suppliers':
        return await this.queryGeneralSuppliers(connection, params);
      
      default:
        return await this.queryGeneralInventory(connection, params);
    }
  }

  /**
   * 查询供应商库存
   */
  async querySupplierInventory(connection, params) {
    const sql = `
      SELECT 
        storage_location as 工厂,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间
      FROM inventory 
      WHERE supplier_name LIKE CONCAT('%', ?, '%')
      ORDER BY inbound_time DESC 
      LIMIT 15
    `;
    
    const [results] = await connection.execute(sql, [params.supplier]);
    
    if (results.length === 0) {
      return `未找到供应商"${params.supplier}"的库存数据。`;
    }
    
    return this.formatInventoryResults(results, `${params.supplier}供应商库存查询结果`);
  }

  /**
   * 查询物料供应商
   */
  async queryMaterialSuppliers(connection, params) {
    const sql = `
      SELECT 
        supplier_name as 供应商,
        COUNT(*) as 批次数量,
        SUM(quantity) as 总数量,
        AVG(quantity) as 平均数量,
        GROUP_CONCAT(DISTINCT status) as 状态分布
      FROM inventory 
      WHERE material_name LIKE CONCAT('%', ?, '%')
      GROUP BY supplier_name
      ORDER BY 总数量 DESC
    `;
    
    const [results] = await connection.execute(sql, [params.material]);
    
    if (results.length === 0) {
      return `未找到物料"${params.material}"的供应商数据。`;
    }
    
    let response = `📊 ${params.material}的供应商分布情况：\n\n`;
    results.forEach((item, index) => {
      response += `${index + 1}. **${item.供应商}**\n`;
      response += `   - 批次数量: ${item.批次数量}\n`;
      response += `   - 总数量: ${item.总数量}\n`;
      response += `   - 平均数量: ${Math.round(item.平均数量)}\n`;
      response += `   - 状态: ${item.状态分布}\n\n`;
    });
    
    return response;
  }

  /**
   * 查询供应商测试情况
   */
  async querySupplierTesting(connection, params) {
    const sql = `
      SELECT
        test_id as 测试编号,
        DATE_FORMAT(test_date, '%Y-%m-%d') as 测试日期,
        material_name as 物料名称,
        supplier_name as 供应商,
        test_result as 测试结果,
        defect_desc as 不合格描述,
        conclusion as 结论
      FROM lab_tests
      WHERE supplier_name LIKE CONCAT('%', ?, '%')
      ORDER BY test_date DESC
      LIMIT 15
    `;

    const [results] = await connection.execute(sql, [params.supplier]);

    if (results.length === 0) {
      return `未找到供应商"${params.supplier}"的测试数据。`;
    }

    // 统计测试结果
    const passCount = results.filter(r => r.测试结果 === 'PASS').length;
    const failCount = results.filter(r => r.测试结果 === 'FAIL').length;
    const passRate = ((passCount / results.length) * 100).toFixed(1);

    let response = `🧪 ${params.supplier}供应商测试情况 (共${results.length}条记录)：\n\n`;
    response += `📊 **测试统计**: 通过${passCount}条, 失败${failCount}条, 通过率${passRate}%\n\n`;

    results.forEach((item, index) => {
      const status = item.测试结果 === 'PASS' ? '✅' : '❌';
      response += `${index + 1}. ${status} **${item.物料名称}** (${item.测试编号})\n`;
      response += `   - 测试日期: ${item.测试日期}\n`;
      response += `   - 测试结果: ${item.测试结果}\n`;
      if (item.不合格描述 && item.测试结果 === 'FAIL') {
        response += `   - 不合格描述: ${item.不合格描述}\n`;
      }
      response += '\n';
    });

    return response;
  }

  /**
   * 查询物料库存
   */
  async queryMaterialInventory(connection, params) {
    const sql = `
      SELECT
        storage_location as 工厂,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间
      FROM inventory
      WHERE material_name LIKE CONCAT('%', ?, '%')
      ORDER BY inbound_time DESC
      LIMIT 15
    `;

    const [results] = await connection.execute(sql, [params.material]);

    if (results.length === 0) {
      return `未找到物料"${params.material}"的库存数据。`;
    }

    let response = `📦 ${params.material}库存情况 (共${results.length}条记录)：\n\n`;

    results.forEach((item, index) => {
      response += `${index + 1}. **${item.工厂}**\n`;
      response += `   - 供应商: ${item.供应商}\n`;
      response += `   - 数量: ${item.数量}\n`;
      response += `   - 状态: ${item.状态}\n`;
      response += `   - 入库时间: ${item.入库时间}\n\n`;
    });

    return response;
  }

  /**
   * 查询工厂库存
   */
  async queryFactoryInventory(connection, params) {
    const sql = `
      SELECT
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间
      FROM inventory
      WHERE storage_location LIKE CONCAT('%', ?, '%')
      ORDER BY inbound_time DESC
      LIMIT 15
    `;

    const [results] = await connection.execute(sql, [params.factory]);

    if (results.length === 0) {
      return `未找到工厂"${params.factory}"的库存数据。`;
    }

    let response = `🏭 ${params.factory}库存情况 (共${results.length}条记录)：\n\n`;

    results.forEach((item, index) => {
      response += `${index + 1}. **${item.物料名称}**\n`;
      response += `   - 供应商: ${item.供应商}\n`;
      response += `   - 数量: ${item.数量}\n`;
      response += `   - 状态: ${item.状态}\n`;
      response += `   - 入库时间: ${item.入库时间}\n\n`;
    });

    return response;
  }

  /**
   * 按状态查询
   */
  async queryByStatus(connection, params) {
    const sql = `
      SELECT
        storage_location as 工厂,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间
      FROM inventory
      WHERE status LIKE CONCAT('%', ?, '%')
      ORDER BY inbound_time DESC
      LIMIT 15
    `;

    const [results] = await connection.execute(sql, [params.status]);

    if (results.length === 0) {
      return `未找到状态为"${params.status}"的物料数据。`;
    }

    let response = `⚠️ ${params.status}状态物料 (共${results.length}条记录)：\n\n`;

    results.forEach((item, index) => {
      response += `${index + 1}. **${item.物料名称}**\n`;
      response += `   - 工厂: ${item.工厂}\n`;
      response += `   - 供应商: ${item.供应商}\n`;
      response += `   - 数量: ${item.数量}\n`;
      response += `   - 入库时间: ${item.入库时间}\n\n`;
    });

    return response;
  }

  /**
   * 按批次查询
   */
  async queryByBatch(connection, params) {
    const sql = `
      SELECT
        storage_location as 工厂,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间
      FROM inventory
      WHERE batch_code LIKE CONCAT('%', ?, '%')
      ORDER BY inbound_time DESC
      LIMIT 15
    `;

    const [results] = await connection.execute(sql, [params.batchNo]);

    if (results.length === 0) {
      return `未找到批次号"${params.batchNo}"的数据。`;
    }

    let response = `📋 批次${params.batchNo}信息 (共${results.length}条记录)：\n\n`;

    results.forEach((item, index) => {
      response += `${index + 1}. **${item.物料名称}**\n`;
      response += `   - 工厂: ${item.工厂}\n`;
      response += `   - 供应商: ${item.供应商}\n`;
      response += `   - 数量: ${item.数量}\n`;
      response += `   - 状态: ${item.状态}\n`;
      response += `   - 入库时间: ${item.入库时间}\n\n`;
    });

    return response;
  }

  /**
   * 格式化库存结果
   */
  formatInventoryResults(results, title) {
    let response = `📋 ${title} (共${results.length}条记录)：\n\n`;

    results.forEach((item, index) => {
      response += `${index + 1}. **${item.物料名称}** (${item.物料编码})\n`;
      response += `   - 供应商: ${item.供应商}\n`;
      response += `   - 工厂: ${item.工厂}\n`;
      response += `   - 数量: ${item.数量}\n`;
      response += `   - 状态: ${item.状态}\n`;
      response += `   - 入库时间: ${item.入库时间}\n\n`;
    });

    return response;
  }

  /**
   * 查询一般库存信息
   */
  async queryGeneralInventory(connection, params) {
    let sql = `
      SELECT 
        storage_location as 工厂,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间
      FROM inventory 
      WHERE 1=1
    `;
    
    const sqlParams = [];
    
    if (params.supplier) {
      sql += ` AND supplier_name LIKE CONCAT('%', ?, '%')`;
      sqlParams.push(params.supplier);
    }
    
    if (params.material) {
      sql += ` AND material_name LIKE CONCAT('%', ?, '%')`;
      sqlParams.push(params.material);
    }
    
    if (params.factory) {
      sql += ` AND storage_location LIKE CONCAT('%', ?, '%')`;
      sqlParams.push(params.factory);
    }
    
    if (params.status) {
      sql += ` AND status LIKE CONCAT('%', ?, '%')`;
      sqlParams.push(params.status);
    }
    
    sql += ` ORDER BY inbound_time DESC LIMIT 15`;
    
    const [results] = await connection.execute(sql, sqlParams);
    
    if (results.length === 0) {
      return '未找到符合条件的库存数据。';
    }
    
    return this.formatInventoryResults(results, '库存查询结果');
  }

  /**
   * 查询一般供应商信息
   */
  async queryGeneralSuppliers(connection, params) {
    const sql = `
      SELECT 
        supplier_name as 供应商,
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(*) as 批次总数,
        SUM(quantity) as 总数量,
        GROUP_CONCAT(DISTINCT material_name ORDER BY material_name SEPARATOR ', ') as 物料列表
      FROM inventory 
      GROUP BY supplier_name
      ORDER BY 总数量 DESC
      LIMIT 10
    `;
    
    const [results] = await connection.execute(sql);
    
    let response = `📊 供应商概览 (共${results.length}家供应商)：\n\n`;
    
    results.forEach((item, index) => {
      response += `${index + 1}. **${item.供应商}**\n`;
      response += `   - 物料种类: ${item.物料种类}种\n`;
      response += `   - 批次总数: ${item.批次总数}\n`;
      response += `   - 总数量: ${item.总数量}\n`;
      response += `   - 主要物料: ${item.物料列表.substring(0, 50)}${item.物料列表.length > 50 ? '...' : ''}\n\n`;
    });
    
    return response;
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }
}

export default RealDataQueryProcessor;
