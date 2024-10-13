import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Post, User, Comment } from '../entity';
import { CreateCommentDto } from "../dtos";
import { isNotEmpty, validate } from "class-validator";
import AppDataSource from "../config/db";


export const addCommentToPost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { body, params } = req;
    const { postId } = params;
    const { content } = body;

    // get the logged in user
    const user: User = req["user"];
    const { id } = user;

    // Validate the user
    if (!isNotEmpty(user)) {
        res.status(401);
        throw new Error("User not found");
    }

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
        const user = await userRepository.findOne({where: { id } });

        if (!user) {
            res.status(404).json({success: false, message: 'User not found' });
            return;
        }

        const commentRepository = AppDataSource.getRepository(Comment);
        const comment = commentRepository.create({ content, post, user });

        
        const data = await commentRepository.save(comment);
        // remove unneccessary property from each comment object
        data.user.password = undefined;
        data.user.createdAt = undefined;
        data.user.updatedAt = undefined;
        data.user.deletedAt = undefined;
        data.post.deletedAt = undefined;
        data.deletedAt = undefined;

        res.status(201).json({ success: true, message: "Comment added successfully", data });
    } catch (error) {
        console.log(error);
        next(error);
    }
});