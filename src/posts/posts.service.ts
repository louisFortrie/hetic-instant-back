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
import crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';

const BUCKET_NAME = process.env.BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}

  randomImageName(bytes = 32) {
    const random = crypto.randomBytes(bytes).toString('hex');
    return random;
  }

  async create(createPostDto: CreatePostDto, file: Express.Multer.File) {
    const post = this.postRepository.create(createPostDto);
    await this.uploadImage(file);
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
    const params = {
      Bucket: BUCKET_NAME,
      Key: this.randomImageName(),
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);

    await s3.send(command);
  }

  async findAll() {
    const posts = await this.postRepository.find();

    const postsWithUrl = [];

    for (const post of posts) {
      const getOnejectParams = {
        Bucket: BUCKET_NAME,
        Key: post.imageName,
      };
      const command = new GetObjectCommand(getOnejectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
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
      Bucket: BUCKET_NAME,
      Key: post.imageName,
    };
    const command = new GetObjectCommand(getOnejectParams);
    const url = getSignedUrl(s3, command, { expiresIn: 3600 });

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
      Bucket: BUCKET_NAME,
      Key: post.imageName,
    };
    const command = new DeleteObjectCommand(deleteObjectParams);
    await s3.send(command);

    return await this.postRepository.delete(id);
  }
}
