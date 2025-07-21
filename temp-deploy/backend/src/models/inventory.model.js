export default (sequelize, DataTypes) => {
  const Inventory = sequelize.define("Inventory", {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    batch_code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    material_code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    material_name: {
      type: DataTypes.STRING(100)
    },
    material_type: {
      type: DataTypes.STRING(50)
    },
    supplier_name: {
      type: DataTypes.STRING(100)
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    inbound_time: {
      type: DataTypes.DATE
    },
    storage_location: {
      type: DataTypes.STRING(100)
    },
    status: {
      type: DataTypes.STRING(20)
    },
    risk_level: {
      type: DataTypes.STRING(20)
    },
    inspector: {
      type: DataTypes.STRING(50)
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'inventory',
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: 'created_at'
  });

  return Inventory;
}; 