package com.ngo.donation.dto;

import com.ngo.donation.entity.Campaign;
import com.ngo.donation.entity.Donation;
import com.ngo.donation.util.LenientLocalDateTimeDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for Donation data transfer.
 */
@Data
public class DonationDTO {
    private Long id;

    @NotNull(message = "Donor ID is required")
    private Long donorId;

    private String donorName;

    private Long campaignId;

    private String campaignTitle;

    private Long ngoId;

    private String ngoName;

    @NotNull(message = "Donation type is required")
    private Campaign.DonationType donationType;

    private BigDecimal amount;

    private String itemDescription;

    private String pickupAddress;

    @JsonDeserialize(using = LenientLocalDateTimeDeserializer.class)
    private LocalDateTime pickupTime;

    private Donation.DonationStatus status;

    private LocalDateTime createdAt;

    private Boolean adminEmailSent;
}
