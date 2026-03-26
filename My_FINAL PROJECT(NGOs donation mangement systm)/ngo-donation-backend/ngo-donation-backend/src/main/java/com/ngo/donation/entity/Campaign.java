package com.ngo.donation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Entity representing a donation campaign run by an NGO.
 */
@Entity
@Table(name = "campaigns")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "donation_type", nullable = false)
    private DonationType donationType;

    @Column(name = "target_amount", precision = 15, scale = 2)
    private BigDecimal targetAmount;

    @Column(name = "collected_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal collectedAmount = BigDecimal.ZERO;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CampaignStatus status = CampaignStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ngo_id", nullable = false)
    private Ngo ngo;

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Donation> donations;

    public enum DonationType {
        FOOD, CLOTHES, MONEY, GROCERY
    }

    public enum CampaignStatus {
        PENDING, ACTIVE, REJECTED, COMPLETED
    }
}
