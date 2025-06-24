<template>
  <div class="system-settings">
    <h2 class="page-title">系统设置</h2>
    
    <el-card class="settings-card">
      <el-tabs v-model="activeTab" tab-position="left" class="settings-tabs">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <h3 class="section-title">基本系统设置</h3>
          
          <el-form label-width="120px" :model="basicSettings" class="settings-form">
            <el-form-item label="系统名称">
              <el-input v-model="basicSettings.systemName" />
            </el-form-item>
            
            <el-form-item label="日志级别">
              <el-select v-model="basicSettings.logLevel">
                <el-option label="调试" value="debug" />
                <el-option label="信息" value="info" />
                <el-option label="警告" value="warn" />
                <el-option label="错误" value="error" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="数据保留天数">
              <el-input-number v-model="basicSettings.dataRetentionDays" :min="1" :max="365" />
            </el-form-item>
            
            <el-form-item label="语言">
              <el-select v-model="basicSettings.language">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="主题">
              <el-select v-model="basicSettings.theme">
                <el-option label="浅色" value="light" />
                <el-option label="深色" value="dark" />
                <el-option label="跟随系统" value="auto" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="自动刷新间隔">
              <el-select v-model="basicSettings.refreshInterval">
                <el-option label="10秒" :value="10" />
                <el-option label="30秒" :value="30" />
                <el-option label="1分钟" :value="60" />
                <el-option label="5分钟" :value="300" />
                <el-option label="不自动刷新" :value="0" />
              </el-select>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveBasicSettings">保存设置</el-button>
              <el-button @click="resetBasicSettings">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 用户管理 -->
        <el-tab-pane label="用户管理" name="users">
          <h3 class="section-title">用户管理</h3>
          
          <div class="user-controls">
            <el-button type="primary" @click="showAddUserDialog = true">添加用户</el-button>
            <el-input
              v-model="userSearchQuery"
              placeholder="搜索用户"
              class="user-search"
              clearable
            >
              <template #prefix>
                <el-icon><el-icon-search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <el-table :data="filteredUsers" style="width: 100%" stripe>
            <el-table-column prop="username" label="用户名" width="150"></el-table-column>
            <el-table-column prop="realName" label="真实姓名" width="180"></el-table-column>
            <el-table-column prop="role" label="角色">
              <template #default="scope">
                <el-tag :type="getRoleTagType(scope.row.role)">{{ scope.row.role }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="email" label="邮箱"></el-table-column>
            <el-table-column prop="lastLogin" label="上次登录时间" width="180"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === '启用' ? 'success' : 'danger'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button 
                  size="small"
                  @click="editUser(scope.row)"
                >编辑</el-button>
                <el-button 
                  size="small"
                  :type="scope.row.status === '启用' ? 'danger' : 'success'"
                  @click="toggleUserStatus(scope.row)"
                >{{ scope.row.status === '启用' ? '禁用' : '启用' }}</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 添加/编辑用户对话框 -->
          <el-dialog
            v-model="showAddUserDialog"
            :title="editingUser ? '编辑用户' : '添加新用户'"
            width="500px"
          >
            <el-form :model="userForm" label-width="100px">
              <el-form-item label="用户名">
                <el-input v-model="userForm.username" />
              </el-form-item>
              <el-form-item label="真实姓名">
                <el-input v-model="userForm.realName" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="userForm.email" />
              </el-form-item>
              <el-form-item label="角色">
                <el-select v-model="userForm.role">
                  <el-option label="管理员" value="管理员" />
                  <el-option label="技术员" value="技术员" />
                  <el-option label="工程师" value="工程师" />
                  <el-option label="操作员" value="操作员" />
                  <el-option label="访客" value="访客" />
                </el-select>
              </el-form-item>
              <el-form-item label="密码" v-if="!editingUser">
                <el-input v-model="userForm.password" type="password" />
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="showAddUserDialog = false">取消</el-button>
              <el-button type="primary" @click="saveUser">保存</el-button>
            </template>
          </el-dialog>
        </el-tab-pane>
        
        <!-- 数据库配置 -->
        <el-tab-pane label="数据库配置" name="database">
          <h3 class="section-title">数据库配置</h3>
          
          <el-alert
            title="修改数据库配置可能会导致系统不可用，请谨慎操作！"
            type="warning"
            :closable="false"
            show-icon
            class="db-warning"
          ></el-alert>
          
          <el-form label-width="120px" :model="dbSettings" class="settings-form">
            <el-form-item label="数据库类型">
              <el-select v-model="dbSettings.type">
                <el-option label="MySQL" value="mysql" />
                <el-option label="PostgreSQL" value="postgresql" />
                <el-option label="SQLite" value="sqlite" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="主机名" v-if="dbSettings.type !== 'sqlite'">
              <el-input v-model="dbSettings.host" />
            </el-form-item>
            
            <el-form-item label="端口" v-if="dbSettings.type !== 'sqlite'">
              <el-input-number v-model="dbSettings.port" :min="1" :max="65535" />
            </el-form-item>
            
            <el-form-item label="数据库名称">
              <el-input v-model="dbSettings.name" />
            </el-form-item>
            
            <el-form-item label="用户名" v-if="dbSettings.type !== 'sqlite'">
              <el-input v-model="dbSettings.username" />
            </el-form-item>
            
            <el-form-item label="密码" v-if="dbSettings.type !== 'sqlite'">
              <el-input v-model="dbSettings.password" type="password" />
            </el-form-item>
            
            <el-form-item label="连接池大小">
              <el-input-number v-model="dbSettings.poolSize" :min="1" :max="100" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveDbSettings">保存配置</el-button>
              <el-button type="success" @click="testDbConnection">测试连接</el-button>
              <el-button @click="resetDbSettings">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 系统信息 -->
        <el-tab-pane label="系统信息" name="system">
          <h3 class="section-title">系统信息</h3>
          
          <div class="system-info-cards">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card shadow="hover" class="info-card">
                  <template #header>
                    <div class="card-header">
                      <h4>软件信息</h4>
                    </div>
                  </template>
                  <div class="info-items">
                    <div class="info-item">
                      <span class="info-label">系统版本:</span>
                      <span class="info-value">v2.5.3</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">构建日期:</span>
                      <span class="info-value">2023-11-05</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">上次更新:</span>
                      <span class="info-value">2023-11-08 15:30:22</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">许可证:</span>
                      <span class="info-value">企业版 (有效期至 2024-12-31)</span>
                    </div>
                  </div>
                  <div class="update-section">
                    <el-button type="primary" size="small">检查更新</el-button>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :span="12">
                <el-card shadow="hover" class="info-card">
                  <template #header>
                    <div class="card-header">
                      <h4>系统状态</h4>
                    </div>
                  </template>
                  <div class="info-items">
                    <div class="info-item">
                      <span class="info-label">CPU使用率:</span>
                      <el-progress :percentage="systemStatus.cpu" :format="percentFormat" />
                    </div>
                    <div class="info-item">
                      <span class="info-label">内存使用率:</span>
                      <el-progress :percentage="systemStatus.memory" :format="percentFormat" />
                    </div>
                    <div class="info-item">
                      <span class="info-label">磁盘使用率:</span>
                      <el-progress :percentage="systemStatus.disk" :format="percentFormat" />
                    </div>
                    <div class="info-item">
                      <span class="info-label">系统运行时间:</span>
                      <span class="info-value">{{ systemStatus.uptime }}</span>
                    </div>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :span="24" class="mt-20">
                <el-card shadow="hover" class="info-card">
                  <template #header>
                    <div class="card-header">
                      <h4>日志级别统计</h4>
                    </div>
                  </template>
                  <div class="log-stats">
                    <div ref="logStatsChart" class="log-chart"></div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
        
        <!-- 数据管理 -->
        <el-tab-pane label="数据管理" name="data">
          <h3 class="section-title">数据管理</h3>
          
          <el-card class="data-card">
            <template #header>
              <div class="card-header">
                <h4>数据统计</h4>
                <el-button type="primary" size="small" @click="refreshDataStats">
                  <el-icon><Refresh /></el-icon> 刷新统计
                </el-button>
              </div>
            </template>
            
            <div class="data-stats">
              <div class="data-stat-item">
                <span class="stat-label">物料测试数据：</span>
                <span class="stat-value">{{ dataStats.labCount }} 条</span>
                <span class="stat-timestamp" v-if="dataStats.labTimestamp">
                  更新时间：{{ formatTimestamp(dataStats.labTimestamp) }}
                </span>
              </div>
              <div class="data-stat-item">
                <span class="stat-label">物料上线数据：</span>
                <span class="stat-value">{{ dataStats.factoryCount }} 条</span>
                <span class="stat-timestamp" v-if="dataStats.factoryTimestamp">
                  更新时间：{{ formatTimestamp(dataStats.factoryTimestamp) }}
                </span>
              </div>
              <div class="data-stat-item">
                <span class="stat-label">库存数据：</span>
                <span class="stat-value">{{ dataStats.inventoryCount }} 条</span>
                <span class="stat-timestamp" v-if="dataStats.inventoryTimestamp">
                  更新时间：{{ formatTimestamp(dataStats.inventoryTimestamp) }}
                </span>
              </div>
              <div class="data-stat-item">
                <span class="stat-label">数据总量：</span>
                <span class="stat-value">{{ dataStats.totalCount }} 条</span>
              </div>
              <div class="data-stat-item">
                <span class="stat-label">存储使用：</span>
                <span class="stat-value">{{ dataStats.storageUsage.totalSize }}KB ({{ dataStats.storageUsage.usagePercentage }})</span>
              </div>
              <div class="data-stat-item">
                <span class="stat-label">统计时间：</span>
                <span class="stat-value">{{ dataStats.lastUpdated ? formatTimestamp(dataStats.lastUpdated) : '未知' }}</span>
              </div>
            </div>
            
            <div class="data-actions">
              <el-button type="primary" @click="generateAllData" :loading="isGenerating">
                <el-icon><Plus /></el-icon> 生成测试数据
              </el-button>
              <el-button type="success" @click="exportAllData">
                <el-icon><Download /></el-icon> 导出数据
              </el-button>
              <el-button type="warning" @click="confirmCleanupOldData">
                <el-icon><Delete /></el-icon> 清理旧数据
              </el-button>
              <el-button type="primary" @click="clearAllData" :loading="isClearing">
                <el-icon><Delete /></el-icon> 清空所有数据
              </el-button>
              <el-button type="danger" @click="resetSystem" :loading="isResetting">
                <el-icon><RefreshLeft /></el-icon> 重置系统
              </el-button>
            </div>
          </el-card>
          
          <el-card class="data-card">
            <template #header>
              <div class="card-header">
                <h4>数据操作</h4>
              </div>
            </template>
            
            <div class="data-actions">
              <el-button type="primary" @click="confirmClearData('lab')">
                清空物料测试数据
              </el-button>
              <el-button type="primary" @click="confirmClearData('factory')">
                清空物料上线数据
              </el-button>
              <el-button type="primary" @click="confirmClearData('inventory')">
                清空库存数据
              </el-button>
              <el-button type="warning" @click="fixDataIssues">
                修复数据问题
              </el-button>
            </div>
          </el-card>
          
          <!-- 清理旧数据对话框 -->
          <el-dialog
            v-model="showCleanupDialog"
            title="清理旧数据"
            width="500px"
          >
            <div class="cleanup-form">
              <p>此操作将保留每种数据类型的最新记录，并清除旧记录以释放存储空间。</p>
              <el-form>
                <el-form-item label="保留记录数量">
                  <el-input-number v-model="cleanupConfig.keepCount" :min="50" :max="1000" />
                  <span class="operation-hint">每种数据类型保留的最新记录数量</span>
                </el-form-item>
              </el-form>
            </div>
            <template #footer>
              <el-button @click="showCleanupDialog = false">取消</el-button>
              <el-button type="primary" @click="cleanupOldData">确认清理</el-button>
            </template>
          </el-dialog>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as echarts from 'echarts';
import unifiedDataService from '../services/UnifiedDataService';
import SystemDataUpdater from '../services/SystemDataUpdater';
import { Download, Plus, Refresh, Delete, RefreshLeft } from '@element-plus/icons-vue';

// 当前激活的标签页
const activeTab = ref('basic');

// 基本设置
const basicSettings = reactive({
  systemName: 'IQE智能动态检验系统',
  logLevel: 'info',
  dataRetentionDays: 90,
  language: 'zh-CN',
  theme: 'light',
  refreshInterval: 60
});

// 数据库配置
const dbSettings = reactive({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  name: 'iqe_inspection',
  username: 'iqeuser',
  password: '********',
  poolSize: 10
});

// 用户管理
const users = ref([
  { 
    id: 1, 
    username: 'admin', 
    realName: '系统管理员', 
    role: '管理员', 
    email: 'admin@example.com',
    lastLogin: '2023-11-10 08:35:22',
    status: '启用'
  },
  { 
    id: 2, 
    username: 'engineer1', 
    realName: '张工程师', 
    role: '工程师', 
    email: 'engineer1@example.com',
    lastLogin: '2023-11-09 14:22:10',
    status: '启用'
  },
  { 
    id: 3, 
    username: 'tech1', 
    realName: '李技术员', 
    role: '技术员', 
    email: 'tech1@example.com',
    lastLogin: '2023-11-10 07:15:33',
    status: '启用'
  },
  { 
    id: 4, 
    username: 'operator1', 
    realName: '王操作员', 
    role: '操作员', 
    email: 'operator1@example.com',
    lastLogin: '2023-11-09 16:40:05',
    status: '启用'
  },
  { 
    id: 5, 
    username: 'guest1', 
    realName: '访客用户', 
    role: '访客', 
    email: 'guest1@example.com',
    lastLogin: '2023-10-25 10:18:42',
    status: '禁用'
  }
]);

// 用户搜索
const userSearchQuery = ref('');
const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return users.value;
  
  const query = userSearchQuery.value.toLowerCase();
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.realName.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.role.toLowerCase().includes(query)
  );
});

// 用户表单
const showAddUserDialog = ref(false);
const editingUser = ref(null);
const userForm = reactive({
  username: '',
  realName: '',
  email: '',
  role: '操作员',
  password: ''
});

// 系统状态
const systemStatus = reactive({
  cpu: 45,
  memory: 62,
  disk: 28,
  uptime: '3天 12小时 45分钟'
});

// 日志图表实例
let logChartInstance = null;

// 新增：数据管理相关
const dataStats = reactive({
  labCount: 0,
  factoryCount: 0,
  inventoryCount: 0,
  totalCount: 0,
  lastUpdated: null,
  labTimestamp: null,
  factoryTimestamp: null,
  inventoryTimestamp: null,
  storageUsage: {
    totalSize: '0',
    usagePercentage: '0%'
  }
});

// 新增：数据清理配置
const showCleanupDialog = ref(false);
const cleanupConfig = reactive({
  keepCount: 100
});

// 新增：SystemDataUpdater实例
const systemDataUpdater = new SystemDataUpdater();

// 系统重置状态
const isResetting = ref(false);
const isClearing = ref(false);
const isExporting = ref(false);
const isGenerating = ref(false);

// 生命周期钩子
onMounted(() => {
  initLogStatsChart();
  refreshDataStats();
});

onBeforeUnmount(() => {
  if (logChartInstance) {
    logChartInstance.dispose();
  }
});

// 格式化百分比显示
function percentFormat(val) {
  return val + '%';
}

// 保存基本设置
function saveBasicSettings() {
  ElMessage.success('基本设置已保存');
  // 实际应用中应该发送到后端保存
}

// 重置基本设置
function resetBasicSettings() {
  ElMessageBox.confirm('确定要重置所有设置吗？这将丢失您的更改。', '确认重置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    basicSettings.systemName = 'IQE智能动态检验系统';
    basicSettings.logLevel = 'info';
    basicSettings.dataRetentionDays = 90;
    basicSettings.language = 'zh-CN';
    basicSettings.theme = 'light';
    basicSettings.refreshInterval = 60;
    
    ElMessage.success('设置已重置');
  }).catch(() => {});
}

// 保存数据库设置
function saveDbSettings() {
  ElMessageBox.confirm('修改数据库设置可能导致系统暂时不可用，确定要保存吗？', '确认保存', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('数据库设置已保存');
    // 实际应用中应该发送到后端保存
  }).catch(() => {});
}

// 重置数据库设置
function resetDbSettings() {
  ElMessageBox.confirm('确定要重置数据库设置吗？这将丢失您的更改。', '确认重置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    dbSettings.type = 'mysql';
    dbSettings.host = 'localhost';
    dbSettings.port = 3306;
    dbSettings.name = 'iqe_inspection';
    dbSettings.username = 'iqeuser';
    dbSettings.password = '********';
    dbSettings.poolSize = 10;
    
    ElMessage.success('数据库设置已重置');
  }).catch(() => {});
}

// 测试数据库连接
function testDbConnection() {
  ElMessage.info('正在测试数据库连接...');
  
  // 模拟测试连接
  setTimeout(() => {
    ElMessage.success('数据库连接测试成功！');
  }, 1500);
}

// 获取角色对应的标签类型
function getRoleTagType(role) {
  switch (role) {
    case '管理员':
      return 'danger';
    case '工程师':
      return 'warning';
    case '技术员':
      return 'success';
    case '操作员':
      return 'info';
    case '访客':
      return '';
    default:
      return '';
  }
}

// 编辑用户
function editUser(user) {
  editingUser.value = user;
  userForm.username = user.username;
  userForm.realName = user.realName;
  userForm.email = user.email;
  userForm.role = user.role;
  userForm.password = '';
  
  showAddUserDialog.value = true;
}

// 切换用户状态
function toggleUserStatus(user) {
  user.status = user.status === '启用' ? '禁用' : '启用';
  ElMessage.success(`用户 ${user.username} 已${user.status}`);
}

// 保存用户
function saveUser() {
  if (editingUser.value) {
    // 更新现有用户
    const index = users.value.findIndex(u => u.id === editingUser.value.id);
    if (index !== -1) {
      users.value[index].username = userForm.username;
      users.value[index].realName = userForm.realName;
      users.value[index].email = userForm.email;
      users.value[index].role = userForm.role;
      
      ElMessage.success(`用户 ${userForm.username} 已更新`);
    }
  } else {
    // 添加新用户
    const newId = Math.max(...users.value.map(u => u.id)) + 1;
    users.value.push({
      id: newId,
      username: userForm.username,
      realName: userForm.realName,
      email: userForm.email,
      role: userForm.role,
      lastLogin: '-',
      status: '启用'
    });
    
    ElMessage.success(`用户 ${userForm.username} 已创建`);
  }
  
  showAddUserDialog.value = false;
  editingUser.value = null;
  
  // 重置表单
  userForm.username = '';
  userForm.realName = '';
  userForm.email = '';
  userForm.role = '操作员';
  userForm.password = '';
}

// 初始化日志统计图表
function initLogStatsChart() {
  const chartDom = document.querySelector('.log-chart');
  if (!chartDom) return;
  
  logChartInstance = echarts.init(chartDom);
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: '日志级别',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 24, name: '错误', itemStyle: { color: '#F56C6C' } },
          { value: 58, name: '警告', itemStyle: { color: '#E6A23C' } },
          { value: 735, name: '信息', itemStyle: { color: '#409EFF' } },
          { value: 484, name: '调试', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  };
  
  logChartInstance.setOption(option);
  
  window.addEventListener('resize', () => {
    logChartInstance.resize();
  });
}

// 新增：刷新数据统计
function refreshDataStats() {
  try {
    // 获取统计信息
    const stats = unifiedDataService.getStats();
    
    // 更新统计数据
    dataStats.labCount = stats.labCount || 0;
    dataStats.factoryCount = stats.factoryCount || 0;
    dataStats.inventoryCount = stats.inventoryCount || 0;
    dataStats.totalCount = stats.totalCount || 0;
    dataStats.lastUpdated = new Date();
    dataStats.storageUsage = stats.storageUsage || {
      totalSize: '0',
      usagePercentage: '0%'
    };
    
    ElMessage.success('数据统计已刷新');
  } catch (error) {
    console.error('刷新数据统计失败:', error);
    ElMessage.error('刷新数据统计失败');
  }
}

// 新增：格式化时间戳
function formatTimestamp(timestamp) {
  if (!timestamp) return '未知';
  
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}

// 新增：确认清空特定类型数据
function confirmClearData(type) {
  let typeName = '';
  switch (type) {
    case 'lab':
      typeName = '物料测试数据';
      break;
    case 'factory':
      typeName = '物料上线数据';
      break;
    case 'inventory':
      typeName = '库存数据';
      break;
    default:
      typeName = '未知类型数据';
  }
  
  ElMessageBox.confirm(
    `确定要清空所有${typeName}吗？此操作不可恢复！`,
    '清空确认',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'error',
      closeOnClickModal: false
    }
  ).then(() => {
    clearData(type);
  }).catch(() => {
    // 用户取消操作
  });
}

// 新增：清空特定类型数据
function clearData(type) {
  try {
    let success = false;
    let typeName = '';
    
    switch (type) {
      case 'lab':
        success = unifiedDataService.clearData(unifiedDataService.STORAGE_KEYS.LAB);
        typeName = '物料测试数据';
        break;
      case 'factory':
        success = unifiedDataService.clearData(unifiedDataService.STORAGE_KEYS.FACTORY);
        typeName = '物料上线数据';
        break;
      case 'inventory':
        success = unifiedDataService.clearData(unifiedDataService.STORAGE_KEYS.INVENTORY);
        typeName = '库存数据';
        break;
      default:
        throw new Error('未知数据类型');
    }
    
    if (success) {
      ElMessage.success(`${typeName}已清空`);
      refreshDataStats();
    } else {
      throw new Error(`清空${typeName}失败`);
    }
  } catch (error) {
    console.error('清空数据失败:', error);
    ElMessage.error('清空数据失败，请重试');
  }
}

// 新增：确认清空所有数据
function confirmClearAllData() {
  ElMessageBox.confirm(
    '确定要清空所有数据吗？此操作将删除所有物料测试数据、上线数据和库存数据，且不可恢复！',
    '清空确认',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'error',
      closeOnClickModal: false,
      distinguishCancelAndClose: true
    }
  ).then(() => {
    clearAllData();
  }).catch(() => {
    // 用户取消操作
  });
}

// 新增：清空所有数据
function clearAllData() {
  try {
    const success = unifiedDataService.clearAllData();
    
    if (success) {
      ElMessage.success('所有数据已清空');
      refreshDataStats();
    } else {
      throw new Error('清空所有数据失败');
    }
  } catch (error) {
    console.error('清空所有数据失败:', error);
    ElMessage.error('清空所有数据失败，请重试');
  }
}

// 新增：确认清理旧数据
function confirmCleanupOldData() {
  showCleanupDialog.value = true;
}

// 新增：清理旧数据
function cleanupOldData() {
  try {
    const success = unifiedDataService.cleanupOldData(cleanupConfig.keepCount);
    
    if (success) {
      ElMessage.success(`旧数据清理完成，每种数据保留最新的${cleanupConfig.keepCount}条记录`);
      refreshDataStats();
      showCleanupDialog.value = false;
    } else {
      throw new Error('清理旧数据失败');
    }
  } catch (error) {
    console.error('清理旧数据失败:', error);
    ElMessage.error('清理旧数据失败，请重试');
  }
}

// 新增：导出所有数据
function exportAllData() {
  ElMessage.info('正在准备导出数据...');
  
  try {
    // 获取所有数据
    const inventoryData = unifiedDataService.getInventoryData();
    const labData = unifiedDataService.getLabData();
    const factoryData = unifiedDataService.getFactoryData();
    
    // 创建导出对象
    const exportData = {
      inventory: inventoryData,
      lab: labData,
      factory: factoryData,
      exportTime: new Date().toISOString(),
      version: '2.5.3'
    };
    
    // 转换为JSON字符串
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // 创建Blob对象
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iqe_data_export_${new Date().toISOString().split('T')[0]}.json`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    ElMessage.success('数据导出成功');
  } catch (error) {
    console.error('导出数据失败:', error);
    ElMessage.error('导出数据失败，请重试');
  }
}

// 新增：修复数据问题
function fixDataIssues() {
  try {
    // 清除旧的存储键
    localStorage.removeItem('lab_test_data');
    localStorage.removeItem('lab_data');
    localStorage.removeItem('online_data');
    localStorage.removeItem('factory_data');
    localStorage.removeItem('inventory_data');
    
    // 迁移数据到统一数据服务
    unifiedDataService.migrateOldData();
    
    // 刷新统计
    refreshDataStats();
    
    ElMessage.success('数据问题修复完成');
  } catch (error) {
    console.error('修复数据问题失败:', error);
    ElMessage.error('修复数据问题失败，请重试');
  }
}

// 新增：生成所有测试数据
async function generateAllData() {
  try {
    // 确认对话框
    await ElMessageBox.confirm(
      '生成测试数据将创建包含所有10个项目的测试数据，可能需要一些时间，是否继续？',
      '确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    );
    
    isGenerating.value = true;
    
    // 调用数据生成服务
    const result = await systemDataUpdater.updateAllSystemData({
      ensureAllProjects: true, // 确保所有项目都有数据
      clearExisting: true     // 清除现有数据
    });
    
    if (result.success) {
      ElMessage.success(`数据生成成功: ${result.message}`);
      // 刷新数据统计
      refreshDataStats();
    } else {
      ElMessage.error(`数据生成失败: ${result.message}`);
    }
  } catch (e) {
    // 用户取消操作
    console.log('用户取消了数据生成操作', e);
  } finally {
    isGenerating.value = false;
  }
}

/**
 * 重置系统
 */
async function resetSystem() {
  // 确认对话框
  try {
    await ElMessageBox.confirm(
      '重置系统将清空所有数据并恢复默认设置，此操作不可逆，是否继续？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    isResetting.value = true;
    
    // 清空所有数据
    localStorage.clear();
    
    // 显示成功消息
    ElMessage.success('系统已重置，请刷新页面');
    
    // 延迟2秒后刷新页面
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (e) {
    // 用户取消操作
    console.log('用户取消了重置操作');
  } finally {
    isResetting.value = false;
  }
}
</script>

<style scoped>
.system-settings {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.page-title {
  margin-bottom: 20px;
  color: #303133;
  font-size: 24px;
}

.settings-card {
  flex: 1;
  overflow: hidden;
}

.settings-tabs {
  height: 100%;
}

.settings-tabs :deep(.el-tabs__content) {
  padding: 0 20px;
  height: 100%;
  overflow: auto;
}

.section-title {
  margin-top: 0;
  margin-bottom: 25px;
  font-size: 18px;
  color: #303133;
}

.settings-form {
  max-width: 600px;
}

.user-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.user-search {
  width: 250px;
}

.db-warning {
  margin-bottom: 20px;
}

.system-info-cards {
  margin-top: 20px;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  width: 120px;
  color: #606266;
}

.info-value {
  font-weight: bold;
  color: #303133;
}

.update-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.mt-20 {
  margin-top: 20px;
}

.log-stats {
  width: 100%;
}

.log-chart {
  height: 300px;
}

/* 新增：数据管理样式 */
.data-management-section {
  margin-top: 20px;
}

.data-card {
  margin-bottom: 20px;
}

.data-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.data-stat-item {
  display: flex;
  align-items: center;
}

.stat-label {
  width: 150px;
  color: #606266;
}

.stat-value {
  flex: 1;
  font-weight: bold;
  color: #303133;
  margin-right: 15px;
}

.data-actions {
  margin-top: 25px;
  display: flex;
  gap: 15px;
  justify-content: center;
}

.cleanup-form {
  padding: 0 20px;
}

.operation-hint {
  margin-left: 10px;
  color: #606266;
  font-size: 0.8em;
}
</style> 
.mt-20 {
  margin-top: 20px;
}

.log-stats {
  width: 100%;
}

.log-chart {
  height: 300px;
}

/* 新增：数据管理样式 */
.data-management-section {
  margin-top: 20px;
}

.data-card {
  margin-bottom: 20px;
}

.data-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.data-stat-item {
  display: flex;
  align-items: center;
}

.stat-label {
  width: 150px;
  color: #606266;
}

.stat-value {
  flex: 1;
  font-weight: bold;
  color: #303133;
  margin-right: 15px;
}

.data-actions {
  margin-top: 25px;
  display: flex;
  gap: 15px;
  justify-content: center;
}

.cleanup-form {
  padding: 0 20px;
}

.operation-hint {
  margin-left: 10px;
  color: #606266;
  font-size: 0.8em;
}
</style> 