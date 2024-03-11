import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  username: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, default: 'user' })
  role: string;

  @OneToMany((type) => Post, (post) => post.user)
  posts: Post[];

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }

  @BeforeInsert()
  usernameToLowerCase() {
    this.username = this.username.toLowerCase();
  }

  @BeforeInsert()
  hashPassword() {
    this.password = bcrypt.hashSync(this.password, SALT_ROUNDS);
  }
}
