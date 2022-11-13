import { join } from 'path';

import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import * as entities from '../entities';

config();

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: true,
  entities,
  migrations: [join(__dirname, '../seeds/*.{t,j}s')],
});
