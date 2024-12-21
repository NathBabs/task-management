import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function setup() {
  console.log('🚀 Starting infrastructure setup...');

  try {
    // Wait for Couchbase to be ready
    await new Promise(resolve => setTimeout(resolve, 20000));

    // Initialize Couchbase
    await execAsync(`docker exec task-management-system-couchbase-1 couchbase-cli cluster-init \
      -c localhost \
      --cluster-username Administrator \
      --cluster-password password123 \
      --services data,index,query \
      --cluster-ramsize 512`);

    // Create bucket
    await execAsync(`docker exec task-management-system-couchbase-1 couchbase-cli bucket-create \
      -c localhost \
      -u Administrator \
      -p password123 \
      --bucket tasks \
      --bucket-type couchbase \
      --bucket-ramsize 256`);

    // Create primary index
    await execAsync(`docker exec task-management-system-couchbase-1 cbq \
      -e "http://localhost:8093" \
      -u Administrator \
      -p password123 \
      -s "CREATE PRIMARY INDEX ON \\\`tasks\\\` IF NOT EXISTS"`);

    console.log('✨ Setup completed successfully!');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setup();
