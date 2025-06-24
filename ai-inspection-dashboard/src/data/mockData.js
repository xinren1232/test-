/**
 * 模拟数据
 * 提供开发和测试环境使用的模拟数据
 */

// 模拟库存数据
const mockInventoryItems = [
  {
    id: 'inv_001',
    batch_id: 'b001',
    material_code: 'M001',
    material_name: '高强度钢板',
    quantity: 1000,
    remain_quantity: 850,
    unit: 'kg',
    status: 'normal',
    quality_status: 'approved',
    inspection_date: '2023-05-15T08:30:00Z',
    arrival_time: '2023-05-10T14:20:00Z',
    risk_level: 'low',
    risk_score: 12,
    risk_reason: '',
    shelf_life: '2024-05-10T00:00:00Z',
    inspector_id: 'user_001',
    notes: '',
    created_at: '2023-05-10T14:30:00Z',
    updated_at: '2023-05-15T08:35:00Z'
  },
  {
    id: 'inv_002',
    batch_id: 'b002',
    material_code: 'M002',
    material_name: '铝合金板',
    quantity: 500,
    remain_quantity: 500,
    unit: 'kg',
    status: 'hold',
    quality_status: 'pending',
    inspection_date: null,
    arrival_time: '2023-05-16T09:15:00Z',
    risk_level: 'medium',
    risk_score: 45,
    risk_reason: '供应商近期有质量问题',
    shelf_life: '2023-11-16T00:00:00Z',
    inspector_id: null,
    notes: '等待质检',
    created_at: '2023-05-16T09:20:00Z',
    updated_at: '2023-05-16T09:20:00Z'
  },
  {
    id: 'inv_003',
    batch_id: 'b003',
    material_code: 'M003',
    material_name: '橡胶密封圈',
    quantity: 10000,
    remain_quantity: 9850,
    unit: 'pcs',
    status: 'normal',
    quality_status: 'approved',
    inspection_date: '2023-05-14T10:45:00Z',
    arrival_time: '2023-05-12T16:30:00Z',
    risk_level: 'low',
    risk_score: 8,
    risk_reason: '',
    shelf_life: '2025-05-12T00:00:00Z',
    inspector_id: 'user_002',
    notes: '',
    created_at: '2023-05-12T16:35:00Z',
    updated_at: '2023-05-14T10:50:00Z'
  }
];

// 模拟物料数据
const mockMaterials = [
  {
    code: 'M001',
    name: '高强度钢板',
    category_id: 'cat_001',
    category_name: '钢材',
    specification: 'HRC > 45, 厚度: 2.0mm',
    unit: 'kg',
    supplier_id: 'sup_001',
    supplier_name: '钢铁集团',
    min_stock: 200,
    max_stock: 2000,
    shelf_life: 365,
    inspection_level: 'normal',
    status: 'active',
    created_at: '2023-01-10T08:00:00Z',
    updated_at: '2023-03-15T14:20:00Z'
  },
  {
    code: 'M002',
    name: '铝合金板',
    category_id: 'cat_002',
    category_name: '有色金属',
    specification: '6061-T6, 厚度: 1.5mm',
    unit: 'kg',
    supplier_id: 'sup_002',
    supplier_name: '铝业有限公司',
    min_stock: 100,
    max_stock: 1000,
    shelf_life: 180,
    inspection_level: 'strict',
    status: 'active',
    created_at: '2023-02-05T09:30:00Z',
    updated_at: '2023-04-12T11:15:00Z'
  },
  {
    code: 'M003',
    name: '橡胶密封圈',
    category_id: 'cat_003',
    category_name: '橡胶制品',
    specification: '直径: 25mm, 厚度: 3mm',
    unit: 'pcs',
    supplier_id: 'sup_003',
    supplier_name: '橡塑制品厂',
    min_stock: 1000,
    max_stock: 20000,
    shelf_life: 730,
    inspection_level: 'normal',
    status: 'active',
    created_at: '2023-01-20T10:45:00Z',
    updated_at: '2023-03-25T16:30:00Z'
  }
];

// 模拟实验室测试数据
const mockLabTests = [
  {
    id: 'test_001',
    test_no: 'LT20230515001',
    batch_id: 'b001',
    material_code: 'M001',
    test_type: '入厂检验',
    method: '硬度测试',
    test_item: '硬度',
    test_procedure: 'TP-HT-001',
    inspector_id: 'user_001',
    reviewer_id: 'user_005',
    equipment_id: 'eq_001',
    result: 'pass',
    evaluation_status: 'approved',
    test_date: '2023-05-15T08:30:00Z',
    defect_rate: 0,
    test_source: '常规检验',
    conclusion: '符合要求',
    notes: '',
    created_at: '2023-05-15T08:00:00Z',
    updated_at: '2023-05-15T09:30:00Z',
    test_data_items: [
      {
        id: 'tdi_001',
        test_id: 'test_001',
        parameter: '洛氏硬度',
        parameter_code: 'HRC',
        value: '47',
        unit: 'HRC',
        lower_limit: '45',
        upper_limit: '50',
        status: 'pass',
        type: 'numeric',
        standard_id: 'std_001',
        notes: '',
        created_at: '2023-05-15T08:15:00Z',
        updated_at: '2023-05-15T08:15:00Z'
      }
    ]
  },
  {
    id: 'test_002',
    test_no: 'LT20230514001',
    batch_id: 'b003',
    material_code: 'M003',
    test_type: '入厂检验',
    method: '拉伸测试',
    test_item: '拉伸强度',
    test_procedure: 'TP-TS-002',
    inspector_id: 'user_002',
    reviewer_id: 'user_005',
    equipment_id: 'eq_002',
    result: 'pass',
    evaluation_status: 'approved',
    test_date: '2023-05-14T10:45:00Z',
    defect_rate: 0,
    test_source: '常规检验',
    conclusion: '符合要求',
    notes: '',
    created_at: '2023-05-14T10:00:00Z',
    updated_at: '2023-05-14T11:30:00Z',
    test_data_items: [
      {
        id: 'tdi_002',
        test_id: 'test_002',
        parameter: '拉伸强度',
        parameter_code: 'TS',
        value: '15.5',
        unit: 'MPa',
        lower_limit: '12',
        upper_limit: '18',
        status: 'pass',
        type: 'numeric',
        standard_id: 'std_002',
        notes: '',
        created_at: '2023-05-14T10:15:00Z',
        updated_at: '2023-05-14T10:15:00Z'
      }
    ]
  }
];

// 模拟质量问题数据
const mockQualityExceptions = [
  {
    id: 'qe_001',
    issue_id: 'QI20230520001',
    title: '钢板表面划痕',
    type: '外观缺陷',
    status: 'open',
    source: '入厂检验',
    risk_level: 'medium',
    related_batch_id: 'b001',
    material_code: 'M001',
    product: '',
    description: '在高强度钢板表面发现多处划痕，长度约5-10mm',
    root_cause: '运输过程中保护不当',
    corrective_actions: '与物流部门沟通，改进运输保护措施',
    preventive_actions: '修订运输包装规范',
    responsible_person: '张工',
    department: '质量部',
    discovery_date: '2023-05-20T09:30:00Z',
    due_date: '2023-05-30T00:00:00Z',
    close_date: null,
    created_at: '2023-05-20T10:00:00Z',
    updated_at: '2023-05-20T10:00:00Z'
  },
  {
    id: 'qe_002',
    issue_id: 'QI20230518001',
    title: '密封圈尺寸偏差',
    type: '尺寸偏差',
    status: 'in_progress',
    source: '生产检验',
    risk_level: 'high',
    related_batch_id: 'b003',
    material_code: 'M003',
    product: '',
    description: '橡胶密封圈内径尺寸超出公差范围，实测24.8mm，规格要求25±0.1mm',
    root_cause: '模具磨损',
    corrective_actions: '更换模具，重新生产',
    preventive_actions: '增加模具定期检查频率',
    responsible_person: '李工',
    department: '生产部',
    discovery_date: '2023-05-18T14:20:00Z',
    due_date: '2023-05-25T00:00:00Z',
    close_date: null,
    created_at: '2023-05-18T15:00:00Z',
    updated_at: '2023-05-19T09:30:00Z'
  },
  {
    id: 'qe_003',
    issue_id: 'QI20230510001',
    title: '铝板硬度不足',
    type: '材料性能',
    status: 'closed',
    source: '入厂检验',
    risk_level: 'medium',
    related_batch_id: 'b002',
    material_code: 'M002',
    product: '',
    description: '铝合金板硬度测试结果低于规格要求',
    root_cause: '供应商热处理工艺不当',
    corrective_actions: '退回不合格批次，要求供应商重新热处理',
    preventive_actions: '增加供应商过程审核频率',
    responsible_person: '王工',
    department: '质量部',
    discovery_date: '2023-05-10T11:30:00Z',
    due_date: '2023-05-20T00:00:00Z',
    close_date: '2023-05-19T16:00:00Z',
    created_at: '2023-05-10T13:00:00Z',
    updated_at: '2023-05-19T16:00:00Z'
  }
];

/**
 * 查询库存项目
 * @param {Object} params - 查询参数
 * @returns {Array} - 库存项目列表
 */
export function queryInventoryItems(params = {}) {
  let result = [...mockInventoryItems];
  
  // 按批次ID过滤
  if (params.batch_id) {
    result = result.filter(item => item.batch_id === params.batch_id);
  }
  
  // 按物料代码过滤
  if (params.material_code) {
    result = result.filter(item => item.material_code === params.material_code);
  }
  
  // 按状态过滤
  if (params.status) {
    result = result.filter(item => item.status === params.status);
  }
  
  return result;
}

/**
 * 查询物料
 * @param {Object} params - 查询参数
 * @returns {Array} - 物料列表
 */
export function queryMaterials(params = {}) {
  let result = [...mockMaterials];
  
  // 按类别ID过滤
  if (params.category_id) {
    result = result.filter(item => item.category_id === params.category_id);
  }
  
  // 按供应商ID过滤
  if (params.supplier_id) {
    result = result.filter(item => item.supplier_id === params.supplier_id);
  }
  
  // 按状态过滤
  if (params.status) {
    result = result.filter(item => item.status === params.status);
  }
  
  return result;
}

/**
 * 查询实验室测试
 * @param {Object} params - 查询参数
 * @returns {Array} - 实验室测试列表
 */
export function queryLabTests(params = {}) {
  let result = [...mockLabTests];
  
  // 按批次ID过滤
  if (params.batch_id) {
    result = result.filter(item => item.batch_id === params.batch_id);
  }
  
  // 按物料代码过滤
  if (params.material_code) {
    result = result.filter(item => item.material_code === params.material_code);
  }
  
  // 按测试类型过滤
  if (params.test_type) {
    result = result.filter(item => item.test_type === params.test_type);
  }
  
  // 按结果过滤
  if (params.result) {
    result = result.filter(item => item.result === params.result);
  }
  
  return result;
}

/**
 * 查询质量异常
 * @param {Object} params - 查询参数
 * @returns {Array} - 质量异常列表
 */
export function queryQualityExceptions(params = {}) {
  let result = [...mockQualityExceptions];
  
  // 按状态过滤
  if (params.status) {
    result = result.filter(item => item.status === params.status);
  }
  
  // 按风险等级过滤
  if (params.risk_level) {
    result = result.filter(item => item.risk_level === params.risk_level);
  }
  
  // 按批次ID过滤
  if (params.related_batch_id) {
    result = result.filter(item => item.related_batch_id === params.related_batch_id);
  }
  
  // 按物料代码过滤
  if (params.material_code) {
    result = result.filter(item => item.material_code === params.material_code);
  }
  
  return result;
}

export default {
  queryInventoryItems,
  queryMaterials,
  queryLabTests,
  queryQualityExceptions
}; 