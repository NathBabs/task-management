import { Module } from '@nestjs/common';
import { Modules } from './modules/modules';
import { ConfigModule } from '@nestjs/config';
import couchbaseConfig from './config/couchbase.config';
import redisConfig from './config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [couchbaseConfig, redisConfig],
      isGlobal: true,
    }),
    Modules,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
