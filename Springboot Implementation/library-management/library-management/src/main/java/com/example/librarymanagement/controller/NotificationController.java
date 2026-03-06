package com.example.librarymanagement.controller;

import com.example.librarymanagement.entity.Notification;
import com.example.librarymanagement.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired private NotificationService notificationService;

    @PostMapping public Notification add(@RequestBody Notification n) { return notificationService.addNotification(n); }
    @GetMapping public List<Notification> getAll() { return notificationService.getAllNotifications(); }
}