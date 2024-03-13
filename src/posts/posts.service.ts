import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

  private readonly s3 = new S3Client({
    region: this.configService.getOrThrow('AWS_REGION'),
    credentials: {
      accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY'),
      secretAccessKey: this.configService.getOrThrow('AWS_SECRET_KEY'),
    },
  });

  randomImageName(bytes = 32) {
    const random = randomBytes(bytes).toString('hex');
    return random;
  }

  async create(createPostDto: CreatePostDto, file: Express.Multer.File) {
    const user = await this.userService.findOne(createPostDto.userId);

    const newPost = new Post();
    newPost.imageName = await this.uploadImage(file);
    newPost.user = user;
    newPost.title = createPostDto.title;

    const post = this.postRepository.create(newPost);
    return await this.postRepository.save(post);
  }

  async addLike(id: string) {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new Error(`Post with id ${id} not found.`);
    }
    post.likes += 1;
    return await this.postRepository.save(post);
  }

  async uploadImage(file: Express.Multer.File) {
    console.log('bucket name is', this.configService.getOrThrow('BUCKET_NAME'));
    const imageName = this.randomImageName();
    const params = {
      Bucket: this.configService.getOrThrow('BUCKET_NAME'),
      Key: imageName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);

    await this.s3.send(command);
    return imageName;
  }

  async findAll() {
    const posts = await this.postRepository.find({ order: { likes: 'DESC' } });

    const postsWithUrl = [];

    for (const post of posts) {
      const getOnejectParams = {
        Bucket: this.configService.getOrThrow('BUCKET_NAME'),
        Key: post.imageName,
      };
      const command = new GetObjectCommand(getOnejectParams);
      const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
      const postWithUrl = {
        ...post,
        url,
      };
      postsWithUrl.push(postWithUrl);
    }
    return postsWithUrl;
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne({ where: { id } });

    const getOnejectParams = {
      Bucket: this.configService.getOrThrow('BUCKET_NAME'),
      Key: post.imageName,
    };
    const command = new GetObjectCommand(getOnejectParams);
    const url = getSignedUrl(this.s3, command, { expiresIn: 3600 });

    return { ...post, url };
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    return await this.postRepository.update(id, updatePostDto);
  }

  async remove(id: string) {
    const post = await this.findOne(id);
    if (!post) {
      return 'Post not found';
    }

    const deleteObjectParams = {
      Bucket: this.configService.getOrThrow('BUCKET_NAME'),
      Key: post.imageName,
    };
    const command = new DeleteObjectCommand(deleteObjectParams);
    await this.s3.send(command);

    return await this.postRepository.delete(id);
  }
}
