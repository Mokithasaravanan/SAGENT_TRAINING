package com.ngo.donation.service.impl;

import com.ngo.donation.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Gmail SMTP Email Service with OTP support.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendEmail(String toEmail, String toName,
                          String subject, String body) {
        sendEmailWithOtp(toEmail, toName, subject, body, null);
    }

    @Override
    public void sendEmailWithOtp(String toEmail, String toName,
                                 String subject, String body, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "NGO Hub Admin");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(buildHtml(toName, subject, body, otp), true);

            mailSender.send(message);
            log.info("Email sent to: {}", toEmail);

        } catch (Exception e) {
            log.error("Email failed to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildHtml(String name, String subject,
                             String body, String otp) {
        String otpSection = "";

        if (otp != null && !otp.isEmpty()) {
            otpSection =
                    "<div style='background:#fff;border:2px dashed #10b981;"
                            + "border-radius:16px;padding:30px;text-align:center;margin:25px 0;'>"
                            + "<p style='color:#6b7280;font-size:13px;margin:0 0 10px;'>"
                            + "🔐 Your Verification Code</p>"
                            + "<div style='display:inline-block;background:linear-gradient("
                            + "135deg,#10b981,#0d9488);border-radius:12px;padding:16px 40px;'>"
                            + "<span style='color:white;font-size:36px;font-weight:bold;"
                            + "letter-spacing:12px;font-family:monospace;'>" + otp + "</span>"
                            + "</div>"
                            + "<p style='color:#9ca3af;font-size:12px;margin:12px 0 0;'>"
                            + "⏰ This OTP is valid for <b>10 minutes</b> only</p>"
                            + "<p style='color:#ef4444;font-size:11px;margin:5px 0 0;'>"
                            + "🚫 Do not share this OTP with anyone</p>"
                            + "</div>";
        }

        return "<html><body style='font-family:Arial,sans-serif;"
                + "background:#f0fdf4;padding:20px;margin:0;'>"
                + "<div style='max-width:600px;margin:0 auto;background:white;"
                + "border-radius:16px;overflow:hidden;"
                + "box-shadow:0 4px 20px rgba(0,0,0,0.1);'>"

                // Header
                + "<div style='background:linear-gradient(135deg,#10b981,#0d9488);"
                + "padding:30px;text-align:center;'>"
                + "<div style='font-size:40px;margin-bottom:8px;'>🌱</div>"
                + "<h1 style='color:white;margin:0;font-size:26px;"
                + "font-weight:bold;'>NGO Hub</h1>"
                + "<p style='color:rgba(255,255,255,0.85);margin:6px 0 0;"
                + "font-size:14px;'>Donation Management Platform</p>"
                + "</div>"

                // Body
                + "<div style='padding:35px;'>"
                + "<p style='color:#111827;font-size:18px;font-weight:600;"
                + "margin:0 0 5px;'>Hello " + name + "! 👋</p>"
                + "<p style='color:#6b7280;font-size:14px;margin:0 0 20px;'>"
                + "You have a new message from <b>NGO Hub Admin</b>.</p>"

                // Message box
                + "<div style='background:#f0fdf4;border-left:4px solid #10b981;"
                + "padding:20px;border-radius:8px;margin:0 0 20px;'>"
                + "<h3 style='color:#065f46;margin:0 0 10px;font-size:16px;'>"
                + "📌 " + subject + "</h3>"
                + "<p style='color:#374151;margin:0;line-height:1.8;"
                + "white-space:pre-line;font-size:14px;'>" + body + "</p>"
                + "</div>"

                // OTP section
                + otpSection

                // Action button
                + "<div style='text-align:center;margin:25px 0;'>"
                + "<a href='http://localhost:3000' style='background:linear-gradient("
                + "135deg,#10b981,#0d9488);color:white;padding:14px 32px;"
                + "border-radius:25px;text-decoration:none;font-weight:bold;"
                + "font-size:14px;display:inline-block;'>Visit NGO Hub →</a>"
                + "</div>"

                + "<p style='color:#9ca3af;font-size:12px;margin:20px 0 0;"
                + "text-align:center;'>Sent from NGO Hub Admin Dashboard</p>"
                + "</div>"

                // Footer
                + "<div style='background:#f9fafb;padding:20px;text-align:center;"
                + "border-top:1px solid #e5e7eb;'>"
                + "<p style='color:#9ca3af;font-size:12px;margin:0;'>"
                + "© 2025 NGO Hub • Making a difference together ❤️</p>"
                + "<p style='color:#d1d5db;font-size:11px;margin:5px 0 0;'>"
                + "Chennai, Tamil Nadu, India</p>"
                + "</div>"

                + "</div></body></html>";
    }
}