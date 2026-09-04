# Lecturify — Project Documentation

## Project Name

**Lecturify** — *Check your schedule without hustle.*

Official college update and management platform for students, faculty, and directors. Verified alerts from teachers and class representatives only — no noise from random messages.

---

## Problem

Colleges and students face several everyday challenges:

1. **Scattered communication** — Lecture cancellations, exam schedules, holidays, and class updates are often shared through WhatsApp groups, notice boards, or word of mouth. Important information gets buried in chat noise or missed entirely.

2. **No single source of truth** — Students cannot easily tell which messages are official versus informal. Teachers and class reps have no dedicated channel to post verified updates for their class.

3. **Manual academic administration** — Directors and faculty lack a simple digital way to manage departments, courses, sections, student rosters, and faculty assignments in one place.

4. **Attendance tracking friction** — Marking attendance on paper or ad-hoc spreadsheets is slow, error-prone, and hard to review later — especially when Theory and Lab sessions need separate records on the same day.

5. **Role confusion** — Students, faculty, directors, and class representatives (CRs) need different tools and permissions, but most informal solutions treat everyone the same.

---

## Solution

**Lecturify** is a role-based college platform that centralizes official updates, academic setup, student directory, and faculty attendance in one web application.

### What Lecturify provides

| Area | Solution |
|------|----------|
| **Verified updates** | Teachers and CRs post official class updates (cancellations, exams, schedules, holidays). Students see a filtered feed for their class only. |
| **Role-based access** | Separate portals for **Student**, **Faculty**, and **Director** with appropriate dashboards and permissions. |
| **Director administration** | Academic setup (departments, programs, sections), student directory with expandable profiles, faculty ID management, and campus-wide alerts. |
| **Faculty tools** | Post updates, manage students, assign subject teachers, manage CRs, and maintain attendance sheets. |
| **Attendance sheets** | Digital present/absent marking per class, subject, date, and session type (**Theory** / **Lab**). Sheets can be saved as draft, locked when complete, and reviewed from history. Multiple sheets per day are supported. |
| **Pre-loaded demo** | Ready-to-use demo data — director account, faculty, 10 students (including CR Neha), and Robotics & AI class — so reviewers can explore without manual setup. |
| **Persistent demo storage** | Data persists in the browser via `localStorage` for a realistic demo experience without a backend server. |

### Tech stack

- **Frontend:** React 19, TypeScript, Vite
- **Routing:** React Router
- **Persistence:** localStorage (demo) + sessionStorage (auth session)

---

## Demo Video

Watch the full walkthrough of Lecturify on Loom:

**[Lecturify Demo Video](https://www.loom.com/share/1d6477ebb9e24c2f9e8108ede935783c)**

Direct link: https://www.loom.com/share/1d6477ebb9e24c2f9e8108ede935783c

---

## Presentation (How It Works)

We created a PowerPoint presentation to explain how Lecturify works — the problem, solution, user flows, and feature overview for students, faculty, and directors.

**[Download Lecturify Presentation (PPTX)](docs/lecturify-presentation.pptx)**

On GitHub: [docs/lecturify-presentation.pptx](https://github.com/avnihere-py/lecturify/blob/main/docs/lecturify-presentation.pptx)

Use this deck alongside the demo video when presenting or sharing the project with others.

---

## Hackathon Submission (PDF)

A single-page hackathon brief with all links, problem, solution, demo credentials, features, and quick-start instructions — ready to share with judges.

**[Download Hackathon Submission PDF](docs/Lecturify-Hackathon-Submission.pdf)**

On GitHub: [docs/Lecturify-Hackathon-Submission.pdf](https://github.com/avnihere-py/lecturify/blob/main/docs/Lecturify-Hackathon-Submission.pdf)

To regenerate after edits: `npm run pdf:hackathon`

---

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

To build for production:

```bash
npm run build
```

---

## Demo Credentials

| Role | Login | Password |
|------|-------|----------|
| Director | D001 | director123 |
| Faculty | T001 | teacher123 |
| Faculty | T003 | teacher123 |
| Student (CR — Neha) | 04801242026 | student480 |
| Student (Priya) | 05801242026 | student580 |

**Note:** Student passwords follow the pattern `student` + digits 2–4 of the enrollment number (e.g. `04801242026` → `student480`).

---

## Key Features by Role

### Student
- View official class updates and campus alerts
- Filter updates by type
- Class chat and profile management
- CR tools when assigned as Class Representative

### Faculty
- Post verified updates for assigned classes
- Digital attendance (Theory / Lab) with lock and history
- Student roster and profile view
- Add subject teachers and manage CR assignment

### Director
- Campus-wide alerts
- Academic structure setup (departments, programs, sections)
- Student directory with filters (department, course, section)
- Faculty ID overview

---

## Repository

Public repository: **https://github.com/avnihere-py/lecturify**

---

## Tagline

> Official college updates — verified alerts only. No hustle, no noise.
