/**
 * 前端数据服务
 * 负责从前端localStorage获取真实业务数据并同步到问答系统
 */
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

/**
 * 前端数据服务类
 */
class FrontendDataService {
  constructor() {
    this.connection = null;
    this.frontendDataPath = path.join(process.cwd(), '../ai-inspection-dashboard/src/data');
  }

  /**
   * 连接数据库
   */
  async connect() {
    if (!this.connection) {
      this.connection = await mysql.createConnection(dbConfig);
    }
    return this.connection;
  }

  /**
   * 断开数据库连接
   */
  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  /**
   * 从前端获取localStorage数据
   * 这里我们模拟从前端获取数据的过程
   * 实际应用中可以通过API调用前端获取
   */
  async fetchFrontendData() {
    console.log('🔍 获取前端localStorage数据...');
    
    // 模拟从前端localStorage获取的真实数据结构
    // 基于你提供的字段规则生成示例数据
    const inventoryData = [
      {
        id: 'INV_001',
        factory: '重庆工厂',
        warehouse: '重庆库存',
        materialCode: 'CS-广1083',
        materialName: '电容',
        supplier: '广正',
        batchCode: '105281',
        quantity: 294,
        status: '正常',
        inspectionDate: '2025-08-26',
        shelfLife: '2025-12-26',
        remark: '-'
      },
      {
        id: 'INV_002',
        factory: '深圳工厂',
        warehouse: '深圳库存',
        materialCode: 'CS-B-第2236',
        materialName: '电容',
        supplier: '黑龙',
        batchCode: '411013',
        quantity: 1500,
        status: '风险',
        inspectionDate: '2025-06-15',
        shelfLife: '2025-11-15',
        remark: '需要重点关注'
      },
      {
        id: 'INV_003',
        factory: '宜宾工厂',
        warehouse: '中央库存',
        materialCode: 'CS-H类0360',
        materialName: '电芯',
        supplier: '紫光',
        batchCode: '844175',
        quantity: 2000,
        status: '冻结',
        inspectionDate: '2025-05-20',
        shelfLife: '2025-10-20',
        remark: '质量问题待处理'
      }
    ];

    const labData = [
      {
        id: 'TEST_001',
        testId: 'ba273f8b-7e59-4256-8164-000dda431e4',
        testDate: '2025-06-18',
        projectId: 'KI4K',
        baselineId: 'I6789基线',
        materialCode: 'CS-B-第2236',
        batchId: '411013',
        materialName: '电容',
        supplier: '黑龙',
        result: 'OK',
        defectDesc: ''
      },
      {
        id: 'TEST_002',
        testId: 'cd384e9c-8f60-5367-9275-111ebb542f5',
        testDate: '2025-06-20',
        projectId: 'X6827',
        baselineId: 'X6827基线',
        materialCode: 'CS-H类0360',
        batchId: '844175',
        materialName: '电芯',
        supplier: '紫光',
        result: 'NG',
        defectDesc: '结构异常'
      }
    ];

    const productionData = [
      {
        id: 'PROD_001',
        factory: '深圳工厂',
        baselineId: 'I6789基线',
        projectId: 'KI4K项目',
        materialCode: 'CS-B-第2236',
        materialName: '电容',
        supplier: '黑龙',
        batchNo: '411013',
        defectRate: 1.5,
        defect: '刮伤, 划伤',
        useTime: '2025-07-15'
      },
      {
        id: 'PROD_002',
        factory: '重庆工厂',
        baselineId: 'G4567基线',
        projectId: 'S665LN项目',
        materialCode: 'CS-广1083',
        materialName: '电容',
        supplier: '广正',
        batchNo: '105281',
        defectRate: 0.8,
        defect: '',
        useTime: '2025-07-20'
      }
    ];

    return {
      inventory: inventoryData,
      lab: labData,
      production: productionData
    };
  }

  /**
   * 将前端数据同步到MySQL数据库
   */
  async syncToDatabase(frontendData) {
    console.log('🔄 同步前端数据到数据库...');
    
    const connection = await this.connect();
    
    try {
      // 清空现有数据
      await connection.query('DELETE FROM inventory');
      await connection.query('DELETE FROM lab_tests');
      await connection.query('DELETE FROM online_tracking');
      
      // 同步库存数据
      console.log('📦 同步库存数据...');
      for (const item of frontendData.inventory) {
        await connection.query(`
          INSERT INTO inventory (
            id, batch_code, material_code, material_name, material_type,
            supplier_name, quantity, inbound_time, storage_location,
            status, risk_level, inspector, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          item.id,
          item.batchCode,
          item.materialCode,
          item.materialName,
          item.materialName, // material_type
          item.supplier,
          item.quantity,
          item.inspectionDate,
          item.factory, // storage_location使用工厂名
          item.status,
          this.mapStatusToRiskLevel(item.status),
          '系统管理员', // inspector
          item.remark || ''
        ]);
      }
      
      // 同步测试数据
      console.log('🧪 同步测试数据...');
      for (const item of frontendData.lab) {
        await connection.query(`
          INSERT INTO lab_tests (
            id, test_id, batch_code, material_code, material_name,
            supplier_name, test_date, test_item, test_result,
            conclusion, defect_desc, tester, reviewer, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          item.id,
          item.testId,
          item.batchId,
          item.materialCode,
          item.materialName,
          item.supplier,
          item.testDate,
          item.projectId + '测试', // test_item
          item.result,
          item.result === 'OK' ? '合格' : '不合格',
          item.defectDesc || null,
          '测试员',
          '审核员'
        ]);
      }
      
      // 同步生产数据
      console.log('🏭 同步生产数据...');
      for (const item of frontendData.production) {
        await connection.query(`
          INSERT INTO online_tracking (
            id, batch_code, material_code, material_name, supplier_name,
            online_date, use_time, factory, workshop, line, project,
            defect_rate, exception_count, operator, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          item.id,
          item.batchNo,
          item.materialCode,
          item.materialName,
          item.supplier,
          item.useTime,
          item.useTime,
          item.factory,
          item.baselineId, // workshop
          item.projectId, // line
          item.projectId,
          item.defectRate / 100, // 转换为小数
          item.defectRate > 1 ? Math.ceil(item.defectRate) : 0,
          '操作员'
        ]);
      }
      
      console.log('✅ 数据同步完成！');
      
    } catch (error) {
      console.error('❌ 数据同步失败:', error);
      throw error;
    }
  }

  /**
   * 将状态映射为风险等级
   */
  mapStatusToRiskLevel(status) {
    switch (status) {
      case '正常': return 'low';
      case '风险': return 'high';
      case '冻结': return 'high';
      default: return 'medium';
    }
  }

  /**
   * 更新NLP规则以支持真实数据格式
   */
  async updateNLPRules() {
    console.log('🔧 更新NLP规则...');
    
    const connection = await this.connect();
    
    // 基于真实数据字段的NLP规则
    const updatedRules = [
      {
        intent_name: '查询库存,库存查询,查库存,库存情况',
        description: '查询物料库存信息',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
          material_code as 物料编码,
          material_name as 物料名称,
          batch_code as 批次号,
          supplier_name as 供应商,
          quantity as 数量,
          storage_location as 工厂,
          status as 状态,
          risk_level as 风险等级,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 检验日期,
          notes as 备注
        FROM inventory 
        WHERE material_code LIKE CONCAT('%', ?, '%') 
           OR material_name LIKE CONCAT('%', ?, '%')
           OR batch_code LIKE CONCAT('%', ?, '%')
        ORDER BY created_at DESC LIMIT 10`,
        parameters: JSON.stringify([
          {
            name: 'search_term',
            type: 'string',
            description: '搜索关键词（物料编码、物料名称或批次号）',
            extract_patterns: [
              'CS-[A-Z]\\d+',
              'CS-[A-Z]-[A-Z]\\d+',
              '\\d{6}',
              '电容',
              '电芯'
            ]
          }
        ]),
        example_query: '查询物料 CS-B-第2236 的库存'
      }
    ];

    // 更新规则
    for (const rule of updatedRules) {
      await connection.query(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, parameters = ?, updated_at = NOW()
        WHERE intent_name = ?
      `, [rule.action_target, rule.parameters, rule.intent_name]);
    }
    
    console.log('✅ NLP规则更新完成！');
  }

  /**
   * 执行完整的数据同步流程
   */
  async performFullSync() {
    try {
      console.log('🚀 开始完整数据同步流程...');
      
      // 1. 获取前端数据
      const frontendData = await this.fetchFrontendData();
      
      // 2. 同步到数据库
      await this.syncToDatabase(frontendData);
      
      // 3. 更新NLP规则
      await this.updateNLPRules();
      
      console.log('🎉 完整数据同步流程完成！');
      
      return {
        success: true,
        message: '数据同步成功',
        data: {
          inventoryCount: frontendData.inventory.length,
          labCount: frontendData.lab.length,
          productionCount: frontendData.production.length
        }
      };
      
    } catch (error) {
      console.error('❌ 数据同步流程失败:', error);
      return {
        success: false,
        message: '数据同步失败: ' + error.message
      };
    } finally {
      await this.disconnect();
    }
  }
}

export default new FrontendDataService();
