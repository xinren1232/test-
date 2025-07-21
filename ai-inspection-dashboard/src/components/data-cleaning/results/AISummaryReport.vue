<template>
  <div class="ai-summary-report">
    <!-- AI分析概览 -->
    <div class="ai-overview">
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon><MagicStick /></el-icon>
              <h4>🤖 AI智能分析报告</h4>
            </div>
            <div class="confidence-badge">
              <el-tag :type="getConfidenceType()" size="large">
                置信度: {{ summaryData.confidence || 0 }}%
              </el-tag>
            </div>
          </div>
        </template>

        <div class="overview-content">
          <div class="summary-text">
            <p class="overview-description">
              {{ summaryData.overview || '正在生成AI分析报告...' }}
            </p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 关键发现 -->
    <el-card class="key-findings">
      <template #header>
        <h4>🔍 关键发现</h4>
      </template>
      
      <div class="findings-list">
        <div 
          v-for="(finding, index) in summaryData.keyFindings || []"
          :key="index"
          class="finding-item"
        >
          <div class="finding-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="finding-content">
            <p>{{ finding }}</p>
          </div>
        </div>
      </div>
      
      <div v-if="!summaryData.keyFindings || summaryData.keyFindings.length === 0" class="empty-state">
        <el-icon><Loading /></el-icon>
        <p>AI正在分析数据，请稍候...</p>
      </div>
    </el-card>

    <!-- 改进建议 -->
    <el-card class="recommendations">
      <template #header>
        <h4>💡 AI改进建议</h4>
      </template>
      
      <div class="recommendations-list">
        <div 
          v-for="(recommendation, index) in summaryData.recommendations || []"
          :key="index"
          class="recommendation-item"
          :class="`priority-${getPriorityLevel(index)}`"
        >
          <div class="recommendation-header">
            <div class="recommendation-icon">
              <el-icon><Lightbulb /></el-icon>
            </div>
            <div class="recommendation-priority">
              <el-tag :type="getPriorityType(index)" size="small">
                {{ getPriorityText(index) }}
              </el-tag>
            </div>
          </div>
          <div class="recommendation-content">
            <p>{{ recommendation }}</p>
          </div>
          <div class="recommendation-actions">
            <el-button size="small" type="primary" @click="implementRecommendation(index)">
              采纳建议
            </el-button>
            <el-button size="small" @click="viewRecommendationDetails(index)">
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 数据洞察 -->
    <el-card class="data-insights">
      <template #header>
        <h4>📊 数据洞察</h4>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="insight-card">
            <div class="insight-header">
              <el-icon><TrendCharts /></el-icon>
              <span>趋势分析</span>
            </div>
            <div class="insight-content">
              <p>数据质量呈现上升趋势，相比上次处理提升了12.5%</p>
            </div>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="insight-card">
            <div class="insight-header">
              <el-icon><Warning /></el-icon>
              <span>风险识别</span>
            </div>
            <div class="insight-content">
              <p>发现3个潜在的数据质量风险点，建议重点关注</p>
            </div>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="insight-card">
            <div class="insight-header">
              <el-icon><Trophy /></el-icon>
              <span>优化效果</span>
            </div>
            <div class="insight-content">
              <p>清洗规则优化后，处理效率提升了28%</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- AI模型信息 -->
    <el-card class="model-info">
      <template #header>
        <h4>🧠 AI模型信息</h4>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="模型版本">
          {{ summaryData.aiModel || 'GPT-4' }}
        </el-descriptions-item>
        <el-descriptions-item label="分析时间">
          {{ formatAnalysisTime() }}
        </el-descriptions-item>
        <el-descriptions-item label="处理记录数">
          1,250 条
        </el-descriptions-item>
        <el-descriptions-item label="分析维度">
          质量、完整性、一致性、有效性
        </el-descriptions-item>
        <el-descriptions-item label="置信度">
          <el-progress 
            :percentage="summaryData.confidence || 0" 
            :status="getConfidenceStatus()"
            :stroke-width="8"
          />
        </el-descriptions-item>
        <el-descriptions-item label="建议采纳率">
          预计 85%
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 交互式问答 -->
    <el-card class="ai-chat">
      <template #header>
        <h4>💬 AI助手问答</h4>
      </template>
      
      <div class="chat-container">
        <div class="chat-messages">
          <div 
            v-for="(message, index) in chatMessages"
            :key="index"
            class="chat-message"
            :class="message.type"
          >
            <div class="message-avatar">
              <el-icon v-if="message.type === 'ai'"><Robot /></el-icon>
              <el-icon v-else><User /></el-icon>
            </div>
            <div class="message-content">
              <p>{{ message.content }}</p>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <el-input
            v-model="chatInput"
            placeholder="向AI助手提问关于数据清洗的问题..."
            @keyup.enter="sendMessage"
          >
            <template #append>
              <el-button type="primary" @click="sendMessage" :loading="isTyping">
                发送
              </el-button>
            </template>
          </el-input>
        </div>
        
        <div class="quick-questions">
          <span class="quick-label">快速提问:</span>
          <el-button 
            v-for="question in quickQuestions"
            :key="question"
            size="small"
            type="info"
            plain
            @click="askQuickQuestion(question)"
          >
            {{ question }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 建议详情对话框 -->
    <el-dialog
      v-model="recommendationDetailVisible"
      title="建议详情"
      width="60%"
    >
      <div v-if="selectedRecommendation" class="recommendation-detail">
        <h5>详细说明</h5>
        <p>{{ getRecommendationDetail(selectedRecommendation) }}</p>
        
        <h5>实施步骤</h5>
        <ol>
          <li>分析当前数据录入流程</li>
          <li>制定标准化规范文档</li>
          <li>培训相关操作人员</li>
          <li>部署验证规则</li>
          <li>监控实施效果</li>
        </ol>
        
        <h5>预期效果</h5>
        <ul>
          <li>数据一致性提升 15-20%</li>
          <li>减少人工修正工作量 30%</li>
          <li>提高数据处理效率 25%</li>
        </ul>
      </div>
      
      <template #footer>
        <el-button @click="recommendationDetailVisible = false">关闭</el-button>
        <el-button type="primary" @click="implementSelectedRecommendation">采纳建议</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  MagicStick,
  Star,
  Loading,
  Sunny as Lightbulb,
  TrendCharts,
  Warning,
  Trophy,
  Robot,
  User
} from '@element-plus/icons-vue'

export default {
  name: 'AISummaryReport',
  components: {
    MagicStick,
    Star,
    Loading,
    Lightbulb,
    TrendCharts,
    Warning,
    Trophy,
    Robot,
    User
  },
  props: {
    summaryData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const recommendationDetailVisible = ref(false)
    const selectedRecommendation = ref(null)
    const chatInput = ref('')
    const isTyping = ref(false)
    
    const chatMessages = ref([
      {
        type: 'ai',
        content: '您好！我是AI数据分析助手。您可以向我询问关于本次数据清洗的任何问题。',
        timestamp: Date.now() - 60000
      }
    ])
    
    const quickQuestions = ref([
      '数据质量如何？',
      '主要问题是什么？',
      '如何改进？',
      '处理效果怎样？'
    ])

    // 方法
    const getConfidenceType = () => {
      const confidence = props.summaryData.confidence || 0
      if (confidence >= 90) return 'success'
      if (confidence >= 70) return 'warning'
      return 'danger'
    }

    const getConfidenceStatus = () => {
      const confidence = props.summaryData.confidence || 0
      if (confidence >= 90) return 'success'
      if (confidence >= 70) return undefined
      return 'exception'
    }

    const getPriorityLevel = (index) => {
      return index < 2 ? 'high' : index < 4 ? 'medium' : 'low'
    }

    const getPriorityType = (index) => {
      const level = getPriorityLevel(index)
      return level === 'high' ? 'danger' : level === 'medium' ? 'warning' : 'info'
    }

    const getPriorityText = (index) => {
      const level = getPriorityLevel(index)
      return level === 'high' ? '高优先级' : level === 'medium' ? '中优先级' : '低优先级'
    }

    const formatAnalysisTime = () => {
      return new Date().toLocaleString()
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString()
    }

    const implementRecommendation = (index) => {
      ElMessage.success(`已采纳建议 ${index + 1}`)
    }

    const viewRecommendationDetails = (index) => {
      selectedRecommendation.value = index
      recommendationDetailVisible.value = true
    }

    const getRecommendationDetail = (index) => {
      const details = [
        '通过建立统一的数据录入标准，可以显著减少数据不一致的问题。建议制定详细的编码规范、格式要求和验证规则。',
        '实施自动化验证可以在数据录入阶段就发现和阻止错误数据的产生，从源头保证数据质量。',
        '定期的数据质量审核有助于及时发现潜在问题，建立持续改进的数据管理机制。'
      ]
      return details[index] || '详细说明暂未提供。'
    }

    const implementSelectedRecommendation = () => {
      ElMessage.success('建议已采纳，将开始实施')
      recommendationDetailVisible.value = false
    }

    const sendMessage = () => {
      if (!chatInput.value.trim()) return
      
      // 添加用户消息
      chatMessages.value.push({
        type: 'user',
        content: chatInput.value,
        timestamp: Date.now()
      })
      
      const userQuestion = chatInput.value
      chatInput.value = ''
      isTyping.value = true
      
      // 模拟AI回复
      setTimeout(() => {
        const aiResponse = generateAIResponse(userQuestion)
        chatMessages.value.push({
          type: 'ai',
          content: aiResponse,
          timestamp: Date.now()
        })
        isTyping.value = false
      }, 1500)
    }

    const askQuickQuestion = (question) => {
      chatInput.value = question
      sendMessage()
    }

    const generateAIResponse = (question) => {
      const responses = {
        '数据质量如何？': '本次处理的数据整体质量良好，综合评分92分。主要优势在于数据完整性较高，达到96.8%。',
        '主要问题是什么？': '主要问题集中在物料编码格式不规范（12条记录）和部分字段缺失值（20条记录）。',
        '如何改进？': '建议建立物料编码标准化规范，增加数据录入时的实时验证，并定期进行数据质量审核。',
        '处理效果怎样？': '处理效果显著，成功清洗了94.4%的记录，数据质量相比处理前提升了12.5%。'
      }
      
      return responses[question] || '感谢您的提问。基于本次数据分析，我建议您关注数据录入的标准化和验证机制的建立。如需更详细的分析，请查看上方的详细报告。'
    }

    return {
      recommendationDetailVisible,
      selectedRecommendation,
      chatInput,
      isTyping,
      chatMessages,
      quickQuestions,
      getConfidenceType,
      getConfidenceStatus,
      getPriorityLevel,
      getPriorityType,
      getPriorityText,
      formatAnalysisTime,
      formatTime,
      implementRecommendation,
      viewRecommendationDetails,
      getRecommendationDetail,
      implementSelectedRecommendation,
      sendMessage,
      askQuickQuestion
    }
  }
}
</script>

<style scoped>
.ai-summary-report {
  padding: 20px 0;
}

.ai-overview {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-left h4 {
  margin: 0;
}

.overview-description {
  font-size: 16px;
  line-height: 1.6;
  color: #606266;
  margin: 0;
}

.key-findings,
.recommendations,
.data-insights,
.model-info,
.ai-chat {
  margin-bottom: 20px;
}

.findings-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.finding-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.finding-icon {
  color: #409eff;
  font-size: 18px;
  margin-top: 2px;
}

.finding-content p {
  margin: 0;
  line-height: 1.5;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.empty-state .el-icon {
  font-size: 32px;
  margin-bottom: 15px;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.recommendation-item {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  background: white;
}

.recommendation-item.priority-high {
  border-left: 4px solid #f56c6c;
}

.recommendation-item.priority-medium {
  border-left: 4px solid #e6a23c;
}

.recommendation-item.priority-low {
  border-left: 4px solid #409eff;
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.recommendation-icon {
  color: #e6a23c;
  font-size: 18px;
}

.recommendation-content p {
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.recommendation-actions {
  display: flex;
  gap: 10px;
}

.insight-card {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafafa;
  height: 120px;
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 500;
  color: #303133;
}

.insight-content p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.chat-container {
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  max-height: 250px;
  overflow-y: auto;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 15px;
}

.chat-message {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.chat-message.ai {
  flex-direction: row;
}

.chat-message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-message.ai .message-avatar {
  background: #e1f3ff;
  color: #409eff;
}

.chat-message.user .message-avatar {
  background: #f0f9ff;
  color: #67c23a;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.chat-message.user .message-content {
  text-align: right;
}

.message-content p {
  margin: 0 0 5px 0;
  padding: 10px 15px;
  border-radius: 12px;
  background: #f5f5f5;
  line-height: 1.4;
}

.chat-message.ai .message-content p {
  background: #e1f3ff;
}

.chat-message.user .message-content p {
  background: #f0f9ff;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.chat-input {
  margin-bottom: 15px;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.quick-label {
  font-size: 14px;
  color: #606266;
  margin-right: 10px;
}

.recommendation-detail h5 {
  margin: 20px 0 10px 0;
  color: #303133;
}

.recommendation-detail p {
  line-height: 1.6;
  color: #606266;
}

.recommendation-detail ol,
.recommendation-detail ul {
  padding-left: 20px;
}

.recommendation-detail li {
  margin-bottom: 5px;
  color: #606266;
}
</style>
