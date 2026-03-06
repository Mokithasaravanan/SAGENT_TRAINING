# 💰 SmartBudget Tracker — React Frontend

A complete React frontend for the Personal Budget Tracker Spring Boot backend.

## Project Structure

```
src/
├── App.js                        ← Root component, routing & state
├── index.js                      ← React entry point
├── api.js                        ← API helper, formatters, utils
├── styles.css                    ← Global styles (dark theme)
│
├── components/
│   ├── Sidebar.js                ← Navigation sidebar
│   └── Toast.js                  ← Toast notification
│
└── pages/
    ├── AuthPage.js               ← Login + Register
    ├── Overview.js               ← Dashboard with stats
    ├── IncomePage.js             ← Add/view income
    ├── ExpensePage.js            ← Log/view expenses + category breakdown
    ├── BudgetPage.js             ← Monthly budget limits + progress bars
    ├── GoalsPage.js              ← Savings goals + progress
    ├── BalancePage.js            ← Net balance + spending ratio
    └── NotificationsPage.js      ← Personal notes/reminders
```

## API Endpoints Used

| Page             | Endpoint(s)                                  |
|------------------|----------------------------------------------|
| Auth             | POST /api/users, POST /api/users/login       |
| Income           | GET/POST/DELETE /api/income                  |
| Expenses         | GET/POST/DELETE /api/expense                 |
| Budget           | GET/POST/DELETE /api/budget                  |
| Goals            | GET/POST/DELETE /api/goals/{userId}          |
| Balance          | GET/PUT /api/balance/{userId}                |
| Notifications    | GET/POST/DELETE /api/notifications           |

## Setup & Run

### 1. Prerequisites
- Node.js 16+ installed
- Spring Boot backend running on `http://localhost:8080`

### 2. Enable CORS on your Spring Boot backend
Add `@CrossOrigin(origins = "*")` to all controllers (already done on UserController).
Or add a global CORS config:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins("*").allowedMethods("*");
    }
}
```

### 3. Install & start

```bash
npm install
npm start
```

App opens at **http://localhost:3000**

## User Flow

1. **Register** → Fill name, email, phone, designation, password
2. **Login** → Enter email + password
3. **Add Income** → Source, amount, date
4. **Log Expenses** → Category, amount, date
5. **Set Budget** → Monthly limit (e.g. `2025-06`)
6. **Set Goals** → Target amount + current savings
7. **View Balance** → Click "Refresh Balance" to recalculate
8. **Notes** → Add reminders / financial notes
