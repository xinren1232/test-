<template>
  <div class="admin-data-page">
    <!-- 数据表格 -->
    <el-table :data="tableData" border style="width: 100%">
      <!-- 其他列... -->
      
      <el-table-column prop="defectRate" label="不良率" width="100" sortable>
        <template #default="scope">
          <span :class="getDefectRateClass(scope.row.defectRate)">
            {{ formatDefectRate(scope.row.defectRate) }}
          </span>
        </template>
      </el-table-column>
      
      <!-- 其他列... -->
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

// 表格数据
const tableData = ref([]);

// 组件挂载时加载数据
onMounted(() => {
  loadData();
});

// 加载数据
function loadData() {
  // 这里应该从服务获取数据
  // 示例数据
  tableData.value = [
    { id: 1, name: '物料1', defectRate: '2.5%' },
    { id: 2, name: '物料2', defectRate: 5.8 },
    { id: 3, name: '物料3', defectRate: '0.5%' }
  ];
}

// 格式化不良率显示
function formatDefectRate(defectRate) {
  // 如果是字符串且已经包含百分号，直接返回
  if (typeof defectRate === 'string' && defectRate.includes('%')) {
    return defectRate;
  }
  
  // 如果是数字或不含百分号的字符串，添加百分号
  if (typeof defectRate === 'number' || (typeof defectRate === 'string' && !defectRate.includes('%'))) {
    return `${defectRate}%`;
  }
  
  // 如果是undefined或null，返回默认值
  return '0.0%';
}

// 获取不良率显示的CSS类
function getDefectRateClass(defectRate) {
  let rate;
  
  // 处理不同格式的不良率
  if (typeof defectRate === 'string') {
    // 如果是字符串，去掉百分号再转为数字
    rate = parseFloat(defectRate.replace('%', ''));
  } else if (typeof defectRate === 'number') {
    // 如果已经是数字，直接使用
    rate = defectRate;
  } else {
    // 默认值
    rate = 0;
  }
  
  // 返回对应的CSS类
  if (rate >= 5) return 'high-defect-rate';
  if (rate >= 2) return 'medium-defect-rate';
  return 'low-defect-rate';
}
</script>

<style scoped>
.admin-data-page {
  padding: 20px;
}

/* 不良率样式 */
.high-defect-rate {
  color: #F56C6C;
  font-weight: bold;
}

.medium-defect-rate {
  color: #E6A23C;
  font-weight: bold;
}

.low-defect-rate {
  color: #67C23A;
  font-weight: bold;
}
</style> 
 
 