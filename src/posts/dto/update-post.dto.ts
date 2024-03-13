import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { User } from 'src/users/entities/user.entity';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  user: User;
  
}
