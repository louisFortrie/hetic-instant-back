import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { User } from './src/users/entities/user.entity';
import { Post } from './src/posts/entities/post.entity';
import { Comment } from './src/comments/entities/comment.entity';

export const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'postgres',
  password: 'postgres',
  database: 'hetic-instant',
  entities: [User, Post, Comment],
  synchronize: true,
};

export default config;
