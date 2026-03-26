package com.ngo.donation.repository;

import com.ngo.donation.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Message entity.
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    List<Message> findBySenderIdOrderByCreatedAtDesc(Long senderId);

    List<Message> findByReceiverIdAndStatus(Long receiverId, Message.MessageStatus status);

    Optional<Message> findByIdAndOtpCode(Long id, String otpCode);
}