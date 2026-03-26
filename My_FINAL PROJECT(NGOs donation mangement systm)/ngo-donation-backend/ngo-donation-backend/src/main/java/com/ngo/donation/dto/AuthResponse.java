package com.ngo.donation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * DTO for JWT authentication response.
 */
@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private Long userId;
    private Long ngoId;
}
