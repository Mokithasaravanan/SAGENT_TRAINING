package com.example.grocerydelivery.service;

import com.example.grocerydelivery.entity.Order;
import com.example.grocerydelivery.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public Order save(Order order) {
        // Only set defaults for NEW orders (no id yet)
        if (order.getOrderId() == 0) {
            order.setOrderDate(LocalDate.now());
            if (order.getStatus() == null || order.getStatus().isEmpty()) {
                order.setStatus("PLACED");
            }
        }
        return orderRepository.save(order);
    }

    public List<Order> getAll() {
        return orderRepository.findAll();
    }

    public Order getById(int id) {
        return orderRepository.findById(id).orElseThrow();
    }

    public void delete(int id) {
        orderRepository.deleteById(id);
    }
}