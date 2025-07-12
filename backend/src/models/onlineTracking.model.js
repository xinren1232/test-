export default (sequelize, DataTypes) => {
  const OnlineTracking = sequelize.define("OnlineTracking", {
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
    supplier_name: {
      type: DataTypes.STRING(100)
    },
    online_date: {
      type: DataTypes.DATEONLY
    },
    use_time: {
      type: DataTypes.DATE
    },
    factory: {
      type: DataTypes.STRING(50)
    },
    workshop: {
      type: DataTypes.STRING(50)
    },
    line: {
      type: DataTypes.STRING(50)
    },
    project: {
      type: DataTypes.STRING(100)
    },
    defect_rate: {
      type: DataTypes.DECIMAL(5, 4)
    },
    exception_count: {
      type: DataTypes.INTEGER
    },
    operator: {
      type: DataTypes.STRING(50)
    },
    inspection_date: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'online_tracking',
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at'
  });

  return OnlineTracking;
};