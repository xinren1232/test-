<template>
  <div class="test-voice-ai">
    <div class="header">
      <h1>🎤 小Q语音AI功能测试</h1>
      <p>测试QMS问答助手-小Q的语音识别、AI分析和语音合成功能</p>
    </div>

    <div class="test-sections">
      <!-- AI服务测试 -->
      <div class="test-section">
        <h2>🤖 AI服务测试</h2>
        <div class="status-card" :class="{ 'success': aiStatus.available, 'error': !aiStatus.available }">
          <div class="status-icon">{{ aiStatus.available ? '✅' : '❌' }}</div>
          <div class="status-info">
            <div class="status-title">AI服务状态</div>
            <div class="status-detail">{{ aiStatus.available ? '服务正常' : aiStatus.error || '服务不可用' }}</div>
          </div>
        </div>
        <button @click="testAI" :disabled="isTestingAI" class="test-button">
          {{ isTestingAI ? '测试中...' : '测试AI服务' }}
        </button>
        <div v-if="aiTestResult" class="test-result">
          <h4>AI测试结果：</h4>
          <pre>{{ aiTestResult }}</pre>
        </div>
      </div>

      <!-- 语音服务测试 -->
      <div class="test-section">
        <h2>🎤 语音服务测试</h2>
        <div class="status-card" :class="{ 'success': voiceStatus.isSupported, 'error': !voiceStatus.isSupported }">
          <div class="status-icon">{{ voiceStatus.isSupported ? '✅' : '❌' }}</div>
          <div class="status-info">
            <div class="status-title">语音服务状态</div>
            <div class="status-detail">{{ voiceStatus.isSupported ? '浏览器支持语音功能' : '浏览器不支持语音功能' }}</div>
          </div>
        </div>
        
        <div class="voice-controls">
          <button 
            @click="toggleVoiceRecording" 
            :disabled="!voiceStatus.isSupported"
            class="voice-button"
            :class="{ 'recording': voiceStatus.isListening }"
          >
            {{ voiceStatus.isListening ? '🔴 停止录音' : '🎤 开始录音' }}
          </button>
          
          <button 
            @click="testVoiceSynthesis" 
            :disabled="!voiceStatus.isSupported || voiceStatus.isSpeaking"
            class="test-button"
          >
            {{ voiceStatus.isSpeaking ? '🔊 播放中...' : '🔉 测试语音播放' }}
          </button>
        </div>

        <div v-if="voiceTranscript.interim" class="voice-transcript">
          <h4>识别中：</h4>
          <p class="interim">{{ voiceTranscript.interim }}</p>
        </div>

        <div v-if="voiceTranscript.final" class="voice-transcript">
          <h4>识别结果：</h4>
          <p class="final">{{ voiceTranscript.final }}</p>
          <p class="confidence">置信度: {{ (voiceTranscript.confidence * 100).toFixed(1) }}%</p>
        </div>
      </div>

      <!-- 综合测试 -->
      <div class="test-section">
        <h2>🚀 综合功能测试</h2>
        <p>说话 → AI分析 → 语音回复</p>
        <button 
          @click="startComprehensiveTest" 
          :disabled="!voiceStatus.isSupported || !aiStatus.available || isComprehensiveTesting"
          class="comprehensive-button"
        >
          {{ isComprehensiveTesting ? '测试进行中...' : '开始综合测试' }}
        </button>
        
        <div v-if="comprehensiveTestLog.length > 0" class="test-log">
          <h4>测试日志：</h4>
          <div v-for="(log, index) in comprehensiveTestLog" :key="index" class="log-item">
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AIServiceManager from '../services/AIServiceManager.js'
import VoiceServiceManager from '../services/VoiceServiceManager.js'

// 状态数据
const aiStatus = ref({ available: false, error: null })
const voiceStatus = ref({ isSupported: false, isListening: false, isSpeaking: false })
const voiceTranscript = ref({ final: '', interim: '', confidence: 0 })

// 测试状态
const isTestingAI = ref(false)
const aiTestResult = ref('')
const isComprehensiveTesting = ref(false)
const comprehensiveTestLog = ref([])

// 初始化
onMounted(async () => {
  console.log('🧪 初始化语音AI测试页面')
  
  // 初始化AI服务
  try {
    const aiAvailable = await AIServiceManager.initialize()
    aiStatus.value = { available: aiAvailable, error: aiAvailable ? null : 'AI服务初始化失败' }
  } catch (error) {
    aiStatus.value = { available: false, error: error.message }
  }

  // 初始化语音服务
  voiceStatus.value = VoiceServiceManager.getStatus()
  
  // 设置语音回调
  VoiceServiceManager.setCallbacks({
    onResult: (result) => {
      console.log('🎤 测试页面收到语音识别结果:', result)
      voiceTranscript.value = result
      addLog(`语音识别: final="${result.final}", interim="${result.interim}", confidence=${result.confidence}`)
    },
    onError: (error) => {
      console.error('语音错误:', error)
      voiceStatus.value.isListening = false
      addLog(`语音识别错误: ${error}`)
    },
    onStart: () => {
      voiceStatus.value.isListening = true
      addLog('语音识别开始')
    },
    onEnd: () => {
      voiceStatus.value.isListening = false
      addLog('语音识别结束')
    },
    onSpeechStart: () => {
      voiceStatus.value.isSpeaking = true
      addLog('语音播放开始')
    },
    onSpeechEnd: () => {
      voiceStatus.value.isSpeaking = false
      addLog('语音播放结束')
    }
  })

// 添加日志函数
const addLog = (message) => {
  if (!comprehensiveTestLog.value) {
    comprehensiveTestLog.value = []
  }
  comprehensiveTestLog.value.push({
    timestamp: new Date(),
    message: message
  })
  console.log('📝 测试日志:', message)
}
})

// AI测试
const testAI = async () => {
  isTestingAI.value = true
  try {
    const result = await AIServiceManager.analyzeUserIntent('测试查询深圳工厂的库存情况')
    aiTestResult.value = JSON.stringify(result, null, 2)
  } catch (error) {
    aiTestResult.value = `测试失败: ${error.message}`
  } finally {
    isTestingAI.value = false
  }
}

// 语音录音切换
const toggleVoiceRecording = () => {
  if (voiceStatus.value.isListening) {
    VoiceServiceManager.stopListening()
  } else {
    voiceTranscript.value = { final: '', interim: '', confidence: 0 }
    VoiceServiceManager.startListening()
  }
}

// 测试语音合成
const testVoiceSynthesis = () => {
  const testText = '您好，我是小Q，您的专属QMS问答助手！语音功能正常工作，有什么问题尽管问我吧！'
  VoiceServiceManager.speak(testText)
}

// 综合测试
const startComprehensiveTest = () => {
  isComprehensiveTesting.value = true
  comprehensiveTestLog.value = []
  
  addLog('开始综合测试')
  addLog('请说话，我会识别您的语音，然后用AI分析并语音回复')
  
  // 清空之前的识别结果
  voiceTranscript.value = { final: '', interim: '', confidence: 0 }
  
  // 开始语音识别
  VoiceServiceManager.startListening()
  
  // 监听识别结果
  const originalOnResult = VoiceServiceManager.onResult
  VoiceServiceManager.setCallbacks({
    ...VoiceServiceManager,
    onResult: async (result) => {
      voiceTranscript.value = result
      if (result.final && result.final.trim()) {
        addLog(`语音识别完成: ${result.final}`)
        
        try {
          // AI分析
          addLog('正在进行AI分析...')
          const analysis = await AIServiceManager.analyzeUserIntent(result.final)
          addLog(`AI分析完成: ${analysis.intent}`)
          
          // 生成回复
          const reply = `我是小Q！我听到您说："${result.final}"。根据AI分析，这是一个${analysis.intent}类型的问题。有什么其他问题随时问我哦！`
          addLog(`生成回复: ${reply}`)
          
          // 语音播放回复
          addLog('开始语音播放回复...')
          VoiceServiceManager.speak(reply)
          
        } catch (error) {
          addLog(`AI分析失败: ${error.message}`)
        } finally {
          isComprehensiveTesting.value = false
        }
      }
    },
    onEnd: () => {
      voiceStatus.value.isListening = false
      if (isComprehensiveTesting.value && !voiceTranscript.value.final) {
        addLog('未识别到语音，测试结束')
        isComprehensiveTesting.value = false
      }
    }
  })
}

// 添加日志
const addLog = (message) => {
  comprehensiveTestLog.value.push({
    timestamp: new Date(),
    message: message
  })
}

// 格式化时间
const formatTime = (timestamp) => {
  return timestamp.toLocaleTimeString()
}
</script>

<style scoped>
.test-voice-ai {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.test-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.test-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.test-section h2 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.status-card.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.status-card.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

.status-icon {
  font-size: 24px;
}

.status-title {
  font-weight: 600;
  color: #2c3e50;
}

.status-detail {
  font-size: 14px;
  color: #6c757d;
}

.test-button, .voice-button, .comprehensive-button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  margin: 5px;
}

.test-button {
  background: #007bff;
  color: white;
}

.test-button:hover:not(:disabled) {
  background: #0056b3;
}

.voice-button {
  background: #28a745;
  color: white;
}

.voice-button.recording {
  background: #dc3545;
  animation: pulse 1.5s infinite;
}

.comprehensive-button {
  background: #6f42c1;
  color: white;
  width: 100%;
}

.comprehensive-button:hover:not(:disabled) {
  background: #5a32a3;
}

button:disabled {
  background: #6c757d !important;
  cursor: not-allowed;
  opacity: 0.6;
}

.voice-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.voice-transcript {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}

.voice-transcript h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.interim {
  color: #6c757d;
  font-style: italic;
}

.final {
  color: #2c3e50;
  font-weight: 500;
}

.confidence {
  font-size: 12px;
  color: #6c757d;
  margin-top: 5px;
}

.test-result {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}

.test-result pre {
  background: #e9ecef;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}

.test-log {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 14px;
}

.log-time {
  color: #6c757d;
  font-size: 12px;
  min-width: 80px;
}

.log-message {
  color: #2c3e50;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>
