package com.ngo.donation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for donation approve/reject actions.
 */
@Data
public class DonationActionRequest {

    @NotNull(message = "Donation ID is required")
    private Long donationId;
}
