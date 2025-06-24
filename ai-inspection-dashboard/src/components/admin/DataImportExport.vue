<template>
  <div class="data-import-export">
    <el-card class="card">
      <template #header>
        <div class="card-header">
          <h3>历史数据导入管理</h3>
          <el-tag type="info">基础数据</el-tag>
        </div>
      </template>
      
      <!-- 数据导入区域 -->
      <div class="section">
        <h4>历史数据导入</h4>
        <p class="description">导入历史基础数据，这些数据将作为固定数据保持不变，并在每次生成新数据时结合数据规则自动添加</p>
        
        <div class="import-form">
          <el-form label-position="top">
            <el-form-item label="选择数据类型">
              <el-select v-model="importType" placeholder="请选择数据类型">
                <el-option label="库存数据" value="inventory"></el-option>
                <el-option label="测试数据" value="test"></el-option>
                <el-option label="上线数据" value="online"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="选择JSON文件">
              <el-upload
                ref="uploadRef"
                action="#"
                :auto-upload="false"
                :limit="1"
                :on-change="handleFileChange"
                :on-exceed="handleExceedLimit"
                :on-remove="handleRemoveFile"
                :file-list="fileList"
              >
                <el-button type="primary">选择文件</el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    请上传JSON格式文件，最大不超过10MB
                  </div>
                </template>
              </el-upload>
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="success" 
                :disabled="!canImport" 
                :loading="importing"
                @click="importData"
              >
                导入数据
              </el-button>
              <el-button 
                @click="openTemplateDialog"
              >
                下载模板
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <el-divider />
      
      <!-- 历史数据管理区域 -->
      <div class="section">
        <h4>历史数据管理</h4>
        <p class="description">查看和管理已导入的历史数据</p>
        
        <el-row :gutter="20" class="stats-row">
          <el-col :span="8">
            <el-card class="stats-card" shadow="hover">
              <div class="stats-value">{{ historicalStats.inventory }}</div>
              <div class="stats-label">历史库存数据</div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="stats-card" shadow="hover">
              <div class="stats-value">{{ historicalStats.test }}</div>
              <div class="stats-label">历史测试数据</div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="stats-card" shadow="hover">
              <div class="stats-value">{{ historicalStats.online }}</div>
              <div class="stats-label">历史上线数据</div>
            </el-card>
          </el-col>
        </el-row>
        
        <div class="actions-row">
          <el-button 
            type="danger" 
            :disabled="!hasHistoricalData"
            @click="openClearDialog"
          >
            <el-icon><Delete /></el-icon>
            清除历史数据
          </el-button>
        </div>
      </div>
      
      <el-divider />
      
      <!-- 数据生成区域 -->
      <div class="section">
        <h4>数据生成</h4>
        <p class="description">根据数据规则和历史数据参考，生成符合业务逻辑的完整数据集</p>
        
        <div class="generate-form">
          <el-form label-position="top">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="库存数据数量">
                  <el-input-number v-model="generationOptions.inventoryCount" :min="10" :max="500" :step="10"></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="测试数据数量">
                  <el-input-number v-model="generationOptions.testCount" :min="10" :max="200" :step="10"></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="上线数据数量">
                  <el-input-number v-model="generationOptions.onlineCount" :min="10" :max="200" :step="10"></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item>
              <el-checkbox v-model="generationOptions.clearExisting">清除现有数据</el-checkbox>
            </el-form-item>
            
            <el-form-item>
              <el-checkbox v-model="generationOptions.includeHistorical">包含历史数据</el-checkbox>
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="generating"
                @click="generateData"
              >
                生成数据
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>
    
    <!-- 模板下载对话框 -->
    <el-dialog
      v-model="templateDialogVisible"
      title="下载数据模板"
      width="500px"
    >
      <div class="template-dialog-content">
        <p>选择要下载的数据模板类型：</p>
        <div class="template-buttons">
          <el-button @click="downloadTemplate('inventory')">库存数据模板</el-button>
          <el-button @click="downloadTemplate('test')">测试数据模板</el-button>
          <el-button @click="downloadTemplate('online')">上线数据模板</el-button>
        </div>
      </div>
    </el-dialog>
    
    <!-- 清除历史数据确认对话框 -->
    <el-dialog
      v-model="clearDialogVisible"
      title="确认清除历史数据"
      width="420px"
    >
      <div class="clear-dialog-content">
        <p>清除历史数据会永久删除所有导入的历史数据，无法恢复。</p>
        <p>你确定要继续吗？</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="clearDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="clearHistoricalData">确认清除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';
import dataImportService from '../../services/DataImportService.js';

export default {
  name: 'DataImportExport',
  
  components: {
    Delete
  },
  
  setup() {
    // 导入相关状态
    const importType = ref('inventory');
    const fileList = ref([]);
    const uploadRef = ref(null);
    const selectedFile = ref(null);
    const importing = ref(false);
    const canImport = computed(() => importType.value && selectedFile.value);
    
    // 模板下载对话框
    const templateDialogVisible = ref(false);
    
    // 清除对话框
    const clearDialogVisible = ref(false);
    
    // 历史数据统计
    const historicalStats = reactive({
      inventory: 0,
      test: 0,
      online: 0
    });
    
    const hasHistoricalData = computed(() => {
      return historicalStats.inventory > 0 || 
             historicalStats.test > 0 || 
             historicalStats.online > 0;
    });
    
    // 数据生成选项
    const generationOptions = reactive({
      inventoryCount: 50,
      testCount: 40,
      onlineCount: 30,
      clearExisting: false,
      includeHistorical: true
    });
    const generating = ref(false);
    
    // 更新历史数据统计
    const updateHistoricalStats = () => {
      historicalStats.inventory = dataImportService.getHistoricalData('inventory').length;
      historicalStats.test = dataImportService.getHistoricalData('test').length;
      historicalStats.online = dataImportService.getHistoricalData('online').length;
    };
    
    // 处理文件选择
    const handleFileChange = (file) => {
      const isJSON = file.raw.type === 'application/json' || file.name.endsWith('.json');
      if (!isJSON) {
        ElMessage.error('只能上传JSON格式的文件!');
        fileList.value = [];
        return false;
      }
      
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        ElMessage.error('文件大小不能超过10MB!');
        fileList.value = [];
        return false;
      }
      
      selectedFile.value = file.raw;
      return true;
    };
    
    // 处理超出文件数量限制
    const handleExceedLimit = () => {
      ElMessage.warning('只能上传一个文件!');
    };
    
    // 处理移除文件
    const handleRemoveFile = () => {
      selectedFile.value = null;
      fileList.value = [];
    };
    
    // 导入数据
    const importData = () => {
      if (!canImport.value || importing.value) return;
      
      importing.value = true;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonString = e.target.result;
          
          // 使用导入服务导入数据
          const importedData = dataImportService.importJSON(jsonString, importType.value);
          
          // 更新统计信息
          updateHistoricalStats();
          
          ElMessage.success(`成功导入${importedData.length}条${importType.value === 'inventory' ? '库存' : importType.value === 'test' ? '测试' : '上线'}数据`);
          
          // 清空文件列表
          handleRemoveFile();
        } catch (error) {
          console.error('导入数据失败:', error);
          ElMessage.error(`导入数据失败: ${error.message}`);
        } finally {
          importing.value = false;
        }
      };
      
      reader.onerror = () => {
        ElMessage.error('读取文件失败');
        importing.value = false;
      };
      
      reader.readAsText(selectedFile.value);
    };
    
    // 打开模板下载对话框
    const openTemplateDialog = () => {
      templateDialogVisible.value = true;
    };
    
    // 下载模板
    const downloadTemplate = (type) => {
      let template;
      
      switch (type) {
        case 'inventory':
          template = [
            {
              material_code: 'SAMPLE001',
              material_name: '样例物料',
              material_type: '电子元件',
              batch_no: 'BTC2305001',
              supplier: '示例供应商',
              quantity: 100,
              unit: '个',
              warehouse: '中央仓库',
              location: 'A区-01货架',
              status: '正常',
              quality: '合格',
              arrival_date: new Date().toISOString(),
              project_name: '示例项目',
              factory: '上海工厂'
            }
          ];
          break;
          
        case 'test':
          template = [
            {
              material_code: 'SAMPLE001',
              material_name: '样例物料',
              material_type: '电子元件',
              batch_no: 'BTC2305001',
              supplier: '示例供应商',
              test_date: new Date().toISOString(),
              test_conclusion: '合格',
              tester: '王工',
              test_type: '来料检验',
              project_name: '示例项目',
              factory: '上海工厂'
            }
          ];
          break;
          
        case 'online':
          template = [
            {
              material_code: 'SAMPLE001',
              material_name: '样例物料',
              batch_no: 'BTC2305001',
              supplier: '示例供应商',
              production_line: '上海SMT01线',
              factory: '上海工厂',
              online_date: new Date().toISOString(),
              planned_quantity: 500,
              actual_quantity: 480,
              status: '正常',
              operator: '张工',
              project_name: '示例项目'
            }
          ];
          break;
          
        default:
          ElMessage.error('未知模板类型');
          return;
      }
      
      // 创建并下载文件
      const dataStr = JSON.stringify(template, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_template.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      templateDialogVisible.value = false;
    };
    
    // 打开清除历史数据确认对话框
    const openClearDialog = () => {
      clearDialogVisible.value = true;
    };
    
    // 清除历史数据
    const clearHistoricalData = () => {
      // 清除历史数据
      localStorage.removeItem('historical_inventory_data');
      localStorage.removeItem('historical_test_data');
      localStorage.removeItem('historical_online_data');
      
      // 重新初始化导入服务
      dataImportService.initialize();
      
      // 更新统计信息
      updateHistoricalStats();
      
      clearDialogVisible.value = false;
      ElMessage.success('历史数据已清除');
    };
    
    // 生成数据
    const generateData = async () => {
      if (generating.value) return;
      
      generating.value = true;
      
      try {
        const options = { ...generationOptions };
        
        if (!options.includeHistorical) {
          // 如果不包含历史数据，则清空历史数据缓存
          const tempInventory = dataImportService.historicalInventoryData;
          const tempTest = dataImportService.historicalTestData;
          const tempOnline = dataImportService.historicalOnlineData;
          
          dataImportService.historicalInventoryData = [];
          dataImportService.historicalTestData = [];
          dataImportService.historicalOnlineData = [];
          
          // 执行数据生成
          await dataImportService.generateCompleteDataset(options);
          
          // 恢复历史数据
          dataImportService.historicalInventoryData = tempInventory;
          dataImportService.historicalTestData = tempTest;
          dataImportService.historicalOnlineData = tempOnline;
        } else {
          // 正常执行数据生成
          await dataImportService.generateCompleteDataset(options);
        }
        
        ElMessage.success('数据生成成功');
      } catch (error) {
        console.error('生成数据失败:', error);
        ElMessage.error(`生成数据失败: ${error.message}`);
      } finally {
        generating.value = false;
      }
    };
    
    // 初始化
    onMounted(() => {
      // 初始化导入服务
      dataImportService.initialize();
      
      // 更新历史数据统计
      updateHistoricalStats();
    });
    
    return {
      // 导入相关
      importType,
      fileList,
      uploadRef,
      importing,
      canImport,
      handleFileChange,
      handleExceedLimit,
      handleRemoveFile,
      importData,
      
      // 模板下载
      templateDialogVisible,
      openTemplateDialog,
      downloadTemplate,
      
      // 历史数据
      historicalStats,
      hasHistoricalData,
      clearDialogVisible,
      openClearDialog,
      clearHistoricalData,
      
      // 数据生成
      generationOptions,
      generating,
      generateData
    };
  }
};
</script>

<style scoped>
.data-import-export {
  margin: 20px;
}

.card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section {
  margin-bottom: 20px;
}

h4 {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 8px;
}

.description {
  color: #666;
  margin-bottom: 16px;
  font-size: 14px;
}

.stats-row {
  margin-bottom: 16px;
}

.stats-card {
  text-align: center;
  padding: 12px;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 14px;
  color: #666;
}

.actions-row {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.import-form,
.generate-form {
  max-width: 800px;
  margin: 0 auto;
}

.template-dialog-content,
.clear-dialog-content {
  text-align: center;
}

.template-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: space-around;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 
 
 
 