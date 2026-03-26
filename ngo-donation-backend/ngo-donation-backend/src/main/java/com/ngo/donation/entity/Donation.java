package com.ngo.donation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a donation made by a donor to a campaign.
 */
@Entity
@Table(name = "donations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_id", nullable = false)
    private User donor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ngo_id")
    private Ngo ngo;

    @Enumerated(EnumType.STRING)
    @Column(name = "donation_type", nullable = false)
    private Campaign.DonationType donationType;

    @Column(precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "item_description", columnDefinition = "TEXT")
    private String itemDescription;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DonationStatus status = DonationStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "donation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private PickupRequest pickupRequest;

    public enum DonationStatus {
        PENDING, APPROVED, REJECTED, CONFIRMED
    }
}
