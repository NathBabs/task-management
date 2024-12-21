import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ListTasksDto } from './dto/list-tasks.dto';
import { TasksGateway } from './tasks.gateway';
import { CouchbaseService } from '../database/couchbase.service';
import {
  ApiResponse,
  PaginatedApiResponse,
} from '../../common/types/api-response.type';
import { formatResponse } from '../../common/utils/response.util';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private readonly tasksGateway: TasksGateway,
    private readonly couchbaseService: CouchbaseService,
  ) {}

  /**
   * Creates a new task in the system.
   *
   * @param createTaskDto - The data transfer object containing the details of the new task.
   * @returns The newly created task.
   */
  async create(createTaskDto: CreateTaskDto): Promise<ApiResponse<Task>> {
    const task = new Task(createTaskDto);
    await this.couchbaseService.getCollection().insert(task.id, task);
    await this.tasksGateway.notifyTaskCreated(task);
    return formatResponse(task, 'Task created successfully');
  }

  /**
   * Retrieves a list of tasks based on the provided query parameters.
   *
   * @param query - An object containing the query parameters for filtering and paginating the tasks.
   * @param query.page - The page number to retrieve.
   * @param query.limit - The maximum number of tasks to return per page.
   * @param query.status - The status of the tasks to filter by.
   * @param query.search - The search term to filter tasks by title or description.
   * @returns An object containing the list of tasks and metadata about the pagination.
   */
  async findAll(query: ListTasksDto): Promise<PaginatedApiResponse<Task>> {
    try {
      // Set default values
      const page = query.page || 1;
      const limit = parseInt(query.limit?.toString() || '10', 10);
      const offset = (page - 1) * limit;

      const statement = `
      SELECT t.*
      FROM \`${this.couchbaseService.getBucketName()}\` t
      WHERE 1=1
      ${query.status ? `AND t.status = '${query.status}'` : ''}
      ${query.search ? `AND (t.title LIKE '%${query.search}%' OR t.description LIKE '%${query.search}%')` : ''}
      LIMIT ${limit} OFFSET ${offset}
    `;

      const countStatement = `
      SELECT COUNT(*) as total
      FROM \`${this.couchbaseService.getBucketName()}\` t
      WHERE 1=1
      ${query.status ? `AND t.status = '${query.status}'` : ''}
      ${query.search ? `AND (t.title LIKE '%${query.search}%' OR t.description LIKE '%${query.search}%')` : ''}
    `;

      const [result, countResult] = await Promise.all([
        this.couchbaseService.getCluster().query(statement),
        this.couchbaseService.getCluster().query(countStatement),
      ]);

      return formatResponse(
        {
          items: result.rows,
          meta: {
            total: countResult.rows[0].total,
            page: +query.page,
            limit: +query.limit,
            totalPages: Math.ceil(countResult.rows[0].total / query.limit),
          },
        },
        'Successfully listed tasks',
      );

      // return {
      //   message: "Successfully listed tasks",
      //   data: result.rows,
      //   meta: {
      //     total: countResult.rows[0].total,
      //     page: +query.page,
      //     limit: +query.limit,
      //     totalPages: Math.ceil(countResult.rows[0].total / query.limit),
      //   },
      // };
    } catch (error) {
      this.logger.error('Error fetching tasks:', JSON.stringify(error));
      throw new BadRequestException('Failed to fetch tasks', error);
    }
  }

  /**
   * Retrieves a single task by its ID.
   *
   * @param id - The ID of the task to retrieve.
   * @returns The task with the specified ID.
   * @throws NotFoundException - If the task with the specified ID is not found.
   */
  async findOne(id: string): Promise<ApiResponse<Task>> {
    try {
      const result = await this.couchbaseService.getCollection().get(id);
      return formatResponse(
        result.content as Task,
        'Task fetched successfully',
      );
    } catch (error) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  /**
   * Updates an existing task with the provided data.
   *
   * @param id - The ID of the task to update.
   * @param updateTaskDto - The data to update the task with.
   * @returns The updated task.
   */
  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<ApiResponse<Task>> {
    const task = (await this.findOne(id)).data;
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    const updatedTask = { ...task, ...updateTaskDto, updatedAt: new Date() };

    await this.couchbaseService.getCollection().replace(id, updatedTask);
    await this.tasksGateway.notifyTaskUpdated(updatedTask);
    return formatResponse(updatedTask, 'Task updated successfully');
  }

  /**
   * Deletes a task with the specified ID.
   *
   * @param id - The ID of the task to delete.
   * @returns A Promise that resolves when the task has been deleted.
   */
  async remove(id: string): Promise<void> {
    const task = (await this.findOne(id)).data;
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    await this.couchbaseService.getCollection().remove(id);
    await this.tasksGateway.notifyTaskDeleted(task);
  }
}
