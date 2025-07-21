/**
 * SQL模板渲染引擎
 * 支持Jinja2风格的模板语法，用于动态生成SQL查询
 */

import { logger } from '../utils/logger.js';

/**
 * 模板渲染引擎类
 */
class TemplateEngine {
  constructor() {
    this.logger = logger;
  }

  /**
   * 渲染模板
   * @param {string} template - 模板字符串
   * @param {object} params - 参数对象
   * @returns {string} 渲染后的字符串
   */
  render(template, params = {}) {
    try {
      this.logger.info(`🎨 开始渲染模板`, { template: template.substring(0, 100) + '...', params });

      let result = template;

      // 1. 处理条件语句 {% if condition %} ... {% endif %}
      result = this.processConditionals(result, params);

      // 2. 处理变量替换 {{ variable }}
      result = this.processVariables(result, params);

      // 3. 清理多余的空白
      result = this.cleanWhitespace(result);

      this.logger.info(`✅ 模板渲染完成`, { result });
      return result;

    } catch (error) {
      this.logger.error(`❌ 模板渲染失败:`, error);
      throw new Error(`模板渲染失败: ${error.message}`);
    }
  }

  /**
   * 处理条件语句
   * @param {string} template - 模板字符串
   * @param {object} params - 参数对象
   * @returns {string} 处理后的字符串
   */
  processConditionals(template, params) {
    // 匹配 {% if variable %} ... {% endif %} 模式
    const conditionalRegex = /{%\s*if\s+(\w+)\s*%}(.*?){%\s*endif\s*%}/gs;
    
    return template.replace(conditionalRegex, (match, condition, content) => {
      // 检查条件是否为真
      const value = params[condition];
      const isTrue = value !== undefined && value !== null && value !== '' && value !== false;
      
      this.logger.debug(`🔍 条件判断: ${condition} = ${value} (${isTrue ? '真' : '假'})`);
      
      return isTrue ? content.trim() : '';
    });
  }

  /**
   * 处理变量替换
   * @param {string} template - 模板字符串
   * @param {object} params - 参数对象
   * @returns {string} 处理后的字符串
   */
  processVariables(template, params) {
    // 匹配 {{ variable }} 模式
    const variableRegex = /{{\s*(\w+)\s*}}/g;
    
    return template.replace(variableRegex, (match, variable) => {
      const value = params[variable];
      
      if (value === undefined || value === null) {
        this.logger.warn(`⚠️ 变量 ${variable} 未定义`);
        return match; // 保持原样
      }
      
      // 对字符串值进行SQL转义
      const escapedValue = this.escapeSQLValue(value);
      this.logger.debug(`🔄 变量替换: ${variable} -> ${escapedValue}`);
      
      return escapedValue;
    });
  }

  /**
   * SQL值转义
   * @param {any} value - 要转义的值
   * @returns {string} 转义后的值
   */
  escapeSQLValue(value) {
    if (typeof value === 'string') {
      // 转义单引号，防止SQL注入
      return value.replace(/'/g, "''");
    }
    
    if (typeof value === 'number') {
      return value.toString();
    }
    
    if (typeof value === 'boolean') {
      return value ? '1' : '0';
    }
    
    return value.toString();
  }

  /**
   * 清理多余的空白
   * @param {string} text - 文本
   * @returns {string} 清理后的文本
   */
  cleanWhitespace(text) {
    return text
      .replace(/\s+/g, ' ')  // 多个空白字符替换为单个空格
      .replace(/\s*,\s*/g, ', ')  // 逗号前后的空格标准化
      // 先保护复合操作符，使用占位符
      .replace(/\s*!=\s*/g, ' __NE__ ')  // 不等号占位符
      .replace(/\s*<=\s*/g, ' __LE__ ')  // 小于等于占位符
      .replace(/\s*>=\s*/g, ' __GE__ ')  // 大于等于占位符
      .replace(/\s*<>\s*/g, ' __NE2__ ')  // 不等号占位符
      .replace(/\s*=\s*/g, ' = ')   // 等号前后的空格标准化
      // 恢复复合操作符
      .replace(/ __NE__ /g, ' != ')
      .replace(/ __LE__ /g, ' <= ')
      .replace(/ __GE__ /g, ' >= ')
      .replace(/ __NE2__ /g, ' <> ')
      .replace(/\s*\(\s*/g, ' (')  // 左括号前后的空格
      .replace(/\s*\)\s*/g, ') ')  // 右括号前后的空格
      .trim();  // 去除首尾空白
  }

  /**
   * 验证模板语法
   * @param {string} template - 模板字符串
   * @returns {object} 验证结果
   */
  validateTemplate(template) {
    const errors = [];
    
    // 检查条件语句是否配对
    const ifCount = (template.match(/{%\s*if\s+/g) || []).length;
    const endifCount = (template.match(/{%\s*endif\s*%}/g) || []).length;
    
    if (ifCount !== endifCount) {
      errors.push(`条件语句不配对: ${ifCount} 个 if, ${endifCount} 个 endif`);
    }
    
    // 检查变量语法
    const invalidVariables = template.match(/{{\s*[^}]*[^}\w\s][^}]*}}/g);
    if (invalidVariables) {
      errors.push(`无效的变量语法: ${invalidVariables.join(', ')}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 提取模板中的变量
   * @param {string} template - 模板字符串
   * @returns {array} 变量名数组
   */
  extractVariables(template) {
    const variables = new Set();
    
    // 提取 {{ variable }} 中的变量
    const variableMatches = template.match(/{{\s*(\w+)\s*}}/g);
    if (variableMatches) {
      variableMatches.forEach(match => {
        const variable = match.replace(/{{\s*|\s*}}/g, '');
        variables.add(variable);
      });
    }
    
    // 提取 {% if variable %} 中的变量
    const conditionalMatches = template.match(/{%\s*if\s+(\w+)\s*%}/g);
    if (conditionalMatches) {
      conditionalMatches.forEach(match => {
        const variable = match.replace(/{%\s*if\s+|\s*%}/g, '');
        variables.add(variable);
      });
    }
    
    return Array.from(variables);
  }

  /**
   * 生成SQL查询示例
   * @param {string} template - SQL模板
   * @param {object} sampleParams - 示例参数
   * @returns {string} 示例SQL
   */
  generateExample(template, sampleParams = {}) {
    // 提取模板变量
    const variables = this.extractVariables(template);
    
    // 为缺失的变量提供默认值
    const exampleParams = { ...sampleParams };
    variables.forEach(variable => {
      if (!(variable in exampleParams)) {
        exampleParams[variable] = `[${variable}]`;
      }
    });
    
    return this.render(template, exampleParams);
  }
}

/**
 * 预定义的SQL模板库
 */
export const SQL_TEMPLATES = {
  // 库存查询模板
  INVENTORY_BY_FACTORY: `
    SELECT * FROM inventory 
    WHERE factory LIKE '%{{ factory }}%'
    {% if status %} AND status = '{{ status }}' {% endif %}
    {% if supplier %} AND supplier LIKE '%{{ supplier }}%' {% endif %}
    {% if material %} AND material_name LIKE '%{{ material }}%' {% endif %}
    ORDER BY created_at DESC
  `,

  INVENTORY_BY_STATUS: `
    SELECT factory, status, COUNT(*) as count, SUM(quantity) as total_quantity
    FROM inventory 
    WHERE status = '{{ status }}'
    {% if factory %} AND factory LIKE '%{{ factory }}%' {% endif %}
    GROUP BY factory, status
    ORDER BY count DESC
  `,

  // 批次查询模板
  BATCH_RISK_CHECK: `
    SELECT b.batch_code, b.status, i.material_name, i.supplier, i.factory
    FROM batch_summary b
    JOIN inventory i ON b.batch_code = i.batch_code
    WHERE b.batch_code = '{{ batch_no }}'
    {% if risk_level %} AND b.risk_level = '{{ risk_level }}' {% endif %}
  `,

  // 供应商质量分析模板
  SUPPLIER_QUALITY_ANALYSIS: `
    SELECT 
      supplier,
      COUNT(*) as total_batches,
      SUM(CASE WHEN status = '正常' THEN 1 ELSE 0 END) as normal_count,
      SUM(CASE WHEN status = '风险' THEN 1 ELSE 0 END) as risk_count,
      ROUND(SUM(CASE WHEN status = '正常' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as quality_rate
    FROM inventory
    WHERE supplier LIKE '%{{ supplier }}%'
    {% if material %} AND material_name LIKE '%{{ material }}%' {% endif %}
    {% if factory %} AND factory LIKE '%{{ factory }}%' {% endif %}
    GROUP BY supplier
    ORDER BY quality_rate DESC
  `,

  // 物料不良率分析模板
  MATERIAL_DEFECT_ANALYSIS: `
    SELECT 
      material_name,
      factory,
      AVG(defect_rate) as avg_defect_rate,
      MIN(defect_rate) as min_defect_rate,
      MAX(defect_rate) as max_defect_rate,
      COUNT(*) as total_records
    FROM production
    WHERE material_name LIKE '%{{ material }}%'
    {% if factory %} AND factory LIKE '%{{ factory }}%' {% endif %}
    {% if supplier %} AND supplier LIKE '%{{ supplier }}%' {% endif %}
    GROUP BY material_name, factory
    ORDER BY avg_defect_rate DESC
  `,

  // 测试结果查询模板
  TEST_RESULTS_QUERY: `
    SELECT 
      material_name,
      test_result,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_test WHERE material_name LIKE '%{{ material }}%'), 2) as percentage
    FROM lab_test
    WHERE material_name LIKE '%{{ material }}%'
    {% if supplier %} AND supplier LIKE '%{{ supplier }}%' {% endif %}
    {% if test_result %} AND test_result = '{{ test_result }}' {% endif %}
    GROUP BY material_name, test_result
    ORDER BY count DESC
  `
};

// 导出单例实例
export const templateEngine = new TemplateEngine();
export default TemplateEngine;
