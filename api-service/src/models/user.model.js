/**
 * 用户模型
 */
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '用户ID'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名'
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '密码（哈希）'
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '姓名'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '电子邮箱'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '电话'
    },
    department: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '部门'
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'operator', 'viewer'),
      allowNull: false,
      defaultValue: 'operator',
      comment: '角色'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'locked'),
      allowNull: false,
      defaultValue: 'active',
      comment: '状态'
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后登录时间'
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '头像URL'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_username',
        fields: ['username'],
        unique: true
      },
      {
        name: 'idx_role',
        fields: ['role']
      },
      {
        name: 'idx_status',
        fields: ['status']
      }
    ]
  });

  // 类方法
  User.associate = function(models) {
    // 这里可以添加与其他模型的关联
  };

  // 实例方法
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password; // 移除密码字段
    return values;
  };

  return User;
}; 