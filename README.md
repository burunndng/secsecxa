# Toolkit Application

A full-stack toolkit application featuring a responsive React frontend designed to interface with a backend API for tool execution and management.

## Overview

This project provides a comprehensive frontend interface for managing and executing various tools through a centralized dashboard. It features JWT-based authentication, real-time execution monitoring via Server-Sent Events (SSE), dynamic form generation from tool metadata, and a responsive design that works across desktop and mobile devices.

## Features

### Frontend
- 🔐 **JWT Authentication** with automatic token refresh
- 📊 **Dashboard** with tools organized by category
- 🛠️ **Dynamic Forms** auto-generated from tool metadata
- 📡 **Live Execution Monitoring** via SSE streams
- 📜 **Execution History** with filtering capabilities
- 📱 **Responsive Design** supporting desktop and mobile
- ♿ **Accessibility** with keyboard navigation and ARIA labels
- ✅ **Testing** with Vitest and React Testing Library

## Project Structure

```
.
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── contexts/      # React contexts
│   │   ├── types/         # TypeScript types
│   │   └── __tests__/     # Test files
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── package.json           # Root package configuration
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies for frontend
npm install

# Navigate to frontend and configure environment
cd frontend
cp .env.example .env
# Edit .env to set VITE_API_URL to your backend URL
```

### Development

```bash
# Start frontend development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Building

```bash
# Build frontend for production
npm run build
```

### Testing

```bash
# Run frontend tests
npm run test
```

## API Requirements

The frontend expects a backend API with the following endpoints:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Tool Endpoints
- `GET /api/tools` - List all tools with metadata
- `POST /api/tools/:toolId/jobs` - Submit a job
- `GET /api/tools/:toolId/jobs` - Get job history
- `GET /api/tools/:toolId/jobs/:jobId/stream` - SSE stream for job progress

## Tool Metadata Format

Tools should return metadata in the following format:

```json
{
  "id": "tool-id",
  "name": "Tool Name",
  "description": "Tool description",
  "category": "Category Name",
  "icon": "🛠️",
  "parameters": [
    {
      "name": "parameterName",
      "label": "Parameter Label",
      "type": "string | number | boolean | select | text | file",
      "required": true,
      "description": "Parameter description",
      "default": "default value",
      "options": ["option1", "option2"],
      "validation": {
        "min": 1,
        "max": 100,
        "pattern": "regex pattern",
        "message": "Error message"
      }
    }
  ]
}
```

## SSE Stream Format

The execution stream should emit events in the following format:

```json
{
  "type": "log | stdout | stderr | progress | complete | error",
  "message": "Event message",
  "data": {},
  "progress": 50,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Technologies

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- TanStack Query
- Vitest
- React Testing Library

## License

MIT
