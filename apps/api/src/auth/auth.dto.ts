import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AvatarType } from '@calculator/types';

export class RegisterParentDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @MinLength(8) password!: string;
}

export class ParentLoginDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() password!: string;
}

export class ChildLoginDto {
  @ApiProperty() @IsString() childId!: string;
  @ApiProperty() @IsString() @MinLength(4) pin!: string;
}

export class CreateChildDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty({ enum: AvatarType }) @IsEnum(AvatarType) avatar!: AvatarType;
  @ApiProperty() @IsString() @MinLength(4) pin!: string;
}
