package com.ngo.donation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO for UrgentNeed data transfer.
 */
@Data
public class UrgentNeedDTO {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private Long createdByAdminId;

    private LocalDateTime createdAt;
}
