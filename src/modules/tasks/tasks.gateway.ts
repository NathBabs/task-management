import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Task } from './entities/task.entity';
import { RedisService } from '../redis/redis.service';
import { Logger } from '@nestjs/common';

const TASK_EVENTS = {
  CREATED: 'TASK_CREATED',
  UPDATED: 'TASK_UPDATED',
  DELETED: 'TASK_DELETED',
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TasksGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(TasksGateway.name);
  private readonly connectedClients: Set<Socket> = new Set();

  constructor(private readonly redisService: RedisService) {}

  /**
   * Initializes the WebSocket Gateway and establishes Redis subscriptions for task-related events.
   * This method is called after the gateway has been initialized.
   * It waits for the Redis service to be ready, subscribes to task creation, update, and deletion events,
   * and sets up a message listener to emit the events to connected clients.
   */
  async afterInit() {
    try {
      // Wait for Redis service to be ready
      await this.waitForRedisConnection();

      const subscriber = this.redisService.getSubscriber();

      await Promise.all([
        subscriber.subscribe(TASK_EVENTS.CREATED),
        subscriber.subscribe(TASK_EVENTS.UPDATED),
        subscriber.subscribe(TASK_EVENTS.DELETED),
      ]);

      this.logger.log(
        'WebSocket Gateway initialized and Redis subscriptions established',
      );

      subscriber.on('message', (channel, message) => {
        const task = JSON.parse(message);
        // Change this line to match the event names we're listening for
        this.server.emit(channel, task);
      });
    } catch (error) {
      this.logger.error('Failed to initialize WebSocket Gateway:', error);
      throw error;
    }
  }

  /**
   * Waits for the Redis connection to be established, retrying a specified number of times with a delay.
   * This method is used to ensure the Redis service is ready before attempting to subscribe to events.
   *
   * @param retries - The number of times to retry the connection (default is 5).
   * @param delay - The delay in milliseconds between each retry (default is 1000).
   * @throws {Error} If the Redis connection cannot be established after the specified number of retries.
   */
  private async waitForRedisConnection(
    retries = 5,
    delay = 1000,
  ): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        const subscriber = this.redisService.getSubscriber();
        if (subscriber) return;
      } catch (error) {
        this.logger.log(
          `Waiting for Redis connection... Attempt ${i + 1}/${retries}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error('Redis connection timeout');
  }

  /**
   * Handles the connection of a client to the WebSocket connection.
   * Adds the client to the `connectedClients` set and logs the connection.
   *
   * @param client - The `Socket` object representing the connected client.
   */
  handleConnection(client: Socket) {
    this.connectedClients.add(client);
    this.logger.log(
      `Client connected: ${client.id}. Total clients: ${this.connectedClients.size}`,
    );
  }

  /**
   * Handles the disconnection of a client from the WebSocket connection.
   * Removes the client from the `connectedClients` set and logs the disconnection.
   *
   * @param client - The `Socket` object representing the disconnected client.
   */
  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client);
    this.logger.log(
      `Client disconnected: ${client.id}. Total clients: ${this.connectedClients.size}`,
    );
  }

  /**
   * Publishes a message to the Redis channel for the 'TASK_EVENTS.CREATED' event, with the serialized task object.
   *
   * @param task - The task object to be published.
   */
  async notifyTaskCreated(task: Task) {
    await this.redisService
      .getPublisher()
      .publish(TASK_EVENTS.CREATED, JSON.stringify(task));
  }

  /**
   * Publishes a message to the Redis channel for the 'TASK_EVENTS.UPDATED' event, with the serialized task object.
   *
   * @param task - The task object to be published.
   */
  async notifyTaskUpdated(task: Task) {
    await this.redisService
      .getPublisher()
      .publish(TASK_EVENTS.UPDATED, JSON.stringify(task));
  }

  /**
   * Publishes a message to the Redis channel for the 'TASK_EVENTS.DELETED' event, with the serialized task object.
   *
   * @param task - The task object to be published.
   */
  async notifyTaskDeleted(task: Task) {
    await this.redisService
      .getPublisher()
      .publish(TASK_EVENTS.DELETED, JSON.stringify(task));
  }
}
