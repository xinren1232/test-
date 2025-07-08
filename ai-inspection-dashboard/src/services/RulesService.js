/**
 * 规则管理服务
 * 处理NLP规则相关的API调用
 */
import apiClient from '../api/ApiClient.js';
import { API_ENDPOINTS } from '../api/endpoints.js';

class RulesService {
  constructor() {
    this.apiClient = apiClient;
  }

  /**
   * 获取所有规则
   */
  async getAllRules() {
    try {
      const response = await this.apiClient.get(API_ENDPOINTS.RULES.LIST);
      return response;
    } catch (error) {
      console.error('获取规则失败:', error);
      throw error;
    }
  }

  /**
   * 获取规则分类统计
   */
  async getRuleCategories() {
    try {
      const response = await this.apiClient.get(API_ENDPOINTS.RULES.CATEGORIES);
      return response;
    } catch (error) {
      console.error('获取规则分类失败:', error);
      throw error;
    }
  }

  /**
   * 获取规则统计信息
   */
  async getRuleStats() {
    try {
      const response = await this.apiClient.get(API_ENDPOINTS.RULES.STATS);
      return response;
    } catch (error) {
      console.error('获取规则统计失败:', error);
      throw error;
    }
  }

  /**
   * 测试特定规则
   * @param {number} ruleId 规则ID
   */
  async testRule(ruleId) {
    try {
      const response = await this.apiClient.post(API_ENDPOINTS.RULES.TEST(ruleId));
      return response;
    } catch (error) {
      console.error(`测试规则 ${ruleId} 失败:`, error);
      throw error;
    }
  }

  /**
   * 批量测试所有规则
   */
  async testAllRules() {
    try {
      const response = await this.apiClient.post(API_ENDPOINTS.RULES.TEST_ALL);
      return response;
    } catch (error) {
      console.error('批量测试规则失败:', error);
      throw error;
    }
  }

  /**
   * 获取数据状态
   */
  async getDataStatus() {
    try {
      const response = await this.apiClient.get(API_ENDPOINTS.DATA.STATUS);
      return response;
    } catch (error) {
      console.error('获取数据状态失败:', error);
      throw error;
    }
  }

  /**
   * 格式化规则数据用于显示
   * @param {Array} rules 规则数组
   */
  formatRulesForDisplay(rules) {
    return rules.map(rule => ({
      id: rule.id,
      name: rule.intent_name,
      description: rule.description,
      priority: rule.priority,
      status: rule.status,
      example: rule.example_query,
      createdAt: new Date(rule.created_at).toLocaleDateString('zh-CN'),
      updatedAt: new Date(rule.updated_at).toLocaleDateString('zh-CN'),
      category: this.getCategoryByPriority(rule.priority)
    }));
  }

  /**
   * 根据优先级获取分类
   * @param {number} priority 优先级
   */
  getCategoryByPriority(priority) {
    if (priority >= 9) return '基础规则';
    if (priority === 8) return '中级规则';
    if (priority === 7) return '高级规则';
    if (priority === 6) return '专项规则';
    if (priority === 5) return '排行规则';
    if (priority === 4) return '复杂规则';
    return '其他规则';
  }

  /**
   * 获取分类颜色
   * @param {string} category 分类名称
   */
  getCategoryColor(category) {
    const colorMap = {
      '基础规则': '#67C23A',
      '中级规则': '#409EFF',
      '高级规则': '#E6A23C',
      '专项规则': '#F56C6C',
      '排行规则': '#909399',
      '复杂规则': '#9C27B0'
    };
    return colorMap[category] || '#909399';
  }

  /**
   * 获取状态颜色
   * @param {string} status 状态
   */
  getStatusColor(status) {
    return status === 'active' ? 'success' : 'info';
  }

  /**
   * 获取状态文本
   * @param {string} status 状态
   */
  getStatusText(status) {
    return status === 'active' ? '活跃' : '非活跃';
  }

  /**
   * 导出规则数据
   * @param {Array} rules 规则数组
   */
  exportRules(rules) {
    const exportData = {
      exportTime: new Date().toISOString(),
      totalRules: rules.length,
      rules: rules.map(rule => ({
        name: rule.intent_name,
        description: rule.description,
        priority: rule.priority,
        status: rule.status,
        example: rule.example_query,
        category: this.getCategoryByPriority(rule.priority)
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iqe-rules-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * 搜索规则
   * @param {Array} rules 规则数组
   * @param {string} keyword 搜索关键词
   */
  searchRules(rules, keyword) {
    if (!keyword) return rules;
    
    const lowerKeyword = keyword.toLowerCase();
    return rules.filter(rule => 
      rule.intent_name.toLowerCase().includes(lowerKeyword) ||
      rule.description.toLowerCase().includes(lowerKeyword) ||
      rule.example_query?.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * 按分类过滤规则
   * @param {Array} rules 规则数组
   * @param {string} category 分类
   */
  filterRulesByCategory(rules, category) {
    if (!category || category === '全部') return rules;
    
    return rules.filter(rule => 
      this.getCategoryByPriority(rule.priority) === category
    );
  }

  /**
   * 按状态过滤规则
   * @param {Array} rules 规则数组
   * @param {string} status 状态
   */
  filterRulesByStatus(rules, status) {
    if (!status || status === '全部') return rules;
    
    return rules.filter(rule => rule.status === status);
  }
}

export default new RulesService();
