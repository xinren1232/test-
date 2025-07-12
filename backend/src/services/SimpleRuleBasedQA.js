/**
 * 简化的基于规则的问答系统
 * 直接匹配规则并返回真实数据
 */
import mysql from 'mysql2/promise';
import dbConfig from '../config/db.config.js';

class SimpleRuleBasedQA {
  constructor() {
    this.connection = null;
  }

  async getConnection() {
    if (!this.connection) {
      this.connection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        charset: 'utf8mb4'
      });
    }
    return this.connection;
  }

  async processQuestion(question) {
    console.log(`🤖 简化问答处理: "${question}"`);
    
    try {
      const connection = await this.getConnection();
      
      // 1. 基于关键词直接查询数据
      const queryResult = await this.executeDirectQuery(question, connection);
      
      if (queryResult.data && queryResult.data.length > 0) {
        return {
          success: true,
          data: {
            question: question,
            answer: queryResult.answer,
            data: queryResult.data, // 真实的表格数据
            tableData: queryResult.data, // 兼容性
            analysis: {
              type: queryResult.type,
              intent: 'query',
              confidence: 0.9
            },
            template: queryResult.template,
            metadata: {
              dataSource: 'real_database',
              timestamp: new Date().toISOString(),
              recordCount: queryResult.data.length
            }
          }
        };
      } else {
        return {
          success: true,
          data: {
            question: question,
            answer: '抱歉，未找到符合条件的数据。请尝试调整查询条件。',
            data: [],
            tableData: [],
            analysis: {
              type: 'general',
              intent: 'query',
              confidence: 0.5
            },
            template: 'no_data_found'
          }
        };
      }
    } catch (error) {
      console.error('❌ 简化问答处理失败:', error);
      return {
        success: false,
        error: error.message,
        data: {
          question: question,
          answer: `处理问题时发生错误: ${error.message}`
        }
      };
    }
  }

  async executeDirectQuery(question, connection) {
    const questionLower = question.toLowerCase();
    
    // 电池库存查询
    if (questionLower.includes('电池') && questionLower.includes('库存')) {
      const [results] = await connection.execute(`
        SELECT 
          storage_location as 工厂,
          storage_location as 仓库,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
          DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
          COALESCE(notes, '') as 备注
        FROM inventory 
        WHERE material_name LIKE '%电池%' OR material_name LIKE '%battery%'
        ORDER BY inbound_time DESC
        LIMIT 20
      `);
      
      return {
        data: results,
        answer: `📊 **电池库存查询结果**\n\n✅ 找到 ${results.length} 条电池相关库存记录。\n\n📋 **详细数据如下表所示：**`,
        type: 'inventory_query',
        template: 'battery_inventory'
      };
    }
    
    // BOE供应商查询
    if (questionLower.includes('boe') && questionLower.includes('供应商')) {
      const [results] = await connection.execute(`
        SELECT 
          storage_location as 工厂,
          storage_location as 仓库,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
          DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
          COALESCE(notes, '') as 备注
        FROM inventory 
        WHERE supplier_name LIKE '%BOE%'
        ORDER BY inbound_time DESC
        LIMIT 20
      `);
      
      return {
        data: results,
        answer: `📊 **BOE供应商库存查询结果**\n\n✅ 找到 ${results.length} 条BOE供应商相关记录。\n\n📋 **详细数据如下表所示：**`,
        type: 'supplier_query',
        template: 'boe_supplier_inventory'
      };
    }
    
    // 风险状态查询
    if (questionLower.includes('风险') && questionLower.includes('库存')) {
      const [results] = await connection.execute(`
        SELECT 
          storage_location as 工厂,
          storage_location as 仓库,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
          DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
          COALESCE(notes, '') as 备注
        FROM inventory 
        WHERE status = '风险'
        ORDER BY inbound_time DESC
        LIMIT 20
      `);
      
      return {
        data: results,
        answer: `📊 **风险状态库存查询结果**\n\n⚠️ 找到 ${results.length} 条风险状态库存记录。\n\n📋 **详细数据如下表所示：**`,
        type: 'risk_query',
        template: 'risk_inventory'
      };
    }
    
    // NG测试记录查询
    if ((questionLower.includes('ng') || questionLower.includes('失败')) && questionLower.includes('测试')) {
      const [results] = await connection.execute(`
        SELECT
          test_id as 测试编号,
          DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
          COALESCE(project_id, '') as 项目,
          COALESCE(baseline_id, '') as 基线,
          material_code as 物料编码,
          quantity as 数量,
          material_name as 物料名称,
          supplier_name as 供应商,
          test_result as 测试结果,
          COALESCE(defect_desc, '') as 不合格描述,
          COALESCE(notes, '') as 备注
        FROM lab_tests
        WHERE test_result = 'NG' OR test_result = 'FAIL'
        ORDER BY test_date DESC
        LIMIT 20
      `);
      
      return {
        data: results,
        answer: `📊 **NG测试记录查询结果**\n\n❌ 找到 ${results.length} 条测试失败记录。\n\n📋 **详细数据如下表所示：**`,
        type: 'test_query',
        template: 'ng_test_records'
      };
    }
    
    // 默认库存查询
    if (questionLower.includes('库存')) {
      const [results] = await connection.execute(`
        SELECT 
          storage_location as 工厂,
          storage_location as 仓库,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
          DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
          COALESCE(notes, '') as 备注
        FROM inventory 
        ORDER BY inbound_time DESC
        LIMIT 20
      `);
      
      return {
        data: results,
        answer: `📊 **库存查询结果**\n\n✅ 找到 ${results.length} 条库存记录。\n\n📋 **详细数据如下表所示：**`,
        type: 'inventory_query',
        template: 'general_inventory'
      };
    }
    
    // 对比查询
    if (questionLower.includes('对比') && (questionLower.includes('供应商') || questionLower.includes('聚龙') || questionLower.includes('天马'))) {
      const [results] = await connection.execute(`
        SELECT
          supplier_name as 供应商,
          COUNT(*) as 库存批次数,
          SUM(quantity) as 总库存量,
          AVG(quantity) as 平均批次量,
          SUM(CASE WHEN status = '风险' THEN 1 ELSE 0 END) as 风险批次数,
          SUM(CASE WHEN status = '正常' THEN 1 ELSE 0 END) as 正常批次数,
          GROUP_CONCAT(DISTINCT material_name SEPARATOR ', ') as 主要物料
        FROM inventory
        WHERE supplier_name IN ('聚龙', '天马')
        GROUP BY supplier_name
        ORDER BY 总库存量 DESC
      `);

      return {
        data: results,
        answer: `📊 **供应商对比分析结果**\n\n⚖️ 找到 ${results.length} 个供应商的对比数据。\n\n📋 **详细对比数据如下表所示：**`,
        type: 'comparison_query',
        template: 'supplier_comparison'
      };
    }

    // 如果没有匹配的查询，返回空结果
    return {
      data: [],
      answer: '抱歉，我无法理解您的问题。请尝试使用更具体的关键词，如"库存"、"供应商"、"测试"等。',
      type: 'unknown',
      template: 'no_match'
    };
  }
}

export default SimpleRuleBasedQA;
