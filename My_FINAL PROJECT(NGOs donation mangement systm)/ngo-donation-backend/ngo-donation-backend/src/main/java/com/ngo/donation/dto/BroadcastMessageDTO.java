package com.ngo.donation.dto;

import com.ngo.donation.entity.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for broadcasting message to all users of a role.
 */
@Data
public class BroadcastMessageDTO {

    @NotNull(message = "Sender ID is required")
    private Long senderId;

    @NotNull(message = "Target role is required")
    private User.Role targetRole;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message content is required")
    private String content;
}