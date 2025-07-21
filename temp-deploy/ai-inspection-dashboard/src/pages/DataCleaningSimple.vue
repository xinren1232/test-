<template>
  <div class="data-cleaning-simple">
    <!-- 整体头部导航区域 -->
    <div class="unified-header">
      <div class="header-background">
        <div class="bg-mesh"></div>
        <div class="bg-glow"></div>
      </div>

      <div class="header-content">
        <!-- 品牌区域 -->
        <div class="brand-section">
          <div class="brand-icon">
            <div class="icon-inner">
              <i class="fas fa-database"></i>
            </div>
            <div class="icon-ring"></div>
          </div>
          <div class="brand-text">
            <h1 class="brand-title">
              <span class="title-main">数据清洗治理</span>
              <span class="title-sub">系统</span>
            </h1>
            <p class="brand-subtitle">Enterprise Data Cleaning & Governance Platform</p>
          </div>
        </div>

        <!-- 特性标签 -->
        <div class="feature-pills">
          <div class="pill ai-pill">
            <i class="fas fa-brain"></i>
            <span>AI智能</span>
          </div>
          <div class="pill process-pill">
            <i class="fas fa-project-diagram"></i>
            <span>6阶段流程</span>
          </div>
          <div class="pill monitor-pill">
            <i class="fas fa-chart-line"></i>
            <span>实时监控</span>
          </div>
        </div>

        <!-- 导航菜单 -->
        <div class="navigation-menu">
          <!-- 进度轨道 -->
          <div class="nav-track">
            <div class="track-line"></div>
            <div class="track-progress" :style="{ width: getProgressWidth() }"></div>
          </div>

          <!-- 导航项目 -->
          <div class="nav-items">
            <div
              v-for="(tab, index) in tabList"
              :key="tab.key"
              class="nav-item"
              :class="{
                active: activeTab === tab.key,
                completed: isTabCompleted(tab.key),
                processing: isTabProcessing(tab.key)
              }"
              @click="switchTab(tab.key)"
            >
              <!-- 导航内容 -->
              <div class="nav-content">
                <div class="nav-icon">
                  <i :class="tab.iconClass"></i>
                </div>
                <div class="nav-text">
                  <h3 class="nav-title">{{ tab.title }}</h3>
                  <p class="nav-desc">{{ tab.description }}</p>
                </div>
                <div class="nav-status" v-if="isTabCompleted(tab.key) || isTabProcessing(tab.key)">
                  <i v-if="isTabCompleted(tab.key)" class="fas fa-check-circle status-icon completed"></i>
                  <i v-else-if="isTabProcessing(tab.key)" class="fas fa-spinner status-icon processing"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="page-content">
      <!-- 文件清洗页面 - 左右布局 -->
      <div v-show="activeTab === 'cleaning'" class="tab-content cleaning-workspace">
        <div class="cleaning-layout">
          <!-- 左侧：模板选择和规则配置 -->
          <div class="left-panel">
            <!-- 模板选择区域 -->
            <div class="panel-section template-section">
              <div class="section-header">
                <h3><i class="fas fa-file-alt"></i> 数据模板</h3>
              </div>

              <div class="template-tabs">
                <div
                  v-for="template in dataTemplates"
                  :key="template.id"
                  class="template-tab"
                  :class="{ active: selectedTemplate?.id === template.id }"
                  @click="selectTemplate(template)"
                >
                  <i :class="template.iconClass"></i>
                  <span>{{ template.name }}</span>
                </div>
              </div>
            </div>

            <!-- 规则配置区域 -->
            <div v-if="selectedTemplate" class="panel-section rules-section">
              <div class="section-header">
                <h3><i class="fas fa-cogs"></i> 清洗规则</h3>
                <el-button
                  type="text"
                  size="small"
                  @click="toggleRulesExpanded"
                  class="expand-btn"
                >
                  <i :class="rulesExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                  {{ rulesExpanded ? '收起' : '展开' }}
                </el-button>
              </div>

              <div class="rules-container" :class="{ expanded: rulesExpanded }">
                <div v-for="group in groupedRules" :key="group.category" class="rule-group">
                  <div class="rule-group-header">
                    <i :class="group.icon"></i>
                    <span>{{ group.category }}</span>
                    <span class="rule-count">({{ group.rules.length }})</span>
                  </div>
                  <div class="rule-list">
                    <div
                      v-for="rule in group.rules"
                      :key="rule.id"
                      class="rule-item"
                    >
                      <div class="rule-info">
                        <span class="rule-name">{{ rule.name }}</span>
                        <span class="rule-desc">{{ rule.description }}</span>
                      </div>
                      <el-switch
                        v-model="rule.enabled"
                        size="small"
                        @change="updateRule(rule)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 文件上传区域 -->
            <div class="panel-section upload-section">
              <div class="section-header">
                <h3><i class="fas fa-cloud-upload-alt"></i> 文件上传</h3>
                <el-button
                  type="primary"
                  size="small"
                  @click="handleFileUpload"
                  :disabled="!selectedTemplate"
                >
                  <i class="fas fa-plus"></i>
                  添加文件
                </el-button>
              </div>

              <!-- 紧凑的上传区域 -->
              <div class="upload-area">
                <el-upload
                  class="compact-upload"
                  drag
                  :auto-upload="false"
                  multiple
                  accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.txt"
                  :show-file-list="false"
                  @change="handleFileChange"
                >
                  <div class="upload-content">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>拖拽文件到此处或点击上传</p>
                    <span class="upload-tip">支持 Excel、CSV、PDF、Word 等格式</span>
                  </div>
                </el-upload>

                <!-- 文件列表 -->
                <div v-if="uploadedFiles.length > 0" class="file-list">
                  <div class="file-list-header">
                    <span>已选择文件 ({{ uploadedFiles.length }})</span>
                    <el-button type="text" size="small" @click="clearAllFiles">
                      <i class="fas fa-trash"></i>
                      清空
                    </el-button>
                  </div>
                  <div class="file-items">
                    <div
                      v-for="(file, index) in uploadedFiles"
                      :key="index"
                      class="file-item"
                    >
                      <div class="file-info">
                        <i class="fas fa-file"></i>
                        <div class="file-details">
                          <span class="file-name">{{ file.name }}</span>
                          <span class="file-size">{{ formatFileSize(file.size) }}</span>
                        </div>
                      </div>
                      <div class="file-actions">
                        <el-button type="text" size="small" @click="previewFile(file)">
                          <i class="fas fa-eye"></i>
                        </el-button>
                        <el-button type="text" size="small" @click="removeFile(index)">
                          <i class="fas fa-times"></i>
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作按钮区域 -->
            <div v-if="selectedTemplate && uploadedFiles.length > 0" class="panel-section action-section">
              <div class="action-buttons">
                <el-button type="primary" block @click="startCleaning">
                  <i class="fas fa-play"></i>
                  开始清洗
                </el-button>
                <el-button type="success" block @click="analyzeFiles">
                  <i class="fas fa-chart-line"></i>
                  数据分析
                </el-button>
              </div>
            </div>






          </div>

          <!-- 中间：AI问答互动区域 -->
          <div class="center-panel">
            <div class="chat-container">
              <div class="chat-header">
                <h3><i class="fas fa-robot"></i> AI 数据清洗助手</h3>
                <div class="header-actions">
                  <el-button type="text" size="small" @click="clearChat">
                    <i class="fas fa-trash"></i> 清空对话
                  </el-button>
                  <el-button type="primary" size="small">
                    <i class="fas fa-download"></i> 导出对话
                  </el-button>
                </div>
              </div>

              <!-- 聊天消息区域 -->
              <div class="chat-messages">
                <div class="message-list">
                  <!-- AI欢迎消息 -->
                  <div class="message ai-message">
                    <div class="message-avatar">
                      <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                      <div class="message-text">
                        您好！我是AI数据清洗助手。我可以帮助您：
                        <ul>
                          <li>🔍 分析数据质量问题</li>
                          <li>⚙️ 推荐合适的清洗规则</li>
                          <li>📊 解释清洗结果</li>
                          <li>💡 提供数据优化建议</li>
                        </ul>
                        请选择数据模板并告诉我您的需求！
                      </div>
                      <div class="message-time">刚刚</div>
                    </div>
                  </div>

                  <!-- 用户消息示例 -->
                  <div class="message user-message">
                    <div class="message-content">
                      <div class="message-text">
                        我有一份客户数据，包含姓名、电话、邮箱等信息，但是数据质量不太好，有很多空值和格式不统一的问题，应该怎么处理？
                      </div>
                      <div class="message-time">2分钟前</div>
                    </div>
                    <div class="message-avatar">
                      <i class="fas fa-user"></i>
                    </div>
                  </div>

                  <!-- AI回复示例 -->
                  <div class="message ai-message">
                    <div class="message-avatar">
                      <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                      <div class="message-text">
                        根据您的描述，我建议使用"客户信息清洗"模板。该模板包含以下规则：
                        <div class="suggestion-rules">
                          <div class="rule-suggestion">
                            <i class="fas fa-check-circle"></i>
                            <span>手机号格式验证和标准化</span>
                          </div>
                          <div class="rule-suggestion">
                            <i class="fas fa-check-circle"></i>
                            <span>邮箱格式检查和修正</span>
                          </div>
                          <div class="rule-suggestion">
                            <i class="fas fa-check-circle"></i>
                            <span>空值处理策略</span>
                          </div>
                          <div class="rule-suggestion">
                            <i class="fas fa-check-circle"></i>
                            <span>姓名格式标准化</span>
                          </div>
                        </div>
                        您可以在左侧查看详细规则配置，需要我帮您调整哪些规则吗？
                      </div>
                      <div class="message-time">1分钟前</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 输入区域 -->
              <div class="chat-input">
                <div class="input-container">
                  <el-input
                    type="textarea"
                    :rows="3"
                    placeholder="请输入您的清洗需求或问题..."
                    v-model="chatInput"
                    @keydown.ctrl.enter="sendMessage"
                  />
                  <div class="input-actions">
                    <div class="quick-commands">
                      <el-button size="mini" type="text" @click="insertQuickCommand('分析数据质量')">
                        分析数据质量
                      </el-button>
                      <el-button size="mini" type="text" @click="insertQuickCommand('推荐清洗规则')">
                        推荐清洗规则
                      </el-button>
                      <el-button size="mini" type="text" @click="insertQuickCommand('解释清洗结果')">
                        解释清洗结果
                      </el-button>
                    </div>
                    <div class="send-area">
                      <span class="input-tip">Ctrl+Enter 发送</span>
                      <el-button type="primary" @click="sendMessage" :disabled="!chatInput.trim()">
                        <i class="fas fa-paper-plane"></i>
                        发送
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：AI问答互动区域 -->
          <div class="right-panel">
            <div class="chat-container">
              <div class="chat-header">
                <h3><i class="el-icon-chat-dot-round"></i> AI 清洗助手</h3>
                <div class="header-actions">
                  <el-button type="text" size="small">清空对话</el-button>
                  <el-button type="primary" size="small">
                    <i class="el-icon-magic-stick"></i> 开始清洗
                  </el-button>
                </div>
              </div>

              <div class="chat-messages">
                <div class="message assistant">
                  <div class="message-avatar">
                    <i class="el-icon-cpu"></i>
                  </div>
                  <div class="message-content">
                    <div class="message-text">您好！我是AI清洗助手。我已检测到您上传的2个文件：<br/><br/>
                    📄 <strong>customer_data.xlsx</strong><br/>
                    • 发现 50个空值字段<br/>
                    • 检测到 25条重复记录<br/>
                    • 发现 15个格式异常<br/><br/>
                    📄 <strong>sales_report.csv</strong><br/>
                    • 发现 30个空值字段<br/>
                    • 检测到 10条重复记录<br/><br/>
                    建议使用"通用数据清洗"模板进行处理，是否开始清洗？</div>
                    <div class="message-time">09:00:00</div>
                  </div>
                </div>
              </div>

              <div class="chat-input">
                <el-input
                  type="textarea"
                  :rows="3"
                  placeholder="请输入您的清洗需求或问题..."
                />
                <div class="input-actions">
                  <div class="quick-commands">
                    <el-tag class="command-tag">清洗空值数据</el-tag>
                    <el-tag class="command-tag">删除重复记录</el-tag>
                    <el-tag class="command-tag">标准化日期格式</el-tag>
                    <el-tag class="command-tag">检测异常值</el-tag>
                    <el-tag class="command-tag">验证数据完整性</el-tag>
                  </div>
                  <el-button type="primary">
                    <i class="el-icon-s-promotion"></i> 发送
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 过程展示页面 -->
      <div v-show="activeTab === 'process'" class="tab-content process-workspace">
        <div class="process-layout">
          <!-- 上半部分：6步骤进度展示 -->
          <div class="process-overview">
            <el-card class="process-card">
              <template #header>
                <div class="card-header">
                  <h3><i class="el-icon-loading"></i> 数据清洗处理进度</h3>
                  <div class="header-actions">
                    <el-button type="text" @click="resetProcess">重置进度</el-button>
                    <el-button type="primary" size="small">
                      <i class="el-icon-refresh"></i> 刷新状态
                    </el-button>
                  </div>
                </div>
              </template>

              <!-- 总体进度条 -->
              <div class="overall-progress">
                <div class="progress-info">
                  <span class="progress-label">总体进度</span>
                  <span class="progress-percentage">33%</span>
                </div>
                <el-progress :percentage="33" :stroke-width="8" />
                <div class="progress-details">
                  <span>当前阶段：数据解析</span>
                  <span>预计剩余时间：5分钟</span>
                </div>
              </div>

              <!-- 6步骤详细进度 -->
              <div class="steps-container">
                <div class="step-item completed">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <h4>数据上传</h4>
                    <p>文件上传与结构分析</p>
                    <div class="step-result">
                      <i class="el-icon-circle-check"></i>
                      <span>成功上传 1,000 条记录</span>
                    </div>
                    <div class="step-time">耗时：30秒</div>
                  </div>
                </div>

                <div class="step-item processing">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <h4>数据解析</h4>
                    <p>数据格式解析与验证</p>
                    <div class="step-progress">
                      <el-progress :percentage="75" :stroke-width="6" />
                      <span class="progress-text">75% - 正在解析字段结构</span>
                    </div>
                    <div class="step-details">
                      <span>已解析：750/1000 条记录</span>
                      <span>发现问题：90 个</span>
                    </div>
                  </div>
                </div>

                <div class="step-item pending">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <h4>数据清洗</h4>
                    <p>应用清洗规则处理数据</p>
                    <div class="step-waiting">
                      <i class="el-icon-time"></i>
                      <span>等待上一步骤完成</span>
                    </div>
                  </div>
                </div>

                <div class="step-item pending">
                  <div class="step-number">4</div>
                  <div class="step-content">
                    <h4>信息提取</h4>
                    <p>提取关键信息与特征</p>
                  </div>
                </div>

                <div class="step-item pending">
                  <div class="step-number">5</div>
                  <div class="step-content">
                    <h4>结果汇总</h4>
                    <p>生成清洗结果报告</p>
                  </div>
                </div>

                <div class="step-item pending">
                  <div class="step-number">6</div>
                  <div class="step-content">
                    <h4>AI分析</h4>
                    <p>智能分析与建议生成</p>
                  </div>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 下半部分：实时数据调取和监控 -->
          <div class="monitoring-section">
            <el-row :gutter="24">
              <!-- 实时日志 -->
              <el-col :span="12">
                <el-card class="log-card">
                  <template #header>
                    <div class="card-header">
                      <h4><i class="el-icon-document"></i> 实时处理日志</h4>
                      <el-button type="text" size="small">清空日志</el-button>
                    </div>
                  </template>

                  <div class="log-container">
                    <div class="log-item info">
                      <span class="log-time">09:00:01</span>
                      <span class="log-level">INFO</span>
                      <span class="log-message">开始处理文件：customer_data.xlsx</span>
                    </div>
                    <div class="log-item info">
                      <span class="log-time">09:00:02</span>
                      <span class="log-level">INFO</span>
                      <span class="log-message">检测到 1,000 条记录，15个字段</span>
                    </div>
                    <div class="log-item warning">
                      <span class="log-time">09:00:03</span>
                      <span class="log-level">WARN</span>
                      <span class="log-message">发现 50 个空值字段</span>
                    </div>
                    <div class="log-item warning">
                      <span class="log-time">09:00:04</span>
                      <span class="log-level">WARN</span>
                      <span class="log-message">检测到 25 条重复记录</span>
                    </div>
                    <div class="log-item info">
                      <span class="log-time">09:00:05</span>
                      <span class="log-level">INFO</span>
                      <span class="log-message">应用清洗规则：去除空值</span>
                    </div>
                    <div class="log-item success">
                      <span class="log-time">09:00:06</span>
                      <span class="log-level">SUCCESS</span>
                      <span class="log-message">成功处理 750 条记录</span>
                    </div>
                  </div>
                </el-card>
              </el-col>

              <!-- 数据统计 -->
              <el-col :span="12">
                <el-card class="stats-card">
                  <template #header>
                    <h4><i class="el-icon-data-analysis"></i> 实时数据统计</h4>
                  </template>

                  <div class="stats-grid">
                    <div class="stat-item">
                      <div class="stat-icon processing">
                        <i class="el-icon-loading"></i>
                      </div>
                      <div class="stat-content">
                        <h4>750</h4>
                        <p>已处理记录</p>
                        <span class="stat-change">+250</span>
                      </div>
                    </div>

                    <div class="stat-item">
                      <div class="stat-icon warning">
                        <i class="el-icon-warning"></i>
                      </div>
                      <div class="stat-content">
                        <h4>90</h4>
                        <p>发现问题</p>
                        <span class="stat-change">+15</span>
                      </div>
                    </div>

                    <div class="stat-item">
                      <div class="stat-icon success">
                        <i class="el-icon-circle-check"></i>
                      </div>
                      <div class="stat-content">
                        <h4>660</h4>
                        <p>清洗完成</p>
                        <span class="stat-change">+200</span>
                      </div>
                    </div>

                    <div class="stat-item">
                      <div class="stat-icon info">
                        <i class="el-icon-time"></i>
                      </div>
                      <div class="stat-content">
                        <h4>2:30</h4>
                        <p>处理时间</p>
                        <span class="stat-change">实时</span>
                      </div>
                    </div>
                  </div>

                  <!-- 质量指标 -->
                  <div class="quality-metrics">
                    <h5>数据质量指标</h5>
                    <div class="metric-item">
                      <span class="metric-label">完整性</span>
                      <el-progress :percentage="88" :stroke-width="6" />
                      <span class="metric-value">88%</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">准确性</span>
                      <el-progress :percentage="92" :stroke-width="6" />
                      <span class="metric-value">92%</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">一致性</span>
                      <el-progress :percentage="85" :stroke-width="6" />
                      <span class="metric-value">85%</span>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>

      <!-- 清洗结果页面 -->
      <div v-show="activeTab === 'results'" class="tab-content results-workspace">
        <div class="results-layout">
          <!-- 上半部分：结果概览 -->
          <div class="results-overview">
            <el-row :gutter="24">
              <!-- 文件对比展示 -->
              <el-col :span="16">
                <el-card class="comparison-card">
                  <template #header>
                    <div class="card-header">
                      <h3><i class="el-icon-document"></i> 文件清洗对比</h3>
                      <div class="header-actions">
                        <el-button type="primary" size="small">
                          <i class="el-icon-download"></i> 下载清洗后文件
                        </el-button>
                        <el-button type="success" size="small">
                          <i class="el-icon-share"></i> 分享结果
                        </el-button>
                      </div>
                    </div>
                  </template>

                  <div class="file-comparison">
                    <!-- 原始文件 -->
                    <div class="comparison-item">
                      <h4>原始文件</h4>
                      <div class="file-info">
                        <div class="file-icon original">
                          <i class="el-icon-document"></i>
                        </div>
                        <div class="file-details">
                          <p class="file-name">customer_data.xlsx</p>
                          <p class="file-stats">1,000 条记录 | 2.5MB</p>
                          <div class="quality-indicators">
                            <el-tag type="danger" size="mini">空值: 50</el-tag>
                            <el-tag type="warning" size="mini">重复: 25</el-tag>
                            <el-tag type="info" size="mini">异常: 15</el-tag>
                          </div>
                          <div class="quality-score">
                            <span class="score-label">质量评分:</span>
                            <span class="score-value poor">72%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 箭头指示 -->
                    <div class="comparison-arrow">
                      <i class="el-icon-right" style="font-size: 32px; color: #409eff;"></i>
                      <div class="process-info">
                        <span>AI清洗处理</span>
                        <span>耗时: 2分30秒</span>
                      </div>
                    </div>

                    <!-- 清洗后文件 -->
                    <div class="comparison-item">
                      <h4>清洗后文件</h4>
                      <div class="file-info">
                        <div class="file-icon cleaned">
                          <i class="el-icon-circle-check"></i>
                        </div>
                        <div class="file-details">
                          <p class="file-name">customer_data_cleaned.xlsx</p>
                          <p class="file-stats">960 条记录 | 2.3MB</p>
                          <div class="quality-indicators">
                            <el-tag type="success" size="mini">空值: 0</el-tag>
                            <el-tag type="success" size="mini">重复: 0</el-tag>
                            <el-tag type="success" size="mini">异常: 2</el-tag>
                          </div>
                          <div class="quality-score">
                            <span class="score-label">质量评分:</span>
                            <span class="score-value excellent">95%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>

              <!-- 清洗统计 -->
              <el-col :span="8">
                <el-card class="stats-card">
                  <template #header>
                    <h3><i class="el-icon-data-analysis"></i> 清洗统计</h3>
                  </template>

                  <div class="cleaning-stats">
                    <div class="stat-item removed">
                      <div class="stat-icon">
                        <i class="el-icon-delete"></i>
                      </div>
                      <div class="stat-content">
                        <h4>40</h4>
                        <p>删除记录</p>
                        <span class="stat-desc">空值和重复记录</span>
                      </div>
                    </div>

                    <div class="stat-item modified">
                      <div class="stat-icon">
                        <i class="el-icon-edit"></i>
                      </div>
                      <div class="stat-content">
                        <h4>120</h4>
                        <p>修正记录</p>
                        <span class="stat-desc">格式标准化</span>
                      </div>
                    </div>

                    <div class="stat-item added">
                      <div class="stat-icon">
                        <i class="el-icon-plus"></i>
                      </div>
                      <div class="stat-content">
                        <h4>0</h4>
                        <p>补充记录</p>
                        <span class="stat-desc">数据补全</span>
                      </div>
                    </div>

                    <div class="stat-item time">
                      <div class="stat-icon">
                        <i class="el-icon-time"></i>
                      </div>
                      <div class="stat-content">
                        <h4>2:30</h4>
                        <p>处理时间</p>
                        <span class="stat-desc">自动化处理</span>
                      </div>
                    </div>
                  </div>

                  <!-- 应用的模板信息 -->
                  <div class="applied-template">
                    <h4>应用的清洗模板</h4>
                    <div class="template-info">
                      <div class="template-badge">
                        <i class="el-icon-setting"></i>
                        <span>通用数据清洗</span>
                      </div>
                      <div class="template-rules">
                        <el-tag size="mini">去除空值</el-tag>
                        <el-tag size="mini">删除重复项</el-tag>
                        <el-tag size="mini">格式标准化</el-tag>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <!-- 下半部分：详细报告 -->
          <div class="detailed-report">
            <el-card class="report-card">
              <template #header>
                <div class="card-header">
                  <h3><i class="el-icon-document-copy"></i> 数据清洗详细报告</h3>
                  <div class="header-actions">
                    <el-button type="text" size="small">预览报告</el-button>
                    <el-button type="primary" size="small">
                      <i class="el-icon-download"></i> 导出PDF
                    </el-button>
                    <el-button type="success" size="small">
                      <i class="el-icon-share"></i> 生成链接
                    </el-button>
                  </div>
                </div>
              </template>

              <div class="report-content">
                <el-tabs type="border-card">
                  <el-tab-pane label="执行摘要" name="summary">
                    <div class="report-section">
                      <h4>清洗执行摘要</h4>
                      <div class="summary-content">
                        <p><strong>处理时间：</strong>2024-01-15 14:30:00 - 14:32:30</p>
                        <p><strong>处理文件：</strong>customer_data.xlsx</p>
                        <p><strong>原始记录数：</strong>1,000 条</p>
                        <p><strong>清洗后记录数：</strong>960 条</p>
                        <p><strong>数据质量提升：</strong>从 72% 提升到 95%</p>

                        <div class="key-metrics">
                          <div class="metric-item">
                            <span class="metric-label">完整性</span>
                            <div class="metric-progress">
                              <el-progress :percentage="98" :stroke-width="8" />
                            </div>
                            <span class="metric-value">98%</span>
                          </div>
                          <div class="metric-item">
                            <span class="metric-label">准确性</span>
                            <div class="metric-progress">
                              <el-progress :percentage="96" :stroke-width="8" />
                            </div>
                            <span class="metric-value">96%</span>
                          </div>
                          <div class="metric-item">
                            <span class="metric-label">一致性</span>
                            <div class="metric-progress">
                              <el-progress :percentage="94" :stroke-width="8" />
                            </div>
                            <span class="metric-value">94%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="问题分析" name="issues">
                    <div class="report-section">
                      <h4>数据质量问题分析</h4>
                      <div class="issues-analysis">
                        <el-table :data="qualityIssues" style="width: 100%">
                          <el-table-column prop="type" label="问题类型" width="120">
                            <template #default="scope">
                              <el-tag :type="getSeverityType(scope.row.severity)" size="small">
                                {{ scope.row.type }}
                              </el-tag>
                            </template>
                          </el-table-column>
                          <el-table-column prop="count" label="发现数量" width="100" />
                          <el-table-column prop="severity" label="严重程度" width="100">
                            <template #default="scope">
                              <el-tag :type="getSeverityType(scope.row.severity)" size="mini">
                                {{ scope.row.severity }}
                              </el-tag>
                            </template>
                          </el-table-column>
                          <el-table-column prop="action" label="处理方式" />
                          <el-table-column prop="result" label="处理结果" width="120">
                            <template #default="scope">
                              <el-tag type="success" size="mini">已解决</el-tag>
                            </template>
                          </el-table-column>
                        </el-table>
                      </div>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="AI洞察" name="insights">
                    <div class="report-section">
                      <h4>AI智能分析与建议</h4>
                      <div class="ai-insights">
                        <div class="insight-item">
                          <div class="insight-header">
                            <i class="el-icon-lightbulb"></i>
                            <h5>数据质量评估</h5>
                          </div>
                          <p>整体数据质量良好，主要问题集中在空值和重复值处理上。经过清洗后，数据完整性和准确性显著提升。</p>
                          <div class="recommendations">
                            <h6>改进建议：</h6>
                            <ul>
                              <li>建议在数据录入阶段增加验证规则，减少空值产生</li>
                              <li>定期进行数据质量检查，及时发现和处理问题</li>
                              <li>建立数据质量监控机制，设置质量阈值告警</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-card>
          </div>
        </div>
      </div>

      <!-- 数据治理页面 -->
      <div v-show="activeTab === 'governance'" class="tab-content governance-workspace">
        <div class="governance-layout">
          <!-- 上半部分：知识库管理 -->
          <div class="knowledge-section">
            <el-row :gutter="24">
              <!-- 数据模式识别 -->
              <el-col :span="12">
                <el-card class="knowledge-card">
                  <template #header>
                    <div class="card-header">
                      <h3><i class="el-icon-search"></i> 数据模式识别</h3>
                      <div class="header-actions">
                        <el-button type="primary" size="small">
                          <i class="el-icon-refresh"></i> 重新分析
                        </el-button>
                        <el-button type="success" size="small">
                          <i class="el-icon-plus"></i> 添加模式
                        </el-button>
                      </div>
                    </div>
                  </template>

                  <div class="knowledge-content">
                    <el-tabs type="border-card">
                      <el-tab-pane label="识别模式" name="patterns">
                        <div class="patterns-list">
                          <div class="pattern-item">
                            <div class="pattern-header">
                              <h4>客户手机号模式</h4>
                              <div class="pattern-badges">
                                <el-tag type="success" size="small">高置信度</el-tag>
                                <el-tag type="info" size="small">95%</el-tag>
                              </div>
                            </div>
                            <p class="pattern-desc">标准11位手机号格式：1[3-9]xxxxxxxxx</p>
                            <div class="pattern-stats">
                              <span class="stat-item">频率: 95%</span>
                              <span class="stat-item">置信度: 98%</span>
                              <span class="stat-item">样本: 950/1000</span>
                            </div>
                            <div class="pattern-actions">
                              <el-button type="text" size="small">查看详情</el-button>
                              <el-button type="text" size="small">应用规则</el-button>
                            </div>
                          </div>

                          <div class="pattern-item">
                            <div class="pattern-header">
                              <h4>邮箱地址模式</h4>
                              <div class="pattern-badges">
                                <el-tag type="success" size="small">高置信度</el-tag>
                                <el-tag type="info" size="small">88%</el-tag>
                              </div>
                            </div>
                            <p class="pattern-desc">标准邮箱格式：xxx@xxx.xxx</p>
                            <div class="pattern-stats">
                              <span class="stat-item">频率: 88%</span>
                              <span class="stat-item">置信度: 92%</span>
                              <span class="stat-item">样本: 880/1000</span>
                            </div>
                            <div class="pattern-actions">
                              <el-button type="text" size="small">查看详情</el-button>
                              <el-button type="text" size="small">应用规则</el-button>
                            </div>
                          </div>

                          <div class="pattern-item">
                            <div class="pattern-header">
                              <h4>身份证号模式</h4>
                              <div class="pattern-badges">
                                <el-tag type="warning" size="small">中置信度</el-tag>
                                <el-tag type="info" size="small">76%</el-tag>
                              </div>
                            </div>
                            <p class="pattern-desc">18位身份证号格式：xxxxxxxxxxxxxxxxxx</p>
                            <div class="pattern-stats">
                              <span class="stat-item">频率: 76%</span>
                              <span class="stat-item">置信度: 85%</span>
                              <span class="stat-item">样本: 760/1000</span>
                            </div>
                            <div class="pattern-actions">
                              <el-button type="text" size="small">查看详情</el-button>
                              <el-button type="text" size="small">需要验证</el-button>
                            </div>
                          </div>
                        </div>
                      </el-tab-pane>

                      <el-tab-pane label="规则库" name="rules">
                        <div class="rules-library">
                          <div class="rule-item">
                            <div class="rule-header">
                              <h4>手机号验证规则</h4>
                              <div class="rule-badges">
                                <el-tag type="primary" size="small">系统规则</el-tag>
                                <el-tag type="success" size="small">98%成功率</el-tag>
                              </div>
                            </div>
                            <p class="rule-desc">验证手机号格式的正确性，支持三大运营商号段</p>
                            <div class="rule-effectiveness">
                              <span class="effectiveness-item">使用次数: 156</span>
                              <span class="effectiveness-item">成功率: 98%</span>
                              <span class="effectiveness-item">最后使用: 2小时前</span>
                            </div>
                          </div>

                          <div class="rule-item">
                            <div class="rule-header">
                              <h4>邮箱格式验证</h4>
                              <div class="rule-badges">
                                <el-tag type="primary" size="small">系统规则</el-tag>
                                <el-tag type="success" size="small">95%成功率</el-tag>
                              </div>
                            </div>
                            <p class="rule-desc">验证邮箱地址格式，支持国际域名</p>
                            <div class="rule-effectiveness">
                              <span class="effectiveness-item">使用次数: 89</span>
                              <span class="effectiveness-item">成功率: 95%</span>
                              <span class="effectiveness-item">最后使用: 1天前</span>
                            </div>
                          </div>
                        </div>
                      </el-tab-pane>
                    </el-tabs>
                  </div>
                </el-card>
              </el-col>

              <!-- 质量监控仪表板 -->
              <el-col :span="12">
                <el-card class="metrics-card">
                  <template #header>
                    <div class="card-header">
                      <h3><i class="el-icon-data-board"></i> 数据质量监控</h3>
                      <div class="header-actions">
                        <el-button type="text" size="small">设置阈值</el-button>
                        <el-button type="primary" size="small">
                          <i class="el-icon-refresh"></i> 刷新数据
                        </el-button>
                      </div>
                    </div>
                  </template>

                  <div class="metrics-dashboard">
                    <el-row :gutter="16">
                      <el-col :span="8">
                        <div class="metric-card">
                          <h4>数据完整性</h4>
                          <div class="metric-value">98.5%</div>
                          <div class="metric-trend up">
                            <i class="el-icon-top"></i>
                            <span>+2.3%</span>
                          </div>
                          <el-progress :percentage="98.5" :stroke-width="6" />
                        </div>
                      </el-col>

                      <el-col :span="8">
                        <div class="metric-card">
                          <h4>数据准确性</h4>
                          <div class="metric-value">96.2%</div>
                          <div class="metric-trend up">
                            <i class="el-icon-top"></i>
                            <span>+1.8%</span>
                          </div>
                          <el-progress :percentage="96.2" :stroke-width="6" />
                        </div>
                      </el-col>

                      <el-col :span="8">
                        <div class="metric-card">
                          <h4>数据一致性</h4>
                          <div class="metric-value">94.7%</div>
                          <div class="metric-trend down">
                            <i class="el-icon-bottom"></i>
                            <span>-0.5%</span>
                          </div>
                          <el-progress :percentage="94.7" :stroke-width="6" />
                        </div>
                      </el-col>
                    </el-row>

                    <!-- 质量趋势图 -->
                    <div class="quality-trends">
                      <h4>质量趋势分析</h4>
                      <div class="trend-chart">
                        <div class="chart-placeholder">
                          <i class="el-icon-data-line" style="font-size: 48px; color: #409eff;"></i>
                          <p>质量趋势图表</p>
                          <p style="font-size: 12px; color: #666;">显示过去30天的数据质量变化趋势</p>
                        </div>
                      </div>
                    </div>

                    <!-- 质量告警 -->
                    <div class="quality-alerts">
                      <h4>质量告警</h4>
                      <div class="alert-list">
                        <div class="alert-item warning">
                          <i class="el-icon-warning"></i>
                          <div class="alert-content">
                            <span class="alert-title">数据一致性下降</span>
                            <span class="alert-desc">客户表中发现格式不一致的记录</span>
                            <span class="alert-time">2小时前</span>
                          </div>
                        </div>

                        <div class="alert-item info">
                          <i class="el-icon-info"></i>
                          <div class="alert-content">
                            <span class="alert-title">新模式识别</span>
                            <span class="alert-desc">发现新的数据模式，建议添加验证规则</span>
                            <span class="alert-time">1天前</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <!-- 下半部分：知识应用与管理 -->
          <div class="knowledge-application">
            <el-card class="application-card">
              <template #header>
                <div class="card-header">
                  <h3><i class="el-icon-magic-stick"></i> 知识应用与管理</h3>
                  <div class="header-actions">
                    <el-button type="success" size="small">
                      <i class="el-icon-plus"></i> 创建知识规则
                    </el-button>
                    <el-button type="primary" size="small">
                      <i class="el-icon-upload"></i> 导入知识库
                    </el-button>
                  </div>
                </div>
              </template>

              <div class="application-content">
                <el-tabs type="border-card">
                  <el-tab-pane label="知识提炼" name="extraction">
                    <div class="extraction-section">
                      <div class="extraction-controls">
                        <el-button type="primary">
                          <i class="el-icon-cpu"></i> 智能提炼知识
                        </el-button>
                        <el-button type="success">
                          <i class="el-icon-view"></i> 预览提炼结果
                        </el-button>
                        <el-button type="warning">
                          <i class="el-icon-setting"></i> 配置提炼规则
                        </el-button>
                      </div>

                      <div class="extraction-results">
                        <h4>最近提炼的知识</h4>
                        <el-table :data="extractedKnowledge" style="width: 100%">
                          <el-table-column prop="name" label="知识名称" width="200" />
                          <el-table-column prop="type" label="类型" width="120">
                            <template #default="scope">
                              <el-tag :type="getKnowledgeType(scope.row.type)" size="small">
                                {{ scope.row.type }}
                              </el-tag>
                            </template>
                          </el-table-column>
                          <el-table-column prop="confidence" label="置信度" width="100">
                            <template #default="scope">
                              <span :class="getConfidenceClass(scope.row.confidence)">
                                {{ scope.row.confidence }}%
                              </span>
                            </template>
                          </el-table-column>
                          <el-table-column prop="source" label="来源数据" />
                          <el-table-column prop="createTime" label="提炼时间" width="150" />
                          <el-table-column label="操作" width="150">
                            <template #default="scope">
                              <el-button type="text" size="small">应用</el-button>
                              <el-button type="text" size="small">编辑</el-button>
                              <el-button type="text" size="small">删除</el-button>
                            </template>
                          </el-table-column>
                        </el-table>
                      </div>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="规则管理" name="management">
                    <div class="management-section">
                      <div class="rule-categories">
                        <h4>规则分类管理</h4>
                        <el-row :gutter="16">
                          <el-col :span="6">
                            <div class="category-card">
                              <div class="category-icon">
                                <i class="el-icon-phone"></i>
                              </div>
                              <div class="category-info">
                                <h5>联系方式验证</h5>
                                <p>12个规则</p>
                              </div>
                            </div>
                          </el-col>

                          <el-col :span="6">
                            <div class="category-card">
                              <div class="category-icon">
                                <i class="el-icon-user"></i>
                              </div>
                              <div class="category-info">
                                <h5>身份信息验证</h5>
                                <p>8个规则</p>
                              </div>
                            </div>
                          </el-col>

                          <el-col :span="6">
                            <div class="category-card">
                              <div class="category-icon">
                                <i class="el-icon-money"></i>
                              </div>
                              <div class="category-info">
                                <h5>财务数据验证</h5>
                                <p>15个规则</p>
                              </div>
                            </div>
                          </el-col>

                          <el-col :span="6">
                            <div class="category-card">
                              <div class="category-icon">
                                <i class="el-icon-date"></i>
                              </div>
                              <div class="category-info">
                                <h5>日期时间验证</h5>
                                <p>6个规则</p>
                              </div>
                            </div>
                          </el-col>
                        </el-row>
                      </div>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="应用统计" name="statistics">
                    <div class="statistics-section">
                      <h4>知识应用统计</h4>
                      <div class="stats-overview">
                        <el-row :gutter="20">
                          <el-col :span="6">
                            <div class="overview-card">
                              <div class="overview-number">156</div>
                              <div class="overview-label">总规则数</div>
                              <div class="overview-change">+12 本月</div>
                            </div>
                          </el-col>

                          <el-col :span="6">
                            <div class="overview-card">
                              <div class="overview-number">2,340</div>
                              <div class="overview-label">应用次数</div>
                              <div class="overview-change">+156 本周</div>
                            </div>
                          </el-col>

                          <el-col :span="6">
                            <div class="overview-card">
                              <div class="overview-number">96.8%</div>
                              <div class="overview-label">平均成功率</div>
                              <div class="overview-change">+1.2% 本月</div>
                            </div>
                          </el-col>

                          <el-col :span="6">
                            <div class="overview-card">
                              <div class="overview-number">45</div>
                              <div class="overview-label">活跃规则</div>
                              <div class="overview-change">+3 本周</div>
                            </div>
                          </el-col>
                        </el-row>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'DataCleaningSimple',
  setup() {
    const activeTab = ref('cleaning')

    // 聊天相关变量
    const chatInput = ref('')

    // 文件上传相关变量
    const uploadedFiles = ref([])

    // 数据模板配置
    const dataTemplates = ref([
      {
        id: 'general',
        name: '常规问题文件',
        description: '适用于一般数据清洗和质量检查',
        iconClass: 'fas fa-file-alt',
        fields: ['问题描述', '发生时间', '责任人', '状态', '优先级'],
        rules: [
          { id: 'r1', name: '空值检查', description: '检查必填字段是否为空', type: 'validation', enabled: true },
          { id: 'r2', name: '重复数据', description: '识别并处理重复记录', type: 'deduplication', enabled: true },
          { id: 'r3', name: '格式标准化', description: '统一日期、时间格式', type: 'formatting', enabled: true },
          { id: 'r4', name: '数据类型验证', description: '验证字段数据类型正确性', type: 'validation', enabled: true }
        ]
      },
      {
        id: '8d_report',
        name: '8D报告模板',
        description: '专用于8D问题解决报告数据处理',
        iconClass: 'fas fa-clipboard-list',
        fields: ['D1团队', 'D2问题描述', 'D3临时措施', 'D4根本原因', 'D5永久纠正措施', 'D6实施验证', 'D7预防措施', 'D8团队祝贺'],
        rules: [
          { id: 'r5', name: '8D步骤完整性', description: '检查8个步骤是否完整', type: 'validation', enabled: true },
          { id: 'r6', name: '时间逻辑验证', description: '验证各步骤时间逻辑关系', type: 'validation', enabled: true },
          { id: 'r7', name: '责任人规范', description: '标准化责任人姓名格式', type: 'formatting', enabled: true },
          { id: 'r8', name: '状态一致性', description: '检查状态字段一致性', type: 'validation', enabled: true },
          { id: 'r9', name: '措施有效性', description: '验证措施描述完整性', type: 'validation', enabled: false }
        ]
      },
      {
        id: 'quality_audit',
        name: '质量审核报告',
        description: '质量管理体系审核数据模板',
        iconClass: 'fas fa-search',
        fields: ['审核项目', '审核标准', '发现问题', '整改措施', '完成时间', '验证结果'],
        rules: [
          { id: 'r10', name: '审核标准验证', description: '验证审核标准格式', type: 'validation', enabled: true },
          { id: 'r11', name: '问题分类', description: '自动分类发现的问题', type: 'classification', enabled: true },
          { id: 'r12', name: '整改时限检查', description: '检查整改时限合理性', type: 'validation', enabled: true },
          { id: 'r13', name: '验证结果标准化', description: '统一验证结果格式', type: 'formatting', enabled: true }
        ]
      },
      {
        id: 'supplier_eval',
        name: '供应商评估',
        description: '供应商绩效评估数据处理',
        iconClass: 'fas fa-industry',
        fields: ['供应商名称', '评估周期', '质量得分', '交付得分', '服务得分', '综合评级'],
        rules: [
          { id: 'r14', name: '供应商名称标准化', description: '统一供应商名称格式', type: 'formatting', enabled: true },
          { id: 'r15', name: '得分范围验证', description: '验证得分在有效范围内', type: 'validation', enabled: true },
          { id: 'r16', name: '评级计算验证', description: '验证综合评级计算正确性', type: 'calculation', enabled: true },
          { id: 'r17', name: '历史数据对比', description: '与历史数据进行对比分析', type: 'analysis', enabled: false }
        ]
      }
    ])

    const selectedTemplate = ref(null)
    const rulesExpanded = ref(false)

    // 主要功能页面配置
    const tabList = ref([
      {
        key: 'cleaning',
        title: '文件清洗',
        description: '智能数据清洗处理',
        iconClass: 'fas fa-broom'
      },
      {
        key: 'process',
        title: '过程展示',
        description: '实时监控处理进度',
        iconClass: 'fas fa-tasks'
      },
      {
        key: 'results',
        title: '清洗结果',
        description: '清洗报告与结果展示',
        iconClass: 'fas fa-chart-bar'
      },
      {
        key: 'governance',
        title: '数据治理',
        description: '知识提炼与管理应用',
        iconClass: 'fas fa-shield-alt'
      }
    ])

    // 方法定义
    const switchTab = (tab) => {
      activeTab.value = tab
      ElMessage.success(`已切换到${getTabName(tab)}`)
    }

    const getTabName = (tab) => {
      const names = {
        cleaning: '文件清洗',
        process: '过程展示',
        results: '清洗结果',
        governance: '数据治理'
      }
      return names[tab] || tab
    }

    // 模板选择方法
    const selectTemplate = (template) => {
      selectedTemplate.value = template
      ElMessage.success(`已选择模板：${template.name}`)
    }

    // 切换规则展开状态
    const toggleRulesExpanded = () => {
      rulesExpanded.value = !rulesExpanded.value
    }

    // 更新规则状态
    const updateRule = (rule) => {
      ElMessage.info(`规则"${rule.name}"已${rule.enabled ? '启用' : '禁用'}`)
    }

    // 分组规则
    const groupedRules = computed(() => {
      if (!selectedTemplate.value) return []

      const groups = {
        validation: { name: '数据验证', icon: 'fas fa-check-circle', rules: [] },
        formatting: { name: '格式化', icon: 'fas fa-text-width', rules: [] },
        deduplication: { name: '去重处理', icon: 'fas fa-copy', rules: [] },
        classification: { name: '分类处理', icon: 'fas fa-tags', rules: [] },
        calculation: { name: '计算验证', icon: 'fas fa-calculator', rules: [] },
        analysis: { name: '数据分析', icon: 'fas fa-chart-bar', rules: [] }
      }

      selectedTemplate.value.rules.forEach(rule => {
        if (groups[rule.type]) {
          groups[rule.type].rules.push(rule)
        }
      })

      return Object.values(groups).filter(group => group.rules.length > 0)
    })

    // 清洗结果页面数据
    const qualityIssues = ref([
      { type: '空值', count: 50, severity: '中等', action: '删除记录', result: '已解决' },
      { type: '重复值', count: 25, severity: '高', action: '去重处理', result: '已解决' },
      { type: '格式错误', count: 15, severity: '低', action: '格式修正', result: '已解决' }
    ])

    // 数据治理页面数据
    const extractedKnowledge = ref([
      { name: '手机号验证规则', type: '格式验证', confidence: 98, source: 'customer_data.xlsx', createTime: '2024-01-15 14:30' },
      { name: '邮箱格式规则', type: '格式验证', confidence: 95, source: 'customer_data.xlsx', createTime: '2024-01-15 14:25' },
      { name: '身份证号规则', type: '身份验证', confidence: 85, source: 'customer_data.xlsx', createTime: '2024-01-15 14:20' }
    ])

    // 重置进度方法
    const resetProcess = () => {
      ElMessage.success('进度已重置')
    }

    // 获取严重程度类型
    const getSeverityType = (severity) => {
      const types = {
        '高': 'danger',
        '中等': 'warning',
        '低': 'info'
      }
      return types[severity] || 'info'
    }

    // 获取知识类型
    const getKnowledgeType = (type) => {
      const types = {
        '格式验证': 'primary',
        '身份验证': 'success',
        '数据清洗': 'warning'
      }
      return types[type] || 'info'
    }

    // 获取置信度样式
    const getConfidenceClass = (confidence) => {
      if (confidence >= 95) return 'confidence-high'
      if (confidence >= 85) return 'confidence-medium'
      return 'confidence-low'
    }

    // 文件清洗页面方法
    const handleFileUpload = (file) => {
      ElMessage.success(`文件 ${file.name} 上传成功`)
      return false // 阻止自动上传
    }

    const analyzeFile = (fileName) => {
      ElMessage.info(`正在分析文件：${fileName}`)
      // 模拟分析过程
      setTimeout(() => {
        ElMessage.success('文件分析完成')
      }, 2000)
    }

    const deleteFile = (fileName) => {
      ElMessage.warning(`已删除文件：${fileName}`)
    }

    const previewFile = (fileName) => {
      ElMessage.info(`预览文件：${fileName}`)
    }

    const startCleaning = () => {
      ElMessage.success('开始数据清洗处理')
      // 切换到过程展示页面
      activeTab.value = 'process'
    }



    const sendMessage = () => {
      if (!chatInput.value.trim()) {
        ElMessage.warning('请输入消息内容')
        return
      }
      ElMessage.success('消息已发送')
      chatInput.value = ''
    }

    const clearChat = () => {
      ElMessage.info('对话已清空')
    }

    const insertQuickCommand = (command) => {
      chatInput.value = command
    }

    // 文件上传相关方法
    const handleFileChange = (file, fileList) => {
      uploadedFiles.value = fileList
      ElMessage.success(`已添加文件: ${file.name}`)
    }

    const removeFile = (index) => {
      const fileName = uploadedFiles.value[index].name
      uploadedFiles.value.splice(index, 1)
      ElMessage.info(`已移除文件: ${fileName}`)
    }

    const clearAllFiles = () => {
      uploadedFiles.value = []
      ElMessage.info('已清空所有文件')
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const analyzeFiles = () => {
      ElMessage.success('开始分析文件数据...')
      // 切换到过程展示页面
      activeTab.value = 'process'
    }

    // 过程展示页面方法
    const refreshStatus = () => {
      ElMessage.success('状态已刷新')
    }

    const clearLogs = () => {
      ElMessage.info('日志已清空')
    }

    // 清洗结果页面方法
    const downloadCleanedFile = () => {
      ElMessage.success('清洗后文件下载中...')
    }

    const shareResults = () => {
      ElMessage.success('结果分享链接已生成')
    }

    const exportReport = () => {
      ElMessage.success('报告导出中...')
    }

    const generateReportLink = () => {
      ElMessage.success('报告链接已生成')
    }

    // 数据治理页面方法
    const reanalyzePatterns = () => {
      ElMessage.info('重新分析数据模式中...')
    }

    const addPattern = () => {
      ElMessage.success('添加新模式')
    }

    const viewPatternDetail = (patternName) => {
      ElMessage.info(`查看模式详情：${patternName}`)
    }

    const applyRule = (ruleName) => {
      ElMessage.success(`应用规则：${ruleName}`)
    }

    const refreshMetrics = () => {
      ElMessage.success('数据质量指标已刷新')
    }

    const setThreshold = () => {
      ElMessage.info('设置质量阈值')
    }

    const extractKnowledge = () => {
      ElMessage.info('智能提炼知识中...')
    }

    const previewExtraction = () => {
      ElMessage.info('预览提炼结果')
    }

    const configureExtraction = () => {
      ElMessage.info('配置提炼规则')
    }

    const createKnowledgeRule = () => {
      ElMessage.success('创建知识规则')
    }

    const importKnowledge = () => {
      ElMessage.success('导入知识库')
    }

    // 菜单状态和进度方法
    const getMenuStatus = (tabKey) => {
      const statusMap = {
        'cleaning': { icon: 'el-icon-circle-check', color: '#10b981' },
        'process': { icon: 'el-icon-loading', color: '#f59e0b' },
        'results': null,
        'governance': null
      }
      return statusMap[tabKey]
    }

    const getProgressWidth = () => {
      if (!tabList.value || tabList.value.length === 0) {
        return '0%'
      }
      const tabIndex = tabList.value.findIndex(tab => tab.key === activeTab.value)
      if (tabIndex === -1) {
        return '0%'
      }
      return `${((tabIndex + 1) / tabList.value.length) * 100}%`
    }

    const isTabCompleted = (tabKey) => {
      const completedTabs = ['cleaning']
      return completedTabs.includes(tabKey)
    }

    const isTabProcessing = (tabKey) => {
      return tabKey === 'process'
    }





    return {
      activeTab,
      tabList,
      switchTab,
      resetProcess,
      qualityIssues,
      extractedKnowledge,
      getSeverityType,
      getKnowledgeType,
      getConfidenceClass,
      // 模板和规则相关
      dataTemplates,
      selectedTemplate,
      rulesExpanded,
      selectTemplate,
      toggleRulesExpanded,
      updateRule,
      groupedRules,
      // 文件清洗方法
      handleFileUpload,
      analyzeFile,
      deleteFile,
      previewFile,
      startCleaning,
      sendMessage,
      clearChat,
      insertQuickCommand,
      // 聊天相关
      chatInput,
      // 文件上传相关
      uploadedFiles,
      handleFileChange,
      removeFile,
      clearAllFiles,
      formatFileSize,
      analyzeFiles,
      // 过程展示方法
      refreshStatus,
      clearLogs,
      // 清洗结果方法
      downloadCleanedFile,
      shareResults,
      exportReport,
      generateReportLink,
      // 数据治理方法
      reanalyzePatterns,
      addPattern,
      viewPatternDetail,
      applyRule,
      refreshMetrics,
      setThreshold,
      extractKnowledge,
      previewExtraction,
      configureExtraction,
      createKnowledgeRule,
      importKnowledge,
      // UI增强方法
      getMenuStatus,
      getProgressWidth,
      isTabCompleted,
      isTabProcessing
    }
  }
}
</script>

<style scoped>
/* CSS变量定义 - 统一主题色彩 */
:root {
  --primary-color: #4f46e5;
  --primary-light: #6366f1;
  --primary-dark: #3730a3;
  --secondary-color: #06b6d4;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --info-color: #6b7280;

  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;

  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-tertiary: #94a3b8;

  --border-color: #e2e8f0;
  --border-light: #f1f5f9;

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}

/* 整体头部导航区域样式 */
.unified-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #4f46e5 100%);
  color: white;
  margin-bottom: 0;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  padding: 40px 0 30px 0;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.bg-mesh {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.3;
}

.bg-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
}

.header-content {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  z-index: 2;
}

.header-content {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  z-index: 2;
}

/* 品牌区域 */
.brand-section {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
}

.brand-icon {
  position: relative;
  width: 80px;
  height: 80px;
}

.icon-inner {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;
}

.icon-inner i {
  font-size: 36px;
  color: white;
}

.icon-ring {
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 26px;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.brand-text {
  flex: 1;
}

.brand-title {
  margin: 0 0 8px 0;
  font-size: 36px;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.title-main {
  display: block;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-sub {
  display: block;
  background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 0.8em;
}

.brand-subtitle {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.feature-pills {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 50px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
}

.pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.ai-pill {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}

.process-pill {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.3);
}

.monitor-pill {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1));
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.3);
}

/* 导航菜单 */
.navigation-menu {
  margin-top: 20px;
}

.nav-track {
  position: relative;
  height: 3px;
  margin-bottom: 20px;
}

.track-line {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.track-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6));
  border-radius: 2px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.nav-items {
  display: flex;
  width: 100%;
  max-width: 100%;
  gap: 1px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 4px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-sizing: border-box;
}

.nav-item {
  flex: 1;
  min-width: 0;
  max-width: calc(25% - 1px);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  padding: 20px 16px;
  border-radius: 16px;
  background: transparent;
  border: none;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item:hover {
  transform: translateY(-1px);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  box-shadow:
    0 4px 20px rgba(255, 255, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.nav-item.active::before {
  opacity: 0;
}

.nav-item.completed {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.2);
}

.nav-item.processing {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.2);
  animation: processing-glow 2s ease-in-out infinite;
}

@keyframes processing-glow {
  0%, 100% {
    box-shadow: 0 2px 10px rgba(245, 158, 11, 0.2);
  }
  50% {
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
  }
}



.nav-content {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 2;
  justify-content: flex-start;
}

.nav-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.4s ease;
  flex-shrink: 0;
  position: relative;
  backdrop-filter: blur(10px);
}

.nav-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-item:hover .nav-icon::before {
  opacity: 1;
}

.nav-item.active .nav-icon {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

.nav-item.completed .nav-icon {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.15));
  border-color: rgba(16, 185, 129, 0.4);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
}

.nav-item.processing .nav-icon {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(245, 158, 11, 0.15));
  border-color: rgba(245, 158, 11, 0.4);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);
}

.nav-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  max-width: calc(100% - 80px); /* 为图标和状态图标预留空间 */
}

.nav-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
  color: white;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.nav-desc {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
}

.nav-item.active .nav-title {
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.nav-item.active .nav-desc {
  color: rgba(255, 255, 255, 0.9);
}

.nav-item.completed .nav-title {
  color: white;
}

.nav-item.completed .nav-desc {
  color: rgba(255, 255, 255, 0.85);
}

.nav-item.processing .nav-title {
  color: white;
}

.nav-item.processing .nav-desc {
  color: rgba(255, 255, 255, 0.85);
}

.nav-status {
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.status-icon {
  font-size: 18px;
  transition: all 0.3s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.status-icon.completed {
  color: rgba(16, 185, 129, 1);
  animation: check-bounce 0.6s ease-out;
}

.status-icon.processing {
  color: rgba(245, 158, 11, 1);
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes check-bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .nav-items {
    padding: 3px;
    gap: 1px;
  }

  .nav-item {
    padding: 18px 14px;
    max-width: calc(25% - 1px);
  }

  .nav-title {
    font-size: 15px;
  }

  .nav-desc {
    font-size: 12px;
  }

  .nav-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .nav-text {
    max-width: calc(100% - 70px);
  }
}

@media (max-width: 768px) {
  .nav-items {
    flex-direction: column;
    gap: 2px;
    padding: 3px;
    border-radius: 16px;
  }

  .nav-item {
    width: 100%;
    max-width: 100%;
    padding: 16px 14px;
    border-radius: 12px;
  }

  .brand-section {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .feature-pills {
    justify-content: center;
  }

  .nav-icon {
    width: 34px;
    height: 34px;
    font-size: 15px;
  }

  .nav-text {
    max-width: calc(100% - 65px);
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0 20px;
  }

  .nav-desc {
    display: none;
  }

  .brand-title {
    font-size: 28px;
  }

  .brand-subtitle {
    font-size: 12px;
  }

  .nav-items {
    padding: 2px;
  }

  .nav-item {
    padding: 14px 12px;
  }

  .nav-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .nav-title {
    font-size: 14px;
  }

  .nav-text {
    max-width: calc(100% - 60px);
  }
}

/* 页面内容样式 */
.page-content {
  width: 100%;
  margin: 0;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
  min-height: calc(100vh - 200px);
  position: relative;
}

.page-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 25% 25%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.tab-content {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  min-height: 600px;
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  padding: 0;
  margin: 0;
  width: 100%;
  max-width: none;
  position: relative;
  z-index: 1;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

/* 文件清洗页面 - 三栏布局 */
.cleaning-workspace {
  padding: 0;
}

.cleaning-layout {
  display: flex;
  gap: 24px;
  height: calc(100vh - 300px);
  min-height: 600px;
  width: 100%;
  margin: 0;
}

.cleaning-layout .left-panel,
.cleaning-layout .center-panel,
.cleaning-layout .right-panel {
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  backdrop-filter: blur(20px);
}

.cleaning-layout .left-panel::before,
.cleaning-layout .center-panel::before,
.cleaning-layout .right-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cleaning-layout .left-panel:hover,
.cleaning-layout .center-panel:hover,
.cleaning-layout .right-panel:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  border-color: rgba(102, 126, 234, 0.3);
}

.cleaning-layout .left-panel:hover::before,
.cleaning-layout .center-panel:hover::before,
.cleaning-layout .right-panel:hover::before {
  opacity: 1;
}

.cleaning-layout .left-panel {
  animation: slideInLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.cleaning-layout .center-panel {
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
}

.cleaning-layout .right-panel {
  animation: slideInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

.cleaning-layout .left-panel {
  flex: 0 0 300px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 模板选择区域样式 */
.template-section {
  margin-bottom: 8px;
}

/* 紧凑模板标签页 */
.template-tabs {
  padding: 12px;
}

.template-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 6px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  font-size: 13px;
  color: #2d3748;
}

.template-tab:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateX(4px);
}

.template-tab.active {
  background: #ffd700;
  color: #2d3748;
  font-weight: 600;
  border-color: rgba(255, 215, 0, 0.5);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.template-tab i {
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.template-tab span {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
}

.template-info {
  flex: 1;
  min-width: 0;
}

.template-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.template-info p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.template-stats {
  display: flex;
  gap: 12px;
}

.rule-count,
.field-count {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #e5e7eb;
  color: #374151;
  font-weight: 500;
}

.template-item.active .rule-count,
.template-item.active .field-count {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

/* 上传区域优化 */
.el-upload__tip .template-hint {
  color: #667eea;
  font-weight: 600;
}

.el-upload__tip .template-warning {
  color: #f59e0b;
  font-weight: 600;
}

/* 清洗规则展示区域样式 */
.rules-section {
  margin-top: 8px;
}

.rules-content {
  max-height: 200px;
  overflow-y: auto;
  transition: max-height 0.3s ease;
}

.rules-content.expanded {
  max-height: 500px;
}

.rule-category {
  margin-bottom: 16px;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 8px;
}

.category-title i {
  color: #667eea;
}

.rule-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.rule-item:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.rule-item.active {
  border-color: #667eea;
  background: #f0f4ff;
}

.rule-info {
  flex: 1;
  min-width: 0;
}

.rule-name {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.rule-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.3;
}

.rule-toggle {
  flex-shrink: 0;
  margin-left: 12px;
}

.cleaning-layout .center-panel {
  flex: 1;
  min-width: 400px;
  display: flex;
  flex-direction: column;
}

/* 聊天界面样式 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-header .header-actions {
  display: flex;
  gap: 8px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8fafc;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 85%;
}

.message.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-message .message-avatar {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.user-message .message-avatar {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-text {
  background: white;
  padding: 12px 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
}

.user-message .message-text {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.message-time {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
  text-align: right;
}

.user-message .message-time {
  text-align: left;
}

.suggestion-rules {
  margin: 12px 0;
  padding: 12px;
  background: #f0f4ff;
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.rule-suggestion {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
}

.rule-suggestion:last-child {
  margin-bottom: 0;
}

.rule-suggestion i {
  color: #10b981;
  font-size: 12px;
}

.chat-input {
  border-top: 1px solid #e5e7eb;
  background: white;
  padding: 16px 20px;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-commands {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.send-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.input-tip {
  font-size: 12px;
  color: #9ca3af;
}

/* 文件上传区域样式 */
.upload-section {
  margin-top: 8px;
}

.upload-area {
  padding: 12px;
}

.compact-upload {
  width: 100%;
}

.compact-upload .el-upload {
  width: 100%;
}

.compact-upload .el-upload-dragger {
  width: 100%;
  height: 80px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  transition: all 0.3s ease;
}

.compact-upload .el-upload-dragger:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.upload-content i {
  font-size: 24px;
  color: #667eea;
  margin-bottom: 4px;
}

.upload-content p {
  margin: 0;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.upload-tip {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.file-list {
  margin-top: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.file-items {
  max-height: 120px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item:hover {
  background: #f9fafb;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.file-info i {
  color: #667eea;
  font-size: 14px;
  flex-shrink: 0;
}

.file-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.file-name {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 11px;
  color: #9ca3af;
}

.file-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.file-actions .el-button {
  padding: 4px;
  min-height: auto;
}

/* 操作按钮区域样式 */
.action-section {
  margin-top: 12px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.action-buttons .el-button {
  height: 36px;
  font-weight: 600;
}

.cleaning-layout .right-panel {
  flex: 0 0 30%;
  min-width: 350px;
  display: flex;
  flex-direction: column;
}

/* 左侧面板样式 */
.panel-section {
  padding: 28px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  position: relative;
}

.panel-section:last-child {
  border-bottom: none;
  flex: 1;
}

.panel-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 28px;
  right: 28px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.2), transparent);
}

.panel-section:first-child::before {
  display: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-header h3 i {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.upload-demo {
  border: 2px dashed #d9d9d9;
  border-radius: 16px;
  background: linear-gradient(135deg, #f8faff 0%, #f0f7ff 100%);
  transition: all 0.3s ease;
  padding: 50px 30px;
  min-height: 200px;
}

.upload-demo:hover {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f4ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.15);
}

.template-list {
  max-height: 300px;
  overflow-y: auto;
}

.template-item {
  padding: 16px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.template-item.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f4ff 100%);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.template-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.template-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
}

.template-rules {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.file-list {
  margin-top: 16px;
}

.file-list h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #e8eaed;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-info i {
  color: #409eff;
  font-size: 18px;
  flex-shrink: 0;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-weight: 600;
  color: #333;
  font-size: 13px;
}

.file-size {
  font-size: 11px;
  color: #666;
}

.file-actions {
  display: flex;
  gap: 4px;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 快速操作区域 */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-actions .el-button {
  justify-content: flex-start;
  padding: 12px 16px;
  height: auto;
  border-radius: 8px;
  font-weight: 500;
}

.quick-actions .el-button i {
  margin-right: 8px;
  font-size: 16px;
}

/* 中间模板容器样式 */
.template-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.template-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.template-header h3 i {
  margin-right: 8px;
  color: #409eff;
}

.template-content {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}

.template-tabs {
  height: 100%;
}

.template-tabs .el-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.template-tabs .el-tab-pane {
  height: 100%;
  overflow-y: auto;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.template-item {
  padding: 20px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.template-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.15);
}

.template-item.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f4ff 100%);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.2);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.template-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.template-badges {
  display: flex;
  gap: 4px;
}

.template-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

.template-rules {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.template-stats {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.custom-template-area {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

/* 中间聊天区域样式 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.chat-header h3 i {
  margin-right: 8px;
  color: #409eff;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fafbfc;
}

.message {
  display: flex;
  margin-bottom: 16px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 12px;
  font-size: 16px;
}

.message.user .message-avatar {
  background: #409eff;
  color: white;
}

.message.assistant .message-avatar {
  background: #67c23a;
  color: white;
}

.message-content {
  max-width: 70%;
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message.user .message-content {
  background: #409eff;
  color: white;
}

.message-text {
  margin-bottom: 4px;
  line-height: 1.5;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  background: white;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.quick-commands {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.command-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.command-tag:hover {
  background: #409eff;
  color: white;
}

/* 右侧过程展示样式 */
.process-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.process-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.process-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.process-header h3 i {
  margin-right: 8px;
  color: #409eff;
}

.process-steps {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.step-item {
  display: flex;
  margin-bottom: 20px;
  position: relative;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 17px;
  top: 36px;
  width: 2px;
  height: calc(100% + 8px);
  background: #e4e7ed;
}

.step-item.completed::after {
  background: #67c23a;
}

.step-item.processing::after {
  background: linear-gradient(to bottom, #67c23a 50%, #e4e7ed 50%);
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  margin-right: 12px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.step-item.completed .step-number {
  background: #67c23a;
  color: white;
}

.step-item.processing .step-number {
  background: #409eff;
  color: white;
}

.step-item.pending .step-number {
  background: #e4e7ed;
  color: #999;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.step-content p {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.step-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: #409eff;
  font-weight: 500;
}

.step-result {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #67c23a;
}

.process-logs {
  border-top: 1px solid #f0f0f0;
  padding: 16px 20px;
  background: #fafbfc;
}

.process-logs h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.process-logs h4 i {
  margin-right: 8px;
  color: #409eff;
}

.log-container {
  max-height: 150px;
  overflow-y: auto;
  background: white;
  border-radius: 8px;
  padding: 8px;
}

.log-item {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
  line-height: 1.4;
}

.log-time {
  color: #999;
  flex-shrink: 0;
}

.log-message {
  flex: 1;
}

.log-item.info .log-message {
  color: #333;
}

.log-item.warning .log-message {
  color: #e6a23c;
}

.log-item.error .log-message {
  color: #f56c6c;
}

/* 过程展示页面样式 */
.process-workspace {
  padding: 0;
}

.process-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: calc(100vh - 300px);
  min-height: 600px;
  width: 100%;
  margin: 0;
}

.process-overview {
  flex: 0 0 auto;
}

.process-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.overall-progress {
  margin-bottom: 32px;
  padding: 20px;
  background: linear-gradient(135deg, #f8faff 0%, #f0f7ff 100%);
  border-radius: 12px;
  border: 1px solid #e6f4ff;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.progress-percentage {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 20px;
  width: 100%;
}

.steps-container .step-item {
  padding: 20px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  background: white;
}

.steps-container .step-item.completed {
  border-color: #67c23a;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
}

.steps-container .step-item.processing {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f4ff 100%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(64, 158, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(64, 158, 255, 0); }
}

.steps-container .step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 12px;
}

.steps-container .step-item.completed .step-number {
  background: #67c23a;
  color: white;
}

.steps-container .step-item.processing .step-number {
  background: #409eff;
  color: white;
}

.steps-container .step-item.pending .step-number {
  background: #e4e7ed;
  color: #999;
}

.steps-container .step-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.steps-container .step-content p {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.step-result {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #67c23a;
  font-weight: 500;
}

.step-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.step-progress {
  margin-bottom: 8px;
}

.step-progress .progress-text {
  font-size: 12px;
  color: #409eff;
  font-weight: 500;
  margin-top: 4px;
  display: block;
}

.step-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: #666;
}

.step-waiting {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #999;
}

.monitoring-section {
  flex: 1;
}

.log-card, .stats-card {
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  background: #fafbfc;
  border-radius: 8px;
  padding: 12px;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  font-size: 12px;
  line-height: 1.4;
  border-bottom: 1px solid #f0f0f0;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #999;
  flex-shrink: 0;
  font-family: monospace;
}

.log-level {
  flex-shrink: 0;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

.log-item.info .log-level {
  background: #e6f4ff;
  color: #409eff;
}

.log-item.warning .log-level {
  background: #fdf6ec;
  color: #e6a23c;
}

.log-item.success .log-level {
  background: #f0f9ff;
  color: #67c23a;
}

.log-message {
  flex: 1;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e8eaed;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
}

.stat-icon.processing {
  background: #409eff;
}

.stat-icon.warning {
  background: #e6a23c;
}

.stat-icon.success {
  background: #67c23a;
}

.stat-icon.info {
  background: #909399;
}

.stat-content h4 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.stat-content p {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #666;
}

.stat-change {
  font-size: 11px;
  color: #67c23a;
  font-weight: 500;
}

.quality-metrics {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.quality-metrics h5 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.metric-label {
  flex: 0 0 60px;
  font-size: 12px;
  color: #666;
}

.metric-value {
  flex: 0 0 40px;
  font-size: 12px;
  font-weight: 600;
  color: #409eff;
  text-align: right;
}

/* 清洗结果页面样式 */
.results-workspace {
  padding: 0;
}

.results-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

.results-overview {
  flex: 0 0 auto;
}

.comparison-card, .stats-card, .report-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.file-comparison {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 20px 0;
}

.comparison-item {
  flex: 1;
}

.comparison-item h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e8eaed;
}

.file-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.file-icon.original {
  background: #909399;
}

.file-icon.cleaned {
  background: #67c23a;
}

.file-details {
  flex: 1;
}

.file-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.file-stats {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.quality-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.quality-score {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-label {
  font-size: 14px;
  color: #666;
}

.score-value {
  font-size: 18px;
  font-weight: 700;
}

.score-value.poor {
  color: #f56c6c;
}

.score-value.excellent {
  color: #67c23a;
}

.comparison-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.process-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.cleaning-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cleaning-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e8eaed;
}

.cleaning-stats .stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.stat-item.removed .stat-icon {
  background: #f56c6c;
}

.stat-item.modified .stat-icon {
  background: #e6a23c;
}

.stat-item.added .stat-icon {
  background: #67c23a;
}

.stat-item.time .stat-icon {
  background: #409eff;
}

.cleaning-stats .stat-content h4 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.cleaning-stats .stat-content p {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #666;
}

.stat-desc {
  font-size: 12px;
  color: #999;
}

.applied-template {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.applied-template h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.template-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.template-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
}

.template-rules {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.detailed-report {
  flex: 1;
}

.report-content {
  min-height: 400px;
}

.report-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.summary-content p {
  margin-bottom: 8px;
  line-height: 1.6;
}

.key-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.metric-progress {
  flex: 1;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
  text-align: center;
}

.issues-analysis {
  margin-top: 16px;
}

.ai-insights {
  margin-top: 16px;
}

.insight-item {
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f4ff 100%);
  border-radius: 12px;
  border-left: 4px solid #409eff;
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.insight-header i {
  color: #409eff;
  font-size: 18px;
}

.insight-header h5 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.insight-item p {
  margin: 0 0 16px 0;
  line-height: 1.6;
  color: #333;
}

.recommendations h6 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.recommendations ul {
  margin: 0;
  padding-left: 20px;
}

.recommendations li {
  margin-bottom: 4px;
  line-height: 1.5;
  color: #666;
}

/* 数据治理页面样式 */
.governance-workspace {
  padding: 0;
}

.governance-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

.knowledge-section {
  flex: 0 0 auto;
}

.knowledge-card, .metrics-card, .application-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  height: 100%;
}

.knowledge-content {
  height: 500px;
}

.knowledge-content .el-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.knowledge-content .el-tab-pane {
  height: 100%;
  overflow-y: auto;
}

.patterns-list, .rules-library {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.pattern-item, .rule-item {
  padding: 20px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: white;
}

.pattern-item:hover, .rule-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.15);
}

.pattern-header, .rule-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.pattern-header h4, .rule-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.pattern-badges, .rule-badges {
  display: flex;
  gap: 4px;
}

.pattern-desc, .rule-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

.pattern-stats, .rule-effectiveness {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #999;
}

.stat-item, .effectiveness-item {
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.pattern-actions {
  display: flex;
  gap: 8px;
}

.metrics-dashboard {
  padding: 20px 0;
}

.metric-card {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.metric-card h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 8px;
}

.metric-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  margin-bottom: 12px;
}

.metric-trend.up {
  color: #67c23a;
}

.metric-trend.down {
  color: #f56c6c;
}

.quality-trends {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.quality-trends h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.trend-chart {
  height: 200px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d9d9d9;
}

.chart-placeholder {
  text-align: center;
  color: #666;
}

.quality-alerts {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.quality-alerts h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid;
}

.alert-item.warning {
  background: #fdf6ec;
  border-left-color: #e6a23c;
}

.alert-item.warning i {
  color: #e6a23c;
}

.alert-item.info {
  background: #f0f9ff;
  border-left-color: #409eff;
}

.alert-item.info i {
  color: #409eff;
}

.alert-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.alert-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.alert-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.alert-time {
  font-size: 11px;
  color: #999;
}

.knowledge-application {
  flex: 1;
}

.application-content {
  min-height: 400px;
}

.extraction-section {
  padding: 20px 0;
}

.extraction-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.extraction-results h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.confidence-high {
  color: #67c23a;
  font-weight: 600;
}

.confidence-medium {
  color: #e6a23c;
  font-weight: 600;
}

.confidence-low {
  color: #f56c6c;
  font-weight: 600;
}

.management-section {
  padding: 20px 0;
}

.rule-categories h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  background: #f0f9ff;
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.15);
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.category-info h5 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.category-info p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.statistics-section {
  padding: 20px 0;
}

.statistics-section h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.stats-overview {
  margin-bottom: 24px;
}

.overview-card {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.overview-number {
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 8px;
}

.overview-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.overview-change {
  font-size: 12px;
  color: #67c23a;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .cleaning-layout .left-panel {
    flex: 0 0 280px;
    min-width: 280px;
  }

  .cleaning-layout .right-panel {
    flex: 0 0 320px;
    min-width: 320px;
  }
}

@media (max-width: 1200px) {
  .cleaning-layout {
    flex-direction: column;
    height: auto;
    gap: 20px;
  }

  .cleaning-layout .left-panel,
  .cleaning-layout .center-panel,
  .cleaning-layout .right-panel {
    flex: none;
    min-width: auto;
    width: 100%;
    margin-bottom: 0;
  }

  .template-list {
    max-height: 300px;
  }

  .steps-container {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .sub-menu-content {
    flex-direction: column;
    gap: 12px;
    padding: 0 20px;
  }

  .menu-item {
    min-width: auto;
    flex-direction: row;
    text-align: left;
    padding: 16px 20px;
  }

  .menu-icon {
    margin-bottom: 0;
    margin-right: 12px;
  }

  .page-content {
    padding: 20px 10px;
  }

  .steps-container {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 15px 5px;
  }

  .cleaning-layout {
    gap: 15px;
  }

  .panel-section {
    padding: 15px;
  }

  .template-header,
  .chat-header,
  .process-header {
    padding: 15px;
  }
}
</style>
