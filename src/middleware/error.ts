import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log the error stack for debugging
   res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}, // Only send error details in development
    reason: process.env.NODE_ENV === 'development' ? err.stack : null
  });
};
