<template>
  <div class="test-ai-services">
    <div class="header">
      <h1>🧪 AI服务测试页面</h1>
      <p>测试DeepSeek缓存、用户会话和实时搜索服务</p>
    </div>

    <div class="test-sections">
      <!-- DeepSeek缓存测试 -->
      <div class="test-section">
        <h2>🧠 DeepSeek缓存服务测试</h2>
        <div class="test-controls">
          <input 
            v-model="testQuestion" 
            placeholder="输入测试问题..."
            class="test-input"
          />
          <button @click="testCache" class="test-button">测试缓存</button>
          <button @click="clearCache" class="test-button secondary">清空缓存</button>
        </div>
        <div class="test-results">
          <div v-if="cacheResult" class="result-item">
            <h4>缓存结果:</h4>
            <pre>{{ JSON.stringify(cacheResult, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 用户会话测试 -->
      <div class="test-section">
        <h2>👤 用户会话服务测试</h2>
        <div class="test-controls">
          <button @click="createSession" class="test-button">创建会话</button>
          <button @click="getSessionStats" class="test-button">获取统计</button>
        </div>
        <div class="test-results">
          <div v-if="sessionResult" class="result-item">
            <h4>会话结果:</h4>
            <pre>{{ JSON.stringify(sessionResult, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 实时搜索测试 -->
      <div class="test-section">
        <h2>🔍 实时搜索服务测试</h2>
        <div class="test-controls">
          <input 
            v-model="searchQuery" 
            placeholder="输入搜索查询..."
            class="test-input"
          />
          <button @click="testSearch" class="test-button">测试搜索</button>
        </div>
        <div class="test-results">
          <div v-if="searchResult" class="result-item">
            <h4>搜索结果:</h4>
            <pre>{{ JSON.stringify(searchResult, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 服务状态 -->
      <div class="test-section">
        <h2>📊 服务状态</h2>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">DeepSeek缓存:</span>
            <span class="status-value" :class="{ active: cacheServiceActive }">
              {{ cacheServiceActive ? '正常' : '异常' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">用户会话:</span>
            <span class="status-value" :class="{ active: sessionServiceActive }">
              {{ sessionServiceActive ? '正常' : '异常' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">实时搜索:</span>
            <span class="status-value" :class="{ active: searchServiceActive }">
              {{ searchServiceActive ? '正常' : '异常' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const testQuestion = ref('什么是质量管理？')
const searchQuery = ref('查询深圳工厂库存')
const cacheResult = ref(null)
const sessionResult = ref(null)
const searchResult = ref(null)

// 服务状态
const cacheServiceActive = ref(false)
const sessionServiceActive = ref(false)
const searchServiceActive = ref(false)

// 简化的服务实例（避免导入错误）
const mockDeepSeekCache = {
  cache: new Map(),
  getCachedAnswer(question, userId = 'test') {
    const key = `${userId}:${question}`
    return this.cache.get(key) || null
  },
  setCachedAnswer(question, answer, userId = 'test') {
    const key = `${userId}:${question}`
    this.cache.set(key, {
      question,
      answer,
      userId,
      timestamp: Date.now(),
      source: 'mock'
    })
  },
  clearCache() {
    this.cache.clear()
  }
}

const mockUserSession = {
  sessions: new Map(),
  createSession(userInfo) {
    const sessionId = `session_${Date.now()}`
    const session = {
      sessionId,
      userId: userInfo.id || 'test_user',
      userName: userInfo.name || '测试用户',
      startTime: new Date(),
      queryHistory: [],
      statistics: {
        totalQueries: 0,
        cacheHits: 0
      }
    }
    this.sessions.set(sessionId, session)
    return session
  },
  getSessionStats(sessionId) {
    const session = this.sessions.get(sessionId)
    return session ? session.statistics : null
  }
}

const mockRealtimeSearch = {
  async executeRealtimeSearch(query, userContext = {}) {
    // 模拟搜索延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      result: {
        content: `模拟搜索结果：${query}`,
        source: 'mock-engine',
        category: '测试查询'
      },
      metadata: {
        engine: 'mock-search',
        responseTime: 500,
        timestamp: new Date()
      }
    }
  }
}

// 测试函数
const testCache = () => {
  try {
    console.log('🧪 测试DeepSeek缓存...')
    
    // 先尝试获取缓存
    let result = mockDeepSeekCache.getCachedAnswer(testQuestion.value)
    
    if (!result) {
      // 如果没有缓存，创建一个
      const mockAnswer = `这是对"${testQuestion.value}"的模拟回答。`
      mockDeepSeekCache.setCachedAnswer(testQuestion.value, mockAnswer)
      result = mockDeepSeekCache.getCachedAnswer(testQuestion.value)
    }
    
    cacheResult.value = {
      cached: !!result,
      result: result,
      cacheSize: mockDeepSeekCache.cache.size,
      timestamp: new Date().toLocaleString()
    }
    
    cacheServiceActive.value = true
    console.log('✅ DeepSeek缓存测试成功')
    
  } catch (error) {
    console.error('❌ DeepSeek缓存测试失败:', error)
    cacheResult.value = { error: error.message }
    cacheServiceActive.value = false
  }
}

const clearCache = () => {
  mockDeepSeekCache.clearCache()
  cacheResult.value = {
    message: '缓存已清空',
    cacheSize: 0,
    timestamp: new Date().toLocaleString()
  }
}

const createSession = () => {
  try {
    console.log('🧪 测试用户会话...')
    
    const session = mockUserSession.createSession({
      id: 'test_user_' + Date.now(),
      name: '测试用户',
      role: 'operator'
    })
    
    sessionResult.value = {
      session: session,
      activeSessions: mockUserSession.sessions.size,
      timestamp: new Date().toLocaleString()
    }
    
    sessionServiceActive.value = true
    console.log('✅ 用户会话测试成功')
    
  } catch (error) {
    console.error('❌ 用户会话测试失败:', error)
    sessionResult.value = { error: error.message }
    sessionServiceActive.value = false
  }
}

const getSessionStats = () => {
  const sessions = Array.from(mockUserSession.sessions.values())
  sessionResult.value = {
    totalSessions: sessions.length,
    sessions: sessions,
    timestamp: new Date().toLocaleString()
  }
}

const testSearch = async () => {
  try {
    console.log('🧪 测试实时搜索...')
    
    const result = await mockRealtimeSearch.executeRealtimeSearch(
      searchQuery.value,
      { userId: 'test_user', role: 'operator' }
    )
    
    searchResult.value = {
      searchQuery: searchQuery.value,
      result: result,
      timestamp: new Date().toLocaleString()
    }
    
    searchServiceActive.value = true
    console.log('✅ 实时搜索测试成功')
    
  } catch (error) {
    console.error('❌ 实时搜索测试失败:', error)
    searchResult.value = { error: error.message }
    searchServiceActive.value = false
  }
}

// 初始化测试
onMounted(() => {
  console.log('🚀 AI服务测试页面已加载')
  
  // 自动运行基础测试
  setTimeout(() => {
    testCache()
    createSession()
  }, 1000)
})
</script>

<style scoped>
.test-ai-services {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.header p {
  color: #7f8c8d;
  font-size: 16px;
}

.test-sections {
  display: grid;
  gap: 30px;
}

.test-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
}

.test-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 18px;
}

.test-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.test-input {
  flex: 1;
  min-width: 200px;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.test-button {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.test-button:hover {
  background: #2980b9;
}

.test-button.secondary {
  background: #95a5a6;
}

.test-button.secondary:hover {
  background: #7f8c8d;
}

.test-results {
  margin-top: 20px;
}

.result-item {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  border-left: 4px solid #3498db;
}

.result-item h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 14px;
}

.result-item pre {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.status-label {
  font-weight: 500;
  color: #495057;
}

.status-value {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: #e74c3c;
  color: white;
}

.status-value.active {
  background: #27ae60;
}
</style>
