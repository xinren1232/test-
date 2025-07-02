import { generateCompleteDataset } from '../../ai-inspection-dashboard/src/data/data_generator.js';
import db, { initializeDatabase, sequelize, loadModels } from '../src/models/index.js';
import logger from '../src/utils/logger.js';

async function seedDatabase() {
  try {
    // Load models first
    await loadModels();

    // Then initialize the database (creates tables if they don't exist)
    await initializeDatabase();

    logger.info('正在生成模拟数据...');
    const { inventory, inspection, production } = generateCompleteDataset();
    logger.info(`生成了 ${inventory.length} 条库存数据, ${inspection.length} 条检验数据, ${production.length} 条生产数据.`);

    // --- 数据映射 (与新的 v3 Schema 对齐) ---
    const inventoryToCreate = inventory.map(item => ({
      id: item.id,
      batch_code: item.batch_code,
      material_code: item.material_code,
      material_name: item.material_name,
      material_type: item.material_type,
      supplier_name: item.supplier,
      quantity: item.quantity,
      inbound_time: item.inspectionDate,
      storage_location: item.location,
      status: item.material_status,
      risk_level: item.quality_status || 'low',
      inspector: item.inspector,
      notes: item.notes,
    }));

    const labTestsToCreate = inspection.map(item => ({
      id: item.testId, // Use testId from generator
      test_id: item.testId,
      batch_code: item.batch_code,
      material_code: item.material_code,
      material_name: item.material_name,
      supplier_name: item.supplier,
      test_date: item.inspectionDate,
      test_item: item.testItem,
      test_result: item.result,
      conclusion: item.conclusion,
      defect_desc: item.defect,
      tester: item.inspector,
      reviewer: 'N/A',
    }));

    const onlineTrackingToCreate = production.map(item => ({
      id: item.id,
      batch_code: item.batch_code,
      material_code: item.material_code,
      material_name: item.material_name,
      supplier_name: item.supplier,
      online_date: item.usage_datetime, // Map to online_date
      use_time: item.usage_datetime,
      factory: 'Factory A',
      workshop: 'Workshop 1',
      line: item.production_line,
      project: item.project,
      defect_rate: item.defect_rate || 0,
      exception_count: item.exception_count || 0,
      operator: item.operator,
    }));

    // --- 数据导入 ---
    await sequelize.transaction(async (t) => {
      logger.info('正在清空旧数据 (在事务中)...');
      
      // Correct deletion order if there are foreign keys (none yet, but good practice)
      await db.OnlineTracking.destroy({ where: {}, truncate: true, transaction: t });
      await db.LabTest.destroy({ where: {}, truncate: true, transaction: t });
      await db.Inventory.destroy({ where: {}, truncate: true, transaction:t });

      logger.info('正在插入新数据 (在事务中)...');
      await db.Inventory.bulkCreate(inventoryToCreate, { transaction: t, ignoreDuplicates: true });
      await db.LabTest.bulkCreate(labTestsToCreate, { transaction: t, ignoreDuplicates: true });
      await db.OnlineTracking.bulkCreate(onlineTrackingToCreate, { transaction: t, ignoreDuplicates: true });
    });

    logger.info('数据填充成功！');
  } catch (error) {
    logger.error('数据填充失败:', error);
    process.exit(1);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

seedDatabase(); 