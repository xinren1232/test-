/**
 * 物料供应商关联模型
 */
module.exports = (sequelize, DataTypes) => {
  const MaterialSupplier = sequelize.define('MaterialSupplier', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '关联ID'
    },
    material_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '物料代码'
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '供应商ID'
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否主供应商'
    },
    quality_level: {
      type: DataTypes.ENUM('A', 'B', 'C', 'D'),
      allowNull: true,
      comment: '质量等级'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '价格'
    },
    lead_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '交货周期（天）'
    },
    min_order_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '最小订购量'
    },
    last_supply_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最近供货日期'
    }
  }, {
    tableName: 'material_suppliers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_material_supplier',
        fields: ['material_code', 'supplier_id'],
        unique: true
      },
      {
        name: 'idx_primary_supplier',
        fields: ['material_code', 'is_primary']
      }
    ]
  });

  return MaterialSupplier;
}; 