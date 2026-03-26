package com.ngo.donation.controller;

import com.ngo.donation.dto.ApiResponse;
import com.ngo.donation.dto.BroadcastMessageDTO;
import com.ngo.donation.dto.MessageDTO;
import com.ngo.donation.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Message endpoints.
 */
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    /**
     * POST /api/messages/send
     * Send message to a specific user — Admin only
     */
    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MessageDTO>> sendMessage(
            @Valid @RequestBody MessageDTO messageDTO) {
        MessageDTO sent = messageService.sendMessage(messageDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Message sent successfully!", sent));
    }

    /**
     * POST /api/messages/broadcast
     * Send message to ALL users of a role — Admin only
     */
    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> broadcastMessage(
            @Valid @RequestBody BroadcastMessageDTO broadcastDTO) {
        List<MessageDTO> sent = messageService.broadcastToRole(broadcastDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Message broadcast to " + sent.size() + " users!", sent));
    }

    /**
     * GET /api/messages/inbox/{userId}
     * Get inbox messages for a user
     */
    @GetMapping("/inbox/{userId}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getInbox(
            @PathVariable Long userId) {
        List<MessageDTO> inbox = messageService.getInbox(userId);
        return ResponseEntity.ok(ApiResponse.success(inbox));
    }

    /**
     * GET /api/messages/sent/{senderId}
     * Get sent messages by admin
     */
    @GetMapping("/sent/{senderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getSentMessages(
            @PathVariable Long senderId) {
        List<MessageDTO> sent = messageService.getSentMessages(senderId);
        return ResponseEntity.ok(ApiResponse.success(sent));
    }

    /**
     * POST /api/messages/verify-otp
     * Verify OTP sent in email
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(
            @RequestParam Long messageId,
            @RequestParam String otp) {
        ApiResponse<String> result = messageService.verifyOtp(messageId, otp);
        return ResponseEntity.ok(result);
    }

    /**
     * PUT /api/messages/read/{messageId}
     * Mark message as read
     */
    @PutMapping("/read/{messageId}")
    public ResponseEntity<ApiResponse<MessageDTO>> markAsRead(
            @PathVariable Long messageId) {
        MessageDTO updated = messageService.markAsRead(messageId);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", updated));
    }
}