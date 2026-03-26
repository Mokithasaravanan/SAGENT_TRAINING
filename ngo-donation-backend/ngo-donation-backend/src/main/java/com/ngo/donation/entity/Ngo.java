package com.ngo.donation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

/**
 * Entity representing an NGO organization.
 */
@Entity
@Table(name = "ngos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ngo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String address;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    @OneToMany(mappedBy = "ngo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Campaign> campaigns;

    @OneToMany(mappedBy = "ngo", fetch = FetchType.LAZY)
    private List<User> admins;
}
