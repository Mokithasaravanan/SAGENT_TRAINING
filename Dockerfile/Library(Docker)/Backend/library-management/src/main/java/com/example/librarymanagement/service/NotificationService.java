package com.example.librarymanagement.service;

import com.example.librarymanagement.entity.Notification;
import com.example.librarymanagement.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {
    @Autowired private NotificationRepository notificationRepository;

    public Notification addNotification(Notification n) { return notificationRepository.save(n); }
    public List<Notification> getAllNotifications() { return notificationRepository.findAll(); }
}