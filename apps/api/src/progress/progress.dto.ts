import { IsString, IsNumber, IsArray, IsBoolean, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AttemptDto {
  @ApiProperty() @IsString() exerciseId!: string;
  @ApiProperty() @IsBoolean() correct!: boolean;
  @ApiProperty() @IsDateString() answeredAt!: string;
}

export class SaveProgressDto {
  @ApiProperty() @IsString() childId!: string;
  @ApiProperty() @IsNumber() level!: number;
  @ApiProperty({ type: [AttemptDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => AttemptDto) attempts!: AttemptDto[];
  @ApiProperty() @IsNumber() coinsEarned!: number;
  @ApiProperty() @IsDateString() completedAt!: string;
}
