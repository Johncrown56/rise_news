import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Post, User, Comment } from '../entity';
import { CreateCommentDto } from "../dtos";
import { validate } from "class-validator";
import AppDataSource from "../config/db";


export const addCommentToPost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { body, params } = req;
    const { postId } = params;
    const { content, userId } = body;

    const commentDto = new CreateCommentDto();
    commentDto.postId = Number(postId);
    commentDto.content = content;

    const errors = await validate(commentDto);
    if (errors.length > 0) {
       res.status(400).json({ success: false, message: "Missing required fields", errors: errors.map((err) => Object.values(err?.constraints)) });
       return;
    }

    try {
        const postRepository = AppDataSource.getRepository(Post);
        const post = await postRepository.findOne({ where: { id: Number(postId) } });

        if (!post) {
            res.status(404).json({success: false, message: 'Post not found' });
            return;
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({where: userId});

        if (!user) {
            res.status(404).json({success: false, message: 'User not found' });
            return;
        }

        const commentRepository = AppDataSource.getRepository(Comment);
        const comment = commentRepository.create({ content, post, user });

        await commentRepository.save(comment);
        res.status(201).json({ success: true, message: "Comment added successfully", data: comment });
    } catch (error) {
        console.log(error);
        next(error);
    }
});