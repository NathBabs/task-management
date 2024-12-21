import { Global, Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';

@Global()
@Module({
  imports: [TasksModule],
  controllers: [],
  providers: [],
})
export class Modules {}
