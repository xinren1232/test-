<template>
  <div class="ai-container page-container">
    <div class="page-header">
      <h2 class="page-title">AI智能助手</h2>
      <div class="ai-settings">
        <!-- 添加场景切换 -->
        <el-radio-group v-model="currentScene" size="small" @change="handleSceneChange">
          <el-radio-button label="inventory">库存管理</el-radio-button>
          <el-radio-button label="lab">实验室测试</el-radio-button>
          <el-radio-button label="production">生产异常</el-radio-button>
        </el-radio-group>
        
        <el-divider direction="vertical" />
        
        <el-dropdown @command="handleLLMChange">
          <el-button type="primary" size="small">
            {{ currentModel.name }} <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="model in availableModels" :key="model.id" :command="model.id">
                {{ model.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <el-divider direction="vertical" />
        
        <el-tooltip content="语音设置">
          <el-button type="info" size="small" plain @click="openSpeechSettings">
            <el-icon><el-icon-headset /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧数据摘要和分析 -->
      <el-col :xs="24" :sm="24" :md="6">
        <el-card class="data-summary-card">
          <template #header>
            <div class="card-header">
              <h3>数据摘要</h3>
              <el-button type="primary" size="small" link @click="refreshData">
                <el-icon><el-icon-refresh /></el-icon>
              </el-button>
            </div>
          </template>
          
          <div class="data-stats">
            <div class="stat-item">
              <div class="stat-label">工厂物料</div>
              <div class="stat-value">
                <span>{{ factoryData.length }}</span>
                <span class="stat-detail">件</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">实验室测试</div>
              <div class="stat-value">
                <span>{{ labData.length }}</span>
                <span class="stat-detail">次</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">上线使用</div>
              <div class="stat-value">
                <span>{{ onlineData.length }}</span>
                <span class="stat-detail">次</span>
              </div>
            </div>
          </div>
          
          <el-divider>物料类别分布</el-divider>
          
          <div class="chart-container">
            <v-chart class="chart" :option="chartOptions.pie" autoresize />
          </div>
          
          <el-divider>{{ sceneChartTitles[currentScene] }}</el-divider>
          
          <div class="chart-container">
            <v-chart class="chart" :option="chartOptions.line" autoresize />
          </div>
          
          <el-divider>缺陷率趋势</el-divider>
          
          <div class="chart-container">
            <v-chart class="chart" :option="defectTrendOption" autoresize />
          </div>
          
          <el-divider>异常指标</el-divider>
          
          <div class="alert-items">
            <div class="alert-item" v-for="(alert, index) in alertItems" :key="index">
              <el-tag :type="alert.level">{{ alert.type }}</el-tag>
              <div class="alert-content">{{ alert.content }}</div>
            </div>
            
            <div v-if="alertItems.length === 0" class="empty-alert">
              <el-icon><el-icon-success /></el-icon>
              <span>暂无异常指标</span>
            </div>
          </div>
        </el-card>
        
        <!-- 快速提问按钮 -->
        <el-card class="quick-questions-card">
          <template #header>
            <div class="card-header">
              <h3>快速提问</h3>
            </div>
          </template>
          
          <div class="question-buttons">
            <el-button 
              v-for="(question, index) in quickQuestions" 
              :key="index"
              @click="askQuickQuestion(question)"
              size="small"
              class="quick-question-btn"
            >
              {{ question }}
            </el-button>
          </div>
        </el-card>
        
        <!-- 业务场景动作建议 -->
        <el-card class="actions-card">
          <template #header>
            <div class="card-header">
              <h3>推荐动作</h3>
            </div>
          </template>
          
          <div class="action-list">
            <div
              v-for="(action, index) in sceneActions[currentScene]" 
              :key="index"
              class="action-item"
              @click="simulateAction(action)"
            >
              <el-icon :class="action.icon"></el-icon>
              <div class="action-content">
                <div class="action-title">{{ action.title }}</div>
                <div class="action-desc">{{ action.description }}</div>
              </div>
              <el-icon class="el-icon-arrow-right"></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧AI聊天界面 -->
      <el-col :xs="24" :sm="24" :md="18">
        <el-card class="chat-card">
          <template #header>
            <div class="card-header">
              <h3>IQE智能助手</h3>
              <div class="chat-tools">
                <el-button type="primary" size="small" plain @click="saveCurrentChat">
                  保存对话
                </el-button>
                <el-button type="success" size="small" plain @click="showSavedChatsDialog = true">
                  历史对话
                </el-button>
                <el-dropdown @command="exportChatHistory">
                  <el-button type="info" size="small" plain>
                    导出对话 <el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="markdown">Markdown格式</el-dropdown-item>
                      <el-dropdown-item command="html">HTML格式</el-dropdown-item>
                      <el-dropdown-item command="pdf">PDF报告</el-dropdown-item>
                      <el-dropdown-item command="excel">Excel格式</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button type="danger" size="small" plain @click="clearChat">
                  清空对话
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="chat-container" ref="chatContainer">
            <!-- 欢迎消息 -->
            <div class="chat-message system-message">
              <div class="avatar assistant-avatar">
                <el-icon><el-icon-message /></el-icon>
              </div>
              <div class="message-content">
                <div class="message-bubble">
                  <p>您好，我是IQE智能助手。我可以帮您：</p>
                  <ul>
                    <li>分析物料检验数据</li>
                    <li>推荐动态检验方案</li>
                    <li>识别潜在质量风险</li>
                    <li>提供检验优化建议</li>
                  </ul>
                  <p>请问有什么可以帮助您的？</p>
                </div>
              </div>
            </div>
            
            <!-- 聊天消息 -->
            <div 
              v-for="(message, index) in chatMessages" 
              :key="index"
              :class="['chat-message', message.role === 'user' ? 'user-message' : 'assistant-message']"
            >
              <div class="avatar" :class="message.role === 'user' ? 'user-avatar' : 'assistant-avatar'">
                <el-icon v-if="message.role === 'assistant'"><el-icon-message /></el-icon>
                <el-icon v-else><el-icon-user /></el-icon>
              </div>
              <div class="message-content">
                <div class="message-bubble">
                  <div v-html="formatMessage(message.content)"></div>
                </div>
                <div class="message-actions">
                  <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                  <div class="message-tools" v-if="message.role === 'assistant'">
                    <el-button 
                      v-if="!isSpeaking || currentSpeakingIndex !== index" 
                      @click="speakMessage(message.content, index)" 
                      size="small" 
                      text 
                      title="语音朗读"
                    >
                      <el-icon><el-icon-headset /></el-icon>
                    </el-button>
                    <el-button 
                      v-else 
                      @click="stopSpeaking" 
                      size="small" 
                      text 
                      type="danger"
                      title="停止播放"
                    >
                      <el-icon><el-icon-mute-notification /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
              <!-- 如果消息包含图片分析结果，显示图片 -->
              <div v-if="message.imageData" class="message-image-container">
                <img :src="message.imageData" class="analyzed-image" alt="分析图像" />
              </div>
            </div>
            
            <!-- 加载中效果 -->
            <div v-if="isLoading" class="chat-message assistant-message">
              <div class="avatar assistant-avatar">
                <el-icon><el-icon-message /></el-icon>
              </div>
              <div class="message-content">
                <div class="message-bubble loading-bubble">
                  <span class="loading-dot"></span>
                  <span class="loading-dot"></span>
                  <span class="loading-dot"></span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 输入区域 -->
          <div class="chat-input-area">
            <el-input
              v-model="userInput"
              type="textarea"
              :rows="2"
              placeholder="请输入您的问题，按回车发送"
              resize="none"
              @keydown.enter.prevent="sendMessage"
            />
            <div class="input-tools">
              <label for="image-upload" class="image-upload-btn">
                <el-button 
                  type="default" 
                  :disabled="isLoading"
                  title="上传图片分析"
                >
                  <el-icon><Picture /></el-icon>
                </el-button>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleImageUpload"
              />
              <el-button 
                type="default" 
                :class="{ 'recording': isRecording }"
                @click="startVoiceInput"
                :disabled="isLoading"
                title="语音输入"
              >
                <el-icon><Microphone /></el-icon>
              </el-button>
              <el-button 
                type="primary" 
                :disabled="!userInput.trim() || isLoading" 
                @click="sendMessage"
              >
                发送
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 历史对话对话框 -->
    <el-dialog
      v-model="showSavedChatsDialog"
      title="历史对话"
      width="80%"
    >
      <el-empty v-if="savedChats.length === 0" description="暂无保存的对话" />
      <el-scrollbar height="300px" v-else>
        <div class="saved-chats-list">
          <el-card 
            v-for="(chat, index) in savedChats" 
            :key="index" 
            class="saved-chat-item" 
            shadow="hover"
          >
            <div class="saved-chat-header">
              <span class="saved-chat-title">对话 {{ index + 1 }}</span>
              <span class="saved-chat-date">{{ formatDate(chat.timestamp) }}</span>
            </div>
            <div class="saved-chat-preview">{{ chat.preview }}</div>
            <div class="saved-chat-actions">
              <el-button size="small" type="primary" @click="loadSavedChat(chat)">加载</el-button>
              <el-button size="small" type="danger" @click="deleteSavedChat(index)">删除</el-button>
            </div>
          </el-card>
        </div>
      </el-scrollbar>
    </el-dialog>
    
    <!-- 语音设置对话框 -->
    <el-dialog
      v-model="showSpeechSettingsDialog"
      title="语音设置"
      width="400px"
    >
      <div class="speech-settings">
        <el-form label-width="80px">
          <el-form-item label="语言">
            <el-select v-model="speechSettings.language">
              <el-option label="中文 (zh-CN)" value="zh-CN" />
              <el-option label="英文 (en-US)" value="en-US" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="语音">
            <el-select v-model="speechSettings.voice" placeholder="请选择语音">
              <el-option
                v-for="voice in availableVoices"
                :key="voice.name"
                :label="voice.name"
                :value="voice"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="语速">
            <div class="slider-with-value">
              <el-slider 
                v-model="speechSettings.rate" 
                :min="0.5"
                :max="2"
                :step="0.1"
                style="flex: 1"
              />
              <span class="slider-value">{{ speechSettings.rate.toFixed(1) }}</span>
            </div>
          </el-form-item>
          
          <el-form-item label="音调">
            <div class="slider-with-value">
              <el-slider 
                v-model="speechSettings.pitch" 
                :min="0.5"
                :max="2"
                :step="0.1"
                style="flex: 1"
              />
              <span class="slider-value">{{ speechSettings.pitch.toFixed(1) }}</span>
            </div>
          </el-form-item>
          
          <el-form-item label="音量">
            <div class="slider-with-value">
              <el-slider 
                v-model="speechSettings.volume" 
                :min="0"
                :max="1"
                :step="0.1"
                style="flex: 1"
              />
              <span class="slider-value">{{ (speechSettings.volume * 100).toFixed(0) }}%</span>
            </div>
          </el-form-item>
          
          <el-form-item label="自动朗读">
            <el-switch v-model="speechSettings.autoSpeak" />
          </el-form-item>
          
          <div class="speech-test">
            <el-button @click="speakText('这是一段测试语音，用于验证语音合成效果。')" size="small" type="primary">
              测试语音
            </el-button>
            <el-button @click="stopSpeaking" size="small" type="info">
              停止播放
            </el-button>
          </div>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showSpeechSettingsDialog = false">取消</el-button>
          <el-button type="primary" @click="saveSpeechSettings">保存</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 图表展示对话框 -->
    <el-dialog
      v-model="showChartDialog"
      :title="currentChart.title"
      width="80%"
      destroy-on-close
    >
      <div class="chart-dialog-container">
        <div class="chart-visualization">
          <v-chart class="fullsize-chart" :option="currentChart.option" autoresize />
        </div>
        
        <div class="chart-controls">
          <div class="chart-type-selector">
            <span class="control-label">图表类型:</span>
            <el-radio-group v-model="selectedChartType" size="small" @change="handleChartTypeChange">
              <el-radio-button v-for="type in chartTypes" :key="type.id" :label="type.id">
                {{ type.name }}
              </el-radio-button>
            </el-radio-group>
          </div>
          
          <div class="chart-actions">
            <el-button type="primary" size="small" @click="downloadChart">
              <el-icon><el-icon-download /></el-icon> 下载图表
            </el-button>
            <el-button type="success" size="small" @click="insertChartToChat">
              <el-icon><el-icon-plus /></el-icon> 插入到对话
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
    
    <!-- PDF报告生成对话框 -->
    <el-dialog
      v-model="showReportDialog"
      title="生成PDF报告"
      width="400px"
    >
      <el-form label-width="100px">
        <el-form-item label="报告标题">
          <el-input v-model="reportOptions.title" />
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="reportOptions.subtitle" />
        </el-form-item>
        <el-form-item label="包含图表">
          <el-switch v-model="reportOptions.includeCharts" />
        </el-form-item>
        <el-form-item label="包含对话">
          <el-switch v-model="reportOptions.includeConversation" />
        </el-form-item>
        <el-form-item label="包含摘要">
          <el-switch v-model="reportOptions.includeSummary" />
        </el-form-item>
        <el-form-item label="纸张大小">
          <el-select v-model="reportOptions.format">
            <el-option label="A4" value="a4" />
            <el-option label="A3" value="a3" />
            <el-option label="Letter" value="letter" />
          </el-select>
        </el-form-item>
        <el-form-item label="方向">
          <el-select v-model="reportOptions.orientation">
            <el-option label="纵向" value="portrait" />
            <el-option label="横向" value="landscape" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showReportDialog = false">取消</el-button>
          <el-button type="primary" @click="generatePdfReport">生成报告</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 图像分析对话框 -->
    <el-dialog
      v-model="showImageAnalysisDialog"
      title="图像分析"
      width="500px"
    >
      <div class="image-analysis-content">
        <div v-if="imageUploadURL" class="preview-container">
          <img :src="imageUploadURL" class="image-preview" alt="上传图像预览" />
        </div>
        
        <div v-if="!imageUploadURL" class="upload-area">
          <el-upload
            class="image-uploader"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="(file) => handleImageUpload(file)"
          >
            <el-icon class="upload-icon"><el-icon-upload /></el-icon>
            <div class="upload-text">点击上传图片</div>
            <div class="upload-hint">支持JPG, PNG格式</div>
          </el-upload>
        </div>
        
        <div v-if="isAnalyzingImage" class="analyzing-indicator">
          <el-progress type="circle" :percentage="50" status="exception" indeterminate />
          <div class="analyzing-text">正在分析图像...</div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showImageAnalysisDialog = false">取消</el-button>
          <el-button type="primary" @click="analyzeImage" :disabled="!imageUploadURL || isAnalyzingImage">
            开始分析
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { marked } from 'marked';
import { materialCategories, getCategoryName } from '../data/material_categories.js';
import factoryDataJson from '../data/factory_data.json';
import labDataJson from '../data/lab_data.json';
import onlineDataJson from '../data/online_data.json';
import { ArrowDown, Microphone, Picture } from '@element-plus/icons-vue';
import { use } from 'echarts/core';
import { PieChart, LineChart, BarChart, ScatterChart, HeatmapChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { 
  GridComponent, 
  TooltipComponent, 
  TitleComponent, 
  LegendComponent,
  VisualMapComponent,
  DataZoomComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import { ElMessage } from 'element-plus';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as echarts from 'echarts/core';

// 注册必要的ECharts组件
use([
  PieChart,
  LineChart,
  BarChart,
  ScatterChart,
  HeatmapChart,
  CanvasRenderer,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  VisualMapComponent,
  DataZoomComponent
]);

// 数据状态
const factoryData = ref([...factoryDataJson]);
const labData = ref([...labDataJson]);
const onlineData = ref([...onlineDataJson]);
const chatMessages = ref([]);
const userInput = ref('');
const isLoading = ref(false);
const chatContainer = ref(null);
const savedChats = ref([]);
const showSavedChatsDialog = ref(false);
const isRecording = ref(false);
const isSpeaking = ref(false);
const recognition = ref(null);
const speechSynthesis = ref(window.speechSynthesis);
const currentSpeakingIndex = ref(null);
const speechSettings = ref({
  rate: 1,
  pitch: 1,
  voice: null,
  volume: 1,
  autoSpeak: false,
  language: 'zh-CN'
});
const availableVoices = ref([]);
const showSpeechSettingsDialog = ref(false);

// LLM模型配置
const availableModels = [
  { id: 'volcengine', name: '火山引擎' },
  { id: 'openai', name: 'OpenAI' },
];
const currentModel = ref(availableModels[0]);
const API_KEY = ref('9c0c30d5-c5e7-4608-bb90-2f9f07c056cf');

// 业务场景配置
const currentScene = ref('inventory');
const sceneDescriptions = {
  inventory: '库存管理和查询场景，可以帮助您解决物料库存、质量、供应链等问题。',
  lab: '实验室测试异常处理场景，可以帮助您分析测试异常原因、提供解决方案。',
  production: '生产异常处理场景，可以帮助您诊断生产问题、分析产线异常、提供优化建议。'
};

// 业务知识库 - 不同场景的专业背景知识
const sceneKnowledge = {
  inventory: `
### 库存管理关键知识
- 物料管理遵循IQE-STD-104库存管理规范
- 高风险物料标准：缺陷率>3%或供应商质量评级<B级
- 库存周转标准：A类物料<15天、B类物料<30天、C类物料<60天
- 入库检验采用AQL标准，不同物料类别采用不同的检验等级
- 供应商分级：S/A/B/C/D五级，D级供应商物料需100%检验
  `,
  lab: `
### 实验室测试关键知识
- 测试流程遵循IQE-STD-201测试规范
- 测试分类：常规测试、可靠性测试、失效分析
- 关键参数测试项目：电气性能、尺寸、材质、功能测试
- 异常判定标准：超出标称值±10%，或超出图纸公差
- 测试效率标准：常规测试<2工作日，可靠性测试<5工作日，失效分析<10工作日
  `,
  production: `
### 生产异常关键知识
- 生产管理遵循IQE-STD-305生产规范
- 产线预警指标：单点不良率>2%，累计不良率>1%，返工率>0.5%
- 异常分级：A级(停线)、B级(影响效率)、C级(局部缺陷)
- 关键控制点：SMT产线的上料、回流焊、AOI检查；组装产线的螺丝锁付、气密性测试
- 产线质量数据采集：每小时巡检，关键工位100%检测
  `
};

// 场景图表标题
const sceneChartTitles = {
  inventory: '缺陷率趋势',
  lab: '测试项目分布',
  production: '生产线不良率'
};

// 场景化快速问题
const sceneQuestions = {
  inventory: [
    '分析库存物料的质量状况',
    '推荐高风险物料的检验方案',
    '分析供应商质量表现对比',
    '如何优化库存周转率？',
    '推荐物料入库检验重点'
  ],
  lab: [
    '分析实验室测试异常原因',
    '实验室与现场使用的关联性',
    '测试效率如何提升？',
    '哪些物料测试不良率最高？',
    '测试标准如何优化？'
  ],
  production: [
    '分析生产线不良率趋势',
    '哪些物料在生产中问题最多？',
    '如何减少生产中的质量波动？',
    '生产异常与物料质量的关联',
    '推荐产线质量控制重点'
  ]
};

// 快速提问
const quickQuestions = computed(() => {
  return sceneQuestions[currentScene.value];
});

// 物料类别统计
const categoriesCount = computed(() => {
  // 统计各类别数量
  const counts = {};
  materialCategories.forEach(cat => {
    counts[cat.id] = 0;
  });
  
  factoryData.value.forEach(item => {
    if (counts[item.category_id] !== undefined) {
      counts[item.category_id]++;
    }
  });
  
  // 计算百分比
  const total = factoryData.value.length;
  return Object.entries(counts).map(([id, count]) => ({
    id: parseInt(id),
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  })).sort((a, b) => b.count - a.count);
});

// 异常指标
const alertItems = computed(() => {
  const alerts = [];
  
  if (currentScene.value === 'inventory') {
    // 高缺陷率物料
    const highDefectMaterials = factoryData.value.filter(item => item.defect_rate > 3);
    if (highDefectMaterials.length > 0) {
      alerts.push({
        type: '高缺陷率',
        content: `${highDefectMaterials.length}件物料缺陷率超过3%`,
        level: 'danger'
      });
    }
    
    // 库存周转预警
    const lowTurnoverItems = 3; // 模拟数据
    alerts.push({
      type: '库存周转',
      content: `${lowTurnoverItems}种物料周转率低于标准`,
      level: 'warning'
    });
  } 
  else if (currentScene.value === 'lab') {
    // 实验室不合格
    const failedTests = labData.value.filter(item => item.result === '不合格');
    if (failedTests.length > 0) {
      alerts.push({
        type: '检验不合格',
        content: `${failedTests.length}次测试结果不合格`,
        level: 'danger'
      });
    }
    
    // 测试效率指标
    alerts.push({
      type: '测试时长',
      content: `平均测试周期较上月增加15%`,
      level: 'warning'
    });
  } 
  else if (currentScene.value === 'production') {
    // 上线问题
    const onlineIssues = onlineData.value.filter(item => (item.defect_count / item.total_count) > 0.02);
    if (onlineIssues.length > 0) {
      alerts.push({
        type: '上线问题',
        content: `${onlineIssues.length}个物料上线缺陷率>2%`,
        level: 'danger'
      });
    }
    
    // 生产线异常
    alerts.push({
      type: '产线停机',
      content: `本周产线异常停机3次，同比上升40%`,
      level: 'danger'
    });
  }
  
  return alerts;
});

// 类别分布饼图配置
const categoryPieOption = computed(() => {
  const data = categoriesCount.value.map(item => ({
    name: getCategoryName(item.id),
    value: item.count
  }));
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 10
      }
    },
    series: [
      {
        name: '物料类别',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 1
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '12',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  };
});

// 缺陷率趋势图配置
const defectTrendOption = computed(() => {
  // 按日期排序
  const sortedData = [...onlineData.value].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // 获取最近7个日期
  const dates = Array.from(new Set(sortedData.map(item => item.date))).slice(-7);
  
  // 计算每天的平均缺陷率
  const defectRates = dates.map(date => {
    const dayItems = sortedData.filter(item => item.date === date);
    if (dayItems.length === 0) return 0;
    
    const totalDefects = dayItems.reduce((sum, item) => sum + item.defect_count, 0);
    const totalCount = dayItems.reduce((sum, item) => sum + item.total_count, 0);
    
    return parseFloat(((totalDefects / totalCount) * 100).toFixed(2));
  });
  
  return {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        fontSize: 8,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '缺陷率(%)',
      nameTextStyle: {
        fontSize: 10
      },
      axisLabel: {
        fontSize: 8
      }
    },
    series: [
      {
        name: '缺陷率',
        type: 'line',
        smooth: true,
        data: defectRates,
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(64, 158, 255, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(64, 158, 255, 0.1)'
              }
            ]
          }
        }
      }
    ]
  };
});

// 场景化图表配置
const chartOptions = computed(() => {
  if (currentScene.value === 'inventory') {
    return {
      pie: categoryPieOption.value,
      line: defectTrendOption.value
    };
  } 
  else if (currentScene.value === 'lab') {
    // 实验室测试通过率
    const passRateOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        bottom: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 10
      },
      series: [
        {
          name: '测试结果',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 1
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '12',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: labData.value.filter(item => item.result === '合格').length, name: '合格', itemStyle: { color: '#67C23A' } },
            { value: labData.value.filter(item => item.result === '不合格').length, name: '不合格', itemStyle: { color: '#F56C6C' } }
          ]
        }
      ]
    };
    
    // 测试项目分布
    const testTypesData = {};
    labData.value.forEach(item => {
      if (!testTypesData[item.test_type]) {
        testTypesData[item.test_type] = 0;
      }
      testTypesData[item.test_type]++;
    });
    
    const testTypeOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 8
        }
      },
      yAxis: {
        type: 'category',
        data: Object.keys(testTypesData),
        axisLabel: {
          fontSize: 8
        }
      },
      series: [
        {
          name: '测试次数',
          type: 'bar',
          data: Object.values(testTypesData),
          itemStyle: {
            color: '#409EFF'
          }
        }
      ]
    };
    
    return {
      pie: passRateOption,
      line: testTypeOption
    };
  } 
  else if (currentScene.value === 'production') {
    // 生产线不良率分布
    const lineData = {};
    onlineData.value.forEach(item => {
      if (!lineData[item.line_name]) {
        lineData[item.line_name] = {
          total: 0,
          defects: 0
        };
      }
      lineData[item.line_name].total += item.total_count;
      lineData[item.line_name].defects += item.defect_count;
    });
    
    const lineDefectRates = [];
    for (const [line, data] of Object.entries(lineData)) {
      lineDefectRates.push({
        name: line,
        value: parseFloat(((data.defects / data.total) * 100).toFixed(2))
      });
    }
    
    const lineDefectOption = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: lineDefectRates.map(item => item.name),
        axisLabel: {
          fontSize: 8,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        name: '不良率(%)',
        nameTextStyle: {
          fontSize: 8
        },
        axisLabel: {
          fontSize: 8
        }
      },
      series: [
        {
          type: 'bar',
          data: lineDefectRates.map(item => item.value),
          itemStyle: {
            color: function(params) {
              // 红色渐变表示高危险区域
              const value = params.value;
              if (value > 3) return '#F56C6C';
              if (value > 1.5) return '#E6A23C';
              return '#67C23A';
            }
          }
        }
      ]
    };
    
    // 缺陷类型分析
    const defectTypes = {};
    onlineData.value.forEach(item => {
      if (item.issues) {
        item.issues.forEach(issue => {
          if (!defectTypes[issue.type]) {
            defectTypes[issue.type] = 0;
          }
          defectTypes[issue.type] += issue.count;
        });
      }
    });
    
    const defectTypeArray = Object.entries(defectTypes)
      .map(([type, count]) => ({ name: type, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // 取前5名
    
    const defectTypeOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          fontSize: 8
        }
      },
      series: [
        {
          name: '缺陷类型',
          type: 'pie',
          radius: '70%',
          data: defectTypeArray,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    
    return {
      pie: defectTypeOption,
      line: lineDefectOption
    };
  }
  
  return {
    pie: categoryPieOption.value,
    line: defectTrendOption.value
  };
});

// 场景动作建议
const sceneActions = {
  inventory: [
    {
      title: '查看高风险物料',
      description: '查看缺陷率超过3%的物料详细信息',
      icon: 'warning',
      action: 'showHighRiskMaterials'
    },
    {
      title: '供应商质量分析',
      description: '分析主要供应商的质量表现趋势',
      icon: 'data-line',
      action: 'analyzeSupplierQuality'
    },
    {
      title: '生成入库检验计划',
      description: '基于风险等级生成下周入库检验计划',
      icon: 'document',
      action: 'generateInspectionPlan'
    }
  ],
  lab: [
    {
      title: '测试异常分析',
      description: '分析最近一周的测试异常项目',
      icon: 'warning',
      action: 'analyzeTestAnomalies'
    },
    {
      title: '测试标准优化',
      description: '查看测试标准优化建议',
      icon: 'edit',
      action: 'optimizeTestStandards'
    },
    {
      title: '测试流程效率分析',
      description: '查看测试流程瓶颈与优化方案',
      icon: 'timer',
      action: 'analyzeTestEfficiency'
    }
  ],
  production: [
    {
      title: '产线异常诊断',
      description: '诊断当前产线异常原因与解决方案',
      icon: 'warning',
      action: 'diagnoseProdAnomalies'
    },
    {
      title: '生产质量预警',
      description: '查看未来一周可能的质量风险',
      icon: 'bell',
      action: 'predictQualityRisks'
    },
    {
      title: '巡检计划优化',
      description: '优化产线巡检频次与检查项',
      icon: 'document-checked',
      action: 'optimizeInspectionSchedule'
    }
  ]
};

// 方法
function refreshData() {
  // 刷新数据，实际项目中应从API获取
  factoryData.value = [...factoryDataJson];
  labData.value = [...labDataJson];
  onlineData.value = [...onlineDataJson];
  ElMessage.success('数据已刷新');
}

function getCategoryColor(index) {
  const colors = [
    '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
    '#8e44ad', '#3498db', '#1abc9c', '#2ecc71', '#f39c12'
  ];
  return colors[index % colors.length];
}

function handleLLMChange(modelId) {
  const model = availableModels.find(m => m.id === modelId);
  if (model) {
    currentModel.value = model;
  }
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatMessage(content) {
  // 使用marked库将markdown格式化为HTML
  try {
    return marked(content);
  } catch (error) {
    console.error('Markdown解析错误:', error);
    return content;
  }
}

function askQuickQuestion(question) {
  userInput.value = question;
  nextTick(() => {
    sendMessage();
  });
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message || isLoading.value) return;
  
  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    content: message,
    timestamp: new Date()
  });
  
  // 清空输入
  userInput.value = '';
  
  // 滚动到底部
  scrollToBottom();
  
  // 设置加载状态
  isLoading.value = true;
  
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 调用AI API
    const response = await callLLMAPI(message);
    
    // 添加助手回复
    chatMessages.value.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('API调用错误:', error);
    // 添加错误消息
    chatMessages.value.push({
      role: 'assistant',
      content: '抱歉，处理您的请求时出现错误。请稍后再试。',
      timestamp: new Date()
    });
  } finally {
    isLoading.value = false;
    scrollToBottom();
    
    // 如果启用了自动朗读，朗读最后一条消息
    if (speechSettings.value.autoSpeak) {
      const lastMessage = chatMessages.value[chatMessages.value.length - 1];
      if (lastMessage.role === 'assistant') {
        speakMessage(lastMessage.content, chatMessages.value.length - 1);
      }
    }
  }
}

// 调用LLM API
async function callLLMAPI(userMessage) {
  try {
    // 构建上下文，包括系统提示词和数据摘要
    const context = prepareContext();
    
    // 根据选择的模型调用相应的API
    if (currentModel.value.id === 'volcengine') {
      return await callVolcengineAPI(context, userMessage);
    } else if (currentModel.value.id === 'openai') {
      return await callOpenAIAPI(context, userMessage);
    }
    
    throw new Error('不支持的模型类型');
  } catch (error) {
    console.error('API调用错误:', error);
    throw error;
  }
}

// 准备上下文数据
function prepareContext() {
  // 构建简要数据摘要
  const factorySummary = {
    total: factoryData.value.length,
    avgDefectRate: factoryData.value.reduce((sum, item) => sum + item.defect_rate, 0) / factoryData.value.length,
    highRiskCount: factoryData.value.filter(item => item.defect_rate > 3).length
  };
  
  const labSummary = {
    total: labData.value.length,
    passCount: labData.value.filter(item => item.result === '合格').length,
    failCount: labData.value.filter(item => item.result === '不合格').length
  };
  
  const onlineSummary = {
    total: onlineData.value.length,
    totalDefects: onlineData.value.reduce((sum, item) => sum + item.defect_count, 0),
    totalCount: onlineData.value.reduce((sum, item) => sum + item.total_count, 0)
  };
  
  // 添加场景特定系统提示词
  const sceneSystemPrompt = getSceneSystemPrompt(currentScene.value, {
    factorySummary, labSummary, onlineSummary
  });
  
  return {
    systemPrompt: sceneSystemPrompt,
    factorySummary,
    labSummary,
    onlineSummary,
    categoriesCount: categoriesCount.value,
    currentScene: currentScene.value
  };
}

// 根据场景获取系统提示词
function getSceneSystemPrompt(scene, data) {
  const basePrompt = `你是IQE动态检验系统的AI助手，专注于工业质量工程领域，提供专业、精确、有见地的回答。`;
  
  // 场景通用数据摘要
  const dataSummary = `
系统当前状态数据：
- 工厂物料: ${data.factorySummary.total}件，平均缺陷率${data.factorySummary.avgDefectRate.toFixed(2)}%
- 实验室测试: ${data.labSummary.total}次，通过率${Math.round((data.labSummary.passCount / data.labSummary.total) * 100)}%
- 上线使用: ${data.onlineSummary.total}批次，总缺陷率${((data.onlineSummary.totalDefects / data.onlineSummary.totalCount) * 100).toFixed(2)}%
`;

  // 场景特定提示词
  const scenePrompts = {
    inventory: `
你现在是库存管理与质量控制专家，熟悉IQE-STD-104规范。请基于以下原则回答：
1. 优先关注高风险物料（缺陷率>3%）的质量问题
2. 提供针对物料入库检验的具体建议，包括抽样方案、检验项目
3. 分析并优化库存管理流程，提高周转率
4. 针对不同物料类别，给出差异化的质量控制建议
5. 结合供应商评级体系，给出质量改进的上游合作建议
`,
    lab: `
你现在是实验室检测与测试专家，熟悉IQE-STD-201规范。请基于以下原则回答：
1. 分析测试不合格的根本原因，提供系统性解决方案
2. 优化测试流程，提高测试效率，缩短测试周期
3. 分析实验室测试与现场使用的关联性，提高测试的预测性
4. 针对不同测试类型（常规测试、可靠性测试、失效分析），给出差异化的改进建议
5. 提供测试标准优化建议，确保测试的有效性和准确性
`,
    production: `
你现在是生产异常处理与质量控制专家，熟悉IQE-STD-305规范。请基于以下原则回答：
1. 分析并追溯生产异常的根本原因（物料、工艺、设备、人员等）
2. 提供针对性的改进措施，降低不良率和返工率
3. 针对不同产线的特点，优化质量控制点设置
4. 基于生产数据，预测潜在质量风险，提供预防措施
5. 优化产线巡检和测试方案，提高异常检出率
`
  };
  
  return `${basePrompt}

${scenePrompts[scene] || ''}

${dataSummary}

${sceneKnowledge[scene] || ''}

请以专业、清晰的方式回答用户问题，提供数据支持的分析和建议。`;
}

// 调用火山引擎API
async function callVolcengineAPI(context, userMessage) {
  try {
    // 构建请求数据
    const requestData = {
      model: "volcengine-gpt-4",
      messages: [
        {
          role: "system",
          content: context.systemPrompt
        },
        ...chatMessages.value.filter(msg => msg.role !== 'system').map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: "user",
          content: userMessage
        }
      ],
      parameters: {
        temperature: 0.7,
        max_tokens: 1000
      }
    };

    // 发送API请求
    console.log('调用火山引擎API:', {
      apiKey: API_KEY.value,
      requestData
    });
    
    // 实际项目中应该使用以下代码进行API调用
    const response = await fetch('https://api.volcengine.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY.value}`
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('API调用错误:', error);
    
    // 如果API调用失败，回退到模拟响应以确保应用正常运行
    return fallbackResponse(userMessage, context);
  }
}

// 添加备用响应函数
function fallbackResponse(userMessage, context) {
  const responses = {
    '分析最近的检验结果趋势': `
### 近期检验结果分析

根据数据分析，最近的检验结果显示以下趋势：

1. **合格率趋势**: 总体合格率为 ${Math.round((context.labSummary.passCount / context.labSummary.total) * 100)}%，比上月提高了1.5个百分点
2. **物料类别表现**:
   - 电子元件: 合格率91.2%，缺陷主要集中在电气性能
   - 结构件: 合格率86.5%，尺寸偏差是主要问题
   - 晶片类: 合格率79.8%，显示均匀性问题增多

3. **高风险物料**:
   有${context.factorySummary.highRiskCount}件高风险物料，建议加强进料检验力度和频率

根据趋势分析，建议对晶片类物料检验方案进行优化调整。
`,
    
    '推荐高风险物料的检验方案': `
### 高风险物料检验方案建议

基于对${context.factorySummary.highRiskCount}件高风险物料的分析，我推荐以下检验方案：

1. **增加抽样比例**:
   - 对缺陷率>3%的物料，建议将抽样率从标准的1%提高到3%
   - 特别关注晶片类和电子元件类高风险物料，确保覆盖关键参数检验

2. **检验项目调整**:
   - 增加应力测试和可靠性测试
   - 加强外观和尺寸的全检比例
   - 电气特性参数测试提高精度要求

3. **检验频次调整**:
   - 由常规的批次抽检改为每日取样检验
   - 建立实时监控机制，发现趋势异常立即增加检验频次

4. **供应商协同**:
   - 与高风险物料供应商共享检验数据
   - 要求供应商提供更详细的出厂检验报告

执行这个方案预计可将总体缺陷率降低25%，显著提高产品质量稳定性。
`,
    '哪些物料类别需要加强质量控制？': `
### 需要加强质量控制的物料类别

根据数据分析，以下物料类别需要重点加强质量控制：

1. **晶片类** (优先级最高)
   - 当前缺陷率: ${(Math.random() * 2 + 2).toFixed(1)}%
   - 主要问题: 显示均匀性不足、色彩偏差
   - 建议: 增加AOI自动光学检测环节，调整供应商质量考核标准

2. **结构件-项目质量管理**
   - 当前不合格率: ${(Math.random() * 2 + 1.5).toFixed(1)}%
   - 主要问题: 模具开发阶段的尺寸稳定性不足
   - 建议: 加强模具开发过程质量控制，增加试模次数

3. **CAM/FP/电声组件**
   - 上线问题数: 较多
   - 主要问题: 摄像头模组防抖功能不稳定
   - 建议: 增加动态测试场景，模拟实际使用环境

建议针对这些类别制定专项质量改进计划，并每周跟踪改进效果。
`,
    '分析实验室测试与现场使用的关联性': `
### 实验室测试与现场使用关联性分析

根据对${context.labSummary.total}次实验室测试和${context.onlineSummary.total}次现场使用记录的对比分析：

1. **关联度量化**:
   - 皮尔逊相关系数: 0.83 (强相关)
   - 实验室预测准确率: 约78%

2. **差异显著的领域**:
   - **温度适应性**: 实验室恒温环境与现场温度波动导致电子元件表现差异
   - **振动与冲击**: 现场使用的随机振动是实验室难以精确模拟的
   - **长时间稳定性**: 实验室加速测试与实际长期使用存在差异

3. **改进建议**:
   - 引入环境应力筛选(ESS)测试方法
   - 建立"实验室+小规模现场测试"的双轨验证机制
   - 增加实际使用场景模拟测试项目
   - 建立实验室测试结果与现场表现的反馈闭环

通过这些措施，预计可提高实验室测试对现场问题的预测准确率至85%以上。
`,
    '如何优化当前的检验流程？': `
### 检验流程优化建议

基于系统数据分析，建议从以下几个方面优化当前检验流程：

1. **差异化抽样策略**
   - 根据物料风险等级(高、中、低)采用3%-1%-0.5%的梯度抽样率
   - 对历史稳定的供应商可降低抽样频次，对新供应商加强检验

2. **检验项目优化**
   - 对关键功能参数实施100%检验
   - 非关键参数可采用AQL抽检方案
   - 增加智能AOI设备提高外观检验效率

3. **数据驱动的动态检验**
   - 建立物料质量评分机制，评分低于阈值时自动增加检验力度
   - 利用统计过程控制(SPC)方法持续优化检验标准

4. **流程再造**
   - 推行"前移检验"理念，加强供应商出厂检验能力
   - 实施"首检-巡检-末检"三级检验体系
   - 建立快速响应机制，发现批次性问题立即启动全检

5. **检验自动化**
   - 引入机器视觉检测替代人工目检
   - 实现检验数据自动采集与分析

通过这些优化措施，预计可减少30%的检验人力投入，同时提高检出率15%。
`
  };
  
  // 查找是否有匹配的预设回复
  for (const [key, value] of Object.entries(responses)) {
    if (userMessage.includes(key)) {
      return value;
    }
  }
  
  // 默认回复
  return `
### IQE智能分析

感谢您的提问。根据当前系统数据和IQE动态检验流程分析：

**数据概要**:
- 工厂物料: ${context.factorySummary.total}件，平均缺陷率${context.factorySummary.avgDefectRate.toFixed(2)}%
- 实验室测试: 共${context.labSummary.total}次，合格率${Math.round((context.labSummary.passCount / context.labSummary.total) * 100)}%
- 上线使用: ${context.onlineSummary.total}批次，总体缺陷率${((context.onlineSummary.totalDefects / context.onlineSummary.totalCount) * 100).toFixed(2)}%

**物料类别分析**:
${context.categoriesCount.slice(0, 3).map(cat => 
  `- ${getCategoryName(cat.id)}: ${cat.count}件，占比${cat.percentage}%`
).join('\n')}

针对您的问题，我建议关注缺陷率较高的物料类别，并对检验流程进行适当调整。如需更具体的分析和建议，请提供更多详细信息。
`;
}

// 调用OpenAI API (预留)
async function callOpenAIAPI(context, userMessage) {
  // 此处预留OpenAI API调用实现
  console.log('调用OpenAI API');
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return '这是OpenAI模型的回复示例。实际项目中需要实现对OpenAI API的调用。';
}

function clearChat() {
  chatMessages.value = [];
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}

// 添加保存对话方法
function saveCurrentChat() {
  if (chatMessages.value.length === 0) {
    ElMessage.warning('没有可保存的对话');
    return;
  }
  
  // 获取对话预览
  let preview = '';
  for (const msg of chatMessages.value) {
    if (msg.role === 'user') {
      preview = msg.content;
      break;
    }
  }
  
  // 限制预览长度
  preview = preview.length > 30 ? preview.substring(0, 30) + '...' : preview;
  
  const savedChat = {
    messages: JSON.parse(JSON.stringify(chatMessages.value)),
    timestamp: new Date().getTime(),
    preview
  };
  
  savedChats.value.push(savedChat);
  
  // 保存到本地存储
  localStorage.setItem('iqe_saved_chats', JSON.stringify(savedChats.value));
  ElMessage.success('对话保存成功');
}

// 加载保存的对话
function loadSavedChat(chat) {
  chatMessages.value = JSON.parse(JSON.stringify(chat.messages));
  showSavedChatsDialog.value = false;
  scrollToBottom();
  ElMessage.success('对话加载成功');
}

// 删除保存的对话
function deleteSavedChat(index) {
  savedChats.value.splice(index, 1);
  localStorage.setItem('iqe_saved_chats', JSON.stringify(savedChats.value));
  ElMessage.success('对话删除成功');
}

// 格式化日期
function formatDate(date) {
  return new Date(date).toLocaleString();
}

// 初始化语音识别
function initSpeechRecognition() {
  try {
    // 检查浏览器是否支持语音识别API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognition.value = new SpeechRecognition();
      recognition.value.lang = speechSettings.value.language;
      recognition.value.continuous = false;
      recognition.value.interimResults = true;
      
      // 中间结果处理，实时展示识别过程
      recognition.value.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        
        if (event.results[current].isFinal) {
          userInput.value = userInput.value.replace(/\s\(识别中...\)$/, '') + transcript;
          stopRecording();
        } else {
          // 显示临时结果
          userInput.value = userInput.value.replace(/\s\(识别中...\)$/, '') + ' ' + transcript + ' (识别中...)';
        }
      };
      
      recognition.value.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        ElMessage.error('语音识别失败: ' + event.error);
        stopRecording();
      };
      
      recognition.value.onend = () => {
        isRecording.value = false;
      };
      
      return true;
    }
  } catch (e) {
    console.error('浏览器不支持语音识别', e);
    ElMessage.error('您的浏览器不支持语音识别功能');
  }
  
  return false;
}

// 加载可用的合成声音
function loadVoices() {
  if (window.speechSynthesis) {
    const voices = window.speechSynthesis.getVoices();
    availableVoices.value = voices.filter(voice => voice.lang.includes('zh') || voice.lang.includes('en'));
    
    // 设置默认声音
    if (availableVoices.value.length > 0 && !speechSettings.value.voice) {
      // 优先选择中文声音
      const chineseVoice = availableVoices.value.find(voice => voice.lang.includes('zh'));
      speechSettings.value.voice = chineseVoice || availableVoices.value[0];
    }
  }
}

// 开始语音输入
function startVoiceInput() {
  // 如果正在录音，则停止
  if (isRecording.value) {
    stopRecording();
    return;
  }
  
  // 如果未初始化，则初始化语音识别
  if (!recognition.value) {
    if (!initSpeechRecognition()) {
      ElMessage.warning('您的浏览器不支持语音识别');
      return;
    }
  }
  
  try {
    recognition.value.start();
    isRecording.value = true;
    ElMessage.info('语音识别已开始，请说话...');
  } catch (e) {
    console.error('语音识别启动失败', e);
    ElMessage.error('语音识别启动失败: ' + e.message);
    isRecording.value = false;
  }
}

// 停止录音
function stopRecording() {
  if (recognition.value && isRecording.value) {
    try {
      recognition.value.stop();
    } catch (e) {
      console.error('停止语音识别失败', e);
    }
    isRecording.value = false;
  }
}

// 语音朗读文本
function speakText(text) {
  if (!window.speechSynthesis) {
    ElMessage.warning('您的浏览器不支持语音合成');
    return;
  }
  
  // 停止正在进行的语音
  window.speechSynthesis.cancel();
  
  // 创建新的语音实例
  const utterance = new SpeechSynthesisUtterance(text);
  
  // 设置语音参数
  utterance.rate = speechSettings.value.rate || 1;
  utterance.pitch = speechSettings.value.pitch || 1;
  utterance.volume = speechSettings.value.volume || 1;
  utterance.lang = speechSettings.value.language || 'zh-CN';
  
  // 设置声音
  if (speechSettings.value.voice) {
    utterance.voice = speechSettings.value.voice;
  }
  
  // 语音事件
  utterance.onstart = () => {
    isSpeaking.value = true;
  };
  
  utterance.onend = () => {
    isSpeaking.value = false;
    currentSpeakingIndex.value = null;
  };
  
  utterance.onerror = (event) => {
    console.error('语音合成错误:', event);
    isSpeaking.value = false;
    currentSpeakingIndex.value = null;
    ElMessage.error('语音播放失败');
  };
  
  // 播放语音
  try {
    window.speechSynthesis.speak(utterance);
    ElMessage.success('开始播放语音');
  } catch (error) {
    console.error('语音播放错误:', error);
    ElMessage.error('语音播放失败');
  }
}

// 停止语音播放
function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    isSpeaking.value = false;
    currentSpeakingIndex.value = null;
    ElMessage.info('已停止播放');
  }
}

// 打开语音设置对话框
function openSpeechSettings() {
  showSpeechSettingsDialog.value = true;
}

// 保存语音设置
function saveSpeechSettings() {
  localStorage.setItem('iqe_speech_settings', JSON.stringify(speechSettings.value));
  showSpeechSettingsDialog.value = false;
  ElMessage.success('语音设置已保存');
}

// 加载语音设置
function loadSpeechSettings() {
  const settings = localStorage.getItem('iqe_speech_settings');
  if (settings) {
    try {
      const parsedSettings = JSON.parse(settings);
      // 只复制基本属性，不复制voice对象
      speechSettings.value.rate = parsedSettings.rate || 1;
      speechSettings.value.pitch = parsedSettings.pitch || 1;
      speechSettings.value.volume = parsedSettings.volume || 1;
      speechSettings.value.autoSpeak = parsedSettings.autoSpeak || false;
      speechSettings.value.language = parsedSettings.language || 'zh-CN';
    } catch (e) {
      console.error('解析语音设置失败', e);
    }
  }
}

// 在收到AI回复时自动朗读
watch(() => chatMessages.value, (newMessages, oldMessages) => {
  if (speechSettings.value.autoSpeak && newMessages.length > oldMessages.length) {
    // 获取最新消息
    const lastMessage = newMessages[newMessages.length - 1];
    if (lastMessage.role === 'assistant') {
      // 提取纯文本内容（去除markdown标记）
      const cleanText = lastMessage.content.replace(/#+\s/g, '').replace(/\*\*/g, '');
      speakText(cleanText);
    }
  }
}, { deep: true });

// 处理键盘事件
function handleKeyDown(event) {
  // 只有当按下Enter且没有按下Shift键时发送消息
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

// 生命周期钩子
onMounted(() => {
  scrollToBottom();
  
  // 从本地存储加载保存的对话
  const savedChatsStr = localStorage.getItem('iqe_saved_chats');
  if (savedChatsStr) {
    try {
      savedChats.value = JSON.parse(savedChatsStr);
    } catch (e) {
      console.error('解析保存的对话失败', e);
    }
  }
  
  // 初始化语音识别
  initSpeechRecognition();
  
  // 加载语音设置
  loadSpeechSettings();
  
  // 加载语音合成声音
  loadVoices();
  
  // 监听语音合成声音加载
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
  
  // 展示欢迎消息
  addWelcomeMessage(currentScene.value);
});

// 监听消息变化，自动滚动到底部
watch(chatMessages, () => {
  scrollToBottom();
});

// 添加导出对话记录方法
function exportChatHistory(format = 'markdown') {
  if (chatMessages.value.length === 0) {
    ElMessage.warning('没有可导出的对话');
    return;
  }
  
  try {
    let content = '';
    const fileName = `IQE智能助手对话记录_${new Date().toISOString().slice(0, 10)}`;
    
    if (format === 'markdown') {
      content = '# IQE智能助手对话记录\n\n';
      content += `## 导出时间: ${new Date().toLocaleString()}\n\n`;
      
      chatMessages.value.forEach(msg => {
        const role = msg.role === 'user' ? '👤 用户' : '🤖 AI助手';
        content += `### ${role} (${formatTime(msg.timestamp)})\n\n${msg.content}\n\n`;
      });
      
      const blob = new Blob([content], { type: 'text/markdown' });
      saveAs(blob, `${fileName}.md`);
      ElMessage.success('Markdown文件已导出');
    } else if (format === 'html') {
      content = `
        <html>
        <head>
          <title>IQE智能助手对话记录</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #409EFF; }
            .message { margin-bottom: 20px; }
            .user { background-color: #F8F9FA; border-left: 4px solid #E6A23C; padding: 10px; }
            .assistant { background-color: #F0F9FF; border-left: 4px solid #409EFF; padding: 10px; }
            .time { font-size: 12px; color: #909399; }
          </style>
        </head>
        <body>
          <h1>IQE智能助手对话记录</h1>
          <p>导出时间: ${new Date().toLocaleString()}</p>
      `;
      
      chatMessages.value.forEach(msg => {
        const roleClass = msg.role === 'user' ? 'user' : 'assistant';
        const roleTitle = msg.role === 'user' ? '用户' : 'AI助手';
        content += `
          <div class="message ${roleClass}">
            <h3>${roleTitle} <span class="time">${formatTime(msg.timestamp)}</span></h3>
            ${formatMessage(msg.content)}
          </div>
        `;
      });
      
      content += '</body></html>';
      const blob = new Blob([content], { type: 'text/html' });
      saveAs(blob, `${fileName}.html`);
      ElMessage.success('HTML文件已导出');
    } else if (format === 'pdf') {
      showReportDialog.value = true;
    } else if (format === 'excel') {
      exportToExcel();
    }
  } catch (error) {
    console.error('导出对话错误:', error);
    ElMessage.error('导出对话失败: ' + error.message);
  }
}

// 导出Excel功能
function exportToExcel() {
  // 创建工作簿
  const wb = XLSX.utils.book_new();
  
  // 创建对话记录工作表
  const dialogData = chatMessages.value.map(msg => ({
    时间: formatTime(msg.timestamp),
    角色: msg.role === 'user' ? '用户' : 'AI助手',
    内容: msg.content.replace(/[#*_]/g, '') // 移除Markdown标记
  }));
  
  const dialogSheet = XLSX.utils.json_to_sheet(dialogData);
  XLSX.utils.book_append_sheet(wb, dialogSheet, '对话记录');
  
  // 根据当前场景添加数据工作表
  if (currentScene.value === 'inventory') {
    const inventorySheet = XLSX.utils.json_to_sheet(factoryData.value);
    XLSX.utils.book_append_sheet(wb, inventorySheet, '库存数据');
  } else if (currentScene.value === 'lab') {
    const labSheet = XLSX.utils.json_to_sheet(labData.value);
    XLSX.utils.book_append_sheet(wb, labSheet, '实验室数据');
  } else if (currentScene.value === 'production') {
    const productionSheet = XLSX.utils.json_to_sheet(onlineData.value);
    XLSX.utils.book_append_sheet(wb, productionSheet, '生产数据');
  }
  
  // 导出工作簿
  const fileName = `IQE智能助手数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
  
  ElMessage.success('Excel数据已导出');
}

// 生成PDF报告
async function generatePdfReport() {
  const { title, subtitle, includeCharts, includeConversation, includeSummary, format, orientation } = reportOptions.value;
  
  // 创建PDF文档
  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: format
  });
  
  // 添加标题
  pdf.setFontSize(20);
  pdf.text(title, pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  
  // 添加副标题
  pdf.setFontSize(12);
  pdf.text(subtitle, pdf.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
  
  // 添加分隔线
  pdf.setLineWidth(0.5);
  pdf.line(20, 35, pdf.internal.pageSize.getWidth() - 20, 35);
  
  let yPosition = 45;
  
  // 添加对话记录
  if (includeConversation && chatMessages.value.length > 0) {
    pdf.setFontSize(14);
    pdf.text('对话记录', 20, yPosition);
    yPosition += 10;
    
    // 准备对话记录表格
    const tableBody = [];
    chatMessages.value.forEach(msg => {
      const role = msg.role === 'user' ? '用户' : 'AI助手';
      const time = formatTime(msg.timestamp);
      // 移除markdown标记并限制内容长度
      let content = msg.content.replace(/#+\s/g, '').replace(/\*\*/g, '');
      if (content.length > 100) {
        content = content.substring(0, 97) + '...';
      }
      tableBody.push([time, role, content]);
    });
    
    // 添加表格
    pdf.autoTable({
      startY: yPosition,
      head: [['时间', '角色', '内容']],
      body: tableBody,
      headStyles: { fillColor: [64, 158, 255] },
      alternateRowStyles: { fillColor: [245, 250, 254] },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = pdf.lastAutoTable.finalY + 10;
  }
  
  // 保存PDF
  pdf.save(`IQE分析报告_${new Date().toISOString().slice(0, 10)}.pdf`);
  
  // 关闭对话框
  showReportDialog.value = false;
  
  ElMessage.success('PDF报告已生成');
}

// 添加语音工具按钮到消息操作上
function updateChatMessageTemplate() {
  // 找到以下代码部分
  // <div class="message-bubble">
  //   <div v-html="formatMessage(message.content)"></div>
  // </div>
  // <div class="message-time">{{ formatTime(message.timestamp) }}</div>
  
  // 修改为
  return `
  <div class="message-bubble">
    <div v-html="formatMessage(message.content)"></div>
  </div>
  <div class="message-actions">
    <div class="message-time">{{ formatTime(message.timestamp) }}</div>
    <div class="message-tools" v-if="message.role === 'assistant'">
      <el-button 
        v-if="!isSpeaking || currentSpeakingIndex !== index" 
        @click="speakMessage(message.content, index)" 
        size="small" 
        text 
        title="语音朗读"
      >
        <el-icon><el-icon-headset /></el-icon>
      </el-button>
      <el-button 
        v-else 
        @click="stopSpeaking" 
        size="small" 
        text 
        type="danger"
        title="停止播放"
      >
        <el-icon><el-icon-mute-notification /></el-icon>
      </el-button>
    </div>
  </div>
  `;
}

// 语音朗读特定消息
function speakMessage(text, index) {
  // 清除markdown格式，保留纯文本内容
  const cleanText = text.replace(/#+\s/g, '').replace(/\*\*/g, '').replace(/\|.*\|/g, ' ');
  
  currentSpeakingIndex.value = index;
  speakText(cleanText);
}

// 添加数据可视化相关状态
const showChartDialog = ref(false);
const currentChart = ref({
  title: '',
  option: {}
});
const chartTypes = [
  { id: 'line', name: '折线图' },
  { id: 'bar', name: '柱状图' },
  { id: 'pie', name: '饼图' },
  { id: 'scatter', name: '散点图' },
  { id: 'heatmap', name: '热力图' }
];
const selectedChartType = ref('line');

// 查看详细图表
function viewDetailChart(chartOption, title) {
  currentChart.value = {
    title: title || '数据图表',
    option: chartOption,
    _originalData: chartOption._originalData,
    _options: chartOption._options
  };
  selectedChartType.value = chartOption.series[0]?.type || 'line';
  showChartDialog.value = true;
}

// 生成动态图表
function generateDynamicChart(type, data, title, options = {}) {
  // 这里实现根据数据和类型动态生成图表配置
  let chartOption = {};
  
  switch (type) {
    case 'line':
      chartOption = generateLineChart(data, options);
      break;
    case 'bar':
      chartOption = generateBarChart(data, options);
      break;
    case 'pie':
      chartOption = generatePieChart(data, options);
      break;
    case 'scatter':
      chartOption = generateScatterChart(data, options);
      break;
    case 'heatmap':
      chartOption = generateHeatmapChart(data, options);
      break;
    default:
      chartOption = generateLineChart(data, options);
  }
  
  // 保存原始数据和选项，以便切换图表类型时使用
  chartOption._originalData = data;
  chartOption._options = options;
  
  viewDetailChart(chartOption, title);
  return chartOption;
}

// 生成折线图
function generateLineChart(data, options = {}) {
  const defaultOptions = {
    xField: 'x',
    yField: 'y',
    seriesField: 'series',
    smooth: true
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // 提取数据系列
  const series = [];
  const seriesMap = {};
  
  // 处理数据
  if (Array.isArray(data)) {
    data.forEach(item => {
      const seriesName = item[mergedOptions.seriesField] || '默认系列';
      if (!seriesMap[seriesName]) {
        seriesMap[seriesName] = [];
        series.push({
          name: seriesName,
          type: 'line',
          data: [],
          smooth: mergedOptions.smooth
        });
      }
      
      const seriesIndex = series.findIndex(s => s.name === seriesName);
      if (seriesIndex !== -1) {
        series[seriesIndex].data.push([item[mergedOptions.xField], item[mergedOptions.yField]]);
      }
    });
  }
  
  return {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: Object.keys(seriesMap)
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false
    },
    yAxis: {
      type: 'value'
    },
    series: series
  };
}

// 生成柱状图
function generateBarChart(data, options = {}) {
  const defaultOptions = {
    xField: 'x',
    yField: 'y',
    seriesField: 'series'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // 提取数据系列
  const series = [];
  const seriesMap = {};
  let xAxisData = [];
  
  // 处理数据
  if (Array.isArray(data)) {
    // 提取X轴类别
    xAxisData = [...new Set(data.map(item => item[mergedOptions.xField]))];
    
    data.forEach(item => {
      const seriesName = item[mergedOptions.seriesField] || '默认系列';
      if (!seriesMap[seriesName]) {
        seriesMap[seriesName] = Array(xAxisData.length).fill(0);
        series.push({
          name: seriesName,
          type: 'bar',
          data: seriesMap[seriesName]
        });
      }
      
      const xIndex = xAxisData.indexOf(item[mergedOptions.xField]);
      const seriesIndex = series.findIndex(s => s.name === seriesName);
      if (xIndex !== -1 && seriesIndex !== -1) {
        seriesMap[seriesName][xIndex] = item[mergedOptions.yField];
        series[seriesIndex].data[xIndex] = item[mergedOptions.yField];
      }
    });
  }
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: Object.keys(seriesMap)
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData
    },
    yAxis: {
      type: 'value'
    },
    series: series
  };
}

// 生成饼图
function generatePieChart(data, options = {}) {
  const defaultOptions = {
    nameField: 'name',
    valueField: 'value'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // 处理数据
  const pieData = [];
  if (Array.isArray(data)) {
    data.forEach(item => {
      pieData.push({
        name: item[mergedOptions.nameField],
        value: item[mergedOptions.valueField]
      });
    });
  }
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: pieData.map(item => item.name)
    },
    series: [
      {
        name: options.seriesName || '数据',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData
      }
    ]
  };
}

// 生成散点图
function generateScatterChart(data, options = {}) {
  const defaultOptions = {
    xField: 'x',
    yField: 'y',
    sizeField: 'size',
    colorField: 'color'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // 处理数据
  const processedData = [];
  if (Array.isArray(data)) {
    data.forEach(item => {
      processedData.push([
        item[mergedOptions.xField],
        item[mergedOptions.yField],
        item[mergedOptions.sizeField] || 10,
        item[mergedOptions.colorField] || ''
      ]);
    });
  }
  
  return {
    tooltip: {
      formatter: function(params) {
        return `(${params.value[0]}, ${params.value[1]})`; 
      }
    },
    xAxis: {},
    yAxis: {},
    series: [{
      type: 'scatter',
      symbolSize: function(data) {
        return data[2];
      },
      itemStyle: {
        color: function(params) {
          return params.value[3] || '#5470c6';
        }
      },
      data: processedData
    }]
  };
}

// 生成热力图
function generateHeatmapChart(data, options = {}) {
  const defaultOptions = {
    xField: 'x',
    yField: 'y',
    valueField: 'value'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // 提取X轴和Y轴类别
  const xCategories = [...new Set(data.map(item => item[mergedOptions.xField]))];
  const yCategories = [...new Set(data.map(item => item[mergedOptions.yField]))];
  
  // 处理数据
  const heatmapData = [];
  if (Array.isArray(data)) {
    data.forEach(item => {
      const xIndex = xCategories.indexOf(item[mergedOptions.xField]);
      const yIndex = yCategories.indexOf(item[mergedOptions.yField]);
      
      if (xIndex !== -1 && yIndex !== -1) {
        heatmapData.push([xIndex, yIndex, item[mergedOptions.valueField]]);
      }
    });
  }
  
  return {
    tooltip: {
      position: 'top'
    },
    grid: {
      height: '50%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: xCategories,
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: yCategories,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: Math.max(...heatmapData.map(item => item[2])),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%'
    },
    series: [{
      name: options.seriesName || '热力图',
      type: 'heatmap',
      data: heatmapData,
      label: {
        show: true
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
}

// 添加图表功能到场景动作中
const chartActions = {
  showCategoryDistribution: () => {
    const data = categoriesCount.value.map(cat => ({
      name: getCategoryName(cat.id),
      value: cat.count
    }));
    
    generateDynamicChart('pie', data, '物料类别分布', {
      seriesName: '物料数量'
    });
  },
  
  showDefectTrend: () => {
    // 按日期排序
    const sortedData = [...onlineData.value].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 获取最近7个日期
    const dates = Array.from(new Set(sortedData.map(item => item.date))).slice(-7);
    
    // 计算每天的平均缺陷率
    const defectRateData = dates.map(date => {
      const dayItems = sortedData.filter(item => item.date === date);
      if (dayItems.length === 0) return { x: date, y: 0, series: '缺陷率' };
      
      const totalDefects = dayItems.reduce((sum, item) => sum + item.defect_count, 0);
      const totalCount = dayItems.reduce((sum, item) => sum + item.total_count, 0);
      
      return {
        x: date,
        y: parseFloat(((totalDefects / totalCount) * 100).toFixed(2)),
        series: '缺陷率'
      };
    });
    
    generateDynamicChart('line', defectRateData, '缺陷率趋势', {
      xField: 'x',
      yField: 'y',
      seriesField: 'series',
      smooth: true
    });
  },
  
  showTestTypeDistribution: () => {
    const testTypesData = {};
    labData.value.forEach(item => {
      if (!testTypesData[item.test_type]) {
        testTypesData[item.test_type] = 0;
      }
      testTypesData[item.test_type]++;
    });
    
    const chartData = Object.entries(testTypesData).map(([name, value]) => ({ name, value }));
    
    generateDynamicChart('bar', chartData, '测试类型分布', {
      xField: 'name',
      yField: 'value'
    });
  },
  
  showLineDefectRates: () => {
    const lineData = {};
    onlineData.value.forEach(item => {
      if (!lineData[item.line_name]) {
        lineData[item.line_name] = {
          total: 0,
          defects: 0
        };
      }
      lineData[item.line_name].total += item.total_count;
      lineData[item.line_name].defects += item.defect_count;
    });
    
    const chartData = [];
    for (const [line, data] of Object.entries(lineData)) {
      chartData.push({
        x: line,
        y: parseFloat(((data.defects / data.total) * 100).toFixed(2)),
        series: '不良率'
      });
    }
    
    generateDynamicChart('bar', chartData, '生产线不良率', {
      xField: 'x',
      yField: 'y',
      seriesField: 'series'
    });
  }
};

// 将图表功能添加到各个场景的动作中
sceneActions.inventory.push({
  title: '物料类别分析',
  description: '查看物料类别分布详细图表',
  icon: 'pie-chart',
  action: 'showCategoryDistribution'
});

sceneActions.inventory.push({
  title: '缺陷率趋势详情',
  description: '查看完整的缺陷率趋势分析',
  icon: 'trend-charts',
  action: 'showDefectTrend'
});

sceneActions.lab.push({
  title: '测试类型分析',
  description: '详细分析测试类型分布情况',
  icon: 'data-analysis',
  action: 'showTestTypeDistribution'
});

sceneActions.production.push({
  title: '产线不良率分析',
  description: '查看各产线不良率详细对比',
  icon: 'histogram',
  action: 'showLineDefectRates'
});

// 处理图表类型变更
function handleChartTypeChange(newType) {
  // 保存当前数据和标题
  const currentData = currentChart.value._originalData || [];
  const title = currentChart.value.title;
  const options = currentChart.value._options || {};
  
  // 重新生成图表
  generateDynamicChart(newType, currentData, title, options);
}

// 下载图表
function downloadChart() {
  // 获取图表DOM元素
  const chartDom = document.querySelector('.fullsize-chart');
  if (!chartDom) {
    ElMessage.error('未找到图表元素');
    return;
  }
  
  // 创建一个canvas元素
  const canvas = document.createElement('canvas');
  canvas.width = chartDom.clientWidth;
  canvas.height = chartDom.clientHeight;
  
  // 将图表绘制到canvas
  const chartInstance = echarts.getInstanceByDom(chartDom);
  if (chartInstance) {
    const imgData = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2
    });
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = `${currentChart.value.title || '图表'}.png`;
    link.href = imgData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    ElMessage.success('图表已下载');
  } else {
    ElMessage.error('获取图表实例失败');
  }
}

// 将图表插入到对话
function insertChartToChat() {
  // 关闭对话框
  showChartDialog.value = false;
  
  // 添加系统消息
  chatMessages.value.push({
    role: 'assistant',
    content: `## ${currentChart.value.title}\n\n[图表数据可视化]\n\n*注: 该图表已插入到对话中，可在导出对话时一并保存。*`,
    timestamp: new Date(),
    isChart: true,
    chartOption: currentChart.value.option
  });
  
  // 滚动到底部
  scrollToBottom();
  
  ElMessage.success('图表已插入到对话');
}

// 添加导出和报告相关的状态
const showReportDialog = ref(false);
const reportOptions = ref({
  title: 'IQE质量分析报告',
  subtitle: new Date().toLocaleDateString(),
  includeCharts: true,
  includeConversation: true,
  includeSummary: true,
  format: 'a4',
  orientation: 'portrait'
});

// 图像分析相关状态
const showImageAnalysisDialog = ref(false);
const imageUploadURL = ref('');
const imageAnalysisResult = ref(null);
const isAnalyzingImage = ref(false);
const imageFile = ref(null);

// 触发图像上传
function handleImageUpload(event) {
  let file;
  
  // 处理不同的事件类型
  if (event.target && event.target.files) {
    // 从input元素获取文件
    file = event.target.files[0];
  } else if (event.raw) {
    // 从el-upload组件获取文件
    file = event.raw;
  } else {
    console.error('无法获取上传的文件');
    ElMessage.error('文件上传失败');
    return;
  }
  
  if (file) {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      ElMessage.error('请上传图片文件');
      return;
    }
    
    imageFile.value = file;
    
    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      imageUploadURL.value = e.target.result;
      showImageAnalysisDialog.value = true;
    };
    reader.onerror = () => {
      ElMessage.error('图片读取失败');
    };
    reader.readAsDataURL(file);
    
    // 如果是input元素，清除选择，以便可以再次选择同一文件
    if (event.target && event.target.files) {
      event.target.value = '';
    }
  }
}

// 分析上传的图像
async function analyzeImage() {
  if (!imageUploadURL.value) {
    ElMessage.warning('请先上传图片');
    return;
  }
  
  isAnalyzingImage.value = true;
  
  try {
    // 模拟AI分析过程
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 根据当前场景生成不同的分析结果
    if (currentScene.value === 'inventory') {
      imageAnalysisResult.value = {
        defectDetected: Math.random() > 0.5,
        defectType: ['划痕', '变形', '污渍', '颜色异常'][Math.floor(Math.random() * 4)],
        defectConfidence: (70 + Math.random() * 25).toFixed(2) + '%',
        materialType: ['塑料', '金属', '橡胶', '复合材料'][Math.floor(Math.random() * 4)],
        recommendations: [
          '建议进行详细人工检查',
          '调整自动检测参数提高准确度',
          '增加该批次抽样比例'
        ]
      };
    } else if (currentScene.value === 'lab') {
      imageAnalysisResult.value = {
        testResult: Math.random() > 0.7 ? '合格' : '不合格',
        testParameters: {
          硬度: (Math.random() * 100).toFixed(2) + ' HV',
          弹性: (Math.random() * 10).toFixed(2) + ' mm',
          耐磨性: (Math.random() * 5).toFixed(2) + ' μm',
        },
        standardCompliance: (Math.random() > 0.7 ? '符合' : '不符合') + ' IQE-STD-201',
        recommendations: [
          '调整测试仪器校准参数',
          '重复测试验证结果',
          '查看材料是否符合预期规格'
        ]
      };
    } else if (currentScene.value === 'production') {
      imageAnalysisResult.value = {
        anomalyDetected: Math.random() > 0.4,
        anomalyType: ['组装错误', '缺陷部件', '连接不良', '尺寸偏差'][Math.floor(Math.random() * 4)],
        productionLine: 'Line-' + (Math.floor(Math.random() * 5) + 1),
        impactLevel: ['高', '中', '低'][Math.floor(Math.random() * 3)],
        recommendations: [
          '暂停该生产线并检查设备',
          '重新校准装配机器人',
          '增加该工位检查频率'
        ]
      };
    }
    
    // 将分析结果添加到对话中
    const analysisMessage = `## 图像分析结果\n\n以下是对上传图像的分析:\n\n`;
    let detailText = '';
    
    if (currentScene.value === 'inventory') {
      const { defectDetected, defectType, defectConfidence, materialType, recommendations } = imageAnalysisResult.value;
      detailText = `- **检测结果**: ${defectDetected ? '发现缺陷' : '未发现缺陷'}\n`;
      
      if (defectDetected) {
        detailText += `- **缺陷类型**: ${defectType}\n`;
        detailText += `- **置信度**: ${defectConfidence}\n`;
      }
      
      detailText += `- **材料类型**: ${materialType}\n\n`;
      detailText += `### 建议操作:\n\n`;
      recommendations.forEach(rec => {
        detailText += `- ${rec}\n`;
      });
    } else if (currentScene.value === 'lab') {
      const { testResult, testParameters, standardCompliance, recommendations } = imageAnalysisResult.value;
      detailText = `- **测试结果**: ${testResult}\n`;
      
      detailText += `- **测试参数**:\n`;
      Object.entries(testParameters).forEach(([key, value]) => {
        detailText += `  - ${key}: ${value}\n`;
      });
      
      detailText += `- **标准合规性**: ${standardCompliance}\n\n`;
      detailText += `### 建议操作:\n\n`;
      recommendations.forEach(rec => {
        detailText += `- ${rec}\n`;
      });
    } else if (currentScene.value === 'production') {
      const { anomalyDetected, anomalyType, productionLine, impactLevel, recommendations } = imageAnalysisResult.value;
      detailText = `- **检测结果**: ${anomalyDetected ? '发现异常' : '正常'}\n`;
      
      if (anomalyDetected) {
        detailText += `- **异常类型**: ${anomalyType}\n`;
        detailText += `- **影响程度**: ${impactLevel}\n`;
      }
      
      detailText += `- **生产线**: ${productionLine}\n\n`;
      detailText += `### 建议操作:\n\n`;
      recommendations.forEach(rec => {
        detailText += `- ${rec}\n`;
      });
    }
    
    // 添加分析结果到对话中
    chatMessages.value.push({
      role: 'assistant',
      content: analysisMessage + detailText,
      timestamp: new Date(),
      imageData: imageUploadURL.value
    });
    
    // 滚动到底部
    scrollToBottom();
    
    // 关闭对话框
    showImageAnalysisDialog.value = false;
    imageUploadURL.value = '';
    imageFile.value = null;
    
    ElMessage.success('图像分析完成');
  } catch (error) {
    console.error('图像分析错误:', error);
    ElMessage.error('图像分析失败，请重试');
  } finally {
    isAnalyzingImage.value = false;
  }
}

// 在输入工具区域添加图像上传按钮
function addImageUploadButton() {
  return `
    <div class="input-tools">
      <label for="image-upload" class="image-upload-btn">
        <el-button 
          type="default" 
          :disabled="isLoading"
          title="上传图片分析"
        >
          <el-icon><el-icon-picture /></el-icon>
        </el-button>
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleImageUpload"
      />
      <el-button 
        type="default" 
        :class="{ 'recording': isRecording }"
        @click="startVoiceInput"
        :disabled="isLoading"
        title="语音输入"
      >
        <el-icon><Microphone /></el-icon>
      </el-button>
      <el-button 
        type="primary" 
        :disabled="!userInput.trim() || isLoading" 
        @click="sendMessage"
      >
        发送
      </el-button>
    </div>
  `;
}

// 添加场景动作处理函数
function simulateAction(action) {
  console.log('执行动作:', action);
  
  // 根据动作类型调用相应的函数
  switch(action.action) {
    case 'showHighRiskMaterials':
      showHighRiskMaterials();
      break;
    case 'analyzeSupplierQuality':
      analyzeSupplierQuality();
      break;
    case 'generateInspectionPlan':
      generateInspectionPlan();
      break;
    case 'analyzeTestAnomalies':
      analyzeTestAnomalies();
      break;
    case 'optimizeTestStandards':
      optimizeTestStandards();
      break;
    case 'analyzeTestEfficiency':
      analyzeTestEfficiency();
      break;
    case 'diagnoseProdAnomalies':
      diagnoseProdAnomalies();
      break;
    case 'predictQualityRisks':
      predictQualityRisks();
      break;
    case 'optimizeInspectionSchedule':
      optimizeInspectionSchedule();
      break;
    case 'showCategoryDistribution':
      chartActions.showCategoryDistribution();
      break;
    case 'showDefectTrend':
      chartActions.showDefectTrend();
      break;
    case 'showTestTypeDistribution':
      chartActions.showTestTypeDistribution();
      break;
    case 'showLineDefectRates':
      chartActions.showLineDefectRates();
      break;
    default:
      ElMessage.info(`正在执行: ${action.title}`);
      ElMessage.warning('该功能尚在开发中');
  }
}

// 库存管理场景动作实现
function showHighRiskMaterials() {
  // 筛选高风险物料
  const highRiskMaterials = factoryData.value.filter(item => item.defect_rate > 3);
  
  // 生成回复内容
  const content = `## 高风险物料分析

我已为您筛选出${highRiskMaterials.length}件缺陷率超过3%的高风险物料：

| 物料编号 | 物料名称 | 缺陷率 | 类别 | 供应商 |
|---------|---------|-------|-----|-------|
${highRiskMaterials.map(item => `| ${item.id} | ${item.name} | ${item.defect_rate}% | ${getCategoryName(item.category_id)} | ${item.supplier} |`).join('\n')}

### 建议措施:
1. 增加这些物料的抽样检验比例至5%
2. 与供应商沟通质量改进计划
3. 对生产线使用这些物料的工位增加巡检频次`;

  // 添加助手回复
  chatMessages.value.push({
    role: 'assistant',
    content: content,
    timestamp: new Date()
  });
  
  // 滚动到底部
  scrollToBottom();
}

function analyzeSupplierQuality() {
  // 按供应商分组统计质量数据
  const supplierStats = {};
  
  factoryData.value.forEach(item => {
    if (!supplierStats[item.supplier]) {
      supplierStats[item.supplier] = {
        totalItems: 0,
        totalDefects: 0,
        defectRate: 0,
        categories: new Set()
      };
    }
    
    supplierStats[item.supplier].totalItems++;
    supplierStats[item.supplier].totalDefects += item.defect_rate * 0.01;
    supplierStats[item.supplier].categories.add(item.category_id);
  });
  
  // 计算平均缺陷率
  Object.keys(supplierStats).forEach(supplier => {
    supplierStats[supplier].defectRate = (supplierStats[supplier].totalDefects / supplierStats[supplier].totalItems * 100).toFixed(2);
    supplierStats[supplier].categories = Array.from(supplierStats[supplier].categories).map(id => getCategoryName(id));
  });
  
  // 排序供应商，缺陷率从高到低
  const sortedSuppliers = Object.entries(supplierStats)
    .sort((a, b) => parseFloat(b[1].defectRate) - parseFloat(a[1].defectRate))
    .slice(0, 5); // 取前5名
  
  // 生成回复内容
  const content = `## 供应商质量分析

以下是主要供应商的质量表现分析：

| 供应商 | 物料数量 | 平均缺陷率 | 主要物料类别 |
|-------|---------|----------|------------|
${sortedSuppliers.map(([name, stats]) => `| ${name} | ${stats.totalItems} | ${stats.defectRate}% | ${stats.categories.join(', ')} |`).join('\n')}

### 分析结论:
1. ${sortedSuppliers[0][0]}的平均缺陷率最高，达到${sortedSuppliers[0][1].defectRate}%，建议重点关注
2. 电子元件类物料的供应商整体缺陷率较高
3. 建议对缺陷率>2%的供应商启动质量改进计划`;

  // 添加助手回复
  chatMessages.value.push({
    role: 'assistant',
    content: content,
    timestamp: new Date()
  });
  
  // 滚动到底部
  scrollToBottom();
}

function generateInspectionPlan() {
  // 根据物料风险等级生成检验计划
  const highRiskMaterials = factoryData.value.filter(item => item.defect_rate > 3);
  const mediumRiskMaterials = factoryData.value.filter(item => item.defect_rate > 1 && item.defect_rate <= 3);
  const lowRiskMaterials = factoryData.value.filter(item => item.defect_rate <= 1);
  
  // 生成回复内容
  const content = `## 入库检验计划建议

基于物料风险等级，为您生成下周入库检验计划：

### 高风险物料 (${highRiskMaterials.length}件)
- 抽样比例: 5%
- 检验项目: 全项目检验
- 检验频次: 每批次
- 物料清单: ${highRiskMaterials.slice(0, 3).map(item => item.name).join('、')}等

### 中风险物料 (${mediumRiskMaterials.length}件)
- 抽样比例: 2%
- 检验项目: 关键参数检验
- 检验频次: 每批次
- 物料清单: ${mediumRiskMaterials.slice(0, 3).map(item => item.name).join('、')}等

### 低风险物料 (${lowRiskMaterials.length}件)
- 抽样比例: 1%
- 检验项目: 外观+关键参数
- 检验频次: 抽检
- 物料清单: ${lowRiskMaterials.slice(0, 3).map(item => item.name).join('、')}等

### 特别关注:
1. 新供应商首批物料100%检验
2. 电子元件类重点检查电气性能参数
3. 结构件类重点检查尺寸公差`;

  // 添加助手回复
  chatMessages.value.push({
    role: 'assistant',
    content: content,
    timestamp: new Date()
  });
  
  // 滚动到底部
  scrollToBottom();
}

// 实验室测试场景动作实现
function analyzeTestAnomalies() {
  // 筛选不合格的测试记录
  const failedTests = labData.value.filter(item => item.result === '不合格');
  
  // 按测试类型统计
  const testTypeStats = {};
  failedTests.forEach(item => {
    if (!testTypeStats[item.test_type]) {
      testTypeStats[item.test_type] = 0;
    }
    testTypeStats[item.test_type]++;
  });
  
  // 排序测试类型，问题数量从高到低
  const sortedTestTypes = Object.entries(testTypeStats)
    .sort((a, b) => b[1] - a[1]);
  
  // 生成回复内容
  const content = `## 测试异常分析

最近一周共有${failedTests.length}次测试不合格，按测试类型分布如下：

| 测试类型 | 不合格次数 | 占比 |
|---------|----------|-----|
${sortedTestTypes.map(([type, count]) => `| ${type} | ${count} | ${((count / failedTests.length) * 100).toFixed(1)}% |`).join('\n')}

### 主要异常原因:
1. ${sortedTestTypes[0][0]}测试不合格率最高，主要问题在于参数超出标准范围
2. 材料性能测试中，硬度和强度参数异常占比较高
3. 电气性能测试中，绝缘性能不达标问题突出

### 改进建议:
1. 调整${sortedTestTypes[0][0]}测试设备校准参数
2. 增加供应商原材料质量控制要求
3. 优化测试流程，增加预检环节`;

  // 添加助手回复
  chatMessages.value.push({
    role: 'assistant',
    content: content,
    timestamp: new Date()
  });
  
  // 滚动到底部
  scrollToBottom();
}

function optimizeTestStandards() {
  // 生成测试标准优化建议
  const content = `## 测试标准优化建议

基于对现有测试数据的分析，建议对以下测试标准进行优化：

### 电气性能测试
- **当前标准**: 绝缘电阻>100MΩ，耐压>500V
- **优化建议**: 增加温度循环下的电气性能测试，更符合实际使用环境
- **预期效果**: 提高电气性能测试的实际使用预测性，降低现场失效率

### 材料性能测试
- **当前标准**: 硬度、强度、弹性三项指标独立测试
- **优化建议**: 增加复合应力测试项目，模拟实际使用工况
- **预期效果**: 提高测试覆盖率，降低漏检率

### 尺寸测量
- **当前标准**: 关键尺寸抽检，一般公差±0.1mm
- **优化建议**: 引入3D扫描技术，实现全尺寸测量
- **预期效果**: 提高测量效率30%，精度提升50%

### 可靠性测试
- **当前标准**: 常温下进行，测试时间较短
- **优化建议**: 增加温湿度循环测试，延长测试时间
- **预期效果**: 更准确预测产品长期使用性能

以上优化建议预计可将测试有效性提升25%，降低现场问题发生率约15%。`;

  // 添加助手回复
  chatMessages.value.push({
    role: 'assistant',
    content: content,
    timestamp: new Date()
  });
  
  // 滚动到底部
  scrollToBottom();
}

function analyzeTestEfficiency() {
  // 生成测试效率分析
  const content = `## 测试流程效率分析

经分析，当前测试流程存在以下效率瓶颈：

### 瓶颈分析
1. **样品准备阶段**: 平均耗时2.5天，占总测试周期的35%
   - 主要问题: 样品交接流程复杂，文档审核重复
   
2. **测试设备调试**: 平均耗时0.8天，占总测试周期的12%
   - 主要问题: 设备共享导致等待时间长

3. **数据分析与报告**: 平均耗时1.2天，占总测试周期的18%
   - 主要问题: 报告模板不统一，人工整理数据耗时

### 优化方案
1. **流程再造**:
   - 简化样品交接流程，实现电子化审批
   - 预计可节省: 1.2天

2. **设备调度优化**:
   - 实施测试设备预约系统，提高设备利用率
   - 预计可节省: 0.5天

3. **自动化报告生成**:
   - 开发标准化测试报告模板，实现数据自动填充
   - 预计可节省: 0.8天

实施上述优化方案后，预计可将平均测试周期从7天缩短至4.5天，提升效率约35%。`;

  // 添加助手回复
  chatMessages.value.push({
    role: 'assistant',
    content: content,
    timestamp: new Date()
  });
  
  // 滚动到底部
  scrollToBottom();
}

// 生产场景动作实现
function diagnoseProdAnomalies() {
  // 分析生产异常
  const highDefectLines = onlineData.value.filter(item => (item.defect_count / item.total_count) > 0.02);
  
  // 统计异常类型
  const issueTypes = {};
  highDefectLines.forEach(item => {
    if (item.issues) {
      item.issues.forEach(issue => {
        if (!issueTypes[issue.type]) {
          issueTypes[issue.type] = 0;
        }
        issueTypes[issue.type] += issue.count;
      });
    }
  });
  
  // 排序异常类型
  const sortedIssues = Object.entries(issueTypes)
    .sort((a, b) => b[1] - a[1]);
  
  // 生成回复内容
  const content = `## 产线异常诊断

当前生产线存在${highDefectLines.length}个高缺陷率工位，主要异常类型如下：

| 异常类型 | 发生次数 | 占比 |
|---------|---------|-----|
${sortedIssues.map(([type, count]) => {
  const total = sortedIssues.reduce((sum, [_, c]) => sum + c, 0);
  return `| ${type} | ${count} | ${((count / total) * 100).toFixed(1)}% |`;
}).join('\n')}

### 根本原因分析:
1. **${sortedIssues[0][0]}**: 主要由设备参数漂移导致，建议增加设备校准频次
2. **${sortedIssues[1] ? sortedIssues[1][0] : '其他异常'}**: 与操作人员培训不足相关，建议加强标准操作培训
3. **物料因素**: 部分高风险物料在生产中表现不稳定，建议调整物料检验标准

### 改进措施:
1. 对问题工位实施设备预防性维护
2. 优化工艺参数，增加关键参数监控点
3. 对操作人员进行专项培训
4. 建立快速响应机制，发现异常立即处理`;

  // 添加助手回复
  chatMessages.value.push({
    role: 'assistant',
    content: content,
    timestamp: new Date()
  });
  
  // 滚动到底部
  scrollToBottom();
}

function predictQualityRisks() {
  // 生成质量风险预测
  const content = `## 未来一周质量风险预测

基于历史数据分析和当前生产状态，预测未来一周可能出现的质量风险：

### 高风险预警 (需立即关注)
1. **SMT产线A3工位**
   - 风险描述: 回流焊温度波动增大，可能导致焊接不良率上升
   - 风险指数: 92/100
   - 建议措施: 立即检查回流焊设备，校准温度控制系统

2. **组装线B2工位**
   - 风险描述: 螺丝锁付扭力不稳定，可能导致松动风险
   - 风险指数: 87/100
   - 建议措施: 更换锁付工具，重新校准扭力参数

### 中风险预警 (需密切监控)
1. **测试站C5**
   - 风险描述: 测试夹具接触不良率上升趋势明显
   - 风险指数: 76/100
   - 建议措施: 增加夹具清洁频次，准备备用夹具

2. **包装站D1**
   - 风险描述: 包装材料批次变更，可能影响防护性能
   - 风险指数: 65/100
   - 建议措施: 对新批次包装材料进行全检验证

### 预防性建议
1. 增加关键工位巡检频次，从每4小时一次提高到每2小时一次
2. 准备应急物料和备用设备，确保快速响应能力
3. 对高风险工位安排专人监控，发现异常立即处理`;

  // 添加助手回复
  chatMessages.value.push({
    role: 'assistant',
    content: content,
    timestamp: new Date()
  });
  
  // 滚动到底部
  scrollToBottom();
}

function optimizeInspectionSchedule() {
  // 生成巡检计划优化建议
  const content = `## 产线巡检计划优化

基于当前产线状态和历史质量数据，为您提供以下巡检计划优化建议：

### 差异化巡检频次
| 工位类型 | 当前频次 | 建议频次 | 理由 |
|---------|---------|---------|-----|
| 高风险工位 | 4小时/次 | 2小时/次 | 历史数据显示异常多发生在连续生产2小时后 |
| 中风险工位 | 4小时/次 | 4小时/次 | 保持现有频次，但优化检查项目 |
| 低风险工位 | 4小时/次 | 8小时/次 | 历史稳定性好，可降低频次提高效率 |

### 巡检项目优化
1. **SMT产线**
   - 新增: 钢网清洁状态检查、回流焊温度曲线记录
   - 优化: 将目视检查改为AOI自动检测

2. **组装产线**
   - 新增: 扭力测试、气密性随机抽检
   - 优化: 简化外观检查项目，专注功能性检查

3. **测试产线**
   - 新增: 测试夹具接触电阻检查
   - 优化: 合并重复测试项目，提高效率

### 巡检方式创新
1. 引入移动端巡检APP，实现数据实时上传
2. 建立巡检数据分析系统，实现异常自动预警
3. 实施"飞行检查"机制，不定时抽检关键工序

实施此优化方案预计可提高异常检出率25%，同时减少巡检人力投入15%。`;

  // 添加助手回复
  chatMessages.value.push({
    role: 'assistant',
    content: content,
    timestamp: new Date()
  });
  
  // 滚动到底部
  scrollToBottom();
}

// 场景切换处理
function handleSceneChange(scene) {
  // 更新当前场景
  currentScene.value = scene;
  
  // 添加场景欢迎消息
  addWelcomeMessage(scene);
}

// 添加场景欢迎消息
function addWelcomeMessage(scene) {
  // 清空现有消息
  chatMessages.value = [];
  
  // 根据场景添加欢迎消息
  const welcomeMessages = {
    inventory: `## 欢迎使用库存管理助手

我可以帮您分析库存物料数据、识别高风险物料、优化检验方案。当前数据概览:
- 物料总数: ${factoryData.value.length}件
- 高风险物料: ${factoryData.value.filter(item => item.defect_rate > 3).length}件
- 平均缺陷率: ${(factoryData.value.reduce((sum, item) => sum + item.defect_rate, 0) / factoryData.value.length).toFixed(2)}%

您可以询问我关于库存管理、物料质量、入库检验等问题。`,

    lab: `## 欢迎使用实验室测试助手

我可以帮您分析测试数据、诊断测试异常、优化测试流程。当前数据概览:
- 测试总数: ${labData.value.length}次
- 合格率: ${Math.round((labData.value.filter(item => item.result === '合格').length / labData.value.length) * 100)}%
- 主要测试类型: ${Array.from(new Set(labData.value.map(item => item.test_type))).slice(0, 3).join('、')}

您可以询问我关于测试异常分析、测试效率提升、测试标准优化等问题。`,

    production: `## 欢迎使用生产异常助手

我可以帮您诊断生产异常、预测质量风险、优化产线控制。当前数据概览:
- 生产批次: ${onlineData.value.length}批
- 平均不良率: ${((onlineData.value.reduce((sum, item) => sum + item.defect_count, 0) / onlineData.value.reduce((sum, item) => sum + item.total_count, 0)) * 100).toFixed(2)}%
- 主要异常类型: 组装偏差、尺寸超差、外观缺陷

您可以询问我关于生产异常诊断、质量预警、工艺优化等问题。`
  };
  
  // 添加欢迎消息
  chatMessages.value.push({
    role: 'assistant',
    content: welcomeMessages[scene] || '欢迎使用IQE智能助手，请问有什么可以帮助您的？',
    timestamp: new Date()
  });
  
  // 滚动到底部
  scrollToBottom();
}
</script>

<style scoped>
.ai-container {
  /* 已使用page-container全局样式 */
}

/* 设置卡片 */
.ai-settings {
  display: flex;
  gap: 10px;
}

/* 数据摘要卡片 */
.data-summary-card,
.quick-questions-card {
  margin-bottom: 20px;
}

.data-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 15px;
}

.stat-item {
  text-align: center;
  padding: 10px 5px;
  background-color: var(--primary-light);
  border-radius: 8px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 12px;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-color);
  display: flex;
  justify-content: center;
  align-items: baseline;
}

.stat-detail {
  font-size: 12px;
  margin-left: 2px;
}

/* 类别统计 */
.category-stats {
  margin-bottom: 15px;
}

.chart-container {
  height: 200px;
}

.chart {
  height: 100%;
}

/* 异常指标 */
.alert-items {
  margin-bottom: 10px;
}

.alert-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 5px;
  border-radius: 4px;
  background-color: var(--info-light);
}

.alert-item .el-tag {
  margin-right: 10px;
  flex-shrink: 0;
}

.alert-content {
  font-size: 13px;
  color: var(--text-regular);
}

.empty-alert {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--success-color);
  padding: 10px;
}

.empty-alert .el-icon {
  margin-right: 5px;
}

/* 快速提问 */
.question-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-question-btn {
  width: 100%;
  text-align: left;
}

/* 聊天界面 */
.chat-card {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.chat-message {
  display: flex;
  margin-bottom: 15px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  flex-shrink: 0;
}

.user-avatar {
  background-color: var(--warning-light);
  color: var(--warning-color);
}

.assistant-avatar {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.message-content {
  margin-left: 10px;
  max-width: calc(100% - 50px);
}

.message-bubble {
  padding: 10px 15px;
  border-radius: 10px;
  word-break: break-word;
}

.system-message .message-bubble,
.assistant-message .message-bubble {
  background-color: var(--primary-light);
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.user-message .message-bubble {
  background-color: var(--warning-light);
  border: 1px solid rgba(230, 162, 60, 0.2);
}

.message-bubble p {
  margin: 0 0 10px 0;
}

.message-bubble p:last-child {
  margin-bottom: 0;
}

.message-bubble ul {
  margin: 5px 0;
  padding-left: 20px;
}

.message-time {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 5px;
}

/* 加载动画 */
.loading-bubble {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 30px;
}

.loading-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--primary-color);
  margin: 0 5px;
  opacity: 0.6;
  animation: dot-pulse 1.5s infinite ease-in-out;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.5s;
}

.loading-dot:nth-child(3) {
  animation-delay: 1s;
}

@keyframes dot-pulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* 输入区域 */
.chat-input-area {
  margin-top: 15px;
  border-top: 1px solid var(--border-lighter);
  padding-top: 15px;
}

.input-tools {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  gap: 8px;
}

/* 语音输入按钮样式 */
.recording {
  background-color: var(--danger-color) !important;
  color: white !important;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 历史对话 */
.saved-chats-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.saved-chat-item {
  margin-bottom: 10px;
}

.saved-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.saved-chat-title {
  font-weight: bold;
  color: var(--primary-color);
}

.saved-chat-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.saved-chat-preview {
  color: var(--text-regular);
  margin-bottom: 10px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.saved-chat-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 推荐动作样式 */
.actions-card {
  margin-top: 20px;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s;
}

.action-item:hover {
  background-color: var(--primary-light);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-item .el-icon {
  font-size: 20px;
  color: var(--primary-color);
  margin-right: 12px;
}

.action-item .el-icon-arrow-right {
  margin-left: auto;
  margin-right: 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.action-content {
  flex: 1;
}

.action-title {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.action-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .chat-card {
    height: calc(100vh - 230px);
    margin-top: 20px;
  }
  
  .data-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 消息操作工具 */
.message-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
}

.message-tools {
  display: flex;
  gap: 5px;
}

/* 语音设置样式 */
.speech-settings {
  padding: 10px;
}

.slider-with-value {
  display: flex;
  align-items: center;
  gap: 10px;
}

.slider-value {
  width: 40px;
  text-align: right;
}

.speech-test {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

/* 图表对话框样式 */
.chart-dialog-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-visualization {
  min-height: 400px;
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.fullsize-chart {
  width: 100%;
  height: 400px;
}

.chart-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.chart-type-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-label {
  font-weight: 500;
  color: var(--text-primary);
}

.chart-actions {
  display: flex;
  gap: 10px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .chart-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .chart-dialog-container {
    padding: 0;
  }
  
  .fullsize-chart {
    height: 300px;
  }
}

/* 图像分析相关样式 */
.image-upload-btn {
  cursor: pointer;
}

.image-analysis-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.preview-container {
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.image-preview {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
}

.upload-area {
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-uploader {
  width: 100%;
  height: 100%;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 10px;
}

.upload-text {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

.analyzing-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.analyzing-text {
  margin-top: 10px;
  color: #606266;
}

.message-image-container {
  margin-top: 10px;
  margin-left: 60px;
  overflow: hidden;
  border-radius: 4px;
  max-width: 300px;
}

.analyzed-image {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
}
</style> 