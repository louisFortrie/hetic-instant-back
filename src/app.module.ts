import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { CommentsModule } from './comments/comments.module';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'ormconfig';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    UsersModule,
    EventsModule,
    CommentsModule,
    PostsModule,
    TypeOrmModule.forRoot(config),
    MulterModule.register()
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
