import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '../entities/task.entity';

export class ListTasksDto {
  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    default: 10,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit: number = 10;

  @ApiPropertyOptional({
    enum: TaskStatus,
    description: 'Task status',
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Search string',
  })
  @IsString({
    message: 'search must be a string',
  })
  @IsOptional()
  search?: string;
}
