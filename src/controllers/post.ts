import AppDataSource from "../config/db";
import { NextFunction, Request, Response } from "express";
import { Post } from "../entity";
import { getRepository } from 'typeorm';
import { validate } from 'class-validator';
import { CreatePostDto } from '../dtos';
import asyncHandler from "express-async-handler";

export const createPost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { title, userId } = req.body;
  const postDto = new CreatePostDto();
  postDto.title = title;
  postDto.userId = userId;

  const errors = await validate(postDto);
  if (errors.length > 0) {
    res.status(400).json({ errors: errors.map((err) => Object.values(err?.constraints)) });
  }

  try {
    const postRepository = getRepository(Post);
    const newPost = postRepository.create({
      title,
      user: { id: userId }, // Use userId for relation
    });

    await postRepository.save(newPost);
     res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error: any) {
     next(error);
  }
});


export const getUserPosts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
  
    try {
      const postRepository = AppDataSource.getRepository(Post);
      const posts = await postRepository.find({
        where: { user: { id: Number(id) } }, // Corrected this part
        relations: ['user'],
      });
  
      if (posts.length === 0) {
        res.status(404).json({ message: 'No posts found for this user' });
      }
  
      res.status(200).json({success: true, message: "", data: posts});
    } catch (error) {
      next(error);
    }
  });
  