package com.ngo.donation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for NGO data transfer.
 */
@Data
public class NgoDTO {
    private Long id;

    @NotBlank(message = "NGO name is required")
    private String name;

    private String description;
    private String address;
    private String contactEmail;
    private String contactPhone;
}
