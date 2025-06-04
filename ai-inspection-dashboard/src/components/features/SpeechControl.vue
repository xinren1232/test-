<template>
  <div class="speech-control">
    <div class="speech-settings">
      <h3>语音设置</h3>
      
      <el-form :model="speechSettings" label-position="top" size="default">
        <el-form-item label="语音识别">
          <el-switch v-model="speechSettings.recognition" />
          <span class="setting-description">启用语音识别功能</span>
        </el-form-item>
        
        <el-form-item label="语音合成">
          <el-switch v-model="speechSettings.synthesis" />
          <span class="setting-description">启用语音合成功能（AI回复会以语音播放）</span>
        </el-form-item>
        
        <el-form-item label="语音语言">
          <el-select v-model="speechSettings.language" style="width: 100%;">
            <el-option label="中文 (普通话)" value="zh-CN" />
            <el-option label="英语 (美国)" value="en-US" />
            <el-option label="日语" value="ja-JP" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="语音速度">
          <el-slider v-model="speechSettings.rate" :min="0.5" :max="2" :step="0.1" :format-tooltip="value => `${value}x`" />
        </el-form-item>
        
        <el-form-item label="语音音量">
          <el-slider v-model="speechSettings.volume" :min="0" :max="1" :step="0.1" :format-tooltip="value => `${Math.round(value * 100)}%`" />
        </el-form-item>
        
        <el-form-item label="语音音调">
          <el-slider v-model="speechSettings.pitch" :min="0.5" :max="2" :step="0.1" />
        </el-form-item>
      </el-form>
      
      <div class="speech-actions">
        <el-button type="primary" @click="testSpeech" :disabled="!speechSettings.synthesis">
          <el-icon><el-icon-microphone /></el-icon> 测试语音
        </el-button>
        
        <el-button @click="startRecording" :disabled="isRecording || !speechSettings.recognition">
          <el-icon><el-icon-video-play /></el-icon> 开始录音
        </el-button>
        
        <el-button @click="stopRecording" :disabled="!isRecording">
          <el-icon><el-icon-video-pause /></el-icon> 停止录音
        </el-button>
      </div>
    </div>
    
    <div class="speech-status" v-if="isRecording || transcript">
      <div v-if="isRecording" class="recording-indicator">
        <div class="recording-animation"></div>
        <span>正在录音...</span>
      </div>
      
      <div v-if="transcript" class="transcript-container">
        <h4>识别结果:</h4>
        <div class="transcript">{{ transcript }}</div>
        <div class="transcript-actions">
          <el-button size="small" @click="sendTranscript" :disabled="!transcript">
            <el-icon><el-icon-position /></el-icon> 发送
          </el-button>
          <el-button size="small" @click="clearTranscript" :disabled="!transcript">
            <el-icon><el-icon-delete /></el-icon> 清除
          </el-button>
        </div>
      </div>
    </div>
    
    <div class="speech-tips">
      <h4>语音助手使用技巧</h4>
      <ul>
        <li>在聊天窗口点击麦克风图标可以直接开始语音输入</li>
        <li>说"查看图表"或"生成图表"可以快速生成数据可视化</li>
        <li>说"分析物料 [物料编码]"可以快速获取物料质量分析</li>
        <li>说"预测趋势"可以获取AI质量趋势预测</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';

const emit = defineEmits(['speech-start', 'speech-end']);

// 语音设置
const speechSettings = reactive({
  recognition: true,
  synthesis: true,
  language: 'zh-CN',
  rate: 1.0,
  volume: 0.8,
  pitch: 1.0
});

// 语音识别状态
const isRecording = ref(false);
const transcript = ref('');
let recognition = null;

// 初始化语音识别
onMounted(() => {
  initSpeechRecognition();
});

// 清理资源
onBeforeUnmount(() => {
  if (recognition) {
    recognition.stop();
  }
});

// 初始化语音识别
function initSpeechRecognition() {
  // 检查浏览器支持
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    ElMessage.warning('您的浏览器不支持语音识别功能');
    speechSettings.recognition = false;
    return;
  }
  
  // 创建语音识别对象
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  
  // 配置语音识别
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = speechSettings.language;
  
  // 监听结果事件
  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }
    
    if (finalTranscript) {
      transcript.value = finalTranscript;
    } else if (interimTranscript) {
      transcript.value = interimTranscript;
    }
  };
  
  // 监听结束事件
  recognition.onend = () => {
    isRecording.value = false;
    if (transcript.value) {
      emit('speech-end', transcript.value);
    }
  };
  
  // 监听错误事件
  recognition.onerror = (event) => {
    console.error('语音识别错误:', event.error);
    isRecording.value = false;
    ElMessage.error(`语音识别错误: ${event.error}`);
  };
}

// 开始录音
function startRecording() {
  if (!recognition) {
    initSpeechRecognition();
    if (!recognition) return;
  }
  
  try {
    recognition.lang = speechSettings.language;
    recognition.start();
    isRecording.value = true;
    transcript.value = '';
    emit('speech-start');
  } catch (error) {
    console.error('开始录音失败:', error);
    ElMessage.error('开始录音失败');
  }
}

// 停止录音
function stopRecording() {
  if (recognition && isRecording.value) {
    recognition.stop();
  }
}

// 测试语音
function testSpeech() {
  if (!speechSettings.synthesis) {
    ElMessage.warning('语音合成功能未启用');
    return;
  }
  
  // 检查浏览器支持
  if (!('speechSynthesis' in window)) {
    ElMessage.warning('您的浏览器不支持语音合成功能');
    speechSettings.synthesis = false;
    return;
  }
  
  // 创建语音合成对象
  const utterance = new SpeechSynthesisUtterance('IQE智能质检助手已准备就绪，有什么可以帮您？');
  
  // 配置语音合成
  utterance.lang = speechSettings.language;
  utterance.rate = speechSettings.rate;
  utterance.volume = speechSettings.volume;
  utterance.pitch = speechSettings.pitch;
  
  // 播放语音
  window.speechSynthesis.speak(utterance);
}

// 发送识别结果
function sendTranscript() {
  if (transcript.value) {
    emit('speech-end', transcript.value);
    transcript.value = '';
  }
}

// 清除识别结果
function clearTranscript() {
  transcript.value = '';
}
</script>

<style scoped>
.speech-control {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 0 10px;
}

.speech-settings {
  margin-bottom: 20px;
}

.speech-settings h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #303133;
}

.setting-description {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.speech-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.speech-status {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.recording-animation {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #F56C6C;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.8;
  }
}

.transcript-container h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.transcript {
  padding: 10px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  min-height: 60px;
  margin-bottom: 10px;
}

.transcript-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.speech-tips {
  margin-top: auto;
  padding: 15px;
  background-color: #ecf5ff;
  border-radius: 4px;
}

.speech-tips h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 14px;
  color: #409EFF;
}

.speech-tips ul {
  margin: 0;
  padding-left: 20px;
}

.speech-tips li {
  margin-bottom: 5px;
  font-size: 13px;
  color: #606266;
}
</style> 