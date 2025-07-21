/**
 * 语音服务管理器
 * 基于Web Speech API实现语音识别和语音合成功能
 */

class VoiceServiceManager {
  constructor() {
    this.isSupported = false
    this.isListening = false
    this.isSpeaking = false
    
    // 语音识别相关
    this.recognition = null
    this.recognitionConfig = {
      continuous: false,
      interimResults: true,
      lang: 'zh-CN',
      maxAlternatives: 1
    }
    
    // 语音合成相关
    this.synthesis = null
    this.synthesisConfig = {
      lang: 'zh-CN',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    }
    
    // 事件回调
    this.onResult = null
    this.onError = null
    this.onStart = null
    this.onEnd = null
    this.onSpeechStart = null
    this.onSpeechEnd = null
    
    this.init()
  }

  /**
   * 初始化语音服务
   */
  init() {
    console.log('🎤 初始化语音服务...')
    
    // 检查浏览器支持
    this.checkSupport()
    
    if (this.isSupported) {
      this.initRecognition()
      this.initSynthesis()
      console.log('✅ 语音服务初始化成功')
    } else {
      console.warn('⚠️ 当前浏览器不支持语音功能')
    }
  }

  /**
   * 检查浏览器支持
   */
  checkSupport() {
    // 检查语音识别支持
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const speechSynthesis = window.speechSynthesis
    
    this.isSupported = !!(SpeechRecognition && speechSynthesis)
    
    if (!SpeechRecognition) {
      console.warn('⚠️ 浏览器不支持语音识别')
    }
    
    if (!speechSynthesis) {
      console.warn('⚠️ 浏览器不支持语音合成')
    }
    
    return this.isSupported
  }

  /**
   * 初始化语音识别
   */
  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) return
    
    this.recognition = new SpeechRecognition()
    
    // 配置语音识别
    Object.assign(this.recognition, this.recognitionConfig)
    
    // 绑定事件
    this.recognition.onstart = () => {
      console.log('🎤 语音识别开始')
      this.isListening = true
      this.onStart && this.onStart()
    }
    
    this.recognition.onresult = (event) => {
      console.log('🎤 语音识别结果事件:', event)
      console.log('🎤 结果数量:', event.results.length)

      let finalTranscript = ''
      let interimTranscript = ''
      let maxConfidence = 0

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript
        const confidence = result[0].confidence || 0

        console.log(`🎤 结果 ${i}: "${transcript}" (final: ${result.isFinal}, confidence: ${confidence})`)

        if (result.isFinal) {
          finalTranscript += transcript
          maxConfidence = Math.max(maxConfidence, confidence)
        } else {
          interimTranscript += transcript
        }
      }

      const resultData = {
        final: finalTranscript.trim(),
        interim: interimTranscript.trim(),
        confidence: maxConfidence
      }

      console.log('🎤 处理后的识别结果:', resultData)
      this.onResult && this.onResult(resultData)
    }
    
    this.recognition.onerror = (event) => {
      console.error('❌ 语音识别错误:', event.error)
      this.isListening = false
      this.onError && this.onError(event.error)
    }
    
    this.recognition.onend = () => {
      console.log('🎤 语音识别结束')
      this.isListening = false
      this.onEnd && this.onEnd()
    }
  }

  /**
   * 初始化语音合成
   */
  initSynthesis() {
    this.synthesis = window.speechSynthesis
    
    if (!this.synthesis) return
    
    // 获取可用的语音
    this.getVoices()
    
    // 监听语音列表变化
    this.synthesis.onvoiceschanged = () => {
      this.getVoices()
    }
  }

  /**
   * 获取可用语音列表
   */
  getVoices() {
    if (!this.synthesis) return []
    
    const voices = this.synthesis.getVoices()
    console.log('🔊 可用语音:', voices.length)
    
    // 优先选择中文语音
    const chineseVoices = voices.filter(voice => 
      voice.lang.includes('zh') || voice.lang.includes('CN')
    )
    
    if (chineseVoices.length > 0) {
      this.preferredVoice = chineseVoices[0]
      console.log('🔊 选择中文语音:', this.preferredVoice.name)
    }
    
    return voices
  }

  /**
   * 开始语音识别
   */
  startListening() {
    if (!this.isSupported || !this.recognition) {
      console.warn('⚠️ 语音识别不可用')
      this.onError && this.onError('语音识别不可用')
      return false
    }

    if (this.isListening) {
      console.warn('⚠️ 语音识别已在进行中')
      return false
    }

    try {
      console.log('🎤 开始语音识别...')
      console.log('🎤 识别配置:', this.recognitionConfig)

      // 重新应用配置，确保设置正确
      Object.assign(this.recognition, this.recognitionConfig)

      this.recognition.start()
      console.log('🎤 语音识别启动命令已发送')
      return true
    } catch (error) {
      console.error('❌ 启动语音识别失败:', error)
      console.error('❌ 错误详情:', error.name, error.message)

      // 提供更具体的错误信息
      let errorMessage = error.message
      if (error.name === 'NotAllowedError') {
        errorMessage = '麦克风权限被拒绝，请允许网站访问麦克风'
      } else if (error.name === 'NotFoundError') {
        errorMessage = '未找到麦克风设备'
      } else if (error.name === 'NotSupportedError') {
        errorMessage = '浏览器不支持语音识别'
      }

      this.onError && this.onError(errorMessage)
      return false
    }
  }

  /**
   * 停止语音识别
   */
  stopListening() {
    if (!this.recognition || !this.isListening) {
      return false
    }
    
    try {
      console.log('🎤 停止语音识别...')
      this.recognition.stop()
      return true
    } catch (error) {
      console.error('❌ 停止语音识别失败:', error)
      return false
    }
  }

  /**
   * 语音合成
   */
  speak(text, options = {}) {
    if (!this.isSupported || !this.synthesis) {
      console.warn('⚠️ 语音合成不可用')
      return false
    }
    
    if (this.isSpeaking) {
      console.log('🔊 停止当前语音播放')
      this.synthesis.cancel()
    }
    
    const utterance = new SpeechSynthesisUtterance(text)
    
    // 配置语音参数
    utterance.lang = options.lang || this.synthesisConfig.lang
    utterance.rate = options.rate || this.synthesisConfig.rate
    utterance.pitch = options.pitch || this.synthesisConfig.pitch
    utterance.volume = options.volume || this.synthesisConfig.volume
    
    // 设置语音
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice
    }
    
    // 绑定事件
    utterance.onstart = () => {
      console.log('🔊 语音播放开始')
      this.isSpeaking = true
      this.onSpeechStart && this.onSpeechStart()
    }
    
    utterance.onend = () => {
      console.log('🔊 语音播放结束')
      this.isSpeaking = false
      this.onSpeechEnd && this.onSpeechEnd()
    }
    
    utterance.onerror = (event) => {
      console.error('❌ 语音播放错误:', event.error)
      this.isSpeaking = false
      this.onError && this.onError(event.error)
    }
    
    try {
      console.log('🔊 开始语音播放:', text.substring(0, 50) + '...')
      this.synthesis.speak(utterance)
      return true
    } catch (error) {
      console.error('❌ 语音播放失败:', error)
      this.onError && this.onError(error.message)
      return false
    }
  }

  /**
   * 停止语音播放
   */
  stopSpeaking() {
    if (!this.synthesis) return false
    
    try {
      console.log('🔊 停止语音播放')
      this.synthesis.cancel()
      this.isSpeaking = false
      return true
    } catch (error) {
      console.error('❌ 停止语音播放失败:', error)
      return false
    }
  }

  /**
   * 设置事件回调
   */
  setCallbacks(callbacks) {
    this.onResult = callbacks.onResult
    this.onError = callbacks.onError
    this.onStart = callbacks.onStart
    this.onEnd = callbacks.onEnd
    this.onSpeechStart = callbacks.onSpeechStart
    this.onSpeechEnd = callbacks.onSpeechEnd
  }

  /**
   * 获取服务状态
   */
  getStatus() {
    return {
      isSupported: this.isSupported,
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      hasVoices: this.preferredVoice ? true : false
    }
  }
}

// 创建单例实例
const voiceServiceManager = new VoiceServiceManager()

export default voiceServiceManager
