/**
 * @description 物料库存分析 Composable
 * 封装了所有与库存数据相关的计算、统计和图表数据准备逻辑。
 */
import { ref, computed, type Ref } from 'vue';
import type { InventoryItem, Status } from '../types/models';

export function useInventoryAnalysis(inventoryData: Ref<InventoryItem[]>) {
  // --- 基础统计 ---
  const normalItemsCount = computed(() => 
    inventoryData.value.filter(item => item.status === 'normal').length
  );

  const riskItemsCount = computed(() =>
    inventoryData.value.filter(item => item.status === 'risk').length
  );

  const frozenItemsCount = computed(() =>
    inventoryData.value.filter(item => item.status === 'frozen').length
  );

  // --- 仪表盘卡片数据 ---
  const mainStorageArea = computed(() => {
    if (inventoryData.value.length === 0) return 'N/A';
    const warehouseCounts = inventoryData.value
      .filter(item => item.status === 'normal' && item.warehouse)
      .reduce((acc, item) => {
        acc[item.warehouse] = (acc[item.warehouse] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    return Object.keys(warehouseCounts).sort((a, b) => warehouseCounts[b] - warehouseCounts[a])[0] || '主仓库';
  });

  const frozenItemsWarehouse = computed(() => {
     if (frozenItemsCount.value === 0) return 'N/A';
    const warehouseCounts = inventoryData.value
      .filter(item => item.status === 'frozen' && item.warehouse)
      .reduce((acc, item) => {
        acc[item.warehouse] = (acc[item.warehouse] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
    return Object.keys(warehouseCounts).sort((a, b) => warehouseCounts[b] - warehouseCounts[a])[0] || '隔离仓';
  });

  const topRiskSupplier = computed(() => {
    if (riskItemsCount.value === 0) return 'N/A';
    const supplierCounts = inventoryData.value
      .filter(item => item.status === 'risk' && item.supplier)
      .reduce((acc, item) => {
        acc[item.supplier] = (acc[item.supplier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.keys(supplierCounts).sort((a, b) => supplierCounts[b] - supplierCounts[a])[0] || '未知';
  });

  const riskLevel = computed(() => {
    const count = riskItemsCount.value;
    if (count >= 100) return 'A级';
    if (count >= 50) return 'B级';
    if (count >= 20) return 'C级';
    return 'D级';
  });

  const riskLevelDescription = computed(() => {
    switch (riskLevel.value) {
      case 'A级': return '高风险 - 需立即干预';
      case 'B级': return '中高风险 - 需优先处理';
      case 'C级': return '中等风险 - 需密切监控';
      case 'D级': return '低风险 - 定期检查';
      default: return '未知风险';
    }
  });
  
  // --- 供应商分析 ---
  const topRiskSuppliers = computed(() => {
    const supplierStats = inventoryData.value.reduce((acc: Record<string, { name: string; issues: number; totalItems: number }>, item) => {
      if (!item.supplier) return acc;
      if (!acc[item.supplier]) {
        acc[item.supplier] = { name: item.supplier, issues: 0, totalItems: 0 };
      }
      acc[item.supplier].totalItems++;
      if (item.status === 'risk' || item.status === 'frozen') {
        acc[item.supplier].issues++;
      }
      return acc;
    }, {} as Record<string, { name: string; issues: number; totalItems: number }>);

    return Object.values(supplierStats)
      .map(s => ({
        ...s,
        riskScore: s.totalItems > 0 ? Math.round((s.issues / s.totalItems) * 100) : 0,
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
  });

  const topQualitySuppliers = computed(() => {
      const supplierStats = inventoryData.value.reduce((acc: Record<string, { name: string; defects: number; batches: Set<string> }>, item) => {
      if (!item.supplier || !item.batchNumber) return acc;
      if (!acc[item.supplier]) {
        acc[item.supplier] = { name: item.supplier, defects: 0, batches: new Set() };
      }
      acc[item.supplier].batches.add(item.batchNumber);
      if (item.status === 'frozen') { // 假设'frozen'代表不合格
        acc[item.supplier].defects++;
      }
      return acc;
    }, {} as Record<string, { name: string; defects: number; batches: Set<string> }>);

    return Object.values(supplierStats)
      .map(s => {
        const batchCount = s.batches.size;
        const defectRate = batchCount > 0 ? Math.round((s.defects / batchCount) * 100) : 0;
        let qualityLevel = '优秀';
        if (defectRate > 5) qualityLevel = '较差';
        else if (defectRate > 0) qualityLevel = '一般';
        
        return {
          name: s.name,
          defectRate,
          batchCount,
          qualityLevel,
        }
      })
      .filter(s => s.batchCount >= 3) // 至少3个批次才统计
      .sort((a, b) => b.defectRate - a.defectRate)
      .slice(0, 5);
  });

  // --- 近期风险与冻结物料 ---
  const formatItemForDisplay = (item: InventoryItem) => ({
      type: item.materialName.includes('传感器') ? '传感器' : '电子元件',
      code: item.materialCode,
      materialName: item.materialName,
      supplier: item.supplier,
      batchNo: item.batchNumber,
      warehouse: item.warehouse,
      status: item.status,
      details: `入库于 ${item.receiveDate}, 数量: ${item.quantity}`,
      freezeReason: item.freezeReason,
  });

  const riskOnlyMaterials = computed(() => {
    return inventoryData.value
      .filter(item => item.status === 'risk')
      .sort((a, b) => new Date(b.receiveDate).getTime() - new Date(a.receiveDate).getTime())
      .slice(0, 4)
      .map(formatItemForDisplay);
  });
  
  const frozenOnlyMaterials = computed(() => {
    return inventoryData.value
      .filter(item => item.status === 'frozen')
      .sort((a, b) => new Date(b.receiveDate).getTime() - new Date(a.receiveDate).getTime())
      .slice(0, 4)
      .map(formatItemForDisplay);
  });

  // --- 动态图表数据 ---
  const freezeReasonChartData = computed(() => {
      const reasonCounts = inventoryData.value
        .filter(item => item.status === 'frozen' && item.freezeReason)
        .reduce((acc, item) => {
            if (item.freezeReason) {
              const reason = item.freezeReason.includes('质量') ? '质量问题' : (item.freezeReason.includes('参数') ? '技术参数' : '其他');
              acc[reason] = (acc[reason] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

      return Object.entries(reasonCounts).map(([name, value]) => ({ name, value }));
  });

  // =================================================================
  // === NEW: Analysis for OnlineView                             ====
  // =================================================================

  const supplierPerformance = computed(() => {
    const stats = inventoryData.value.reduce((acc, item) => {
      if (!item.supplier) return acc;

      if (!acc[item.supplier]) {
        acc[item.supplier] = {
          name: item.supplier,
          deliveryCount: 0,
          defectCount: 0,
          totalQualityScore: 0,
          scoredItems: 0,
        };
      }

      const supplierStat = acc[item.supplier];
      supplierStat.deliveryCount++;
      
      // qualityStatus is the source of truth for defects
      if (item.qualityStatus === '不合格') {
        supplierStat.defectCount++;
      }
      
      // Use a mock quality score for now if not present, assuming 95 for good, 70 for bad
      const score = item.qualityScore ?? (item.qualityStatus === '不合格' ? 70 : 95);
      supplierStat.totalQualityScore += score;
      supplierStat.scoredItems++;
      
      return acc;
    }, {} as Record<string, { name: string; deliveryCount: number; defectCount: number; totalQualityScore: number; scoredItems: number; }>);

    return Object.values(stats).map(s => {
      const defectRate = s.deliveryCount > 0 ? parseFloat(((s.defectCount / s.deliveryCount) * 100).toFixed(1)) : 0;
      const avgQualityScore = s.scoredItems > 0 ? Math.round(s.totalQualityScore / s.scoredItems) : 0;
      return {
        name: s.name,
        defectRate,
        deliveryCount: s.deliveryCount,
        qualityScore: avgQualityScore,
      };
    });
  });

  const supplierChartData = computed(() => {
    const sortedByDefectRate = [...supplierPerformance.value].sort((a, b) => b.defectRate - a.defectRate);
    
    return {
      supplierNames: sortedByDefectRate.map(s => s.name),
      defectRates: sortedByDefectRate.map(s => s.defectRate),
      deliveryCounts: sortedByDefectRate.map(s => s.deliveryCount),
      qualityScores: sortedByDefectRate.map(s => s.qualityScore),
    };
  });

  const onlineInsights = computed(() => {
    const performanceData = supplierPerformance.value;
    if (performanceData.length === 0) {
      return {
        highRiskSuppliers: [],
        topSupplier: 'N/A',
        topSupplierDefectRate: 0,
        mostActiveSupplier: 'N/A',
        mostActiveSupplierCount: 0,
        avgSupplierDefectRate: 0,
        supplierCount: 0,
        highPerformanceCount: 0,
      };
    }

    const highRiskSuppliers = performanceData.filter(s => s.defectRate > 5).sort((a, b) => b.defectRate - a.defectRate);
    const topSupplier = [...performanceData].sort((a, b) => a.defectRate - b.defectRate)[0];
    const mostActiveSupplier = [...performanceData].sort((a, b) => b.deliveryCount - a.deliveryCount)[0];
    const totalDefectRate = performanceData.reduce((sum, s) => sum + s.defectRate, 0);
    const avgSupplierDefectRate = parseFloat((totalDefectRate / performanceData.length).toFixed(1));
    const highPerformanceCount = performanceData.filter(s => s.defectRate <= 1 && s.qualityScore >= 95).length;

    return {
      highRiskSuppliers: highRiskSuppliers.map(s => ({ name: s.name, defectRate: s.defectRate })),
      topSupplier: topSupplier?.name ?? 'N/A',
      topSupplierDefectRate: topSupplier?.defectRate ?? 0,
      mostActiveSupplier: mostActiveSupplier?.name ?? 'N/A',
      mostActiveSupplierCount: mostActiveSupplier?.deliveryCount ?? 0,
      avgSupplierDefectRate,
      supplierCount: performanceData.length,
      highPerformanceCount,
    };
  });

  // =================================================================
  // === NEW: Analysis for LabView                                ====
  // =================================================================

  const labAnalysis = computed(() => {
    const labItems = inventoryData.value.filter(item => item.testStatus && item.testStatus !== 'Untested');
    if (labItems.length === 0) {
      return {
        totalTests: 0,
        passRate: 0,
        topDefectDescription: 'N/A',
        topDefectSupplier: 'N/A',
        defectByDescription: [],
        defectBySupplier: []
      };
    }
    
    const totalTests = labItems.length;
    const passedCount = labItems.filter(item => item.testStatus === 'Pass' || item.testStatus === 'Conditional Pass').length;
    const passRate = parseFloat(((passedCount / totalTests) * 100).toFixed(1));

    const ngItems = labItems.filter(item => item.testStatus === 'Fail');

    const defectByDescription = ngItems.reduce((acc, item) => {
      const desc = item.testDefectDescription || '未知原因';
      acc[desc] = (acc[desc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const defectBySupplier = ngItems.reduce((acc, item) => {
      const supplier = item.supplier || '未知供应商';
      acc[supplier] = (acc[supplier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topDefectDescription = Object.keys(defectByDescription).sort((a, b) => defectByDescription[b] - defectByDescription[a])[0] || 'N/A';
    const topDefectSupplier = Object.keys(defectBySupplier).sort((a, b) => defectBySupplier[b] - defectBySupplier[a])[0] || 'N/A';
    
    return {
      totalTests,
      passRate,
      topDefectDescription,
      topDefectSupplier,
      defectByDescription: Object.entries(defectByDescription).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
      defectBySupplier: Object.entries(defectBySupplier).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
    };
  });

  return {
    // 基础统计
    normalItemsCount,
    riskItemsCount,
    frozenItemsCount,
    // 仪表盘
    mainStorageArea,
    frozenItemsWarehouse,
    topRiskSupplier,
    riskLevel,
    riskLevelDescription,
    // 供应商分析
    topRiskSuppliers,
    topQualitySuppliers,
    // 风险列表
    riskOnlyMaterials,
    frozenOnlyMaterials,
    // 图表数据
    freezeReasonChartData,

    // New exports for OnlineView
    supplierPerformance,
    supplierChartData,
    onlineInsights,

    // New exports for LabView
    labAnalysis,
  };
} 