# Team Task Manager

A full-stack web application for teams to manage projects, assign and track tasks, and visualize progress, with role-based access control (Admin / Member).

Built with **React + Vite + Tailwind CSS** on the frontend and **Node.js + Express + MongoDB** on the backend. Deployable to **Railway** with **MongoDB Atlas**.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Folder structure](#folder-structure)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Running the app](#running-the-app)
- [API endpoints](#api-endpoints)
- [Deployment (Railway + MongoDB Atlas)](#deployment-railway--mongodb-atlas)
- [Screenshots](#screenshots)
- [Future improvements](#future-improvements)

---

## Features

### Authentication
- Email + password signup and login
- JWT-based authentication with persistent sessions via `localStorage`
- Passwords hashed with `bcryptjs`
- Auth state survives page refresh; expired tokens are auto-cleared

### Role-Based Access Control
- **Admin**: full control — create/manage projects, add/remove members, create/assign/edit/delete any task
- **Member**: view assigned projects and tasks, update status only on tasks assigned to them
- The first user to sign up is automatically bootstrapped as `admin`

### Project Management
- Create, edit, delete projects (admin only)
- Add/remove team members
- Live project progress computed from task completion percentage
- Search across projects

### Task Management
- Create, assign, edit, delete tasks (admin)
- Status: `Todo`, `In Progress`, `Completed`
- Priority: `Low`, `Medium`, `High`
- Due dates with overdue tracking
- Filter by status / priority, search by title
- Inline status updates (admin always; member only on assigned tasks)

### Dashboard
- Totals: tasks, completed, in progress, todo, overdue, projects
- Pie chart of status distribution
- Bar chart of priority distribution
- Recent activity feed

### UI / UX
- Clean modern responsive dashboard
- Sidebar + topbar navigation
- Cards, tables, modals, badges, form validation
- Toast notifications (`react-hot-toast`)
- Loading spinners and empty states

---

## Tech stack

**Frontend**
- React 18, Vite 5
- React Router v6
- Tailwind CSS
- Axios
- React Context API
- Recharts (charts)
- react-hot-toast

**Backend**
- Node.js (>=18), Express 4
- MongoDB with Mongoose 8
- JWT (`jsonwebtoken`)
- bcryptjs
- express-validator
- CORS, morgan, dotenv

**Deployment**
- Railway (one service per app: `backend` and `frontend`)
- MongoDB Atlas (managed MongoDB)

---

## Folder structure

```
project/
├── backend/
│   ├── config/
│   │   └── db.js                  # Mongoose connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect
│   │   ├── roleMiddleware.js      # authorize(...roles)
│   │   ├── validationMiddleware.js
│   │   └── errorMiddleware.js     # notFound + global handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   └── generateToken.js
│   ├── server.js                  # Express app entry
│   ├── package.json
│   ├── railway.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectDetail.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── NotFound.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── railway.json
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

## Local setup

### Prerequisites
- Node.js >= 18
- npm >= 9
- A MongoDB instance — either local (`mongodb://localhost:27017`) or a free MongoDB Atlas cluster

### 1. Clone & install

```bash
git clone <your-repo-url> team-task-manager
cd team-task-manager

# Backend
cd backend
cp .env.example .env       # fill in MONGO_URI, JWT_SECRET, etc.
npm install

# Frontend
cd ../frontend
cp .env.example .env       # set VITE_API_URL
npm install
```

### 2. MongoDB Atlas (recommended)
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. **Database Access** → create a user with read/write privileges
3. **Network Access** → allow your IP (or `0.0.0.0/0` for development)
4. **Connect** → "Drivers" → copy the connection string and paste it into `backend/.env` as `MONGO_URI` (replace `<password>` and the database name)

Example:
```
MONGO_URI=mongodb+srv://ttm_user:<password>@cluster0.xxxxx.mongodb.net/team-task-manager?retryWrites=true&w=majority
```

---

## Environment variables

### `backend/.env`
| Variable | Required | Example | Description |
|---|---|---|---|
| `PORT` | no | `5000` | API server port |
| `NODE_ENV` | no | `development` | Toggles logging and stack traces |
| `MONGO_URI` | **yes** | `mongodb+srv://...` | MongoDB connection string |
| `JWT_SECRET` | **yes** | random 32+ char string | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | no | `7d` | JWT lifetime |
| `CLIENT_URL` | no | `http://localhost:5173` | Comma-separated list of allowed CORS origins. Use `*` to allow all (dev only). |

### `frontend/.env`
| Variable | Required | Example | Description |
|---|---|---|---|
| `VITE_API_URL` | **yes** | `http://localhost:5000/api` | Base URL of the backend API |

---

## Running the app

In two terminals:

```bash
# Terminal 1 — backend
cd backend
npm run dev           # http://localhost:5000 (uses nodemon)

# Terminal 2 — frontend
cd frontend
npm run dev           # http://localhost:5173
```

Open http://localhost:5173 and create the first account — it will be granted admin automatically.

---

## API endpoints

All endpoints are prefixed with `/api` and (except where noted) require an `Authorization: Bearer <jwt>` header.

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | public | Register a new user. First user becomes `admin`. |
| POST | `/auth/login` | public | Login and receive `{ token, user }`. |
| GET | `/auth/me` | user | Get current user from JWT. |
| GET | `/auth/users` | admin | List all users (for member assignment). |

### Projects
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/projects?page=&limit=&search=` | user | List projects user has access to. Admins see all. |
| POST | `/projects` | admin | Create project. Body: `{ title, description, members[] }`. |
| GET | `/projects/:id` | user (member) | Project details + tasks + progress. |
| PUT | `/projects/:id` | admin | Update project. |
| DELETE | `/projects/:id` | admin | Delete project and its tasks. |

### Tasks
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/tasks?project=&status=&priority=&assignedTo=&search=&page=&limit=` | user | List tasks (scoped to accessible projects for members). |
| POST | `/tasks` | admin | Create task. Body includes `project`, optional `assignedTo`, `dueDate`, etc. |
| PUT | `/tasks/:id` | admin | Update task. |
| DELETE | `/tasks/:id` | admin | Delete task. |
| PATCH | `/tasks/:id/status` | user (assignee) or admin | Update only the status. Members can update only their assigned tasks. |

### Dashboard
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/dashboard/stats` | user | Totals + status/priority breakdowns + recent activity, scoped to accessible projects. |

### Health
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | public | Liveness check used by Railway. |

### Example: login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

Response:
```json
{
  "user": { "_id": "...", "name": "Admin", "email": "admin@example.com", "role": "admin", "createdAt": "..." },
  "token": "eyJhbGciOi..."
}
```

---

## Deployment (Railway + MongoDB Atlas)

The repo is structured so you can deploy backend and frontend as two Railway services pointing at the same GitHub repo (using a custom root for each).

### 1. Create the MongoDB Atlas cluster
Follow the steps under "MongoDB Atlas" above. Keep the connection string handy.

### 2. Push the repo to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 3. Deploy the backend
1. Go to https://railway.app → **New Project** → **Deploy from GitHub repo**.
2. After import, open the service → **Settings** → set **Root Directory** to `backend`.
3. **Variables** tab — add:
   - `MONGO_URI` → your Atlas connection string
   - `JWT_SECRET` → long random string (use a password manager)
   - `JWT_EXPIRES_IN` → `7d`
   - `NODE_ENV` → `production`
   - `CLIENT_URL` → the URL of the frontend service (you'll fill this in after step 4 — Railway lets you reference it as `${{frontend.RAILWAY_PUBLIC_DOMAIN}}`)
4. Generate a public domain under **Settings → Networking → Generate Domain**.
5. Railway auto-detects `railway.json` and runs `npm start`. Healthcheck hits `/api/health`.

### 4. Deploy the frontend
1. In the same project → **+ New** → **GitHub Repo** → select the same repo.
2. **Settings → Root Directory** → `frontend`.
3. **Variables** tab — add:
   - `VITE_API_URL` → `https://<your-backend-domain>/api`
4. Generate a public domain. Copy that domain back into the backend's `CLIENT_URL` variable.
5. Build command and start command come from `railway.json`:
   - Build: `npm install && npm run build`
   - Start: `npm run preview` (Vite's static preview server binds to `$PORT`)

### 5. Verify
- Open the frontend domain.
- Sign up — first account becomes admin.
- Create a project, add members, create tasks, and confirm the dashboard updates.

---

## Screenshots

> Replace these placeholders with real screenshots once the app is running.

| | |
|---|---|
| ![Dashboard](docs/screenshot-dashboard.png) | ![Projects](docs/screenshot-projects.png) |
| ![Project detail](docs/screenshot-project-detail.png) | ![Login](docs/screenshot-login.png) |

---

## Future improvements

- Real-time updates via WebSockets (Socket.IO) for task status changes
- File attachments per task (S3 / Cloudinary)
- Email notifications for task assignment and due-date reminders
- Comments and activity log per task
- Kanban board view (drag-and-drop)
- More granular roles (e.g., project-level admin vs. global admin)
- Password reset and email verification flows
- Server-side rate limiting and refresh tokens
- Unit + integration tests (Jest, Supertest, React Testing Library)
- CI/CD with GitHub Actions
- Audit log of admin actions

---

## License

MIT
