package com.ngo.donation.dto;

import com.ngo.donation.entity.User;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO for exposing User data (no password).
 */
@Data
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private Long ngoId;
    private String ngoName;
    private User.Role role;
    private LocalDateTime createdAt;
}
