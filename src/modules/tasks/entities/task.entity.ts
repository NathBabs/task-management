import { v4 as uuidv4 } from 'uuid';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

export class Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Task>) {
    this.id = uuidv4();
    this.status = TaskStatus.PENDING;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    Object.assign(this, partial);
  }
}
