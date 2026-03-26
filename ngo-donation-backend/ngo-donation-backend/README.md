# NGO Donation Management — Backend

Spring Boot 3.x REST API for managing NGO donations, campaigns, volunteers, and admin operations.

---

## Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Language     | Java 17                           |
| Framework    | Spring Boot 3.2                   |
| ORM          | Spring Data JPA / Hibernate       |
| Database     | MySQL 8                           |
| Security     | Spring Security + JWT (JJWT 0.11) |
| Build        | Maven 4                           |

---

## Quick Start

### 1. Create MySQL Database
```sql
CREATE DATABASE ngo_donation_db;
```

### 2. Configure credentials
Edit `src/main/resources/application.properties` if your credentials differ:
```
spring.datasource.username=root
spring.datasource.password=moki@amma123
```

### 3. Run in IntelliJ IDEA
- Open the project folder (`ngo-donation-backend`) in IntelliJ
- Wait for Maven to download dependencies
- Run `DonationApplication.java`
- Server starts on **http://localhost:8080**

Tables are auto-created by Hibernate (`ddl-auto=update`).

---

## Package Structure

```
com.ngo.donation
├── config          — SecurityConfig, CorsConfig
├── controller      — REST Controllers
├── service         — Service interfaces
│   └── impl        — Service implementations
├── repository      — Spring Data JPA repositories
├── entity          — JPA entities
├── dto             — Request/Response DTOs
├── security        — JwtUtil, JwtAuthFilter, CustomUserDetailsService
├── exception       — GlobalExceptionHandler, custom exceptions
└── util            — (reserved for utilities)
```

---

## API Endpoints Summary

### Auth (Public)
| Method | URL                     | Description        |
|--------|-------------------------|--------------------|
| POST   | /api/auth/register      | Register new user  |
| POST   | /api/auth/login         | Login → get JWT    |

### NGOs (Public GET)
| Method | URL                        | Description          |
|--------|----------------------------|----------------------|
| GET    | /api/ngos                  | List all NGOs        |
| GET    | /api/ngos?location=Chennai | Search by location   |
| GET    | /api/ngos/{id}             | Get NGO by ID        |
| POST   | /api/ngos                  | Create NGO (ADMIN)   |

### Campaigns (Public GET)
| Method | URL                   | Description         |
|--------|-----------------------|---------------------|
| GET    | /api/campaigns        | List all campaigns  |
| GET    | /api/campaigns/{id}   | Get campaign        |
| POST   | /api/campaigns        | Create campaign     |

### Donations (DONOR / ADMIN)
| Method | URL                          | Description          |
|--------|------------------------------|----------------------|
| POST   | /api/donations/money         | Donate money         |
| POST   | /api/donations/goods         | Donate goods         |
| GET    | /api/donations/history/{id}  | Donor history        |

### Pickups (DONOR / ADMIN)
| Method | URL                    | Description          |
|--------|------------------------|----------------------|
| POST   | /api/pickups/request   | Schedule pickup      |
| GET    | /api/pickups/{donorId} | List donor pickups   |

### Volunteer Tasks (VOLUNTEER / ADMIN)
| Method | URL                              | Description        |
|--------|----------------------------------|--------------------|
| GET    | /api/tasks/volunteer/{id}        | My tasks           |
| PUT    | /api/tasks/updateStatus/{taskId} | Update task status |

### Admin (ADMIN only)
| Method | URL                           | Description          |
|--------|-------------------------------|----------------------|
| POST   | /api/admin/campaign/approve   | Approve campaign     |
| POST   | /api/admin/campaign/reject    | Reject campaign      |
| POST   | /api/admin/urgent-need        | Create urgent need   |
| GET    | /api/admin/urgent-needs       | List urgent needs    |
| GET    | /api/admin/reports            | List reports         |
| POST   | /api/admin/reports/generate   | Generate report      |
| GET    | /api/admin/donors             | List all donors      |
| GET    | /api/admin/volunteers         | List all volunteers  |

---

## Authentication Flow

1. Register → `POST /api/auth/register`
2. Login → `POST /api/auth/login` → copy `data.token`
3. All protected requests: add header `Authorization: Bearer <token>`

### Roles & Access
| Role      | Access                                   |
|-----------|------------------------------------------|
| GUEST     | Public endpoints only                    |
| DONOR     | Donations, Pickups, own history          |
| VOLUNTEER | View & update assigned tasks             |
| ADMIN     | All endpoints including admin panel      |

---

## Postman Collection
Import `NGO_Donation_API.postman_collection.json` into Postman.  
The Login request automatically saves the JWT to the `token` collection variable.

---

## Frontend Integration (React / Angular)
- Base URL: `http://localhost:8080`
- CORS is fully open for all origins in development
- All responses follow: `{ success, message, data }` format
