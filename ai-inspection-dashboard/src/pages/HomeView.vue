<template>
  <div class="home-container">

    <!-- 第一部分：背景分析 -->
    <div class="section background-section">
      <div class="section-header">
        <h2 class="section-title">
          <el-icon><Document /></el-icon>
          项目背景与现状分析
        </h2>
        <p class="section-subtitle">基于当前技术栈与业务需求的深度分析，为QMS智能管理模拟系统建设提供依据</p>
      </div>

      <!-- 背景说明 -->
      <div class="background-intro">
        <div class="intro-card">
          <div class="intro-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="intro-content">
            <h3>建设背景</h3>
            <p>面对智库平台功能局限、案例应用数据混乱、Agent开发技术挑战、QMS系统建设初期等现状，我们搭建了<strong>QMS智能管理模拟系统</strong>，通过提前实现功能搭建和效果调试，验证数据流、工具流的运行机制，为后续正式接入QMS系统奠定基础。</p>
          </div>
        </div>
      </div>

      <div class="background-content">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in backgroundItems" :key="index">
            <div class="background-card" :class="`card-${index + 1}`">
              <!-- 图标和标题在同一行 -->
              <div class="card-header">
                <div class="card-icon">
                  <el-icon>
                    <component :is="item.icon" />
                  </el-icon>
                </div>
                <h3 class="card-title">{{ item.title }}</h3>
              </div>

              <div class="card-content">
                <div class="card-status" :class="item.statusClass">
                  <el-icon><component :is="item.statusIcon" /></el-icon>
                  <span>{{ item.status }}</span>
                </div>
                <p class="card-description">{{ item.description }}</p>
                <div class="card-solution">
                  <strong>解决方案：</strong>
                  <span>{{ item.solution }}</span>
                </div>
              </div>

              <div class="card-progress">
                <el-progress
                  :percentage="item.progress"
                  :color="item.progressColor"
                  :stroke-width="4"
                />
              </div>
            </div>
          </el-col>
        </el-row>

        <div class="background-summary">
          <el-alert
            title="建设目标"
            type="success"
            description="通过提前实现功能搭建和效果调试，完善数据流、工具流的运行机制，深入了解后续规划，为快速接入QMS系统实现AI落地奠定坚实基础。"
            show-icon
            :closable="false"
          />
        </div>
      </div>
    </div>

    <!-- 第二部分：系统框架 -->
    <div class="section framework-section">
      <div class="section-header">
        <h2 class="section-title">
          <el-icon><Connection /></el-icon>
          系统架构与数据流
        </h2>
        <p class="section-subtitle">动态展示系统整体流程与信息流转</p>
      </div>

      <div class="framework-content">
        <!-- 紧凑型系统架构流程图 -->
        <div class="compact-architecture">
          <!-- 技术栈浮动按钮 -->
          <div class="tech-stack-trigger" @click="showTechStack = !showTechStack">
            <el-icon><Setting /></el-icon>
            <span>核心技术栈</span>
          </div>

          <!-- 技术栈弹出面板 -->
          <div class="tech-stack-panel" :class="{ active: showTechStack }">
            <div class="panel-header">
              <h4>核心技术栈</h4>
              <p>构建现代化智能质检系统的技术基础</p>
              <el-button
                type="text"
                class="close-btn"
                @click="showTechStack = false"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>

            <div class="tech-categories">
              <div class="tech-category frontend-tech">
                <div class="category-header">
                  <el-icon><Monitor /></el-icon>
                  <span>前端技术</span>
                </div>
                <div class="tech-tags">
                  <span class="tech-tag vue-tag">Vue 3</span>
                  <span class="tech-tag element-tag">Element Plus</span>
                  <span class="tech-tag chart-tag">ECharts</span>
                  <span class="tech-tag ts-tag">TypeScript</span>
                  <span class="tech-tag vite-tag">Vite</span>
                </div>
              </div>

              <div class="tech-category backend-tech">
                <div class="category-header">
                  <el-icon><Service /></el-icon>
                  <span>后端服务</span>
                </div>
                <div class="tech-tags">
                  <span class="tech-tag fastapi-tag">FastAPI</span>
                  <span class="tech-tag python-tag">Python</span>
                  <span class="tech-tag sqlite-tag">SQLite</span>
                  <span class="tech-tag uvicorn-tag">Uvicorn</span>
                  <span class="tech-tag pydantic-tag">Pydantic</span>
                </div>
              </div>

              <div class="tech-category ai-tech">
                <div class="category-header">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>AI技术</span>
                </div>
                <div class="tech-tags">
                  <span class="tech-tag deepseek-tag">DeepSeek</span>
                  <span class="tech-tag langchain-tag">LangChain</span>
                  <span class="tech-tag openai-tag">OpenAI API</span>
                  <span class="tech-tag embedding-tag">Embedding</span>
                  <span class="tech-tag rag-tag">RAG</span>
                </div>
              </div>

              <div class="tech-category tools-tech">
                <div class="category-header">
                  <el-icon><Tools /></el-icon>
                  <span>工具链</span>
                </div>
                <div class="tech-tags">
                  <span class="tech-tag git-tag">Git</span>
                  <span class="tech-tag pnpm-tag">pnpm</span>
                  <span class="tech-tag eslint-tag">ESLint</span>
                  <span class="tech-tag prettier-tag">Prettier</span>
                  <span class="tech-tag vscode-tag">VSCode</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 遮罩层 -->
          <div class="tech-stack-overlay" :class="{ active: showTechStack }" @click="showTechStack = false"></div>

          <div class="arch-flow-container">
            <!-- 用户层 -->
            <div class="compact-layer">
              <div class="layer-title">用户交互</div>
              <div class="compact-node user-node" :class="{ active: currentFlowStep >= 1 }">
                <el-icon><User /></el-icon>
                <span>用户</span>
              </div>
            </div>

            <!-- 流动箭头 -->
            <div class="flowing-connector" :class="{ active: currentFlowStep >= 2 }">
              <div class="flow-line">
                <div class="flow-dots"></div>
              </div>
            </div>

            <!-- 前端层 -->
            <div class="compact-layer">
              <div class="layer-title">前端展示层</div>
              <div class="compact-nodes-row">
                <div class="compact-node vue-node" :class="{ active: currentFlowStep >= 2 }">
                  <el-icon><Monitor /></el-icon>
                  <span>Vue 3</span>
                </div>
                <div class="compact-node element-node" :class="{ active: currentFlowStep >= 2 }">
                  <el-icon><Grid /></el-icon>
                  <span>Element Plus</span>
                </div>
                <div class="compact-node chart-node" :class="{ active: currentFlowStep >= 2 }">
                  <el-icon><TrendCharts /></el-icon>
                  <span>ECharts</span>
                </div>
              </div>
            </div>

            <!-- 流动箭头 -->
            <div class="flowing-connector" :class="{ active: currentFlowStep >= 3 }">
              <div class="flow-line">
                <div class="flow-dots"></div>
              </div>
            </div>

            <!-- 后端层 -->
            <div class="compact-layer">
              <div class="layer-title">后端服务层</div>
              <div class="compact-nodes-row">
                <div class="compact-node fastapi-node" :class="{ active: currentFlowStep >= 3 }">
                  <el-icon><Service /></el-icon>
                  <span>FastAPI</span>
                </div>
                <div class="compact-node python-node" :class="{ active: currentFlowStep >= 3 }">
                  <el-icon><Tools /></el-icon>
                  <span>Python</span>
                </div>
                <div class="compact-node rule-node" :class="{ active: currentFlowStep >= 3 }">
                  <el-icon><Setting /></el-icon>
                  <span>规则引擎</span>
                </div>
              </div>
            </div>

            <!-- 分支流动箭头 -->
            <div class="branch-connector" :class="{ active: currentFlowStep >= 4 }">
              <div class="branch-left-line">
                <div class="flow-dots"></div>
              </div>
              <div class="branch-right-line">
                <div class="flow-dots"></div>
              </div>
            </div>

            <!-- AI和数据层 -->
            <div class="dual-layer">
              <div class="compact-layer ai-section">
                <div class="layer-title">AI服务层</div>
                <div class="compact-nodes-col">
                  <div class="compact-node deepseek-node" :class="{ active: currentFlowStep >= 4 }">
                    <el-icon><ChatDotRound /></el-icon>
                    <span>DeepSeek</span>
                  </div>
                  <div class="compact-node langchain-node" :class="{ active: currentFlowStep >= 4 }">
                    <el-icon><MagicStick /></el-icon>
                    <span>LangChain</span>
                  </div>
                </div>
              </div>

              <div class="compact-layer data-section">
                <div class="layer-title">数据存储层</div>
                <div class="compact-nodes-col">
                  <div class="compact-node sqlite-node" :class="{ active: currentFlowStep >= 4 }">
                    <el-icon><Coin /></el-icon>
                    <span>SQLite</span>
                  </div>
                  <div class="compact-node json-node" :class="{ active: currentFlowStep >= 4 }">
                    <el-icon><Document /></el-icon>
                    <span>JSON</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 最终流动箭头 -->
            <div class="flowing-connector" :class="{ active: currentFlowStep >= 5 }">
              <div class="flow-line">
                <div class="flow-dots"></div>
              </div>
            </div>

            <!-- 数据流转过程 -->
            <div class="data-flow-summary">
              <div class="flow-summary-title">数据流转过程</div>
              <div class="flow-summary-steps">
                <div class="summary-step" :class="{ active: currentFlowStep >= 5 }">
                  <div class="step-icon"><el-icon><Box /></el-icon></div>
                  <div class="step-text">
                    <strong>数据采集</strong>
                    <span>132+396+1056条</span>
                  </div>
                </div>
                <div class="summary-arrow">→</div>
                <div class="summary-step" :class="{ active: currentFlowStep >= 6 }">
                  <div class="step-icon"><el-icon><Tools /></el-icon></div>
                  <div class="step-text">
                    <strong>数据处理</strong>
                    <span>清洗验证</span>
                  </div>
                </div>
                <div class="summary-arrow">→</div>
                <div class="summary-step" :class="{ active: currentFlowStep >= 7 }">
                  <div class="step-icon"><el-icon><ChatDotRound /></el-icon></div>
                  <div class="step-text">
                    <strong>AI分析</strong>
                    <span>智能问答</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>

    <!-- 第三部分：整体设计展示 -->
    <div class="section design-section">
      <div class="section-header">
        <h2 class="section-title">
          <el-icon><Compass /></el-icon>
          三阶段设计展示
        </h2>
        <p class="section-subtitle">系统建设路径与功能规划</p>
      </div>

      <div class="design-content">
        <!-- 紧凑型三阶段卡片展示 -->
        <div class="compact-stages-container">
          <!-- 当前显示的阶段卡片 -->
          <div class="stage-card-wrapper">
            <div
              class="stage-card"
              v-for="(stage, index) in designStages"
              :key="index"
              :class="[
                `stage-${index + 1}`,
                {
                  active: currentStageIndex === index,
                  'slide-left': currentStageIndex > index,
                  'slide-right': currentStageIndex < index
                }
              ]"
            >
              <!-- 阶段标题 -->
              <div class="compact-stage-header">
                <div class="stage-number-compact">{{ index + 1 }}</div>
                <div class="stage-info-compact">
                  <h3 class="stage-title-compact">{{ stage.title }}</h3>
                  <p class="stage-subtitle-compact">{{ stage.subtitle }}</p>
                </div>
                <div class="stage-status-compact">
                  <el-tag :type="stage.tagType" size="small">{{ stage.status }}</el-tag>
                </div>
              </div>

              <!-- 功能模块网格 -->
              <div class="compact-modules-grid">
                <div
                  class="compact-module-item"
                  v-for="(feature, fIndex) in stage.features"
                  :key="fIndex"
                  :class="{ available: feature.available }"
                  @click="feature.available && goToPage(feature.path)"
                >
                  <div class="module-icon-compact">
                    <el-icon>
                      <component :is="feature.icon" />
                    </el-icon>
                  </div>
                  <div class="module-content-compact">
                    <h4 class="module-name-compact">{{ feature.name }}</h4>
                    <p class="module-desc-compact">{{ feature.description }}</p>
                  </div>
                  <div class="module-action-compact">
                    <el-button
                      :type="feature.available ? 'primary' : 'info'"
                      :disabled="!feature.available"
                      size="small"
                      text
                    >
                      {{ feature.available ? '进入' : '规划中' }}
                    </el-button>
                  </div>
                </div>
              </div>

              <!-- 完成度进度条 -->
              <div class="compact-stage-progress">
                <div class="progress-info-compact">
                  <span class="progress-label-compact">完成度</span>
                  <span class="progress-value-compact">{{ stage.progress }}%</span>
                </div>
                <el-progress
                  :percentage="stage.progress"
                  :color="stage.progressColor"
                  :stroke-width="6"
                  :show-text="false"
                />
              </div>
            </div>
          </div>

          <!-- 阶段切换控制 -->
          <div class="stage-controls">
            <div class="stage-indicators">
              <div
                class="indicator-dot"
                v-for="(stage, index) in designStages"
                :key="index"
                :class="{ active: currentStageIndex === index }"
                @click="setCurrentStage(index)"
              ></div>
            </div>

            <div class="stage-navigation">
              <el-button
                type="text"
                :disabled="currentStageIndex === 0"
                @click="previousStage"
                class="nav-btn"
              >
                <el-icon><ArrowLeft /></el-icon>
                上一阶段
              </el-button>

              <el-button
                type="text"
                :disabled="currentStageIndex === designStages.length - 1"
                @click="nextStage"
                class="nav-btn"
              >
                下一阶段
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第四部分：IQE AI智能助手 -->
    <div class="section ai-assistant-section">
      <div class="section-header">
        <h2 class="section-title">
          <el-icon><ChatDotRound /></el-icon>
          QMS AI智能助手
        </h2>
        <p class="section-subtitle">核心AI功能与发展规划</p>
      </div>

      <div class="ai-assistant-content">
        <!-- 重新设计的对称布局 -->
        <div class="ai-symmetric-layout">
          <!-- 左侧：核心功能 -->
          <div class="ai-column ai-features-column">
            <div class="column-header">
              <el-icon class="header-icon"><Star /></el-icon>
              <h4 class="column-title">核心功能</h4>
            </div>

            <div class="symmetric-grid">
              <div class="symmetric-card" v-for="(feature, index) in aiFeatures" :key="index">
                <div class="card-icon" :class="feature.statusClass">
                  <el-icon><component :is="feature.icon" /></el-icon>
                </div>
                <div class="card-content">
                  <h5 class="card-title">{{ feature.name }}</h5>
                  <p class="card-description">{{ feature.description }}</p>
                  <div class="card-tags">
                    <span class="tag-item" v-for="tag in feature.tags" :key="tag">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：发展规划 -->
          <div class="ai-column ai-roadmap-column">
            <div class="column-header">
              <el-icon class="header-icon"><TrendCharts /></el-icon>
              <h4 class="column-title">发展规划</h4>
            </div>

            <div class="symmetric-grid">
              <div class="symmetric-card" v-for="(item, index) in aiRoadmap" :key="index">
                <div class="card-icon" :class="item.statusClass">
                  <el-icon><component :is="item.icon" /></el-icon>
                </div>
                <div class="card-content">
                  <div class="card-header">
                    <h5 class="card-title">{{ item.phase }}</h5>
                    <span class="card-time">{{ item.timeline }}</span>
                  </div>
                  <p class="card-description">{{ item.description }}</p>
                  <div class="card-tags">
                    <span class="tag-item" v-for="goal in item.goals" :key="goal">
                      {{ goal }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="ai-assistant-actions">
          <el-button
            type="primary"
            size="large"
            @click="experienceAIAssistant"
          >
            <el-icon><ChatDotRound /></el-icon>
            体验AI助手
          </el-button>
        </div>
      </div>
    </div>




  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { materialCategories } from '../data/material_categories.js'
import {
  ArrowRight,
  Goods,
  DataAnalysis,
  Monitor,
  Warning,
  DocumentCopy,
  DataBoard,
  Document,
  Connection,
  Box,
  Operation,
  Tools,
  Setting,
  ChatDotRound,
  TrendCharts,
  MagicStick,
  Compass,
  Platform,
  Files,
  Management,
  QuestionFilled,
  Search,
  BrushFilled,
  Star,
  Clock,
  Check,
  More,
  House,
  Folder,
  Service,
  Close
} from '@element-plus/icons-vue'

const router = useRouter()

// 模拟数据
const factoryData = ref([])
const labData = ref([])
const onlineData = ref([])

// 动画控制
const currentFlowStep = ref(0)
const showTechStack = ref(false)
const currentStageIndex = ref(0)

// 背景分析数据
const backgroundItems = ref([
  {
    title: '智库平台',
    icon: 'House',
    status: '仅支持问答助手',
    statusClass: 'status-warning',
    statusIcon: 'Warning',
    description: '当前智库平台功能相对单一，仅支持基础问答功能，无法满足复杂业务场景需求',
    solution: '通过模拟系统验证多模态AI能力，为正式系统扩展奠定基础',
    progress: 35,
    progressColor: '#E6A23C'
  },
  {
    title: '案例应用',
    icon: 'Folder',
    status: '数据需要清洗',
    statusClass: 'status-danger',
    statusIcon: 'Warning',
    description: '历史数据杂乱无序，缺乏统一标准，需要外接工具进行数据清洗和整理',
    solution: '在模拟系统中建立数据治理规范，验证自动化清洗流程',
    progress: 25,
    progressColor: '#F56C6C'
  },
  {
    title: 'Agent开发',
    icon: 'Service',
    status: '行业难题',
    statusClass: 'status-danger',
    statusIcon: 'Warning',
    description: '智能代理开发面临行业特有技术挑战，需要自主研发专业功能模块',
    solution: '通过模拟环境构建领域专用Agent框架，降低正式开发风险',
    progress: 20,
    progressColor: '#F56C6C'
  },
  {
    title: 'QMS系统',
    icon: 'Setting',
    status: '建设初期',
    statusClass: 'status-info',
    statusIcon: 'Clock',
    description: '质量管理系统处于建设初期，基础架构和核心功能尚在规划阶段',
    solution: '先行搭建模拟系统，验证技术方案和业务流程，为正式接入做准备',
    progress: 60,
    progressColor: '#409EFF'
  }
])



// 设计阶段数据
const designStages = ref([
  {
    title: '阶段一：模拟场景搭建（IQE）',
    subtitle: '基础数据管理与业务流程建立',
    status: '已完成',
    statusClass: 'status-success',
    tagType: 'success',
    progress: 95,
    progressColor: '#67C23A',
    features: [
      {
        name: '物料库存管理',
        description: '132条库存数据管理',
        icon: 'Box',
        available: true,
        path: '/stage1/inventory'
      },
      {
        name: '物料上线跟踪',
        description: '1056条上线记录跟踪',
        icon: 'Monitor',
        available: true,
        path: '/stage1/online'
      },
      {
        name: '物料测试跟踪',
        description: '396条测试记录管理',
        icon: 'DataAnalysis',
        available: true,
        path: '/stage1/lab'
      },
      {
        name: '批次管理',
        description: '批次生命周期管理',
        icon: 'DocumentCopy',
        available: true,
        path: '/stage1/batch'
      }
    ]
  },
  {
    title: '阶段二：数据功能搭建',
    subtitle: '数据规则与智能AI开发',
    status: '进行中',
    statusClass: 'status-warning',
    tagType: 'warning',
    progress: 75,
    progressColor: '#E6A23C',
    features: [
      {
        name: '数据管理',
        description: '数据规则定义与管理',
        icon: 'Setting',
        available: true,
        path: '/stage2/data'
      },
      {
        name: '智能问答',
        description: 'AI驱动的智能问答系统',
        icon: 'ChatDotRound',
        available: true,
        path: '/ai-assistant'
      },
      {
        name: 'AI场景管理',
        description: '智能场景配置与管理',
        icon: 'MagicStick',
        available: true,
        path: '/ai-scenario'
      },
      {
        name: '数据分析工具',
        description: '高级数据分析与可视化',
        icon: 'TrendCharts',
        available: false,
        path: '/stage2/analysis'
      }
    ]
  },
  {
    title: '阶段三：AI建设规划',
    subtitle: '全面AI能力建设与系统优化',
    status: '规划中',
    statusClass: 'status-info',
    tagType: 'info',
    progress: 30,
    progressColor: '#409EFF',
    features: [
      {
        name: 'AI规划文档',
        description: '详细的AI建设规划',
        icon: 'Document',
        available: true,
        path: '/stage3/ai-planning'
      },
      {
        name: '技术路线图',
        description: '技术发展路径规划',
        icon: 'TrendCharts',
        available: true,
        path: '/stage3/roadmap'
      },
      {
        name: '架构设计',
        description: '系统架构设计方案',
        icon: 'Connection',
        available: true,
        path: '/stage3/architecture'
      },
      {
        name: '预测性维护',
        description: '基于AI的预测性维护',
        icon: 'MagicStick',
        available: false,
        path: '/stage3/predictive'
      }
    ]
  }
])

// AI功能数据
const aiFeatures = ref([
  {
    name: '智能问答系统',
    description: '基于自然语言的智能问答，支持复杂业务查询与数据分析',
    icon: 'QuestionFilled',
    statusClass: 'feature-blue',
    tagType: 'primary',
    tags: ['自然语言', '业务查询', '实时响应']
  },
  {
    name: '数据智能分析',
    description: '自动化数据分析与洞察发现，提供深度业务洞察',
    icon: 'Search',
    statusClass: 'feature-green',
    tagType: 'success',
    tags: ['数据挖掘', '趋势分析', '异常检测']
  },
  {
    name: '质量预测模型',
    description: '基于历史数据的质量风险预测，构建预警体系',
    icon: 'TrendCharts',
    statusClass: 'feature-orange',
    tagType: 'warning',
    tags: ['机器学习', '风险预测', '预警系统']
  },
  {
    name: '智能推荐引擎',
    description: '个性化的质量管理建议与优化方案，实现智能决策',
    icon: 'Star',
    statusClass: 'feature-purple',
    tagType: 'info',
    tags: ['推荐算法', '决策支持', '优化建议']
  }
])

// AI发展规划 - 基于2025年Q2当前时间点
const aiRoadmap = ref([
  {
    phase: '基础建设期',
    timeline: '2025 Q2-Q3',
    description: '基础AI能力建设，实现智能问答和数据分析功能，构建核心技术框架',
    statusClass: 'roadmap-blue',
    tagType: 'primary',
    icon: 'Setting',
    goals: ['智能问答', '数据可视化', '基础分析']
  },
  {
    phase: '能力提升期',
    timeline: '2025 Q4-2026 Q1',
    description: '增强AI分析能力，引入机器学习模型，提升预测准确性和智能化水平',
    statusClass: 'roadmap-green',
    tagType: 'success',
    icon: 'TrendCharts',
    goals: ['预测模型', '异常检测', '智能推荐']
  },
  {
    phase: '智能预警期',
    timeline: '2026 Q2-Q3',
    description: '质量预测与风险管理，构建预警体系，实现主动质量控制和管理',
    statusClass: 'roadmap-orange',
    tagType: 'warning',
    icon: 'Warning',
    goals: ['风险预测', '预警系统', '质量控制']
  },
  {
    phase: '全面集成期',
    timeline: '2026 Q4-2027 Q1',
    description: '全面AI集成，实现端到端智能化管理，打造行业领先的智能QMS系统',
    statusClass: 'roadmap-purple',
    tagType: 'info',
    icon: 'Connection',
    goals: ['自动化决策', '持续学习', '系统优化']
  }
])

// 模拟计算属性 - 使用固定数据量
const avgFactoryDefectRate = computed(() => '1.2')
const labPassRate = computed(() => '95')
const avgOnlineDefectRate = computed(() => '0.8')

const highRiskCount = computed(() => 8)
const highRiskPercentage = computed(() => '6')

// 简化的类别风险数据
const categoryRiskData = computed(() => {
  return materialCategories.map((category, index) => ({
    categoryId: category.id,
    categoryName: category.name,
    totalCount: 10 + index * 5,
    highRiskCount: Math.floor(Math.random() * 3),
    mediumRiskCount: Math.floor(Math.random() * 5),
    lowRiskCount: 8 + index * 3
  }))
})



// 页面跳转
function goToPage(path) {
  router.push(path)
}

// AI助手体验方法
function experienceAIAssistant() {
  // 直接跳转到加载页面
  router.push('/qms-assistant-loading')
}

// 阶段切换方法
function setCurrentStage(index) {
  currentStageIndex.value = index
}

function nextStage() {
  if (currentStageIndex.value < designStages.value.length - 1) {
    currentStageIndex.value++
  }
}

function previousStage() {
  if (currentStageIndex.value > 0) {
    currentStageIndex.value--
  }
}





// 启动动画
function startAnimations() {
  // 启动流程动画
  let step = 0
  const flowInterval = setInterval(() => {
    step++
    currentFlowStep.value = step
    if (step >= 9) {
      clearInterval(flowInterval)
      // 重置动画，循环播放
      setTimeout(() => {
        currentFlowStep.value = 0
        startFlowAnimation()
      }, 3000)
    }
  }, 800)
}

function startFlowAnimation() {
  let step = 0
  const flowInterval = setInterval(() => {
    step++
    currentFlowStep.value = step
    if (step >= 9) {
      clearInterval(flowInterval)
      setTimeout(() => {
        currentFlowStep.value = 0
        startFlowAnimation()
      }, 3000)
    }
  }, 800)
}

// 自动切换定时器
let autoSwitchTimer = null

// 启动自动切换
function startAutoSwitch() {
  autoSwitchTimer = setInterval(() => {
    currentStageIndex.value = (currentStageIndex.value + 1) % designStages.value.length
  }, 5000) // 每5秒切换一次
}

// 停止自动切换
function stopAutoSwitch() {
  if (autoSwitchTimer) {
    clearInterval(autoSwitchTimer)
    autoSwitchTimer = null
  }
}

onMounted(() => {
  startAnimations()
  startAutoSwitch()
})

onUnmounted(() => {
  // 清理动画和定时器
  stopAutoSwitch()
})
</script>

<style scoped>
.home-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}





@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-10px) scale(1.1); }
}

/* 章节样式 - 压缩间距 */
.section {
  margin-bottom: 40px;
}

.section-header {
  text-align: center;
  margin-bottom: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.section-title .el-icon {
  margin-right: 12px;
  font-size: 36px;
  color: #409EFF;
}

.section-subtitle {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

/* 背景介绍样式 - 压缩间距 */
.background-intro {
  margin-bottom: 30px;
}

.intro-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.intro-icon {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  box-shadow: 0 4px 16px rgba(255, 154, 158, 0.3);
}

.intro-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.intro-content p {
  font-size: 16px;
  line-height: 1.8;
  color: #606266;
  margin: 0;
}

.intro-content strong {
  color: #409EFF;
  font-weight: 600;
}

/* 背景分析样式 */
.background-section {
  background: #f8f9fa;
  padding: 40px;
  border-radius: 16px;
}

.background-content {
  max-width: 1200px;
  margin: 0 auto;
}

.background-content .el-row {
  display: flex;
  align-items: stretch;
}

.background-content .el-col {
  display: flex;
}

.background-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  height: 320px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.background-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.background-card.card-1 {
  border-left-color: #E6A23C;
}

.background-card.card-2 {
  border-left-color: #F56C6C;
}

.background-card.card-3 {
  border-left-color: #F56C6C;
}

.background-card.card-4 {
  border-left-color: #409EFF;
}

/* 卡片头部 - 图标和标题在同一行 */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-icon {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: white;
  background: linear-gradient(135deg, #409EFF, #36A3F7);
  flex-shrink: 0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  flex: 1;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-status {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
}

.card-status .el-icon {
  margin-right: 6px;
}

.status-warning {
  color: #E6A23C;
}

.status-danger {
  color: #F56C6C;
}

.status-info {
  color: #409EFF;
}

.card-description {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
  margin: 0 0 10px 0;
}

.card-solution {
  font-size: 13px;
  color: #303133;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 6px;
  border-left: 3px solid #409EFF;
}

.card-solution strong {
  color: #409EFF;
  font-weight: 600;
}

.card-progress {
  margin-top: auto;
}

.background-summary {
  margin-top: 24px;
}

/* 系统框架样式 */
.framework-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px;
  border-radius: 16px;
}

.framework-content {
  max-width: 1200px;
  margin: 0 auto;
}

.architecture-flow {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.flow-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.flow-layer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.layer-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px 0;
  text-align: center;
}

.flow-nodes {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.flow-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  min-width: 120px;
  transition: all 0.5s ease;
  opacity: 0.5;
  transform: scale(0.9);
}

.flow-node.active {
  opacity: 1;
  transform: scale(1);
  background: linear-gradient(135deg, #409EFF, #36A3F7);
  color: white;
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.3);
}

.node-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #606266;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.flow-node.active .node-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.node-content {
  text-align: center;
}

.node-content h5 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #303133;
}

.flow-node.active .node-content h5 {
  color: white;
}

.node-content span {
  font-size: 12px;
  color: #909399;
}

.flow-node.active .node-content span {
  color: rgba(255, 255, 255, 0.8);
}

.flow-arrows {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.arrow-container {
  position: relative;
  width: 100px;
  height: 40px;
}

.flowing-arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.flowing-arrow.active {
  opacity: 1;
}

.arrow-line {
  width: 60px;
  height: 2px;
  background: #409EFF;
  position: relative;
  overflow: hidden;
}

.arrow-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, #67C23A, transparent);
  animation: flow 2s ease-in-out infinite;
}

.flowing-arrow.active .arrow-line::after {
  animation: flow 2s ease-in-out infinite;
}

@keyframes flow {
  0% { left: -100%; }
  100% { left: 100%; }
}

.arrow-head {
  position: absolute;
  right: -8px;
  top: -4px;
  width: 0;
  height: 0;
  border-left: 8px solid #409EFF;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
}

/* 紧凑型架构图样式 */
.compact-architecture {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px 30px;
  margin: 30px 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.3);
}

.compact-architecture::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="15" height="15" patternUnits="userSpaceOnUse"><path d="M 15 0 L 0 0 0 15" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  pointer-events: none;
}

.arch-flow-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 800px;
  margin: 0 auto;
}

.compact-layer {
  text-align: center;
  width: 100%;
}

.dual-layer {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 60px;
  max-width: 600px;
}

.dual-layer .compact-layer {
  flex: 1;
}

.layer-title {
  color: white;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 18px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  display: inline-block;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
}

.compact-nodes-row {
  display: flex;
  justify-content: center;
  gap: 25px;
  flex-wrap: wrap;
  max-width: 500px;
  margin: 0 auto;
}

.compact-nodes-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.compact-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 18px 16px;
  border-radius: 16px;
  min-width: 100px;
  opacity: 0.4;
  transform: scale(0.85);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  position: relative;
  overflow: hidden;
}

.compact-node::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.8s ease;
}

.compact-node.active {
  opacity: 1;
  transform: scale(1);
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.25);
}

.compact-node.active::before {
  left: 100%;
}

.compact-node .el-icon {
  font-size: 32px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.compact-node span {
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 节点颜色样式 */
.user-node.active { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
.vue-node.active { background: linear-gradient(135deg, #4FC08D 0%, #43A047 100%); }
.element-node.active { background: linear-gradient(135deg, #409EFF 0%, #1976D2 100%); }
.chart-node.active { background: linear-gradient(135deg, #E6A23C 0%, #F57C00 100%); }
.fastapi-node.active { background: linear-gradient(135deg, #009688 0%, #00695C 100%); }
.python-node.active { background: linear-gradient(135deg, #3776ab 0%, #1565C0 100%); }
.rule-node.active { background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%); }
.deepseek-node.active { background: linear-gradient(135deg, #FF5722 0%, #D84315 100%); }
.langchain-node.active { background: linear-gradient(135deg, #795548 0%, #5D4037 100%); }
.sqlite-node.active { background: linear-gradient(135deg, #607D8B 0%, #455A64 100%); }
.json-node.active { background: linear-gradient(135deg, #FFC107 0%, #F57F17 100%); }

/* 流动连接器样式 */
.flowing-connector {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 1s ease;
  margin: 5px 0;
}

.flowing-connector.active {
  opacity: 1;
}

.flow-line {
  width: 6px;
  height: 40px;
  background: linear-gradient(180deg, #409EFF 0%, #67C23A 50%, #E6A23C 100%);
  position: relative;
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.4);
}

.flow-dots {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: radial-gradient(circle, #ffffff 0%, #409EFF 100%);
  border-radius: 50%;
  animation: flowDown 1.5s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.9), 0 0 40px rgba(64, 158, 255, 0.6);
}

.flow-dots::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

@keyframes flowDown {
  0% {
    top: -12px;
    opacity: 0;
    transform: translateX(-50%) scale(0.5);
  }
  15% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
  85% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
  100% {
    top: calc(100% + 12px);
    opacity: 0;
    transform: translateX(-50%) scale(0.5);
  }
}

/* 分支连接器样式 */
.branch-connector {
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  opacity: 0;
  transition: opacity 1s ease;
  margin: 10px 0;
}

.branch-connector.active {
  opacity: 1;
}

.branch-left-line, .branch-right-line {
  position: absolute;
  width: 120px;
  height: 6px;
  background: linear-gradient(90deg, #409EFF 0%, #67C23A 50%, #E6A23C 100%);
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(64, 158, 255, 0.4);
}

.branch-left-line {
  left: 25%;
  transform: rotate(30deg);
  transform-origin: right center;
}

.branch-right-line {
  right: 25%;
  transform: rotate(-30deg);
  transform-origin: left center;
}

.branch-left-line .flow-dots, .branch-right-line .flow-dots {
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: radial-gradient(circle, #ffffff 0%, #67C23A 100%);
  border-radius: 50%;
  animation: flowRight 1.8s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.9), 0 0 40px rgba(103, 194, 58, 0.6);
}

.branch-left-line .flow-dots::after, .branch-right-line .flow-dots::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

@keyframes flowRight {
  0% {
    left: -12px;
    opacity: 0;
    transform: translateY(-50%) scale(0.5);
  }
  15% {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
  85% {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
  100% {
    left: calc(100% + 12px);
    opacity: 0;
    transform: translateY(-50%) scale(0.5);
  }
}

/* 数据流总结样式 */
.data-flow-summary {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 25px;
  margin-top: 15px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.flow-summary-title {
  color: white;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 25px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.flow-summary-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.summary-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  opacity: 0.4;
  transform: scale(0.85);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.summary-step::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.8s ease;
}

.summary-step.active {
  opacity: 1;
  transform: scale(1);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
}

.summary-step.active::before {
  left: 100%;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
  flex-shrink: 0;
}

.step-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-text strong {
  color: white;
  font-size: 16px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.step-text span {
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 500;
}

.summary-arrow {
  color: rgba(255, 255, 255, 0.7);
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* 技术栈浮动按钮样式 */
.tech-stack-trigger {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  color: white;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
}

.tech-stack-trigger:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
}

.tech-stack-trigger .el-icon {
  font-size: 18px;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 技术栈面板样式 */
.tech-stack-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.5);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.tech-stack-panel.active {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, -50%) scale(1);
}

.panel-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px 30px;
  position: relative;
  text-align: center;
}

.panel-header h4 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.panel-header p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  color: white !important;
  font-size: 20px;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: rotate(90deg);
}

/* 技术分类样式 */
.tech-categories {
  padding: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  max-height: 60vh;
  overflow-y: auto;
}

.tech-category {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.tech-category:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}

.category-header .el-icon {
  font-size: 24px;
  color: #667eea;
}

.category-header span {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tech-tag {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.tech-tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.tech-tag:hover::before {
  left: 100%;
}

.tech-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* 技术标签颜色 */
.vue-tag { background: linear-gradient(135deg, #4FC08D, #43A047); }
.element-tag { background: linear-gradient(135deg, #409EFF, #1976D2); }
.chart-tag { background: linear-gradient(135deg, #E6A23C, #F57C00); }
.ts-tag { background: linear-gradient(135deg, #3178C6, #1565C0); }
.vite-tag { background: linear-gradient(135deg, #646CFF, #4338CA); }
.fastapi-tag { background: linear-gradient(135deg, #009688, #00695C); }
.python-tag { background: linear-gradient(135deg, #3776ab, #1565C0); }
.sqlite-tag { background: linear-gradient(135deg, #607D8B, #455A64); }
.uvicorn-tag { background: linear-gradient(135deg, #795548, #5D4037); }
.pydantic-tag { background: linear-gradient(135deg, #E91E63, #C2185B); }
.deepseek-tag { background: linear-gradient(135deg, #FF5722, #D84315); }
.langchain-tag { background: linear-gradient(135deg, #795548, #5D4037); }
.openai-tag { background: linear-gradient(135deg, #00A67E, #00695C); }
.embedding-tag { background: linear-gradient(135deg, #9C27B0, #7B1FA2); }
.rag-tag { background: linear-gradient(135deg, #FF9800, #F57C00); }
.git-tag { background: linear-gradient(135deg, #F05032, #D84315); }
.pnpm-tag { background: linear-gradient(135deg, #F69220, #F57C00); }
.eslint-tag { background: linear-gradient(135deg, #4B32C3, #3F51B5); }
.prettier-tag { background: linear-gradient(135deg, #F7B93E, #F57C00); }
.vscode-tag { background: linear-gradient(135deg, #007ACC, #1976D2); }

/* 遮罩层样式 */
.tech-stack-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.tech-stack-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tech-stack-panel {
    width: 95%;
    max-height: 85vh;
  }

  .tech-categories {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 20px;
  }

  .panel-header {
    padding: 20px;
  }

  .panel-header h4 {
    font-size: 20px;
  }

  .tech-stack-trigger {
    top: 15px;
    right: 15px;
    padding: 10px 16px;
    font-size: 13px;
  }
}

.tech-nodes {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.tech-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.5;
  transform: scale(0.8);
  transition: all 0.8s ease;
}

.tech-node.active {
  opacity: 1;
  transform: scale(1);
}

.node-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  margin-bottom: 12px;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.node-label {
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  text-align: center;
}

.node-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  text-align: center;
}

/* 节点颜色样式 */
.user-node { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
.vue-node { background: linear-gradient(135deg, #4FC08D 0%, #43A047 100%); }
.element-node { background: linear-gradient(135deg, #409EFF 0%, #1976D2 100%); }
.chart-node { background: linear-gradient(135deg, #E6A23C 0%, #F57C00 100%); }
.fastapi-node { background: linear-gradient(135deg, #009688 0%, #00695C 100%); }
.python-node { background: linear-gradient(135deg, #3776ab 0%, #1565C0 100%); }
.rule-node { background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%); }
.deepseek-node { background: linear-gradient(135deg, #FF5722 0%, #D84315 100%); }
.langchain-node { background: linear-gradient(135deg, #795548 0%, #5D4037 100%); }
.sqlite-node { background: linear-gradient(135deg, #607D8B 0%, #455A64 100%); }
.json-node { background: linear-gradient(135deg, #FFC107 0%, #F57F17 100%); }

/* 流动连接器样式 */
.flow-connector {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

.flow-connector.vertical {
  height: 60px;
}

.flow-connector.branch {
  height: 80px;
}

.branch-container {
  display: flex;
  width: 300px;
  justify-content: space-between;
  position: relative;
}

.branch-left, .branch-right {
  width: 120px;
  height: 60px;
  position: relative;
}

.animated-arrow {
  opacity: 0;
  transition: opacity 0.8s ease;
}

.animated-arrow.active {
  opacity: 1;
}

.animated-arrow.vertical .arrow-line {
  width: 3px;
  height: 40px;
  background: linear-gradient(180deg, #409EFF, #67C23A);
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.animated-arrow.vertical .arrow-line::after {
  content: '';
  position: absolute;
  left: 0;
  top: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: flowVertical 2s ease-in-out infinite;
}

.animated-arrow.diagonal .arrow-line {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  position: relative;
  overflow: hidden;
  transform: rotate(25deg);
}

.animated-arrow.diagonal-right .arrow-line {
  transform: rotate(-25deg);
}

.arrow-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  animation: pulse 1.5s ease-in-out infinite;
}

.dot:nth-child(2) { animation-delay: 0.3s; }
.dot:nth-child(3) { animation-delay: 0.6s; }

@keyframes flowVertical {
  0% { top: -100%; }
  100% { top: 100%; }
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.tech-stack {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.tech-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px 0;
  text-align: center;
}

.tech-items {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.tech-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.tech-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.tech-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  margin-right: 12px;
}

.tech-info h5 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}

.tech-info span {
  font-size: 12px;
  color: #909399;
}

/* 数据流展示样式 */
.data-flow-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 30px;
  margin: 40px 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.flow-title {
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 30px;
}

.flow-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.5;
  transform: translateY(20px);
  transition: all 0.8s ease;
  min-width: 200px;
}

.flow-step.active {
  opacity: 1;
  transform: translateY(0);
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #67C23A, #409EFF);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 15px;
  box-shadow: 0 4px 16px rgba(103, 194, 58, 0.3);
}

.step-content h5 {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  text-align: center;
}

.step-content p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0;
  text-align: center;
  line-height: 1.5;
}

.step-arrow {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  font-weight: bold;
  opacity: 0.5;
  transition: all 0.8s ease;
}

.step-arrow.active {
  opacity: 1;
  color: #67C23A;
  animation: arrowPulse 2s ease-in-out infinite;
}

@keyframes arrowPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}



/* 设计展示样式 */
.design-section {
  background: #fff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.design-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* 优化的三阶段卡片样式 */
.compact-stages-container {
  max-width: 1000px;
  margin: 0 auto 50px;
  position: relative;
}

.stage-card-wrapper {
  position: relative;
  height: 420px;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  background: #ffffff;
  border: 1px solid #f0f0f0;
}

.stage-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 16px;
  padding: 24px 32px;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: 0;
  transform: translateX(100%);
  display: flex;
  flex-direction: column;
}

.stage-card.active {
  opacity: 1;
  transform: translateX(0);
  z-index: 2;
}

.stage-card.slide-left {
  transform: translateX(-100%);
  z-index: 1;
}

.stage-card.slide-right {
  transform: translateX(100%);
  z-index: 1;
}

.stage-card.stage-1 {
  border-left: 4px solid #67C23A;
  background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%);
}

.stage-card.stage-2 {
  border-left: 4px solid #E6A23C;
  background: linear-gradient(135deg, #fff7e6 0%, #ffffff 100%);
}

.stage-card.stage-3 {
  border-left: 4px solid #409EFF;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
}

/* 优化的阶段标题 */
.compact-stage-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.stage-number-compact {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #36A3F7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  margin-right: 16px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.stage-info-compact {
  flex: 1;
  min-width: 0;
}

.stage-title-compact {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.stage-subtitle-compact {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.stage-status-compact {
  margin-left: auto;
  flex-shrink: 0;
}

/* 优化的功能模块网格 */
.compact-modules-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  flex: 1;
  align-content: start;
}

.compact-module-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fafbfc;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
}

.compact-module-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05), rgba(64, 158, 255, 0.02));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.compact-module-item:hover::before {
  opacity: 1;
}

.compact-module-item:hover {
  border-color: #409EFF;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
  transform: translateY(-1px);
  background: #ffffff;
}

.compact-module-item.available {
  cursor: pointer;
}

.compact-module-item:not(.available) {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

.module-icon-compact {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(135deg, #409EFF, #36A3F7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
}

.module-content-compact {
  flex: 1;
  min-width: 0;
}

.module-name-compact {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 2px 0;
  line-height: 1.3;
}

.module-desc-compact {
  font-size: 11px;
  color: #6b7280;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.module-action-compact {
  margin-left: 8px;
  flex-shrink: 0;
}

/* 优化的进度条 */
.compact-stage-progress {
  background: #fafbfc;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  margin-top: auto;
  flex-shrink: 0;
}

.progress-info-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-label-compact {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.progress-value-compact {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}

/* 优化的阶段控制器 */
.stage-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  padding: 0 20px;
  gap: 40px;
}

.stage-indicators {
  display: flex;
  gap: 8px;
  align-items: center;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.indicator-dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: transparent;
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background: #409EFF;
  transform: scale(1.5);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.indicator-dot:hover:not(.active) {
  background: #9ca3af;
  transform: scale(1.2);
}

.stage-navigation {
  display: flex;
  gap: 12px;
  align-items: center;
}

.nav-btn {
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 16px;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #6b7280;
}

.nav-btn:not(:disabled):hover {
  background: #f0f9ff;
  color: #409EFF;
  border-color: #409EFF;
  transform: translateY(-1px);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 卡片切换动画增强 */
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

.stage-card.active .compact-stage-header {
  animation: slideInRight 0.6s ease-out 0.1s both;
}

.stage-card.active .compact-modules-grid {
  animation: slideInRight 0.6s ease-out 0.2s both;
}

.stage-card.active .compact-stage-progress {
  animation: slideInRight 0.6s ease-out 0.3s both;
}

/* 模块项悬停动画 */
.compact-module-item {
  transform-origin: center;
}

.compact-module-item:hover .module-icon-compact {
  transform: scale(1.1) rotate(5deg);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 指示器脉冲动画 */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(64, 158, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
}

.indicator-dot.active {
  animation: pulse 2s infinite;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #409EFF, #36A3F7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 16px;
}

.feature-info {
  flex: 1;
}

.feature-info h5 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}

.feature-info p {
  font-size: 12px;
  color: #606266;
  margin: 0;
}

.feature-action {
  margin-left: 12px;
}

.stage-progress {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 14px;
  color: #606266;
}

.progress-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* AI助手展示样式 */
.ai-assistant-showcase {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 40px;
  color: white;
}

.showcase-header {
  text-align: center;
  margin-bottom: 40px;
}

.showcase-title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.showcase-title .el-icon {
  margin-right: 12px;
  font-size: 32px;
}

.showcase-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.showcase-content {
  margin-bottom: 40px;
}

.ai-features h4,
.ai-roadmap h4 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: white;
}

.ai-feature-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-feature-item {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.feature-badge {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 16px;
  flex-shrink: 0;
}

.feature-active {
  background: rgba(103, 194, 58, 0.3);
  color: #67C23A;
}

.feature-planning {
  background: rgba(230, 162, 60, 0.3);
  color: #E6A23C;
}

.feature-content {
  flex: 1;
}

.feature-content h5 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
}

.feature-content p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.feature-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.roadmap-timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  position: relative;
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 16px;
  margin-top: 4px;
  flex-shrink: 0;
}

.timeline-dot.completed {
  background: #67C23A;
  box-shadow: 0 0 0 4px rgba(103, 194, 58, 0.3);
}

.timeline-dot.current {
  background: #E6A23C;
  box-shadow: 0 0 0 4px rgba(230, 162, 60, 0.3);
  animation: pulse 2s infinite;
}

.timeline-dot.planned {
  background: #909399;
  box-shadow: 0 0 0 4px rgba(144, 147, 153, 0.3);
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 4px rgba(230, 162, 60, 0.3); }
  50% { box-shadow: 0 0 0 8px rgba(230, 162, 60, 0.1); }
  100% { box-shadow: 0 0 0 4px rgba(230, 162, 60, 0.3); }
}

.timeline-content {
  flex: 1;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timeline-header h5 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.timeline-date {
  font-size: 12px;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
}

.timeline-content p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.timeline-goals {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.showcase-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.showcase-actions .el-button {
  padding: 12px 24px;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 优化的卡片响应式 */
  .compact-stages-container {
    max-width: 100%;
    margin: 0 auto 30px;
  }

  .stage-card-wrapper {
    height: 480px;
    border-radius: 12px;
    margin: 0 10px;
  }

  .stage-card {
    padding: 20px 24px;
  }

  .compact-stage-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }

  .stage-title-compact {
    font-size: 16px;
  }

  .stage-subtitle-compact {
    font-size: 12px;
  }

  .compact-modules-grid {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }

  .compact-module-item {
    padding: 14px;
  }

  .module-name-compact {
    font-size: 12px;
  }

  .module-desc-compact {
    font-size: 10px;
  }

  .compact-stage-progress {
    padding: 12px;
  }

  .stage-controls {
    flex-direction: column;
    gap: 16px;
    margin-top: 16px;
    padding: 0 10px;
  }

  .stage-navigation {
    order: -1;
  }

  .nav-btn {
    font-size: 12px;
    padding: 5px 10px;
  }

  .title-main {
    font-size: 36px;
  }

  .section {
    margin-bottom: 30px;
  }

  .section-title {
    font-size: 24px;
  }

  .background-section,
  .framework-section,
  .design-section {
    padding: 20px;
  }

  .flow-nodes {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .tech-items {
    flex-direction: column;
    align-items: center;
  }

  .stage-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .stage-status {
    margin-left: 0;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .showcase-actions {
    flex-direction: column;
    align-items: center;
  }

  .showcase-actions .el-button {
    width: 100%;
    max-width: 300px;
  }
}

/* 保留原有的基础样式 */
.welcome-card {
  margin-bottom: 24px;
  text-align: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  color: #409EFF;
}

.welcome-content {
  padding: 20px 0;
}

.system-intro {
  font-size: 16px;
  line-height: 1.6;
  color: #606266;
}

.architecture-btn {
  margin-top: 16px;
}

/* 数据仪表盘样式 */
.dashboard-row {
  margin-bottom: 24px;
}

.dashboard-content {
  padding: 10px 0;
}

.data-card {
  display: flex;
  padding: 16px;
  border-radius: 8px;
  background-color: #f5f7fa;
  transition: all 0.3s;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.data-icon {
  font-size: 40px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: white;
}

.factory-icon {
  background-color: #409EFF;
}

.lab-icon {
  background-color: #67C23A;
}

.online-icon {
  background-color: #E6A23C;
}

.risk-icon {
  background-color: #F56C6C;
}

.data-info {
  flex: 1;
}

.data-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.data-desc {
  font-size: 12px;
  color: #606266;
}

.data-label {
  margin-right: 5px;
}

.data-metric {
  font-weight: bold;
}

.feature-row {
  margin-bottom: 24px;
}

.feature-card {
  height: 150px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  font-size: 36px;
  color: #409EFF;
}

.feature-info {
  text-align: center;
}

.feature-info h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  margin-bottom: 5px;
}

.feature-info p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.feature-action {
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding-top: 10px;
}

.chart-row {
  margin-bottom: 24px;
}

.chart-content {
  padding: 10px 0;
}

.recommendation-content {
  padding: 10px 0;
}

.welcome-card {
  margin-bottom: 24px;
  text-align: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  color: #409EFF;
}

.welcome-content {
  padding: 20px 0;
}

.system-intro {
  font-size: 16px;
  line-height: 1.6;
  color: #606266;
}

.architecture-btn {
  margin-top: 16px;
}

/* 数据仪表盘样式 */
.dashboard-row {
  margin-bottom: 24px;
}

.dashboard-content {
  padding: 10px 0;
}

.data-card {
  display: flex;
  padding: 16px;
  border-radius: 8px;
  background-color: #f5f7fa;
  transition: all 0.3s;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.data-icon {
  font-size: 40px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: white;
}

.factory-icon {
  background-color: #409EFF;
}

.lab-icon {
  background-color: #67C23A;
}

.online-icon {
  background-color: #E6A23C;
}

.risk-icon {
  background-color: #F56C6C;
}

.data-info {
  flex: 1;
}

.data-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.data-desc {
  font-size: 12px;
  color: #606266;
}

.data-label {
  margin-right: 5px;
}

.data-metric {
  font-weight: bold;
}

.feature-row {
  margin-bottom: 24px;
}

.feature-card {
  height: 150px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  font-size: 36px;
  color: #409EFF;
}

.feature-info {
  text-align: center;
}

.feature-info h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  margin-bottom: 5px;
}

.feature-info p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.feature-action {
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding-top: 10px;
}

.chart-row {
  margin-bottom: 24px;
}

.chart-content {
  padding: 10px 0;
}

.recommendation-content {
  padding: 10px 0;
}

/* AI助手独立section样式 */
.ai-assistant-section {
  margin-top: 60px;
}

.ai-assistant-section .section-header {
  text-align: center;
  margin-bottom: 50px;
}

.ai-assistant-section .section-title {
  font-size: 36px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.ai-assistant-section .section-title .el-icon {
  font-size: 40px;
  color: #667eea;
}

.ai-assistant-section .section-subtitle {
  font-size: 18px;
  color: #7f8c8d;
  margin: 0;
}

/* 重新设计的AI助手内容区域 */
.ai-assistant-content {
  background: linear-gradient(135deg, #f8faff 0%, #e8f4fd 100%);
  border-radius: 20px;
  padding: 50px;
  color: #2c3e50;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

/* 对称布局容器 */
.ai-symmetric-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  align-items: stretch; /* 确保两列高度一致 */
}

/* 左右列样式 */
.ai-column {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 列标题样式 */
.column-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.header-icon {
  font-size: 24px;
  color: #667eea;
}

.column-title {
  font-size: 22px;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 对称网格 */
.symmetric-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

/* 对称卡片 */
.symmetric-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 25px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  border: 1px solid rgba(102, 126, 234, 0.15);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  height: 160px; /* 固定高度确保完全对称 */
}

.symmetric-card:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.2);
}

/* 卡片图标样式 */
.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* 功能图标颜色 */
.card-icon.feature-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-icon.feature-green {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.card-icon.feature-orange {
  background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%);
}

.card-icon.feature-purple {
  background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
}

/* 路线图图标颜色 - 与核心功能图标保持一致 */
.card-icon.roadmap-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-icon.roadmap-green {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.card-icon.roadmap-orange {
  background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%);
}

.card-icon.roadmap-purple {
  background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
}

/* 卡片内容 */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  gap: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.card-title {
  font-size: 17px;
  font-weight: bold;
  margin: 0;
  color: #2c3e50;
}

.card-time {
  font-size: 11px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.card-description {
  font-size: 13px;
  color: #5a6c7d;
  line-height: 1.5;
  margin: 0;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 标签样式 */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex-shrink: 0;
  margin-top: auto;
}

.tag-item {
  font-size: 11px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 3px 8px;
  border-radius: 10px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  font-weight: 500;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-symmetric-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .symmetric-card {
    height: auto;
    min-height: 140px;
    padding: 20px;
    gap: 15px;
  }

  .card-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }

  .column-header {
    margin-bottom: 20px;
  }

  .card-title {
    font-size: 16px;
  }

  .card-description {
    font-size: 12px;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .tag-item {
    font-size: 10px;
    padding: 2px 6px;
  }
}





.ai-assistant-actions {
  text-align: center;
  margin-top: 50px;
  padding-top: 40px;
  border-top: 1px solid rgba(102, 126, 234, 0.15);
}

.ai-assistant-actions .el-button {
  margin: 0 15px;
  padding: 15px 30px;
  font-size: 16px;
  border-radius: 30px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.ai-assistant-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.25);
}
</style>