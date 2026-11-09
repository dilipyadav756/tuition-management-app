# tuition-management-app
A secure, multi-tenant tuition management platform built with React, Express.js, and PostgreSQL. Features isolated teacher workspaces, automated WhatsApp fee reminders, dynamic UPI QR payment ledgers, file/text resource sharing, and 6-digit student batch onboarding.



# 🎓 Tuition Management Portal

A multi-tenant tuition and coaching center management application built with **React**, **Express.js**, and **PostgreSQL/Prisma**. Designed to support independent tutors, multi-branch coaching institutes, and students through isolated data scoping, automated fee alerts, UPI payment ledgers, study resource sharing, and public admission microsites.

---

## 🚀 Key Features

### 👨‍🏫 Teacher Workspace
* **Isolated Data Boundaries:** Data scoping strictly enforced by `teacherId` to ensure total cross-account privacy.
* **Batch & Student Management:** Create batches, issue 6-digit student join codes, track roll numbers, and manage parent contact details.
* **Fee Collection & Dynamic UPI QR:** Track fee status (Paid, Pending, Overdue) and generate instant, print-ready PDF receipts with dynamic UPI payment QR codes.
* **1-Click WhatsApp Reminders:** Automated pre-filled WhatsApp action triggers for fee overdue notices and absence alerts.
* **Study Resources:** Direct text notes entry combined with system file uploads (PDF, DOCX, TXT, images, spreadsheets).
* **Public Admission Landing Pages:** Auto-generated microsites displaying subjects offered, contact details, and exam result highlights.

### 🎓 Student Workspace
* **Simple Access:** Request batch enrollment using a 6-digit join code provided by teachers.
* **Study Portal:** Download class notes, view batch announcements, and check assignment schedules.
* **Isolated View:** Zero access to administrative tools, parent phone directories, or teacher financial ledgers.

### 🛡️ Super-Admin Control Panel (App Owner)
* **Platform Metrics:** Real-time visibility into total registered teachers, enrolled students, active batches, and platform revenue.
* **Account Moderation:** Approve, verify, suspend, or issue credential resets for registered tuition centers.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 18, Tailwind CSS, Lucide Icons, HTML5 File API (Hosted on Vercel)
- **Backend:** Node.js, Express.js, Multer, JSON Web Tokens (JWT), bcrypt (Hosted on Render)
- **Database:** PostgreSQL with Prisma ORM (Hosted on Render)

---

## 📦 Project Directory Structure

```text
tuition-management-app/
├── client/                     # React Frontend Application
│   ├── src/
│   │   ├── components/         # Workspace, Admin & Auth Components
│   │   ├── types/              # TypeScript Interfaces
│   │   └── App.tsx             # Main Application Shell
│   ├── public/
│   └── package.json
│
├── server/                     # Express Backend API
│   ├── controllers/            # Auth, Student, Batch & Material Handlers
│   ├── middleware/             # JWT Verification & Role Guards
│   ├── prisma/                 # PostgreSQL Schema & Migrations
│   ├── uploads/                # Local System File Storage
│   ├── server.js               # API Server Entry Point
│   └── package.json
│
└── README.md
