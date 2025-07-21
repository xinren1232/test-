export default (sequelize, DataTypes) => {
  const LabTest = sequelize.define("LabTest", {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    test_id: {
      type: DataTypes.STRING(50),
      allowNull: false
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
    test_date: {
      type: DataTypes.DATEONLY
    },
    test_item: {
      type: DataTypes.STRING(100)
    },
    test_result: {
      type: DataTypes.STRING(20)
    },
    conclusion: {
      type: DataTypes.STRING(255)
    },
    defect_desc: {
      type: DataTypes.STRING(255)
    },
    tester: {
      type: DataTypes.STRING(50)
    },
    reviewer: {
      type: DataTypes.STRING(50)
    }
  }, {
    tableName: 'lab_tests',
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at'
  });

  return LabTest;
};