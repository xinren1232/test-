import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const NlpIntentRule = sequelize.define('NlpIntentRule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    intent_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '意图名称/关键字',
    },
    description: {
      type: DataTypes.STRING(255),
      comment: '规则描述',
    },
    action_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '动作类型 (SQL_QUERY, FUNCTION_CALL, API_CALL)',
    },
    action_target: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '动作目标 (支持Jinja2模板的SQL或函数名)',
    },
    parameters: {
      type: DataTypes.JSON,
      comment: '参数定义 [{"name": "batch", "type": "string", "required": true}]',
    },
    trigger_words: {
      type: DataTypes.JSON,
      comment: '触发关键词数组，支持同义词和模糊匹配',
    },
    synonyms: {
      type: DataTypes.JSON,
      comment: '同义词映射 {"风险": ["异常", "危险"], "批次": ["batch", "批号"]}',
    },
    example_query: {
      type: DataTypes.STRING(255),
      comment: '示例问题',
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '优先级，数字越大优先级越高',
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
      comment: '状态 (active/inactive)',
    },
  }, {
    tableName: 'nlp_intent_rules',
    timestamps: true, // Sequelize将管理createdAt和updatedAt
    createdAt: 'created_at', // 映射到数据库中的created_at
    updatedAt: 'updated_at', // 映射到数据库中的updated_at
    underscored: true, // 使用蛇形命名法（snake_case）
    comment: 'NLP意图规则表',
  });

  return NlpIntentRule;
}; 