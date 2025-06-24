<!-- 历史数据管控页面 -->
<template>
  <div class="historical-data-page">
    <div class="page-header">
      <h1 class="page-title">历史数据管控</h1>
      <div class="header-actions">
        <el-button-group>
          <router-link to="/admin/data">
            <el-button type="primary">
              <el-icon><Back /></el-icon>返回数据管理
            </el-button>
          </router-link>
        </el-button-group>
      </div>
    </div>
    
    <!-- 历史数据概览 -->
    <el-row :gutter="20" class="dashboard-cards">
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <h3>历史数据统计</h3>
              <el-icon><DataLine /></el-icon>
            </div>
          </template>
          <div class="card-content">
            <div class="stat-item">
              <span class="stat-label">历史库存数据:</span>
              <span class="stat-value">{{ historicalStats.inventory }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">历史测试数据:</span>
              <span class="stat-value">{{ historicalStats.test }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">历史上线数据:</span>
              <span class="stat-value">{{ historicalStats.online }}</span>
            </div>
            <div class="stat-date">
              <el-tag size="small" type="info">最后更新: {{ historicalStats.lastUpdated }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="16">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <h3>历史数据操作</h3>
              <el-icon><Operation /></el-icon>
            </div>
          </template>
          <div class="card-content actions-content">
            <div class="action-buttons">
              <el-button type="primary" @click="importHistoricalData">
                <el-icon><Upload /></el-icon>导入历史数据
              </el-button>
              <el-button type="success" @click="viewHistoricalData">
                <el-icon><View /></el-icon>查看历史数据
              </el-button>
              <el-button type="warning" @click="exportHistoricalData">
                <el-icon><Download /></el-icon>导出历史数据
              </el-button>
              <el-button type="primary" @click="integrateHistoricalData">
                <el-icon><Connection /></el-icon>集成历史数据
              </el-button>
              <el-button type="danger" @click="clearHistoricalData">
                <el-icon><Delete /></el-icon>清除历史数据
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- Excel文件导入对话框 -->
    <el-dialog
      v-model="showImportPanel"
      title="导入Excel历史数据"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="import-panel">
        <el-form label-position="top">
          <el-form-item label="数据类型">
            <el-radio-group v-model="importType">
              <el-radio-button label="inventory">库存数据</el-radio-button>
              <el-radio-button label="test">测试数据</el-radio-button>
              <el-radio-button label="online">上线数据</el-radio-button>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="Excel文件">
            <el-upload
              class="excel-uploader"
              :auto-upload="false"
              :limit="1"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :file-list="fileList"
              accept=".xlsx,.xls,.csv"
            >
              <el-button type="primary">选择Excel文件</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  请上传Excel文件(.xlsx, .xls)或CSV文件(.csv)
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
        
        <div class="import-actions">
          <el-button @click="showImportPanel = false">取消</el-button>
          <el-button type="primary" @click="parseFile" :loading="importing" :disabled="fileList.length === 0">
            解析并导入
          </el-button>
        </div>
      </div>
    </el-dialog>
    
    <!-- 历史数据查看对话框 -->
    <el-dialog
      v-model="showDataList"
      title="历史数据查看"
      width="80%"
      :close-on-click-modal="false"
    >
      <el-tabs v-model="activeDataTab">
        <el-tab-pane label="库存数据" name="inventory">
          <el-table :data="inventoryData" height="400" border stripe>
            <el-table-column prop="material_id" label="物料编号" width="120" />
            <el-table-column prop="material_name" label="物料名称" width="150" />
            <el-table-column prop="batch_no" label="批次号" width="120" />
            <el-table-column prop="supplier" label="供应商" width="150" />
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="arrival_date" label="到货日期" width="150" />
            <el-table-column prop="expiry_date" label="过期日期" width="150" />
            <el-table-column prop="quality" label="质量状态" width="100" />
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="测试数据" name="test">
          <el-table :data="testData" height="400" border stripe>
            <el-table-column prop="material_id" label="物料编号" width="120" />
            <el-table-column prop="material_name" label="物料名称" width="150" />
            <el-table-column prop="batch_no" label="批次号" width="120" />
            <el-table-column prop="supplier" label="供应商" width="150" />
            <el-table-column prop="test_date" label="测试日期" width="150" />
            <el-table-column prop="test_conclusion" label="测试结论" width="100" />
            <el-table-column prop="tester" label="测试人员" width="100" />
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="上线数据" name="online">
          <el-table :data="onlineData" height="400" border stripe>
            <el-table-column prop="material_id" label="物料编号" width="120" />
            <el-table-column prop="material_name" label="物料名称" width="150" />
            <el-table-column prop="batch_no" label="批次号" width="120" />
            <el-table-column prop="supplier" label="供应商" width="150" />
            <el-table-column prop="online_date" label="上线日期" width="150" />
            <el-table-column prop="planned_quantity" label="计划数量" width="100" />
            <el-table-column prop="actual_quantity" label="实际数量" width="100" />
            <el-table-column prop="factory" label="工厂" width="120" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    
    <!-- 清除数据确认对话框 -->
    <el-dialog
      v-model="clearDialogVisible"
      title="确认清除历史数据"
      width="400px"
    >
      <div class="clear-dialog-content">
        <el-icon class="warning-icon"><Warning /></el-icon>
        <p>确定要清除所有历史数据吗？此操作不可恢复！</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="clearDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmClearHistoricalData">确认清除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  DataLine, Operation, Upload, Download, Delete, 
  View, Back, Close, Connection, Warning
} from '@element-plus/icons-vue';
import dataImportService from '../services/DataImportService.js';
import systemDataUpdater from '../services/SystemDataUpdater.js';

export default {
  name: 'HistoricalDataPage',
  
  components: {
    DataLine, Operation, Upload, Download, Delete, View, Back, Close, Connection, Warning
  },
  
  setup() {
    // 状态变量
    const showImportPanel = ref(false);
    const showDataList = ref(false);
    const importing = ref(false);
    const templateDialogVisible = ref(false);
    const clearDialogVisible = ref(false);
    const importType = ref('inventory');
    const fileList = ref([]);
    const activeDataTab = ref('inventory');
    
    // 历史数据
    const inventoryData = ref([]);
    const testData = ref([]);
    const onlineData = ref([]);
    
    // 历史数据统计
    const historicalStats = ref({
      inventory: 0,
      test: 0,
      online: 0,
      lastUpdated: '-'
    });
    
    // 生命周期钩子
    onMounted(() => {
      loadHistoricalData();
    });
    
    // 加载历史数据
    const loadHistoricalData = () => {
      try {
        // 初始化数据导入服务
        if (!dataImportService.isInitialized) {
          dataImportService.initialize();
        }
        
        // 获取历史数据
        const inventoryHistory = dataImportService.getHistoricalData('inventory') || [];
        const testHistory = dataImportService.getHistoricalData('test') || [];
        const onlineHistory = dataImportService.getHistoricalData('online') || [];
        
        // 更新统计数据
        historicalStats.value = {
          inventory: inventoryHistory.length,
          test: testHistory.length,
          online: onlineHistory.length,
          lastUpdated: new Date().toLocaleString()
        };
        
        // 更新数据列表
        inventoryData.value = inventoryHistory;
        testData.value = testHistory;
        onlineData.value = onlineHistory;
      } catch (error) {
        console.error('加载历史数据失败:', error);
        ElMessage.error('加载历史数据失败: ' + error.message);
      }
    };
    
    // 导入历史数据
    const importHistoricalData = () => {
      showImportPanel.value = true;
    };
    
    // 文件变更处理
    const handleFileChange = (file) => {
      fileList.value = [file.raw];
    };
    
    // 文件移除处理
    const handleFileRemove = () => {
      fileList.value = [];
    };
    
    // 解析文件（CSV或Excel）
    const parseFile = async () => {
      if (fileList.value.length === 0) {
        ElMessage.warning('请先选择文件');
        return;
      }
      
      importing.value = true;
      const file = fileList.value[0];
      
      try {
        ElMessage.info('正在解析文件...');
        
        // 根据文件类型选择解析方法
        let data = [];
        const fileName = file.name.toLowerCase();
        
        if (fileName.endsWith('.csv')) {
          // 解析CSV文件
          data = await parseCSVFile(file);
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
          // 解析Excel文件（简化为CSV格式处理）
          data = await parseExcelAsCSV(file);
        } else {
          throw new Error('不支持的文件格式，请上传.xlsx、.xls或.csv文件');
        }
        
        if (!data || data.length === 0) {
          ElMessage.error('文件为空或格式不正确');
          importing.value = false;
          return;
        }
        
        // 根据导入类型处理数据
        let processedData = [];
        switch (importType.value) {
          case 'inventory':
            processedData = dataImportService.processInventoryData(data);
            break;
          case 'test':
            processedData = dataImportService.processTestData(data);
            break;
          case 'online':
            processedData = dataImportService.processOnlineData(data);
            break;
        }
        
        // 保存为历史数据
        dataImportService.markAsHistorical(importType.value, processedData);
        
        // 重新加载数据
        loadHistoricalData();
        
        ElMessage.success(`成功导入${processedData.length}条${getDataTypeName(importType.value)}数据`);
        showImportPanel.value = false;
        fileList.value = [];
      } catch (error) {
        console.error('解析文件失败:', error);
        ElMessage.error('解析文件失败: ' + error.message);
      } finally {
        importing.value = false;
      }
    };
    
    // 解析CSV文件
    const parseCSVFile = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const csvText = e.target.result;
            const lines = csvText.split(/\r\n|\n/);
            
            // 提取表头
            const headers = lines[0].split(',').map(header => header.trim());
            
            // 解析数据行
            const data = [];
            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue; // 跳过空行
              
              const values = lines[i].split(',').map(value => value.trim());
              if (values.length !== headers.length) continue; // 跳过格式不匹配的行
              
              const row = {};
              headers.forEach((header, index) => {
                row[header] = values[index];
              });
              
              data.push(row);
            }
            
            resolve(data);
          } catch (error) {
            reject(new Error('CSV解析失败: ' + error.message));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('文件读取失败'));
        };
        
        reader.readAsText(file);
      });
    };
    
    // 将Excel文件作为CSV处理（简化版）
    const parseExcelAsCSV = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            // 这里我们将Excel文件当作文本文件读取，并尝试解析其内容
            // 这是一个简化的处理方式，实际上Excel文件是二进制格式
            // 在实际项目中，应该使用专门的Excel解析库
            
            // 提示用户Excel解析需要专门库
            ElMessage.warning('Excel解析需要专门的库支持，请尝试将文件保存为CSV格式后再导入');
            
            // 尝试从文本中提取表格数据
            const text = e.target.result;
            const lines = text.split(/\r\n|\n/).filter(line => line.trim());
            
            if (lines.length < 2) {
              throw new Error('Excel文件内容无法解析，请将文件另存为CSV格式后重试');
            }
            
            // 假设第一行是表头
            const headers = lines[0].split('\t').map(h => h.trim());
            
            // 解析数据行
            const data = [];
            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split('\t').map(v => v.trim());
              if (values.length !== headers.length) continue;
              
              const row = {};
              headers.forEach((header, index) => {
                row[header] = values[index];
              });
              
              data.push(row);
            }
            
            if (data.length === 0) {
              throw new Error('无法从Excel文件中提取数据，请将文件另存为CSV格式后重试');
            }
            
            resolve(data);
          } catch (error) {
            reject(new Error('Excel解析失败: ' + error.message));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('文件读取失败'));
        };
        
        // 尝试以文本方式读取Excel文件
        reader.readAsText(file);
      });
    };
    
    // 获取数据类型名称
    const getDataTypeName = (type) => {
      switch (type) {
        case 'inventory': return '库存';
        case 'test': return '测试';
        case 'online': return '上线';
        default: return '';
      }
    };
    
    // 查看历史数据
    const viewHistoricalData = () => {
      showDataList.value = true;
    };
    
    // 导出历史数据
    const exportHistoricalData = () => {
      ElMessage.info('导出历史数据功能尚未实现');
    };
    
    // 清除历史数据
    const clearHistoricalData = () => {
      clearDialogVisible.value = true;
    };
    
    // 确认清除历史数据
    const confirmClearHistoricalData = () => {
      try {
        // 清除历史数据
        localStorage.removeItem('historical_inventory_data');
        localStorage.removeItem('historical_test_data');
        localStorage.removeItem('historical_online_data');
        
        // 重新加载数据
        loadHistoricalData();
        
        ElMessage.success('历史数据已清除');
        clearDialogVisible.value = false;
      } catch (error) {
        console.error('清除历史数据失败:', error);
        ElMessage.error('清除历史数据失败: ' + error.message);
      }
    };
    
    // 集成历史数据
    const integrateHistoricalData = async () => {
      try {
        ElMessage.info('正在集成历史数据...');
        
        // 调用SystemDataUpdater服务的integrateHistoricalData方法
        const result = await systemDataUpdater.integrateHistoricalData();
        
        ElMessage.success(`历史数据集成成功！共集成了${result.inventory.length}条库存数据、${result.test.length}条测试数据和${result.online.length}条上线数据`);
      } catch (error) {
        console.error('集成历史数据失败:', error);
        ElMessage.error(`集成历史数据失败: ${error.message}`);
      }
    };
    
    return {
      // 状态变量
      showImportPanel,
      showDataList,
      importing,
      templateDialogVisible,
      clearDialogVisible,
      importType,
      fileList,
      activeDataTab,
      
      // 数据
      inventoryData,
      testData,
      onlineData,
      historicalStats,
      
      // 方法
      importHistoricalData,
      viewHistoricalData,
      exportHistoricalData,
      clearHistoricalData,
      confirmClearHistoricalData,
      integrateHistoricalData,
      handleFileChange,
      handleFileRemove,
      parseFile
    };
  }
}
</script>

<style scoped>
.historical-data-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  margin: 0;
}

.dashboard-cards {
  margin-bottom: 20px;
}

.dashboard-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  padding: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.stat-label {
  color: #666;
}

.stat-value {
  font-weight: bold;
}

.stat-date {
  margin-top: 15px;
  text-align: right;
}

.actions-content {
  display: flex;
  justify-content: center;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
}

.import-panel {
  padding: 10px;
}

.import-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.excel-uploader {
  width: 100%;
}

.clear-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.warning-icon {
  font-size: 48px;
  color: #E6A23C;
  margin-bottom: 20px;
}
</style>
