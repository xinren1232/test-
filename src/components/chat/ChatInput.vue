<template>
  <div class="chat-input-container">
    <div class="input-area">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="2"
        :placeholder="placeholder"
        resize="none"
        @keydown.enter.prevent="handleEnterPress"
        ref="inputRef"
      />
      
      <div class="input-actions">
        <el-tooltip content="上传图片" placement="top">
          <el-button
            circle
            @click="triggerImageUpload"
            :disabled="loading"
          >
            <el-icon><el-icon-picture /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip :content="isRecording ? '停止录音' : '语音输入'" placement="top">
          <el-button
            circle
            :type="isRecording ? 'danger' : ''"
            @click="toggleRecording"
            :disabled="loading || !isSpeechSupported"
          >
            <el-icon><el-icon-microphone /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="发送消息" placement="top">
          <el-button
            type="primary"
            @click="sendMessage"
            :disabled="!canSend || loading"
            :loading="loading"
          >
            <el-icon><el-icon-position /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
      
      <input
        type="file"
        ref="imageInputRef"
        style="display: none"
        accept="image/*"
        @change="handleImageSelected"
      />
    </div>
    
    <!-- 录音状态指示器 -->
    <div class="recording-indicator" v-if="isRecording">
      <el-progress :percentage="recordingProgress" :stroke-width="4" status="success" />
      <span class="recording-time">{{ formatRecordingTime(recordingDuration) }}</span>
    </div>
    
    <!-- 图片预览 -->
    <div class="image-preview" v-if="selectedImage">
      <div class="preview-header">
        <span>已选择图片</span>
        <el-button type="danger" size="small" circle @click="removeSelectedImage">
          <el-icon><el-icon-delete /></el-icon>
        </el-button>
      </div>
      <div class="preview-content">
        <el-image :src="selectedImageUrl" fit="contain" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { isSpeechRecognitionSupported, getSpeechRecognition } from '../../utils/compatibility';

const props = defineProps({
  placeholder: {
    type: String,
    default: '输入消息，或点击语音按钮开始语音输入...'
  },
  loading: {
    type: Boolean,
    default: false
  },
  maxRecordingTime: {
    type: Number,
    default: 60 // 默认最大录音时间为60秒
  }
});

const emit = defineEmits(['send', 'image-selected']);

const inputText = ref('');
const inputRef = ref(null);
const imageInputRef = ref(null);
const selectedImage = ref(null);
const selectedImageUrl = ref('');
const isRecording = ref(false);
const recordingDuration = ref(0);
const recordingTimer = ref(null);
const recordingProgress = computed(() => {
  return (recordingDuration.value / props.maxRecordingTime) * 100;
});

// 检查浏览器是否支持语音识别
const isSpeechSupported = ref(isSpeechRecognitionSupported());
let recognition = null;

// 是否可以发送消息
const canSend = computed(() => {
  return inputText.value.trim() !== '' || selectedImage !== null;
});

// 触发图片上传
const triggerImageUpload = () => {
  imageInputRef.value.click();
};

// 处理图片选择
const handleImageSelected = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件');
    return;
  }
  
  // 检查文件大小，限制为5MB
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB');
    return;
  }
  
  selectedImage.value = file;
  selectedImageUrl.value = URL.createObjectURL(file);
  
  // 通知父组件
  emit('image-selected', file);
};

// 移除已选择的图片
const removeSelectedImage = () => {
  if (selectedImageUrl.value) {
    URL.revokeObjectURL(selectedImageUrl.value);
  }
  
  selectedImage.value = null;
  selectedImageUrl.value = '';
  
  // 重置文件输入
  if (imageInputRef.value) {
    imageInputRef.value.value = '';
  }
  
  // 通知父组件
  emit('image-selected', null);
};

// 切换录音状态
const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording();
  } else {
    startRecording();
  }
};

// 开始录音
const startRecording = () => {
  if (!isSpeechSupported.value) {
    ElMessage.warning('您的浏览器不支持语音识别功能');
    return;
  }
  
  try {
    // 初始化语音识别
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      ElMessage.error('无法初始化语音识别');
      return;
    }
    
    recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // 处理识别结果
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      
      if (transcript) {
        inputText.value = transcript;
      }
    };
    
    // 处理错误
    recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error);
      ElMessage.error(`语音识别失败: ${event.error}`);
      stopRecording();
    };
    
    // 开始录音
    recognition.start();
    isRecording.value = true;
    recordingDuration.value = 0;
    
    // 开始计时
    recordingTimer.value = setInterval(() => {
      recordingDuration.value++;
      
      // 如果达到最大录音时间，自动停止
      if (recordingDuration.value >= props.maxRecordingTime) {
        stopRecording();
      }
    }, 1000);
    
    ElMessage.success('开始语音输入');
  } catch (error) {
    console.error('启动语音识别失败:', error);
    ElMessage.error('启动语音识别失败');
    isRecording.value = false;
  }
};

// 停止录音
const stopRecording = () => {
  if (recognition) {
    try {
      recognition.stop();
    } catch (error) {
      console.error('停止语音识别失败:', error);
    }
    
    recognition = null;
  }
  
  // 清除计时器
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value);
    recordingTimer.value = null;
  }
  
  isRecording.value = false;
  ElMessage.success('语音输入已完成');
};

// 格式化录音时间
const formatRecordingTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 处理回车键
const handleEnterPress = (event) => {
  // 如果按下Shift+Enter，则插入换行符
  if (event.shiftKey) {
    return;
  }
  
  // 否则发送消息
  sendMessage();
};

// 发送消息
const sendMessage = () => {
  if (!canSend.value || props.loading) return;
  
  const message = inputText.value.trim();
  
  // 发送消息
  emit('send', {
    text: message,
    image: selectedImage.value
  });
  
  // 清空输入
  inputText.value = '';
  removeSelectedImage();
  
  // 聚焦输入框
  nextTick(() => {
    inputRef.value.focus();
  });
};

// 组件挂载时聚焦输入框
onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus();
  }
});

// 组件销毁前清理资源
onBeforeUnmount(() => {
  // 停止录音
  if (isRecording.value) {
    stopRecording();
  }
  
  // 释放图片URL
  if (selectedImageUrl.value) {
    URL.revokeObjectURL(selectedImageUrl.value);
  }
});
</script>

<style scoped>
.chat-input-container {
  padding: 12px;
  border-top: 1px solid #ebeef5;
  background-color: #fff;
  border-radius: 0 0 8px 8px;
}

.input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.input-area :deep(.el-textarea__inner) {
  min-height: 60px;
  padding: 8px 12px;
  line-height: 1.5;
  resize: none;
  border-radius: 8px;
}

.input-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recording-indicator {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recording-time {
  font-size: 12px;
  color: #f56c6c;
}

.image-preview {
  margin-top: 12px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f7fa;
  font-size: 12px;
  color: #606266;
}

.preview-content {
  padding: 8px;
  display: flex;
  justify-content: center;
  max-height: 200px;
  overflow: hidden;
}

.preview-content .el-image {
  max-height: 180px;
  max-width: 100%;
}
</style> 
 
 