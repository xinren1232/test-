<template>
  <div class="speech-control">
    <el-collapse>
      <el-collapse-item title="语音设置" name="1">
        <div class="speech-settings">
          <div class="setting-row">
            <span class="setting-label">语音开关</span>
            <el-switch
              v-model="speechEnabled"
              :disabled="!isSpeechSupported"
              @change="handleSpeechToggle"
            />
          </div>
          
          <div class="setting-row">
            <span class="setting-label">语音</span>
            <el-select
              v-model="selectedVoice"
              placeholder="选择语音"
              :disabled="!speechEnabled || !isSpeechSupported"
              style="width: 100%"
            >
              <el-option
                v-for="voice in availableVoices"
                :key="voice.name"
                :label="voice.name"
                :value="voice.name"
              />
            </el-select>
          </div>
          
          <div class="setting-row">
            <span class="setting-label">语速</span>
            <el-slider
              v-model="speechRate"
              :min="0.5"
              :max="2"
              :step="0.1"
              :disabled="!speechEnabled || !isSpeechSupported"
              show-input
            />
          </div>
          
          <div class="setting-row">
            <span class="setting-label">音量</span>
            <el-slider
              v-model="speechVolume"
              :min="0"
              :max="1"
              :step="0.1"
              :disabled="!speechEnabled || !isSpeechSupported"
              show-input
            />
          </div>
          
          <div class="setting-row">
            <span class="setting-label">音调</span>
            <el-slider
              v-model="speechPitch"
              :min="0.5"
              :max="2"
              :step="0.1"
              :disabled="!speechEnabled || !isSpeechSupported"
              show-input
            />
          </div>
          
          <div class="setting-actions">
            <el-button
              type="primary"
              size="small"
              @click="testSpeech"
              :disabled="!speechEnabled || !isSpeechSupported"
            >
              测试语音
            </el-button>
            
            <el-button
              type="danger"
              size="small"
              @click="cancelSpeech"
              :disabled="!isSpeaking || !isSpeechSupported"
            >
              停止朗读
            </el-button>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { isSpeechSynthesisSupported, getSpeechSynthesisVoices } from '../../utils/compatibility';

const props = defineProps({
  defaultEnabled: {
    type: Boolean,
    default: false
  },
  defaultRate: {
    type: Number,
    default: 1.0
  },
  defaultVolume: {
    type: Number,
    default: 1.0
  },
  defaultPitch: {
    type: Number,
    default: 1.0
  }
});

const emit = defineEmits(['update:enabled', 'update:settings']);

// 语音合成状态
const isSpeechSupported = ref(isSpeechSynthesisSupported());
const speechEnabled = ref(props.defaultEnabled && isSpeechSupported.value);
const speechRate = ref(props.defaultRate);
const speechVolume = ref(props.defaultVolume);
const speechPitch = ref(props.defaultPitch);
const availableVoices = ref([]);
const selectedVoice = ref('');
const isSpeaking = ref(false);

// 初始化语音合成
const initSpeechSynthesis = () => {
  if (!isSpeechSupported.value) {
    console.warn('浏览器不支持语音合成');
    return;
  }
  
  // 获取可用语音
  const updateVoices = () => {
    const voices = getSpeechSynthesisVoices();
    availableVoices.value = voices;
    
    // 尝试选择中文语音
    const chineseVoice = voices.find(voice => 
      voice.lang.includes('zh') || voice.name.includes('Chinese')
    );
    
    if (chineseVoice) {
      selectedVoice.value = chineseVoice.name;
    } else if (voices.length > 0) {
      selectedVoice.value = voices[0].name;
    }
  };
  
  // 初次加载语音
  updateVoices();
  
  // 监听语音变化事件
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }
};

// 处理语音开关切换
const handleSpeechToggle = (value) => {
  emit('update:enabled', value);
  
  if (value && !isSpeechSupported.value) {
    ElMessage.warning('您的浏览器不支持语音合成功能');
    speechEnabled.value = false;
  }
};

// 测试语音
const testSpeech = () => {
  speakText('这是一条测试语音，用于测试文本转语音功能。');
};

// 将文本转换为语音
const speakText = (text) => {
  if (!isSpeechSupported.value || !speechEnabled.value || !text) return;
  
  // 取消之前的语音
  cancelSpeech();
  
  // 创建语音合成请求
  const utterance = new SpeechSynthesisUtterance(text);
  
  // 设置语音参数
  utterance.rate = speechRate.value;
  utterance.volume = speechVolume.value;
  utterance.pitch = speechPitch.value;
  
  // 设置选中的语音
  if (selectedVoice.value) {
    const voice = availableVoices.value.find(v => v.name === selectedVoice.value);
    if (voice) {
      utterance.voice = voice;
    }
  }
  
  // 设置事件处理
  utterance.onstart = () => {
    isSpeaking.value = true;
  };
  
  utterance.onend = () => {
    isSpeaking.value = false;
  };
  
  utterance.onerror = (event) => {
    console.error('语音合成错误:', event);
    isSpeaking.value = false;
    ElMessage.error('语音播放失败');
  };
  
  // 开始语音合成
  window.speechSynthesis.speak(utterance);
};

// 取消语音
const cancelSpeech = () => {
  if (isSpeechSupported.value) {
    window.speechSynthesis.cancel();
    isSpeaking.value = false;
  }
};

// 监听设置变化，通知父组件
watch([speechRate, speechVolume, speechPitch, selectedVoice], () => {
  emit('update:settings', {
    rate: speechRate.value,
    volume: speechVolume.value,
    pitch: speechPitch.value,
    voice: selectedVoice.value
  });
});

// 组件挂载时初始化
onMounted(() => {
  initSpeechSynthesis();
});

// 组件销毁前取消语音
onBeforeUnmount(() => {
  cancelSpeech();
});

// 暴露方法给父组件
defineExpose({
  speakText,
  cancelSpeech
});
</script>

<style scoped>
.speech-control {
  margin-bottom: 16px;
}

.speech-settings {
  padding: 8px;
}

.setting-row {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-size: 14px;
  color: #606266;
}

.setting-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}
</style> 
 
 