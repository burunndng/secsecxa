# Toolkit Frontend

A responsive React frontend for the toolkit backend, built with Vite, TypeScript, and Tailwind CSS.

## Features

- 🔐 **JWT Authentication**: Login/register with secure token management and automatic refresh
- 📊 **Dashboard**: Browse available tools organized by category
- 🛠️ **Dynamic Forms**: Auto-generated forms from tool metadata with validation
- 📡 **Live Execution**: Real-time progress updates via Server-Sent Events (SSE)
- 📜 **Execution History**: View and filter past job executions per tool
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ♿ **Accessible**: Keyboard navigation and ARIA labels
- ✅ **Tested**: Component and integration tests with Vitest and React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure the API URL in .env
VITE_API_URL=http://localhost:8000/api
```

### Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui
```

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Form/          # Form input components
│   │   ├── Button.tsx
│   │   ├── ExecutionViewer.tsx
│   │   ├── ToolForm.tsx
│   │   └── ToolHistoryTable.tsx
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   ├── pages/             # Page components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── ToolDetailPage.tsx
│   ├── services/          # API service layer
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── tools.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── __tests__/         # Test files
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## API Integration

The frontend expects the following backend API endpoints:

### Authentication
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/register` - Register new user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Tools
- `GET /api/tools` - List all available tools
- `POST /api/tools/:toolId/jobs` - Submit a new job
- `GET /api/tools/:toolId/jobs` - Get job history for a tool
- `GET /api/tools/:toolId/jobs/:jobId/stream` - SSE stream for job progress

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `/api` |

## Technologies

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first styling
- **TanStack Query**: Server state management
- **Vitest**: Unit and integration testing
- **React Testing Library**: Component testing
- **clsx**: Conditional class names
