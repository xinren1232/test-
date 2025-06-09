/**
 * 实验室测试模型
 */
module.exports = (sequelize, DataTypes) => {
  const LabTest = sequelize.define('LabTest', {
    test_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '测试ID'
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
    test_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '测试日期'
    },
    test_item: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '测试项目'
    },
    result: {
      type: DataTypes.ENUM('OK', 'NG', '有条件接收'),
      allowNull: false,
      comment: '测试结果'
    },
    defect_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '不良率'
    },
    test_parameters: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '测试参数'
    },
    test_details: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '测试详情'
    },
    tester: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '测试人员'
    },
    reviewer: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '复核人员'
    },
    review_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '复核日期'
    },
    review_comments: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '复核意见'
    },
    ai_analysis: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'AI分析结果'
    },
    ai_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'AI评分'
    }
  }, {
    tableName: 'lab_tests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_lab_test_material_batch',
        fields: ['material_code', 'batch_id']
      },
      {
        name: 'idx_lab_test_result',
        fields: ['result']
      },
      {
        name: 'idx_lab_test_date',
        fields: ['test_date']
      }
    ]
  });

  LabTest.associate = function(models) {
    // 与物料的多对一关系
    LabTest.belongsTo(models.Material, {
      foreignKey: 'material_code',
      as: 'material'
    });
    
    // 与库存的多对一关系（基于批次号）
    LabTest.belongsTo(models.Inventory, {
      foreignKey: 'batch_id',
      targetKey: 'batch_id',
      as: 'inventory'
    });
    
    // 与质量问题的多对多关系
    LabTest.belongsToMany(models.QualityIssue, {
      through: 'lab_test_quality_issues',
      foreignKey: 'test_id',
      otherKey: 'issue_id',
      as: 'qualityIssues'
    });
  };

  // 测试结果钩子，用于更新库存状态
  LabTest.addHook('afterCreate', async (labTest, options) => {
    try {
      const { Inventory } = sequelize.models;
      
      // 如果测试结果为NG，则将对应批次的库存状态更新为冻结
      if (labTest.result === 'NG') {
        await Inventory.update(
          {
            status: 'frozen',
            freeze_reason: `测试不合格：${labTest.test_item}`,
            last_operation: 'freeze',
            operator: labTest.tester,
            operation_time: new Date()
          },
          {
            where: {
              batch_id: labTest.batch_id,
              material_code: labTest.material_code,
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

  return LabTest;
}; 