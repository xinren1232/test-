// import 'dotenv/config'; // No longer needed for this approach

const dbConfig = {
    host: 'localhost',
    username: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection',
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // logging: console.log // Uncomment for debugging
};

export default dbConfig; 