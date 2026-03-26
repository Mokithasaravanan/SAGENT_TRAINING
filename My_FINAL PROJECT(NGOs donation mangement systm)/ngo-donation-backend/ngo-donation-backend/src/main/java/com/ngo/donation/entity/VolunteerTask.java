package com.ngo.donation.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing a task assigned to a volunteer.
 */
@Entity
@Table(name = "volunteer_tasks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VolunteerTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "volunteer_id", nullable = false)
    private User volunteer;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_request_id", nullable = false)
    private PickupRequest pickupRequest;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TaskStatus status = TaskStatus.ASSIGNED;

    public enum TaskStatus {
        ASSIGNED, IN_PROGRESS, COMPLETED
    }
}
