/**
 * 库存模型
 */
module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define('Inventory', {
    inventory_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '库存ID'
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
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '数量'
    },
    unit: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: '单位'
    },
    location: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '库位'
    },
    factory: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '工厂'
    },
    status: {
      type: DataTypes.ENUM('normal', 'frozen', 'pending', 'rejected'),
      allowNull: false,
      defaultValue: 'normal',
      comment: '状态：正常/冻结/待检/不合格'
    },
    arrival_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '入库时间'
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '过期日期'
    },
    freeze_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '冻结原因'
    },
    last_operation: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '最后操作'
    },
    operator: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '操作人'
    },
    operation_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '操作时间'
    }
  }, {
    tableName: 'inventory',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_inventory_material_batch',
        fields: ['material_code', 'batch_id']
      },
      {
        name: 'idx_inventory_status',
        fields: ['status']
      }
    ]
  });

  Inventory.associate = function(models) {
    // 与物料的多对一关系
    Inventory.belongsTo(models.Material, {
      foreignKey: 'material_code',
      as: 'material'
    });
    
    // 与实验室测试的一对多关系
    Inventory.hasMany(models.LabTest, {
      foreignKey: 'batch_id',
      sourceKey: 'batch_id',
      as: 'labTests'
    });
    
    // 与质量问题的一对多关系
    Inventory.hasMany(models.QualityIssue, {
      foreignKey: 'batch_id',
      sourceKey: 'batch_id',
      as: 'qualityIssues'
    });
  };

  return Inventory;
}; 