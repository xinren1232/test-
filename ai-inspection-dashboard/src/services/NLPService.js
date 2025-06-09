/**
 * NLP服务 - 提供自然语言处理服务接口
 * 用于处理用户输入文本，提取意图、实体等
 */
import { APIService } from './api/APIService';

class NLPServiceClass {
  /**
   * 从用户输入中提取意图
   * @param {string} text - 用户输入文本
   * @returns {Promise<Object>} 包含意图、实体等信息的对象
   */
  async extractIntent(text) {
    try {
      // 实际项目中应该调用后端NLP服务
      // 这里模拟一个简单的意图识别
      
      const batchPattern = /(?:批次|batch)\s*[:-]?\s*([A-Z0-9-]+)/i;
      const materialPattern = /(?:物料|material)\s*[:-]?\s*([A-Z0-9-]+)/i;
      const datePattern = /(\d{4}-\d{2}-\d{2}|\d{1,2}月\d{1,2}日|\d{1,2}\/\d{1,2}\/\d{2,4})/;
      
      let action = 'query';
      let entity = 'unknown';
      const filters = {};
      const timeRange = {
        start: null,
        end: null
      };
      
      // 检测操作类型
      if (text.includes('分析') || text.includes('趋势') || text.includes('统计')) {
        action = 'analyze';
      } else if (text.includes('比较') || text.includes('对比')) {
        action = 'compare';
      }
      
      // 检测实体类型
      if (text.includes('实验室') || text.includes('测试') || text.includes('检验数据')) {
        entity = 'lab_results';
      } else if (text.includes('质量') || text.includes('指标')) {
        entity = 'quality_metrics';
      } else if (text.includes('物料') || text.includes('材料')) {
        entity = 'materials';
      } else if (text.includes('批次')) {
        entity = 'batch';
      }
      
      // 提取批次ID
      const batchMatch = text.match(batchPattern);
      if (batchMatch && batchMatch[1]) {
        filters.batch_id = batchMatch[1];
      }
      
      // 提取物料ID
      const materialMatch = text.match(materialPattern);
      if (materialMatch && materialMatch[1]) {
        filters.material_id = materialMatch[1];
      }
      
      // 检测时间
      if (text.includes('最近') || text.includes('近期')) {
        if (text.includes('一天') || text.includes('昨天')) {
          const now = new Date();
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          timeRange.start = yesterday.toISOString().substring(0, 10);
          timeRange.end = now.toISOString().substring(0, 10);
        } else if (text.includes('一周') || text.includes('7天')) {
          const now = new Date();
          const lastWeek = new Date(now);
          lastWeek.setDate(lastWeek.getDate() - 7);
          timeRange.start = lastWeek.toISOString().substring(0, 10);
          timeRange.end = now.toISOString().substring(0, 10);
        } else if (text.includes('一个月') || text.includes('30天')) {
          const now = new Date();
          const lastMonth = new Date(now);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          timeRange.start = lastMonth.toISOString().substring(0, 10);
          timeRange.end = now.toISOString().substring(0, 10);
        }
      }
      
      // 提取具体日期
      const dateMatches = text.match(datePattern);
      if (dateMatches) {
        // 简单处理，实际项目应该有更复杂的日期解析
        // 这里假设是起始日期
        timeRange.start = dateMatches[0];
      }
      
      return {
        action,
        entity,
        filters,
        timeRange: (timeRange.start || timeRange.end) ? timeRange : null
      };
    } catch (error) {
      console.error('NLP提取意图错误:', error);
      throw new Error('解析意图时出错');
    }
  }
  
  /**
   * 生成自然语言响应
   * @param {Object} data - 响应数据
   * @param {Object} intent - 用户意图
   * @returns {string} 自然语言响应文本
   */
  generateResponse(data, intent) {
    try {
      if (!data || (Array.isArray(data) && data.length === 0)) {
        return '抱歉，未找到相关的数据。';
      }
      
      let response = '';
      
      switch (intent.action) {
        case 'query':
          if (intent.entity === 'lab_results') {
            response = `找到了${data.length}条实验室测试结果数据。`;
          } else if (intent.entity === 'quality_metrics') {
            response = `找到了${data.length}条质量指标数据。`;
          } else {
            response = `查询返回了${data.length}条结果。`;
          }
          break;
          
        case 'analyze':
          response = '根据分析，';
          if (data.trend === 'up') {
            response += '数据呈上升趋势。';
          } else if (data.trend === 'down') {
            response += '数据呈下降趋势。';
          } else {
            response += '数据趋势较为平稳。';
          }
          break;
          
        case 'compare':
          response = '比较结果：';
          if (data.difference > 0) {
            response += `有${data.difference}点差异。`;
          } else {
            response += '没有显著差异。';
          }
          break;
          
        default:
          response = '已处理您的请求。';
      }
      
      return response;
    } catch (error) {
      console.error('生成响应错误:', error);
      return '抱歉，处理结果时出现了错误。';
    }
  }
}

export const NLPService = new NLPServiceClass(); 