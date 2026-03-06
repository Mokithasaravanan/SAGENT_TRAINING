# EduPortal — College Admissions Frontend

A full React frontend for the College Admissions Spring Boot backend.

## Prerequisites

- Node.js 16+
- Spring Boot backend running on `http://localhost:8080`

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`.

## Backend CORS Configuration

Add this to your Spring Boot main class or a `@Configuration` class:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*");
    }
}
```

## Features

| Feature | Description |
|---|---|
| 🔐 Login / Register | Student and Officer roles |
| 📊 Dashboard | Live stats from backend |
| 👤 Students | CRUD with all fields |
| 🎓 Courses | Card view with details |
| 📋 Applications | Submit, track, review status |
| 📁 Documents | Upload records with type |
| 💳 Payments | Payment gateway records |
| 🏛️ Officers | Manage admission officers |

## API Base URL

Edit `src/services/api.js` to change the backend URL:

```js
const BASE_URL = 'http://localhost:8080/api';
```

## Project Structure

```
src/
├── context/AppContext.js    # Global state
├── services/api.js          # All API calls
├── components/
│   ├── Layout.js            # Sidebar + outlet
│   └── Notification.js      # Toast messages
└── pages/
    ├── LoginPage.js
    ├── Dashboard.js
    ├── StudentsPage.js
    ├── CoursesPage.js
    ├── ApplicationsPage.js
    ├── DocumentsPage.js
    ├── PaymentsPage.js
    └── OfficersPage.js
```
