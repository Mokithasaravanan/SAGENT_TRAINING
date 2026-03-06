# GreenBasket – Grocery Delivery App

## Project Structure
```
grocery-app/          ← React Frontend
backend-notes/        ← Backend setup notes
```

---

## 🚀 Frontend Setup

```bash
cd grocery-app
npm install
npm start
```
App runs at: http://localhost:3000

---

## ⚙️ Backend Setup

Your Spring Boot backend should run on **http://localhost:8080**.

### Enable CORS in Spring Boot

Add this to your main application class or a config class:

```java
// GlobalCorsConfig.java
package com.example.grocerydelivery.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class GlobalCorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
```

### Required Entity Fields

Make sure your JPA entities have these fields:

**Customer**: customerId, name, email, password, phone, address  
**Product**: productId, name, price, stock, categoryId, description  
**ProductCategory**: categoryId, name, description  
**Order**: orderId, customerId, deliveryPersonId, status, totalAmount, deliveryAddress, orderDate  
**Payment**: paymentId, orderId, amount, method, status, paymentDate  
**DeliveryPerson**: personId, name, email, password, phone, available (boolean)  
**Cart**: cartId, customerId, productId, quantity, orderId  
**Notification**: notifyId, customerId, message, type, createdAt  

### Admin Controller (Add to backend)

```java
// AdminController.java
package com.example.grocerydelivery.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admins")
public class AdminController {
    // Admin login is handled in the frontend with hardcoded credentials
    // admin@grocery.com / admin123
    // You can add a real Admin entity if needed
    
    @GetMapping
    public List<Map<String,Object>> getAdmins() {
        List<Map<String,Object>> admins = new ArrayList<>();
        Map<String,Object> admin = new HashMap<>();
        admin.put("id", 1);
        admin.put("name", "Admin");
        admin.put("email", "admin@grocery.com");
        admins.add(admin);
        return admins;
    }
}
```

---

## 👤 Login Roles

| Role | How to Login |
|------|-------------|
| **Admin** | Email: `admin@grocery.com` / Password: `admin123` |
| **Customer** | Register first, then login |
| **Delivery Person** | Admin creates account, then login |

---

## 📱 Features

### Customer
- Browse products by category + search
- Add to cart with quantity management
- ₹25 discount on orders > ₹200
- Multiple payment methods (Card, UPI, Wallet, COD)
- Order tracking with live status
- Cancel orders
- Notifications
- Profile management

### Admin
- Dashboard with revenue stats
- Add/Edit/Delete products with stock management
- Manage product categories
- View & update order statuses
- Assign delivery persons to orders
- Manage delivery persons (availability)
- View all customers
- Payment records

### Delivery Person
- View assigned orders
- Update delivery status (Preparing → Out for Delivery → Delivered)
- Customer address + contact info visible
- Auto-marked available after delivery

---

## 🔌 API Endpoints Used

| Resource | Base URL |
|----------|----------|
| Customers | `/api/customers` |
| Products | `/api/products` |
| Categories | `/api/categories` |
| Orders | `/api/orders` |
| Payments | `/api/payments` |
| Cart | `/api/carts` |
| Delivery | `/api/delivery-persons` |
| Notifications | `/api/notifications` |
