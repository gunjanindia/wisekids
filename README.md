# 🌟 WiseKids Academy - Role-Based Learning Management Portal

WiseKids is a full-featured, role-based Online Learning Management Portal (LMS) built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **NextAuth.js**, and **Recharts**.

---

## 🚀 Live Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Admin@123` | Full root administrator control, user management, course approvals, live audit log, CMS editor, fee reports |
| **Teacher #1** | `sarah.math@wisekids.org` | `Teacher@123` | Math Olympiad Master Coach - course builder, assignments, quizzes, attendance, student roster, gradebook |
| **Teacher #2** | `david.science@wisekids.org` | `Teacher@123` | Science & Robotics Engineer - course builder, live classes, grading |
| **Teacher #3** | `elena.art@wisekids.org` | `Teacher@123` | Python Game Coding & Digital Art Specialist |
| **Student #1** | `student1@wisekids.org` | `Student@123` | Interactive student player, assignments, timed quizzes, report card, graduation certificates |
| **Student #2-#15** | `student2@wisekids.org` ... `student15@wisekids.org` | `Student@123` | Other active cohort students |

> 💡 **Tip:** On the `/login` page, you can click the **Instant Demo Login Buttons** (Admin, Teacher, Student) to test any role with a single click!

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js (App Router, Server Components & Server Actions)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom glassmorphism and animations
- **Database & ORM:** SQLite (development) / PostgreSQL (production) via **Prisma ORM**
- **Authentication:** **NextAuth.js** with Credentials Provider, bcryptjs password hashing, JWT sessions, and role RBAC claims
- **Security & Authorization:**
  - Route protection via `middleware.ts` for `/admin/*`, `/teacher/*`, `/student/*`
  - Server-side role checks with `requireAdmin()`, `requireTeacherOrAdmin()`, and `requireAuth()`
  - Real-time immutable **Security Audit Log** (`AuditLog` model) for role updates, deletes, and submissions
- **Data Visualizations:** **Recharts** (Enrollment Growth AreaChart, Track Distribution PieChart)
- **PDF Generation:** **jsPDF** for downloading official student report cards and verified landscape certificates

---

## 📂 Project Structure

```
wisekids/
├── prisma/
│   ├── schema.prisma       # Comprehensive Prisma models & relations
│   └── seed.ts             # Comprehensive database seed script
├── public/                 # Static assets & icons
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/      # Admin endpoints (users, courses, batches, enrollments, etc.)
│   │   │   ├── teacher/    # Teacher endpoints (courses, assignments, quizzes, attendance)
│   │   │   ├── student/    # Student endpoints (enroll, progress, submit, quiz)
│   │   │   ├── auth/       # NextAuth route handler & registration
│   │   │   ├── notifications/ # User notifications & mark-read
│   │   │   ├── search/     # Global search API
│   │   │   └── contact/    # Marketing contact inquiry endpoint
│   │   ├── admin/          # Admin Portal (/admin, /admin/users, /admin/courses, etc.)
│   │   ├── teacher/        # Teacher Portal (/teacher, /teacher/courses, etc.)
│   │   ├── student/        # Student Portal (/student, /student/catalog, /student/courses, etc.)
│   │   ├── courses/[id]/   # Public course detail view
│   │   ├── login/          # Role switcher & credentials login page
│   │   ├── register/       # Student signup & Instructor application
│   │   ├── layout.tsx      # Root layout with Theme & Session providers
│   │   └── page.tsx        # Public marketing academy landing page
│   ├── components/
│   │   ├── layout/         # Header, Footer, Sidebar, Navbar, Portal Shell
│   │   ├── providers/      # NextAuth Session, Dark/Light Theme, Toast Notifications
│   │   └── ui/             # Modals, badges, search dialog
│   ├── lib/
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── prisma.ts       # Prisma Client singleton
│   │   ├── rbac.ts         # Server-side authorization helpers
│   │   ├── audit.ts        # Audit logging service
│   │   └── utils.ts        # Formatting & className utilities
│   └── middleware.ts       # RBAC Route Protection Middleware
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🏃 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Generate Database & Seed
```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Production Deployment (Vercel + Neon / Supabase)

1. **Create PostgreSQL Database:**
   - Create a free database on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
   - In `prisma/schema.prisma`, update provider to `provider = "postgresql"`.
2. **Environment Variables on Vercel:**
   - Set `DATABASE_URL` to your PostgreSQL connection string.
   - Set `NEXTAUTH_URL` to your production domain (e.g. `https://your-domain.vercel.app`).
   - Set `NEXTAUTH_SECRET` to a secure 32-character string.
3. **Build Command on Vercel:**
   ```bash
   npx prisma generate && npx prisma db push && next build
   ```
