import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private publisher: Redis;
  private subscriber: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('redis.host');
    const port = this.configService.get<number>('redis.port');

    this.logger.log(`Connecting to Redis at ${host}:${port}`);

    await this.initializeRedisConnections(host, port);
  }

  private async initializeRedisConnections(
    host: string,
    port: number,
  ): Promise<void> {
    const connectionPromise = (client: Redis) =>
      new Promise<void>((resolve, reject) => {
        client.on('connect', () => {
          this.logger.log('Redis client connected');
          resolve();
        });
        client.on('error', (err) => {
          this.logger.error('Redis connection error:', err);
          reject(err);
        });
      });

    this.publisher = new Redis({ host, port });
    this.subscriber = new Redis({ host, port });

    await Promise.all([
      connectionPromise(this.publisher),
      connectionPromise(this.subscriber),
    ]);
  }

  async onModuleDestroy() {
    await this.publisher?.quit();
    await this.subscriber?.quit();
    this.logger.log('Redis connections closed');
  }

  getPublisher(): Redis {
    if (!this.publisher) throw new Error('Redis publisher not initialized');
    return this.publisher;
  }

  getSubscriber(): Redis {
    if (!this.subscriber) throw new Error('Redis subscriber not initialized');
    return this.subscriber;
  }
}
