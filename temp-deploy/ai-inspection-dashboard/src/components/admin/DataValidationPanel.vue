<!-- 
  数据一致性校验面板
  用于检查和修复系统数据一致性问题
-->
<template>
  <div class="data-validation-panel">
    <el-card class="panel-card">
      <template #header>
        <div class="panel-header">
          <h3>数据一致性校验工具</h3>
          <el-tag type="info" size="small">管理员专用</el-tag>
        </div>
      </template>
      
      <div class="panel-content">
        <div class="section">
          <h4>数据一致性检查</h4>
          <p class="description">
            检查系统中各模块数据是否一致，包括库存数据、测试数据和上线数据之间的关联。
          </p>
          
          <el-button 
            type="primary" 
            @click="checkDataConsistency" 
            :loading="isChecking"
          >
            开始检查
          </el-button>
          
          <el-button 
            type="success" 
            @click="fixDataConsistency" 
            :loading="isFixing"
            :disabled="!hasInconsistency"
          >
            修复不一致
          </el-button>
        </div>
        
        <el-divider />
        
        <!-- 检查结果 -->
        <div class="section" v-if="checkResult.checked">
          <h4>检查结果</h4>
          
          <el-alert
            v-if="!hasInconsistency"
            title="数据一致性检查通过"
            type="success"
            :closable="false"
            show-icon
          >
            <p>所有数据模块之间保持一致，无需修复。</p>
          </el-alert>
          
          <el-alert
            v-else
            title="发现数据一致性问题"
            type="warning"
            :closable="false"
            show-icon
          >
            <p>系统检测到数据模块之间存在不一致，建议进行修复。</p>
          </el-alert>
          
          <div class="check-details" v-if="checkResult.checked">
            <el-descriptions title="数据一致性详情" :column="1" border>
              <el-descriptions-item label="存储键检查">
                <el-tag 
                  :type="checkResult.storageKeysConsistent ? 'success' : 'danger'"
                >
                  {{ checkResult.storageKeysConsistent ? '一致' : '不一致' }}
                </el-tag>
              </el-descriptions-item>
              
              <el-descriptions-item label="库存数据">
                <el-tag type="info">{{ checkResult.inventoryCount }}条</el-tag>
              </el-descriptions-item>
              
              <el-descriptions-item label="测试数据">
                <div class="flex-row">
                  <span>lab_data: <el-tag size="small">{{ checkResult.labDataCount }}条</el-tag></span>
                  <span>lab_test_data: <el-tag size="small">{{ checkResult.labTestDataCount }}条</el-tag></span>
                </div>
              </el-descriptions-item>
              
              <el-descriptions-item label="上线数据">
                <div class="flex-row">
                  <span>factory_data: <el-tag size="small">{{ checkResult.factoryDataCount }}条</el-tag></span>
                  <span>online_data: <el-tag size="small">{{ checkResult.onlineDataCount }}条</el-tag></span>
                </div>
              </el-descriptions-item>
              
              <el-descriptions-item label="批次号一致性">
                <el-tag 
                  :type="checkResult.batchNoConsistent ? 'success' : 'danger'"
                >
                  {{ checkResult.batchNoConsistent ? '一致' : '不一致' }}
                </el-tag>
                <span v-if="!checkResult.batchNoConsistent" class="error-detail">
                  (有{{ checkResult.inconsistentBatchCount }}个批次号不一致)
                </span>
              </el-descriptions-item>
              
              <el-descriptions-item label="检查时间">
                {{ checkResult.checkTime }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
        
        <!-- 修复日志 -->
        <div class="section" v-if="fixLogs.length > 0">
          <h4>修复日志</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in fixLogs"
              :key="index"
              :type="log.type"
              :timestamp="log.time"
            >
              {{ log.message }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import unifiedDataService from '../../services/UnifiedDataService';
import SystemDataUpdater from '../../services/SystemDataUpdater';

// 检查状态
const isChecking = ref(false);
const isFixing = ref(false);

// 检查结果
const checkResult = reactive({
  checked: false,
  storageKeysConsistent: false,
  inventoryCount: 0,
  labDataCount: 0,
  labTestDataCount: 0,
  factoryDataCount: 0,
  onlineDataCount: 0,
  batchNoConsistent: false,
  inconsistentBatchCount: 0,
  checkTime: ''
});

// 修复日志
const fixLogs = ref([]);

// 计算是否存在不一致
const hasInconsistency = computed(() => {
  if (!checkResult.checked) return false;
  
  return !checkResult.storageKeysConsistent || 
         !checkResult.batchNoConsistent ||
         checkResult.labDataCount !== checkResult.labTestDataCount ||
         checkResult.factoryDataCount !== checkResult.onlineDataCount;
});

// 检查数据一致性
const checkDataConsistency = async () => {
  try {
    isChecking.value = true;
    ElMessage.info('正在检查数据一致性...');
    
    // 获取所有数据
    const inventoryData = localStorage.getItem('inventory_data');
    const labData = localStorage.getItem('lab_data');
    const labTestData = localStorage.getItem('lab_test_data');
    const factoryData = localStorage.getItem('factory_data');
    const onlineData = localStorage.getItem('online_data');
    
    // 解析数据
    const inventoryItems = inventoryData ? JSON.parse(inventoryData) : [];
    const labItems = labData ? JSON.parse(labData) : [];
    const labTestItems = labTestData ? JSON.parse(labTestData) : [];
    const factoryItems = factoryData ? JSON.parse(factoryData) : [];
    const onlineItems = onlineData ? JSON.parse(onlineData) : [];
    
    // 检查存储键一致性
    const storageKeysConsistent = 
      (labData === labTestData || (!labData && !labTestData)) &&
      (factoryData === onlineData || (!factoryData && !onlineData));
    
    // 检查批次号一致性
    let batchNoConsistent = true;
    let inconsistentBatchCount = 0;
    
    // 收集所有批次号
    const inventoryBatchNos = new Set(inventoryItems.map(item => item.batchNo));
    const labBatchNos = new Set([
      ...labItems.map(item => item.batchNo),
      ...labTestItems.map(item => item.batchNo)
    ]);
    const factoryBatchNos = new Set([
      ...factoryItems.map(item => item.batchNo),
      ...onlineItems.map(item => item.batchNo)
    ]);
    
    // 检查测试数据中的批次号是否在库存数据中存在
    if (labItems.length > 0 || labTestItems.length > 0) {
      for (const batchNo of labBatchNos) {
        if (!inventoryBatchNos.has(batchNo)) {
          batchNoConsistent = false;
          inconsistentBatchCount++;
        }
      }
    }
    
    // 检查上线数据中的批次号是否在库存数据中存在
    if (factoryItems.length > 0 || onlineItems.length > 0) {
      for (const batchNo of factoryBatchNos) {
        if (!inventoryBatchNos.has(batchNo)) {
          batchNoConsistent = false;
          inconsistentBatchCount++;
        }
      }
    }
    
    // 更新检查结果
    checkResult.checked = true;
    checkResult.storageKeysConsistent = storageKeysConsistent;
    checkResult.inventoryCount = inventoryItems.length;
    checkResult.labDataCount = labItems.length;
    checkResult.labTestDataCount = labTestItems.length;
    checkResult.factoryDataCount = factoryItems.length;
    checkResult.onlineDataCount = onlineItems.length;
    checkResult.batchNoConsistent = batchNoConsistent;
    checkResult.inconsistentBatchCount = inconsistentBatchCount;
    checkResult.checkTime = new Date().toLocaleString();
    
    ElMessage.success('数据一致性检查完成');
    
    // 如果没有不一致，显示成功消息
    if (!hasInconsistency.value) {
      ElMessage({
        message: '所有数据保持一致，系统运行正常',
        type: 'success',
        duration: 5000
      });
    } else {
      ElMessage({
        message: '发现数据不一致问题，建议进行修复',
        type: 'warning',
        duration: 5000
      });
    }
  } catch (error) {
    console.error('检查数据一致性失败:', error);
    ElMessage.error('检查数据一致性失败: ' + error.message);
  } finally {
    isChecking.value = false;
  }
};

// 修复数据一致性
const fixDataConsistency = async () => {
  try {
    isFixing.value = true;
    ElMessage.info('正在修复数据一致性问题...');
    
    // 添加日志
    addLog('开始数据一致性修复', 'primary');
    
    // 使用统一数据服务迁移旧数据
    const migrateResult = await SystemDataUpdater.migrateOldData();
    
    if (migrateResult) {
      addLog('成功迁移旧数据到统一数据服务', 'success');
    } else {
      addLog('迁移旧数据失败', 'danger');
    }
    
    // 重新检查数据一致性
    await checkDataConsistency();
    
    if (!hasInconsistency.value) {
      addLog('数据一致性问题已修复', 'success');
      ElMessage.success('数据一致性问题已修复');
    } else {
      addLog('部分数据一致性问题仍然存在', 'warning');
      ElMessage.warning('部分数据一致性问题仍然存在，可能需要重新生成数据');
    }
  } catch (error) {
    console.error('修复数据一致性失败:', error);
    ElMessage.error('修复数据一致性失败: ' + error.message);
    addLog(`修复失败: ${error.message}`, 'danger');
  } finally {
    isFixing.value = false;
  }
};

// 添加日志
const addLog = (message, type = 'info') => {
  fixLogs.value.unshift({
    message,
    type,
    time: new Date().toLocaleString()
  });
};

// 初始化
onMounted(() => {
  // 自动进行一次检查
  checkDataConsistency();
});
</script>

<style scoped>
.data-validation-panel {
  max-width: 800px;
  margin: 0 auto;
}

.panel-card {
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.panel-content {
  padding: 10px 0;
}

.section {
  margin-bottom: 20px;
}

.section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.description {
  color: #666;
  margin-bottom: 20px;
}

.check-details {
  margin-top: 20px;
}

.flex-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-detail {
  margin-left: 10px;
  color: #F56C6C;
  font-size: 0.9em;
}

.el-button {
  margin-right: 10px;
}

.el-timeline {
  margin-top: 20px;
}
</style> 