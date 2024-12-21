# Task Management System

A scalable task management system built with NestJS, featuring real-time updates via WebSockets, Couchbase for data storage, and Redis for WebSocket scaling.

## Features

- ✨ Create, read, update and delete tasks
- 🔄 Real-time updates using WebSockets
- 🔍 Search functionality
- ⚡ Horizontally scalable architecture

<!-- - 📊 Task statistics and analytics
- 📝 Audit logging for all task changes -->



## Prerequisites

Before you begin, ensure you have installed:
- Docker and Docker Compose
- Node.js (v16 or later)
- Yarn package manager

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/yourusername/task-management-system.git
cd task-management-system
```

2. install dependencies:
```bash
yarn install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start infrastructure and initialize services:
```bash
yarn infra:start
```

5. Run the application
```bash
yarn start:dev
```

The API will be available at:

REST API: [http://localhost:8080/api/v1](http://localhost:8080/) <br>
Swagger Docs:[ http://localhost:8080/api/docs](http://localhost:8080/api/docs) <br  >
WebSocket:[ ws://localhost:8080/socket.io/?EIO=4&transport=websocket]( ws://localhost:8080/socket.io/?EIO=4&transport=websocket)


<!-- 4. Build and start services:
```bash
yarn docker:build
yarn docker:setup
``` -->

### Development Commands
```bash
# Start development server
yarn start:dev

# Run tests
yarn test

# View logs
yarn docker:logs

# Stop services
yarn docker:stop
```

### API Endpoints
Tasks
   - `GET /api/v1/tasks` - List all tasks (with pagination)
   - `POST /api/v1/tasks` - Create a new task
   - `GET /api/v1/tasks/:id` - Get task details
   - `PATCH /api/v1/tasks/:id` - Update a task
   - `DELETE /api/v1/tasks/:id` - Delete a task


### WebSocket Testing (via Postman)
  1. Connect to WebSocket:
     - Create new WebSocket Request
     - URL: ws://localhost:3000/socket.io/?EIO=4&transport=websocket
     - Click "Connect"

  2. Listen for Events: Click on the events tab and add the following events below and then toggle the "`Listen`" button beside each event:
     - `TASK_CREATED`: When a new task is created
     - `TASK_UPDATED`: When a task is modified
     - `TASK_DELETED`: When a task is removed

  3. Testing Flow:
     - Keep WebSocket connection open
     - Make REST API calls (create/update/delete tasks)
     - Watch real-time updates in the WebSocket Messages panel

### Project Structure
```
src/
├── modules/
│   ├── tasks/         # Task management
│   ├── database/      # Database services
│   └── redis/         # Redis services
├── common/            # Shared utilities
└── config/           # Configuration files
└── main.ts            # Application entry point
```

### Sample Screenshots
