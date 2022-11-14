import { join } from 'path';

import { DataSource } from 'typeorm';

import * as entities from '../entities';

import { dbConfig } from './db.config';

export const dataSource = new DataSource({
  type: 'postgres',
  ...dbConfig,
  logging: true,
  entities,
  migrations: [join(__dirname, '../migrations/*.{t,j}s')],
});
