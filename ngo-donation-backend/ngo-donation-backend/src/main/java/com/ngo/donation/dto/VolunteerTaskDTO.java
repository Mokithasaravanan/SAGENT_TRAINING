package com.ngo.donation.dto;

import com.ngo.donation.entity.VolunteerTask;
import com.ngo.donation.entity.Campaign;
import com.ngo.donation.entity.Donation;
import java.math.BigDecimal;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO for VolunteerTask data transfer.
 */
@Data
public class VolunteerTaskDTO {
    private Long id;
    private Long volunteerId;
    private String volunteerName;
    private Long pickupRequestId;
    private String pickupAddress;
    private LocalDateTime pickupTime;
    private Long donationId;
    private String donorName;
    private Campaign.DonationType donationType;
    private BigDecimal amount;
    private String itemDescription;
    private String campaignTitle;
    private Donation.DonationStatus donationStatus;
    private VolunteerTask.TaskStatus status;
}
