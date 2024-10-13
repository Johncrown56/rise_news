import AppDataSource from "../config/db";
import { NextFunction, Request, Response } from "express";
import { Post } from "../entity";
import { validate } from 'class-validator';
import { CreatePostDto } from '../dtos';
import asyncHandler from "express-async-handler";

export const createPost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { title, content, userId } = req.body;
  const postDto = new CreatePostDto();
  postDto.title = title;
  postDto.content = content;
  postDto.userId = userId;

  const errors = await validate(postDto);
  if (errors.length > 0) {
    res.status(400).json({ success: false, message: "Missing required fields", errors: errors.map((err) => Object.values(err?.constraints)) });
    return;
  }

  try {
    const postRepository = AppDataSource.getRepository(Post);
    const newPost = postRepository.create({
      title,
      content,
      user: { id: userId },
    });

    await postRepository.save(newPost);
     res.status(201).json({success: true, message: 'Post created successfully', post: newPost });
  } catch (error: any) {
     next(error);
  }
});


export const getUserPosts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
  
    try {
      const postRepository = AppDataSource.getRepository(Post);
      const posts = await postRepository.find({
        where: { user: { id: Number(id) } },
        relations: ['user'],
      });
  
      if (posts.length === 0) {
        res.status(404).json({ success: false, message: 'No posts found for this user' });
        return;
      }
  
      res.status(200).json({success: true, message: "User fetched successfully", data: posts});
    } catch (error) {
      next(error);
    }
  });
  