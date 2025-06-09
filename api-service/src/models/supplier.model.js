/**
 * 供应商模型
 */
module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define('Supplier', {
    supplier_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '供应商ID'
    },
    supplier_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: '供应商代码'
    },
    supplier_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '供应商名称'
    },
    contact_person: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '联系人'
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '联系电话'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '电子邮箱'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '地址'
    },
    risk_level: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '风险等级：0-低风险，1-中风险，2-高风险'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态：0-停用，1-启用'
    },
    qualification: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '资质信息'
    },
    evaluation_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '评估得分'
    },
    last_evaluation_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最近评估日期'
    },
    ai_risk_analysis: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'AI风险分析'
    }
  }, {
    tableName: 'suppliers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_supplier_code',
        fields: ['supplier_code']
      },
      {
        name: 'idx_supplier_risk',
        fields: ['risk_level']
      },
      {
        name: 'idx_supplier_status',
        fields: ['status']
      }
    ]
  });

  Supplier.associate = function(models) {
    // 与物料的多对多关系
    Supplier.belongsToMany(models.Material, {
      through: models.MaterialSupplier,
      foreignKey: 'supplier_id',
      otherKey: 'material_code',
      as: 'materials'
    });
  };

  return Supplier;
}; 