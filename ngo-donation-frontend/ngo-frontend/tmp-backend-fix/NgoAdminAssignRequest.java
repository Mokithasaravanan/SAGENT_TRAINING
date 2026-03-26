package com.ngo.donation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO to assign an existing admin to an NGO.
 */
@Data
public class NgoAdminAssignRequest {

    @NotNull(message = "Admin ID is required")
    private Long adminId;

    @NotNull(message = "NGO ID is required")
    private Long ngoId;
}
