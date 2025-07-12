// API端点定义
export const API_ENDPOINTS = {
  // 规则管理相关 - 统一使用 /api/rules
  RULES: {
    LIST: '/api/rules',
    CATEGORIES: '/api/rules/categories',
    STATS: '/api/rules/stats',
    TEST: (id) => `/api/rules/test/${id}`,
    TEST_ALL: '/api/rules/test-all'
  },

  // 数据相关
  DATA: {
    STATUS: '/api/data/status',
    NLP_RULES: '/api/data/nlp-rules',
    SYNC: '/api/data/sync',
    ONLINE_TRACKING: '/api/data/online-tracking'
  },

  // AI助手相关
  ASSISTANT: {
    QUERY: '/api/assistant/query',
    CHAT: '/api/assistant/chat',
    RULES: '/api/rules'  // 统一规则端点，指向主要的规则API
  }
};

export default API_ENDPOINTS;
