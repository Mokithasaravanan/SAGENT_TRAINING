package com.ngo.donation.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO to create a dedicated admin for an NGO.
 */
@Data
public class NgoAdminCreateRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Enter a valid email")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String phone;

    private String address;

    @NotNull(message = "NGO ID is required")
    private Long ngoId;
}
