package com.ngo.donation.controller;

import com.ngo.donation.dto.ApiResponse;
import com.ngo.donation.dto.PickupRequestDTO;
import com.ngo.donation.dto.TaskClaimRequest;
import com.ngo.donation.dto.TaskStatusUpdateRequest;
import com.ngo.donation.dto.VolunteerTaskDTO;
import com.ngo.donation.service.VolunteerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Volunteer Task endpoints.
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class VolunteerController {

    private final VolunteerService volunteerService;

    /**
     * GET /api/tasks/available
     * Get all available pickup requests for volunteers.
     */
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<PickupRequestDTO>>> getAvailablePickups() {
        List<PickupRequestDTO> pickups = volunteerService.getAvailablePickups();
        return ResponseEntity.ok(ApiResponse.success(pickups));
    }

    /**
     * GET /api/tasks/volunteer/{volunteerId}
     * Get all tasks assigned to a volunteer.
     */
    @GetMapping("/volunteer/{volunteerId}")
    public ResponseEntity<ApiResponse<List<VolunteerTaskDTO>>> getTasksByVolunteer(
            @PathVariable Long volunteerId) {
        List<VolunteerTaskDTO> tasks = volunteerService.getTasksByVolunteer(volunteerId);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    /**
     * PUT /api/tasks/updateStatus/{taskId}
     * Update the status of a volunteer task.
     */
    @PutMapping("/updateStatus/{taskId}")
    public ResponseEntity<ApiResponse<VolunteerTaskDTO>> updateTaskStatus(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskStatusUpdateRequest request) {
        VolunteerTaskDTO updated = volunteerService.updateTaskStatus(taskId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Task status updated", updated));
    }

    /**
     * POST /api/tasks/claim
     * Claim a pickup task after admin approval.
     */
    @PostMapping("/claim")
    public ResponseEntity<ApiResponse<VolunteerTaskDTO>> claimPickupTask(
            @Valid @RequestBody TaskClaimRequest request) {
        VolunteerTaskDTO assigned = volunteerService
                .claimPickupTask(request.getPickupRequestId(), request.getVolunteerId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task assigned", assigned));
    }
}
