#!/bin/bash

# Create docker network if it doesn't exist
docker network create task-network 2>/dev/null || true

# Start the services
docker-compose up -d

# Function to check if Couchbase Query service is ready
wait_for_query_service() {
    echo "⏳ Waiting for Couchbase Query service to be ready..."
    while ! curl -s http://localhost:8093/admin/ping > /dev/null; do
        sleep 5
    done
    echo "✅ Query service is ready"
}

# Wait for Couchbase to be ready
echo "🔄 Initializing Couchbase..."
sleep 20

# Initialize Couchbase (ignore if already initialized)
docker exec task-management-system-couchbase-1 couchbase-cli cluster-init \
    -c localhost \
    --cluster-username Administrator \
    --cluster-password password123 \
    --services data,index,query \
    --cluster-ramsize 512 || true

# Wait for Query service
wait_for_query_service

# Create tasks bucket (ignore if already exists)
echo "🪣 Creating tasks bucket..."
docker exec task-management-system-couchbase-1 couchbase-cli bucket-create \
    -c localhost \
    -u Administrator \
    -p password123 \
    --bucket tasks \
    --bucket-type couchbase \
    --bucket-ramsize 256 || true

# Wait for bucket to be ready
sleep 10

# Create primary index (wrapped in a conditional check)
echo "📑 Creating primary index..."
docker exec task-management-system-couchbase-1 cbq \
    -e "http://localhost:8093" \
    -u Administrator \
    -p password123 \
    -s "SELECT RAW name FROM system:indexes WHERE keyspace_id = 'tasks' AND name = '#primary'" | grep -q "#primary" || \
docker exec task-management-system-couchbase-1 cbq \
    -e "http://localhost:8093" \
    -u Administrator \
    -p password123 \
    -s "CREATE PRIMARY INDEX ON \`tasks\`"

echo "✨ Setup completed successfully!"
