# CyberSec Toolkit

This toolkit provides a collection of tools for cybersecurity analysis and research.

## Local Development

To run the application locally, you'll need to install the dependencies for both the frontend and backend.

### Frontend

1.  Navigate to the root directory.
2.  Install dependencies: `npm install`
3.  Run the development server: `npm run dev`

### Backend

1.  Navigate to the `backend` directory.
2.  Install dependencies: `pip install -r requirements.txt`
3.  Run the development server: `uvicorn main:app --reload`

## Docker

The application can be run using Docker and Docker Compose.

1.  Build the images: `docker-compose build`
2.  Start the services: `docker-compose up`

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:8000`.

## API Documentation

The OpenAPI documentation is available at `http://localhost:8000/docs`.