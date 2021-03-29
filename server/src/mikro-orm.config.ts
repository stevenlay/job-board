import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import path from 'path';
import { Post } from './entities/Post';
import { User } from './entities/User';

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  type: process.env.ORM_TYPE || 'postgresql',
  dbName: process.env.DB_NAME || 'mydb',
  user: process.env.USER_NAME || 'postgres',
  password: process.env.PASSWORD || 'postgres',
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
