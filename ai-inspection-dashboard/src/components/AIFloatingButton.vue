<template>
  <div class="ai-floating-button">
    <el-button 
      type="primary" 
      circle
      size="large"
      @click="toggleAssistant"
      class="floating-button"
    >
      <el-icon><ChatRound /></el-icon>
    </el-button>
    
    <AIAssistant v-if="showAssistant" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ChatRound } from '@element-plus/icons-vue';
import AIAssistant from './AIAssistant.vue';

const showAssistant = ref(false);

function toggleAssistant() {
  showAssistant.value = !showAssistant.value;
}
</script>

<style scoped>
.ai-floating-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.floating-button {
  width: 56px;
  height: 56px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.floating-button .el-icon {
  font-size: 24px;
}
</style> 