import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Updated task title' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated task description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
