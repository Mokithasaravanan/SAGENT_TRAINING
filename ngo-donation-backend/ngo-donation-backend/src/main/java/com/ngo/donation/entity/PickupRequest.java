package com.ngo.donation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing a pickup request for a goods donation.
 */
@Entity
@Table(name = "pickup_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PickupRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_id", nullable = false)
    private User donor;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = false)
    private Donation donation;

    @Column(name = "pickup_address", nullable = false)
    private String pickupAddress;

    @Column(name = "pickup_time")
    private LocalDateTime pickupTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PickupStatus status = PickupStatus.SCHEDULED;

    @OneToOne(mappedBy = "pickupRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private VolunteerTask volunteerTask;

    public enum PickupStatus {
        SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    }
}
