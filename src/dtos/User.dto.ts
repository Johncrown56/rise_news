import { IsEmail, IsNotEmpty, Length, IsString, MinLength, Matches} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'First Name is required' })
  @Length(3, 50, { message: 'First Name must be between 3 and 50 characters' })
  firstName: string;

  @IsNotEmpty({ message: 'Last Name is required' })
  @Length(3, 50, { message: 'Last Name must be between 3 and 50 characters' })
  lastName: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()._]).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  password: string;
}

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNotEmpty()
  @IsString({ message: 'Password must be a string' })
  password: string;
}
