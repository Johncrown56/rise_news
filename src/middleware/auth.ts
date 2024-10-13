import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import dataSource from "../config/db";
import { User } from "../entity";
import { isNotEmpty } from "../utils";

// Blacklist or revoked tokens array
const revokedTokens: string[] = [];

const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token: string;
    const auth = req.headers.authorization;

    if (auth && auth.startsWith("Bearer")) {
        token = auth.split(" ")[1];
        if (revokedTokens.includes(token)) {
            res.status(401);
            throw new Error("Your session has ended. Please log in again.");
        }
        const jwtToken = process.env.JWT_SECRET as string
        
        try {
            // Verify the token
            const decoded = jwt.verify(token, jwtToken);
            if (!isNotEmpty(decoded)) {
                res.status(401);
                throw new Error("Invalid session. Please log in again.");
            }
            // Get user id from the token and validate the user id from the DB 
            const decodedToken = decoded as JwtPayload;
            const userId = decodedToken["id"] as number;
            const userRepository = dataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id: userId } });
            
            if(!isNotEmpty(user)){
                res.status(401);
                throw new Error("User not found");
            }

            req["user"] = user;
            req["token"] = token;
            next();
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                res.status(401);
                throw new Error("Your session has expired. Please log in again.");
            } else {
                console.log({ error });
                res.status(500);
                throw new Error("An error occurred. Please try again later.");
            }
        }
    } else {
        res.status(401);
        throw new Error("Authentication token not provided.");
    }
});

const middleware = { protect, revokedTokens };

export default middleware;
