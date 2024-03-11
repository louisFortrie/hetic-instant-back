import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import dotenv from 'dotenv';
import {
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
import crypto from 'crypto';

dotenv.config();

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
  randomImageName(bytes = 32) {
    const random = crypto.randomBytes(bytes).toString('hex');
    return random;
  }

  create(createPostDto: CreatePostDto) {
    return 'This action adds a new post';
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
    return `This action uploads an image`;
  }

  async findAll() {
    const posts = [];

    for (const post of posts) {
      const getOnejectParams = {
        Bucket: BUCKET_NAME,
        Key: post.imageName,
      };
      const command = new GetObjectCommand(getOnejectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      post.url = url;
    }
    return `This action returns all posts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  async remove(id: number) {
    const post = this.findOne(id);
    if (!post) {
      return 'Post not found';
    }

    const deleteObjectParams = {
      Bucket: BUCKET_NAME,
      Key: post.imageName,
    };
    const command = new DeleteObjectCommand(deleteObjectParams);
    await s3.send(command);

    return `This action removes a #${id} post`;
  }
}
