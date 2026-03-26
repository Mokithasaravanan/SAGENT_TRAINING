package com.ngo.donation.dto;

import com.ngo.donation.entity.Message;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageDTO {

    private Long id;

    @NotNull(message = "Sender ID is required")
    private Long senderId;

    private String senderName;
    private String senderEmail;

    private String otpCode;
    private Boolean otpVerified;

    @NotNull(message = "Receiver ID is required")
    private Long receiverId;

    private String receiverName;
    private String receiverEmail;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message content is required")
    private String content;

    private Message.MessageStatus status;

    private LocalDateTime createdAt;
}
