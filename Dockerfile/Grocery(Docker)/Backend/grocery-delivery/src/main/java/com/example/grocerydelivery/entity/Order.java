package com.example.grocerydelivery.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int orderId;

    private LocalDate orderDate;
    private String status;
    private String deliveryAddress;
    private double totalAmount;        // ADD THIS
    private int deliveryPersonId;      // ADD THIS - stores assigned delivery person

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;
}