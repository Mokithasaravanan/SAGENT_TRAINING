package com.ngo.donation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing a generated admin report.
 */
@Entity
@Table(name = "reports")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "report_type", nullable = false)
    private String reportType;

    @Column(name = "generated_date")
    @CreationTimestamp
    private LocalDateTime generatedDate;

    @Column(columnDefinition = "TEXT")
    private String content;
}
