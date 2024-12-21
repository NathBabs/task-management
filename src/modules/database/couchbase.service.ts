import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Cluster, Bucket, Collection } from 'couchbase';

@Injectable()
export class CouchbaseService implements OnModuleInit {
  private cluster: Cluster;
  private bucket: Bucket;
  private collection: Collection;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('couchbase.bucketName');
  }

  async onModuleInit() {
    const host = this.configService.get<string>('couchbase.host');
    const username = this.configService.get<string>('couchbase.username');
    const password = this.configService.get<string>('couchbase.password');

    // Connect to Couchbase
    this.cluster = await connect(`couchbase://${host}`, {
      username,
      password,
    });

    // Open the bucket
    this.bucket = this.cluster.bucket(this.bucketName);
    // Get the default collection
    this.collection = this.bucket.defaultCollection();
  }

  /**
   * Returns the default Couchbase collection.
   * @returns {Collection} The default Couchbase collection.
   */
  getCollection(): Collection {
    return this.collection;
  }

  /**
   * Returns the Couchbase cluster instance.
   * @returns {Cluster} The Couchbase cluster instance.
   */
  getCluster(): Cluster {
    return this.cluster;
  }

  /**
   * Returns the name of the Couchbase bucket.
   * @returns {string} The name of the Couchbase bucket.
   */
  getBucketName(): string {
    return this.bucketName;
  }
}
