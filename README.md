# Task Management System Frontend

A modern and responsive **Task Management System Frontend** built with **Vite + React**. This application provides a clean and intuitive interface for managing tasks efficiently with authentication, task tracking, status management, and dashboard insights.

Designed to integrate seamlessly with the Spring Boot backend API.

---

## Live Demo

Add your deployed frontend URL here:

```text
https://your-netlify-app.netlify.app
```

---

## Backend Repository

Spring Boot Backend API:

```text
https://github.com/M-Sufyan003/task-management-system-backend
```

---

## Features

### Authentication

* User Registration
* User Login
* JWT-based Authentication
* Protected Routes
* Persistent Sessions

### Task Management

* Create Tasks
* View All Tasks
* Update Existing Tasks
* Delete Tasks
* Change Task Status

### Task Status Workflow

* Pending
* In Progress
* Completed

### Dashboard

* Total Tasks Count
* Completed Tasks Count
* Pending Tasks Count
* Quick Overview

### UI / UX

* Responsive Design
* Clean Layout
* Fast Performance
* Reusable Components
* Smooth Navigation

---

## Tech Stack

### Frontend

* React.js
* Vite
* JavaScript (ES6+)
* React Router DOM
* CSS3 / Bootstrap
* Axios / Fetch API

### Backend

* Java Spring Boot
* Spring Security
* JWT Authentication
* MySQL Database

---

## Project Structure

```text
src/
├── assets/
├── components/
├── pages/
├── services/
├── routes/
├── App.jsx
└── main.jsx
```

---

## Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/M-Sufyan003/task-management-system-frontend.git
cd task-management-system-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8080/api
```

For production:

```env
VITE_API_URL=https://your-backend-url.com/api
```

---

## Run Locally

```bash
npm run dev
```

Application will run at:

```text
http://localhost:5173
```

---

## Build for Production

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## Netlify Deployment

### Build Settings

```text
Build Command: npm run build
Publish Directory: dist
```

### Environment Variable

```env
VITE_API_URL=https://your-backend-url.com/api
```

### Steps

1. Push project to GitHub
2. Connect repository to Netlify
3. Add environment variables
4. Deploy site

---

## API Endpoints Used

```text
POST   /auth/signup
POST   /auth/login
GET    /tasks
POST   /tasks
PUT    /tasks/{id}
DELETE /tasks/{id}
```

---

## Security Features

* JWT Token Authentication
* Route Protection
* Unauthorized Access Handling
* Logout Functionality

---

## Future Enhancements

* Dark Mode
* Task Search
* Status Filters
* Priority Levels
* Due Dates
* Notifications
* Team Collaboration

---

## Author

**Muhammad Sufyan**

GitHub:
[https://github.com/M-Sufyan003](https://github.com/M-Sufyan003)

---

## License

This project is open-source and available for learning, portfolio, and educational purposes.

---

## Support

If you found this project helpful, consider giving it a ⭐ on GitHub.
