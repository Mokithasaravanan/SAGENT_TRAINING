# 🫀 MediWatch - Patient Monitoring System Frontend

A professional React.js frontend for the Patient Monitoring System with full CRUD functionality and real-time backend integration.

## 🚀 Features

- ✅ **Authentication** – Patient & Doctor login/register with show/hide password
- ✅ **Dashboard** – Real-time stats, vitals chart, quick actions
- ✅ **Patients** – Full CRUD with search, gender filter, age stats
- ✅ **Doctors** – Full CRUD with specialization cards and table view
- ✅ **Appointments** – Schedule/manage with status filters
- ✅ **Consultations** – Doctor consultations with fee tracking
- ✅ **Daily Readings** – Heart rate, BP, O₂, temperature with charts
- ✅ **Health Data** – Past medical records management
- ✅ **Messages** – Doctor-patient messaging with priority/read status
- ✅ **Reports** – Medical reports linked to health records
- ✅ **Previous/Next navigation** on every page

---

## 📋 Prerequisites

- **Node.js** v16+ (download from https://nodejs.org)
- **npm** v8+ (comes with Node.js)
- **Spring Boot backend** running on port **8081**

---

## ⚙️ CORS Configuration (Backend)

Add this to your Spring Boot backend (`WebConfig.java`):

```java
package com.example.patientmonitoring.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                    .allowedHeaders("*");
            }
        };
    }
}
```

---

## 📦 Installation & Setup

### Step 1: Install Node.js
Download and install from https://nodejs.org/en/download

### Step 2: Navigate to the project
```bash
cd patient-monitoring-frontend
```

### Step 3: Install dependencies
```bash
npm install
```

### Step 4: Start your Spring Boot backend
Make sure your backend is running on `http://localhost:8081`

### Step 5: Start the React app
```bash
npm start
```

The app will open at **http://localhost:3000**

---

## 📁 Project Structure

```
patient-monitoring-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js          # Navigation bar with all page links
│   │   └── PageNav.js         # Previous/Next page navigation
│   ├── context/
│   │   └── AuthContext.js     # Authentication state management
│   ├── pages/
│   │   ├── LoginPage.js       # Login with role selection
│   │   ├── RegisterPage.js    # Register as Patient or Doctor
│   │   ├── ForgotPasswordPage.js
│   │   ├── Dashboard.js       # Overview with charts
│   │   ├── PatientsPage.js    # Patient CRUD
│   │   ├── DoctorsPage.js     # Doctor CRUD
│   │   ├── AppointmentsPage.js
│   │   ├── ConsultationsPage.js
│   │   ├── DailyReadingsPage.js
│   │   ├── HealthDataPage.js
│   │   ├── MessagesPage.js
│   │   └── ReportsPage.js
│   ├── services/
│   │   └── api.js             # All API calls to backend
│   ├── App.js                 # Routes configuration
│   ├── index.js               # React entry point
│   └── index.css              # Global styles
└── package.json
```

---

## 🌐 API Endpoints Used

| Module | Endpoint |
|---|---|
| Patients | `GET/POST /api/patients`, `PUT/DELETE /api/patients/{id}` |
| Doctors | `GET/POST /api/doctors`, `PUT/DELETE /api/doctors/{id}` |
| Appointments | `GET/POST /api/appointments`, `PUT/DELETE /api/appointments/{id}` |
| Consultations | `GET/POST /api/consultations`, `PUT/DELETE /api/consultations/{id}` |
| Daily Readings | `GET/POST /api/readings`, `PUT/DELETE /api/readings/{id}` |
| Health Data | `GET/POST /api/health-data`, `PUT/DELETE /api/health-data/{id}` |
| Messages | `GET/POST /api/messages`, `PUT/DELETE /api/messages/{id}` |
| Reports | `GET/POST /api/reports`, `PUT/DELETE /api/reports/{id}` |

---

## 🔐 Login Instructions

1. First, **Register** a Patient or Doctor account
2. Go to **Login** page
3. Select role (Patient or Doctor)
4. Enter **email and password** you registered with
5. All data entered is saved to your **Spring Boot + MySQL database**

---

## 🏗️ Build for Production

```bash
npm run build
```

This creates an optimized build in the `build/` folder ready for deployment.

---

## 🚀 Deployment

### Option A: Netlify / Vercel
1. Run `npm run build`
2. Upload the `build/` folder to Netlify or Vercel
3. Set environment variable for backend URL if needed

### Option B: Apache/Nginx
1. Run `npm run build`
2. Copy `build/` contents to web server root
3. Configure server to redirect all routes to `index.html`

---

## 🛠️ Tech Stack

| Technology | Version |
|---|---|
| React | 18.2 |
| React Router | 6.20 |
| Axios | 1.6 |
| Recharts | 2.9 |
| React Toastify | 9.1 |
| React Icons | 4.12 |

---

## 💡 Notes

- All data entered in the frontend is **sent to and stored in your MySQL database** via the Spring Boot REST API
- Authentication uses **email + password lookup** from the database (no JWT - simple demo auth)
- For production, implement **JWT token-based auth** in the backend
- The app uses **localStorage** to persist login session across browser refreshes
