import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { CommentsModule } from './comments/comments.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [UsersModule, EventsModule, CommentsModule, PostsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
