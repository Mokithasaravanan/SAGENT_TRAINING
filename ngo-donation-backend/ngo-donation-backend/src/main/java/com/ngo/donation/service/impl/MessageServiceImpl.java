package com.ngo.donation.service.impl;

import com.ngo.donation.dto.ApiResponse;
import com.ngo.donation.dto.BroadcastMessageDTO;
import com.ngo.donation.dto.MessageDTO;
import com.ngo.donation.entity.Message;
import com.ngo.donation.entity.User;
import com.ngo.donation.exception.ResourceNotFoundException;
import com.ngo.donation.repository.MessageRepository;
import com.ngo.donation.repository.UserRepository;
import com.ngo.donation.service.EmailService;
import com.ngo.donation.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of MessageService.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public MessageDTO sendMessage(MessageDTO dto) {
        User sender = userRepository.findById(dto.getSenderId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Sender", dto.getSenderId()));

        User receiver = userRepository.findById(dto.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Receiver", dto.getReceiverId()));

        // Generate 6 digit OTP
        String otp = String.format("%06d",
                new java.util.Random().nextInt(999999));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .subject(dto.getSubject())
                .content(dto.getContent())
                .otpCode(otp)
                .otpVerified(false)
                .status(Message.MessageStatus.SENT)
                .build();

        Message saved = messageRepository.save(message);

        // Send email with OTP
        emailService.sendEmailWithOtp(
                receiver.getEmail(),
                receiver.getName(),
                dto.getSubject(),
                dto.getContent(),
                otp
        );

        log.info("Message + OTP sent from {} to {}",
                sender.getEmail(), receiver.getEmail());

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public List<MessageDTO> broadcastToRole(BroadcastMessageDTO broadcastDTO) {
        User sender = userRepository.findById(broadcastDTO.getSenderId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Sender", broadcastDTO.getSenderId()));

        List<User> receivers = userRepository.findByRole(
                broadcastDTO.getTargetRole());

        if (receivers.isEmpty()) {
            log.warn("No users found with role: {}",
                    broadcastDTO.getTargetRole());
            return new ArrayList<>();
        }

        List<MessageDTO> sentMessages = new ArrayList<>();

        for (User receiver : receivers) {

            // Generate OTP for each receiver
            String otp = String.format("%06d",
                    new java.util.Random().nextInt(999999));

            Message message = Message.builder()
                    .sender(sender)
                    .receiver(receiver)
                    .subject(broadcastDTO.getSubject())
                    .content(broadcastDTO.getContent())
                    .otpCode(otp)
                    .otpVerified(false)
                    .status(Message.MessageStatus.SENT)
                    .build();

            Message saved = messageRepository.save(message);

            // Send email with OTP to each receiver
            emailService.sendEmailWithOtp(
                    receiver.getEmail(),
                    receiver.getName(),
                    broadcastDTO.getSubject(),
                    broadcastDTO.getContent(),
                    otp
            );

            sentMessages.add(mapToDTO(saved));
        }

        log.info("Broadcast sent to {} users with role: {}",
                receivers.size(), broadcastDTO.getTargetRole());

        return sentMessages;
    }

    @Override
    public List<MessageDTO> getInbox(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }
        return messageRepository
                .findByReceiverIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageDTO> getSentMessages(Long senderId) {
        if (!userRepository.existsById(senderId)) {
            throw new ResourceNotFoundException("User", senderId);
        }
        return messageRepository
                .findBySenderIdOrderByCreatedAtDesc(senderId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageDTO markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Message", messageId));
        message.setStatus(Message.MessageStatus.READ);
        return mapToDTO(messageRepository.save(message));
    }

    @Override
    @Transactional
    public ApiResponse<String> verifyOtp(Long messageId, String otp) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Message", messageId));

        if (message.getOtpCode() != null
                && message.getOtpCode().equals(otp)) {
            message.setOtpVerified(true);
            messageRepository.save(message);
            log.info("OTP verified for message id: {}", messageId);
            return ApiResponse.success("OTP verified successfully! ✅");
        } else {
            return ApiResponse.error("Invalid OTP! Please try again. ❌");
        }
    }

    // ── mapper ────────────────────────────────────────────────────────────────
    private MessageDTO mapToDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(message.getSender().getName());
        dto.setSenderEmail(message.getSender().getEmail());
        dto.setReceiverId(message.getReceiver().getId());
        dto.setReceiverName(message.getReceiver().getName());
        dto.setReceiverEmail(message.getReceiver().getEmail());
        dto.setSubject(message.getSubject());
        dto.setContent(message.getContent());
        dto.setStatus(message.getStatus());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }
}