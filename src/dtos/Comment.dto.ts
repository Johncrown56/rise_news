import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @IsNotEmpty({ message: 'Post ID is required' })
  postId: number;

  // @IsNotEmpty({ message: 'User ID is required' })
  // userId: number;
}
