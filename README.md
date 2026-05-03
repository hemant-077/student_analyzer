# Student Performance Analyzer

A full-stack React and Node.js app for tracking student marks, attendance, grades, class averages, and at-risk students.

## Run locally

```bash
npm install
npm run dev
```

The React app runs at `http://127.0.0.1:5173` and the API runs at `http://127.0.0.1:5001`.

You can also start both frontend and backend with:

```bash
npm start
```

## MongoDB

The backend stores students in MongoDB. By default it connects to:

```bash
mongodb://127.0.0.1:27017/student_performance_analyzer
```

To use another MongoDB connection string, copy `server/.env.example` to `server/.env` and update it:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/student_performance_analyzer
```

## Features

- Dashboard cards for class average, attendance, total students, and at-risk count
- Subject-wise and class-wise performance analytics
- Search and filter by student, class, and status
- Add new student records with marks and attendance
- Delete student records
- Express API with validation and derived performance metrics
# student_analyzer
