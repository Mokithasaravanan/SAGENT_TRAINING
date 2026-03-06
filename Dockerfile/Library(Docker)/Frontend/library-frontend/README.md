# Library Management System - Frontend

A React frontend for the Library Management System Spring Boot backend.

## Setup & Run

### Prerequisites
- Node.js 16+
- Backend running on `http://localhost:8080`

### Install & Start
```bash
npm install
npm start
```

The app opens at `http://localhost:3000`

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Sign in with email & password |
| Register | `/register` | New member registration (gets a Library ID) |
| Dashboard | `/` | Stats overview + recent activity |
| Books | `/books` | Add, edit, delete, search books |
| Borrowing | `/borrow` | Issue books, return books, filter by status |
| Members | `/members` | View and add library members |

## How Login Works
Login checks credentials against `/api/members`. The email and password must match a registered member in your database.

## Backend API Required
Make sure your Spring Boot backend is running. The API base URL is configured in `src/services/api.js`:
```js
const API_BASE = 'http://localhost:8080/api';
```
Change this if your backend runs on a different port.

## Project Structure
```
src/
  pages/          # LoginPage, RegisterPage, DashboardPage, BooksPage, BorrowPage, MembersPage
  components/     # Navbar
  context/        # AuthContext (login state)
  services/       # api.js (all API calls)
  App.js          # Routes
  index.css       # Global styles
```
