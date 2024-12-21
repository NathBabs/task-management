import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Complete project documentation' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: 'Write technical documentation for the API endpoints',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
