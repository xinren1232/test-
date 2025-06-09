/**
 * 物料模型
 */
module.exports = (sequelize, DataTypes) => {
  const Material = sequelize.define('Material', {
    material_code: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
      comment: '物料编码'
    },
    material_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '物料名称'
    },
    specifications: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '规格'
    },
    unit: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: '单位'
    }
  }, {
    tableName: 'materials',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Material.associate = function(models) {
    // 与库存的一对多关系
    Material.hasMany(models.Inventory, {
      foreignKey: 'material_code',
      as: 'inventories'
    });
    
    // 与实验室测试的一对多关系
    Material.hasMany(models.LabTest, {
      foreignKey: 'material_code',
      as: 'labTests'
    });
    
    // 与质量问题的一对多关系
    Material.hasMany(models.QualityIssue, {
      foreignKey: 'material_code',
      as: 'qualityIssues'
    });
    
    // 与供应商的多对多关系
    Material.belongsToMany(models.Supplier, {
      through: models.MaterialSupplier,
      foreignKey: 'material_code',
      otherKey: 'supplier_id',
      as: 'suppliers'
    });
  };

  return Material;
}; 