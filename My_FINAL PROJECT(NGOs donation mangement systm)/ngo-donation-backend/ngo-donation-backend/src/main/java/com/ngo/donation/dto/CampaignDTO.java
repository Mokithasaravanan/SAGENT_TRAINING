package com.ngo.donation.dto;

import com.ngo.donation.entity.Campaign;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for Campaign data transfer.
 */
@Data
public class CampaignDTO {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Donation type is required")
    private Campaign.DonationType donationType;

    private BigDecimal targetAmount;
    private BigDecimal collectedAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private Campaign.CampaignStatus status;

    @NotNull(message = "NGO ID is required")
    private Long ngoId;

    private String ngoName;
}
