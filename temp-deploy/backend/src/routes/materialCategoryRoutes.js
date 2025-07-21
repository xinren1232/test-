import express from 'express';
import mysql from 'mysql2/promise';
import logger from '../utils/logger.js';

const router = express.Router();

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

/**
 * GET /api/material-categories
 * 获取所有物料大类别
 */
router.get('/', async (req, res) => {
  try {
    logger.info('获取物料大类别请求');
    
    const connection = await mysql.createConnection(dbConfig);
    
    const [categories] = await connection.execute(`
      SELECT 
        id,
        category_code,
        category_name,
        description,
        priority,
        status,
        created_at,
        updated_at
      FROM material_categories
      ORDER BY priority ASC
    `);
    
    await connection.end();
    
    logger.info(`返回 ${categories.length} 个物料大类别`);
    
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
    
  } catch (error) {
    logger.error('获取物料大类别失败:', error);
    res.status(500).json({
      success: false,
      message: '获取物料大类别失败: ' + error.message
    });
  }
});

/**
 * GET /api/material-categories/subcategories
 * 获取所有物料子类别
 */
router.get('/subcategories', async (req, res) => {
  try {
    logger.info('获取物料子类别请求');
    
    const connection = await mysql.createConnection(dbConfig);
    
    const [subcategories] = await connection.execute(`
      SELECT 
        ms.id,
        ms.category_code,
        ms.material_name,
        ms.material_code,
        ms.common_defects,
        ms.common_suppliers,
        ms.status,
        mc.category_name
      FROM material_subcategories ms
      LEFT JOIN material_categories mc ON ms.category_code = mc.category_code
      WHERE ms.status = 'active'
      ORDER BY mc.priority ASC, ms.material_name ASC
    `);
    
    await connection.end();
    
    logger.info(`返回 ${subcategories.length} 个物料子类别`);
    
    res.json({
      success: true,
      data: subcategories,
      count: subcategories.length
    });
    
  } catch (error) {
    logger.error('获取物料子类别失败:', error);
    res.status(500).json({
      success: false,
      message: '获取物料子类别失败: ' + error.message
    });
  }
});

/**
 * GET /api/material-categories/supplier-mappings
 * 获取供应商-大类别关联关系
 */
router.get('/supplier-mappings', async (req, res) => {
  try {
    logger.info('获取供应商-大类别关联请求');
    
    const connection = await mysql.createConnection(dbConfig);
    
    const [mappings] = await connection.execute(`
      SELECT 
        scm.id,
        scm.supplier_name,
        scm.category_code,
        scm.is_primary,
        scm.quality_score,
        scm.status,
        mc.category_name,
        COUNT(ms.id) as material_count
      FROM supplier_category_mapping scm
      LEFT JOIN material_categories mc ON scm.category_code = mc.category_code
      LEFT JOIN material_subcategories ms ON scm.category_code = ms.category_code
      WHERE scm.status = 'active'
      GROUP BY scm.id, scm.supplier_name, scm.category_code, scm.is_primary, scm.quality_score, scm.status, mc.category_name
      ORDER BY mc.priority ASC, scm.supplier_name ASC
    `);
    
    await connection.end();
    
    logger.info(`返回 ${mappings.length} 个供应商关联关系`);
    
    res.json({
      success: true,
      data: mappings,
      count: mappings.length
    });
    
  } catch (error) {
    logger.error('获取供应商关联失败:', error);
    res.status(500).json({
      success: false,
      message: '获取供应商关联失败: ' + error.message
    });
  }
});

/**
 * GET /api/material-categories/stats
 * 获取物料大类别统计信息
 */
router.get('/stats', async (req, res) => {
  try {
    logger.info('获取物料大类别统计请求');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 获取基础统计
    const [basicStats] = await connection.execute(`
      SELECT 
        mc.category_code,
        mc.category_name,
        mc.priority,
        COUNT(DISTINCT ms.material_name) as material_count,
        COUNT(DISTINCT scm.supplier_name) as supplier_count,
        AVG(scm.quality_score) as avg_quality_score
      FROM material_categories mc
      LEFT JOIN material_subcategories ms ON mc.category_code = ms.category_code AND ms.status = 'active'
      LEFT JOIN supplier_category_mapping scm ON mc.category_code = scm.category_code AND scm.status = 'active'
      WHERE mc.status = 'active'
      GROUP BY mc.category_code, mc.category_name, mc.priority
      ORDER BY mc.priority ASC
    `);
    
    // 获取库存统计
    const [inventoryStats] = await connection.execute(`
      SELECT 
        CASE 
          WHEN material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件') THEN '结构件类'
          WHEN material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头模组') THEN '光学类'
          WHEN material_name IN ('电池', '充电器') THEN '充电类'
          WHEN material_name IN ('喇叭', '听筒') THEN '声学类'
          WHEN material_name IN ('保护套', '标签', '包装盒') THEN '包材类'
          ELSE '其他'
        END as category_code,
        COUNT(*) as inventory_batches,
        SUM(quantity) as total_quantity,
        SUM(CASE WHEN status = '风险' THEN 1 ELSE 0 END) as risk_batches,
        ROUND(SUM(CASE WHEN status = '风险' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as risk_rate
      FROM inventory 
      WHERE material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件', 'LCD显示屏', 'OLED显示屏', '摄像头模组', '电池', '充电器', '喇叭', '听筒', '保护套', '标签', '包装盒')
      GROUP BY category_code
    `);
    
    // 获取测试统计
    const [testStats] = await connection.execute(`
      SELECT 
        CASE 
          WHEN material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件') THEN '结构件类'
          WHEN material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头模组') THEN '光学类'
          WHEN material_name IN ('电池', '充电器') THEN '充电类'
          WHEN material_name IN ('喇叭', '听筒') THEN '声学类'
          WHEN material_name IN ('保护套', '标签', '包装盒') THEN '包材类'
          ELSE '其他'
        END as category_code,
        COUNT(*) as test_count,
        SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as pass_count,
        ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as pass_rate
      FROM test_tracking 
      WHERE material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件', 'LCD显示屏', 'OLED显示屏', '摄像头模组', '电池', '充电器', '喇叭', '听筒', '保护套', '标签', '包装盒')
      GROUP BY category_code
    `);
    
    await connection.end();
    
    // 合并统计数据
    const stats = basicStats.map(basic => {
      const inventory = inventoryStats.find(inv => inv.category_code === basic.category_code) || {};
      const test = testStats.find(t => t.category_code === basic.category_code) || {};
      
      return {
        ...basic,
        inventory_batches: inventory.inventory_batches || 0,
        total_quantity: inventory.total_quantity || 0,
        risk_batches: inventory.risk_batches || 0,
        risk_rate: inventory.risk_rate || 0,
        test_count: test.test_count || 0,
        pass_count: test.pass_count || 0,
        pass_rate: test.pass_rate || 0
      };
    });
    
    logger.info(`返回 ${stats.length} 个类别统计`);
    
    res.json({
      success: true,
      data: stats,
      summary: {
        total_categories: basicStats.length,
        total_materials: basicStats.reduce((sum, item) => sum + item.material_count, 0),
        total_suppliers: basicStats.reduce((sum, item) => sum + item.supplier_count, 0),
        avg_quality: (basicStats.reduce((sum, item) => sum + (item.avg_quality_score || 0), 0) / basicStats.length).toFixed(2)
      }
    });
    
  } catch (error) {
    logger.error('获取统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败: ' + error.message
    });
  }
});

/**
 * GET /api/material-categories/:categoryCode/materials
 * 获取指定大类别下的所有物料
 */
router.get('/:categoryCode/materials', async (req, res) => {
  try {
    const { categoryCode } = req.params;
    logger.info(`获取大类别 ${categoryCode} 的物料请求`);
    
    const connection = await mysql.createConnection(dbConfig);
    
    const [materials] = await connection.execute(`
      SELECT 
        ms.material_name,
        ms.material_code,
        ms.common_defects,
        ms.common_suppliers,
        COUNT(DISTINCT i.id) as inventory_count,
        COUNT(DISTINCT t.id) as test_count,
        COUNT(DISTINCT o.id) as online_count
      FROM material_subcategories ms
      LEFT JOIN inventory i ON ms.material_name = i.material_name
      LEFT JOIN test_tracking t ON ms.material_name = t.material_name
      LEFT JOIN online_tracking o ON ms.material_name = o.material_name
      WHERE ms.category_code = ? AND ms.status = 'active'
      GROUP BY ms.material_name, ms.material_code, ms.common_defects, ms.common_suppliers
      ORDER BY ms.material_name
    `, [categoryCode]);
    
    await connection.end();
    
    logger.info(`返回大类别 ${categoryCode} 下的 ${materials.length} 个物料`);
    
    res.json({
      success: true,
      data: materials,
      count: materials.length,
      category_code: categoryCode
    });
    
  } catch (error) {
    logger.error('获取大类别物料失败:', error);
    res.status(500).json({
      success: false,
      message: '获取大类别物料失败: ' + error.message
    });
  }
});

/**
 * GET /api/material-categories/rules
 * 获取物料大类别相关的NLP规则
 */
router.get('/rules', async (req, res) => {
  try {
    logger.info('获取物料大类别规则请求');
    
    const connection = await mysql.createConnection(dbConfig);
    
    const [rules] = await connection.execute(`
      SELECT 
        intent_name,
        description,
        priority,
        category,
        trigger_words,
        status,
        created_at
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%类%' 
         OR intent_name LIKE '%大类别%'
         OR intent_name LIKE '%结构件%'
         OR intent_name LIKE '%光学%'
         OR intent_name LIKE '%充电%'
         OR intent_name LIKE '%声学%'
         OR intent_name LIKE '%包材%'
      ORDER BY priority ASC, intent_name ASC
    `);
    
    await connection.end();
    
    // 按分类分组
    const groupedRules = {};
    rules.forEach(rule => {
      if (!groupedRules[rule.category]) {
        groupedRules[rule.category] = [];
      }
      groupedRules[rule.category].push(rule);
    });
    
    logger.info(`返回 ${rules.length} 个物料大类别相关规则`);
    
    res.json({
      success: true,
      data: rules,
      grouped: groupedRules,
      count: rules.length
    });
    
  } catch (error) {
    logger.error('获取大类别规则失败:', error);
    res.status(500).json({
      success: false,
      message: '获取大类别规则失败: ' + error.message
    });
  }
});

export default router;
