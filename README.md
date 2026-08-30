# Lecturify

**Check your schedule without hustle.**

Official college update app — verified alerts from teachers and class reps only. No noise from random messages.

## Demo

```bash
npm install
npm run dev
```

Open http://localhost:5173

### Demo Credentials

| Role | Login | Password |
|------|-------|----------|
| Student | EN2021001 | student123 |
| Student (CR) | EN2021002 | student123 |
| Teacher | T001 | teacher123 |

### Features

- **Separate login** for students and teachers
- **Student enrollment** via enrollment number
- **Official updates only** — lecture cancellations, exams, schedule changes, holidays
- **Teacher posts** verified updates for their class
- **Class Representative (CR)** assigned by teacher — can post when teacher is unavailable
- **Filtered feed** — students see only their class updates, filterable by type

## Tech Stack

React + TypeScript + Vite, with localStorage for demo persistence.
