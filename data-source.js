const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'forum_mysql',
  entities: ['dist/src/**/*.entity.js'],
  migrations: ['dist/src/core/database/migrations/*.js'],
  synchronize: false,
  logging: false,
});

module.exports = { default: AppDataSource };