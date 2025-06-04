<template>
  <div class="home-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card">
          <template #header>
            <div class="card-header">
              <h2>欢迎使用IQE动态检验系统</h2>
            </div>
          </template>
          <div class="welcome-content">
            <p class="system-intro">
              本系统基于各工厂、仓库检验状态，结合上线使用情况和实验室测试情况，智能推荐物料类别动态检验方案。
            </p>
            <el-button type="primary" class="architecture-btn" @click="goToPage('/architecture')">
              查看系统架构图解
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据仪表盘 -->
    <el-row :gutter="20" class="dashboard-row">
      <el-col :span="24">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <h2>系统数据概览</h2>
              <el-tag type="success">实时数据</el-tag>
            </div>
          </template>
          <div class="dashboard-content">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="6">
                <div class="data-card">
                  <div class="data-icon factory-icon">
                    <el-icon><el-icon-goods /></el-icon>
                  </div>
                  <div class="data-info">
                    <div class="data-title">工厂物料</div>
                    <div class="data-value">{{ factoryData.length }}</div>
                    <div class="data-desc">
                      <span class="data-label">平均缺陷率:</span>
                      <span class="data-metric">{{ avgFactoryDefectRate }}%</span>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <div class="data-card">
                  <div class="data-icon lab-icon">
                    <el-icon><el-icon-data-analysis /></el-icon>
                  </div>
                  <div class="data-info">
                    <div class="data-title">实验室测试</div>
                    <div class="data-value">{{ labData.length }}</div>
                    <div class="data-desc">
                      <span class="data-label">合格率:</span>
                      <span class="data-metric">{{ labPassRate }}%</span>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <div class="data-card">
                  <div class="data-icon online-icon">
                    <el-icon><el-icon-monitor /></el-icon>
                  </div>
                  <div class="data-info">
                    <div class="data-title">上线使用</div>
                    <div class="data-value">{{ onlineData.length }}</div>
                    <div class="data-desc">
                      <span class="data-label">上线缺陷率:</span>
                      <span class="data-metric">{{ avgOnlineDefectRate }}%</span>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <div class="data-card">
                  <div class="data-icon risk-icon">
                    <el-icon><el-icon-warning /></el-icon>
                  </div>
                  <div class="data-info">
                    <div class="data-title">高风险物料</div>
                    <div class="data-value">{{ highRiskCount }}</div>
                    <div class="data-desc">
                      <span class="data-label">占比:</span>
                      <span class="data-metric">{{ highRiskPercentage }}%</span>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速导航 -->
    <el-row :gutter="20" class="feature-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="feature-card" shadow="hover" @click="goToPage('/batch')">
          <div class="feature-icon">
            <el-icon><el-icon-document-copy /></el-icon>
          </div>
          <div class="feature-info">
            <h3>批次管理</h3>
            <p>物料批次的创建、追踪与分析</p>
          </div>
          <div class="feature-action">
            <el-button type="primary" text>进入管理</el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="feature-card" shadow="hover" @click="goToPage('/monitoring')">
          <div class="feature-icon">
            <el-icon><el-icon-monitor /></el-icon>
          </div>
          <div class="feature-info">
            <h3>实时监控</h3>
            <p>生产线与检验过程实时状态</p>
          </div>
          <div class="feature-action">
            <el-button type="success" text>实时查看</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { materialCategories } from '../data/material_categories.js'
import factoryDataJson from '../data/factory_data.json'
import labDataJson from '../data/lab_data.json'
import onlineDataJson from '../data/online_data.json'

const router = useRouter()
const factoryData = ref(factoryDataJson)
const labData = ref(labDataJson)
const onlineData = ref(onlineDataJson)

// 计算工厂平均缺陷率
const avgFactoryDefectRate = computed(() => {
  if (factoryData.value.length === 0) return 0
  const total = factoryData.value.reduce((sum, item) => sum + item.defect_rate, 0)
  return (total / factoryData.value.length).toFixed(2)
})

// 计算实验室测试合格率
const labPassRate = computed(() => {
  if (labData.value.length === 0) return 0
  const passCount = labData.value.filter(item => item.result === '合格').length
  return ((passCount / labData.value.length) * 100).toFixed(0)
})

// 计算上线平均缺陷率
const avgOnlineDefectRate = computed(() => {
  if (onlineData.value.length === 0) return 0
  
  let totalDefects = 0
  let totalItems = 0
  
  onlineData.value.forEach(item => {
    totalDefects += item.defect_count
    totalItems += item.total_count
  })
  
  return totalItems > 0 ? ((totalDefects / totalItems) * 100).toFixed(2) : 0
})

// 计算高风险物料数量
const highRiskCount = computed(() => {
  // 简单定义：工厂缺陷率>2%或实验室不合格或上线缺陷率>2%的物料
  const highRiskMaterials = new Set()
  
  factoryData.value.forEach(item => {
    if (item.defect_rate > 2) {
      highRiskMaterials.add(item.material_code)
    }
  })
  
  labData.value.forEach(item => {
    if (item.result === '不合格') {
      highRiskMaterials.add(item.material_code)
    }
  })
  
  onlineData.value.forEach(item => {
    if ((item.defect_count / item.total_count) * 100 > 2) {
      highRiskMaterials.add(item.material_code)
    }
  })
  
  return highRiskMaterials.size
})

// 计算高风险物料占比
const highRiskPercentage = computed(() => {
  const allMaterials = new Set()
  
  factoryData.value.forEach(item => allMaterials.add(item.material_code))
  labData.value.forEach(item => allMaterials.add(item.material_code))
  onlineData.value.forEach(item => allMaterials.add(item.material_code))
  
  return allMaterials.size > 0 
    ? ((highRiskCount.value / allMaterials.size) * 100).toFixed(0) 
    : 0
})

function goToPage(path) {
  router.push(path)
}
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
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
</style> 