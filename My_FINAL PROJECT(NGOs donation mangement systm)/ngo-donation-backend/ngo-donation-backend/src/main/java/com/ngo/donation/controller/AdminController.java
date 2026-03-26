package com.ngo.donation.controller;

import com.ngo.donation.dto.ApiResponse;
import com.ngo.donation.dto.CampaignActionRequest;
import com.ngo.donation.dto.CampaignDTO;
import com.ngo.donation.dto.DonationActionRequest;
import com.ngo.donation.dto.DonationDTO;
import com.ngo.donation.dto.NgoAdminCreateRequest;
import com.ngo.donation.dto.NgoAdminAssignRequest;
import com.ngo.donation.dto.PickupRequestDTO;
import com.ngo.donation.dto.UrgentNeedDTO;
import com.ngo.donation.dto.UserDTO;
import com.ngo.donation.dto.VolunteerTaskDTO;
import com.ngo.donation.entity.Donation;
import com.ngo.donation.entity.PickupRequest;
import com.ngo.donation.entity.Report;
import com.ngo.donation.entity.User;
import com.ngo.donation.entity.VolunteerTask;
import com.ngo.donation.entity.Ngo;
import com.ngo.donation.exception.BadRequestException;
import com.ngo.donation.exception.ResourceNotFoundException;
import com.ngo.donation.repository.PickupRequestRepository;
import com.ngo.donation.repository.NgoRepository;
import com.ngo.donation.repository.UserRepository;
import com.ngo.donation.repository.VolunteerTaskRepository;
import com.ngo.donation.service.AdminService;
import com.ngo.donation.service.CampaignService;
import com.ngo.donation.service.DonationService;
import com.ngo.donation.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for Admin-only endpoints.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final CampaignService campaignService;
    private final DonationService donationService;
    private final EmailService emailService;
    private final PickupRequestRepository pickupRequestRepository;
    private final VolunteerTaskRepository volunteerTaskRepository;
    private final UserRepository userRepository;
    private final NgoRepository ngoRepository;
    private final PasswordEncoder passwordEncoder;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new BadRequestException("Unauthorized");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new BadRequestException("Unauthorized"));
    }

    private boolean isNgoAdmin(User user) {
        return user != null && user.getRole() == User.Role.ADMIN && user.getNgo() != null;
    }

    private void ensureSuperAdmin(User user) {
        if (isNgoAdmin(user)) {
            throw new BadRequestException("NGO admins are not allowed to access this resource");
        }
    }

    private UserDTO mapUser(User user) {
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
            // Defensive: avoid failing admin list on broken NGO references
        }
        return dto;
    }

    // ── Campaign Actions ──────────────────────────────────────────────────────

    /**
     * POST /api/admin/campaign/approve
     */
    @PostMapping("/campaign/approve")
    public ResponseEntity<ApiResponse<CampaignDTO>> approveCampaign(
            @Valid @RequestBody CampaignActionRequest request) {
        User current = getCurrentUser();
        ensureSuperAdmin(current);
        CampaignDTO campaign = campaignService
                .approveCampaign(request.getCampaignId());
        return ResponseEntity.ok(
                ApiResponse.success("Campaign approved", campaign));
    }

    /**
     * POST /api/admin/campaign/reject
     */
    @PostMapping("/campaign/reject")
    public ResponseEntity<ApiResponse<CampaignDTO>> rejectCampaign(
            @Valid @RequestBody CampaignActionRequest request) {
        User current = getCurrentUser();
        ensureSuperAdmin(current);
        CampaignDTO campaign = campaignService
                .rejectCampaign(request.getCampaignId());
        return ResponseEntity.ok(
                ApiResponse.success("Campaign rejected", campaign));
    }

    // ── Donations ────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/donations
     * Get all donation requests
     */
    @GetMapping("/donations")
    public ResponseEntity<ApiResponse<List<DonationDTO>>> getAllDonations() {
        User current = getCurrentUser();
        List<DonationDTO> donations = isNgoAdmin(current)
                ? donationService.getDonationsForNgo(current.getNgo().getId())
                : donationService.getAllDonations();
        return ResponseEntity.ok(ApiResponse.success(donations));
    }

    /**
     * POST /api/admin/donations/approve
     */
    @PostMapping("/donations/approve")
    public ResponseEntity<ApiResponse<DonationDTO>> approveDonation(
            @Valid @RequestBody DonationActionRequest request) {
        User current = getCurrentUser();
        DonationDTO updated = isNgoAdmin(current)
                ? donationService.approveDonationForNgo(request.getDonationId(), current.getNgo().getId())
                : donationService.approveDonation(request.getDonationId());
        return ResponseEntity.ok(ApiResponse.success("Donation approved", updated));
    }

    /**
     * POST /api/admin/donations/reject
     */
    @PostMapping("/donations/reject")
    public ResponseEntity<ApiResponse<DonationDTO>> rejectDonation(
            @Valid @RequestBody DonationActionRequest request) {
        User current = getCurrentUser();
        DonationDTO updated = isNgoAdmin(current)
                ? donationService.rejectDonationForNgo(request.getDonationId(), current.getNgo().getId())
                : donationService.rejectDonation(request.getDonationId());
        return ResponseEntity.ok(ApiResponse.success("Donation rejected", updated));
    }

    // ── Pickup Requests ───────────────────────────────────────────────────────

    /**
     * GET /api/admin/pickups
     * Get all pickup requests from all donors
     */
    @GetMapping("/pickups")
    public ResponseEntity<ApiResponse<List<PickupRequestDTO>>> getAllPickups() {
        User current = getCurrentUser();
        ensureSuperAdmin(current);
        List<PickupRequestDTO> dtos = pickupRequestRepository.findAll()
                .stream()
                .map(pr -> {
                    PickupRequestDTO dto = new PickupRequestDTO();
                    dto.setId(pr.getId());
                    dto.setDonorId(pr.getDonor().getId());
                    dto.setDonorName(pr.getDonor().getName());
                    dto.setDonationId(pr.getDonation().getId());
                    dto.setPickupAddress(pr.getPickupAddress());
                    dto.setPickupTime(pr.getPickupTime());
                    dto.setStatus(pr.getStatus());
                    dto.setDonationStatus(pr.getDonation().getStatus());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    // ── Volunteer Task Assignment ─────────────────────────────────────────────

    /**
     * POST /api/admin/assign-task
     * Assign a volunteer to a pickup request — creates a VolunteerTask
     */
    @PostMapping("/assign-task")
    public ResponseEntity<ApiResponse<VolunteerTaskDTO>> assignTask(
            @RequestParam Long volunteerId,
            @RequestParam Long pickupRequestId) {
        User current = getCurrentUser();
        ensureSuperAdmin(current);

        PickupRequest pickup = pickupRequestRepository
                .findById(pickupRequestId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "PickupRequest", pickupRequestId));
        Donation donation = pickup.getDonation();
        if (donation == null
                || (donation.getStatus() != Donation.DonationStatus.APPROVED
                && donation.getStatus() != Donation.DonationStatus.CONFIRMED)) {
            throw new BadRequestException("Donation is not approved yet");
        }

        User volunteer = userRepository.findById(volunteerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Volunteer", volunteerId));

        // If a task already exists for this pickup, update the volunteer instead of failing
        VolunteerTask existing = volunteerTaskRepository
                .findByPickupRequestId(pickupRequestId)
                .orElse(null);
        if (existing != null) {
            existing.setVolunteer(volunteer);
            existing.setStatus(VolunteerTask.TaskStatus.ASSIGNED);
            VolunteerTask updated = volunteerTaskRepository.save(existing);

            VolunteerTaskDTO dto = new VolunteerTaskDTO();
            dto.setId(updated.getId());
            dto.setVolunteerId(volunteer.getId());
            dto.setVolunteerName(volunteer.getName());
            dto.setPickupRequestId(pickup.getId());
            dto.setPickupAddress(pickup.getPickupAddress());
            dto.setPickupTime(pickup.getPickupTime());
            dto.setDonationId(pickup.getDonation().getId());
            dto.setDonorName(pickup.getDonor().getName());
        dto.setDonationType(pickup.getDonation().getDonationType());
        dto.setAmount(pickup.getDonation().getAmount());
        dto.setItemDescription(pickup.getDonation().getItemDescription());
        dto.setCampaignTitle(pickup.getDonation().getCampaign() != null
                ? pickup.getDonation().getCampaign().getTitle()
                : null);
        dto.setDonationStatus(pickup.getDonation().getStatus());
        dto.setStatus(updated.getStatus());

            return ResponseEntity.ok(ApiResponse.success(
                    "Volunteer assignment updated", dto));
        }

        // Save the volunteer task
        VolunteerTask task = VolunteerTask.builder()
                .pickupRequest(pickup)
                .volunteer(volunteer)
                .status(VolunteerTask.TaskStatus.ASSIGNED)
                .build();

        VolunteerTask saved = volunteerTaskRepository.save(task);

        // Build response DTO
        VolunteerTaskDTO dto = new VolunteerTaskDTO();
        dto.setId(saved.getId());
        dto.setVolunteerId(volunteer.getId());
        dto.setVolunteerName(volunteer.getName());
        dto.setPickupRequestId(pickup.getId());
        dto.setPickupAddress(pickup.getPickupAddress());
        dto.setPickupTime(pickup.getPickupTime());
        dto.setDonationId(pickup.getDonation().getId());
        dto.setDonorName(pickup.getDonor().getName());
        dto.setDonationType(pickup.getDonation().getDonationType());
        dto.setAmount(pickup.getDonation().getAmount());
        dto.setItemDescription(pickup.getDonation().getItemDescription());
        dto.setCampaignTitle(pickup.getDonation().getCampaign() != null
                ? pickup.getDonation().getCampaign().getTitle()
                : null);
        dto.setDonationStatus(pickup.getDonation().getStatus());
        dto.setStatus(saved.getStatus());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Volunteer assigned successfully! Task created.", dto));
    }

    // ── All Tasks ─────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/tasks
     * Get all volunteer tasks
     */
    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<VolunteerTaskDTO>>> getAllTasks() {
        User current = getCurrentUser();
        ensureSuperAdmin(current);
        List<VolunteerTaskDTO> dtos = volunteerTaskRepository.findAll()
                .stream()
                .map(t -> {
                    VolunteerTaskDTO dto = new VolunteerTaskDTO();
                    dto.setId(t.getId());
                    dto.setVolunteerId(t.getVolunteer().getId());
                    dto.setVolunteerName(t.getVolunteer().getName());
                    dto.setPickupRequestId(t.getPickupRequest().getId());
                    dto.setPickupAddress(
                            t.getPickupRequest().getPickupAddress());
                    dto.setPickupTime(
                            t.getPickupRequest().getPickupTime());
                    dto.setDonationId(t.getPickupRequest().getDonation().getId());
                    dto.setDonorName(t.getPickupRequest().getDonor().getName());
                    dto.setDonationType(t.getPickupRequest().getDonation().getDonationType());
                    dto.setAmount(t.getPickupRequest().getDonation().getAmount());
                    dto.setItemDescription(t.getPickupRequest().getDonation().getItemDescription());
                    dto.setCampaignTitle(t.getPickupRequest().getDonation().getCampaign() != null
                            ? t.getPickupRequest().getDonation().getCampaign().getTitle()
                            : null);
                    dto.setDonationStatus(t.getPickupRequest().getDonation().getStatus());
                    dto.setStatus(t.getStatus());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    // ── Urgent Needs ──────────────────────────────────────────────────────────

    /**
     * POST /api/admin/urgent-need
     */
    @PostMapping("/urgent-need")
    public ResponseEntity<ApiResponse<UrgentNeedDTO>> createUrgentNeed(
            @Valid @RequestBody UrgentNeedDTO urgentNeedDTO) {
        User current = getCurrentUser();
        ensureSuperAdmin(current);
        UrgentNeedDTO created = adminService.createUrgentNeed(urgentNeedDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Urgent need created", created));
    }

    /**
     * GET /api/admin/urgent-needs
     */
    @GetMapping("/urgent-needs")
    public ResponseEntity<ApiResponse<List<UrgentNeedDTO>>> getAllUrgentNeeds() {
        User current = getCurrentUser();
        ensureSuperAdmin(current);
        return ResponseEntity.ok(
                ApiResponse.success(adminService.getAllUrgentNeeds()));
    }

    // ── Reports ───────────────────────────────────────────────────────────────

    /**
     * POST /api/admin/reports/generate
     */
    @PostMapping("/reports/generate")
    public ResponseEntity<ApiResponse<Report>> generateReport(
            @RequestParam String type) {
        User current = getCurrentUser();
        ensureSuperAdmin(current);
        Report report = adminService.generateReport(type);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Report generated", report));
    }

    /**
     * GET /api/admin/reports
     */
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<List<Report>>> getAllReports() {
        User current = getCurrentUser();
        ensureSuperAdmin(current);
        return ResponseEntity.ok(
                ApiResponse.success(adminService.getAllReports()));
    }

    // ── User Management ───────────────────────────────────────────────────────

    /**
     * GET /api/admin/ngo-admins
     * Get all admin users (super + NGO admins).
     */
    @GetMapping("/ngo-admins")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllNgoAdmins() {
        User current = getCurrentUser();
        ensureSuperAdmin(current);
        List<UserDTO> admins = userRepository.findByRole(User.Role.ADMIN)
                .stream()
                .map(this::mapUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(admins));
    }

    /**
     * POST /api/admin/ngo-admins/assign
     * Assign an existing admin to a specific NGO.
     */
    @PostMapping("/ngo-admins/assign")
    public ResponseEntity<ApiResponse<UserDTO>> assignNgoAdmin(
            @Valid @RequestBody NgoAdminAssignRequest request) {
        User current = getCurrentUser();
        ensureSuperAdmin(current);

        User admin = userRepository.findById(request.getAdminId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getAdminId()));
        if (admin.getRole() != User.Role.ADMIN) {
            throw new BadRequestException("User is not an admin");
        }

        Ngo ngo = ngoRepository.findById(request.getNgoId())
                .orElseThrow(() -> new ResourceNotFoundException("NGO", request.getNgoId()));

        if (admin.getNgo() != null && admin.getNgo().getId().equals(ngo.getId())) {
            try {
                if (admin.getEmail() != null && !admin.getEmail().isBlank()) {
                    String ngoName = ngo.getName();
                    String subject = (ngoName != null && !ngoName.isBlank())
                            ? "NGO Admin Assignment: " + ngoName
                            : "NGO Admin Assignment";
                    String adminName = (admin.getName() != null && !admin.getName().isBlank())
                            ? admin.getName()
                            : "Admin";
                    String body = "Hi " + adminName + ",\n\n"
                            + "You are already assigned as the NGO admin for "
                            + (ngoName != null && !ngoName.isBlank() ? ngoName : "the NGO") + ".\n"
                            + "You can manage donations and campaigns for this NGO in NGO Hub.\n\n"
                            + "Please log in to NGO Hub to view your dashboard.\n";
                    emailService.sendEmail(admin.getEmail(), adminName, subject, body);
                }
            } catch (Exception ignored) {
                // Do not block assignment if email fails
            }
            return ResponseEntity.ok(ApiResponse.success("NGO admin already assigned", mapUser(admin)));
        }

        if (userRepository.existsByRoleAndNgoId(User.Role.ADMIN, ngo.getId())) {
            throw new BadRequestException("This NGO already has an admin");
        }

        admin.setNgo(ngo);
        User saved = userRepository.save(admin);
        try {
            if (saved.getEmail() != null && !saved.getEmail().isBlank()) {
                String ngoName = ngo.getName();
                String subject = (ngoName != null && !ngoName.isBlank())
                        ? "NGO Admin Assignment: " + ngoName
                        : "NGO Admin Assignment";
                String adminName = (saved.getName() != null && !saved.getName().isBlank())
                        ? saved.getName()
                        : "Admin";
                String body = "Hi " + adminName + ",\n\n"
                        + "You have been assigned as the NGO admin for "
                        + (ngoName != null && !ngoName.isBlank() ? ngoName : "the NGO") + ".\n"
                        + "You can now manage donations and campaigns for this NGO in NGO Hub.\n\n"
                        + "Please log in to NGO Hub to view your dashboard.\n";
                emailService.sendEmail(saved.getEmail(), adminName, subject, body);
            }
        } catch (Exception ignored) {
            // Do not block assignment if email fails
        }
        return ResponseEntity.ok(ApiResponse.success("NGO admin assigned", mapUser(saved)));
    }

    /**
     * POST /api/admin/ngo-admins
     * Create a dedicated admin for a specific NGO (one admin per NGO).
     */
    @PostMapping("/ngo-admins")
    public ResponseEntity<ApiResponse<UserDTO>> createNgoAdmin(
            @Valid @RequestBody NgoAdminCreateRequest request) {
        User current = getCurrentUser();
        ensureSuperAdmin(current);

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }
        Ngo ngo = ngoRepository.findById(request.getNgoId())
                .orElseThrow(() -> new ResourceNotFoundException("NGO", request.getNgoId()));
        if (userRepository.existsByRoleAndNgoId(User.Role.ADMIN, ngo.getId())) {
            throw new BadRequestException("This NGO already has an admin");
        }

        User admin = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(User.Role.ADMIN)
                .ngo(ngo)
                .build();

        User saved = userRepository.save(admin);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("NGO admin created", mapUser(saved)));
    }

    /**
     * GET /api/admin/donors
     */
    @GetMapping("/donors")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllDonors() {
        User current = getCurrentUser();
        ensureSuperAdmin(current);
        return ResponseEntity.ok(
                ApiResponse.success(adminService.getAllDonors()));
    }

    /**
     * GET /api/admin/volunteers
     */
    @GetMapping("/volunteers")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllVolunteers() {
        User current = getCurrentUser();
        ensureSuperAdmin(current);
        return ResponseEntity.ok(
                ApiResponse.success(adminService.getAllVolunteers()));
    }
}
