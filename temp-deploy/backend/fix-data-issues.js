import fs from 'fs';
import path from 'path';

/**
 * 修复数据问题
 * 1. 移除数据量限制
 * 2. 修复不良率显示为百分比
 */
async function fixDataIssues() {
  try {
    console.log('🔧 开始修复数据问题...');
    
    // 1. 修复规则路由处理器中的数据量限制
    console.log('\n=== 1. 修复规则路由处理器中的数据量限制 ===');
    
    const rulesRoutesPath = path.join(process.cwd(), 'src/routes/rulesRoutes.js');
    
    if (fs.existsSync(rulesRoutesPath)) {
      let rulesRoutesContent = fs.readFileSync(rulesRoutesPath, 'utf8');
      
      // 1.1 修改数据量限制
      console.log('  ✅ 修改数据量限制');
      
      // 查找数据量限制代码
      const dataLimitCode = rulesRoutesContent.match(/\/\/ 限制返回数据量[\s\S]*?const results = dataSource\.slice\(0, 20\);/);
      
      if (dataLimitCode) {
        // 替换为不限制数据量的代码
        const newDataLimitCode = `// 获取数据（不限制数量）
      const results = dataSource;`;
        
        rulesRoutesContent = rulesRoutesContent.replace(dataLimitCode[0], newDataLimitCode);
      }
      
      // 1.2 修复物料大类查询规则中的数据格式化
      console.log('  ✅ 修复物料大类查询规则中的数据格式化');
      
      // 查找物料大类查询规则中的数据格式化代码
      const materialCategoryFormatCode = rulesRoutesContent.match(/\/\/ 转换为前端需要的格式[\s\S]*?const formattedResults = structuralMaterials\.map\(item => \({[\s\S]*?\}\)\);/);
      
      if (materialCategoryFormatCode) {
        // 替换为包含百分比格式的不良率的代码
        const newMaterialCategoryFormatCode = `// 转换为前端需要的格式
        const formattedResults = structuralMaterials.map(item => ({
          '工厂': item.factory,
          '仓库': item.storage_location || item.warehouse,
          '物料编码': item.materialCode,
          '物料名称': item.materialName,
          '供应商': item.supplier,
          '数量': item.quantity,
          '状态': item.status,
          '不良率': item.defectRate ? (item.defectRate * 100).toFixed(1) + '%' : '0%',
          '入库时间': new Date(item.inboundTime).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\\//g, '-'),
          '到期时间': new Date(item.lastUpdateTime).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\\//g, '-'),
          '备注': item.notes || item.materialName + '库存记录'
        }));`;
        
        rulesRoutesContent = rulesRoutesContent.replace(materialCategoryFormatCode[0], newMaterialCategoryFormatCode);
      }
      
      // 保存修改后的文件
      fs.writeFileSync(rulesRoutesPath, rulesRoutesContent);
      console.log('  ✅ 规则路由处理器修复完成');
    } else {
      console.log('  ❌ 未找到规则路由处理器文件');
    }
    
    // 2. 修复规则查询处理器中的数据量限制
    console.log('\n=== 2. 修复规则查询处理器中的数据量限制 ===');
    
    const assistantControllerPath = path.join(process.cwd(), 'src/controllers/assistantController.js');
    
    if (fs.existsSync(assistantControllerPath)) {
      let assistantControllerContent = fs.readFileSync(assistantControllerPath, 'utf8');
      
      // 2.1 修改数据量限制
      console.log('  ✅ 修改数据量限制');
      
      // 查找数据量限制代码
      const dataLimitCode = assistantControllerContent.match(/\/\/ 限制返回数据量[\s\S]*?const results = dataSource\.slice\(0, 20\);/);
      
      if (dataLimitCode) {
        // 替换为不限制数据量的代码
        const newDataLimitCode = `// 获取数据（不限制数量）
      const results = dataSource;`;
        
        assistantControllerContent = assistantControllerContent.replace(dataLimitCode[0], newDataLimitCode);
      }
      
      // 保存修改后的文件
      fs.writeFileSync(assistantControllerPath, assistantControllerContent);
      console.log('  ✅ 规则查询处理器修复完成');
    } else {
      console.log('  ❌ 未找到规则查询处理器文件');
    }
    
    // 3. 添加数据处理工具函数
    console.log('\n=== 3. 添加数据处理工具函数 ===');
    
    const utilsPath = path.join(process.cwd(), 'src/utils/dataFormatUtils.js');
    
    // 创建数据处理工具函数文件
    const dataFormatUtilsContent = `/**
 * 数据格式化工具函数
 */

/**
 * 将不良率转换为百分比格式
 * @param {number} rate - 不良率（小数形式，如0.05表示5%）
 * @returns {string} - 百分比格式的不良率（如"5.0%"）
 */
export function formatDefectRate(rate) {
  if (rate === null || rate === undefined) return '0%';
  return (rate * 100).toFixed(1) + '%';
}

/**
 * 格式化日期时间
 * @param {string|Date} dateTime - 日期时间
 * @returns {string} - 格式化后的日期时间（如"2025-07-15 16:30"）
 */
export function formatDateTime(dateTime) {
  if (!dateTime) return '';
  
  const date = new Date(dateTime);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\\//g, '-');
}

/**
 * 处理内存数据中的不良率
 * @param {Array} data - 内存数据
 * @returns {Array} - 处理后的数据
 */
export function processDefectRates(data) {
  if (!Array.isArray(data)) return data;
  
  return data.map(item => {
    if (item.defectRate !== undefined) {
      item.defectRateFormatted = formatDefectRate(item.defectRate);
    }
    return item;
  });
}
`;
    
    // 确保目录存在
    const utilsDir = path.dirname(utilsPath);
    if (!fs.existsSync(utilsDir)) {
      fs.mkdirSync(utilsDir, { recursive: true });
    }
    
    // 写入文件
    fs.writeFileSync(utilsPath, dataFormatUtilsContent);
    console.log('  ✅ 数据处理工具函数已创建');
    
    console.log('\n✅ 数据问题修复完成!');
    console.log('\n🎯 下一步操作:');
    console.log('1. 重启后端服务');
    console.log('2. 在前端重新生成数据');
    console.log('3. 测试规则查询结果');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixDataIssues().catch(console.error);
