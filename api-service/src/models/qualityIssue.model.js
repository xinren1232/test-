/**
 * 质量问题模型
 */
module.exports = (sequelize, DataTypes) => {
  const QualityIssue = sequelize.define('QualityIssue', {
    issue_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '问题ID'
    },
    material_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '物料代码'
    },
    batch_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '批次号'
    },
    issue_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '问题类型'
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium',
      comment: '严重程度'
    },
    detection_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '发现日期'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '问题描述'
    },
    root_cause: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '根本原因'
    },
    correction: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '纠正措施'
    },
    corrective_action: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '纠正措施'
    },
    preventive_action: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '预防措施'
    },
    status: {
      type: DataTypes.ENUM('open', 'investigating', 'correcting', 'verifying', 'closed'),
      allowNull: false,
      defaultValue: 'open',
      comment: '状态'
    },
    report_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '报告人'
    },
    assigned_to: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '负责人'
    },
    closed_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '关闭日期'
    },
    closed_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '关闭人'
    },
    ai_analysis: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'AI分析结果'
    },
    ai_recommendations: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'AI建议'
    }
  }, {
    tableName: 'quality_issues',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_quality_issue_material_batch',
        fields: ['material_code', 'batch_id']
      },
      {
        name: 'idx_quality_issue_type',
        fields: ['issue_type']
      },
      {
        name: 'idx_quality_issue_status',
        fields: ['status']
      },
      {
        name: 'idx_quality_issue_severity',
        fields: ['severity']
      }
    ]
  });

  QualityIssue.associate = function(models) {
    // 与物料的多对一关系
    QualityIssue.belongsTo(models.Material, {
      foreignKey: 'material_code',
      as: 'material'
    });
    
    // 与库存的多对一关系（基于批次号）
    QualityIssue.belongsTo(models.Inventory, {
      foreignKey: 'batch_id',
      targetKey: 'batch_id',
      as: 'inventory'
    });
    
    // 与实验室测试的多对多关系
    QualityIssue.belongsToMany(models.LabTest, {
      through: 'lab_test_quality_issues',
      foreignKey: 'issue_id',
      otherKey: 'test_id',
      as: 'labTests'
    });
  };

  // 质量问题钩子，用于更新库存状态
  QualityIssue.addHook('afterCreate', async (issue, options) => {
    try {
      // 如果严重程度为高或严重，则冻结对应批次的库存
      if (issue.severity === 'high' || issue.severity === 'critical') {
        const { Inventory } = sequelize.models;
        
        await Inventory.update(
          {
            status: 'frozen',
            freeze_reason: `质量问题：${issue.issue_type}（${issue.severity}）`,
            last_operation: 'freeze',
            operator: issue.report_by,
            operation_time: new Date()
          },
          {
            where: {
              batch_id: issue.batch_id,
              material_code: issue.material_code,
              status: 'normal' // 只更新正常状态的库存
            },
            transaction: options.transaction
          }
        );
      }
    } catch (error) {
      console.error('更新库存状态失败:', error);
    }
  });

  return QualityIssue;
}; 