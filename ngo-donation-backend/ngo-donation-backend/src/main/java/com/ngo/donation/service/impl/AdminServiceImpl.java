package com.ngo.donation.service.impl;

import com.ngo.donation.dto.UrgentNeedDTO;
import com.ngo.donation.dto.UserDTO;
import com.ngo.donation.dto.VolunteerTaskDTO;
import com.ngo.donation.entity.PickupRequest;
import com.ngo.donation.entity.Report;
import com.ngo.donation.entity.UrgentNeed;
import com.ngo.donation.entity.User;
import com.ngo.donation.entity.VolunteerTask;
import com.ngo.donation.exception.ResourceNotFoundException;
import com.ngo.donation.repository.DonationRepository;
import com.ngo.donation.repository.PickupRequestRepository;
import com.ngo.donation.repository.ReportRepository;
import com.ngo.donation.repository.UrgentNeedRepository;
import com.ngo.donation.repository.UserRepository;
import com.ngo.donation.repository.VolunteerTaskRepository;
import com.ngo.donation.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of AdminService.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final UrgentNeedRepository urgentNeedRepository;
    private final ReportRepository reportRepository;
    private final DonationRepository donationRepository;
    private final PickupRequestRepository pickupRequestRepository;
    private final VolunteerTaskRepository volunteerTaskRepository;

    // ── Get All Donors ────────────────────────────────────────────────────────

    @Override
    public List<UserDTO> getAllDonors() {
        return userRepository.findByRole(User.Role.DONOR)
                .stream()
                .map(this::mapUserToDTO)
                .collect(Collectors.toList());
    }

    // ── Get All Volunteers ────────────────────────────────────────────────────

    @Override
    public List<UserDTO> getAllVolunteers() {
        return userRepository.findByRole(User.Role.VOLUNTEER)
                .stream()
                .map(this::mapUserToDTO)
                .collect(Collectors.toList());
    }

    // ── Create Urgent Need ────────────────────────────────────────────────────

    @Override
    @Transactional
    public UrgentNeedDTO createUrgentNeed(UrgentNeedDTO urgentNeedDTO) {
        User admin = userRepository.findById(urgentNeedDTO.getCreatedByAdminId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin User",
                        urgentNeedDTO.getCreatedByAdminId()));

        UrgentNeed urgentNeed = UrgentNeed.builder()
                .title(urgentNeedDTO.getTitle())
                .description(urgentNeedDTO.getDescription())
                .createdByAdmin(admin)
                .build();

        UrgentNeed saved = urgentNeedRepository.save(urgentNeed);
        log.info("Urgent need created with id: {}", saved.getId());
        return mapUrgentNeedToDTO(saved);
    }

    // ── Get All Urgent Needs ──────────────────────────────────────────────────

    @Override
    public List<UrgentNeedDTO> getAllUrgentNeeds() {
        return urgentNeedRepository.findAll()
                .stream()
                .map(this::mapUrgentNeedToDTO)
                .collect(Collectors.toList());
    }

    // ── Generate Report ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public Report generateReport(String reportType) {
        long totalDonations = donationRepository.count();
        long totalDonors    = userRepository.findByRole(User.Role.DONOR).size();
        long totalVolunteers = userRepository.findByRole(User.Role.VOLUNTEER).size();

        String content = String.format(
                "Report Type: %s | Total Donations: %d | Total Donors: %d | Total Volunteers: %d",
                reportType, totalDonations, totalDonors, totalVolunteers);

        Report report = Report.builder()
                .reportType(reportType)
                .content(content)
                .build();

        Report saved = reportRepository.save(report);
        log.info("Report generated with type: {}", reportType);
        return saved;
    }

    // ── Get All Reports ───────────────────────────────────────────────────────

    @Override
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    // ── Assign Volunteer Task ─────────────────────────────────────────────────

    @Override
    @Transactional
    public VolunteerTaskDTO assignVolunteerTask(Long volunteerId, Long pickupRequestId) {
        // Validate volunteer exists
        User volunteer = userRepository.findById(volunteerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", volunteerId));

        // Validate pickup request exists
        PickupRequest pickupRequest = pickupRequestRepository.findById(pickupRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("PickupRequest", pickupRequestId));

        // Build and save volunteer task
        VolunteerTask task = VolunteerTask.builder()
                .volunteer(volunteer)
                .pickupRequest(pickupRequest)
                .status(VolunteerTask.TaskStatus.ASSIGNED)
                .build();

        VolunteerTask saved = volunteerTaskRepository.save(task);
        log.info("VolunteerTask created: id={}, volunteerId={}, pickupRequestId={}",
                saved.getId(), volunteerId, pickupRequestId);

        // Map to DTO and return
        VolunteerTaskDTO dto = new VolunteerTaskDTO();
        dto.setId(saved.getId());
        dto.setVolunteerId(volunteer.getId());
        dto.setVolunteerName(volunteer.getName());
        dto.setPickupRequestId(pickupRequest.getId());
        dto.setPickupAddress(pickupRequest.getPickupAddress());
        dto.setPickupTime(pickupRequest.getPickupTime());
        dto.setStatus(saved.getStatus());
        return dto;
    }

    // ── Private Mappers ───────────────────────────────────────────────────────

    private UserDTO mapUserToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        try {
            if (user.getNgo() != null) {
                dto.setNgoId(user.getNgo().getId());
                dto.setNgoName(user.getNgo().getName());
            }
        } catch (Exception ignored) {
            // Defensive: avoid failing DTO mapping on broken NGO references
        }
        return dto;
    }

    private UrgentNeedDTO mapUrgentNeedToDTO(UrgentNeed un) {
        UrgentNeedDTO dto = new UrgentNeedDTO();
        dto.setId(un.getId());
        dto.setTitle(un.getTitle());
        dto.setDescription(un.getDescription());
        if (un.getCreatedByAdmin() != null) {
            dto.setCreatedByAdminId(un.getCreatedByAdmin().getId());
        }
        dto.setCreatedAt(un.getCreatedAt());
        return dto;
    }
}
