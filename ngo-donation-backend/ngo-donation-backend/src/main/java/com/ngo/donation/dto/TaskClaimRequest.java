package com.ngo.donation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for claiming a pickup task.
 */
@Data
public class TaskClaimRequest {

    @NotNull(message = "Pickup Request ID is required")
    private Long pickupRequestId;

    @NotNull(message = "Volunteer ID is required")
    private Long volunteerId;
}
