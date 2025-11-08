# VITAP EventOpia

## Project Overview

This is a full-stack web application for managing college events at VIT-AP. It features a React frontend and a Node.js backend that connects to a Microsoft SQL Server database. The application provides role-based access control for different user types, including visitors, club members, faculty, and administrators.

**Frontend:**

*   **Framework:** React (with Vite)
*   **Styling:** CSS (with some dummy data for Tailwind CSS)
*   **Routing:** React Router
*   **Key Components:**
    *   `App.jsx`: Main component that manages user authentication and routing.
    *   `LoginModal.jsx`: Handles user login.
    *   `AccessRoleDashboard.jsx`: Allows users with multiple roles to select their desired dashboard.
    *   `VisitorPage.jsx`, `AdminPage.jsx`, `FacultyPage.jsx`, `HeadPage.jsx`: Dashboards for different user roles.

**Backend:**

*   **Framework:** Node.js with Express
*   **Database:** Microsoft SQL Server
*   **Authentication:** JSON Web Tokens (JWT)
*   **Key Features:**
    *   RESTful API for managing events, users, and clubs.
    *   Secure authentication and authorization.
    *   Database connection pooling for efficient database access.

## Building and Running

### Frontend

To run the frontend, navigate to the `Frontend` directory and run the following commands:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Backend

To run the backend, navigate to the `backend` directory and run the following commands:

```bash
# Install dependencies
npm install

# Start the server
npm run start
```

The backend will be available at `http://localhost:3000`.

**Database Setup:**

The backend requires a connection to a Microsoft SQL Server database. The database connection details are configured in the `.env` file in the `backend` directory.

To create the necessary tables in the database, run the following command in the `backend` directory:

```bash
npm run setup
```

## Development Conventions

*   The project is split into two separate directories: `Frontend` and `backend`.
*   The frontend and backend have their own `package.json` files and dependencies.
*   The backend uses environment variables to store sensitive information, such as database credentials.
*   The frontend uses a combination of real data from the backend and dummy data for development.
*   The backend API is versioned (v1.0).
*   The project uses role-based access control to restrict access to certain features.
*   The backend includes a graceful shutdown mechanism to close the database connection when the server is stopped.
