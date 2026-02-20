# TaskMaster Pro

"Streamline your workflow, boost productivity, and achieve your goals with ease."

TaskMaster Pro is a full-stack web application designed to help users efficiently manage their tasks. It features robust user authentication, a personalized dashboard, and CRUD operations for tasks, all built with a modern, responsive design.

## Features

-   **User Authentication**: Secure login and signup with JWT.
-   **Personalized Dashboard**: A central place to view and manage all your tasks.
-   **Task Management**: Create, view, edit, mark as complete, and delete tasks.
-   **Profile Management**: Update your personal information and change your password.
-   **Application Settings**: Manage preferences and security options.
-   **Responsive Design**: Optimized for seamless use across desktop, tablet, and mobile devices.
-   **RESTful API**: A clean and well-structured API for interaction with the backend.

## Tech Stack

**Frontend:**
-   HTML5 (Semantic Markup)
-   CSS3 (Flexbox, Grid, CSS Variables, Mobile-first Responsive Design)
-   Vanilla JavaScript (API calls, DOM manipulation, Client-side Validation)
-   Font Awesome (Icons)

**Backend:**
-   Node.js (Runtime Environment)
-   Express.js (Web Framework)
-   MongoDB (NoSQL Database)
-   Mongoose (ODM for MongoDB)
-   JWT (JSON Web Tokens for Authentication)
-   Bcrypt.js (Password Hashing)
-   Joi (Request Validation)
-   Dotenv (Environment Variables)
-   CORS, Helmet (Security Middleware)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   Node.js (LTS version recommended)
-   MongoDB Atlas account or local MongoDB instance

### Installation

1.  **Clone the repository:**

2.  **Backend Setup:**
    Navigate into the `backend` directory:
    Install dependencies:
    Create a `.env` file in the `backend` directory by copying `.env.example` and filling in your details:
    Replace `<your_username>`, `<your_password>`, and `<your_cluster_url>` with your MongoDB Atlas credentials. The `JWT_SECRET` should be a long, random string.

    Start the backend server:
    The backend should be running on `http://localhost:5000`.

3.  **Frontend Setup:**
    The frontend is static HTML, CSS, and JavaScript. You can open the `public/index.html` file directly in your browser or serve it using a simple static file server (e.g., `serve` npm package or `lite-server`).
    For development, ensure your browser is configured to allow requests to `http://localhost:5000` (CORS is handled by the backend, but some browsers might have strict local file restrictions).

    A simple way to serve the frontend for testing:
    From the root project directory:
    Then open your browser to `http://localhost:3000`.

## API Endpoints

All API endpoints are prefixed with `/api`.

### Authentication (`/api/auth`)

-   `POST /api/auth/signup`
    -   **Description**: Register a new user.
    -   **Request Body**: `{ "email": "string", "password": "string" }`
    -   **Response**: `{ "success": true, "message": "...", "data": { "token": "string" } }`
-   `POST /api/auth/login`
    -   **Description**: Authenticate a user and get a JWT token.
    -   **Request Body**: `{ "email": "string", "password": "string" }`
    -   **Response**: `{ "success": true, "message": "...", "data": { "token": "string" } }`
-   `GET /api/auth/me` (Protected)
    -   **Description**: Get the authenticated user's profile data (excluding password).
    -   **Headers**: `Authorization: Bearer <token>`
    -   **Response**: `{ "success": true, "data": { "email": "...", "name": "...", "_id": "..." } }`

### User Management (`/api/users`)

-   `PUT /api/users/profile` (Protected)
    -   **Description**: Update the authenticated user's profile information.
    -   **Headers**: `Authorization: Bearer <token>`
    -   **Request Body**: `{ "name": "string", "bio": "string" }` (fields are optional)
    -   **Response**: `{ "success": true, "message": "...", "data": { ...updatedUser } }`
-   `PUT /api/users/change-password` (Protected)
    -   **Description**: Change the authenticated user's password.
    -   **Headers**: `Authorization: Bearer <token>`
    -   **Request Body**: `{ "currentPassword": "string", "newPassword": "string" }`
    -   **Response**: `{ "success": true, "message": "..." }`
-   `DELETE /api/users/delete-account` (Protected)
    -   **Description**: Permanently delete the authenticated user's account and all associated tasks.
    -   **Headers**: `Authorization: Bearer <token>`
    -   **Response**: `{ "success": true, "message": "..." }`

### Task Management (`/api/users/tasks`)

-   `POST /api/users/tasks` (Protected)
    -   **Description**: Create a new task for the authenticated user.
    -   **Headers**: `Authorization: Bearer <token>`
    -   **Request Body**: `{ "title": "string", "description": "string (optional)", "dueDate": "Date (optional)", "priority": "low|medium|high (optional)" }`
    -   **Response**: `{ "success": true, "message": "...", "data": { ...newTask } }`
-   `GET /api/users/tasks` (Protected)
    -   **Description**: Get all tasks belonging to the authenticated user.
    -   **Headers**: `Authorization: Bearer <token>`
    -   **Response**: `{ "success": true, "data": [{ ...task1 }, { ...task2 }] }`
-   `GET /api/users/tasks/:id` (Protected)
    -   **Description**: Get a specific task by its ID for the authenticated user.
    -   **Headers**: `Authorization: Bearer <token>`
    -   **Response**: `{ "success": true, "data": { ...task } }`
-   `PUT /api/users/tasks/:id` (Protected)
    -   **Description**: Update a specific task by its ID for the authenticated user.
    -   **Headers**: `Authorization: Bearer <token>`
    -   **Request Body**: `{ "title": "string (optional)", "description": "string (optional)", "dueDate": "Date (optional)", "priority": "low|medium|high (optional)", "completed": "boolean (optional)" }`
    -   **Response**: `{ "success": true, "message": "...", "data": { ...updatedTask } }`
-   `DELETE /api/users/tasks/:id` (Protected)
    -   **Description**: Delete a specific task by its ID for the authenticated user.
    -   **Headers**: `Authorization: Bearer <token>`
    -   **Response**: `{ "success": true, "message": "..." }`

## Project Structure


## Conceptual Database Schema (for MongoDB)

While MongoDB is schemaless, Mongoose defines schemas for data consistency.
The `backend/models/User.js` file contains the actual schema definitions.

**User Collection:**
-   `_id`: ObjectId (Primary Key)
-   `name`: String, required, min 3, max 50
-   `email`: String, required, unique, lowercase, trimmed (Indexed)
-   `password`: String, required, min 6 (Hashed)
-   `bio`: String, max 200, default ''
-   `avatar`: String (URL), default placeholder
-   `createdAt`: Date (Timestamp)
-   `updatedAt`: Date (Timestamp)

**Task Collection:**
-   `_id`: ObjectId (Primary Key)
-   `user`: ObjectId, required (Foreign Key referencing User) (Indexed)
-   `title`: String, required, min 3, max 100
-   `description`: String, max 500, optional
-   `dueDate`: Date, optional
-   `priority`: Enum ['low', 'medium', 'high'], default 'medium'
-   `completed`: Boolean, default false
-   `createdAt`: Date (Timestamp)
-   `updatedAt`: Date (Timestamp)