import { registerAs } from '@nestjs/config';

export default registerAs('couchbase', () => ({
  host: process.env.COUCHBASE_HOST || 'localhost',
  username: process.env.COUCHBASE_USER || 'Administrator',
  password: process.env.COUCHBASE_PASSWORD || 'password123',
  bucketName: 'tasks',
}));
