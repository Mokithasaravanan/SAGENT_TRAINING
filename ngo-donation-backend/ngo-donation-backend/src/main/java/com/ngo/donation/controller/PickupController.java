package com.ngo.donation.controller;

import com.ngo.donation.dto.ApiResponse;
import com.ngo.donation.dto.PickupRequestDTO;
import com.ngo.donation.service.PickupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Pickup Request endpoints.
 */
@RestController
@RequestMapping("/api/pickups")
@RequiredArgsConstructor
public class PickupController {

    private final PickupService pickupService;

    /**
     * POST /api/pickups/request
     * Schedule a pickup for a goods donation.
     */
    @PostMapping("/request")
    public ResponseEntity<ApiResponse<PickupRequestDTO>> requestPickup(
            @Valid @RequestBody PickupRequestDTO pickupRequestDTO) {
        PickupRequestDTO result = pickupService.requestPickup(pickupRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Pickup scheduled successfully", result));
    }

    /**
     * GET /api/pickups/{donorId}
     * Get all pickup requests for a donor.
     */
    @GetMapping("/{donorId}")
    public ResponseEntity<ApiResponse<List<PickupRequestDTO>>> getPickupsByDonor(
            @PathVariable Long donorId) {
        List<PickupRequestDTO> pickups = pickupService.getPickupsByDonor(donorId);
        return ResponseEntity.ok(ApiResponse.success(pickups));
    }
}
