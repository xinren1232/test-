<template>
  <div class="ai-assistant" :class="{ 'is-expanded': isExpanded }">
    <div class="ai-assistant-header" @click="toggleExpand">
      <span class="title">IQE Smart Assistant</span>
      <el-icon :class="{ 'is-rotate': isExpanded }"><ArrowDown /></el-icon>
    </div>
    
    <div class="ai-assistant-body" v-if="isExpanded">
      <div class="chat-container" ref="chatContainer">
        <div v-for="(message, index) in messages" :key="index" class="message" :class="message.role">
          <div class="avatar">
            <el-avatar v-if="message.role === 'user'" :size="36" :src="defaultUserAvatar" />
            <el-avatar v-else :size="36" :src="defaultAiAvatar" />
          </div>
          <div class="content">
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            <div v-if="message.result" class="message-result">
              <div v-if="message.result.data && message.result.data.length > 0" class="result-data">
                <el-table :data="message.result.data" stripe style="width: 100%" size="small">
                  <el-table-column 
                    v-for="(value, key) in message.result.data[0]" 
                    :key="key" 
                    :prop="key" 
                    :label="formatColumnName(key)" 
                    :width="getColumnWidth(key)"
                  />
                </el-table>
              </div>
              <div v-else class="result-message">{{ message.result.message }}</div>
            </div>
          </div>
        </div>
        <div v-if="isProcessing" class="message ai">
          <div class="avatar">
            <el-avatar :size="36" :src="defaultAiAvatar" />
          </div>
          <div class="content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="input-container">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="1"
          placeholder="Enter your question or command..."
          :disabled="isProcessing"
          @keydown.enter.prevent="handleSend"
          resize="none"
          autosize
        />
        <el-button 
          type="primary" 
          :icon="Promotion" 
          circle 
          @click="handleSend"
          :disabled="isProcessing || !inputText.trim()"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { ArrowDown, Promotion, User, ChatRound } from '@element-plus/icons-vue';
import { AICommandProcessor } from '../services/ai/AICommandProcessor';

// Component state
const isExpanded = ref(true);
const isProcessing = ref(false);
const inputText = ref('');
const messages = ref([
  {
    role: 'ai',
    content: 'Hello! I am the IQE Smart Assistant. How can I help you today?'
  }
]);
const chatContainer = ref(null);

// Default base64 avatars as fallbacks
const defaultUserAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzMzMyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MyLjY3IDAgOCAyIDggOHY3SDRWMTNjMC02IDUuMzMtOCA4LTh6bTAgMkM5LjUgNyA4IDkuMiA4IDExdjRoOHYtNGMwLTEuOC0xLjUtNC00LTR6Ii8+PC9zdmc+';
const defaultAiAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzQwOUVGRiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMmExLjUgMS41IDAgMTAgMCAzIDEuNSAxLjUgMCAwIDAgMC0zem01IDEwYTUgNSAwIDAgMC0xMCAwaDEweiIvPjwvc3ZnPg==';

// Command processor
const commandProcessor = new AICommandProcessor();

// Methods
function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}

function handleSend() {
  if (isProcessing.value || !inputText.value.trim()) return;
  
  // Add user message
  const userMessage = {
    role: 'user',
    content: inputText.value
  };
  messages.value.push(userMessage);
  
  // Clear input
  const query = inputText.value;
  inputText.value = '';
  
  // Process query
  processQuery(query);
}

async function processQuery(query) {
  isProcessing.value = true;
  
  try {
    // Process the command
    const result = await commandProcessor.processCommand(query);
    
    // Add AI response
    const aiResponse = {
      role: 'ai',
      content: result.response || 'I processed your request.',
      result: result.data ? { data: result.data } : null
    };
    
    messages.value.push(aiResponse);
  } catch (error) {
    console.error('Error processing query:', error);
    
    // Add error message
    messages.value.push({
      role: 'ai',
      content: 'Sorry, I encountered an error processing your request.'
    });
  } finally {
    isProcessing.value = false;
    // Scroll to bottom after message is added
    nextTick(() => {
      scrollToBottom();
    });
  }
}

// Format the message with basic markdown
function formatMessage(text) {
  if (!text) return '';
  
  // Replace newlines with <br>
  let formatted = text.replace(/\n/g, '<br>');
  
  // Bold text
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic text
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Code
  formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
  
  return formatted;
}

// Format column names for display
function formatColumnName(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

// Get column width based on key
function getColumnWidth(key) {
  const widthMap = {
    material_code: '120',
    material_name: '180',
    batch_id: '120',
    quantity: '100',
    status: '100',
    test_id: '120',
    result: '100',
    defect_rate: '100'
  };
  
  return widthMap[key] || '120';
}

// Scroll to bottom
function scrollToBottom() {
  if (chatContainer.value) {
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    });
  }
}

// Watch for changes to messages and scroll to bottom
watch(messages, () => {
  nextTick(() => {
    scrollToBottom();
  });
});

// Scroll to bottom on mount
onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  bottom: 0;
  right: 20px;
  width: 360px;
  background-color: white;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 1000;
  border: 1px solid #e0e0e0;
  border-bottom: none;
}

.ai-assistant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #409EFF;
  color: white;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
}

.ai-assistant-header .title {
  font-weight: bold;
  font-size: 16px;
}

.ai-assistant-header .el-icon {
  transition: transform 0.3s ease;
}

.ai-assistant-header .el-icon.is-rotate {
  transform: rotate(180deg);
}

.ai-assistant-body {
  height: 420px;
  display: flex;
  flex-direction: column;
}

.chat-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
  background-color: #f9f9f9;
}

.message {
  display: flex;
  margin-bottom: 15px;
}

.message .avatar {
  flex-shrink: 0;
  margin-right: 10px;
}

.message .content {
  background-color: white;
  padding: 10px;
  border-radius: 6px;
  max-width: 80%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message.user {
  flex-direction: row-reverse;
}

.message.user .avatar {
  margin-right: 0;
  margin-left: 10px;
}

.message.user .content {
  background-color: #ecf5ff;
}

.message-text {
  white-space: pre-wrap;
  line-height: 1.4;
}

.message-text code {
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.message-result {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.input-container {
  display: flex;
  align-items: flex-end;
  padding: 10px 15px;
  border-top: 1px solid #eee;
  background-color: white;
}

.input-container .el-input {
  margin-right: 10px;
}

.typing-indicator {
  display: inline-flex;
  align-items: center;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  margin: 0 2px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
  animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.4; }
}
</style>
