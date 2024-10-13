import asyncHandler from "express-async-handler";
import { getManager } from "typeorm";
import { User } from "../entity/User.entity";
import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt';
import { Comment } from "../entity/Comment.entity";
import jwt from 'jsonwebtoken';
import { CreateUserDto } from "../dtos";
import { validate } from "class-validator";
import AppDataSource from "../config/db";


export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;
    const { email, password, firstName, lastName } = body;

    const userDto = new CreateUserDto();
    userDto.firstName = firstName;
    userDto.lastName = lastName;
    userDto.email = email;
    userDto.password = password;

    // Validate the userDto
    const errors = await validate(userDto);
    if (errors.length > 0) {
        res.status(400).json({ errors: errors.map((err) => Object.values(err?.constraints)) });
    }

    try {
        const userRepository = AppDataSource.getRepository(User);
        const existingUser = await userRepository.findOne({ where: { email } });

        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = userRepository.create({ email, password: hashedPassword, firstName, lastName });

        const data = await userRepository.save(user);

        type SafeUserData = Omit<
        User,
        | 'password'
        | 'id'
        | 'updatedAt'
        | 'deletedAt'
        | 'createdAt'
      >;

      const profile: SafeUserData = { ...data };
        res.status(201).json({ success: true, message: "User created successfully", data: profile });
    } catch (error) {
        //res.status(500).json({ message: 'Internal Server Error' });
        next(error); // Pass the error to the error handler middleware
    }
}


export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const JWT_SECRET = process.env.JWT_SECRET || 'secret';
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
         res.status(404);
         throw new Error('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password); // Assume the password is hashed
    if (!isPasswordValid) {
         res.status(400);
         throw new Error('Invalid credentials');
    }
    try {

        // Generate a token
        const encryptedData = { id: user.id, firstName: user.firstName, email: user.email };
        const token = jwt.sign(encryptedData, JWT_SECRET, { expiresIn: '1h' });

        type SafeUserData = Omit<
        User,
        | 'password'
        | 'id'
        | 'updatedAt'
        | 'deletedAt'
        | 'createdAt'
      >;

      const profile: SafeUserData = {
        ...user,
      };

        res.status(200).json({success: true, message: "", data: {...profile, token} });
    } catch (error: any) {
        res.status(500);
        throw new Error('Internal Server error');
    }
});


export const findUsers = asyncHandler(async (req: Request, res: Response) => {
    const userRepository = AppDataSource.getRepository(User);
    try {
        const users = await userRepository.find();
        // remove password and createdAt from each user
        const data = await Promise.all(users.map(async (user) => {
            user.password = undefined;
            user.createdAt = undefined;
            user.updatedAt = undefined;
            user.deletedAt = undefined;
            return user;
        }))
        res.status(200).json({ success: true, message: "Users retrieved successfully", data });
    } catch (error) {
        console.log(error);
        res.status(500);
        throw new Error("Internal Server Error");
    }
})

export const findUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: Number(id) } });

        if (!user) {
            res.status(404)
            throw new Error('User not found');
        }

        res.status(200).json({ success: true, message: "Users fetched successfully", data: user });
    } catch (error) {
        //res.status(500).json({ message: 'Internal Server Error' });
        console.log(error);
        res.status(500);
        throw new Error("Internal Server Error");
    }
});

// Implement an endpoint to fetch the top 3 users with the most posts and their latest comment
export const topContributors = asyncHandler(async (req: Request, res: Response) => {
    const userRepository = AppDataSource.getRepository(User);

    try {
        const users = await userRepository
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.posts", "post")
            .leftJoinAndSelect("user.comments", "comment")
            .loadRelationCountAndMap("user.postCount", "user.posts")
            .orderBy("user.postCount", "DESC")
            .limit(3)
            .getMany();

        // For each user, get the latest comment
        for (const user of users) {
            const latestComment = await AppDataSource.getRepository(Comment)
                .createQueryBuilder("comment")
                .where("comment.userId = :userId", { userId: user.id })
                .orderBy("comment.createdAt", "DESC")
                .getOne();
            user["latestComment"] = latestComment;
        }
        res.status(200).json({ message: "Top Users retrieved successfully", data: users });
    } catch (error) {
        console.log(error);
        res.status(500);
        throw new Error("Internal Server Error");
    }
});

export const getTopUsersWithLatestComments = asyncHandler( async (req: Request, res: Response) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const commentRepository = AppDataSource.getRepository(Comment);

        // Fetch the top 3 users with the most posts
        const topUsers = await userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.posts', 'post')
            .addSelect('COUNT(post.id)', 'post_count')
            .groupBy('user.id')
            .orderBy('post_count', 'DESC')
            .limit(3)
            .getMany();

        // Fetch the latest comment for each of the top users
        const topUsersWithComments = await Promise.all(
            topUsers.map(async (user) => {
                const latestComment = await commentRepository
                    .createQueryBuilder('comment')
                    .leftJoinAndSelect('comment.post', 'post')
                    .where('comment.userId = :userId', { userId: user.id })
                    .orderBy('comment.createdAt', 'DESC')
                    .getOne() as Comment;

                return {
                    userId: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    postTitle: latestComment?.post.title || null,
                    commentContent: latestComment?.content || null,
                    commentCreatedAt: latestComment?.createdAt || null,
                };
            })
        );

        res.status(200).json({ success: true, message: "Top Users retrieved successfully", data: topUsersWithComments });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});

export const getTopUsersWithLatestCommentsWithQuery = async (req: Request, res: Response) => {
    try {
        const entityManager = getManager();
        const result = await entityManager.query(`
        WITH TopUsers AS (
          SELECT users.id, users.name, COUNT(posts.id) AS post_count
          FROM users
          LEFT JOIN posts ON users.id = posts."userId"
          GROUP BY users.id
          ORDER BY post_count DESC
          LIMIT 3
        )
        SELECT TopUsers.id, TopUsers.name, posts.title, comments.content, comments."createdAt"
        FROM TopUsers
        LEFT JOIN posts ON TopUsers.id = posts."userId"
        LEFT JOIN comments ON posts.id = comments."postId"
        WHERE comments."createdAt" = (
          SELECT MAX(comments."createdAt")
          FROM comments
          WHERE comments."userId" = TopUsers.id
        )
        ORDER BY TopUsers.post_count DESC;
      `);

        res.status(200).json({ success: true, message: "Top Users", data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const getTopUsersWithLatestComments2 = async (req: Request, res: Response) => {
    try {
        const entityManager = getManager();
        const result = await entityManager.query(`
      WITH top_users AS (
        SELECT users.id, users.name, COUNT(posts.id) AS post_count
        FROM users
        LEFT JOIN posts ON users.id = posts."userId"
        GROUP BY users.id
        ORDER BY post_count DESC
        LIMIT 3
      )
      SELECT top_users.id, top_users.name, posts.title, comments.content, comments."createdAt"
      FROM top_users
      LEFT JOIN posts ON top_users.id = posts."userId"
      LEFT JOIN comments ON posts.id = comments."postId"
      WHERE comments."createdAt" = (
        SELECT MAX(c."createdAt")
        FROM comments c
        WHERE c."userId" = top_users.id
      )
      ORDER BY top_users.post_count DESC;
    `);

        return res.status(200).json({ success: true, message: "", data: result});
    } catch (error: any) {
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};



export const getTopUsersWithLatestComments3 = asyncHandler(async (req: Request, res: Response) => {
    try {
        const entityManager = getManager();
        const query = `SELECT users.id, users.name, posts.title, comments.content
                FROM users
                LEFT JOIN posts ON users.id = posts."userId"
                LEFT JOIN comments ON posts.id = comments."postId"
                LEFT JOIN (
                SELECT postId, MAX("createdAt") as latest_comment
                FROM comments
                GROUP BY postId
                ) latest_comments ON comments."postId" = latest_comments.postId AND comments."createdAt" = latest_comments.latest_comment
                GROUP BY users.id, posts.title, comments.content
                ORDER BY COUNT(posts.id) DESC
                LIMIT 3;`
        const result = await entityManager.query(query);
        res.status(200).json({ message: "Top Users fetched successfully", data: result });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
})



