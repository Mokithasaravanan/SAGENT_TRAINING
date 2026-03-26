package com.ngo.donation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for approving or rejecting a campaign.
 */
@Data
public class CampaignActionRequest {

    @NotNull(message = "Campaign ID is required")
    private Long campaignId;
}
