package com.ngo.donation.dto;

import com.ngo.donation.entity.Donation;
import com.ngo.donation.entity.PickupRequest;
import com.ngo.donation.util.LenientLocalDateTimeDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO for PickupRequest data transfer.
 */
@Data
public class PickupRequestDTO {
    private Long id;

    @NotNull(message = "Donor ID is required")
    private Long donorId;

    private String donorName;

    @NotNull(message = "Donation ID is required")
    private Long donationId;

    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;

    @NotNull(message = "Pickup time is required")
    @JsonDeserialize(using = LenientLocalDateTimeDeserializer.class)
    private LocalDateTime pickupTime;

    private PickupRequest.PickupStatus status;

    private Donation.DonationStatus donationStatus;
}
