import { IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @IsNotEmpty({ message: 'User ID is required' })
  userId: number;
}
