import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TasksGateway } from './tasks.gateway';
import { RedisService } from '../redis/redis.service';
import { CouchbaseService } from '../database/couchbase.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, TasksGateway, RedisService, CouchbaseService],
})
export class TasksModule {}
