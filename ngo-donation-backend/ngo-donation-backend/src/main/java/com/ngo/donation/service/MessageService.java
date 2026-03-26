package com.ngo.donation.service;

import com.ngo.donation.dto.ApiResponse;
import com.ngo.donation.dto.BroadcastMessageDTO;
import com.ngo.donation.dto.MessageDTO;

import java.util.List;

/**
 * Service interface for Message operations.
 */
public interface MessageService {

    MessageDTO sendMessage(MessageDTO messageDTO);

    List<MessageDTO> broadcastToRole(BroadcastMessageDTO broadcastDTO);

    List<MessageDTO> getInbox(Long userId);

    List<MessageDTO> getSentMessages(Long senderId);

    MessageDTO markAsRead(Long messageId);

    ApiResponse<String> verifyOtp(Long messageId, String otp);
}