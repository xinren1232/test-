/**
 * 网络搜索服务模块
 * 支持多种搜索引擎和实时信息获取
 */

class WebSearchService {
  constructor() {
    this.searchEngines = {
      // 使用免费的搜索API
      serpapi: {
        baseURL: 'https://serpapi.com/search',
        // 注意：这需要API密钥，可以注册免费账户
        apiKey: null
      },
      // 使用DuckDuckGo的即时答案API（免费）
      duckduckgo: {
        baseURL: 'https://api.duckduckgo.com/',
        instantAnswer: true
      },
      // 使用Wikipedia API（免费）
      wikipedia: {
        baseURL: 'https://zh.wikipedia.org/api/rest_v1/',
        language: 'zh'
      }
    };
  }

  /**
   * 通用搜索接口
   * @param {string} query - 搜索查询
   * @param {Object} options - 搜索选项
   * @returns {Promise<Object>} 搜索结果
   */
  async search(query, options = {}) {
    const { 
      engine = 'duckduckgo', 
      limit = 5,
      type = 'web' 
    } = options;

    try {
      console.log(`🔍 开始搜索: "${query}" (引擎: ${engine})`);

      switch (engine) {
        case 'duckduckgo':
          return await this.searchDuckDuckGo(query, limit);
        case 'wikipedia':
          return await this.searchWikipedia(query, limit);
        case 'news':
          return await this.searchNews(query, limit);
        default:
          return await this.searchDuckDuckGo(query, limit);
      }
    } catch (error) {
      console.error('❌ 搜索失败:', error);
      throw error;
    }
  }

  /**
   * DuckDuckGo搜索（免费，无需API密钥）
   */
  async searchDuckDuckGo(query, limit = 5) {
    try {
      // 使用DuckDuckGo的即时答案API
      const instantAnswerURL = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      
      const response = await fetch(instantAnswerURL);
      const data = await response.json();

      const results = {
        query: query,
        engine: 'duckduckgo',
        timestamp: new Date().toISOString(),
        results: []
      };

      // 处理即时答案
      if (data.AbstractText) {
        results.results.push({
          title: data.Heading || '即时答案',
          snippet: data.AbstractText,
          url: data.AbstractURL || '',
          type: 'instant_answer'
        });
      }

      // 处理相关主题
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        data.RelatedTopics.slice(0, limit - 1).forEach(topic => {
          if (topic.Text && topic.FirstURL) {
            results.results.push({
              title: topic.Text.split(' - ')[0] || '相关主题',
              snippet: topic.Text,
              url: topic.FirstURL,
              type: 'related_topic'
            });
          }
        });
      }

      // 如果没有结果，返回搜索建议
      if (results.results.length === 0) {
        results.results.push({
          title: '搜索建议',
          snippet: `没有找到关于"${query}"的直接答案，建议尝试更具体的关键词。`,
          url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          type: 'suggestion'
        });
      }

      console.log(`✅ DuckDuckGo搜索完成，找到 ${results.results.length} 个结果`);
      return results;

    } catch (error) {
      console.error('❌ DuckDuckGo搜索失败:', error);
      throw new Error(`DuckDuckGo搜索失败: ${error.message}`);
    }
  }

  /**
   * Wikipedia搜索
   */
  async searchWikipedia(query, limit = 3) {
    try {
      // 搜索Wikipedia页面
      const searchURL = `https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      
      const response = await fetch(searchURL);
      
      if (!response.ok) {
        throw new Error(`Wikipedia API错误: ${response.status}`);
      }

      const data = await response.json();

      const results = {
        query: query,
        engine: 'wikipedia',
        timestamp: new Date().toISOString(),
        results: []
      };

      if (data.extract) {
        results.results.push({
          title: data.title || query,
          snippet: data.extract,
          url: data.content_urls?.desktop?.page || `https://zh.wikipedia.org/wiki/${encodeURIComponent(query)}`,
          type: 'wikipedia_summary',
          thumbnail: data.thumbnail?.source
        });
      }

      console.log(`✅ Wikipedia搜索完成，找到 ${results.results.length} 个结果`);
      return results;

    } catch (error) {
      console.error('❌ Wikipedia搜索失败:', error);
      // 如果直接搜索失败，尝试搜索建议
      return await this.searchWikipediaSuggestions(query, limit);
    }
  }

  /**
   * Wikipedia搜索建议
   */
  async searchWikipediaSuggestions(query, limit = 3) {
    try {
      const suggestURL = `https://zh.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=${limit}&format=json&origin=*`;
      
      const response = await fetch(suggestURL);
      const data = await response.json();

      const results = {
        query: query,
        engine: 'wikipedia_suggestions',
        timestamp: new Date().toISOString(),
        results: []
      };

      if (data && data.length >= 4) {
        const titles = data[1];
        const descriptions = data[2];
        const urls = data[3];

        for (let i = 0; i < Math.min(titles.length, limit); i++) {
          results.results.push({
            title: titles[i],
            snippet: descriptions[i] || '暂无描述',
            url: urls[i],
            type: 'wikipedia_suggestion'
          });
        }
      }

      console.log(`✅ Wikipedia建议搜索完成，找到 ${results.results.length} 个结果`);
      return results;

    } catch (error) {
      console.error('❌ Wikipedia建议搜索失败:', error);
      throw error;
    }
  }

  /**
   * 新闻搜索（使用免费新闻API）
   */
  async searchNews(query, limit = 5) {
    try {
      // 使用NewsAPI的免费层（需要注册获取API密钥）
      // 这里提供一个备用方案，使用RSS源
      const results = {
        query: query,
        engine: 'news',
        timestamp: new Date().toISOString(),
        results: []
      };

      // 模拟新闻搜索结果（实际应用中应该接入真实的新闻API）
      results.results.push({
        title: '新闻搜索功能',
        snippet: `关于"${query}"的新闻搜索功能正在开发中。建议使用其他搜索引擎获取最新信息。`,
        url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
        type: 'news_placeholder'
      });

      return results;

    } catch (error) {
      console.error('❌ 新闻搜索失败:', error);
      throw error;
    }
  }

  /**
   * 获取实时信息
   */
  async getRealTimeInfo(type, query = '') {
    try {
      console.log(`⏰ 获取实时信息: ${type}`);

      switch (type) {
        case 'time':
          return this.getCurrentTime();
        case 'weather':
          return await this.getWeatherInfo(query);
        case 'exchange':
          return await this.getExchangeRates();
        default:
          throw new Error(`不支持的实时信息类型: ${type}`);
      }
    } catch (error) {
      console.error('❌ 获取实时信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前时间
   */
  getCurrentTime() {
    const now = new Date();
    return {
      type: 'time',
      data: {
        timestamp: now.toISOString(),
        local_time: now.toLocaleString('zh-CN'),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        unix_timestamp: Math.floor(now.getTime() / 1000)
      }
    };
  }

  /**
   * 获取天气信息（使用免费天气API）
   */
  async getWeatherInfo(city = '北京') {
    try {
      // 这里可以接入免费的天气API，如OpenWeatherMap
      // 目前返回模拟数据
      return {
        type: 'weather',
        data: {
          city: city,
          message: '天气信息功能正在开发中，建议查询具体的天气网站获取准确信息。',
          suggestion: `https://weather.com/zh-CN/weather/today/l/${encodeURIComponent(city)}`
        }
      };
    } catch (error) {
      throw new Error(`天气信息获取失败: ${error.message}`);
    }
  }

  /**
   * 获取汇率信息
   */
  async getExchangeRates() {
    try {
      // 使用免费的汇率API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();

      return {
        type: 'exchange',
        data: {
          base: data.base,
          date: data.date,
          rates: {
            CNY: data.rates.CNY,
            EUR: data.rates.EUR,
            JPY: data.rates.JPY,
            GBP: data.rates.GBP
          }
        }
      };
    } catch (error) {
      throw new Error(`汇率信息获取失败: ${error.message}`);
    }
  }

  /**
   * 智能搜索 - 根据查询内容自动选择最佳搜索引擎
   */
  async smartSearch(query) {
    try {
      console.log(`🧠 智能搜索: "${query}"`);

      // 分析查询内容，选择最佳搜索策略
      const searchStrategy = this.analyzeQuery(query);
      
      const results = [];

      // 执行多个搜索引擎的并行搜索
      const searchPromises = searchStrategy.engines.map(async (engine) => {
        try {
          return await this.search(query, { engine, limit: 3 });
        } catch (error) {
          console.warn(`⚠️ ${engine}搜索失败:`, error.message);
          return null;
        }
      });

      const searchResults = await Promise.allSettled(searchPromises);
      
      searchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
        }
      });

      return {
        query: query,
        strategy: searchStrategy,
        timestamp: new Date().toISOString(),
        sources: results
      };

    } catch (error) {
      console.error('❌ 智能搜索失败:', error);
      throw error;
    }
  }

  /**
   * 分析查询内容，确定搜索策略
   */
  analyzeQuery(query) {
    const lowerQuery = query.toLowerCase();
    
    // 检测查询类型
    const patterns = {
      time: /时间|现在几点|当前时间/,
      weather: /天气|气温|下雨|晴天/,
      news: /新闻|最新|今天发生/,
      wikipedia: /是什么|定义|介绍|历史/,
      technical: /技术|编程|代码|算法/
    };

    const detectedTypes = [];
    const engines = ['duckduckgo']; // 默认引擎

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(lowerQuery)) {
        detectedTypes.push(type);
        
        if (type === 'wikipedia') {
          engines.push('wikipedia');
        } else if (type === 'news') {
          engines.push('news');
        }
      }
    }

    return {
      types: detectedTypes,
      engines: [...new Set(engines)], // 去重
      priority: detectedTypes[0] || 'general'
    };
  }
}

// 创建搜索服务实例
export const webSearchService = new WebSearchService();

// 导出默认实例
export default webSearchService;
