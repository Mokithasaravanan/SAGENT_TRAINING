package com.ngo.donation.service;

/**
 * Service interface for sending emails.
 */
public interface EmailService {

    void sendEmail(String toEmail, String toName,
                   String subject, String body);

    void sendEmailWithOtp(String toEmail, String toName,
                          String subject, String body, String otp);
}